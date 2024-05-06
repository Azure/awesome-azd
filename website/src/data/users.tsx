/**
* Copyright (c) Microsoft Corporation. All rights reserved.
* Licensed under the MIT License.
 */

/* eslint-disable global-require */

import { sortBy } from '../utils/jsUtils';
import { TagType, Template, Tags } from './tags';
import templates from '../../static/templates.json'

// *** ADDING DATA TO AZD GALLERY ****/

// Currently using Custom Issues on Repo

// *************** CARD DATA STARTS HERE ***********************
// Add your site to this list
// prettier-ignore
const expandedTemplates: Template[] = [];

const expand = async (source:Template[]):Promise<Template[]> => {
  await Promise.all(source.map(async (template) => {
    if (template.ref) {
      const resp = await fetch(template.ref);
      const data = await resp.json() as Template[];
      data.forEach((d) => {
        expandedTemplates.push({...d, tags: [...d.tags, ...(template.tags || [])]});
      });
    } else {
      expandedTemplates.push(template)
    }
  }));
  
  return expandedTemplates;
}

export const unsortedUsers = (async ():Promise<Template[]> => {
  if (expandedTemplates.length !== 0) {
    return expandedTemplates;
  }
  return expand(templates as Template[]);
})();

export const TagList = Object.keys(Tags) as TagType[];
async function sortUsers() {
  let result = await unsortedUsers;
  // Sort by site name
  result = sortBy(result, (user) => user.title.toLowerCase());
  return result;
}

export const sortedUsers = sortUsers();
