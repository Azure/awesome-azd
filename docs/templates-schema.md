# `templates.json` Schema

> Reference for `website/static/templates.json` — the single source of truth
> for both the awesome-azd gallery and `azd` extension manifests (e.g. the
> agent template list consumed by `azd ai agent init`).

## 1. Overview

`templates.json` is a flat array of template entries. Two kinds of entries
co-exist in the same file, distinguished by an optional `templateType`
discriminator:

| Kind             | `templateType`                        | Surfaces in gallery? | Consumed by                        |
| ---------------- | ------------------------------------- | -------------------- | ---------------------------------- |
| Gallery template | absent / `null` / `""`                | ✅ yes               | awesome-azd website                |
| Extension entry  | `extension.<category>.<type>` (e.g. `extension.ai.agent`) | ❌ no | `azd` extension flows (e.g. `azd ai agent init`) |

The gallery dataset is produced by filtering out every entry with a
`templateType` set (see [`filterGalleryTemplates`](../website/src/data/users.tsx)).
This filter runs **before** `validateTemplates`, so extension entries are
never required to satisfy gallery-only validation rules.

## 2. Common fields (all entries)

These fields are validated for every entry, gallery or extension:

| Field        | Type     | Required | Notes                                                              |
| ------------ | -------- | -------- | ------------------------------------------------------------------ |
| `title`      | string   | ✅       | Non-empty.                                                         |
| `description`| string   | ✅       | Non-empty.                                                         |
| `author`     | string   | ✅       | Non-empty.                                                         |
| `authorUrl`  | string   | ⚠️       | Optional in JSON; coerced to `""` if missing. Must be a string when present. |
| `source`     | string   | ✅       | **Must start with `https://github.com/`** — applies to extension entries too. |

> ⚠️ **Gotcha — GitHub source URL:** `source` is validated for **both** gallery
> and extension entries. If you need to point at a non-GitHub URL (e.g. a raw
> manifest from another host), open an issue first; the validator will silently
> drop the entry today.

## 3. Gallery-only fields

| Field           | Type        | Required for gallery | Notes                                                                                |
| --------------- | ----------- | -------------------- | ------------------------------------------------------------------------------------ |
| `tags`          | `TagType[]` | ✅                   | Non-empty array. Values must come from the [`TagType` union](../website/src/data/tags.tsx). |
| `preview`       | string      | optional             | Path/URL to preview image.                                                           |
| `languages`     | `TagType[]` | optional             | Same `TagType` union as `tags`.                                                      |
| `frameworks`    | `TagType[]` | optional             | Same.                                                                                |
| `azureServices` | `TagType[]` | optional             | Same.                                                                                |
| `IaC`           | `TagType[]` | optional             | Same.                                                                                |

> ⚠️ **Gotcha — tag taxonomy coupling:** Adding a brand-new value to `tags`,
> `languages`, etc. requires updating the `TagType` union in
> [`website/src/data/tags.tsx`](../website/src/data/tags.tsx). Unknown tags are
> stripped at parse time with a console warning.

## 4. Extension-only fields

| Field               | Type     | Required for extension | Notes                                                                 |
| ------------------- | -------- | ---------------------- | --------------------------------------------------------------------- |
| `templateType`      | string   | ✅                     | Discriminator. Use the namespace `extension.<category>.<type>`.       |
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
| `extension.ai.agent`      | `azd ai agent init` — agent templates             | In use     |
| `extension.mcp.server`    | (reserved — MCP server templates)                 | Reserved   |

Adding a new category is a **data-only change**: pick a new
`extension.<category>.<type>` value and append entries. No code changes to
filters or validators are required because every entry with a non-empty
`templateType` is filtered out of the gallery by convention.

## 6. Example entries

### Gallery entry

```jsonc
{
  "title": "Todo App with .NET API and Azure SQL",
  "description": "Production-ready .NET app with Azure SQL and Container Apps.",
  "author": "Azure Samples",
  "authorUrl": "https://github.com/Azure-Samples",
  "source": "https://github.com/Azure-Samples/todo-csharp-sql",
  "preview": "/static/img/todo-csharp-sql.png",
  "tags": ["msft", "dotnetCsharp", "bicep"],
  "languages": ["dotnetCsharp"],
  "azureServices": ["containerapps", "azuresql"]
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

The data layer ([`website/src/data/users.tsx`](../website/src/data/users.tsx))
applies these steps in order:

1. **`filterGalleryTemplates`** — drop every entry with a non-empty
   `templateType`. Result is the **raw gallery dataset** (also exported as
   `galleryTemplates` for direct UI consumers).
2. **`validateTemplates`** — runtime-validate the remaining entries against
   the rules in §2 and §3. Invalid entries are dropped with a `console.warn`.
3. The validated `User[]` is exported as `unsortedUsers` / `sortedUsers`.

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
- [`website/src/data/tags.tsx`](../website/src/data/tags.tsx) — `User` / `TagType` definitions
- [`website/src/data/users.tsx`](../website/src/data/users.tsx) — filter + validation logic
- [`website/test/gallery-filter.test.ts`](../website/test/gallery-filter.test.ts) — gallery/extension filtering contract
- [`website/test/agent-templates.test.ts`](../website/test/agent-templates.test.ts) — `extension.ai.agent` shape & uniqueness
