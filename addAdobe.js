// Adobe Analytics
// WCP initialization
var siteConsent = null;
WcpConsent.init("en-US", "cookie-banner", function (err, _siteConsent) {
    if (err != undefined) {
        return err;
    } else {
        siteConsent = _siteConsent;  //siteConsent is used to get the current consent          
    }
});

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