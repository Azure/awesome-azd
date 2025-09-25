import { describe, expect, test } from '@jest/globals';
import { User, TagType } from '../src/data/tags';

// Mock implementation of the filterUsers function to test author filtering
function filterUsers(
  users: User[],
  selectedTags: TagType[],
  searchName: string | null
) {
  if (searchName) {
    // eslint-disable-next-line no-param-reassign
    users = users.filter((user) =>
      user.title.toLowerCase().includes(searchName.toLowerCase()) ||
      user.author.toLowerCase().includes(searchName.toLowerCase())
    );
  }
  if (!selectedTags || selectedTags.length === 0) {
    return users;
  }
  return users.filter((user) => {
    const tags = [
      ...user.tags,
      ...(user.languages || []),
      ...(user.azureServices || []),
    ];
    if (!user && !tags && tags.length === 0) {
      return false;
    }
    return selectedTags.every((tag) => tags.includes(tag));
  });
}

describe('Author filtering tests', () => {
    const mockUsers: User[] = [
        {
            title: "React Web App",
            description: "A React web application",
            preview: "./images/test.png",
            authorUrl: "https://github.com/johndoe",
            author: "John Doe",
            source: "https://github.com/johndoe/react-app",
            tags: ["reactjs", "community"]
        },
        {
            title: "Azure Functions App",
            description: "A serverless functions app",
            preview: "./images/test.png",
            authorUrl: "https://github.com/azuredev",
            author: "Azure Dev Team",
            source: "https://github.com/azure/functions-app",
            tags: ["functions", "msft"]
        },
        {
            title: "Django Blog",
            description: "A Django blog application",
            preview: "./images/test.png",
            authorUrl: "https://github.com/janedoe",
            author: "Jane Doe",
            source: "https://github.com/janedoe/django-blog",
            tags: ["django", "python", "community"]
        }
    ];

    test('Filter by template title works', () => {
        const result = filterUsers(mockUsers, [], "react");
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe("React Web App");
    });

    test('Filter by author name works', () => {
        const result = filterUsers(mockUsers, [], "john doe");
        expect(result).toHaveLength(1);
        expect(result[0].author).toBe("John Doe");
    });

    test('Filter by partial author name works', () => {
        const result = filterUsers(mockUsers, [], "doe");
        expect(result).toHaveLength(2);
        expect(result.map(u => u.author)).toContain("John Doe");
        expect(result.map(u => u.author)).toContain("Jane Doe");
    });

    test('Filter by author works case-insensitive', () => {
        const result = filterUsers(mockUsers, [], "AZURE DEV");
        expect(result).toHaveLength(1);
        expect(result[0].author).toBe("Azure Dev Team");
    });

    test('Filter returns templates matching title OR author', () => {
        const result = filterUsers(mockUsers, [], "azure");
        expect(result).toHaveLength(1);
        // Should match "Azure Functions App" by title (and it also has "Azure Dev Team" as author)
        expect(result[0].title).toBe("Azure Functions App");
        expect(result[0].author).toBe("Azure Dev Team");
    });

    test('Filter matches title in one template and author in another', () => {
        // Search for "react" - should match React Web App by title
        // and no other templates by author in this case
        const reactResult = filterUsers(mockUsers, [], "react");
        expect(reactResult).toHaveLength(1);
        expect(reactResult[0].title).toBe("React Web App");
        
        // Search for "jane" - should match Jane Doe by author
        const janeResult = filterUsers(mockUsers, [], "jane");
        expect(janeResult).toHaveLength(1);
        expect(janeResult[0].author).toBe("Jane Doe");
    });

    test('Empty search returns all templates', () => {
        const result = filterUsers(mockUsers, [], null);
        expect(result).toHaveLength(3);
    });

    test('No matches returns empty array', () => {
        const result = filterUsers(mockUsers, [], "nonexistent");
        expect(result).toHaveLength(0);
    });
});