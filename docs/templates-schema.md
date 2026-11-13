# `templates.json` Schema

> Reference for `website/static/templates.json`, the shared source for the
> Awesome azd website catalog and specialized `azd` extension manifests.

## 1. Entry types

`templates.json` is a flat array containing website catalog records and
extension records.

| Kind | Identification | Website catalog | Consumer |
| ---- | -------------- | --------------- | -------- |
| Catalog template | `templateType` is absent, `null`, or empty | Included | Awesome azd website |
| AI application template | Catalog template with `aiapplication` in `tags` | Included | Awesome azd website |
| Extension entry | Non-empty `extension.<category>.<type>` value | Excluded | Matching `azd` extension flow |

Any non-empty `templateType` is skipped by the website catalog builder. AI
application templates must therefore use the `aiapplication` tag and must not
set `templateType` to `ai-app-templates`.

## 2. Website catalog fields

The catalog builder validates records only after excluding extension entries.

| Field | Type | Requirement |
| ----- | ---- | ----------- |
| `id` | string | Required and non-empty. Used as the stable listing identifier. |
| `title` | string | Required and non-empty. |
| `description` | string | Required and non-empty. |
| `source` | string | Required canonical GitHub repository URL. |
| `author` | string | Required unless `authors` and aligned `authorUrls` arrays are provided. |
| `authorUrl` | string | Optional profile URL for the single-author form. |
| `authors` | string[] | Optional multi-author display names. |
| `authorUrls` | string[] | Required with `authors`; indexes must align. |

Catalog `source` values must use HTTPS, host `github.com`, contain exactly an
owner and repository path, and contain no query or fragment. A trailing `.git`
suffix is normalized away.

Every included source must also have one or more reviewed entries in
`website/src/catalog/template-use-cases.json`.

## 3. Catalog metadata

These catalog arrays are optional. Empty or missing arrays are normalized to an
empty list.

| Field | Purpose |
| ----- | ------- |
| `tags` | Authorship, status, application type, tools, topics, models, and compatibility metadata. |
| `languages` | Programming-language identifiers. |
| `frameworks` | Framework identifiers. |
| `azureServices` | Azure resources provisioned by the template. |
| `IaC` | Infrastructure-as-code identifiers. |
| `models` | AI model identifiers. |
| `appType` | Additional application classifications. |

Use `aiapplication` in `tags` for AI application templates. Do not add the
legacy `aicollection` alias, and do not duplicate values across an array.
Contributor tests validate taxonomy placement, canonical aliases, and
duplicates against [`website/src/data/tags.ts`](../website/src/data/tags.ts).

Optional public enrichment fields include:

- `preview`
- `architectureDiagram`
- `screenshot`
- `video`
- `sampleType`
- `legacySources`
- `host`

Operational metadata from retired services, including email addresses,
validation state, deletion state, and environment configuration, is not part
of the public catalog contract.

## 4. Extension fields

Extension entries are skipped before website catalog validation and follow the
requirements of their consuming `azd` flow.

| Field | Type | Requirement |
| ----- | ---- | ----------- |
| `templateType` | string | Required discriminator using `extension.<category>.<type>`. |
| `extensionFramework` | string | Optional framework label. |
| `extensionTags` | string[] | Optional consumer-specific tags. |
| `id` | string | Consumer-specific stable identifier. |

Extension entries do not need website catalog tags or reviewed catalog use
cases unless their consumer explicitly requires them.

## 5. `templateType` namespace

Use a three-part dotted namespace for extension records.

| `templateType` | Consumer | Status |
| -------------- | -------- | ------ |
| `extension.ai.agent` | `azd ai agent init` agent templates | In use |
| `extension.mcp.server` | MCP server template flow | Reserved |

Adding a category requires both data entries and consumer support for filtering
and validating the new discriminator.

## 6. Example entries

### AI application catalog entry

```jsonc
{
  "id": "00000000-0000-4000-8000-000000000001",
  "title": "Remote MCP Functions with TypeScript",
  "description": "Remote MCP server built with TypeScript and Azure Functions.",
  "author": "Azure Samples",
  "authorUrl": "https://github.com/Azure-Samples",
  "source": "https://github.com/Azure-Samples/remote-mcp-functions-typescript",
  "preview": "./templates/images/azure-functions-mcp-server-typescript.png",
  "tags": ["msft", "aiapplication", "mcp-server"],
  "languages": ["typescript"],
  "azureServices": ["functions"],
  "IaC": ["bicep"]
}
```

### Extension entry

```jsonc
{
  "title": "Hello World (.NET, Agent Framework)",
  "description": "Minimal Hello World agent using the Responses protocol.",
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

## 7. Website validation pipeline

1. **Load current metadata** — the catalog route plugin reads
   `static/templates.json`, `template-use-cases.json`, and generated repository
   metrics during each content load.
2. **Build the catalog** —
   [`catalogBuilder.ts`](../website/src/catalog/catalogBuilder.ts) skips records
   with a non-empty `templateType`, validates required catalog metadata, and
   normalizes accepted records. Invalid metadata throws and stops the
   development reload or production build instead of silently dropping the
   record.
3. **Generate route data** — the route plugin creates the compact listing,
   canonical detail pages, and service-page payloads from the validated
   catalog.

[`catalogData.ts`](../website/src/catalog/catalogData.ts) supplies bundled JSON
to the same builder for tests and other static consumers.

## 8. Adding an extension category

1. Pick an `extension.<category>.<type>` namespace.
2. Add entries to `website/static/templates.json`.
3. Define and validate the consumer-specific required fields.
4. Ensure the consuming `azd` flow filters by the new `templateType`.
5. Run `npm test` in `website/`; at minimum the `agent-templates`, `catalog`,
   and `tags_match` tests must pass.

## 9. Related files

- [`website/static/templates.json`](../website/static/templates.json)
- [`website/src/catalog/catalogBuilder.ts`](../website/src/catalog/catalogBuilder.ts)
- [`website/src/catalog/catalogData.ts`](../website/src/catalog/catalogData.ts)
- [`website/route_generator_plugin/catalogRouteGenerator.ts`](../website/route_generator_plugin/catalogRouteGenerator.ts)
- [`website/src/catalog/template-use-cases.json`](../website/src/catalog/template-use-cases.json)
- [`website/src/data/tags.ts`](../website/src/data/tags.ts)
- [`website/test/catalog.test.ts`](../website/test/catalog.test.ts)
- [`website/test/tags_match.test.ts`](../website/test/tags_match.test.ts)
- [`website/test/agent-templates.test.ts`](../website/test/agent-templates.test.ts)
