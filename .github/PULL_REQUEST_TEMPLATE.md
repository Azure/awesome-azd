Please fill out this template! There are three different types of contributions, feel free to delete the checklists that are not applicable to your contribution type. 

# If you are submitting a new `azd` template to the gallery
Fill this out if you want your template to be added to the awesome-azd gallery!

### Your template repository
Place your template repository link here:

<!-- Please ensure that your PR includes the following metadata! All fields are mandatory unless explicitly marked as optional -->

- [ ] Added an entry to https://github.com/Azure/awesome-azd/blob/main/website/static/templates.json that includes:
    - [ ] **Template title** - A short title that reflects the local application stack that someone could use to get their application on Azure (e.g. "Containerized React Web App with Java API and MongoDB")
    - [ ] **Description** - 1-2 sentence description of the architecture (e.g. Azure services) or solution that is defined by the template.
    - [ ] **Architecture Diagram or Application Screenshot** - The image should include all services and their connections ([example](https://github.com/Azure-Samples/azure-search-openai-demo/blob/main/docs/images/appcomponents.png)). You should add the image to the `website/static/templates/images`.
    - [ ] **Link to Author's GitHub or other relevant website** - Used for attribution
    - [ ] **Author's Name** -  Name to credit on the gallery card
    - [ ] **Link to template source** - Link to the template GitHub repo 
    - [ ] **Tags** - Specify special, tool, or topic [tags](https://github.com/Azure/awesome-azd/blob/main/website/src/data/tags.ts). Use `"aiapplication"` for AI application templates; do not add the legacy `"aicollection"` value.
    - [ ] **Languages** - [Language tags](https://github.com/Azure/awesome-azd/blob/main/website/src/data/tags.ts) used by the template.
    - [ ] **Frameworks** - [Framework tags](https://github.com/Azure/awesome-azd/blob/main/website/src/data/tags.ts) used by the template.
    - [ ] **Azure Services** - [Azure service tags](https://github.com/Azure/awesome-azd/blob/main/website/src/data/tags.ts) provisioned by the template.
    - [ ] **Models** - Model tags used by AI templates, when applicable.
    - [ ] **IaC** - The infrastructure-as-code provider (`"bicep"` or `"terraform"`).
    - [ ] **ID** - Please provide a unique uuid.
        
        **Required tags**:
      - [ ] Tag your template as Microsoft-authored (`"msft"`) or Community-authored (`"community"`)
      - [ ] Add the `"new"` tag for any newly authored templates
      - [ ] Confirm no tag is duplicated within or across metadata arrays

- [ ] Added the normalized repository URL and at least one reviewed use case to https://github.com/Azure/awesome-azd/blob/main/website/src/catalog/template-use-cases.json.

- [ ] In the PR comment, if you can also add a link to the PR where you made your repo `azd` compatible this will allow us to provide feedback on your template and speed up the review process.
- [ ] If the template is Microsoft-authored, we encourage you to also [publish it to learn.microsoft.com/samples](https://learn.microsoft.com/en-us/help/contribute/samples/process/onboarding?branch=main).

# If you are submitting a resource to be added to the awesome-azd README:
- [ ] Name of resource
- [ ] Resource author - who created this resource? (so we can credit them!)
- [ ] What section should this resource be included in? -Is the resource an article? A video? Something else?

<!-- Once submitted, the issue will be reviewed - we plan to do reviews on a rolling basis at regular intervals. The process will include verifying all information required for the template gallery is provided and the template works (i.e., successfully deploys to Azure with `azd up`). 
 * If we have questions or enhancements, we will add comments in issue thread (**issue stays open**)
 * If the contribution is approved, we'll merge the PR to update the gallery (**issue will then be closed**) -->
 