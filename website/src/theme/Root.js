import React, { useEffect } from "react";
import Clarity from "@microsoft/clarity";
import Cookies from "js-cookie";
import { manageCookieLabel, manageCookieId } from "../../constants.js";

function removeItem(id) {
  var el = document.getElementById(id);
  if (el) {
    el.remove();
  }
}

const telemetryInit = () => {
  const SET = "set";
  const RESET = "reset";
  var siteConsent = null;

  function onConsentChanged(categoryPreferences) {
    setNonEssentialCookies(categoryPreferences);
  }

  function setNonEssentialCookies(categoryPreferences) {
    if (categoryPreferences.Analytics) {
      AnalyticsCookies(SET);
    } else {
      AnalyticsCookies(RESET);
    }

    if (categoryPreferences.SocialMedia) {
      SocialMediaCookies(SET);
    } else {
      SocialMediaCookies(RESET);
    }

    if (categoryPreferences.Advertising) {
      AdvertisingCookies(SET);
    } else {
      AdvertisingCookies(RESET);
    }
  }

  function setClarity(setString) {
    if (setString === SET) {
      Clarity.init("r8ugpuymsy");
      Clarity.consent(true);
    } else {
      Cookies.remove("_clck", { domain: ".microsoft.com" });
      Cookies.remove("_clsk", { domain: ".microsoft.com" });
    }
  }

  function AnalyticsCookies(setString) {
    if (setString === SET) {
      setClarity(SET);
    } else {
      setClarity(RESET);
    }
  }

  function SocialMediaCookies(setString) {
    // Intentional no-op: no social media cookies are set today. Kept as a
    // named seam so future social integrations route through consent.
  }

  function AdvertisingCookies(setString) {
    // Intentional no-op: no advertising cookies are set today. Kept as a
    // named seam so future ad integrations route through consent.
  }

  // Initialize WCP once the external script has loaded. Runs the full consent
  // pipeline: WcpConsent.init -> manage-cookie footer wiring -> apply current
  // consent to non-essential cookies.
  function initWcpConsent() {
    var WcpConsent = window.WcpConsent;
    if (!WcpConsent) return;

    WcpConsent.init(
      "en-US",
      "cookie-banner",
      function (err, _siteConsent) {
        if (err) {
          console.warn("Error initializing WcpConsent: " + err);
          return;
        }
        siteConsent = _siteConsent;

        if (siteConsent.isConsentRequired) {
          var manageCookies = document.getElementById("manage_cookie");
          if (manageCookies) {
            manageCookies.addEventListener("click", function (e) {
              e.preventDefault();
              siteConsent.manageConsent();
            });
          }
        } else {
          // Consent confirmed NOT required (non-EU / non-regulated market).
          // Remove the Manage Cookies link + separator from the footer.
          removeItem("footer__links_" + manageCookieLabel);
          removeItem(manageCookieId);
        }

        setNonEssentialCookies(siteConsent.getConsent());
      },
      onConsentChanged
    );
  }

  var wcpInitialized = false;
  var wcpTimer = null;
  var wcpScript = null;

  function tryInitWcp() {
    if (wcpInitialized) return;
    if (window.WcpConsent) {
      wcpInitialized = true;
      if (wcpTimer) {
        clearInterval(wcpTimer);
        wcpTimer = null;
      }
      initWcpConsent();
    }
  }

  function onWcpError() {
    console.warn(
      "wcp-consent.js failed to load; Cookie banner will not render."
    );
    stopWaitingForWcp();
  }

  function stopWaitingForWcp() {
    if (wcpTimer) {
      clearInterval(wcpTimer);
      wcpTimer = null;
    }
    if (wcpScript) {
      wcpScript.removeEventListener("load", tryInitWcp);
      wcpScript.removeEventListener("error", onWcpError);
    }
  }

  if (window.WcpConsent) {
    wcpInitialized = true;
    initWcpConsent();
  } else {
    wcpScript = document.querySelector('script[src*="wcp-consent.js"]');
    if (wcpScript) {
      wcpScript.addEventListener("load", tryInitWcp);
      wcpScript.addEventListener("error", onWcpError);
    }
    var wcpAttempts = 0;
    wcpTimer = setInterval(function () {
      tryInitWcp();
      if (!wcpInitialized) {
        wcpAttempts++;
        if (wcpAttempts === 100) {
          console.warn(
            "wcp-consent.js still not loaded after 10s; continuing to wait."
          );
        }
      }
    }, 100);
  }

  // 1DS initialization
  if (typeof oneDS !== "undefined") {
    const analytics = new oneDS.ApplicationInsights();
    var config = {
      instrumentationKey:
        "41c1099574f14f06bdce4f80fcd0a65c-4a29467c-f5d4-4151-8e8b-62c0a3515947-7118",
      propertyConfiguration: {
        callback: {
          userConsentDetails: function () {
            return siteConsent && siteConsent.getConsent
              ? siteConsent.getConsent()
              : null;
          },
        },
      },
      webAnalyticsConfiguration: {
        autoCapture: {
          scroll: true,
          pageView: true,
          onLoad: true,
          onUnload: true,
          click: true,
          resize: true,
          jsError: true,
        },
      },
    };
    analytics.initialize(config, []);
  } else {
    // oneDS is undefined — most commonly because an ad blocker prevented
    // ms.analytics-web from loading. Surface a hint to the user.
    console.log(
      "The oneDS functionality is currently unavailable. This could be caused by an active ad blocker. " +
        "As a result, telemetry provided by OneDS (Microsoft analytics) has been disabled. Please consider " +
        "disabling your ad blocker or whitelisting our site if you wish to enable this functionality."
    );
  }

  return stopWaitingForWcp;
};

// Exported for behavioral tests in test/consent-banner.test.ts.
// Not part of the public API of the Root swizzle — treat as test-only.
export { telemetryInit };

export default function Root({ children }) {
  useEffect(() => {
    return telemetryInit();
  }, []);

  return (
    <>
      <div id="cookie-banner"></div>
      {children}
    </>
  );
}
