import { describe, expect, test } from '@jest/globals';
import { User, TagType } from '../src/data/tags';
import { splitAuthors } from '../src/utils/jsUtils';

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

// Filter function with author selection support
function filterUsersByAuthor(
  users: User[],
  selectedAuthors: string[]
) {
  if (!selectedAuthors || selectedAuthors.length === 0) {
    return users;
  }
  
  return users.filter((user) => {
    const userAuthors = splitAuthors(user.author);
    return selectedAuthors.some(selectedAuthor => 
      userAuthors.includes(selectedAuthor)
    );
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

describe('Author splitting and filtering tests', () => {
    test('splitAuthors splits comma-separated authors correctly', () => {
        expect(splitAuthors("John Doe, Jane Smith")).toEqual(["John Doe", "Jane Smith"]);
        expect(splitAuthors("John Doe,Jane Smith")).toEqual(["John Doe", "Jane Smith"]);
        expect(splitAuthors("John Doe")).toEqual(["John Doe"]);
        expect(splitAuthors("")).toEqual([]);
    });

    test('Filter by individual author when template has multiple authors', () => {
        const multiAuthorUsers: User[] = [
            {
                title: "Multi-author Template",
                description: "Template with multiple authors",
                preview: "./images/test.png",
                authorUrl: "https://github.com/user1, https://github.com/user2",
                author: "Andre Dewes, Chris Ayers",
                source: "https://github.com/example/multi-author",
                tags: ["msft"]
            },
            {
                title: "Single Author Template",
                description: "Template with single author",
                preview: "./images/test.png",
                authorUrl: "https://github.com/user1",
                author: "Andre Dewes",
                source: "https://github.com/example/single-author",
                tags: ["community"]
            }
        ];

        // Filter by "Andre Dewes" should return both templates
        const andreResult = filterUsersByAuthor(multiAuthorUsers, ["Andre Dewes"]);
        expect(andreResult).toHaveLength(2);
        expect(andreResult.map(u => u.title)).toContain("Multi-author Template");
        expect(andreResult.map(u => u.title)).toContain("Single Author Template");

        // Filter by "Chris Ayers" should return only the multi-author template
        const chrisResult = filterUsersByAuthor(multiAuthorUsers, ["Chris Ayers"]);
        expect(chrisResult).toHaveLength(1);
        expect(chrisResult[0].title).toBe("Multi-author Template");
    });

    test('Extract individual authors from templates with multiple authors', () => {
        const users: User[] = [
            {
                title: "Template 1",
                description: "desc",
                preview: "./images/test.png",
                authorUrl: "url",
                author: "Author A, Author B",
                source: "source",
                tags: ["msft"]
            },
            {
                title: "Template 2",
                description: "desc",
                preview: "./images/test.png",
                authorUrl: "url",
                author: "Author B, Author C",
                source: "source",
                tags: ["community"]
            }
        ];

        const allAuthors = new Set<string>();
        users.forEach(user => {
            const authors = splitAuthors(user.author);
            authors.forEach(author => allAuthors.add(author));
        });

        expect(allAuthors.size).toBe(3);
        expect(Array.from(allAuthors).sort()).toEqual(["Author A", "Author B", "Author C"]);
    });
});