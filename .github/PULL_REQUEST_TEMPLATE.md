Please fill out this template! There are three different types of contributions, feel free to delete the checklists that are not applicable to your contribution type. 

# If you are submitting a new `azd` template to the gallery
Fill this out if you want your template to be added to the awesome-azd gallery!

<!-- Please ensure that your PR includes the following metadata! All fields are mandatory unless explicitly marked as optional -->

- [ ] Added an entry to https://github.com/Azure/awesome-azd/blob/main/website/src/data/users.tsx that includes:
    - [ ] **Template title** - A short title that reflects the local application stack that someone could use to get their application on Azure (e.g. "Containerized React Web App with Java API and MongoDB")
    - [ ] **Description** - 1-2 sentence description of the architecture (e.g. Azure services) or solution that is defined by the template.
    - [ ] **Architecture Diagram or Application Screenshot** - Used as display image for gallery card. The image should include all services and their connections ([example](https://github.com/Azure-Samples/todo-csharp-sql/blob/main/assets/resources.png)). You should add the image to the `website/src/data/images/`.
    - [ ] **Link to Author's GitHub or other relevant website** - Used for attribution
    - [ ] **Author's Name** -  Name to credit on the gallery card
    - [ ] **Link to template source** - Link to the template GitHub repo 
    - [ ] **Tags** - One or more [tags](https://github.com/Azure/awesome-azd/blob/main/website/src/data/tags.tsx) representing the template. Provide at least 1 tag for programming language used and at least 1 tag for Azure services integrated. Also tag the IaC provider (Bicep or Terraform). If you don't see a relevant tag for your template? Feel free to add one!

- [ ] In the PR comment, if you can also add a link to the PR where you made your repo `azd` compatible this will allow us to provide feedback on your template and speed up the review process.

# If you are submitting a resource to be added to the awesome-azd README:
- [] Name of resource
- [] Resource author - who created this resource? (so we can credit them!)
- [] What section should this resource be included in? -Is the resource an article? A video? Something else?

<!-- Once submitted, the issue will be reviewed - we plan to do reviews on a rolling basis at regular intervals. The process will include verifying all information required for the template gallery is provided and the template works (i.e., successfully deploys to Azure with `azd up`). 
 * If we have questions or enhancements, we will add comments in issue thread (**issue stays open**)
 * If the contribution is approved, we'll merge the PR to update the gallery (**issue will then be closed**) -->
 