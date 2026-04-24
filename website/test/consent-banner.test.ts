/**
 * @jest-environment jsdom
 *
 * EU cookie consent banner — regression + behavioral test suite.
 *
 * Background: the banner silently regressed twice (commits 9a1d128, 83aabe6)
 * because there was no automated check that the WCP script, banner anchor,
 * footer Manage Cookies link, and init logic stayed wired together. Web-
 * compliance scans only run from EU IPs, so non-EU CI / devs never noticed.
 *
 * This file has two layers of defense:
 *
 *   1. Static/grep-level tests (describe: "EU cookie consent banner wiring")
 *      — read source files as strings and assert the required patterns exist.
 *      Fast, but can't catch a function that's declared but never called, or
 *      an `else` branch that fires in the wrong state.
 *
 *   2. Runtime/jsdom tests (describe: "telemetryInit behavior (jsdom)") —
 *      actually execute telemetryInit() in a simulated DOM with fake timers
 *      and a mock window.WcpConsent, and assert observable effects
 *      (init arguments, footer link wiring, polling recovery, unmount
 *      cleanup, error handling).
 *
 * Consent init lives in src/theme/Root.js (hoisted from Navbar/Layout).
 */

import {
    describe,
    expect,
    test,
    jest,
    beforeEach,
    afterEach,
} from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Module mocks (hoisted by jest). Applied only to the runtime tests below —
// the static tests never import Root.js so they're unaffected.
// ---------------------------------------------------------------------------

jest.mock('@microsoft/clarity', () => ({
    __esModule: true,
    default: { init: jest.fn(), consent: jest.fn() },
}));

jest.mock('js-cookie', () => ({
    __esModule: true,
    default: { remove: jest.fn(), set: jest.fn(), get: jest.fn() },
}));

// ---------------------------------------------------------------------------
// Static / grep-level regression tests
// ---------------------------------------------------------------------------

const WEBSITE_ROOT = path.resolve(__dirname, '..');

function readRepoFile(relPath: string): string {
    return fs.readFileSync(path.join(WEBSITE_ROOT, relPath), 'utf8');
}

describe('EU cookie consent banner wiring', () => {
    test('docusaurus.config.js loads the WCP consent script from the approved CDN', () => {
        const config = readRepoFile('docusaurus.config.js');
        expect(config).toMatch(
            /https:\/\/wcpstatic\.microsoft\.com\/mscc\/lib\/v2\/wcp-consent\.js/
        );
    });

    test('docusaurus.config.js pins an SRI hash on the WCP consent script entry', () => {
        const config = readRepoFile('docusaurus.config.js');
        // Must include the wcp-consent.js URL AND an integrity pin within
        // the same scripts[] object. A loose regex that just looks for any
        // integrity attribute in the file would pass even if the WCP entry
        // were deleted while the 1DS entry kept its pin.
        expect(config).toMatch(
            /wcp-consent\.js[\s\S]{0,200}?integrity:\s*["']sha384-[A-Za-z0-9+/=]+["']/
        );
    });

    test('docusaurus.config.js pins an SRI hash on the 1DS analytics script entry', () => {
        const config = readRepoFile('docusaurus.config.js');
        expect(config).toMatch(
            /ms\.analytics-web-4\.min\.js[\s\S]{0,200}?integrity:\s*["']sha384-[A-Za-z0-9+/=]+["']/
        );
    });

    test('docusaurus.config.js footer includes the Manage Cookies link', () => {
        const config = readRepoFile('docusaurus.config.js');
        expect(config).toMatch(/manageCookieLabel/);
    });

    test('constants.js exports manageCookieLabel and manageCookieId', () => {
        const constants = readRepoFile('constants.js');
        expect(constants).toMatch(/export\s+const\s+manageCookieLabel\s*=/);
        expect(constants).toMatch(/export\s+const\s+manageCookieId\s*=/);
    });

    test('Root renders the cookie-banner anchor div', () => {
        // Anchor lives in Root (not Navbar) so it exists before Navbar
        // renders and survives any future Navbar swizzle refactor.
        const root = readRepoFile('src/theme/Root.js');
        expect(root).toMatch(/id=["']cookie-banner["']/);
    });

    test('Root calls WcpConsent.init with the cookie-banner id', () => {
        const root = readRepoFile('src/theme/Root.js');
        expect(root).toMatch(/WcpConsent\.init\s*\(/);
        expect(root).toMatch(/["']cookie-banner["']/);
    });

    test('Root polls for window.WcpConsent instead of reading it once synchronously', () => {
        // The original race-condition bug: the file only read
        // `window.WcpConsent` once at function entry. If the external
        // wcp-consent.js <script> tag had not finished executing by the
        // time `useEffect` fired (normal case in prod), WcpConsent was
        // undefined, the guard short-circuited, and the banner never
        // rendered. The fix uses a load-event listener + polling fallback.
        const root = readRepoFile('src/theme/Root.js');
        expect(root).toMatch(/setInterval\s*\(/);
        expect(root).toMatch(/window\.WcpConsent/);
        expect(root).toMatch(/clearInterval\s*\(/);
    });

    test('Root actually invokes initWcpConsent (not just declares it)', () => {
        // Regression guard: an earlier edit sequence left `initWcpConsent`
        // defined but uncalled. The banner silently never rendered, every
        // other test still passed (they only check for presence of
        // strings/patterns), and `npm run build` succeeded (dead code is
        // valid JS). Assert there is a call-site, not just a definition.
        const root = readRepoFile('src/theme/Root.js');
        const defs = (root.match(/function\s+initWcpConsent\s*\(/g) || []).length;
        const calls = (root.match(/initWcpConsent\s*\(\s*\)/g) || []).length;
        expect(defs).toBeGreaterThanOrEqual(1);
        expect(calls).toBeGreaterThanOrEqual(1);
    });

    test('Root listens for the wcp-consent.js <script> load event', () => {
        // Deterministic trigger for slow networks: the load event fires
        // exactly when the external script has finished executing, so the
        // banner renders as soon as it can regardless of how long the
        // network took. Polling is a fallback, not the primary mechanism.
        const root = readRepoFile('src/theme/Root.js');
        expect(root).toMatch(/script\[src\*=["']wcp-consent\.js["']\]/);
        expect(root).toMatch(/addEventListener\s*\(\s*["']load["']/);
    });

    test('Root does not hard-stop waiting after a fixed timeout', () => {
        // CNIL-compliance guard: an earlier revision stopped polling after
        // 2 s, which on slow EU networks would silently suppress the
        // banner forever. The file must not contain a pattern that
        // clearInterval's based on an attempt counter hitting a small cap.
        const root = readRepoFile('src/theme/Root.js');
        expect(root).not.toMatch(/attempts\s*>=?\s*(?:20|30|40|50)\b[\s\S]{0,80}clearInterval/);
    });

    test('Root returns a cleanup from telemetryInit for useEffect', () => {
        // Ensures the polling timer and script listeners are torn down
        // if Root unmounts before WcpConsent loads.
        const root = readRepoFile('src/theme/Root.js');
        expect(root).toMatch(/return\s+stopWaitingForWcp\s*;/);
        expect(root).toMatch(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*return\s+telemetryInit\s*\(\s*\)\s*;/);
    });

    test('Root does not delete the Manage Cookies link when WcpConsent failed to load', () => {
        // Regression guard for the bare `else { removeItem(...) }` bug:
        // if WcpConsent was undefined, the old else branch would execute
        // anyway and wipe the footer link for every user. The fix narrows
        // this branch to `else if (WcpConsent.siteConsent)` so the link is
        // only removed when WCP has positively told us consent is not
        // required.
        const root = readRepoFile('src/theme/Root.js');
        expect(root).toMatch(/else\s+if\s*\(\s*WcpConsent\.siteConsent\s*\)/);
    });

    test('Navbar Layout no longer owns consent bootstrap', () => {
        // After the Root hoist, Navbar/Layout/index.js must not contain
        // the consent / telemetry init code. If this test fails, someone
        // has re-introduced the coupling that caused the original
        // regression. (A doc-comment mentioning WcpConsent is fine — this
        // only flags operational code.)
        const layout = readRepoFile('src/theme/Navbar/Layout/index.js');
        expect(layout).not.toMatch(/WcpConsent\s*\.\s*init\s*\(/);
        expect(layout).not.toMatch(/new\s+oneDS\s*\.\s*ApplicationInsights/);
        expect(layout).not.toMatch(/(?:const|let|var)\s+telemetryInit\s*=/);
    });
});

// ---------------------------------------------------------------------------
// Runtime / jsdom behavioral tests
// ---------------------------------------------------------------------------

// Import must come after jest.mock() calls at the top of the file.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { telemetryInit } = require('../src/theme/Root');

type ManageConsent = jest.Mock<void, []>;

interface FakeSiteConsent {
    isConsentRequired: boolean;
    getConsent: () => Record<string, boolean>;
    manageConsent: ManageConsent;
}

function makeWcp(siteConsent: FakeSiteConsent) {
    const init = jest.fn(
        (
            _locale: string,
            _anchorId: string,
            cb: (err: unknown, sc: FakeSiteConsent) => void,
            _onChanged: unknown
        ) => {
            cb(null, siteConsent);
        }
    );
    // Match the real wcp-consent.js shape: siteConsent is available on the
    // global right after init resolves.
    return { init, siteConsent };
}

describe('telemetryInit behavior (jsdom)', () => {
    let warnSpy: jest.SpiedFunction<typeof console.warn>;
    let logSpy: jest.SpiedFunction<typeof console.log>;
    let cleanup: (() => void) | undefined;

    beforeEach(() => {
        jest.useFakeTimers();
        document.body.innerHTML = `
      <div id="cookie-banner"></div>
      <li id="footer__links_Manage Cookies">
        <a id="manage_cookie" href="#">Manage Cookies</a>
      </li>
      <script src="https://wcpstatic.microsoft.com/mscc/lib/v2/wcp-consent.js"></script>
    `;
        // Reset WcpConsent between tests.
        delete (window as unknown as { WcpConsent?: unknown }).WcpConsent;
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        cleanup = undefined;
    });

    afterEach(() => {
        if (cleanup) cleanup();
        jest.useRealTimers();
        warnSpy.mockRestore();
        logSpy.mockRestore();
        jest.clearAllMocks();
    });

    test('when WcpConsent is already present at hydration, initWcpConsent fires synchronously against the #cookie-banner anchor', () => {
        const siteConsent: FakeSiteConsent = {
            isConsentRequired: true,
            getConsent: () => ({
                Analytics: false,
                SocialMedia: false,
                Advertising: false,
            }),
            manageConsent: jest.fn(),
        };
        const wcp = makeWcp(siteConsent);
        (window as unknown as { WcpConsent: unknown }).WcpConsent = wcp;

        cleanup = telemetryInit();

        expect(wcp.init).toHaveBeenCalledTimes(1);
        expect(wcp.init.mock.calls[0][1]).toBe('cookie-banner');
        // Sync path never schedules the polling interval.
        expect(jest.getTimerCount()).toBe(0);
    });

    test('when WcpConsent arrives after load (polling path), the banner still initializes and the footer link is wired', () => {
        const siteConsent: FakeSiteConsent = {
            isConsentRequired: true,
            getConsent: () => ({ Analytics: false }),
            manageConsent: jest.fn(),
        };
        const wcp = makeWcp(siteConsent);

        cleanup = telemetryInit();

        // WcpConsent not yet available; polling + load listener armed.
        expect(wcp.init).not.toHaveBeenCalled();

        // Simulate script becoming available mid-session.
        jest.advanceTimersByTime(350);
        (window as unknown as { WcpConsent: unknown }).WcpConsent = wcp;
        jest.advanceTimersByTime(150);

        expect(wcp.init).toHaveBeenCalledTimes(1);

        // Footer link click now invokes manageConsent.
        const link = document.getElementById('manage_cookie') as HTMLElement;
        expect(link).not.toBeNull();
        link.click();
        expect(siteConsent.manageConsent).toHaveBeenCalledTimes(1);
    });

    test('when isConsentRequired=false, the Manage Cookies footer link and separator are removed', () => {
        const siteConsent: FakeSiteConsent = {
            isConsentRequired: false,
            getConsent: () => ({ Analytics: false }),
            manageConsent: jest.fn(),
        };
        (window as unknown as { WcpConsent: unknown }).WcpConsent = makeWcp(siteConsent);

        cleanup = telemetryInit();

        expect(document.getElementById('manage_cookie')).toBeNull();
        expect(document.getElementById('footer__links_Manage Cookies')).toBeNull();
    });

    test('when wcp-consent.js never resolves, the footer link is NOT silently removed (regression: unguarded else bug)', () => {
        cleanup = telemetryInit();

        // Let polling run well past the 10s observability warning mark.
        jest.advanceTimersByTime(15000);

        // With no WcpConsent, neither branch of the isConsentRequired check fires,
        // so Manage Cookies must remain in the footer.
        expect(document.getElementById('manage_cookie')).not.toBeNull();
        expect(document.getElementById('footer__links_Manage Cookies')).not.toBeNull();
    });

    test('polling is unbounded: no hard timeout — a WcpConsent that arrives after 15s still initializes the banner', () => {
        cleanup = telemetryInit();

        // Simulate a very slow EU network.
        jest.advanceTimersByTime(15000);

        const siteConsent: FakeSiteConsent = {
            isConsentRequired: true,
            getConsent: () => ({ Analytics: false }),
            manageConsent: jest.fn(),
        };
        const wcp = makeWcp(siteConsent);
        (window as unknown as { WcpConsent: unknown }).WcpConsent = wcp;
        jest.advanceTimersByTime(150);

        expect(wcp.init).toHaveBeenCalledTimes(1);

        // 10s warning was emitted once but init still happens.
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('still not loaded after 10s')
        );
    });

    test('returned cleanup cancels the polling timer and removes script listeners (prevents leaks on unmount)', () => {
        cleanup = telemetryInit();

        expect(jest.getTimerCount()).toBeGreaterThan(0);

        const script = document.querySelector(
            'script[src*="wcp-consent.js"]'
        ) as HTMLScriptElement;
        const removeListenerSpy = jest.spyOn(script, 'removeEventListener');

        cleanup!();
        cleanup = undefined;

        expect(jest.getTimerCount()).toBe(0);
        expect(removeListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
        expect(removeListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));

        // Timer fully cancelled: advancing far past the 10s mark must not emit
        // another warning.
        warnSpy.mockClear();
        jest.advanceTimersByTime(30000);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    test('script error event stops polling and logs a clear warning', () => {
        cleanup = telemetryInit();

        const script = document.querySelector(
            'script[src*="wcp-consent.js"]'
        ) as HTMLScriptElement;
        script.dispatchEvent(new Event('error'));

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('wcp-consent.js failed to load')
        );
        expect(jest.getTimerCount()).toBe(0);
    });
});
