import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';

const https = require('https');
const dns = require('dns');
const { validateTemplate, canonicalizeUrl, validateUrl, isPrivateIP, isPrivateHost, safeLookup } = require('../scripts/validate-template');

let requestSpy: ReturnType<typeof jest.spyOn>;

function mockRequestResponse(statusCode: number) {
    const req = {
        on: jest.fn().mockReturnThis() as any,
        end: jest.fn() as any,
        destroy: jest.fn() as any,
    };
    requestSpy = jest.spyOn(https, 'request').mockImplementation((_opts: any, callback: any) => {
        process.nextTick(() => callback({ statusCode }));
        return req;
    });
    return req;
}

function mockRequestError(errorMessage: string) {
    const req = {
        on: jest.fn().mockImplementation((event: string, cb: any) => {
            if (event === 'error') {
                process.nextTick(() => cb(new Error(errorMessage)));
            }
            return req;
        }) as any,
        end: jest.fn() as any,
        destroy: jest.fn() as any,
    };
    requestSpy = jest.spyOn(https, 'request').mockImplementation(() => req);
    return req;
}

describe('canonicalizeUrl', () => {
    test('lowercases the URL', () => {
        expect(canonicalizeUrl('HTTPS://GitHub.com/Org/Repo')).toBe('https://github.com/org/repo');
    });

    test('strips trailing slash', () => {
        expect(canonicalizeUrl('https://github.com/org/repo/')).toBe('https://github.com/org/repo');
    });

    test('strips trailing .git', () => {
        expect(canonicalizeUrl('https://github.com/org/repo.git')).toBe('https://github.com/org/repo');
    });

    test('strips both trailing slash and .git', () => {
        expect(canonicalizeUrl('https://github.com/org/repo.git/')).toBe('https://github.com/org/repo');
    });

    test('trims whitespace', () => {
        expect(canonicalizeUrl('  https://github.com/org/repo  ')).toBe('https://github.com/org/repo');
    });

    test('handles already canonical URL', () => {
        expect(canonicalizeUrl('https://github.com/org/repo')).toBe('https://github.com/org/repo');
    });
});

describe('validateUrl', () => {
    test('accepts valid HTTPS URL', () => {
        expect(() => validateUrl('https://github.com/org/repo', 'test')).not.toThrow();
    });

    test('rejects HTTP URL', () => {
        expect(() => validateUrl('http://github.com/org/repo', 'test')).toThrow('HTTPS');
    });

    test('rejects invalid URL string', () => {
        expect(() => validateUrl('not-a-url', 'test')).toThrow('Invalid');
    });

    test('allows empty/undefined value', () => {
        expect(() => validateUrl('', 'test')).not.toThrow();
        expect(() => validateUrl(undefined, 'test')).not.toThrow();
    });

    test('rejects 127.0.0.1 (loopback)', () => {
        expect(() => validateUrl('https://127.0.0.1/repo', 'test')).toThrow('private');
    });

    test('rejects 10.x private range', () => {
        expect(() => validateUrl('https://10.0.0.1/repo', 'test')).toThrow('private');
    });

    test('rejects 192.168.x private range', () => {
        expect(() => validateUrl('https://192.168.1.1/repo', 'test')).toThrow('private');
    });

    test('rejects 172.16.x private range', () => {
        expect(() => validateUrl('https://172.16.0.1/repo', 'test')).toThrow('private');
    });

    test('rejects localhost', () => {
        expect(() => validateUrl('https://localhost/repo', 'test')).toThrow('private');
    });

    test('rejects [::1] IPv6 loopback', () => {
        expect(() => validateUrl('https://[::1]/repo', 'test')).toThrow('private');
    });

    test('rejects 169.254.x link-local', () => {
        expect(() => validateUrl('https://169.254.1.1/repo', 'test')).toThrow('private');
    });

    test('rejects IPv4-mapped IPv6 loopback [::ffff:7f00:1]', () => {
        expect(() => validateUrl('https://[::ffff:7f00:1]/repo', 'test')).toThrow('private');
    });

    test('rejects IPv4-mapped IPv6 private [::ffff:a00:1]', () => {
        expect(() => validateUrl('https://[::ffff:a00:1]/repo', 'test')).toThrow('private');
    });

    test('rejects IPv4-mapped IPv6 192.168 [::ffff:c0a8:101]', () => {
        expect(() => validateUrl('https://[::ffff:c0a8:101]/repo', 'test')).toThrow('private');
    });

    test('rejects IPv6 unique local [fc00::1]', () => {
        expect(() => validateUrl('https://[fc00::1]/repo', 'test')).toThrow('private');
    });

    test('rejects IPv6 unique local [fd12::1]', () => {
        expect(() => validateUrl('https://[fd12::1]/repo', 'test')).toThrow('private');
    });

    test('rejects IPv6 link-local [fe80::1]', () => {
        expect(() => validateUrl('https://[fe80::1]/repo', 'test')).toThrow('private');
    });

    test('rejects IPv6 unspecified [::]', () => {
        expect(() => validateUrl('https://[::]/repo', 'test')).toThrow('private');
    });
});

describe('validateTemplate', () => {
    afterEach(() => {
        if (requestSpy) requestSpy.mockRestore();
    });

    test('returns error for empty URL', async () => {
        const result = await validateTemplate('');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Repository URL is required');
    });

    test('returns error for undefined URL', async () => {
        const result = await validateTemplate(undefined);
        expect(result.valid).toBe(false);
    });

    test('returns error for HTTP URL', async () => {
        const result = await validateTemplate('http://github.com/org/repo');
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toMatch(/HTTPS/);
    });

    test('returns error for private IP', async () => {
        const result = await validateTemplate('https://10.0.0.1/org/repo');
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toMatch(/private/);
    });

    test('returns error for non-URL string', async () => {
        const result = await validateTemplate('not a url');
        expect(result.valid).toBe(false);
    });

    test('returns valid for reachable HTTPS repo', async () => {
        mockRequestResponse(200);
        const result = await validateTemplate('https://github.com/Azure-Samples/azd-starter-bicep');
        expect(result.valid).toBe(true);
    });

    test('returns error for 404 response', async () => {
        mockRequestResponse(404);
        const result = await validateTemplate('https://github.com/org/nonexistent');
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toMatch(/404/);
    });

    test('returns error on network failure', async () => {
        mockRequestError('ECONNREFUSED');
        const result = await validateTemplate('https://github.com/org/repo');
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toMatch(/ECONNREFUSED/);
    });

    test('rejects 301 redirect as invalid', async () => {
        mockRequestResponse(301);
        const result = await validateTemplate('https://github.com/org/redirect-repo');
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toMatch(/301/);
    });

    test('rejects 302 redirect as invalid', async () => {
        mockRequestResponse(302);
        const result = await validateTemplate('https://github.com/org/moved-repo');
        expect(result.valid).toBe(false);
        expect(result.errors[0]).toMatch(/302/);
    });
});

describe('isPrivateIP', () => {
    test('detects IPv4 loopback 127.0.0.1', () => {
        expect(isPrivateIP('127.0.0.1')).toBe(true);
    });

    test('detects IPv4 10.x range', () => {
        expect(isPrivateIP('10.0.0.1')).toBe(true);
    });

    test('detects IPv4 172.16.x range', () => {
        expect(isPrivateIP('172.16.0.1')).toBe(true);
    });

    test('detects IPv4 192.168.x range', () => {
        expect(isPrivateIP('192.168.1.1')).toBe(true);
    });

    test('detects IPv4 link-local 169.254.x', () => {
        expect(isPrivateIP('169.254.1.1')).toBe(true);
    });

    test('allows public IPv4', () => {
        expect(isPrivateIP('140.82.121.4')).toBe(false);
    });

    test('allows another public IPv4', () => {
        expect(isPrivateIP('8.8.8.8')).toBe(false);
    });

    test('detects IPv6 loopback ::1', () => {
        expect(isPrivateIP('::1')).toBe(true);
    });

    test('detects IPv6 unspecified ::', () => {
        expect(isPrivateIP('::')).toBe(true);
    });

    test('detects IPv6 link-local fe80::1', () => {
        expect(isPrivateIP('fe80::1')).toBe(true);
    });

    test('detects IPv6 unique local fc00::1', () => {
        expect(isPrivateIP('fc00::1')).toBe(true);
    });

    test('detects IPv6 unique local fd12::1', () => {
        expect(isPrivateIP('fd12::1')).toBe(true);
    });

    test('detects IPv4-mapped IPv6 loopback ::ffff:127.0.0.1', () => {
        expect(isPrivateIP('::ffff:127.0.0.1')).toBe(true);
    });

    test('detects IPv4-mapped IPv6 hex form ::ffff:7f00:1', () => {
        expect(isPrivateIP('::ffff:7f00:1')).toBe(true);
    });

    test('detects IPv4-mapped IPv6 10.x hex form ::ffff:a00:1', () => {
        expect(isPrivateIP('::ffff:a00:1')).toBe(true);
    });

    test('detects IPv4-mapped IPv6 192.168 hex form ::ffff:c0a8:101', () => {
        expect(isPrivateIP('::ffff:c0a8:101')).toBe(true);
    });

    test('allows public IPv6', () => {
        expect(isPrivateIP('2607:f8b0:4004:800::200e')).toBe(false);
    });

    test('denies null/undefined', () => {
        expect(isPrivateIP(null as any)).toBe(true);
        expect(isPrivateIP(undefined as any)).toBe(true);
        expect(isPrivateIP('')).toBe(true);
    });
});

describe('safeLookup', () => {
    let lookupSpy: ReturnType<typeof jest.spyOn>;

    afterEach(() => {
        if (lookupSpy) lookupSpy.mockRestore();
    });

    test('rejects hostname resolving to private IPv4', (done) => {
        lookupSpy = jest.spyOn(dns, 'lookup').mockImplementation(
            (_hostname: string, _options: any, callback: any) => {
                callback(null, '10.0.0.1', 4);
            }
        );
        safeLookup('evil.com', {}, (err: any) => {
            expect(err).toBeTruthy();
            expect(err.message).toMatch(/private\/reserved/);
            done();
        });
    });

    test('rejects hostname resolving to loopback', (done) => {
        lookupSpy = jest.spyOn(dns, 'lookup').mockImplementation(
            (_hostname: string, _options: any, callback: any) => {
                callback(null, '127.0.0.1', 4);
            }
        );
        safeLookup('evil.com', {}, (err: any) => {
            expect(err).toBeTruthy();
            expect(err.message).toMatch(/private\/reserved/);
            done();
        });
    });

    test('rejects hostname resolving to IPv6 loopback', (done) => {
        lookupSpy = jest.spyOn(dns, 'lookup').mockImplementation(
            (_hostname: string, _options: any, callback: any) => {
                callback(null, '::1', 6);
            }
        );
        safeLookup('evil.com', {}, (err: any) => {
            expect(err).toBeTruthy();
            expect(err.message).toMatch(/private\/reserved/);
            done();
        });
    });

    test('allows hostname resolving to public IP', (done) => {
        lookupSpy = jest.spyOn(dns, 'lookup').mockImplementation(
            (_hostname: string, _options: any, callback: any) => {
                callback(null, '140.82.121.4', 4);
            }
        );
        safeLookup('github.com', {}, (err: any, address: string) => {
            expect(err).toBeNull();
            expect(address).toBe('140.82.121.4');
            done();
        });
    });

    test('propagates DNS lookup errors', (done) => {
        lookupSpy = jest.spyOn(dns, 'lookup').mockImplementation(
            (_hostname: string, _options: any, callback: any) => {
                callback(new Error('ENOTFOUND'));
            }
        );
        safeLookup('nonexistent.invalid', {}, (err: any) => {
            expect(err).toBeTruthy();
            expect(err.message).toBe('ENOTFOUND');
            done();
        });
    });
});

describe('canonicalizeUrl - security', () => {
    test('strips query string to prevent duplicate bypass', () => {
        expect(canonicalizeUrl('https://github.com/org/repo?ref=main')).toBe(
            'https://github.com/org/repo'
        );
    });

    test('strips fragment to prevent duplicate bypass', () => {
        expect(canonicalizeUrl('https://github.com/org/repo#readme')).toBe(
            'https://github.com/org/repo'
        );
    });

    test('strips both query and fragment', () => {
        expect(canonicalizeUrl('https://github.com/org/repo?ref=main#section')).toBe(
            'https://github.com/org/repo'
        );
    });
});
