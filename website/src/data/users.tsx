/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable global-require */

import {sortBy} from '../utils/jsUtils';
import {TagType, User, Tags} from './tags';

// *** ADDING DATA TO AZD GALLERY ****/
// Currently using Custom Issues on Repo 
// TODO: Define acceptable process for PR-based contributions

// *************** CARD DATA STARTS HERE ***********************
// Add your site to this list
// prettier-ignore
const Users: User[] = [

  //------- FEATURED TEMPLATES have 'featured' as a tag

  {
    title: 'ToDo Application - React C# CosmosDB SQL',
    description:
      'Complete React.js ToDo application, C# for the API, Azure Cosmos DB SQL API for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-csharp.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-csharp-cosmos-sql',
    tags: ['featured','csharp','dotnet','typescript','javascript','appservice','cosmosdb','monitor','keyvault','reactjs', 'bicep'],
  },
  {
    title: 'Rock, Paper, Orleans (RPO) - Distributed .NET',
    description:
      'Rock, Paper, Orleans (RPO) is a game built using dotnet, Orleans, and runs in Azure.The idea behind RPO is that you write a "player bot" in which you implement your player logic.',
      preview: require('./images/rock-paper-orleans.png'),
    website: 'https://rockpaperorleans.net/',
    author: 'Brady Gaster',
    source: 'https://github.com/bradygaster/RockPaperOrleans',
    tags: ['featured','csharp','dotnet','cosmosdb', 'aca', 'bicep'],
  },
  {
    title: 'PyCon Workshop - Django On Azure',
    description:
      'Deploy your Django web application with Microsoft Azure, for scale, using a cloud architecture with integrated monitoring,',
      preview: require('./images/pycon-django.png'),
    website: 'https://github.com/tonybaloney',
    author: 'Anthony Shaw',
    source: 'https://github.com/tonybaloney/django-on-azure',
    tags: ['featured', 'django','python', 'azuredb-postgreSQL', 'webapps','vnets', 'bicep'],
  },
  {
    title: 'ToDo Application - React Node.js Mongo',
    description:
      'Complete ToDo app with Bicep as the IaC provider, React.js for the Web application, Node.js for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-nodejs-mongo.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-nodejs-mongo',
    tags: ['featured','bicep','nodejs','typescript','javascript','appservice','cosmosdb','monitor','keyvault', 'mongodb','reactjs'],
  },
  {
    title: 'ToDo Application - React Node.js SWA MongoDB Functions',
    description:
      'A ToDo Application with React.js for the Web application, Node.js for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging. Azure Static Web Apps to host frontend, Azure Functions for API backend',
      preview: require('./images/todo-nodejs-mongo-swa-func.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-nodejs-mongo-swa-func',
    tags: ['featured','bicep','swa','functions','nodejs','typescript','javascript','cosmosdb','monitor','keyvault', 'mongodb','reactjs', 'appservice'],
  },
  {
    title: 'ToDo Application - React Python SWA MongoDB Functions',
    description:
      'A ToDo Application with React.js for the Web application, Python for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging. Azure Static Web Apps to host frontend, Azure Functions for API backend',
      preview: require('./images/todo-python-mongo-swa-func.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-python-mongo-swa-func',
    tags: ['featured','bicep','swa','functions','python','typescript','javascript','cosmosdb','monitor','keyvault', 'mongodb','reactjs', 'appservice', 'fastapi'],
  },
  {
    title: 'ToDo Application - React Python MongoDB Terraform',
    description:
      'Complete ToDo appliction with Terraform as the IaC provider, React.js for the Web application, Python (FastAPI) for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-python-terraform.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-python-mongo-terraform',
    tags: ['featured','python','typescript','javascript','cosmosdb','monitor','keyvault', 'mongodb','reactjs', 'terraform', 'appservice', 'fastapi'],
  },
  {
    title: 'ToDo Application - React Node.js MongoDB Terraform',
    description:
      'Complete ToDo appliction with Terraform as the IaC provider, React.js for the Web application, Node.js for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-nodejs-mongo-terraform.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-nodejs-mongo-terraform',
    tags: ['featured','nodejs','typescript','javascript','cosmosdb','monitor','keyvault', 'mongodb','reactjs', 'terraform', 'appservice'],
  },
  {
    title: 'ToDo Application - React Python MongoDB AppService',
    description:
      'Complete React.js ToDo application,  Python (FastAPI) for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-python.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-python-mongo',
    tags: ['featured','bicep','python','typescript','javascript','appservice','cosmosdb','monitor','keyvault', 'mongodb','reactjs', 'fastapi'],
  },
  {
    title: 'ToDo Application - React Node.js MongoDB ACA',
    description:
      'Complete React.js ToDo application,  Node.js for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-node-aca.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-nodejs-mongo-aca',
    tags: ['featured','bicep','nodejs','typescript','javascript','appservice','cosmosdb','monitor','keyvault', 'mongodb','reactjs', 'aca'],
  },
  {
    title: 'ToDo Application - React Python MongoDB ACA',
    description:
      'Complete React.js ToDo application,  Python (FastAPI) for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-python-aca.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-python-mongo-aca',
    tags: ['featured', 'bicep','python','typescript','javascript','aca','cosmosdb','monitor','keyvault', 'mongodb','reactjs', 'fastapi'],
  },
  {
    title: 'ToDo Application - C# AzureSQL AppService ',
    description:
      'A complete sample To Do application that demonstrates how to build an Azure solution using C#, Azure SQL for storage, and Azure Monitor for monitoring and logging.',
      preview: require('./images/todo-csharp-sql.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-csharp-sql',
    tags: ['featured', 'bicep','csharp','dotnet','typescript','javascript','appservice','azuresql','monitor','keyvault', 'mongodb','reactjs'],
  },
  {
    title: 'ToDo Application - Java MongoDB AppService ',
    description:
      'A complete sample To Do application that demonstrates how to build an Azure solution using  React.js for the Web application, Java for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging.',
      preview: require('./images/todo-java-mongo.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-java-mongo',
    tags: ['featured', 'bicep','java','typescript','appservice','cosmosdb','keyvault','monitor', 'mongodb','reactjs'],
  },
  {
    title: 'ToDo Application - Java MongoDB AppService ACA',
    description:
      'A complete sample To Do application that demonstrates how to build an Azure solution using  React.js for the Web application, Java for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging. Deployed to Azure Container Apps.',
      preview: require('./images/todo-java-mongo-aca.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-java-mongo-aca',
    tags: ['featured', 'bicep','java','typescript','appservice','cosmosdb','keyvault','monitor', 'mongodb','reactjs'],
  },
  {
    title: 'ToDo Application - React C# SQL SWA MongoDB Functions',
    description:
      'A complete ToDo application that includes everything you need to build, deploy, and monitor an Azure solution. This application uses the Azure Developer CLI (azd) to get you up and running on Azure quickly, React.js for the Web application, C# isolated Azure Functions for the API, Azure SQL for DB, and Azure Monitor for monitoring and logging.',
      preview: require('./images/todo-csharp-sql-swa-func.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-csharp-sql-swa-func',
    tags: ['featured','bicep','swa','functions','csharp','typescript','javascript','monitor','keyvault', 'reactjs', 'appservice', 'azuresql'],
  },

  //-------  REQUESTED TEMPLATES have 'helpwanted' as a tag
  {
    title: 'Real-Time IoT Updates',
    description:
      'Use Azure SignalR to update cloud applications in real-time. The service sends real-time IoT data to connected web and mobile clients',
      preview: require('./images/real-time-iot.png'),
    website: 'https://github.com/Azure/awesome-azd/issues/14',
    author: 'Submit A Template',
    source: 'https://learn.microsoft.com/azure/architecture/example-scenario/iot/real-time-iot-updates-cloud-apps',
    tags: ['helpwanted', 'signalR', 'iotedge', 'iothub', 'functions'],
  },
  {
    title: 'Retail/E-Commerce using Azure DB for PostgreSQL',
    description:
      'Build secure and scalable e-commerce solutions that meet customer and business demands by using Azure Database for PostgreSQL',
      preview: require('./images/retail-db-postgresql.png'),
    website: 'https://github.com/Azure/awesome-azd/issues/15',
    author: 'Submit A Template',
    source: 'https://learn.microsoft.com/azure/architecture/solution-ideas/articles/retail-and-ecommerce-using-azure-database-for-postgresql',
    tags: ['helpwanted', 'appservice','blobstorage','HDinsight','azuredb-postgreSQL'],
  },
  

  //-------  ALL OTHER AZURE-SAMPLES HERE - how many do we want to feature?
  {
    title: 'Azure Health Data Services Toolkit Azure Function Quickstart',
    description:
      'This quickstart will walk you through creating a simple custom operation on top of the FHIR Service using Azure Functions. We will cover everything from deploying infrastructure, debugging locally, and deploying to Azure.',
      preview: require('./images/test.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/azure-health-data-services-toolkit-fhir-function-quickstart',
    tags: ['featured', 'bicep','csharp','dotnet','ahds', 'fhir','appinsights','loganalytics', 'functions'],
  },
  {
    title: 'Python (Django) Web App with PostgreSQL',
    description:
      'A restaurants review web app that uses whitenoise for static assets and PostgreSQL for the database. Ready for deployment on App Service with a PostgreSQL Flexible Server inside a VNet.',
      preview: require('./images/msdocs-django-postgresql-sample-app.png'),
    website: 'https://github.com/Azure-Samples',
    author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/msdocs-django-postgresql-sample-app',
    tags: ['python','django', 'webapps', 'azuredb-postgreSQL', 'appservice','vnets'],
  },
  {
    title: 'Python (Flask) Web App with PostgreSQL',
    description:
      'A restaurants review web app with a PostgreSQL database, written in the Python Flask framework plus SQL-Alchemy plus Alembic for database interactions. Ready for deployment on App Service with a PostgreSQL Flexible Server inside a VNet.',
      preview: require('./images/msdocs-flask-postgresql-sample-app.png'),
    website: 'https://github.com/Azure-Samples',
    author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/msdocs-flask-postgresql-sample-app',
    tags: ['python','webapps', 'azuredb-postgreSQL', 'appservice','vnets','flask'],
  },
  {
    title: 'Microservices App - Dapr PubSub C# ACA ServiceBus',
    description:
      'A complete microservice application featuring Dapr Pub-Sub, deployed to Azure Container Apps and Azure Service Bus Topics with dead-lettering support.',
      preview: require('./images/test.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/pubsub-dapr-csharp-servicebus',
    tags: ['bicep','csharp', 'dotnet', 'aca', 'dapr','servicebus','azurecontainerapps'],
  },
  {
    title: 'Microservices App - Dapr PubSub Python ACA ServiceBus',
    description:
      'A complete microservice application featuring Dapr Pub-Sub, deployed to Azure Container Apps and Azure Service Bus Topics with dead-lettering support.',
      preview: require('./images/test.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/pubsub-dapr-python-servicebus',
    tags: ['bicep','python', 'aca', 'dapr','servicebus','azurecontainerapps'],
  },
  {
    title: 'Microservices App - Dapr PubSub Node.js ACA ServiceBus',
    description:
      'A complete microservice application featuring Dapr Pub-Sub, deployed to Azure Container Apps and Azure Service Bus Topics with dead-lettering support.',
      preview: require('./images/test.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/pubsub-dapr-nodejs-servicebus',
    tags: ['bicep','javascript', 'nodejs', 'aca', 'dapr','servicebus','azurecontainerapps'],
  },
  {
    title: 'Microservices App - Dapr Bindings Cron C# ACA PostgreSQL',
    description:
      'Create microservice to demonstrate Dapr\'s bindings API to work with external systems as inputs and outputs. The service listens to input binding events from a system CRON and then outputs the contents of local data to a PostgreSQL output binding.',
      preview: require('./images/bindings-dapr-cron-postgres.png'),
      website: 'https://github.com/Azure-Samples',
      author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/bindings-dapr-csharp-cron-postgres',
    tags: ['dapr','csharp','azuredb-postgreSQL','dotnet','azurecontainerapps']
  },
  {
    title: 'Microservices App - Dapr Bindings Cron Python ACA PostgreSQL',
    description:
      'Create a microservice app to demonstrate Dapr\'s bindings API to work with external systems as inputs and outputs. The service listens to input binding events from a system CRON and then outputs the contents of local data to a postgreSQL output binding.',
      preview: require('./images/bindings-dapr-cron-postgres.png'),
      website: 'https://github.com/Azure-Samples',
      author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/bindings-dapr-python-cron-postgres',
    tags: ['dapr','python','azuredb-postgreSQL','azurecontainerapps']
  },
  {
    title: 'Microservices App - Dapr Bindings Cron Node.js ACA PostgreSQL',
    description:
      'Create a microservice app to demonstrate Dapr\'s bindings API to work with external systems as inputs and outputs. The service listens to input binding events from a system CRON and then outputs the contents of local data to a postgreSQL output binding.',
      preview: require('./images/bindings-dapr-cron-postgres.png'),
      website: 'https://github.com/Azure-Samples',
      author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/bindings-dapr-nodejs-cron-postgres',
    tags: ['dapr','nodejs','azuredb-postgreSQL','javascript','azurecontainerapps']
  },
  {
    title: 'Microservices App - Dapr Service Invoke Node.js ACA',
    description:
      'Create two microservices that communicate using Dapr\'s Service Invocation API. The Service Invocation API enables your applications to communicate reliably and securely by leveraging auto-mTLS and built-in retries.',
      preview: require('./images/svc-invoke-dapr.png'),
      website: 'https://github.com/Azure-Samples',
      author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/svc-invoke-dapr-nodejs',
    tags: ['dapr','nodejs','azurecontainerapps']
  },
  {
    title: 'Microservices App - Dapr Service Invoke Python ACA',
    description:
      'Create two microservices that communicate using Dapr\'s Service Invocation API. The Service Invocation API enables your applications to communicate reliably and securely by leveraging auto-mTLS and built-in retries.',
      preview: require('./images/svc-invoke-dapr.png'),
      website: 'https://github.com/Azure-Samples',
      author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/svc-invoke-dapr-python',
    tags: ['dapr','python','azurecontainerapps']
  },
  {
    title: 'Microservices App - Dapr Service Invoke C# ACA',
    description:
      'Create two microservices that communicate using Dapr\'s Service Invocation API. The Service Invocation API enables your applications to communicate reliably and securely by leveraging auto-mTLS and built-in retries.',
      preview: require('./images/svc-invoke-dapr.png'),
      website: 'https://github.com/Azure-Samples',
      author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/svc-invoke-dapr-csharp',
    tags: ['dapr','csharp','azurecontainerapps']
  },

  //-------  ALL OTHER TEMPLATES go here, can be searched for by name
  {
    title: 'OpenAI Query based Summarization',
    description:
      'This repository contains a Python Notebook that shows you how easy it is to deploy and use Azure OpenAI along with Azure Cognitive Search, Azure Storage and Visual Studio Code to make sense of large amounts of data.',
      preview: require('./images/summarization-python-openai.png'),
    website: 'https://www.linkedin.com/in/rcarun/',
    author: 'Arun Chandrasekhar',
    source: 'https://github.com/Azure-Samples/summarization-python-openai',
    tags: ['featured','python', 'blobstorage', 'cognitivesearch', 'openai','azureai'],
  },
  {
    title: 'FastAPI with API Management',
    description:
      'A FastAPI app deployed as a secured Azure Function with an API Management Policy in front, set up such that API calls require a subscription key but auto-generated documentation is publicly viewable. Project also includes 100% test coverage with Pytest plus a development workflow with ruff, isort, and black.',
      preview: require('./images/fastapi-azure-function-apim.png'),
    website: 'https://github.com/pamelafox',
    author: 'Pamela Fox',
    source: 'https://github.com/pamelafox/fastapi-azure-function-apim',
    tags: ['python', 'fastapi', 'functions', 'apim'],
  },
  {
    title: 'Spring PetClinic - Java Spring MySQL',
    description:
      'Spring PetClinic application using a set of Azure solutions. Azure App Service for app hosting, Azure Database for MySQL for storage, Azure Key Vault for securing secret and Azure Application Insights for monitoring and logging.',
      preview: require('./images/spring-petclinic-java-mysql.png'),
    website: 'https://github.com/wangmingliang-ms',
    author: 'Miller Wang',
    source: 'https://github.com/Azure-Samples/spring-petclinic-java-mysql',
    tags: ['java', 'appservice', 'azuresql', 'monitor','keyvault','appinsights','bicep','spring','thymeleaf'],
  },
  {
    title: 'SAP Cloud SDK on Azure App Service Quickstart (TypeScript)',
    description:
      'This repos serves as quick-start project showcasing SAP Cloud SDK for JavaScript OData consumption running on Azure App Services. Its primary purpose is to set you up for success for your SAP extension project on Azure and reduce the lead time to your first successful deployment as much as possible with developer friendly commands.',
      preview: require('./images/app-service-javascript-sap-cloud-sdk-quickstart.png'),
    website: 'https://github.com/MartinPankraz|https://github.com/lechnerc77',
    author: 'Martin Pankraz|Christian Lechner',
    source: 'https://github.com/Azure-Samples/app-service-javascript-sap-cloud-sdk-quickstart',
    tags: ['typescript','nodejs', 'bicep', 'webapps', 'keyvault','appinsights','featured','nestjs','sap','sapcloudsdk'],
  },
  {
    title: 'Service Bus messages processing to Dataverse',
    description:
      'Starter solution to process Service Bus messages to Dataverse, C# for the Azure Functions app processing the messages, Azure Service Bus for the reception of the messages, and Azure Monitor for monitoring and logging.',
      preview: require('./images/servicebus-csharp-function-dataverse.jpg'),
    website: 'https://github.com/rpothin',
    author: 'Raphael Pothin',
    source: 'https://github.com/rpothin/servicebus-csharp-function-dataverse',
    tags: ['csharp','functions', 'servicebus','monitor','keyvault','dataverse'],
  },
  {
    title: 'Simple Flask AZD',
    description:
      'A tiny, no-frills, template to deploy Python\'s Flask web framework to Azure App Service in the free tier.',
      preview: require('./images/simple-flask-azd.png'),
    website: 'https://github.com/tonybaloney',
    author: 'Anthony Shaw',
    source: 'https://github.com/tonybaloney/simple-flask-azd',
    tags: ['python'],
  },
  {
    title: 'Function App - C# AI Text Summarize',
    description:
      'This sample shows how to take text documents as a input via BlobTrigger, does Text Summarization processing using the AI Congnitive Language service, and then outputs to another text document using BlobOutput binding.',
      preview: require('./images/test.png'),
    website: 'https://github.com/paulyuk',
    author: 'Paul Yuknewicz',
    source: 'https://github.com/Azure-Samples/function-csharp-ai-textsummarize',
    tags: ['functions','csharp','dotnet','azureai', 'bicep'],
  },
  {
    title: 'Function App - Python AI Text Summarize',
    description:
      'This sample shows how to take text documents as a input via BlobTrigger, does Text Summarization processing using the AI Congnitive Language service, and then outputs to another text document using BlobOutput binding. Uses Azure Functions Python v2 programming model.',
      preview: require('./images/test.png'),
    website: 'https://github.com/paulyuk',
    author: 'Paul Yuknewicz',
    source: 'https://github.com/Azure-Samples/function-python-ai-textsummarize',
    tags: ['functions','python','azureai', 'bicep'],
  },
  {
    title: 'ChatGPT and Enterprise data with Azure OpenAI and Cognitive Search',
    description:
      'Demonstration of how to leverage Azure OpenAI and Cognitive Search to enable Information Search and Discovery over organizational content.',
      preview: require('./images/azure-search-openai-demo.png'),
    website: 'https://github.com/Azure-Samples',
    author: 'Azure Content Team',
    source: 'https://github.com/Azure-Samples/azure-search-openai-demo',
    tags: ['openai','chatgpt','cognitivesearch','python','typescript','bicep','nodejs'],
  },


  /*
  Pro Tip: add your site in alphabetical order.
  Appending your site here (at the end) is more likely to produce Git conflicts.
   */
];
// *************** CARD DATA ENDS HERE *******************




export const TagList = Object.keys(Tags) as TagType[];
function sortUsers() {
  let result = Users;
  // Sort by site name
  result = sortBy(result, (user) => user.title.toLowerCase());
  // Sort by favorite tag, favorites first
  result = sortBy(result, (user) => !user.tags.includes('featured'));
  return result;
}

export const sortedUsers = sortUsers();
