# `templates.json` Schema

> Reference for `website/static/templates.json` — the single source of truth
> for both the awesome-azd gallery and `azd` extension manifests (e.g. the
> agent template list consumed by `azd ai agent init`).

## 1. Overview

`templates.json` is a flat array of template entries. Three kinds of entries
co-exist in the same file, distinguished by an optional `templateType`
discriminator:

| Kind             | `templateType`                        | Surfaces in unified catalog? | Consumed by                        |
| ---------------- | ------------------------------------- | ---------------------------- | ---------------------------------- |
| Gallery template | absent / `null` / `""`                | ✅ yes                       | awesome-azd website                |
| AI app template  | `ai-app-templates`                    | ✅ yes                       | awesome-azd website                |
| Extension entry  | `extension.<category>.<type>` (e.g. `extension.ai.agent`) | ❌ no | `azd` extension flows (e.g. `azd ai agent init`) |

The unified catalog adapter explicitly accepts standard gallery records and
`ai-app-templates` records (see
[`catalogData.ts`](../website/src/catalog/catalogData.ts)). The legacy gallery
adapter still filters out every entry with a `templateType` set (see
[`filterGalleryTemplates`](../website/src/data/templates.ts)), so specialized
records never enter that older component path.

## 2. Common fields (all entries)

These fields are shared by the records. The gallery runtime loader checks
them only after filtering out specialized extension entries. Those entries
follow their consumer's catalog checks instead.

| Field        | Type     | Required | Notes                                                              |
| ------------ | -------- | -------- | ------------------------------------------------------------------ |
| `title`      | string   | ✅       | Non-empty.                                                         |
| `description`| string   | ✅       | Non-empty.                                                         |
| `author`     | string   | ✅       | Non-empty.                                                         |
| `authorUrl`  | string   | ⚠️       | Optional in JSON; the gallery loader coerces it to `""` if missing. Must be a string when present. |
| `source`     | string   | ✅       | The gallery loader requires a `https://github.com/` prefix.           |

> ⚠️ **Gotcha — GitHub source URL:** The gallery loader drops gallery records
> with an incompatible `source` URL and logs a warning. Specialized entries
> are excluded before that loader runs; this runtime check does not establish
> their consumer's URL requirements.

## 3. Gallery-only fields

| Field           | Type        | Required for gallery | Notes                                                                                |
| --------------- | ----------- | -------------------- | ------------------------------------------------------------------------------------ |
| `id`            | string      | ✅                   | Stable, unique UUID used as the card key. Required by the gallery model and contributor guide, but not checked by the runtime loader. |
| `tags`          | `TagType[]` | ✅                   | Non-empty array. Values must come from the [`TagType` union](../website/src/data/tags.tsx). |
| `preview`       | string      | optional             | Path/URL to preview image.                                                           |
| `languages`     | `TagType[]` | optional             | Same `TagType` union as `tags`.                                                      |
| `frameworks`    | `TagType[]` | optional             | Same.                                                                                |
| `azureServices` | `TagType[]` | optional             | Same.                                                                                |
| `IaC`           | `TagType[]` | optional             | Same.                                                                                |

AI app templates may also use these reviewed public enrichment fields:

| Field                 | Type       | Notes |
| --------------------- | ---------- | ----- |
| `authors`             | `string[]` | Display author names. Must align by index with `authorUrls`. |
| `authorUrls`          | `string[]` | Public HTTPS author profile URLs. |
| `models`              | `string[]` | Declared model identifiers. |
| `appType`             | `string[]` | Declared application-type identifiers. |
| `prerequisites`       | `string[]` | Declared prerequisite identifiers. |
| `sampleType`          | string     | Optional sample classification. |
| `architectureDiagram` | string     | Local reviewed architecture image path. |
| `screenshot`          | string     | Local reviewed screenshot path. |
| `video`               | string     | Optional public video URL. |
| `legacySources`       | `string[]` | Previous public repository sources that should resolve to the canonical record. |

Operational fields from the retired AI service, including email addresses,
validation state, deletion state, and environment configuration, are not part
of the public catalog contract.

> ⚠️ **Gotcha — tag taxonomy coupling:** Adding a brand-new value to `tags`,
> `languages`, etc. requires updating the `TagType` union in
> [`website/src/data/tags.tsx`](../website/src/data/tags.tsx). The gallery loader
> does not strip unknown catalog tags. Submission automation restores canonical
> spelling for case-insensitive matches and warns on unknown values; catalog
> taxonomy checks remain separate from runtime loading.

## 4. Extension-only fields

| Field               | Type     | Required for extension | Notes                                                                 |
| ------------------- | -------- | ---------------------- | --------------------------------------------------------------------- |
| `templateType`      | string   | ✅                     | Discriminator. Extension entries use the namespace `extension.<category>.<type>`. |
| `extensionFramework`| string   | optional               | Free-form label (e.g. `"Agent Framework"`).                           |
| `extensionTags`     | string[] | optional               | Free-form tags scoped to the extension consumer; **not** validated against `TagType`. |
| `id`                | string   | optional               | Stable identifier (UUID v5 derived from `source` for agent templates). |

Extension entries **do not** need a `tags` field. `validateTemplates` skips
the `tags` requirement when `templateType` is set (defense-in-depth on top of
the upstream filter).

## 5. `templateType` namespace convention

Use a three-part dotted namespace: `extension.<category>.<type>`.

| `templateType`            | Consumer                                          | Status     |
| ------------------------- | ------------------------------------------------- | ---------- |
| `ai-app-templates`        | Unified Awesome azd catalog                       | In use     |
| `extension.ai.agent`      | `azd ai agent init` — agent templates             | In use     |
| `extension.mcp.server`    | (reserved — MCP server templates)                 | Reserved   |

Adding a new extension category is a **data-only change**: pick a new
`extension.<category>.<type>` value and append entries. The
`ai-app-templates` discriminator is the only non-empty value currently
included by the unified catalog adapter.

## 6. Example entries

### Gallery entry

```jsonc
{
  "id": "00000000-0000-4000-8000-000000000001",
  "title": "Remote MCP Functions with TypeScript",
  "description": "Remote MCP server built with TypeScript and Azure Functions.",
  "author": "Azure Samples",
  "authorUrl": "https://github.com/Azure-Samples",
  "source": "https://github.com/Azure-Samples/remote-mcp-functions-typescript",
  "preview": "./templates/images/azure-functions-mcp-server-typescript.png",
  "tags": ["msft", "ai", "mcp"],
  "languages": ["typescript", "nodejs"],
  "azureServices": ["functions"],
  "IaC": ["bicep"]
}
```

### Extension entry (agent template)

```jsonc
{
  "title": "Hello World (.NET, Agent Framework)",
  "description": "Minimal Hello World agent using the Responses protocol with the Agent Framework approach in C#.",
  "author": "Microsoft Foundry Team",
  "authorUrl": "https://github.com/microsoft-foundry",
  "source": "https://github.com/microsoft-foundry/foundry-samples/blob/main/samples/csharp/hosted-agents/agent-framework/hello-world/agent.manifest.yaml",
  "languages": ["dotnetCsharp"],
  "id": "9db1dc5d-772e-50cd-8e29-2a70bef8c872",
  "templateType": "extension.ai.agent",
  "extensionFramework": "Agent Framework",
  "extensionTags": ["example", "Responses Protocol"]
}
```

## 7. Validation pipeline

The data layer ([`website/src/data/templates.ts`](../website/src/data/templates.ts))
applies these steps in order:

1. **Legacy gallery adapter** — `filterGalleryTemplates` drops every entry
   with a non-empty `templateType`. Result is the standard legacy gallery
   dataset.
2. **`validateTemplates`** — check required text fields, the GitHub source URL,
   `authorUrl` type/default, and a non-empty gallery `tags` array. Invalid
   entries are dropped with a `console.warn`. This is not a full schema
   decoder: identity, taxonomy membership, and optional array contents are
   not checked here.
3. **Unified catalog adapter** — `catalogData.ts` independently accepts
   absent / null / empty `templateType` values plus `ai-app-templates`, then
   normalizes both into the shared catalog model used by `/templates` and
   canonical detail pages.

`validateTemplates` also relaxes the `tags` requirement for any entry where
`templateType` is set, as defense-in-depth in case the pipeline ordering is
ever changed.

## 8. Adding a new extension category — checklist

1. Pick an `extension.<category>.<type>` namespace.
2. Append entries to `website/static/templates.json`. Required fields per §2;
   optional extension fields per §4.
3. Confirm `source` URLs start with `https://github.com/`.
4. Run `npm test` in `website/` — at minimum the
   `gallery-filter` and `agent-templates` style tests should pass for any
   new category.
5. Consumer-side: ensure the `azd` flow that reads `templates.json` filters
   by your new `templateType`.

## 9. Related files

- [`website/static/templates.json`](../website/static/templates.json) — the data
- [`website/src/data/tags.tsx`](../website/src/data/tags.tsx) — `Template` / `TagType` definitions
- [`website/src/data/templates.ts`](../website/src/data/templates.ts) — filter + validation logic
- [`website/test/gallery-filter.test.ts`](../website/test/gallery-filter.test.ts) — gallery/extension filtering contract
- [`website/test/agent-templates.test.ts`](../website/test/agent-templates.test.ts) — `extension.ai.agent` shape & uniqueness
