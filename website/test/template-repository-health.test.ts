import { describe, expect, test } from '@jest/globals';

const {
    auditTemplates,
    buildIssueBody,
    parseGitHubSource,
    selectManagedIssue,
} = require('../../.github/scripts/audit-template-repositories.js');

describe('template repository health audit', () => {
    test('normalizes repository roots while preserving deep-link suffixes', () => {
        expect(
            parseGitHubSource(
                'https://github.com/example/project/blob/main/samples/azure.yaml?raw=1#file'
            )
        ).toEqual({
            owner: 'example',
            repository: 'project',
            key: 'example/project',
            rootUrl: 'https://github.com/example/project',
            suffix: '/blob/main/samples/azure.yaml?raw=1#file',
        });
    });

    test('rejects non-GitHub and repository-less sources', () => {
        expect(() => parseGitHubSource('https://example.com/owner/repo')).toThrow(
            'https://github.com'
        );
        expect(() => parseGitHubSource('https://github.com/owner')).toThrow(
            'owner and repository'
        );
    });

    test('deduplicates API checks and classifies repository findings', async () => {
        const templates = [
            {
                title: 'Archived template',
                source: 'https://github.com/example/archived',
            },
            {
                title: 'Archived deep link',
                source: 'https://github.com/example/archived/tree/main/sample',
            },
            {
                title: 'Missing template',
                source: 'https://github.com/example/missing',
            },
            {
                title: 'Transferred template',
                source: 'https://github.com/old-owner/active',
            },
            {
                title: 'Disabled template',
                source: 'https://github.com/example/disabled',
            },
        ];
        const calls: string[] = [];
        const fetchRepository = async (owner: string, repository: string) => {
            calls.push(`${owner}/${repository}`);
            if (repository === 'missing') {
                return {
                    status: 'missing',
                    nameWithOwner: `${owner}/${repository}`,
                    url: `https://github.com/${owner}/${repository}`,
                    archived: false,
                    disabled: false,
                    visibility: null,
                };
            }
            return {
                status: 'available',
                nameWithOwner:
                    owner === 'old-owner' ? 'new-owner/active' : `${owner}/${repository}`,
                url:
                    owner === 'old-owner'
                        ? 'https://github.com/new-owner/active'
                        : `https://github.com/${owner}/${repository}`,
                archived: repository === 'archived',
                disabled: repository === 'disabled',
                visibility: 'public',
            };
        };

        const audit = await auditTemplates(templates, fetchRepository);

        expect(calls).toHaveLength(4);
        expect(audit.repositoryCount).toBe(4);
        expect(audit.findings.archived).toHaveLength(2);
        expect(audit.findings.missing).toHaveLength(1);
        expect(audit.findings.disabled).toHaveLength(1);
        expect(audit.findings.redirected).toHaveLength(1);
        expect(audit.findings.redirected[0].canonicalSource).toBe(
            'https://github.com/new-owner/active'
        );
    });

    test('renders escaped findings and the deterministic issue marker', async () => {
        const audit = await auditTemplates(
            [
                {
                    title: 'Template | @team',
                    source: 'https://github.com/example/archived',
                },
            ],
            async () => ({
                status: 'available',
                nameWithOwner: 'example/archived',
                url: 'https://github.com/example/archived',
                archived: true,
                disabled: false,
                visibility: 'public',
            })
        );

        const body = buildIssueBody(audit);

        expect(body).toContain('<!-- template-repository-health -->');
        expect(body).toContain('Template \\| @\u200bteam');
        expect(body).toContain('| Archived | 1 |');
    });

    test('only selects issues carrying the generated marker', () => {
        const issues = [
            {
                number: 1,
                title: 'Template repository health: archived or unavailable sources',
                body: 'Human-authored issue with the same title',
                state: 'OPEN',
            },
            {
                number: 2,
                title: 'Template repository health: archived or unavailable sources',
                body: '<!-- template-repository-health -->\nGenerated issue',
                state: 'OPEN',
            },
        ];

        expect(selectManagedIssue(issues)?.number).toBe(2);
    });
});
