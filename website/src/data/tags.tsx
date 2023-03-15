/*
 * ADD YOUR SITE TO THE DOCUSAURUS SHOWCASE:
 *
 * Requirements for adding your site to our showcase:
 * - It is a production-ready site with real content and decent customizations
 * (different from the init templates)
 * - It is NOT a work-in-progress with empty pages
 * - It has a stable domain (a Netlify/Vercel deploy preview is not allowed)
 *
 * Instructions:
 * - Add your site in the json array below
 * - `title` is your project's name (no need for the "Docs" suffix)
 * - A short (≤120 characters) description of your project
 * - Use relevant tags to categorize your site (read the tag descriptions below)
 * - Add a local image preview (decent screenshot of your Docusaurus site)
 * - The image MUST be added to the GitHub repository, and use `require("img")`
 * - The image has to have minimum width 640 and an aspect of no wider than 2:1
 * - If your website is open-source, add your source link. The link should open
 *   to a directory containing the `docusaurus.config.js` file
 * - Open a PR and check for reported CI errors
 *
 * Example PR: https://github.com/facebook/docusaurus/pull/3976
 *
 * If you edit this file through the GitHub interface, you can:
 * - Submit first your users.tsx edit PR
 * - This will create a branch on your Docusaurus fork (usually "patch-1")
 * - Go to https://github.com/<username>/docusaurus/tree/<branch>/website/src/data/showcase
 * - Drag-and-drop an image here to add it to your existing PR
 *
 * Please help us maintain this showcase page data:
 * - Update sites with wrong data
 * - Ensure site tags remain correct over time
 * - Remove sites not using Docusaurus anymore
 * - Add missing Docusaurus sites (if the site owner agreed)
 */

export type Tag = {
    label: string;
    description: string;
    color: string;
};

export type User = {
    title: string;
    description: string;
    preview: string;
    website: string;
    author: string;
    source: string | null;
    tags: TagType[];
};
  
  // NN: Updated TagType to suit Static Web Apps
export type TagType =
| 'featured'
//| 'deprecated'
| 'helpwanted'
| 'bicep'
| 'typescript'
| 'javascript'
| 'csharp'
| 'dotnet'
| 'java'
| 'python'
| 'django'
| 'reactjs'
| 'nodejs'
| 'appservice'
| 'cosmosdb'
| 'monitor'
| 'keyvault'
| 'aca'
| 'mongodb'
| 'iothub'
| 'iotedge'
| 'signalR'
| 'functions'
| 'blobstorage'
| 'HDinsight'
| 'azuredb-postgreSQL'
| 'azuresql'
| 'webapps'
| 'terraform'
| 'swa'
| 'dapr'
| 'servicebus'
| 'vnets'
| 'fastapi'
| 'fhir'
| 'ahds'
| 'appinsights'
| 'loganalytics'
| 'cognitivesearch'
| 'openai'
| 'azureai'
| 'flask'
| 'apim'
| 'spring'
| 'thymeleaf'
| 'sap'
| 'sapcloudsdk'
| 'nestjs'
| 'dataverse'
| 'azurecontainerapps'
;


// LIST OF AVAILABLE TAGS
// Each tag in lit about must have a defined object here
// One or more tags can be associated per card
// Tag Metadata:
//   - label = short name seen in tag
//   - description = explainer for usage
//   - color = color of the dot in tag
// Some tags are special:
//    - 'featured` can only be added by admin (for quality templates)
//    - 'help wanted` must associate "source" with an open issue
export const Tags: {[type in TagType]: Tag} = {

    // =============     FOR ADMIN USE ONLY: 

    // Use for validated templates of high-quality 
    featured: {
        label: ' ♥️ Featured',
        description:
        'This tag is used for admin-curated templates that represent high-quality (community) or official (Microsoft) azd templates.',
        color: 'red', //'#e9669e',
    },

    // Use for templates that were valid once, but either
    //  don't work now or have not been updated in XX time
    /*
    deprecated: {
        label: '❌ Deprecated',
        description: 'This tag is used when a previously approved template is no longer relevant (e.g., out of date, not refreshed in XX months etc.)',
        color: 'red',
    },
    */

    // Use for templates that were valid once, but either
    //  don't work now or have not been updated in XX time
    helpwanted: {
        label: '🙏🏽 Help Wanted',
        description: 'This tag is used when there is a request for azd templates for a specific architecture. The title will link to arch, the button to a custom-issue for PR',
        color: 'red',
    },


    //============  FOR REGULAR USE

    // Language Tags

    javascript: {
        label: 'JavaScript',
        description: 'Template contains JavaScript app code',
        color: '#1e90ff',
    },
    typescript: {
        label: 'TypeScript',
        description: 'Template contains TypeScript app code',
        color: '#1e90ff',
    },
    csharp: {
        label: 'C#',
        description: 'Template contains C# app code',
        color: '#1e90ff',
    },
    dotnet: {
        label: '.NET',
        description: 'Template contains .NET app code',
        color: '#1e90ff',
    },
    java: {
        label: 'Java',
        description: 'Template contains Java app code',
        color: '#1e90ff',
    },
    python: {
        label: 'Python',
        description: 'Template contains Python app code',
        color: '#1e90ff',
    },
    django: {
        label: 'Django',
        description: 'Template contains Django web app code',
        color: '#1e90ff',
    },
    reactjs: {
         label: 'React.js',
         description: 'Template architecture uses React.js',
         color: '#1e90ff',
     },
     nodejs: {
          label: 'Node.js',
          description: 'Template architecture uses Node.js',
          color: '#1e90ff',
      },

    // ---- Templating Options
    bicep: {
        label: 'Bicep',
        description: 'Template uses Bicep for Infra as Code',
        color: '#66ff00',
    },
    terraform: {
        label: 'Terraform',
        description: 'Template uses Terraform for Infra as Code',
        color: '#66ff00',
    },

    // ---- 3rd Party Services
   mongodb: {
    label: 'MongoDB',
    description: 'Template architecture uses MongoDB',
    color: 'hotpink',
    },
    fastapi: {
    label: 'FastAPI',
    description: 'Template architecture uses FastAPI web framework',
    color: 'hotpink',
    },
    fhir: {
    label: 'FHIR Service',
    description: 'Template architecture uses Fast Healthcare Interoperability Resources (FHIR)',
    color: 'hotpink',
    },
    flask:{
    label: 'Flask',
    description: 'Template architecture uses Flask web framework',
    color: 'hotpink',
    },
    nestjs:{
    label: 'NestJS',
    description: 'Template architecture uses NestJS framework',
    color: 'hotpink',
    },
    sap:{
    label: 'SAP',
    description: 'Template architecture uses Systems Applications and Products in data processing (SAP)',
    color: 'hotpink',
    },
    sapcloudsdk:{
    label: 'SAP Cloud SDK',
    description: 'Template architecture uses SAP Cloud SDK',
    color: 'hotpink',
    },
    spring:{
    label: 'Spring',
    description: 'Template architecture uses Spring framework',
    color: 'hotpink',
    },
    thymeleaf:{
    label: 'Thymeleaf',
    description: 'Template architecture uses Thymeleaf template engine',
    color: 'hotpink',
    },
    dataverse:{
    label: 'Dataverse',
    description: 'Template architecture uses Microsoft Dataverse',
    color: 'hotpink',
    },

    // ---- Azure Services
    ahds: {
        label: 'Azure Health Data Service',
        description: 'Template architecture uses Azure Health Data Services workspace',
        color: 'hotpink',
    },
    appinsights: {
        label: 'Azure App Insights',
        description: 'Template architecture uses Azure App Insights',
        color: 'hotpink',
    },
    loganalytics: {
        label: 'Azure Log Analytics',
        description: 'Template architecture uses Azure Log Analytics',
        color: 'hotpink',
    },
    appservice: {
        label: 'Azure App Service',
        description: 'Template architecture uses Azure App Service',
        color: 'hotpink',
    },
    monitor: {
        label: 'Azure Monitor',
        description: 'Template architecture uses  Azure App Service',
        color: 'hotpink',
    },
    keyvault: {
        label: 'Azure Key Vault',
        description: 'Template architecture uses Azure Key Vault',
        color: 'hotpink',
    },
    aca: {
        label: 'Azure Container Apps',
        description: 'Template architecture uses Azure Container Apps',
        color: 'hotpink',
    },
    cosmosdb: {
        label: 'CosmosDB',
        description: 'Template architecture uses Azure CosmosDB',
        color: 'hotpink',
    },
    iothub: {
        label: 'Azure IoT Hub',
        description: 'Template architecture uses Azure IoT Hub',
        color: 'hotpink',
    },
    signalR: {
        label: 'Azure SignalR',
        description: 'Template architecture uses Azure SignalR',
        color: 'hotpink',
    },
    iotedge: {
        label: 'Azure IoT Edge',
        description: 'Template architecture uses Azure IoT Edge',
        color: 'hotpink',
    },
    functions: {
        label: 'Azure Functions',
        description: 'Template architecture uses Azure Functions',
        color: 'hotpink',
    },
    HDinsight: {
        label: 'Azure HDInsight',
        description: 'Template architecture uses Azure HD Insight',
        color: 'hotpink',
    },
    blobstorage: {
        label: 'Azure Blob Storage',
        description: 'Template architecture uses Azure Blob Storage',
        color: 'hotpink',
    },    
    webapps: {
        label: 'Web Apps',
        description: 'Template architecture uses Web Apps',
        color: 'hotpink',
    }, 
    azuresql: {
        label: 'Azure SQL',
        description: 'Template architecture uses Azure SQL',
        color: 'hotpink',
    },
    "azuredb-postgreSQL": {
        label: 'Azure DB For PostgreSQL',
        description: 'Template architecture uses Azure DB for PostgreSQL',
        color: 'hotpink',
    },
    swa: {
        label: 'Azure Static Web Apps',
        description: 'Template architecture uses Azure Static Web Apps',
        color: 'hotpink',
    },
    dapr: {
        label: 'Dapr',
        description: 'Template architecture uses Distributed Application Runtime (dapr)',
        color: 'hotpink',
    },
    servicebus: {
        label: 'Azure Service Bus',
        description: 'Template architecture uses Azure Service Bus',
        color: 'hotpink',
    },
    vnets: {
        label: 'Virtual Networks (VNET)',
        description: 'Template architecture uses Virtual Networks',
        color: 'hotpink',
    },
    cognitivesearch: {
        label: 'Azure Cognitive Search',
        description: 'Template architecture uses Azure Cognitive Search',
        color: 'hotpink',
    },
    openai: {
        label: 'Azure OpenAI Service',
        description: 'Template architecture uses Azure OpenAI Service',
        color: 'hotpink',
    },
    azureai: {
        label: 'Azure AI Service',
        description: 'Template architecture uses Azure AI Service',
        color: 'hotpink',
    },
    apim: {
        label: 'Azure API Management',
        description: 'Template architecture uses Azure API Management',
        color: 'hotpink',
    },
    azurecontainerapps: {
        label: 'Azure Container Apps',
        description: 'Template architecture uses Azure Container Apps',
        color: 'hotpink',
    },
};

