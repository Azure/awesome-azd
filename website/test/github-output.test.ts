import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const { sanitizeOutputValue, writeOutputs } = require("../scripts/github-output") as {
  sanitizeOutputValue: (value: any) => string;
  writeOutputs: (outputPath: string, outputs: Record<string, any>) => void;
};

// ---------------------------------------------------------------------------
// sanitizeOutputValue
// ---------------------------------------------------------------------------
describe("sanitizeOutputValue", () => {
  test("returns empty string for null", () => {
    expect(sanitizeOutputValue(null)).toBe("");
  });

  test("returns empty string for undefined", () => {
    expect(sanitizeOutputValue(undefined)).toBe("");
  });

  test("converts number to string", () => {
    expect(sanitizeOutputValue(42)).toBe("42");
    expect(sanitizeOutputValue(0)).toBe("0");
    expect(sanitizeOutputValue(-1)).toBe("-1");
  });

  test("converts boolean to string", () => {
    expect(sanitizeOutputValue(true)).toBe("true");
    expect(sanitizeOutputValue(false)).toBe("false");
  });

  test("strips LF newlines", () => {
    expect(sanitizeOutputValue("line1\nline2")).toBe("line1 line2");
  });

  test("strips CRLF newlines", () => {
    expect(sanitizeOutputValue("line1\r\nline2")).toBe("line1 line2");
  });

  test("strips standalone CR", () => {
    expect(sanitizeOutputValue("line1\rline2")).toBe("line1 line2");
  });

  test("collapses consecutive newlines into a single space", () => {
    expect(sanitizeOutputValue("a\n\n\nb")).toBe("a b");
  });

  test("trims leading and trailing whitespace", () => {
    expect(sanitizeOutputValue("  hello  ")).toBe("hello");
  });

  test("handles empty string", () => {
    expect(sanitizeOutputValue("")).toBe("");
  });

  test("handles whitespace-only string", () => {
    expect(sanitizeOutputValue("   ")).toBe("");
  });

  // --- Injection attempts ---
  test("neutralizes newline-based key injection", () => {
    const payload = "innocent\nskipped=true";
    const result = sanitizeOutputValue(payload);
    expect(result).not.toContain("\n");
    expect(result).toBe("innocent skipped=true");
  });

  test("neutralizes CRLF-based key injection", () => {
    const payload = "innocent\r\nevil_key=evil_value";
    const result = sanitizeOutputValue(payload);
    expect(result).not.toContain("\r");
    expect(result).not.toContain("\n");
    expect(result).toBe("innocent evil_key=evil_value");
  });

  test("neutralizes multi-line heredoc-style injection", () => {
    const payload = "value\nmalicious_key<<EOF\ninjected\nEOF";
    const result = sanitizeOutputValue(payload);
    expect(result).not.toContain("\n");
  });

  // --- C0 control character stripping (hack fix) ---
  test("strips null bytes", () => {
    expect(sanitizeOutputValue("abc\x00def")).toBe("abc def");
  });

  test("strips vertical tab and form feed", () => {
    expect(sanitizeOutputValue("abc\x0Bdef\x0Cghi")).toBe("abc def ghi");
  });

  test("strips all C0 control chars (0x01-0x1F) and DEL (0x7F)", () => {
    // Build a string with every C0 control char
    let payload = "";
    for (let i = 0; i <= 0x1f; i++) payload += String.fromCharCode(i);
    payload += String.fromCharCode(0x7f);
    const result = sanitizeOutputValue("start" + payload + "end");
    expect(result).toBe("start end");
    // No control chars remain
    expect(result).toMatch(/^[\x20-\x7e]+$/);
  });
});

// ---------------------------------------------------------------------------
// writeOutputs — basic functionality
// ---------------------------------------------------------------------------
describe("writeOutputs", () => {
  let tmpDir: string;
  let outputPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-output-test-"));
    outputPath = path.join(tmpDir, "GITHUB_OUTPUT");
    fs.writeFileSync(outputPath, "");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("writes a single key=value pair", () => {
    writeOutputs(outputPath, { result: "success" });
    const content = fs.readFileSync(outputPath, "utf8");
    expect(content).toBe("result=success\n");
  });

  test("writes multiple key=value pairs separated by newlines", () => {
    writeOutputs(outputPath, { key1: "value1", key2: "value2" });
    const content = fs.readFileSync(outputPath, "utf8");
    expect(content).toContain("key1=value1");
    expect(content).toContain("key2=value2");
    // Each pair on its own line, file ends with newline
    const lines = content.trim().split("\n");
    expect(lines).toHaveLength(2);
  });

  test("appends to existing file content", () => {
    fs.writeFileSync(outputPath, "existing=data\n");
    writeOutputs(outputPath, { new_key: "new_value" });
    const content = fs.readFileSync(outputPath, "utf8");
    expect(content).toContain("existing=data");
    expect(content).toContain("new_key=new_value");
  });

  test("handles empty value", () => {
    writeOutputs(outputPath, { result: "" });
    const content = fs.readFileSync(outputPath, "utf8");
    expect(content).toBe("result=\n");
  });
});

// ---------------------------------------------------------------------------
// writeOutputs — key validation (SECURITY CRITICAL)
// ---------------------------------------------------------------------------
describe("writeOutputs key validation", () => {
  let tmpDir: string;
  let outputPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-output-key-"));
    outputPath = path.join(tmpDir, "GITHUB_OUTPUT");
    fs.writeFileSync(outputPath, "");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("rejects key with embedded newline (injection attempt)", () => {
    expect(() =>
      writeOutputs(outputPath, { "evil\ninjected=bad": "value" })
    ).toThrow("Invalid output key");
  });

  test("rejects key starting with a digit", () => {
    expect(() =>
      writeOutputs(outputPath, { "1invalid": "value" })
    ).toThrow("Invalid output key");
  });

  test("rejects key containing spaces", () => {
    expect(() =>
      writeOutputs(outputPath, { "has space": "value" })
    ).toThrow("Invalid output key");
  });

  test("rejects empty key", () => {
    expect(() =>
      writeOutputs(outputPath, { "": "value" })
    ).toThrow("Invalid output key");
  });

  test("rejects key with special characters", () => {
    expect(() =>
      writeOutputs(outputPath, { "key=value": "data" })
    ).toThrow("Invalid output key");
  });

  test("rejects key with dashes", () => {
    expect(() =>
      writeOutputs(outputPath, { "my-key": "value" })
    ).toThrow("Invalid output key");
  });

  test("rejects key with dots", () => {
    expect(() =>
      writeOutputs(outputPath, { "my.key": "value" })
    ).toThrow("Invalid output key");
  });

  test("accepts key starting with underscore", () => {
    expect(() =>
      writeOutputs(outputPath, { _private: "value" })
    ).not.toThrow();
  });

  test("accepts valid alphanumeric key with underscores", () => {
    expect(() =>
      writeOutputs(outputPath, { valid_KEY_123: "value" })
    ).not.toThrow();
  });

  test("does not write to file when key is invalid", () => {
    try {
      writeOutputs(outputPath, { "bad key": "value" });
    } catch {
      // expected
    }
    const content = fs.readFileSync(outputPath, "utf8");
    expect(content).toBe("");
  });
});

// ---------------------------------------------------------------------------
// writeOutputs — injection prevention
// ---------------------------------------------------------------------------
describe("writeOutputs injection prevention", () => {
  let tmpDir: string;
  let outputPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-output-inj-"));
    outputPath = path.join(tmpDir, "GITHUB_OUTPUT");
    fs.writeFileSync(outputPath, "");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("value with LF cannot inject a new key=value pair", () => {
    writeOutputs(outputPath, { result: "safe\nevil_key=evil_value" });
    const content = fs.readFileSync(outputPath, "utf8");
    const lines = content.trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe("result=safe evil_key=evil_value");
  });

  test("value with CRLF cannot inject a new key=value pair", () => {
    writeOutputs(outputPath, { result: "safe\r\nevil_key=evil_value" });
    const content = fs.readFileSync(outputPath, "utf8");
    const lines = content.trim().split("\n");
    expect(lines).toHaveLength(1);
  });

  test("value with multiple injection attempts is flattened", () => {
    writeOutputs(outputPath, {
      result: "ok\nfoo=bar\nbaz=qux\nmore=stuff",
    });
    const content = fs.readFileSync(outputPath, "utf8");
    const lines = content.trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/^result=/);
  });

  test("value mimicking heredoc delimiter is neutralized", () => {
    writeOutputs(outputPath, {
      result: "value\nresult<<ghadelimiter_abc\ninjected\nghadelimiter_abc",
    });
    const content = fs.readFileSync(outputPath, "utf8");
    const lines = content.trim().split("\n");
    expect(lines).toHaveLength(1);
  });

  test("shell metacharacters in values pass through safely", () => {
    writeOutputs(outputPath, { cmd: "$(whoami) `id` | cat /etc/passwd" });
    const content = fs.readFileSync(outputPath, "utf8");
    expect(content.trim()).toBe("cmd=$(whoami) `id` | cat /etc/passwd");
  });
});
