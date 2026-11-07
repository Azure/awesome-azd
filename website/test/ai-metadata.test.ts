/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, test } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import templates from "../static/templates.json";
import { Tags } from "../src/ai/data/tags";

const websiteRoot = path.resolve(__dirname, "..");
const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const allowedAiRecordKeys = new Set([
  "id",
  "title",
  "description",
  "preview",
  "author",
  "authorUrl",
  "source",
  "tags",
  "languages",
  "frameworks",
  "azureServices",
  "IaC",
  "templateType",
  "authors",
  "authorUrls",
  "models",
  "appType",
  "prerequisites",
  "sampleType",
  "architectureDiagram",
  "screenshot",
  "video",
  "legacySources",
]);
const forbiddenOperationalKeys = new Set([
  "additional_env_vars",
  "skip_validators",
  "status_valid",
  "deleted",
  "deletion_reason",
  "replacement_source",
  "email",
  "aimetadata",
]);

type JsonObject = Record<string, unknown>;

function normalizeSource(source: string): string {
  return source.toLowerCase().replace(/\/$/, "");
}

function expectStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array`);
  }
  const values = value as unknown[];
  if (!values.every((item) => typeof item === "string" && item.length > 0)) {
    throw new Error(`${field} must contain non-empty strings`);
  }
  return values as string[];
}

function inspectSensitiveData(value: unknown, pathParts: string[] = []): void {
  if (typeof value === "string") {
    if (emailPattern.test(value)) {
      throw new Error(`Email-shaped value at ${pathParts.join(".")}`);
    }
    expect(value.toLowerCase()).not.toContain("mailto:");
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      inspectSensitiveData(item, [...pathParts, String(index)]),
    );
    return;
  }
  if (typeof value !== "object" || value === null) {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (forbiddenOperationalKeys.has(key.toLowerCase())) {
      throw new Error(
        `Forbidden AI metadata key at ${[...pathParts, key].join(".")}`,
      );
    }
    inspectSensitiveData(child, [...pathParts, key]);
  }
}

function pngChunkTypes(buffer: Buffer): string[] {
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  const chunks: string[] = [];
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    chunks.push(type);
    offset += length + 12;
    if (type === "IEND") {
      break;
    }
  }
  return chunks;
}

function gifMetadataExtensions(buffer: Buffer): string[] {
  const header = buffer.subarray(0, 6).toString("ascii");
  expect(["GIF87a", "GIF89a"]).toContain(header);
  const packed = buffer[10];
  let offset = 13 + (packed & 0x80 ? 3 * 2 ** ((packed & 0x07) + 1) : 0);
  const metadata: string[] = [];

  const readSubBlocks = (start: number) => {
    let cursor = start;
    while (cursor < buffer.length) {
      const size = buffer[cursor++];
      if (size === 0) {
        return cursor;
      }
      cursor += size;
    }
    throw new Error("Malformed GIF sub-block sequence");
  };

  while (offset < buffer.length) {
    const marker = buffer[offset++];
    if (marker === 0x3b) {
      break;
    }
    if (marker === 0x2c) {
      const imagePacked = buffer[offset + 8];
      offset += 9;
      if (imagePacked & 0x80) {
        offset += 3 * 2 ** ((imagePacked & 0x07) + 1);
      }
      offset += 1;
      offset = readSubBlocks(offset);
      continue;
    }
    expect(marker).toBe(0x21);
    const label = buffer[offset++];
    const dataStart = offset;
    const dataEnd = readSubBlocks(dataStart);
    if (label === 0xfe || label === 0x01) {
      metadata.push(`extension-${label.toString(16)}`);
    } else if (label === 0xff) {
      const size = buffer[dataStart];
      const identifier = buffer
        .subarray(dataStart + 1, dataStart + 1 + size)
        .toString("ascii");
      if (identifier !== "NETSCAPE2.0" && identifier !== "ANIMEXTS1.0") {
        metadata.push(`application-${identifier}`);
      }
    }
    offset = dataEnd;
  }

  return metadata;
}

function expectSanitizedImage(filePath: string): void {
  const buffer = fs.readFileSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") {
    const forbiddenChunks = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "iCCP"]);
    expect(
      pngChunkTypes(buffer).filter((chunk) => forbiddenChunks.has(chunk)),
    ).toEqual([]);
  } else if (extension === ".gif") {
    expect(gifMetadataExtensions(buffer)).toEqual([]);
  }
}

describe("privacy-safe AI catalog metadata", () => {
  const records = templates as JsonObject[];
  const aiRecords = records.filter(
    (record) => record.templateType === "ai-app-templates",
  );

  test("marks exactly 56 flat records as AI app templates", () => {
    expect(aiRecords).toHaveLength(56);
    expect(
      records.filter((record) => record.aiMetadata !== undefined),
    ).toHaveLength(0);
  });

  test("allows only reviewed public fields and no email-shaped data", () => {
    for (const record of aiRecords) {
      const source = String(record.source);
      expect(
        Object.keys(record).every((key) => allowedAiRecordKeys.has(key)),
      ).toBe(true);
      inspectSensitiveData(record, [source]);

      expect(typeof record.title).toBe("string");
      expect(typeof record.description).toBe("string");
      const authors = expectStringArray(record.authors, "authors");
      const authorUrls = expectStringArray(record.authorUrls, "authorUrls");
      expect(authorUrls).toHaveLength(authors.length);
      for (const authorUrl of authorUrls) {
        const url = new URL(authorUrl);
        expect(url.protocol).toBe("https:");
        expect(["github.com", "learn.microsoft.com"]).toContain(url.hostname);
      }

      for (const field of [
        "languages",
        "models",
        "appType",
        "azureServices",
        "prerequisites",
        "tags",
      ] as const) {
        for (const tag of expectStringArray(record[field], field)) {
          if (!(tag in Tags)) {
            throw new Error(`Unknown ${field} tag '${tag}' in ${source}`);
          }
        }
      }
      expect(["full_sample", "building_block"]).toContain(record.sampleType);
    }
  });

  test("uses unique GitHub sources and allowlisted public URLs", () => {
    const sourceSet = new Set<string>();
    const routeSourceSet = new Set<string>();
    for (const record of aiRecords) {
      const source = String(record.source);
      const url = new URL(source);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toBe("github.com");
      expect(url.pathname.split("/").filter(Boolean)).toHaveLength(2);

      const normalizedSource = normalizeSource(source);
      expect(sourceSet.has(normalizedSource)).toBe(false);
      sourceSet.add(normalizedSource);

      for (const routeSource of [
        source,
        ...expectStringArray(record.legacySources ?? [], "legacySources"),
      ]) {
        const normalizedRouteSource = normalizeSource(routeSource);
        expect(routeSourceSet.has(normalizedRouteSource)).toBe(false);
        routeSourceSet.add(normalizedRouteSource);
      }

      if (record.video !== undefined) {
        const videoUrl = new URL(String(record.video));
        expect(videoUrl.protocol).toBe("https:");
        expect([
          "www.youtube.com",
          "build.microsoft.com",
          "github.com",
        ]).toContain(videoUrl.hostname);
      }
    }
  });

  test("references 79 local, metadata-free catalog images", () => {
    const assetPaths = new Set<string>();
    for (const record of aiRecords) {
      for (const field of ["architectureDiagram", "screenshot"] as const) {
        const asset = record[field];
        if (asset === undefined) {
          continue;
        }
        expect(asset).toMatch(/^\/templates\/images\/[A-Za-z0-9._-]+$/);
        assetPaths.add(String(asset));
      }
    }

    expect(assetPaths.size).toBe(79);
    for (const asset of assetPaths) {
      const filePath = path.join(websiteRoot, "static", asset.slice(1));
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing ${asset}`);
      }
      expectSanitizedImage(filePath);
    }
  });

  test("namespaces and sanitizes AI-specific user-interface assets", () => {
    const assetRoot = path.join(websiteRoot, "static", "img", "ai");
    const assetNames = fs.readdirSync(assetRoot);
    expect(assetNames.length).toBeGreaterThanOrEqual(80);

    for (const assetName of assetNames) {
      const filePath = path.join(assetRoot, assetName);
      const extension = path.extname(filePath).toLowerCase();
      if (extension === ".svg") {
        const svg = fs.readFileSync(filePath, "utf8");
        expect(svg).not.toMatch(emailPattern);
        expect(svg).not.toMatch(/<metadata\b|<!--|<script\b|<foreignObject\b/i);
        expect(svg).not.toMatch(/javascript:|\son[a-z]+\s*=/i);
      } else {
        expectSanitizedImage(filePath);
      }
    }
  });
});
