/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { useCallback, useEffect, useRef, useState } from "react";

type CopyStatus = "idle" | "pending" | "copied" | "failed";

export function useClipboard() {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const mounted = useRef(true);
  const request = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current++;
    };
  }, []);
  const copy = useCallback(async (text: string): Promise<"copied" | "failed" | "cancelled"> => {
    const currentRequest = ++request.current;
    setStatus("pending");
    let copied = false;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("The Clipboard API is unavailable.");
      }
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch (error) {
      console.warn("Unable to copy to the clipboard.", error);
    }
    if (!mounted.current) return "cancelled";
    if (currentRequest === request.current) setStatus(copied ? "copied" : "failed");
    return copied ? "copied" : "failed";
  }, []);
  const reset = useCallback(() => {
    setStatus((current) => current === "copied" ? "idle" : current);
  }, []);
  return { status, copy, reset };
}
