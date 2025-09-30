/**
* Copyright (c) Microsoft Corporation. All rights reserved.
* Licensed under the MIT License.
 */

// Inspired by https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_sortby-and-_orderby
export function sortBy<T>(
    array: T[],
    getter: (item: T) => string | number | boolean,
  ): T[] {
    const sortedArray = [...array];
    sortedArray.sort((a, b) =>
      // eslint-disable-next-line no-nested-ternary
      getter(a) > getter(b) ? 1 : getter(b) > getter(a) ? -1 : 0,
    );
    return sortedArray;
  }
  
  export function toggleListItem<T>(list: T[], item: T): T[] {
    const itemIndex = list.indexOf(item);
    if (itemIndex === -1) {
      return list.concat(item);
    }
    const newList = [...list];
    newList.splice(itemIndex, 1);
    return newList;
  }

  /**
   * Split comma-separated authors into an array of individual author names.
   * Trims whitespace from each author name.
   * @param authorString - The comma-separated author string (e.g., "John Doe, Jane Smith")
   * @returns Array of individual author names
   */
  export function splitAuthors(authorString: string): string[] {
    if (!authorString || authorString.trim() === '') {
      return [];
    }
    return authorString.split(',').map(author => author.trim()).filter(author => author.length > 0);
  }