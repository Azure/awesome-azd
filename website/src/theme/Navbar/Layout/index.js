import React, { useEffect } from "react";
import clsx from "clsx";
import { useThemeConfig } from "@docusaurus/theme-common";
import {
  useHideableNavbar,
  useNavbarMobileSidebar,
} from "@docusaurus/theme-common/internal";
import { translate } from "@docusaurus/Translate";
import NavbarMobileSidebar from "@theme/Navbar/MobileSidebar";
import styles from "./styles.module.css";
import { manageCookieLabel, manageCookieId } from "../../../../constants.js";
function NavbarBackdrop(props) {
  return (
    <div
      role="presentation"
      {...props}
      className={clsx("navbar-sidebar__backdrop", props.className)}
    />
  );
}

function removeItem(id) {
  var getItem = document.getElementById(id);
  if (getItem !== null) {
    getItem.remove();
  } else {
    throw new Error("id '" + id + "' is not found, cannot remove the item.");
  }
}

const adobeInit = () => {
  // Adobe Analytics
  // WCP initialization
  const SET = "set";
  const RESET = "reset";
  var siteConsent = null;
  var WcpConsent = window.WcpConsent;

  WcpConsent &&
    WcpConsent.init(
      "en-US",
      "cookie-banner",
      function (err, _siteConsent) {
        if (!err) {
          siteConsent = _siteConsent; //siteConsent is used to get the current consent
        } else {
          console.log("Error initializing WcpConsent: " + err);
        }
      },
      onConsentChanged
    );

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

  function AnalyticsCookies(setString) {
    if (setString === SET) {
    } else {
    }
  }

  function SocialMediaCookies(setString) {
    if (setString === SET) {
    } else {
    }
  }

  function AdvertisingCookies(setString) {
    if (setString === SET) {
    } else {
    }
  }

  if (WcpConsent.siteConsent.isConsentRequired) {
    var manageCookies = document.getElementById("manage_cookie");
    manageCookies.addEventListener("click", function (e) {
      e.preventDefault();
      WcpConsent.siteConsent.manageConsent();
    });
  } else {
    // remove Manage Cookie and separator in footer
    removeItem("footer__links_" + manageCookieLabel);
    removeItem(manageCookieId);
  }
  setNonEssentialCookies(WcpConsent.siteConsent.getConsent());

  // 1DS initialization
  try {
    const analytics = new oneDS.ApplicationInsights();
    var config = {
      instrumentationKey:
        "41c1099574f14f06bdce4f80fcd0a65c-4a29467c-f5d4-4151-8e8b-62c0a3515947-7118",
      propertyConfiguration: {
        // Properties Plugin configuration
        callback: {
          userConsentDetails: siteConsent ? siteConsent.getConsent : null,
        },
      },
      webAnalyticsConfiguration: {
        // Web Analytics Plugin configuration
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
    //Initialize SDK
    analytics.initialize(config, []);
  } catch (error) {
    if (
      error instanceof ReferenceError &&
      error.message.includes("oneDS is not defined")
    ) {
      // Print out a message if user uses a ad blocker
      console.log(
        "The oneDS functionality is currently unavailable. This could be caused by an active ad blocker. " +
          "As a result, telemetry provided by Adobe Analytics has been disabled. Please consider " +
          "disabling your ad blocker or whitelisting our site if you wish to enable this functionality."
      );
    } else {
      // Throw other errors
      throw error;
    }
  }
};

export default function NavbarLayout({ children }) {
  const {
    navbar: { hideOnScroll, style },
  } = useThemeConfig();
  const mobileSidebar = useNavbarMobileSidebar();
  const { navbarRef, isNavbarVisible } = useHideableNavbar(hideOnScroll);

  useEffect(() => {
    adobeInit();
  }, []);

  return (
    <nav
      ref={navbarRef}
      aria-label={translate({
        id: "theme.NavBar.navAriaLabel",
        message: "Main",
        description: "The ARIA label for the main navigation",
      })}
      className={clsx(
        "navbar",
        "navbar--fixed-top",
        hideOnScroll && [
          styles.navbarHideable,
          !isNavbarVisible && styles.navbarHidden,
        ],
        {
          "navbar--dark": style === "dark",
          "navbar--primary": style === "primary",
          "navbar-sidebar--show": mobileSidebar.shown,
        }
      )}
    >
      {children}
      <NavbarBackdrop onClick={mobileSidebar.toggle} />
      <NavbarMobileSidebar />
    </nav>
  );
}
