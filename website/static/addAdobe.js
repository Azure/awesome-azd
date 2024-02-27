import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";


if (ExecutionEnvironment.canUseDOM) {
  // Adobe Analytics
  // WCP initialization
  var siteConsent = null;
  const SET = "set";
  const RESET = "reset";

  // function getUserConsent() {
  //   var userConsent = siteConsent.getConsent();
  //   console.log("userConsent", userConsent);
  //   //response will look like this
  //   //{"Required":true,"Analytics":true,"SocialMedia":false,"Advertising":false}
  // }

  function onConsentChanged(categoryPreferences) {
    console.log("onConsentChanged", categoryPreferences);
  }

  window.WcpConsent &&
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

  // function setAdobeTarget() {
  //   // Check if adobe target script exists with id "adobe-target"
  //   var adobeTarget = document.getElementById("adobe-target");
  //   if (!adobeTarget && enableAdobeTarget) {
  //     // If not, create it
  //     var adobeTargetConfig = document.createElement("script");
  //     adobeTargetConfig.id = "adobe-target-config";
  //     adobeTargetConfig.src = "/static/js/at-config.1.4.1.js";

  //     var adobeTargetScript = document.createElement("script");
  //     adobeTargetScript.id = "adobe-target";
  //     adobeTargetScript.src = "/static/js/at.js";
  //     adobeTargetScript.async = true;

  //     document.head.appendChild(adobeTargetConfig);
  //     document.head.appendChild(adobeTargetScript);
  //   }
  // }

  // function AnalyticsCookies(setString) {
  //   if (setString === "set") {
  //     try {
  //       setAdobeTarget();
  //     } catch (e) {}
  //   } else {
  //     // Banner
  //     Cookies.remove("dismissed-alerts");
  //     // Adobe
  //     Cookies.remove("mbox");
  //   }
  // }

  // function AdvertisingCookies(setString) {
  //   if (setString === SET) {
  //   } else {
  //   }
  // }

  // function SocialMediaCookies(setString) {
  //   if (setString === SET) {
  //   } else {
  //   }
  // }

  // function setNonEssentialCookies(categoryPreferences) {
  //   if (categoryPreferences.Advertising) {
  //     AdvertisingCookies(SET);
  //   } else {
  //     AdvertisingCookies(RESET);
  //   }

  //   if (categoryPreferences.SocialMedia) {
  //     SocialMediaCookies(SET);
  //   } else {
  //     SocialMediaCookies(RESET);
  //   }

  //   if (categoryPreferences.Analytics) {
  //     AnalyticsCookies(SET);
  //   } else {
  //     AnalyticsCookies(RESET);
  //   }
  // }

  // // WcpConsent.init(
  // //   "en-US",
  // //   "cookie-banner",
  // //   function (err, _siteConsent) {
  // //     if (err != undefined) {
  // //       return err;
  // //     } else {
  // //       siteConsent = _siteConsent; //siteConsent is used to get the current consent
  // //       setNonEssentialCookies(siteConsent.getConsent());
  // //     }
  // //   },
  // //   onConsentChanged
  // // );

  // function onConsentChanged(categoryPreferences) {
  //   setNonEssentialCookies(categoryPreferences);
  //   console.log("onConsentChanged", categoryPreferences);
  // }

  // function addManageCookiesLink(previousElement) {
  //   var manageCookiesLink =
  //     '<li id="c-uhff-manage-cookies"><a class="c-uhff-link" href="#">Manage cookies</a></li>';
  //   if (previousElement) {
  //     previousElement.insertAdjacentHTML("afterend", manageCookiesLink);
  //   }
  // }
  // 1DS initialization
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

  // if (WcpConsent.siteConsent.isConsentRequired) {
  //   addManageCookiesLink(document.getElementById("c-uhff-privacy & cookies"));
  //   var manageCookiesLink = document.getElementById("c-uhff-manage-cookies");
  //   manageCookiesLink.firstElementChild.addEventListener("click", function (e) {
  //     e.preventDefault();
  //     WcpConsent.siteConsent.manageConsent();
  //   });
  // }
  // setNonEssentialCookies(WcpConsent.siteConsent.getConsent());
  console.log("1");
}