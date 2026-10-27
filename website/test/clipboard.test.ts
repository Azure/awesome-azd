/**
 * @jest-environment jsdom
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useClipboard } from "../src/utils/useClipboard";

describe("production clipboard hook", () => {
  let root: Root | null;
  let container: HTMLDivElement;
  let clipboard: ReturnType<typeof useClipboard>;
  let descriptor: PropertyDescriptor | undefined;
  let actEnvironment: unknown;
  let warnSpy: jest.SpiedFunction<typeof console.warn>;

  function Probe() {
    clipboard = useClipboard();
    return null;
  }

  function setClipboard(value: { writeText: (text: string) => Promise<void> } | undefined) {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value });
  }

  async function unmount() {
    if (root) {
      const currentRoot = root;
      root = null;
      await act(async () => currentRoot.unmount());
    }
  }

  beforeEach(async () => {
    descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    actEnvironment = Reflect.get(globalThis, "IS_REACT_ACT_ENVIRONMENT");
    Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => root?.render(createElement(Probe)));
  });

  afterEach(async () => {
    await unmount();
    container.remove();
    if (descriptor) {
      Object.defineProperty(navigator, "clipboard", descriptor);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
    Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", actEnvironment);
    warnSpy.mockRestore();
  });

  test("reports success only after the actual write resolves, with the exact payload", async () => {
    let resolve: () => void = () => { throw new Error("Write has not started"); };
    const write = new Promise<void>((done) => { resolve = done; });
    const writeText = jest.fn<(text: string) => Promise<void>>().mockReturnValue(write);
    setClipboard({ writeText });
    expect(clipboard.status).toBe("idle");
    let outcome: ReturnType<typeof clipboard.copy> | undefined;
    await act(async () => { outcome = clipboard.copy("azd init -t example/app"); });
    expect(clipboard.status).toBe("pending");
    expect(writeText).toHaveBeenCalledWith("azd init -t example/app");
    await act(async () => clipboard.reset());
    expect(clipboard.status).toBe("pending");
    await act(async () => {
      resolve();
      expect(await outcome).toBe("copied");
    });
    expect(clipboard.status).toBe("copied");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test("diagnoses missing clipboard access without claiming success", async () => {
    setClipboard(undefined);
    await act(async () => { expect(await clipboard.copy("command")).toBe("failed"); });
    expect(clipboard.status).toBe("failed");
    expect(warnSpy).toHaveBeenCalledWith("Unable to copy to the clipboard.", expect.any(Error));
  });

  test("diagnoses a rejected write and permits immediate retry", async () => {
    const error = new DOMException("Denied", "NotAllowedError");
    const writeText = jest.fn<(text: string) => Promise<void>>()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);
    setClipboard({ writeText });
    await act(async () => { expect(await clipboard.copy("first")).toBe("failed"); });
    expect(clipboard.status).toBe("failed");
    expect(warnSpy).toHaveBeenCalledWith("Unable to copy to the clipboard.", error);
    await act(async () => { expect(await clipboard.copy("retry")).toBe("copied"); });
    expect(clipboard.status).toBe("copied");
    expect(writeText.mock.calls).toEqual([["first"], ["retry"]]);
  });

  test("an older success cannot overwrite a newer failure", async () => {
    let resolve: () => void = () => { throw new Error("Write has not started"); };
    const first = new Promise<void>((done) => { resolve = done; });
    const writeText = jest.fn<(text: string) => Promise<void>>()
      .mockReturnValueOnce(first)
      .mockRejectedValueOnce(new Error("Newer write failed"));
    setClipboard({ writeText });
    let older: ReturnType<typeof clipboard.copy> | undefined;
    await act(async () => { older = clipboard.copy("older"); });
    await act(async () => { expect(await clipboard.copy("newer")).toBe("failed"); });
    await act(async () => { resolve(); await older; });
    expect(clipboard.status).toBe("failed");
  });

  test("an older rejection cannot overwrite a newer success", async () => {
    let reject: (error: Error) => void = () => { throw new Error("Write has not started"); };
    const first = new Promise<void>((_resolve, fail) => { reject = fail; });
    const writeText = jest.fn<(text: string) => Promise<void>>()
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce(undefined);
    setClipboard({ writeText });
    let older: ReturnType<typeof clipboard.copy> | undefined;
    await act(async () => { older = clipboard.copy("older"); });
    await act(async () => { expect(await clipboard.copy("newer")).toBe("copied"); });
    await act(async () => { reject(new Error("Older write failed")); await older; });
    expect(clipboard.status).toBe("copied");
  });

  test("cancels a pending result after its owner unmounts", async () => {
    let resolve: () => void = () => { throw new Error("Write has not started"); };
    const write = new Promise<void>((done) => { resolve = done; });
    setClipboard({ writeText: () => write });
    let outcome: ReturnType<typeof clipboard.copy> | undefined;
    await act(async () => { outcome = clipboard.copy("command"); });
    await unmount();
    resolve();
    expect(await outcome).toBe("cancelled");
  });

  test("reset clears successful feedback but does not hide a failure", async () => {
    const writeText = jest.fn<(text: string) => Promise<void>>()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Denied"));
    setClipboard({ writeText });
    await act(async () => { await clipboard.copy("success"); });
    await act(async () => clipboard.reset());
    expect(clipboard.status).toBe("idle");
    await act(async () => { await clipboard.copy("failure"); });
    await act(async () => clipboard.reset());
    expect(clipboard.status).toBe("failed");
  });
});
