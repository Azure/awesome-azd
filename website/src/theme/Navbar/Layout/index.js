import React, { useEffect } from "react";
import clsx from 'clsx';
import { useThemeConfig } from '@docusaurus/theme-common';
import {
  useHideableNavbar,
  useNavbarMobileSidebar,
} from '@docusaurus/theme-common/internal';
import { translate } from '@docusaurus/Translate';
import NavbarMobileSidebar from '@theme/Navbar/MobileSidebar';
import styles from './styles.module.css';
function NavbarBackdrop(props) {
  return (
    <div
      role="presentation"
      {...props}
      className={clsx('navbar-sidebar__backdrop', props.className)}
    />
  );
}

const adobeInit = () => {
  var siteConsent = null;
  function onConsentChanged(categoryPreferences) {
    console.log("onConsentChanged", categoryPreferences);
  }

  window.WcpConsent && WcpConsent.init("en-US", "cookie-banner", function (err, _siteConsent) {
    if (!err) {
      siteConsent = _siteConsent;  //siteConsent is used to get the current consent          
    } else {
      console.log("Error initializing WcpConsent: " + err);
    }
  }, onConsentChanged, WcpConsent.themes.light);

  // 1DS initialization
  const analytics = new oneDS.ApplicationInsights();
  var config = {
    instrumentationKey: "41c1099574f14f06bdce4f80fcd0a65c-4a29467c-f5d4-4151-8e8b-62c0a3515947-7118",
    propertyConfiguration: { // Properties Plugin configuration
      callback: {
        userConsentDetails: siteConsent ? siteConsent.getConsent : null
      },
    },
    webAnalyticsConfiguration: { // Web Analytics Plugin configuration
      autoCapture: {
        scroll: true,
        pageView: true,
        onLoad: true,
        onUnload: true,
        click: true,
        scroll: true,
        resize: true,
        jsError: true
      }
    }
  };
  //Initialize SDK
  analytics.initialize(config, []);
}

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
        id: 'theme.NavBar.navAriaLabel',
        message: 'Main',
        description: 'The ARIA label for the main navigation',
      })}
      className={clsx(
        'navbar',
        'navbar--fixed-top',
        hideOnScroll && [
          styles.navbarHideable,
          !isNavbarVisible && styles.navbarHidden,
        ],
        {
          'navbar--dark': style === 'dark',
          'navbar--primary': style === 'primary',
          'navbar-sidebar--show': mobileSidebar.shown,
        },
      )}>
      {children}
      <NavbarBackdrop onClick={mobileSidebar.toggle} />
      <NavbarMobileSidebar />
    </nav>
  );
}
