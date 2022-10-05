/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable global-require */

import {sortBy} from '../utils/jsUtils';
import {TagType, User, Tags} from './tags';

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


// *************** CARD DATA STARTS HERE ***********************
// Add your site to this list
// prettier-ignore
const Users: User[] = [
  /*
    Pro Tip: add your site in alphabetical order.
    Appending your site at the end (of list) is more likely to produce Git conflicts.
   */
  /*
  {
    title: '',
    description:
      '',
      preview: require('./showcase/catsify.png'),
    website: '',
    source: '',
    tags: ['FRONT-END','opensource'],
  },
  */

  //------- FEATURED

  {
    title: 'ToDo Application - React C# CosmosDB SQL',
    description:
      'Complete React.js ToDo application, C# for the API, Azure Cosmos DB SQL API for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-csharp.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-csharp-cosmos-sql',
    tags: ['featured','csharp','javascript','appservice','cosmosdb','monitor','keyvault','reactjs'],
  },
  {
    title: 'Rock, Paper, Orleans (RPO) - Distributed .NET',
    description:
      'Rock, Paper, Orleans (RPO) is a game built using dotnet, Orleans, and runs in Azure.The idea behind RPO is that you write a "player bot" in which you implement your player logic.',
      preview: require('./images/rock-paper-orleans.png'),
    website: 'https://rockpaperorleans.net/',
    author: 'Brady Gaster',
    source: 'https://github.com/bradygaster/RockPaperOrleans',
    tags: ['featured', 'csharp','dotnet','cosmosdb', 'aca'],
  },


  //------- HELP NEEDED

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
  {
    title: 'PyCon Workshop - Django On Azure',
    description:
      'Deploy your Django web application with Microsoft Azure, for scale, using a cloud architecture with integrated monitoring,',
      preview: require('./images/pycon-django.png'),
    website: 'https://github.com/tonybaloney',
    author: 'Anthony Shaw',
    source: 'https://github.com/tonybaloney/django-on-azure',
    tags: ['django','python', 'azuresql', 'webapps','vnets','featured'],
  },

  
  //------- EVERYTHING ELSE
  {
    title: 'ToDo Application - React Python Mongo ACA',
    description:
      'Complete React.js ToDo application,  Python (FastAPI) for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-python-aca.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-python-mongo-aca',
    tags: ['bicep','python','javascript','aca','cosmosdb','monitor','keyvault', 'mongodb','reactjs'],
  },
  {
    title: 'ToDo Application - C# AzureSQL AppService ',
    description:
      'A complete sample To Do application that demonstrates how to build an Azure solution using C#, Azure SQL for storage, and Azure Monitor for monitoring and logging.',
      preview: require('./images/todo-python.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-csharp-sql',
    tags: ['bicep','csharp','javascript','appservice','azuresql','monitor','keyvault', 'mongodb','reactjs'],
  },
  {
    title: 'ToDo Application - React Python Mongo AppService',
    description:
      'Complete React.js ToDo application,  Python (FastAPI) for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-python.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-python-mongo',
    tags: ['bicep','python','javascript','appservice','cosmosdb','monitor','keyvault', 'mongodb','reactjs'],
  },
  {
    title: 'ToDo Application - React Node.js Mongo ACA',
    description:
      'Complete React.js ToDo application,  Node.js for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-node-aca.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-nodejs-mongo-aca',
    tags: ['bicep','nodejs','javascript','appservice','cosmosdb','monitor','keyvault', 'mongodb','reactjs', 'aca'],
  },
  {
    title: 'ToDo Application - React Python Mongo Terraform',
    description:
      'Complete ToDo appliction with Terraform as the IaC provider, React.js for the Web application, Python (FastAPI) for the API, Azure Cosmos DB API for MongoDB for storage, and Azure Monitor for monitoring and logging',
      preview: require('./images/todo-python-terraform.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/todo-python-mongo-terraform',
    tags: ['bicep','python','javascript','cosmosdb','monitor','keyvault', 'mongodb','reactjs', 'terraform', 'appservice'],
  },
  {
    title: 'Microservices App - Dapr PubSub Node.js ACA ServiceBus',
    description:
      'A complete microservice application featuring Dapr Pub-Sub, deployed to Azure Container Apps and Azure Service Bus Topics with dead-lettering support.',
      preview: require('./images/test.png'),
    website: 'https://github.com/Azure/azure-dev',
    author: 'Azure Dev',
    source: 'https://github.com/Azure-Samples/pubsub-dapr-nodejs-servicebus',
    tags: ['bicep','javascript', 'nodejs', 'aca', 'dapr','servicebus'],
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