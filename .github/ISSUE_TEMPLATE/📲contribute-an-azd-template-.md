---
name: "\U0001F4F2Contribute an azd template!"
about: Have you built an azd template? Use this issue to contribute it to awesome-azd!
title: "[New azd-template] <your-template-name>"
labels: new-contribution
assignees: nitya, savannahostrowski

---

## New azd-template Submission

Fill in the sections below to populate a new Gallery carry for your template. An example of a valid template object is given at the end for reference. **All fields are mandatory unless explicitly identified as optional**

### 1. Title 
_Short template name that will be used in card title on gallery_

## 2. Description
_1-2 sentence description of the architecture or solution that is defined by the template_

## 3. Author Profile
_A link to the contributor's GitHub profile (ideal) or other profile link (for identification_.

## 4. Author Name
_The name to be shown in the grey button on the card - will be linked profile website above_.

## 5. Template Repo
_The GitHub repo containing the template being contributed - must be a valid, complete template_

## 6. Standard Tags
_One or more tags representing the template. Look at the currently available tags on the Gallery page and pick at least 1 tag for programming language used, and 1 tag for Azure services integrated_

## 7. Additional Tags (`optional`)
_Don't see a relevant standard tag for your template? Request these tags be added, and then used for your template. These could be new languages, services, or application domains_.

## 8. Architecture Diagram or Application Screenshot
_Used as default image for template card - must be representative of solution being enabled. Submit image by adding it as file upload to this issue_

---

## Example Of Valid Template

```
  {
    title: 'ToDo Application - React C# CosmosDB SQL',
    description:
      'Complete React.js ToDo application, C# for the API, Azure Cosmos DB SQL API for storage, and Azure Monitor for monitoring and logging',
      preview: `todo-csharp.png`,
    website: 'https://github.com/danieljurek',
    author: 'Daniel Jurek',
    source: 'https://github.com/Azure-Samples/todo-csharp-cosmos-sql',
    tags: ['featured','csharp','dotnet','javascript','appservice','cosmosdb','monitor','keyvault','reactjs'],
  },
```
---

## Next Steps

Once submitted the issue will be reviewed - we plan to do reviews on a rolling basis at regular intervals. The process will involve checking that template information is complete, and the template is valid. 
 * If we have questions or enhancements, we will add comments in issue thread (**issue stays open**)
 * If the contribution is approved, we'll update the gallery directly (**issue will then be closed**)
