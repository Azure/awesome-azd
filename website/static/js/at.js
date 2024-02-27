// No custom JavaScript
/**
 * @license
 * at.js 2.8.2 | (c) Adobe Systems Incorporated | All rights reserved
 * zepto.js | (c) 2010-2016 Thomas Fuchs | zeptojs.com/license
 */
(window.adobe = window.adobe || {}),
  (window.adobe.target = (function () {
    "use strict";
    var e = window,
      t = document,
      n = !t.documentMode || t.documentMode >= 11;
    var r,
      o,
      i,
      c =
        t.compatMode &&
        "CSS1Compat" === t.compatMode &&
        n &&
        ((r = window.navigator.userAgent),
        (o = r.indexOf("MSIE ") > 0),
        (i = r.indexOf("Trident/") > 0),
        !(o || i)),
      s = e.targetGlobalSettings;
    if (!c || (s && !1 === s.enabled))
      return (
        (e.adobe = e.adobe || {}),
        (e.adobe.target = {
          VERSION: "",
          event: {},
          getOffer: Xt,
          getOffers: be,
          applyOffer: Xt,
          applyOffers: be,
          sendNotifications: be,
          trackEvent: Xt,
          triggerView: Xt,
          registerExtension: Xt,
          init: Xt,
        }),
        (e.mboxCreate = Xt),
        (e.mboxDefine = Xt),
        (e.mboxUpdate = Xt),
        "console" in e &&
          "warn" in e.console &&
          e.console.warn(
            "AT: Adobe Target content delivery is disabled. Update your DOCTYPE to support Standards mode."
          ),
        e.adobe.target
      );
    var u =
      "undefined" != typeof globalThis
        ? globalThis
        : "undefined" != typeof window
        ? window
        : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
        ? self
        : {};
    function a(e) {
      if (e.__esModule) return e;
      var t = Object.defineProperty({}, "__esModule", { value: !0 });
      return (
        Object.keys(e).forEach(function (n) {
          var r = Object.getOwnPropertyDescriptor(e, n);
          Object.defineProperty(
            t,
            n,
            r.get
              ? r
              : {
                  enumerable: !0,
                  get: function () {
                    return e[n];
                  },
                }
          );
        }),
        t
      );
    }
    /*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/ var f = Object.getOwnPropertySymbols,
      l = Object.prototype.hasOwnProperty,
      d = Object.prototype.propertyIsEnumerable;
    function p(e) {
      if (null == e)
        throw new TypeError(
          "Object.assign cannot be called with null or undefined"
        );
      return Object(e);
    }
    var h = (function () {
      try {
        if (!Object.assign) return !1;
        var e = new String("abc");
        if (((e[5] = "de"), "5" === Object.getOwnPropertyNames(e)[0]))
          return !1;
        for (var t = {}, n = 0; n < 10; n++)
          t["_" + String.fromCharCode(n)] = n;
        if (
          "0123456789" !==
          Object.getOwnPropertyNames(t)
            .map(function (e) {
              return t[e];
            })
            .join("")
        )
          return !1;
        var r = {};
        return (
          "abcdefghijklmnopqrst".split("").forEach(function (e) {
            r[e] = e;
          }),
          "abcdefghijklmnopqrst" === Object.keys(Object.assign({}, r)).join("")
        );
      } catch (e) {
        return !1;
      }
    })()
      ? Object.assign
      : function (e, t) {
          for (var n, r, o = p(e), i = 1; i < arguments.length; i++) {
            for (var c in (n = Object(arguments[i])))
              l.call(n, c) && (o[c] = n[c]);
            if (f) {
              r = f(n);
              for (var s = 0; s < r.length; s++)
                d.call(n, r[s]) && (o[r[s]] = n[r[s]]);
            }
          }
          return o;
        };
    function m(e) {
      return null == e;
    }
    const { isArray: g } = Array,
      { prototype: v } = Object,
      { toString: y } = v;
    function b(e) {
      return (function (e) {
        return y.call(e);
      })(e);
    }
    function x(e) {
      const t = typeof e;
      return null != e && ("object" === t || "function" === t);
    }
    function w(e) {
      return !!x(e) && "[object Function]" === b(e);
    }
    function S(e) {
      return e;
    }
    function E(e) {
      return w(e) ? e : S;
    }
    function T(e) {
      return m(e) ? [] : Object.keys(e);
    }
    const C = (e, t) => t.forEach(e),
      k = (e, t) => {
        C((n) => e(t[n], n), T(t));
      },
      I = (e, t) => t.filter(e),
      N = (e, t) => {
        const n = {};
        return (
          k((t, r) => {
            e(t, r) && (n[r] = t);
          }, t),
          n
        );
      };
    function O(e, t) {
      if (m(t)) return [];
      return (g(t) ? I : N)(E(e), t);
    }
    function _(e) {
      return m(e) ? [] : [].concat.apply([], e);
    }
    function A(e) {
      var t = this;
      const n = e ? e.length : 0;
      let r = n;
      for (; (r -= 1); )
        if (!w(e[r])) throw new TypeError("Expected a function");
      return function () {
        let r = 0;
        for (var o = arguments.length, i = new Array(o), c = 0; c < o; c++)
          i[c] = arguments[c];
        let s = n ? e[r].apply(t, i) : i[0];
        for (; (r += 1) < n; ) s = e[r].call(t, s);
        return s;
      };
    }
    function q(e, t) {
      if (m(t)) return;
      (g(t) ? C : k)(E(e), t);
    }
    function M(e) {
      return null != e && "object" == typeof e;
    }
    function P(e) {
      return (
        "string" == typeof e || (!g(e) && M(e) && "[object String]" === b(e))
      );
    }
    function R(e) {
      if (!P(e)) return -1;
      let t = 0;
      const { length: n } = e;
      for (let r = 0; r < n; r += 1)
        t = ((t << 5) - t + e.charCodeAt(r)) & 4294967295;
      return t;
    }
    function D(e) {
      return (
        null != e &&
        (function (e) {
          return (
            "number" == typeof e &&
            e > -1 &&
            e % 1 == 0 &&
            e <= 9007199254740991
          );
        })(e.length) &&
        !w(e)
      );
    }
    const L = (e, t) => t.map(e);
    function j(e) {
      return m(e)
        ? []
        : D(e)
        ? P(e)
          ? e.split("")
          : (function (e) {
              let t = 0;
              const { length: n } = e,
                r = Array(n);
              for (; t < n; ) (r[t] = e[t]), (t += 1);
              return r;
            })(e)
        : ((t = T(e)), (n = e), L((e) => n[e], t));
      var t, n;
    }
    const { prototype: V } = Object,
      { hasOwnProperty: H } = V;
    function U(e) {
      if (null == e) return !0;
      if (D(e) && (g(e) || P(e) || w(e.splice))) return !e.length;
      for (const t in e) if (H.call(e, t)) return !1;
      return !0;
    }
    const { prototype: B } = String,
      { trim: z } = B;
    function F(e) {
      return m(e) ? "" : z.call(e);
    }
    function $(e) {
      return P(e) ? !F(e) : U(e);
    }
    const J = (e) => !$(e);
    function Z(e) {
      return "number" == typeof e || (M(e) && "[object Number]" === b(e));
    }
    const { prototype: G } = Function,
      { prototype: K } = Object,
      { toString: X } = G,
      { hasOwnProperty: Y } = K,
      W = X.call(Object);
    function Q(e) {
      if (!M(e) || "[object Object]" !== b(e)) return !1;
      const t = (function (e) {
        return Object.getPrototypeOf(Object(e));
      })(e);
      if (null === t) return !0;
      const n = Y.call(t, "constructor") && t.constructor;
      return "function" == typeof n && n instanceof n && X.call(n) === W;
    }
    function ee(e, t) {
      return g(t) ? t.join(e || "") : "";
    }
    const te = (e, t) => {
      const n = {};
      return (
        k((t, r) => {
          n[r] = e(t, r);
        }, t),
        n
      );
    };
    function ne(e, t) {
      if (m(t)) return [];
      return (g(t) ? L : te)(E(e), t);
    }
    function re() {
      return new Date().getTime();
    }
    const oe = (e, t, n) => n.reduce(e, t),
      ie = (e, t, n) => {
        let r = t;
        return (
          k((t, n) => {
            r = e(r, t, n);
          }, n),
          r
        );
      };
    function ce(e, t, n) {
      if (m(n)) return t;
      return (g(n) ? oe : ie)(E(e), t, n);
    }
    const { prototype: se } = Array,
      { reverse: ue } = se;
    function ae(e, t) {
      return $(t) ? [] : t.split(e || "");
    }
    function fe(e) {
      let t =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
      return setTimeout(e, Number(t) || 0);
    }
    function le(e) {
      clearTimeout(e);
    }
    const de = "on-device",
      pe = "server-side",
      he = "hybrid",
      me = "edge",
      ge = "local";
    function ve(e) {
      return void 0 === e;
    }
    const ye = () => {},
      be = (e) => Promise.resolve(e);
    function xe(e) {
      return !!e.execute && !!e.execute.pageLoad;
    }
    function we(e) {
      return (
        (!!e.execute && !!e.execute.mboxes && e.execute.mboxes.length) || 0
      );
    }
    function Se(e) {
      return !!e.prefetch && !!e.prefetch.pageLoad;
    }
    function Ee(e) {
      return (
        (!!e.prefetch && !!e.prefetch.mboxes && e.prefetch.mboxes.length) || 0
      );
    }
    function Te(e) {
      return (
        (!!e.prefetch && !!e.prefetch.views && e.prefetch.views.length) || 0
      );
    }
    function Ce(e) {
      let t =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 2;
      if (e && Z(e)) return +e.toFixed(t);
    }
    function ke() {
      let e = [];
      return {
        addEntry: function (t) {
          e.push(t);
        },
        getAndClearEntries: function () {
          const t = e;
          return (e = []), t;
        },
        hasEntries: function () {
          return e.length > 0;
        },
      };
    }
    var Ie =
      "undefined" != typeof globalThis
        ? globalThis
        : "undefined" != typeof window
        ? window
        : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
        ? self
        : {};
    var Ne = (function (e, t) {
      return e((t = { exports: {} }), t.exports), t.exports;
    })(function (e) {
      (function () {
        var t, n, r, o, i, c;
        "undefined" != typeof performance &&
        null !== performance &&
        performance.now
          ? (e.exports = function () {
              return performance.now();
            })
          : "undefined" != typeof process && null !== process && process.hrtime
          ? ((e.exports = function () {
              return (t() - i) / 1e6;
            }),
            (n = process.hrtime),
            (o = (t = function () {
              var e;
              return 1e9 * (e = n())[0] + e[1];
            })()),
            (c = 1e9 * process.uptime()),
            (i = o - c))
          : Date.now
          ? ((e.exports = function () {
              return Date.now() - r;
            }),
            (r = Date.now()))
          : ((e.exports = function () {
              return new Date().getTime() - r;
            }),
            (r = new Date().getTime()));
      }).call(Ie);
    });
    const Oe = (function () {
      let e = {},
        t = {},
        n = {};
      function r(t) {
        const n = (ve(e[t]) ? 0 : e[t]) + 1;
        return (e[t] = n), "" + t + n;
      }
      return {
        timeStart: function (e) {
          let n =
            arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
          const o = n ? r(e) : e;
          return ve(t[o]) && (t[o] = Ne()), o;
        },
        timeEnd: function (e) {
          let r =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
          if (ve(t[e])) return -1;
          const o = Ne() - t[e] - r;
          return (n[e] = o), o;
        },
        getTimings: () => n,
        getTiming: (e) => n[e],
        clearTiming: function (r) {
          delete e[r], delete t[r], delete n[r];
        },
        reset: function () {
          (e = {}), (t = {}), (n = {});
        },
      };
    })();
    var _e = function (e, t) {
      if (e) {
        t = t || {};
        for (
          var n = {
              key: [
                "source",
                "protocol",
                "authority",
                "userInfo",
                "user",
                "password",
                "host",
                "port",
                "relative",
                "path",
                "directory",
                "file",
                "query",
                "anchor",
              ],
              q: { name: "queryKey", parser: /(?:^|&)([^&=]*)=?([^&]*)/g },
              parser: {
                strict:
                  /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose:
                  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
              },
            },
            r = n.parser[t.strictMode ? "strict" : "loose"].exec(e),
            o = {},
            i = 14;
          i--;

        )
          o[n.key[i]] = r[i] || "";
        return (
          (o[n.q.name] = {}),
          o[n.key[12]].replace(n.q.parser, function (e, t, r) {
            t && (o[n.q.name][t] = r);
          }),
          o
        );
      }
    };
    const Ae = new Uint8Array(256),
      qe = (function () {
        const e = window.crypto || window.msCrypto;
        return (
          !m(e) &&
          e.getRandomValues &&
          w(e.getRandomValues) &&
          e.getRandomValues.bind(e)
        );
      })();
    function Me() {
      return qe(Ae);
    }
    const Pe = (function () {
      const e = [];
      for (let t = 0; t < 256; t += 1) e.push((t + 256).toString(16).substr(1));
      return e;
    })();
    function Re(e) {
      const t = e();
      return (
        (t[6] = (15 & t[6]) | 64),
        (t[8] = (63 & t[8]) | 128),
        (function (e) {
          const t = [];
          for (let n = 0; n < 16; n += 1) t.push(Pe[e[n]]);
          return ee("", t).toLowerCase();
        })(t)
      );
    }
    function De() {
      return Re(Me);
    }
    const Le = "type",
      je = "content",
      Ve = "selector",
      He = "src",
      Ue =
        'Adobe Target content delivery is disabled. Ensure that you can save cookies to your current domain, there is no "mboxDisable" cookie and there is no "mboxDisable" parameter in query string.',
      Be = "options argument is required",
      ze = "Action has no content",
      Fe = "No actions to be rendered",
      $e = "error",
      Je = "valid",
      Ze = "success",
      Ge = "___target_traces",
      Ke = "display";
    var Xe = document,
      Ye = window;
    const We = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
      Qe = /^(com|edu|gov|net|mil|org|nom|co|name|info|biz)$/i;
    let et = {};
    const tt = [
      "enabled",
      "clientCode",
      "imsOrgId",
      "serverDomain",
      "cookieDomain",
      "timeout",
      "mboxParams",
      "globalMboxParams",
      "defaultContentHiddenStyle",
      "defaultContentVisibleStyle",
      "deviceIdLifetime",
      "bodyHiddenStyle",
      "bodyHidingEnabled",
      "selectorsPollingTimeout",
      "visitorApiTimeout",
      "overrideMboxEdgeServer",
      "overrideMboxEdgeServerTimeout",
      "optoutEnabled",
      "optinEnabled",
      "secureOnly",
      "supplementalDataIdParamTimeout",
      "authoringScriptUrl",
      "urlSizeLimit",
      "endpoint",
      "pageLoadEnabled",
      "viewsEnabled",
      "analyticsLogging",
      "serverState",
      "decisioningMethod",
      "pollingInterval",
      "artifactLocation",
      "artifactFormat",
      "artifactPayload",
      "environment",
      "cdnEnvironment",
      "telemetryEnabled",
      "cdnBasePath",
      "cspScriptNonce",
      "cspStyleNonce",
      "globalMboxName",
    ];
    function nt(e) {
      if (
        (function (e) {
          return We.test(e);
        })(e)
      )
        return e;
      const t = null == (n = ae(".", e)) ? n : ue.call(n);
      var n;
      const r = t.length;
      return r >= 3 && Qe.test(t[1])
        ? t[2] + "." + t[1] + "." + t[0]
        : 1 === r
        ? t[0]
        : t[1] + "." + t[0];
    }
    function rt(e, t, n) {
      let r = "";
      "file:" === e.location.protocol || (r = nt(e.location.hostname)),
        (n.cookieDomain = r),
        (n.enabled =
          (function (e) {
            const { compatMode: t } = e;
            return t && "CSS1Compat" === t;
          })(t) &&
          (function (e) {
            const { documentMode: t } = e;
            return !t || t >= 10;
          })(t)),
        (function (e, t) {
          e.enabled &&
            (m(t.globalMboxAutoCreate) ||
              (e.pageLoadEnabled = t.globalMboxAutoCreate),
            q((n) => {
              m(t[n]) || (e[n] = t[n]);
            }, tt));
        })(n, e.targetGlobalSettings || {});
    }
    function ot(e) {
      rt(Ye, Xe, e);
      const t = "file:" === Ye.location.protocol;
      (et = h({}, e)),
        (et.deviceIdLifetime = e.deviceIdLifetime / 1e3),
        (et.sessionIdLifetime = e.sessionIdLifetime / 1e3),
        (et.scheme = et.secureOnly || t ? "https:" : "");
    }
    function it() {
      return et;
    }
    var ct = { exports: {} };
    /*!
     * JavaScript Cookie v2.2.1
     * https://github.com/js-cookie/js-cookie
     *
     * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
     * Released under the MIT license
     */ ct.exports = (function () {
      function e() {
        for (var e = 0, t = {}; e < arguments.length; e++) {
          var n = arguments[e];
          for (var r in n) t[r] = n[r];
        }
        return t;
      }
      function t(e) {
        return e.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
      }
      return (function n(r) {
        function o() {}
        function i(t, n, i) {
          if ("undefined" != typeof document) {
            "number" == typeof (i = e({ path: "/" }, o.defaults, i)).expires &&
              (i.expires = new Date(1 * new Date() + 864e5 * i.expires)),
              (i.expires = i.expires ? i.expires.toUTCString() : "");
            try {
              var c = JSON.stringify(n);
              /^[\{\[]/.test(c) && (n = c);
            } catch (e) {}
            (n = r.write
              ? r.write(n, t)
              : encodeURIComponent(String(n)).replace(
                  /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
                  decodeURIComponent
                )),
              (t = encodeURIComponent(String(t))
                .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
                .replace(/[\(\)]/g, escape));
            var s = "";
            for (var u in i)
              i[u] &&
                ((s += "; " + u),
                !0 !== i[u] && (s += "=" + i[u].split(";")[0]));
            return (document.cookie = t + "=" + n + s);
          }
        }
        function c(e, n) {
          if ("undefined" != typeof document) {
            for (
              var o = {},
                i = document.cookie ? document.cookie.split("; ") : [],
                c = 0;
              c < i.length;
              c++
            ) {
              var s = i[c].split("="),
                u = s.slice(1).join("=");
              n || '"' !== u.charAt(0) || (u = u.slice(1, -1));
              try {
                var a = t(s[0]);
                if (((u = (r.read || r)(u, a) || t(u)), n))
                  try {
                    u = JSON.parse(u);
                  } catch (e) {}
                if (((o[a] = u), e === a)) break;
              } catch (e) {}
            }
            return e ? o[e] : o;
          }
        }
        return (
          (o.set = i),
          (o.get = function (e) {
            return c(e, !1);
          }),
          (o.getJSON = function (e) {
            return c(e, !0);
          }),
          (o.remove = function (t, n) {
            i(t, "", e(n, { expires: -1 }));
          }),
          (o.defaults = {}),
          (o.withConverter = n),
          o
        );
      })(function () {});
    })();
    var st = ct.exports,
      ut = { get: st.get, set: st.set, remove: st.remove },
      at = {};
    function ft(e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }
    var lt = function (e) {
      switch (typeof e) {
        case "string":
          return e;
        case "boolean":
          return e ? "true" : "false";
        case "number":
          return isFinite(e) ? e : "";
        default:
          return "";
      }
    };
    (at.decode = at.parse =
      function (e, t, n, r) {
        (t = t || "&"), (n = n || "=");
        var o = {};
        if ("string" != typeof e || 0 === e.length) return o;
        var i = /\+/g;
        e = e.split(t);
        var c = 1e3;
        r && "number" == typeof r.maxKeys && (c = r.maxKeys);
        var s = e.length;
        c > 0 && s > c && (s = c);
        for (var u = 0; u < s; ++u) {
          var a,
            f,
            l,
            d,
            p = e[u].replace(i, "%20"),
            h = p.indexOf(n);
          h >= 0
            ? ((a = p.substr(0, h)), (f = p.substr(h + 1)))
            : ((a = p), (f = "")),
            (l = decodeURIComponent(a)),
            (d = decodeURIComponent(f)),
            ft(o, l)
              ? Array.isArray(o[l])
                ? o[l].push(d)
                : (o[l] = [o[l], d])
              : (o[l] = d);
        }
        return o;
      }),
      (at.encode = at.stringify =
        function (e, t, n, r) {
          return (
            (t = t || "&"),
            (n = n || "="),
            null === e && (e = void 0),
            "object" == typeof e
              ? Object.keys(e)
                  .map(function (r) {
                    var o = encodeURIComponent(lt(r)) + n;
                    return Array.isArray(e[r])
                      ? e[r]
                          .map(function (e) {
                            return o + encodeURIComponent(lt(e));
                          })
                          .join(t)
                      : o + encodeURIComponent(lt(e[r]));
                  })
                  .join(t)
              : r
              ? encodeURIComponent(lt(r)) + n + encodeURIComponent(lt(e))
              : ""
          );
        });
    var dt = at,
      pt = {
        parse: function (e) {
          return (
            "string" == typeof e && (e = e.trim().replace(/^[?#&]/, "")),
            dt.parse(e)
          );
        },
        stringify: function (e) {
          return dt.stringify(e);
        },
      };
    const { parse: ht, stringify: mt } = pt,
      gt = Xe.createElement("a"),
      vt = {};
    function yt(e) {
      try {
        return ht(e);
      } catch (e) {
        return {};
      }
    }
    function bt(e) {
      try {
        return mt(e);
      } catch (e) {
        return "";
      }
    }
    function xt(e) {
      try {
        return decodeURIComponent(e);
      } catch (t) {
        return e;
      }
    }
    function wt(e) {
      try {
        return encodeURIComponent(e);
      } catch (t) {
        return e;
      }
    }
    function St(e) {
      if (vt[e]) return vt[e];
      gt.href = e;
      const t = _e(gt.href);
      return (t.queryKey = yt(t.query)), (vt[e] = t), vt[e];
    }
    const { get: Et, set: Tt, remove: Ct } = ut;
    function kt(e, t, n) {
      return { name: e, value: t, expires: n };
    }
    function It(e) {
      const t = ae("#", e);
      return U(t) || t.length < 3 || isNaN(parseInt(t[2], 10))
        ? null
        : kt(xt(t[0]), xt(t[1]), Number(t[2]));
    }
    function Nt() {
      const e = ne(It, $((t = Et("mbox"))) ? [] : ae("|", t));
      var t;
      const n = Math.ceil(re() / 1e3);
      return ce(
        (e, t) => ((e[t.name] = t), e),
        {},
        O((e) => x(e) && n <= e.expires, e)
      );
    }
    function Ot(e) {
      const t = Nt()[e];
      return x(t) ? t.value : "";
    }
    function _t(e) {
      return ee("#", [wt(e.name), wt(e.value), e.expires]);
    }
    function At(e) {
      return e.expires;
    }
    function qt(e, t, n) {
      const r = j(e),
        o = Math.abs(
          1e3 *
            (function (e) {
              const t = ne(At, e);
              return Math.max.apply(null, t);
            })(r) -
            re()
        ),
        i = ee("|", ne(_t, r)),
        c = new Date(re() + o),
        s = h(
          { domain: t, expires: c, secure: n },
          n ? { sameSite: "None" } : {}
        );
      Tt("mbox", i, s);
    }
    function Mt(e) {
      const { name: t, value: n, expires: r, domain: o, secure: i } = e,
        c = Nt();
      (c[t] = kt(t, n, Math.ceil(r + re() / 1e3))), qt(c, o, i);
    }
    function Pt(e, t, n) {
      return (
        (function (e) {
          return J(Et(e));
        })(n) ||
        (function (e, t) {
          const { location: n } = e,
            { search: r } = n,
            o = yt(r);
          return J(o[t]);
        })(e, n) ||
        (function (e, t) {
          const { referrer: n } = e,
            r = St(n).queryKey;
          return !m(r) && J(r[t]);
        })(t, n)
      );
    }
    function Rt() {
      return (
        it().enabled &&
        (function () {
          const e = it(),
            t = e.cookieDomain,
            n = e.secureOnly,
            r = h({ domain: t, secure: n }, n ? { sameSite: "None" } : {});
          Tt("at_check", "true", r);
          const o = "true" === Et("at_check");
          return Ct("at_check"), o;
        })() &&
        !Pt(Ye, Xe, "mboxDisable")
      );
    }
    function Dt() {
      return Pt(Ye, Xe, "mboxDebug");
    }
    function Lt() {
      return Pt(Ye, Xe, "mboxEdit");
    }
    const jt = "AT:";
    function Vt(e, t) {
      const { console: n } = e;
      return !m(n) && w(n[t]);
    }
    function Ht(e, t) {
      const { console: n } = e;
      Vt(e, "warn") && n.warn.apply(n, [jt].concat(t));
    }
    function Ut(e, t) {
      const { console: n } = e;
      Vt(e, "debug") && Dt() && n.debug.apply(n, [jt].concat(t));
    }
    function Bt() {
      for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
        t[n] = arguments[n];
      Ht(Ye, t);
    }
    function zt() {
      for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
        t[n] = arguments[n];
      Ut(Ye, t);
    }
    function Ft(e, t, n) {
      const r = e[Ge] || [];
      if (((e[Ge] = r), !n)) return;
      const o = r.push;
      (r.version = "1"),
        (r.settings = (function (e) {
          return ce((t, n) => ((t[n] = e[n]), t), {}, tt);
        })(t)),
        (r.clientTraces = []),
        (r.serverTraces = []),
        (r.push = function (e) {
          r.serverTraces.push(h({ timestamp: re() }, e)), o.call(this, e);
        });
    }
    function $t(e, t, n, r) {
      "serverTraces" === t && e[Ge].push(n),
        r && "serverTraces" !== t && e[Ge][t].push(h({ timestamp: re() }, n));
    }
    function Jt(e) {
      $t(Ye, "serverTraces", e, Dt());
    }
    function Zt(e) {
      $t(Ye, "clientTraces", e, Dt());
    }
    var Gt = setTimeout;
    function Kt(e) {
      return Boolean(e && void 0 !== e.length);
    }
    function Xt() {}
    function Yt(e) {
      if (!(this instanceof Yt))
        throw new TypeError("Promises must be constructed via new");
      if ("function" != typeof e) throw new TypeError("not a function");
      (this._state = 0),
        (this._handled = !1),
        (this._value = void 0),
        (this._deferreds = []),
        rn(e, this);
    }
    function Wt(e, t) {
      for (; 3 === e._state; ) e = e._value;
      0 !== e._state
        ? ((e._handled = !0),
          Yt._immediateFn(function () {
            var n = 1 === e._state ? t.onFulfilled : t.onRejected;
            if (null !== n) {
              var r;
              try {
                r = n(e._value);
              } catch (e) {
                return void en(t.promise, e);
              }
              Qt(t.promise, r);
            } else (1 === e._state ? Qt : en)(t.promise, e._value);
          }))
        : e._deferreds.push(t);
    }
    function Qt(e, t) {
      try {
        if (t === e)
          throw new TypeError("A promise cannot be resolved with itself.");
        if (t && ("object" == typeof t || "function" == typeof t)) {
          var n = t.then;
          if (t instanceof Yt)
            return (e._state = 3), (e._value = t), void tn(e);
          if ("function" == typeof n)
            return void rn(
              ((r = n),
              (o = t),
              function () {
                r.apply(o, arguments);
              }),
              e
            );
        }
        (e._state = 1), (e._value = t), tn(e);
      } catch (t) {
        en(e, t);
      }
      var r, o;
    }
    function en(e, t) {
      (e._state = 2), (e._value = t), tn(e);
    }
    function tn(e) {
      2 === e._state &&
        0 === e._deferreds.length &&
        Yt._immediateFn(function () {
          e._handled || Yt._unhandledRejectionFn(e._value);
        });
      for (var t = 0, n = e._deferreds.length; t < n; t++)
        Wt(e, e._deferreds[t]);
      e._deferreds = null;
    }
    function nn(e, t, n) {
      (this.onFulfilled = "function" == typeof e ? e : null),
        (this.onRejected = "function" == typeof t ? t : null),
        (this.promise = n);
    }
    function rn(e, t) {
      var n = !1;
      try {
        e(
          function (e) {
            n || ((n = !0), Qt(t, e));
          },
          function (e) {
            n || ((n = !0), en(t, e));
          }
        );
      } catch (e) {
        if (n) return;
        (n = !0), en(t, e);
      }
    }
    (Yt.prototype["catch"] = function (e) {
      return this.then(null, e);
    }),
      (Yt.prototype.then = function (e, t) {
        var n = new this.constructor(Xt);
        return Wt(this, new nn(e, t, n)), n;
      }),
      (Yt.prototype.finally = function (e) {
        var t = this.constructor;
        return this.then(
          function (n) {
            return t.resolve(e()).then(function () {
              return n;
            });
          },
          function (n) {
            return t.resolve(e()).then(function () {
              return t.reject(n);
            });
          }
        );
      }),
      (Yt.all = function (e) {
        return new Yt(function (t, n) {
          if (!Kt(e)) return n(new TypeError("Promise.all accepts an array"));
          var r = Array.prototype.slice.call(e);
          if (0 === r.length) return t([]);
          var o = r.length;
          function i(e, c) {
            try {
              if (c && ("object" == typeof c || "function" == typeof c)) {
                var s = c.then;
                if ("function" == typeof s)
                  return void s.call(
                    c,
                    function (t) {
                      i(e, t);
                    },
                    n
                  );
              }
              (r[e] = c), 0 == --o && t(r);
            } catch (e) {
              n(e);
            }
          }
          for (var c = 0; c < r.length; c++) i(c, r[c]);
        });
      }),
      (Yt.resolve = function (e) {
        return e && "object" == typeof e && e.constructor === Yt
          ? e
          : new Yt(function (t) {
              t(e);
            });
      }),
      (Yt.reject = function (e) {
        return new Yt(function (t, n) {
          n(e);
        });
      }),
      (Yt.race = function (e) {
        return new Yt(function (t, n) {
          if (!Kt(e)) return n(new TypeError("Promise.race accepts an array"));
          for (var r = 0, o = e.length; r < o; r++) Yt.resolve(e[r]).then(t, n);
        });
      }),
      (Yt._immediateFn =
        ("function" == typeof setImmediate &&
          function (e) {
            setImmediate(e);
          }) ||
        function (e) {
          Gt(e, 0);
        }),
      (Yt._unhandledRejectionFn = function (e) {
        "undefined" != typeof console &&
          console &&
          console.warn("Possible Unhandled Promise Rejection:", e);
      });
    var on = a(Object.freeze({ __proto__: null, default: Yt })),
      cn =
        ("undefined" != typeof window && window.Promise) ||
        (void 0 !== u && u.Promise) ||
        on.default ||
        on,
      sn = (function (e) {
        var t = (function () {
          var t,
            n,
            r,
            o,
            i,
            c = [],
            s = c.concat,
            u = c.filter,
            a = c.slice,
            f = e.document,
            l = {},
            d = {},
            p = {
              "column-count": 1,
              columns: 1,
              "font-weight": 1,
              "line-height": 1,
              opacity: 1,
              "z-index": 1,
              zoom: 1,
            },
            h = /^\s*<(\w+|!)[^>]*>/,
            m = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
            g =
              /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            v = /^(?:body|html)$/i,
            y = /([A-Z])/g,
            b = [
              "val",
              "css",
              "html",
              "text",
              "data",
              "width",
              "height",
              "offset",
            ],
            x = f.createElement("table"),
            w = f.createElement("tr"),
            S = {
              tr: f.createElement("tbody"),
              tbody: x,
              thead: x,
              tfoot: x,
              td: w,
              th: w,
              "*": f.createElement("div"),
            },
            E = /complete|loaded|interactive/,
            T = /^[\w-]*$/,
            C = {},
            k = C.toString,
            I = {},
            N = f.createElement("div"),
            O = {
              tabindex: "tabIndex",
              readonly: "readOnly",
              for: "htmlFor",
              class: "className",
              maxlength: "maxLength",
              cellspacing: "cellSpacing",
              cellpadding: "cellPadding",
              rowspan: "rowSpan",
              colspan: "colSpan",
              usemap: "useMap",
              frameborder: "frameBorder",
              contenteditable: "contentEditable",
            },
            _ =
              Array.isArray ||
              function (e) {
                return e instanceof Array;
              };
          function A(e) {
            return null == e ? String(e) : C[k.call(e)] || "object";
          }
          function q(e) {
            return "function" == A(e);
          }
          function M(e) {
            return null != e && e == e.window;
          }
          function P(e) {
            return null != e && e.nodeType == e.DOCUMENT_NODE;
          }
          function R(e) {
            return "object" == A(e);
          }
          function D(e) {
            return (
              R(e) && !M(e) && Object.getPrototypeOf(e) == Object.prototype
            );
          }
          function L(e) {
            var t = !!e && "length" in e && e.length,
              r = n.type(e);
            return (
              "function" != r &&
              !M(e) &&
              ("array" == r ||
                0 === t ||
                ("number" == typeof t && t > 0 && t - 1 in e))
            );
          }
          function j(e) {
            return e
              .replace(/::/g, "/")
              .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
              .replace(/([a-z\d])([A-Z])/g, "$1_$2")
              .replace(/_/g, "-")
              .toLowerCase();
          }
          function V(e) {
            return e in d
              ? d[e]
              : (d[e] = new RegExp("(^|\\s)" + e + "(\\s|$)"));
          }
          function H(e, t) {
            return "number" != typeof t || p[j(e)] ? t : t + "px";
          }
          function U(e) {
            return "children" in e
              ? a.call(e.children)
              : n.map(e.childNodes, function (e) {
                  if (1 == e.nodeType) return e;
                });
          }
          function B(e, t) {
            var n,
              r = e ? e.length : 0;
            for (n = 0; n < r; n++) this[n] = e[n];
            (this.length = r), (this.selector = t || "");
          }
          function z(e, n, r) {
            for (t in n)
              r && (D(n[t]) || _(n[t]))
                ? (D(n[t]) && !D(e[t]) && (e[t] = {}),
                  _(n[t]) && !_(e[t]) && (e[t] = []),
                  z(e[t], n[t], r))
                : void 0 !== n[t] && (e[t] = n[t]);
          }
          function F(e, t) {
            return null == t ? n(e) : n(e).filter(t);
          }
          function $(e, t, n, r) {
            return q(t) ? t.call(e, n, r) : t;
          }
          function Z(e, t, n) {
            null == n ? e.removeAttribute(t) : e.setAttribute(t, n);
          }
          function G(e, t) {
            var n = e.className || "",
              r = n && void 0 !== n.baseVal;
            if (void 0 === t) return r ? n.baseVal : n;
            r ? (n.baseVal = t) : (e.className = t);
          }
          function K(e) {
            try {
              return e
                ? "true" == e ||
                    ("false" != e &&
                      ("null" == e
                        ? null
                        : +e + "" == e
                        ? +e
                        : /^[\[\{]/.test(e)
                        ? n.parseJSON(e)
                        : e))
                : e;
            } catch (t) {
              return e;
            }
          }
          function X(e, t) {
            t(e);
            for (var n = 0, r = e.childNodes.length; n < r; n++)
              X(e.childNodes[n], t);
          }
          function Y(e, t, n) {
            const r = e.getElementsByTagName("script")[0];
            if (!r) return;
            const o = r.parentNode;
            if (!o) return;
            const i = e.createElement("script");
            (i.innerHTML = t),
              J(n) && i.setAttribute("nonce", n),
              o.appendChild(i),
              o.removeChild(i);
          }
          return (
            (I.matches = function (e, t) {
              if (!t || !e || 1 !== e.nodeType) return !1;
              var n =
                e.matches ||
                e.webkitMatchesSelector ||
                e.mozMatchesSelector ||
                e.oMatchesSelector ||
                e.matchesSelector;
              if (n) return n.call(e, t);
              var r,
                o = e.parentNode,
                i = !o;
              return (
                i && (o = N).appendChild(e),
                (r = ~I.qsa(o, t).indexOf(e)),
                i && N.removeChild(e),
                r
              );
            }),
            (o = function (e) {
              return e.replace(/-+(.)?/g, function (e, t) {
                return t ? t.toUpperCase() : "";
              });
            }),
            (i = function (e) {
              return u.call(e, function (t, n) {
                return e.indexOf(t) == n;
              });
            }),
            (I.fragment = function (e, t, r) {
              var o, i, c;
              return (
                m.test(e) && (o = n(f.createElement(RegExp.$1))),
                o ||
                  (e.replace && (e = e.replace(g, "<$1></$2>")),
                  void 0 === t && (t = h.test(e) && RegExp.$1),
                  t in S || (t = "*"),
                  ((c = S[t]).innerHTML = "" + e),
                  (o = n.each(a.call(c.childNodes), function () {
                    c.removeChild(this);
                  }))),
                D(r) &&
                  ((i = n(o)),
                  n.each(r, function (e, t) {
                    b.indexOf(e) > -1 ? i[e](t) : i.attr(e, t);
                  })),
                o
              );
            }),
            (I.Z = function (e, t) {
              return new B(e, t);
            }),
            (I.isZ = function (e) {
              return e instanceof I.Z;
            }),
            (I.init = function (e, t) {
              var r, o;
              if (!e) return I.Z();
              if ("string" == typeof e)
                if ("<" == (e = e.trim())[0] && h.test(e))
                  (r = I.fragment(e, RegExp.$1, t)), (e = null);
                else {
                  if (void 0 !== t) return n(t).find(e);
                  r = I.qsa(f, e);
                }
              else {
                if (q(e)) return n(f).ready(e);
                if (I.isZ(e)) return e;
                if (_(e))
                  (o = e),
                    (r = u.call(o, function (e) {
                      return null != e;
                    }));
                else if (R(e)) (r = [e]), (e = null);
                else if (h.test(e))
                  (r = I.fragment(e.trim(), RegExp.$1, t)), (e = null);
                else {
                  if (void 0 !== t) return n(t).find(e);
                  r = I.qsa(f, e);
                }
              }
              return I.Z(r, e);
            }),
            ((n = function (e, t) {
              return I.init(e, t);
            }).extend = function (e) {
              var t,
                n = a.call(arguments, 1);
              return (
                "boolean" == typeof e && ((t = e), (e = n.shift())),
                n.forEach(function (n) {
                  z(e, n, t);
                }),
                e
              );
            }),
            (I.qsa = function (e, t) {
              var n,
                r = "#" == t[0],
                o = !r && "." == t[0],
                i = r || o ? t.slice(1) : t,
                c = T.test(i);
              return e.getElementById && c && r
                ? (n = e.getElementById(i))
                  ? [n]
                  : []
                : 1 !== e.nodeType && 9 !== e.nodeType && 11 !== e.nodeType
                ? []
                : a.call(
                    c && !r && e.getElementsByClassName
                      ? o
                        ? e.getElementsByClassName(i)
                        : e.getElementsByTagName(t)
                      : e.querySelectorAll(t)
                  );
            }),
            (n.contains = f.documentElement.contains
              ? function (e, t) {
                  return e !== t && e.contains(t);
                }
              : function (e, t) {
                  for (; t && (t = t.parentNode); ) if (t === e) return !0;
                  return !1;
                }),
            (n.type = A),
            (n.isFunction = q),
            (n.isWindow = M),
            (n.isArray = _),
            (n.isPlainObject = D),
            (n.isEmptyObject = function (e) {
              var t;
              for (t in e) return !1;
              return !0;
            }),
            (n.isNumeric = function (e) {
              var t = Number(e),
                n = typeof e;
              return (
                (null != e &&
                  "boolean" != n &&
                  ("string" != n || e.length) &&
                  !isNaN(t) &&
                  isFinite(t)) ||
                !1
              );
            }),
            (n.inArray = function (e, t, n) {
              return c.indexOf.call(t, e, n);
            }),
            (n.camelCase = o),
            (n.trim = function (e) {
              return null == e ? "" : String.prototype.trim.call(e);
            }),
            (n.uuid = 0),
            (n.support = {}),
            (n.expr = {}),
            (n.noop = function () {}),
            (n.map = function (e, t) {
              var r,
                o,
                i,
                c,
                s = [];
              if (L(e))
                for (o = 0; o < e.length; o++)
                  null != (r = t(e[o], o)) && s.push(r);
              else for (i in e) null != (r = t(e[i], i)) && s.push(r);
              return (c = s).length > 0 ? n.fn.concat.apply([], c) : c;
            }),
            (n.each = function (e, t) {
              var n, r;
              if (L(e)) {
                for (n = 0; n < e.length; n++)
                  if (!1 === t.call(e[n], n, e[n])) return e;
              } else for (r in e) if (!1 === t.call(e[r], r, e[r])) return e;
              return e;
            }),
            (n.grep = function (e, t) {
              return u.call(e, t);
            }),
            e.JSON && (n.parseJSON = JSON.parse),
            n.each(
              "Boolean Number String Function Array Date RegExp Object Error".split(
                " "
              ),
              function (e, t) {
                C["[object " + t + "]"] = t.toLowerCase();
              }
            ),
            (n.fn = {
              constructor: I.Z,
              length: 0,
              forEach: c.forEach,
              reduce: c.reduce,
              push: c.push,
              sort: c.sort,
              splice: c.splice,
              indexOf: c.indexOf,
              concat: function () {
                var e,
                  t,
                  n = [];
                for (e = 0; e < arguments.length; e++)
                  (t = arguments[e]), (n[e] = I.isZ(t) ? t.toArray() : t);
                return s.apply(I.isZ(this) ? this.toArray() : this, n);
              },
              map: function (e) {
                return n(
                  n.map(this, function (t, n) {
                    return e.call(t, n, t);
                  })
                );
              },
              slice: function () {
                return n(a.apply(this, arguments));
              },
              ready: function (e) {
                return (
                  E.test(f.readyState) && f.body
                    ? e(n)
                    : f.addEventListener(
                        "DOMContentLoaded",
                        function () {
                          e(n);
                        },
                        !1
                      ),
                  this
                );
              },
              get: function (e) {
                return void 0 === e
                  ? a.call(this)
                  : this[e >= 0 ? e : e + this.length];
              },
              toArray: function () {
                return this.get();
              },
              size: function () {
                return this.length;
              },
              remove: function () {
                return this.each(function () {
                  null != this.parentNode && this.parentNode.removeChild(this);
                });
              },
              each: function (e) {
                for (
                  var t, n = this.length, r = 0;
                  r < n && ((t = this[r]), !1 !== e.call(t, r, t));

                )
                  r++;
                return this;
              },
              filter: function (e) {
                return q(e)
                  ? this.not(this.not(e))
                  : n(
                      u.call(this, function (t) {
                        return I.matches(t, e);
                      })
                    );
              },
              add: function (e, t) {
                return n(i(this.concat(n(e, t))));
              },
              is: function (e) {
                return this.length > 0 && I.matches(this[0], e);
              },
              not: function (e) {
                var t = [];
                if (q(e) && void 0 !== e.call)
                  this.each(function (n) {
                    e.call(this, n) || t.push(this);
                  });
                else {
                  var r =
                    "string" == typeof e
                      ? this.filter(e)
                      : L(e) && q(e.item)
                      ? a.call(e)
                      : n(e);
                  this.forEach(function (e) {
                    r.indexOf(e) < 0 && t.push(e);
                  });
                }
                return n(t);
              },
              has: function (e) {
                return this.filter(function () {
                  return R(e) ? n.contains(this, e) : n(this).find(e).size();
                });
              },
              eq: function (e) {
                return -1 === e ? this.slice(e) : this.slice(e, +e + 1);
              },
              first: function () {
                var e = this[0];
                return e && !R(e) ? e : n(e);
              },
              last: function () {
                var e = this[this.length - 1];
                return e && !R(e) ? e : n(e);
              },
              find: function (e) {
                var t = this;
                return e
                  ? "object" == typeof e
                    ? n(e).filter(function () {
                        var e = this;
                        return c.some.call(t, function (t) {
                          return n.contains(t, e);
                        });
                      })
                    : 1 == this.length
                    ? n(I.qsa(this[0], e))
                    : this.map(function () {
                        return I.qsa(this, e);
                      })
                  : n();
              },
              closest: function (e, t) {
                var r = [],
                  o = "object" == typeof e && n(e);
                return (
                  this.each(function (n, i) {
                    for (; i && !(o ? o.indexOf(i) >= 0 : I.matches(i, e)); )
                      i = i !== t && !P(i) && i.parentNode;
                    i && r.indexOf(i) < 0 && r.push(i);
                  }),
                  n(r)
                );
              },
              parents: function (e) {
                for (var t = [], r = this; r.length > 0; )
                  r = n.map(r, function (e) {
                    if ((e = e.parentNode) && !P(e) && t.indexOf(e) < 0)
                      return t.push(e), e;
                  });
                return F(t, e);
              },
              parent: function (e) {
                return F(i(this.pluck("parentNode")), e);
              },
              children: function (e) {
                return F(
                  this.map(function () {
                    return U(this);
                  }),
                  e
                );
              },
              contents: function () {
                return this.map(function () {
                  return this.contentDocument || a.call(this.childNodes);
                });
              },
              siblings: function (e) {
                return F(
                  this.map(function (e, t) {
                    return u.call(U(t.parentNode), function (e) {
                      return e !== t;
                    });
                  }),
                  e
                );
              },
              empty: function () {
                return this.each(function () {
                  this.innerHTML = "";
                });
              },
              pluck: function (e) {
                return n.map(this, function (t) {
                  return t[e];
                });
              },
              show: function () {
                return this.each(function () {
                  var e, t, n;
                  "none" == this.style.display && (this.style.display = ""),
                    "none" ==
                      getComputedStyle(this, "").getPropertyValue("display") &&
                      (this.style.display =
                        ((e = this.nodeName),
                        l[e] ||
                          ((t = f.createElement(e)),
                          f.body.appendChild(t),
                          (n = getComputedStyle(t, "").getPropertyValue(
                            "display"
                          )),
                          t.parentNode.removeChild(t),
                          "none" == n && (n = "block"),
                          (l[e] = n)),
                        l[e]));
                });
              },
              replaceWith: function (e) {
                return this.before(e).remove();
              },
              wrap: function (e) {
                var t = q(e);
                if (this[0] && !t)
                  var r = n(e).get(0),
                    o = r.parentNode || this.length > 1;
                return this.each(function (i) {
                  n(this).wrapAll(
                    t ? e.call(this, i) : o ? r.cloneNode(!0) : r
                  );
                });
              },
              wrapAll: function (e) {
                if (this[0]) {
                  var t;
                  for (
                    n(this[0]).before((e = n(e)));
                    (t = e.children()).length;

                  )
                    e = t.first();
                  n(e).append(this);
                }
                return this;
              },
              wrapInner: function (e) {
                var t = q(e);
                return this.each(function (r) {
                  var o = n(this),
                    i = o.contents(),
                    c = t ? e.call(this, r) : e;
                  i.length ? i.wrapAll(c) : o.append(c);
                });
              },
              unwrap: function () {
                return (
                  this.parent().each(function () {
                    n(this).replaceWith(n(this).children());
                  }),
                  this
                );
              },
              clone: function () {
                return this.map(function () {
                  return this.cloneNode(!0);
                });
              },
              hide: function () {
                return this.css("display", "none");
              },
              toggle: function (e) {
                return this.each(function () {
                  var t = n(this);
                  (void 0 === e ? "none" == t.css("display") : e)
                    ? t.show()
                    : t.hide();
                });
              },
              prev: function (e) {
                return n(this.pluck("previousElementSibling")).filter(e || "*");
              },
              next: function (e) {
                return n(this.pluck("nextElementSibling")).filter(e || "*");
              },
              html: function (e) {
                return 0 in arguments
                  ? this.each(function (t) {
                      var r = this.innerHTML;
                      n(this).empty().append($(this, e, t, r));
                    })
                  : 0 in this
                  ? this[0].innerHTML
                  : null;
              },
              text: function (e) {
                return 0 in arguments
                  ? this.each(function (t) {
                      var n = $(this, e, t, this.textContent);
                      this.textContent = null == n ? "" : "" + n;
                    })
                  : 0 in this
                  ? this.pluck("textContent").join("")
                  : null;
              },
              attr: function (e, n) {
                var r;
                return "string" != typeof e || 1 in arguments
                  ? this.each(function (r) {
                      if (1 === this.nodeType)
                        if (R(e)) for (t in e) Z(this, t, e[t]);
                        else Z(this, e, $(this, n, r, this.getAttribute(e)));
                    })
                  : 0 in this &&
                    1 == this[0].nodeType &&
                    null != (r = this[0].getAttribute(e))
                  ? r
                  : void 0;
              },
              removeAttr: function (e) {
                return this.each(function () {
                  1 === this.nodeType &&
                    e.split(" ").forEach(function (e) {
                      Z(this, e);
                    }, this);
                });
              },
              prop: function (e, t) {
                return (
                  (e = O[e] || e),
                  1 in arguments
                    ? this.each(function (n) {
                        this[e] = $(this, t, n, this[e]);
                      })
                    : this[0] && this[0][e]
                );
              },
              removeProp: function (e) {
                return (
                  (e = O[e] || e),
                  this.each(function () {
                    delete this[e];
                  })
                );
              },
              data: function (e, t) {
                var n = "data-" + e.replace(y, "-$1").toLowerCase(),
                  r = 1 in arguments ? this.attr(n, t) : this.attr(n);
                return null !== r ? K(r) : void 0;
              },
              val: function (e) {
                return 0 in arguments
                  ? (null == e && (e = ""),
                    this.each(function (t) {
                      this.value = $(this, e, t, this.value);
                    }))
                  : this[0] &&
                      (this[0].multiple
                        ? n(this[0])
                            .find("option")
                            .filter(function () {
                              return this.selected;
                            })
                            .pluck("value")
                        : this[0].value);
              },
              offset: function (t) {
                if (t)
                  return this.each(function (e) {
                    var r = n(this),
                      o = $(this, t, e, r.offset()),
                      i = r.offsetParent().offset(),
                      c = { top: o.top - i.top, left: o.left - i.left };
                    "static" == r.css("position") && (c.position = "relative"),
                      r.css(c);
                  });
                if (!this.length) return null;
                if (
                  f.documentElement !== this[0] &&
                  !n.contains(f.documentElement, this[0])
                )
                  return { top: 0, left: 0 };
                var r = this[0].getBoundingClientRect();
                return {
                  left: r.left + e.pageXOffset,
                  top: r.top + e.pageYOffset,
                  width: Math.round(r.width),
                  height: Math.round(r.height),
                };
              },
              css: function (e, r) {
                if (arguments.length < 2) {
                  var i = this[0];
                  if ("string" == typeof e) {
                    if (!i) return;
                    return (
                      i.style[o(e)] ||
                      getComputedStyle(i, "").getPropertyValue(e)
                    );
                  }
                  if (_(e)) {
                    if (!i) return;
                    var c = {},
                      s = getComputedStyle(i, "");
                    return (
                      n.each(e, function (e, t) {
                        c[t] = i.style[o(t)] || s.getPropertyValue(t);
                      }),
                      c
                    );
                  }
                }
                var u = "";
                if ("string" == A(e))
                  r || 0 === r
                    ? (u = j(e) + ":" + H(e, r))
                    : this.each(function () {
                        this.style.removeProperty(j(e));
                      });
                else
                  for (t in e)
                    e[t] || 0 === e[t]
                      ? (u += j(t) + ":" + H(t, e[t]) + ";")
                      : this.each(function () {
                          this.style.removeProperty(j(t));
                        });
                return this.each(function () {
                  this.style.cssText += ";" + u;
                });
              },
              index: function (e) {
                return e
                  ? this.indexOf(n(e)[0])
                  : this.parent().children().indexOf(this[0]);
              },
              hasClass: function (e) {
                return (
                  !!e &&
                  c.some.call(
                    this,
                    function (e) {
                      return this.test(G(e));
                    },
                    V(e)
                  )
                );
              },
              addClass: function (e) {
                return e
                  ? this.each(function (t) {
                      if ("className" in this) {
                        r = [];
                        var o = G(this);
                        $(this, e, t, o)
                          .split(/\s+/g)
                          .forEach(function (e) {
                            n(this).hasClass(e) || r.push(e);
                          }, this),
                          r.length && G(this, o + (o ? " " : "") + r.join(" "));
                      }
                    })
                  : this;
              },
              removeClass: function (e) {
                return this.each(function (t) {
                  if ("className" in this) {
                    if (void 0 === e) return G(this, "");
                    (r = G(this)),
                      $(this, e, t, r)
                        .split(/\s+/g)
                        .forEach(function (e) {
                          r = r.replace(V(e), " ");
                        }),
                      G(this, r.trim());
                  }
                });
              },
              toggleClass: function (e, t) {
                return e
                  ? this.each(function (r) {
                      var o = n(this);
                      $(this, e, r, G(this))
                        .split(/\s+/g)
                        .forEach(function (e) {
                          (void 0 === t ? !o.hasClass(e) : t)
                            ? o.addClass(e)
                            : o.removeClass(e);
                        });
                    })
                  : this;
              },
              scrollTop: function (e) {
                if (this.length) {
                  var t = "scrollTop" in this[0];
                  return void 0 === e
                    ? t
                      ? this[0].scrollTop
                      : this[0].pageYOffset
                    : this.each(
                        t
                          ? function () {
                              this.scrollTop = e;
                            }
                          : function () {
                              this.scrollTo(this.scrollX, e);
                            }
                      );
                }
              },
              scrollLeft: function (e) {
                if (this.length) {
                  var t = "scrollLeft" in this[0];
                  return void 0 === e
                    ? t
                      ? this[0].scrollLeft
                      : this[0].pageXOffset
                    : this.each(
                        t
                          ? function () {
                              this.scrollLeft = e;
                            }
                          : function () {
                              this.scrollTo(e, this.scrollY);
                            }
                      );
                }
              },
              position: function () {
                if (this.length) {
                  var e = this[0],
                    t = this.offsetParent(),
                    r = this.offset(),
                    o = v.test(t[0].nodeName)
                      ? { top: 0, left: 0 }
                      : t.offset();
                  return (
                    (r.top -= parseFloat(n(e).css("margin-top")) || 0),
                    (r.left -= parseFloat(n(e).css("margin-left")) || 0),
                    (o.top += parseFloat(n(t[0]).css("border-top-width")) || 0),
                    (o.left +=
                      parseFloat(n(t[0]).css("border-left-width")) || 0),
                    { top: r.top - o.top, left: r.left - o.left }
                  );
                }
              },
              offsetParent: function () {
                return this.map(function () {
                  for (
                    var e = this.offsetParent || f.body;
                    e &&
                    !v.test(e.nodeName) &&
                    "static" == n(e).css("position");

                  )
                    e = e.offsetParent;
                  return e;
                });
              },
            }),
            (n.fn.detach = n.fn.remove),
            ["width", "height"].forEach(function (e) {
              var t = e.replace(/./, function (e) {
                return e[0].toUpperCase();
              });
              n.fn[e] = function (r) {
                var o,
                  i = this[0];
                return void 0 === r
                  ? M(i)
                    ? i["inner" + t]
                    : P(i)
                    ? i.documentElement["scroll" + t]
                    : (o = this.offset()) && o[e]
                  : this.each(function (t) {
                      (i = n(this)).css(e, $(this, r, t, i[e]()));
                    });
              };
            }),
            ["after", "prepend", "before", "append"].forEach(function (e, t) {
              var r = t % 2;
              (n.fn[e] = function () {
                var e,
                  o,
                  i = n.map(arguments, function (t) {
                    var r = [];
                    return "array" == (e = A(t))
                      ? (t.forEach(function (e) {
                          return void 0 !== e.nodeType
                            ? r.push(e)
                            : n.zepto.isZ(e)
                            ? (r = r.concat(e.get()))
                            : void (r = r.concat(I.fragment(e)));
                        }),
                        r)
                      : "object" == e || null == t
                      ? t
                      : I.fragment(t);
                  }),
                  c = this.length > 1;
                return i.length < 1
                  ? this
                  : this.each(function (e, s) {
                      (o = r ? s : s.parentNode),
                        (s =
                          0 == t
                            ? s.nextSibling
                            : 1 == t
                            ? s.firstChild
                            : 2 == t
                            ? s
                            : null);
                      const u = n.contains(f.documentElement, o),
                        a = /^(text|application)\/(javascript|ecmascript)$/,
                        l = it(),
                        d = l.cspScriptNonce,
                        p = l.cspStyleNonce;
                      i.forEach(function (e) {
                        if (c) e = e.cloneNode(!0);
                        else if (!o) return n(e).remove();
                        J(d) &&
                          "SCRIPT" === e.tagName &&
                          e.setAttribute("nonce", d),
                          J(p) &&
                            "STYLE" === e.tagName &&
                            e.setAttribute("nonce", p),
                          o.insertBefore(e, s),
                          u &&
                            X(e, function (e) {
                              null == e.nodeName ||
                                "SCRIPT" !== e.nodeName.toUpperCase() ||
                                (e.type && !a.test(e.type.toLowerCase())) ||
                                e.src ||
                                Y(f, e.innerHTML, e.nonce);
                            });
                      });
                    });
              }),
                (n.fn[r ? e + "To" : "insert" + (t ? "Before" : "After")] =
                  function (t) {
                    return n(t)[e](this), this;
                  });
            }),
            (I.Z.prototype = B.prototype = n.fn),
            (I.uniq = i),
            (I.deserializeValue = K),
            (n.zepto = I),
            n
          );
        })();
        return (
          (function (t) {
            var n = 1,
              r = Array.prototype.slice,
              o = t.isFunction,
              i = function (e) {
                return "string" == typeof e;
              },
              c = {},
              s = {},
              u = "onfocusin" in e,
              a = { focus: "focusin", blur: "focusout" },
              f = { mouseenter: "mouseover", mouseleave: "mouseout" };
            function l(e) {
              return e._zid || (e._zid = n++);
            }
            function d(e, t, n, r) {
              if ((t = p(t)).ns)
                var o =
                  ((i = t.ns),
                  new RegExp("(?:^| )" + i.replace(" ", " .* ?") + "(?: |$)"));
              var i;
              return (c[l(e)] || []).filter(function (e) {
                return (
                  e &&
                  (!t.e || e.e == t.e) &&
                  (!t.ns || o.test(e.ns)) &&
                  (!n || l(e.fn) === l(n)) &&
                  (!r || e.sel == r)
                );
              });
            }
            function p(e) {
              var t = ("" + e).split(".");
              return { e: t[0], ns: t.slice(1).sort().join(" ") };
            }
            function h(e, t) {
              return (e.del && !u && e.e in a) || !!t;
            }
            function m(e) {
              return f[e] || (u && a[e]) || e;
            }
            function g(e, n, r, o, i, s, u) {
              var a = l(e),
                d = c[a] || (c[a] = []);
              n.split(/\s/).forEach(function (n) {
                if ("ready" == n) return t(document).ready(r);
                var c = p(n);
                (c.fn = r),
                  (c.sel = i),
                  c.e in f &&
                    (r = function (e) {
                      var n = e.relatedTarget;
                      if (!n || (n !== this && !t.contains(this, n)))
                        return c.fn.apply(this, arguments);
                    }),
                  (c.del = s);
                var a = s || r;
                (c.proxy = function (t) {
                  if (!(t = S(t)).isImmediatePropagationStopped()) {
                    t.data = o;
                    var n = a.apply(
                      e,
                      null == t._args ? [t] : [t].concat(t._args)
                    );
                    return (
                      !1 === n && (t.preventDefault(), t.stopPropagation()), n
                    );
                  }
                }),
                  (c.i = d.length),
                  d.push(c),
                  "addEventListener" in e &&
                    e.addEventListener(m(c.e), c.proxy, h(c, u));
              });
            }
            function v(e, t, n, r, o) {
              var i = l(e);
              (t || "").split(/\s/).forEach(function (t) {
                d(e, t, n, r).forEach(function (t) {
                  delete c[i][t.i],
                    "removeEventListener" in e &&
                      e.removeEventListener(m(t.e), t.proxy, h(t, o));
                });
              });
            }
            (s.click = s.mousedown = s.mouseup = s.mousemove = "MouseEvents"),
              (t.event = { add: g, remove: v }),
              (t.proxy = function (e, n) {
                var c = 2 in arguments && r.call(arguments, 2);
                if (o(e)) {
                  var s = function () {
                    return e.apply(
                      n,
                      c ? c.concat(r.call(arguments)) : arguments
                    );
                  };
                  return (s._zid = l(e)), s;
                }
                if (i(n))
                  return c
                    ? (c.unshift(e[n], e), t.proxy.apply(null, c))
                    : t.proxy(e[n], e);
                throw new TypeError("expected function");
              }),
              (t.fn.bind = function (e, t, n) {
                return this.on(e, t, n);
              }),
              (t.fn.unbind = function (e, t) {
                return this.off(e, t);
              }),
              (t.fn.one = function (e, t, n, r) {
                return this.on(e, t, n, r, 1);
              });
            var y = function () {
                return !0;
              },
              b = function () {
                return !1;
              },
              x = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
              w = {
                preventDefault: "isDefaultPrevented",
                stopImmediatePropagation: "isImmediatePropagationStopped",
                stopPropagation: "isPropagationStopped",
              };
            function S(e, n) {
              if (n || !e.isDefaultPrevented) {
                n || (n = e),
                  t.each(w, function (t, r) {
                    var o = n[t];
                    (e[t] = function () {
                      return (this[r] = y), o && o.apply(n, arguments);
                    }),
                      (e[r] = b);
                  });
                try {
                  e.timeStamp || (e.timeStamp = new Date().getTime());
                } catch (e) {}
                (void 0 !== n.defaultPrevented
                  ? n.defaultPrevented
                  : "returnValue" in n
                  ? !1 === n.returnValue
                  : n.getPreventDefault && n.getPreventDefault()) &&
                  (e.isDefaultPrevented = y);
              }
              return e;
            }
            function E(e) {
              var t,
                n = { originalEvent: e };
              for (t in e) x.test(t) || void 0 === e[t] || (n[t] = e[t]);
              return S(n, e);
            }
            (t.fn.delegate = function (e, t, n) {
              return this.on(t, e, n);
            }),
              (t.fn.undelegate = function (e, t, n) {
                return this.off(t, e, n);
              }),
              (t.fn.live = function (e, n) {
                return t(document.body).delegate(this.selector, e, n), this;
              }),
              (t.fn.die = function (e, n) {
                return t(document.body).undelegate(this.selector, e, n), this;
              }),
              (t.fn.on = function (e, n, c, s, u) {
                var a,
                  f,
                  l = this;
                return e && !i(e)
                  ? (t.each(e, function (e, t) {
                      l.on(e, n, c, t, u);
                    }),
                    l)
                  : (i(n) ||
                      o(s) ||
                      !1 === s ||
                      ((s = c), (c = n), (n = void 0)),
                    (void 0 !== s && !1 !== c) || ((s = c), (c = void 0)),
                    !1 === s && (s = b),
                    l.each(function (o, i) {
                      u &&
                        (a = function (e) {
                          return v(i, e.type, s), s.apply(this, arguments);
                        }),
                        n &&
                          (f = function (e) {
                            var o,
                              c = t(e.target).closest(n, i).get(0);
                            if (c && c !== i)
                              return (
                                (o = t.extend(E(e), {
                                  currentTarget: c,
                                  liveFired: i,
                                })),
                                (a || s).apply(
                                  c,
                                  [o].concat(r.call(arguments, 1))
                                )
                              );
                          }),
                        g(i, e, s, c, n, f || a);
                    }));
              }),
              (t.fn.off = function (e, n, r) {
                var c = this;
                return e && !i(e)
                  ? (t.each(e, function (e, t) {
                      c.off(e, n, t);
                    }),
                    c)
                  : (i(n) || o(r) || !1 === r || ((r = n), (n = void 0)),
                    !1 === r && (r = b),
                    c.each(function () {
                      v(this, e, r, n);
                    }));
              }),
              (t.fn.trigger = function (e, n) {
                return (
                  ((e = i(e) || t.isPlainObject(e) ? t.Event(e) : S(e))._args =
                    n),
                  this.each(function () {
                    e.type in a && "function" == typeof this[e.type]
                      ? this[e.type]()
                      : "dispatchEvent" in this
                      ? this.dispatchEvent(e)
                      : t(this).triggerHandler(e, n);
                  })
                );
              }),
              (t.fn.triggerHandler = function (e, n) {
                var r, o;
                return (
                  this.each(function (c, s) {
                    ((r = E(i(e) ? t.Event(e) : e))._args = n),
                      (r.target = s),
                      t.each(d(s, e.type || e), function (e, t) {
                        if (
                          ((o = t.proxy(r)), r.isImmediatePropagationStopped())
                        )
                          return !1;
                      });
                  }),
                  o
                );
              }),
              "focusin focusout focus blur load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error"
                .split(" ")
                .forEach(function (e) {
                  t.fn[e] = function (t) {
                    return 0 in arguments ? this.bind(e, t) : this.trigger(e);
                  };
                }),
              (t.Event = function (e, t) {
                i(e) || (e = (t = e).type);
                var n = document.createEvent(s[e] || "Events"),
                  r = !0;
                if (t)
                  for (var o in t)
                    "bubbles" == o ? (r = !!t[o]) : (n[o] = t[o]);
                return n.initEvent(e, r, !0), S(n);
              });
          })(t),
          (function () {
            try {
              getComputedStyle(void 0);
            } catch (n) {
              var t = getComputedStyle;
              e.getComputedStyle = function (e, n) {
                try {
                  return t(e, n);
                } catch (e) {
                  return null;
                }
              };
            }
          })(),
          (function (e) {
            var t = e.zepto,
              n = t.qsa,
              r = /^\s*>/,
              o = "Zepto" + +new Date(),
              i = function (t, i) {
                var c,
                  s,
                  u = i;
                try {
                  u
                    ? r.test(u) &&
                      ((s = e(t).addClass(o)), (u = "." + o + " " + u))
                    : (u = "*"),
                    (c = n(t, u));
                } catch (e) {
                  throw e;
                } finally {
                  s && s.removeClass(o);
                }
                return c;
              };
            t.qsa = function (e, t) {
              var n = t.split(":shadow");
              if (n.length < 2) return i(e, t);
              for (var r = e, o = 0; o < n.length; o++) {
                var c = n[o].trim();
                if (0 === c.indexOf(">")) {
                  var s = ":host ";
                  (r instanceof Element || r instanceof HTMLDocument) &&
                    (s = ":scope "),
                    (c = s + c);
                }
                var u = i(r, c);
                if (0 === u.length || !u[0] || !u[0].shadowRoot) return u;
                r = u[0].shadowRoot;
              }
            };
          })(t),
          t
        );
      })(window);
    const un = Ye.MutationObserver || Ye.WebkitMutationObserver;
    function an() {
      return w(un);
    }
    function fn(e) {
      return new un(e);
    }
    function ln() {
      const e = Xe.createTextNode(""),
        t = [];
      return (
        fn(() => {
          const e = t.length;
          for (let n = 0; n < e; n += 1) t[n]();
          t.splice(0, e);
        }).observe(e, { characterData: !0 }),
        (n) => {
          t.push(n), (e.textContent = e.textContent.length > 0 ? "" : "a");
        }
      );
    }
    function dn(e) {
      return new cn(e);
    }
    function pn(e) {
      return cn.resolve(e);
    }
    function hn(e) {
      return cn.reject(e);
    }
    function mn(e) {
      return g(e)
        ? cn.all(e)
        : hn(new TypeError("Expected an array of promises"));
    }
    function gn(e, t, n) {
      let r = -1;
      const o = dn((e, o) => {
        r = fe(() => o(new Error(n)), t);
      });
      return ((i = [e, o]),
      g(i)
        ? cn.race(i)
        : hn(new TypeError("Expected an array of promises"))).then(
        (e) => (le(r), e),
        (e) => {
          throw (le(r), e);
        }
      );
      var i;
    }
    function vn(e) {
      if (m(e.adobe)) return !1;
      const t = e.adobe;
      if (m(t.optIn)) return !1;
      const n = t.optIn;
      return w(n.fetchPermissions) && w(n.isApproved);
    }
    function yn(e, t) {
      if (!vn(e)) return !0;
      const n = e.adobe.optIn,
        r = (e.adobe.optIn.Categories || {})[t];
      return n.isApproved(r);
    }
    function bn() {
      const e = it().optinEnabled;
      return (function (e, t) {
        return !!t && vn(e);
      })(Ye, e);
    }
    function xn() {
      return yn(Ye, "TARGET");
    }
    function wn() {
      return (function (e, t) {
        if (!vn(e)) return pn(!0);
        const n = e.adobe.optIn,
          r = (e.adobe.optIn.Categories || {})[t];
        return dn((e, t) => {
          n.fetchPermissions(() => {
            n.isApproved(r) ? e(!0) : t("Adobe Target is not opted in");
          }, !0);
        });
      })(Ye, "TARGET");
    }
    cn._setImmediateFn &&
      (an()
        ? cn._setImmediateFn(ln())
        : -1 !== Ye.navigator.userAgent.indexOf("MSIE 10") &&
          cn._setImmediateFn((e) => {
            let t = sn("<script>");
            t.on("readystatechange", () => {
              t.on("readystatechange", null), t.remove(), (t = null), e();
            }),
              sn(Xe.documentElement).append(t);
          }));
    const Sn = De();
    function En(e) {
      !(function (e, t) {
        Mt({
          name: "session",
          value: e,
          expires: t.sessionIdLifetime,
          domain: t.cookieDomain,
          secure: t.secureOnly,
        });
      })(e, it());
    }
    function Tn() {
      if (bn() && !xn()) return Sn;
      const e = (function () {
        const { location: e } = Ye,
          { search: t } = e;
        return yt(t).mboxSession;
      })();
      if (J(e)) return En(e), Ot("session");
      const t = Ot("session");
      return $(t) ? En(Sn) : En(t), Ot("session");
    }
    function Cn() {
      return Ot("PC");
    }
    const kn = /.*\.(\d+)_\d+/;
    function In(e) {
      const t = it();
      if (!t.overrideMboxEdgeServer) return;
      const n = t.cookieDomain,
        r = new Date(re() + t.overrideMboxEdgeServerTimeout),
        o = t.secureOnly,
        i = Et("mboxEdgeCluster"),
        c = h(
          { domain: n, expires: r, secure: o },
          o ? { sameSite: "None" } : {}
        );
      if (J(i)) return void Tt("mboxEdgeCluster", i, c);
      const s = (function (e) {
        if ($(e)) return "";
        const t = kn.exec(e);
        return U(t) || 2 !== t.length ? "" : t[1];
      })(e);
      $(s) || Tt("mboxEdgeCluster", s, c);
    }
    function Nn(e, t, n, r) {
      const o = new e.CustomEvent(n, { detail: r });
      t.dispatchEvent(o);
    }
    !(function (e, t) {
      function n(e, n) {
        const r = t.createEvent("CustomEvent");
        return (
          (n = n || { bubbles: !1, cancelable: !1, detail: void 0 }),
          r.initCustomEvent(e, n.bubbles, n.cancelable, n.detail),
          r
        );
      }
      w(e.CustomEvent) ||
        ((n.prototype = e.Event.prototype), (e.CustomEvent = n));
    })(Ye, Xe);
    function On(e, t) {
      const {
          mbox: n,
          error: r,
          url: o,
          analyticsDetails: i,
          responseTokens: c,
          execution: s,
        } = t,
        u = {
          type: e,
          tracking: (function (e, t) {
            const n = e(),
              r = t(),
              o = {};
            return (o.sessionId = n), J(r) ? ((o.deviceId = r), o) : o;
          })(Tn, Cn),
        };
      return (
        m(n) || (u.mbox = n),
        m(r) || (u.error = r),
        m(o) || (u.url = o),
        U(i) || (u.analyticsDetails = i),
        U(c) || (u.responseTokens = c),
        U(s) || (u.execution = s),
        u
      );
    }
    function _n(e) {
      const t = On("at-request-start", e);
      Nn(Ye, Xe, "at-request-start", t);
    }
    function An(e, t) {
      const n = On("at-request-succeeded", e);
      (n.redirect = t), Nn(Ye, Xe, "at-request-succeeded", n);
    }
    function qn(e) {
      const t = On("at-request-failed", e);
      Nn(Ye, Xe, "at-request-failed", t);
    }
    function Mn(e) {
      const t = On("at-content-rendering-start", e);
      Nn(Ye, Xe, "at-content-rendering-start", t);
    }
    function Pn(e) {
      const t = On("at-content-rendering-succeeded", e);
      Nn(Ye, Xe, "at-content-rendering-succeeded", t);
    }
    function Rn(e) {
      const t = On("at-content-rendering-failed", e);
      Nn(Ye, Xe, "at-content-rendering-failed", t);
    }
    function Dn(e) {
      const t = On("at-content-rendering-no-offers", e);
      Nn(Ye, Xe, "at-content-rendering-no-offers", t);
    }
    function Ln(e) {
      const t = On("at-content-rendering-redirect", e);
      Nn(Ye, Xe, "at-content-rendering-redirect", t);
    }
    var jn = cn,
      Vn = function (e) {
        var t = document.createElement("script");
        (t.src = e), (t.async = !0);
        var n = (function (e, t) {
          return new jn(function (n, r) {
            (t.onload = function () {
              n(t);
            }),
              (t.onerror = function () {
                r(new Error("Failed to load script " + e));
              });
          });
        })(e, t);
        return document.getElementsByTagName("head")[0].appendChild(t), n;
      };
    function Hn(e) {
      return M(e) && 1 === e.nodeType && !Q(e);
    }
    const Un = ":eq(".length,
      Bn = /((\.|#)(-)?\d{1})/g;
    function zn(e) {
      const t = e.charAt(0),
        n = e.charAt(1),
        r = e.charAt(2),
        o = { key: e };
      return (
        (o.val =
          "-" === n ? "" + t + n + "\\3" + r + " " : t + "\\3" + n + " "),
        o
      );
    }
    function Fn(e) {
      if (Hn(e)) return sn(e);
      if (!P(e)) return sn(e);
      const t = (function (e) {
        const t = e.match(Bn);
        return U(t) ? e : ce((e, t) => e.replace(t.key, t.val), e, ne(zn, t));
      })(e);
      if (-1 === t.indexOf(":eq(")) return sn(t);
      const n = (function (e) {
        const t = [];
        let n,
          r,
          o,
          i,
          c = F(e),
          s = c.indexOf(":eq(");
        for (; -1 !== s; )
          (n = F(c.substring(0, s))),
            (r = F(c.substring(s))),
            (i = r.indexOf(")")),
            (o = F(r.substring(Un, i))),
            (c = F(r.substring(i + 1))),
            (s = c.indexOf(":eq(")),
            n && o && t.push({ sel: n, eq: Number(o) });
        return c && t.push({ sel: c }), t;
      })(t);
      return ce(
        (e, t) => {
          const { sel: n, eq: r } = t;
          return (e = e.find(n)), Z(r) && (e = e.eq(r)), e;
        },
        sn(Xe),
        n
      );
    }
    function $n(e) {
      return Fn(e).length > 0;
    }
    function Jn(e) {
      return sn("<div/>").append(e);
    }
    function Zn(e) {
      return Fn(e).parent();
    }
    function Gn(e, t) {
      return Fn(t).find(e);
    }
    const Kn = "clickHandlerForExperienceEditor";
    function Xn() {
      if (!Lt()) return;
      (Ye._AT = Ye._AT || {}), (Ye._AT.querySelectorAll = Fn);
      const e = it().authoringScriptUrl;
      zt("Loading target-vec.js"),
        Vn(e)
          .then(() => {
            Xe.addEventListener(
              "click",
              (e) => {
                w(Ye._AT[Kn]) && Ye._AT[Kn](e);
              },
              !0
            );
          })
          ["catch"](() => Bt("Unable to load target-vec.js"));
    }
    const Yn = (e) => !m(e);
    function Wn(e) {
      const t = (function (e) {
        return parseInt(e, 10);
      })(e);
      return isNaN(t) ? null : t;
    }
    function Qn(e) {
      return ae("_", e);
    }
    function er(e) {
      const t = ae("_", e),
        n = Wn(t[0]);
      if (m(n)) return null;
      const r = {};
      r.activityIndex = n;
      const o = Wn(t[1]);
      return m(o) || (r.experienceIndex = o), r;
    }
    function tr(e) {
      return O(Yn, ne(er, e));
    }
    function nr(e) {
      const t = yt(e),
        n = t.at_preview_token;
      if ($(n)) return null;
      const r = {};
      r.token = n;
      const o = t.at_preview_listed_activities_only;
      J(o) && "true" === o && (r.listedActivitiesOnly = !0);
      const i = t.at_preview_evaluate_as_true_audience_ids;
      J(i) && (r.evaluateAsTrueAudienceIds = Qn(i));
      const c = t.at_preview_evaluate_as_false_audience_ids;
      J(c) && (r.evaluateAsFalseAudienceIds = Qn(c));
      const s = t.at_preview_index;
      return U(s) || (r.previewIndexes = g((u = s)) ? tr(u) : tr([u])), r;
      var u;
    }
    function rr(e) {
      const t = (function (e) {
        const t = yt(e).at_preview;
        return $(t) ? null : { token: t };
      })(e.location.search);
      if (m(t)) return;
      const n = new Date(re() + 186e4),
        r = it().secureOnly,
        o = h({ expires: n, secure: r }, r ? { sameSite: "None" } : {});
      Tt("at_preview_mode", JSON.stringify(t), o);
    }
    function or(e) {
      return Fn(e).empty().remove();
    }
    function ir(e, t) {
      return Fn(t).after(e);
    }
    function cr(e, t) {
      return Fn(t).before(e);
    }
    function sr(e, t) {
      return Fn(t).append(e);
    }
    function ur(e) {
      return Fn(e).html();
    }
    function ar(e, t) {
      return (
        '<style id="' + e + '" class="at-flicker-control">' + t + "</style>"
      );
    }
    function fr(e, t) {
      if (U(t)) return;
      const n = O((e) => !$n("#at-" + R(e)), t);
      if (U(n)) return;
      const r = e.defaultContentHiddenStyle;
      sr(
        ee(
          "\n",
          ne(
            (e) =>
              (function (e, t) {
                return ar("at-" + R(t), t + " {" + e + "}");
              })(r, e),
            n
          )
        ),
        "head"
      );
    }
    function lr(e, t) {
      if (U(t) || $n("#at-views")) return;
      sr(
        (function (e, t) {
          return ar("at-views", t + " {" + e + "}");
        })(e.defaultContentHiddenStyle, ee(", ", t)),
        "head"
      );
    }
    function dr() {
      !(function (e) {
        if (!0 !== e.bodyHidingEnabled) return;
        if ($n("#at-body-style")) return;
        sr(ar("at-body-style", e.bodyHiddenStyle), "head");
      })(it());
    }
    function pr() {
      !(function (e) {
        !0 === e.bodyHidingEnabled &&
          $n("#at-body-style") &&
          or("#at-body-style");
      })(it());
    }
    function hr(e) {
      return !m(e.id);
    }
    function mr(e) {
      return !m(e.authState);
    }
    function gr(e) {
      return hr(e) || mr(e);
    }
    function vr(e, t) {
      return ce(
        (e, n, r) => {
          const o = {};
          return (
            (o.integrationCode = r),
            hr(n) && (o.id = n.id),
            mr(n) &&
              (o.authenticatedState = (function (e) {
                switch (e) {
                  case 0:
                    return "unknown";
                  case 1:
                    return "authenticated";
                  case 2:
                    return "logged_out";
                  default:
                    return "unknown";
                }
              })(n.authState)),
            (o[Le] = t),
            (function (e) {
              return e.primary;
            })(n) && (o.primary = !0),
            e.push(o),
            e
          );
        },
        [],
        O(gr, e)
      );
    }
    function yr(e) {
      if (m(e)) return [];
      if (!w(e.getCustomerIDs)) return [];
      const t = e.getCustomerIDs(!0);
      return x(t)
        ? (function (e) {
            if (!e.nameSpaces && !e.dataSources) return vr(e, "DS");
            const t = [];
            return (
              e.nameSpaces && t.push.apply(t, vr(e.nameSpaces, "NS")),
              e.dataSources && t.push.apply(t, vr(e.dataSources, "DS")),
              t
            );
          })(t)
        : [];
    }
    function br(e) {
      return zt("Visitor API requests error", e), {};
    }
    function xr(e, t, n) {
      if (m(e)) return pn({});
      return gn(
        (function (e, t) {
          if (!w(e.getVisitorValues)) return pn({});
          const n = ["MCMID", "MCAAMB", "MCAAMLH"];
          return (
            t && n.push("MCOPTOUT"),
            dn((t) => {
              e.getVisitorValues((e) => t(e), n);
            })
          );
        })(e, n),
        t,
        "Visitor API requests timed out"
      )["catch"](br);
    }
    function wr(e, t) {
      return m(e)
        ? {}
        : (function (e, t) {
            if (!w(e.getVisitorValues)) return {};
            const n = ["MCMID", "MCAAMB", "MCAAMLH"];
            t && n.push("MCOPTOUT");
            const r = {};
            return e.getVisitorValues((e) => h(r, e), n), r;
          })(e, t);
    }
    function Sr() {
      const e = it(),
        t = e.imsOrgId,
        n = e.supplementalDataIdParamTimeout;
      return (function (e, t, n) {
        if ($(t)) return null;
        if (m(e.Visitor)) return null;
        if (!w(e.Visitor.getInstance)) return null;
        const r = e.Visitor.getInstance(t, { sdidParamExpiry: n });
        return x(r) && w(r.isAllowed) && r.isAllowed() ? r : null;
      })(Ye, t, n);
    }
    function Er(e) {
      return (function (e, t) {
        return m(e)
          ? null
          : w(e.getSupplementalDataID)
          ? e.getSupplementalDataID(t)
          : null;
      })(Sr(), e);
    }
    function Tr(e) {
      return (function (e, t) {
        if (m(e)) return null;
        const n = e[t];
        return m(n) ? null : n;
      })(Sr(), e);
    }
    const Cr = {};
    function kr(e, t) {
      Cr[e] = t;
    }
    function Ir(e) {
      return Cr[e];
    }
    function Nr(e) {
      const t = e.name;
      if (!P(t) || U(t)) return !1;
      const n = e.version;
      if (!P(n) || U(n)) return !1;
      const r = e.timeout;
      if (!m(r) && !Z(r)) return !1;
      return !!w(e.provider);
    }
    function Or(e, t, n, r, o, i) {
      const c = {};
      (c[e] = t), (c[n] = r), (c[o] = i);
      const s = {};
      return (s.dataProvider = c), s;
    }
    function _r(e) {
      const t = e.name,
        n = e.version,
        r = e.timeout || 2e3;
      return gn(
        (function (e) {
          return dn((t, n) => {
            e((e, r) => {
              m(e) ? t(r) : n(e);
            });
          });
        })(e.provider),
        r,
        "timed out"
      )
        .then((e) => {
          const r = Or("name", t, "version", n, "params", e);
          return zt("Data provider", Ze, r), Zt(r), e;
        })
        ["catch"]((e) => {
          const r = Or("name", t, "version", n, $e, e);
          return zt("Data provider", $e, r), Zt(r), {};
        });
    }
    function Ar(e) {
      const t = ce((e, t) => h(e, t), {}, e);
      return kr("dataProviders", t), t;
    }
    function qr(e) {
      if (
        !(function (e) {
          const t = e.targetGlobalSettings;
          if (m(t)) return !1;
          const n = t.dataProviders;
          return !(!g(n) || U(n));
        })(e)
      )
        return pn({});
      return mn(ne(_r, O(Nr, e.targetGlobalSettings.dataProviders))).then(Ar);
    }
    function Mr() {
      return (function () {
        const e = Ir("dataProviders");
        return m(e) ? {} : e;
      })();
    }
    function Pr() {
      const e = (function (e) {
          const { location: t } = e,
            { search: n } = t,
            r = yt(n).authorization;
          return $(r) ? null : r;
        })(Ye),
        t = (function () {
          const e = Et("mboxDebugTools");
          return $(e) ? null : e;
        })();
      return e || t;
    }
    function Rr(e) {
      return !U(e) && 2 === e.length && J(e[0]);
    }
    function Dr(e, t, n, r) {
      q((e, o) => {
        x(e)
          ? (t.push(o), Dr(e, t, n, r), t.pop())
          : U(t)
          ? (n[r(o)] = e)
          : (n[r(ee(".", t.concat(o)))] = e);
      }, e);
    }
    function Lr(e) {
      if (!w(e)) return {};
      let t = null;
      try {
        t = e();
      } catch (e) {
        return {};
      }
      return m(t)
        ? {}
        : g(t)
        ? (function (e) {
            const t = ce(
              (e, t) => (
                e.push(
                  (function (e) {
                    const t = e.indexOf("=");
                    return -1 === t ? [] : [e.substr(0, t), e.substr(t + 1)];
                  })(t)
                ),
                e
              ),
              [],
              O(J, e)
            );
            return ce(
              (e, t) => ((e[xt(F(t[0]))] = xt(F(t[1]))), e),
              {},
              O(Rr, t)
            );
          })(t)
        : P(t) && J(t)
        ? O((e, t) => J(t), yt(t))
        : x(t)
        ? (function (e, t) {
            const n = {};
            return m(t) ? Dr(e, [], n, S) : Dr(e, [], n, t), n;
          })(t)
        : {};
    }
    function jr(e) {
      return h({}, e, Lr(Ye.targetPageParamsAll));
    }
    function Vr(e) {
      const t = it(),
        n = t.globalMboxName,
        r = t.mboxParams,
        o = t.globalMboxParams;
      return n !== e
        ? jr(r || {})
        : h(
            jr(r || {}),
            (function (e) {
              return h({}, e, Lr(Ye.targetPageParams));
            })(o || {})
          );
    }
    const Hr = (function () {
      const e = Xe.createElement("canvas"),
        t = e.getContext("webgl") || e.getContext("experimental-webgl");
      if (m(t)) return null;
      const n = t.getExtension("WEBGL_debug_renderer_info");
      if (m(n)) return null;
      const r = t.getParameter(n.UNMASKED_RENDERER_WEBGL);
      return m(r) ? null : r;
    })();
    function Ur() {
      let { devicePixelRatio: e } = Ye;
      if (!m(e)) return e;
      e = 1;
      const { screen: t } = Ye,
        { systemXDPI: n, logicalXDPI: r } = t;
      return !m(n) && !m(r) && n > r && (e = n / r), e;
    }
    function Br() {
      const { screen: e } = Ye,
        { orientation: t, width: n, height: r } = e;
      if (m(t)) return n > r ? "landscape" : "portrait";
      if (m(t.type)) return null;
      const o = ae("-", t.type);
      if (U(o)) return null;
      const i = o[0];
      return m(i) ? null : i;
    }
    function zr(e) {
      return -1 !== e.indexOf("profile.");
    }
    function Fr(e) {
      return (
        zr(e) ||
        (function (e) {
          return "mbox3rdPartyId" === e;
        })(e) ||
        (function (e) {
          return "at_property" === e;
        })(e) ||
        (function (e) {
          return "orderId" === e;
        })(e) ||
        (function (e) {
          return "orderTotal" === e;
        })(e) ||
        (function (e) {
          return "productPurchasedId" === e;
        })(e) ||
        (function (e) {
          return "productId" === e;
        })(e) ||
        (function (e) {
          return "categoryId" === e;
        })(e)
      );
    }
    function $r(e) {
      return e.substring("profile.".length);
    }
    function Jr() {
      let e =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      return ce((e, t, n) => (Fr(n) || (e[n] = m(t) ? "" : t), e), {}, e);
    }
    function Zr() {
      let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        t = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
      return ce(
        (e, n, r) => {
          const o = t ? $r(r) : r;
          return (t && !zr(r)) || $(o) || (e[o] = m(n) ? "" : n), e;
        },
        {},
        e
      );
    }
    function Gr(e) {
      let { url: t, headers: n, body: r, timeout: o, async: i } = e;
      return dn((e, c) => {
        let s = new window.XMLHttpRequest();
        (s = (function (e, t, n) {
          return (
            (e.onload = () => {
              const r = 1223 === e.status ? 204 : e.status;
              if (r < 100 || r > 599)
                return void n(new Error("Network request failed"));
              let o;
              try {
                const t = Ne();
                (o = JSON.parse(e.responseText)),
                  (o.parsingTime = Ne() - t),
                  (o.responseSize = new Blob([e.responseText]).size);
              } catch (e) {
                return void n(new Error("Malformed response JSON"));
              }
              const i = e.getAllResponseHeaders();
              t({ status: r, headers: i, response: o });
            }),
            e
          );
        })(s, e, c)),
          (s = (function (e, t) {
            return (
              (e.onerror = () => {
                t(new Error("Network request failed"));
              }),
              e
            );
          })(s, c)),
          s.open("POST", t, i),
          (s.withCredentials = !0),
          (s = (function (e) {
            let t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : {};
            return (
              q((t, n) => {
                g(t) &&
                  q((t) => {
                    e.setRequestHeader(n, t);
                  }, t);
              }, t),
              e
            );
          })(s, n)),
          i &&
            (s = (function (e, t, n) {
              return (
                (e.timeout = t),
                (e.ontimeout = () => {
                  n(new Error("Request timed out"));
                }),
                e
              );
            })(s, o, c)),
          s.send(JSON.stringify(r));
      }).then((e) => {
        const { response: t } = e,
          { status: n, message: r } = t;
        if (!m(n) && !m(r)) throw new Error(r);
        return t;
      });
    }
    function Kr(e, t) {
      return Z(t) ? (t < 0 ? e.timeout : t) : e.timeout;
    }
    function Xr(e) {
      const t = e.serverDomain;
      if (!e.overrideMboxEdgeServer) return t;
      const n = (function () {
        if (!it().overrideMboxEdgeServer) return "";
        const e = Et("mboxEdgeCluster");
        return $(e) ? "" : e;
      })();
      return $(n) ? t : "mboxedge" + n + ".tt.omtrdc.net";
    }
    function Yr(e) {
      return (
        e.scheme +
        "//" +
        Xr(e) +
        e.endpoint +
        "?" +
        bt({ client: e.clientCode, sessionId: Tn(), version: e.version })
      );
    }
    function Wr(e, t, n) {
      const r = it(),
        o = Yr(r),
        i = { "Content-Type": ["text/plain"] },
        c = Kr(r, t),
        s = { url: o, headers: i, body: e, timeout: c, async: !0 };
      return (
        Oe.timeStart(e.requestId),
        Gr(s).then((t) => {
          const r = {
            execution: Oe.timeEnd(e.requestId),
            parsing: t.parsingTime,
          };
          delete t.parsingTime;
          const i = (function (e, t) {
            if (!performance) return null;
            const n = performance
              .getEntriesByType("resource")
              .find((t) => t.name.endsWith(e));
            if (!n) return null;
            const r = {};
            return (
              n.domainLookupEnd &&
                n.domainLookupStart &&
                (r.dns = n.domainLookupEnd - n.domainLookupStart),
              n.secureConnectionStart &&
                n.connectEnd &&
                (r.tls = n.connectEnd - n.secureConnectionStart),
              n.responseStart &&
                (r.timeToFirstByte = n.responseStart - n.requestStart),
              n.responseEnd &&
                n.responseStart &&
                (r.download = n.responseEnd - n.responseStart),
              n.encodedBodySize
                ? (r.responseSize = n.encodedBodySize)
                : t.responseSize &&
                  ((r.responseSize = t.responseSize), delete t.responseSize),
              r
            );
          })(o, t);
          return (
            i && (r.request = i),
            t.telemetryServerToken &&
              (r.telemetryServerToken = t.telemetryServerToken),
            window.__target_telemetry.addDeliveryRequestEntry(
              e,
              r,
              t.status,
              n
            ),
            h(t, { decisioningMethod: pe })
          );
        })
      );
    }
    const Qr = (e) => !U(e);
    function eo(e) {
      if (e.MCOPTOUT) throw new Error("Disabled due to optout");
      return e;
    }
    function to() {
      const e = (function () {
          const e = Sr(),
            t = it();
          return xr(e, t.visitorApiTimeout, t.optoutEnabled);
        })(),
        t = qr(Ye);
      return mn([e.then(eo), t]);
    }
    function no() {
      return [wr(Sr(), it().optoutEnabled), Mr()];
    }
    function ro() {
      const { screen: e } = Ye;
      return {
        width: e.width,
        height: e.height,
        orientation: Br(),
        colorDepth: e.colorDepth,
        pixelRatio: Ur(),
      };
    }
    function oo() {
      const { documentElement: e } = Xe;
      return { width: e.clientWidth, height: e.clientHeight };
    }
    function io() {
      const { location: e } = Ye;
      return { host: e.hostname, webGLRenderer: Hr };
    }
    function co() {
      const { location: e } = Ye;
      return { url: e.href, referringUrl: Xe.referrer };
    }
    function so(e) {
      const {
          id: t,
          integrationCode: n,
          authenticatedState: r,
          type: o,
          primary: i,
        } = e,
        c = {};
      return (
        J(t) && (c.id = t),
        J(n) && (c.integrationCode = n),
        J(r) && (c.authenticatedState = r),
        J(o) && (c.type = o),
        i && (c.primary = i),
        c
      );
    }
    function uo(e, t, n, r, o) {
      const i = {};
      J(t) && (i.tntId = t),
        J(n) && (i.thirdPartyId = n),
        J(e.thirdPartyId) && (i.thirdPartyId = e.thirdPartyId);
      const c = r.MCMID;
      return (
        J(c) && (i.marketingCloudVisitorId = c),
        J(e.marketingCloudVisitorId) &&
          (i.marketingCloudVisitorId = e.marketingCloudVisitorId),
        U(e.customerIds)
          ? (U(o) ||
              (i.customerIds = (function (e) {
                return ne(so, e);
              })(o)),
            i)
          : ((i.customerIds = e.customerIds), i)
      );
    }
    function ao(e, t) {
      const n = {},
        r = (function (e, t) {
          if (!m(e)) return e;
          const n = {};
          if (U(t)) return n;
          const r = t.MCAAMLH,
            o = parseInt(r, 10);
          isNaN(o) || (n.locationHint = o);
          const i = t.MCAAMB;
          return J(i) && (n.blob = i), n;
        })(e.audienceManager, t);
      return (
        U(r) || (n.audienceManager = r),
        U(e.analytics) || (n.analytics = e.analytics),
        n
      );
    }
    function fo(e) {
      return m(e)
        ? (function () {
            const e = Et("at_preview_mode");
            if ($(e)) return {};
            try {
              return JSON.parse(e);
            } catch (e) {
              return {};
            }
          })()
        : e;
    }
    function lo(e) {
      return m(e)
        ? (function () {
            const e = Et("at_qa_mode");
            if ($(e)) return {};
            try {
              return JSON.parse(e);
            } catch (e) {
              return {};
            }
          })()
        : e;
    }
    function po(e) {
      const t = {},
        n = (function (e) {
          return e.orderId;
        })(e);
      m(n) || (t.id = n);
      const r = (function (e) {
          return e.orderTotal;
        })(e),
        o = parseFloat(r);
      isNaN(o) || (t.total = o);
      const i = (function (e) {
        const t = ne(F, ae(",", e.productPurchasedId));
        return O(J, t);
      })(e);
      return U(i) || (t.purchasedProductIds = i), t;
    }
    function ho(e, t) {
      const n = {},
        r = h({}, Jr(t), Jr(e.parameters || {})),
        o = h({}, Zr(t), Zr(e.profileParameters || {}, !1)),
        i = h({}, po(t), e.order || {}),
        c = h(
          {},
          (function (e) {
            const t = {},
              n = (function (e) {
                return e.productId;
              })(e);
            m(n) || (t.id = n);
            const r = (function (e) {
              return e.categoryId;
            })(e);
            return m(r) || (t.categoryId = r), t;
          })(t),
          e.product || {}
        );
      return (
        U(r) || (n.parameters = r),
        U(o) || (n.profileParameters = o),
        U(i) || (n.order = i),
        U(c) || (n.product = c),
        n
      );
    }
    function mo(e, t) {
      let n =
        arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
      const r = it(),
        o = r.globalMboxName,
        { index: i, name: c, address: s } = e,
        u = h({}, c === o ? t : n, Vr(c)),
        a = ho(e, u);
      return (
        m(i) || (a.index = i), J(c) && (a.name = c), U(s) || (a.address = s), a
      );
    }
    function go(e, t, n) {
      const { prefetch: r = {} } = e,
        o = {};
      if (U(r)) return o;
      const { mboxes: i } = r;
      m(i) || !g(i) || U(i) || (o.mboxes = ne((e) => mo(e, t, n), i));
      const { views: c } = r;
      return (
        m(c) ||
          !g(c) ||
          U(c) ||
          (o.views = ne(
            (e) =>
              (function (e, t) {
                const { name: n, address: r } = e,
                  o = ho(e, t);
                return J(n) && (o.name = n), U(r) || (o.address = r), o;
              })(e, t),
            c
          )),
        o
      );
    }
    function vo(e, t) {
      if (bn() && !yn(Ye, "ANALYTICS")) return null;
      const n = it(),
        r = Er(e),
        o = Tr("trackingServer"),
        i = Tr("trackingServerSecure"),
        { experienceCloud: c = {} } = t,
        { analytics: s = {} } = c,
        {
          logging: u,
          supplementalDataId: a,
          trackingServer: f,
          trackingServerSecure: l,
        } = s,
        d = {};
      return (
        m(u) ? (d.logging = n.analyticsLogging) : (d.logging = u),
        m(a) || (d.supplementalDataId = a),
        J(r) && (d.supplementalDataId = r),
        m(f) || (d.trackingServer = f),
        J(o) && (d.trackingServer = o),
        m(l) || (d.trackingServerSecure = l),
        J(i) && (d.trackingServerSecure = i),
        U(d) ? null : d
      );
    }
    function yo(e, t, n) {
      const r = (function (e) {
          const t = it().globalMboxName;
          return h({}, e, Vr(t));
        })(n),
        o = Cn(),
        i = r.mbox3rdPartyId;
      const c = yr(Sr()),
        s = uo(e.id || {}, o, i, t, c),
        u = (function (e, t) {
          if (!m(e) && J(e.token)) return e;
          const n = {},
            r = t.at_property;
          return J(r) && (n.token = r), n;
        })(e.property, r),
        a = ao(e.experienceCloud || {}, t),
        f = (function (e) {
          if (!m(e) && J(e.authorizationToken)) return e;
          const t = {},
            n = Pr();
          return J(n) && (t.authorizationToken = n), t;
        })(e.trace),
        l = fo(e.preview),
        d = lo(e.qaMode),
        p = (function (e, t, n) {
          const { execute: r = {} } = e,
            o = {};
          if (U(r)) return o;
          const { pageLoad: i } = r;
          m(i) || (o.pageLoad = ho(i, t));
          const { mboxes: c } = r;
          if (!m(c) && g(c) && !U(c)) {
            const e = O(
              Qr,
              ne((e) => mo(e, t, n), c)
            );
            U(e) || (o.mboxes = e);
          }
          return o;
        })(e, r, n),
        v = go(e, r, n),
        { notifications: y } = e;
      let b = {};
      return (
        (b.requestId = De()),
        (b.context = (function (e) {
          if (!m(e) && "web" === e.channel) return e;
          const t = e || {},
            { beacon: n } = t;
          return {
            userAgent: Ye.navigator.userAgent,
            timeOffsetInMinutes: -new Date().getTimezoneOffset(),
            channel: "web",
            screen: ro(),
            window: oo(),
            browser: io(),
            address: co(),
            geo: e && e.geo,
            beacon: n,
          };
        })(e.context)),
        U(s) || (b.id = s),
        U(u) || (b.property = u),
        U(f) || (b.trace = f),
        U(a) || (b.experienceCloud = a),
        U(l) || (b.preview = l),
        U(d) || (b.qaMode = d),
        U(p) || (b.execute = p),
        U(v) || (b.prefetch = v),
        U(y) || (b.notifications = y),
        (b = Ye.__target_telemetry.addTelemetryToDeliveryRequest(b)),
        b
      );
    }
    function bo(e, t, n) {
      const r = n[0],
        o = n[1];
      return yo(e, r, h({}, o, t));
    }
    function xo(e, t) {
      return to().then((n) => bo(e, t, n));
    }
    function wo(e, t, n) {
      return (
        zt("request", t),
        Zt({ request: t }),
        Wr(t, n, pe).then(
          (e) => (
            zt("response", e), Zt({ response: e }), { request: t, response: e }
          )
        )
      );
    }
    const So = (e) => (t) => t[e],
      Eo = (e) => (t) => !e(t),
      To = Eo(m),
      Co = Eo($),
      ko = (e) => (t) => O(e, t),
      Io = (e) => e.status === $e,
      No = (e) => "actions" === e.type,
      Oo = (e) => "redirect" === e.type,
      _o = ko(To),
      Ao = ko(Co),
      qo = So("options"),
      Mo = So(je),
      Po = So("eventToken"),
      Ro = So("responseTokens"),
      Do = (e) => J(e.name),
      Lo = (e) => x(e) && Do(e),
      jo = (e) => x(e) && Do(e) && ((e) => !m(e.index))(e),
      Vo = (e) => x(e) && Do(e),
      Ho = So("data"),
      Uo = A([Ho, To]);
    function Bo(e, t) {
      return { status: Ze, type: e, data: t };
    }
    function zo(e, t) {
      return { status: $e, type: e, data: t };
    }
    function Fo(e) {
      return x(e);
    }
    function $o(e) {
      return !!Fo(e) && J(e.eventToken);
    }
    function Jo(e) {
      return !U(e) && !$(e.type) && J(e.eventToken);
    }
    function Zo(e) {
      return !!Jo(e) && J(e.selector);
    }
    function Go(e) {
      const { id: t } = e;
      return x(t) && J(t.tntId);
    }
    function Ko(e) {
      const { response: t } = e;
      return (
        Go(t) &&
          (function (e) {
            const t = it();
            Mt({
              name: "PC",
              value: e,
              expires: t.deviceIdLifetime,
              domain: t.cookieDomain,
              secure: t.secureOnly,
            });
          })(t.id.tntId),
        e
      );
    }
    function Xo(e) {
      const { response: t } = e;
      if (Go(t)) {
        const { id: e } = t,
          { tntId: n } = e;
        In(n);
      }
      return In(null), e;
    }
    function Yo() {
      let e =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      const { trace: t } = e;
      U(t) || Jt(t);
    }
    function Wo(e) {
      const { response: t } = e,
        { execute: n = {}, prefetch: r = {}, notifications: o = {} } = t,
        { pageLoad: i = {}, mboxes: c = [] } = n,
        { mboxes: s = [], views: u = [] } = r;
      return Yo(i), q(Yo, c), q(Yo, s), q(Yo, u), q(Yo, o), e;
    }
    function Qo(e) {
      const t = e.queryKey,
        n = t.adobe_mc_sdid;
      if (!P(n)) return t;
      if ($(n)) return t;
      const r = Math.round(re() / 1e3);
      return (t.adobe_mc_sdid = n.replace(/\|TS=\d+/, "|TS=" + r)), t;
    }
    function ei(e) {
      return e.queryKey;
    }
    function ti(e, t, n) {
      const r = St(e),
        { protocol: o } = r,
        { host: i } = r,
        { path: c } = r,
        s = "" === r.port ? "" : ":" + r.port,
        u = $(r.anchor) ? "" : "#" + r.anchor,
        a = n(r),
        f = bt(h({}, a, t));
      return o + "://" + i + s + c + ($(f) ? "" : "?" + f) + u;
    }
    function ni(e, t) {
      return ti(e, t, Qo);
    }
    function ri(e) {
      const t = e.method || "GET",
        n =
          e.url ||
          (function (e) {
            throw new Error(e);
          })("URL is required"),
        r = e.headers || {},
        o = e.data || null,
        i = e.credentials || !1,
        c = e.timeout || 3e3,
        s = !!m(e.async) || !0 === e.async,
        u = {};
      return (
        (u.method = t),
        (u.url = n),
        (u.headers = r),
        (u.data = o),
        (u.credentials = i),
        (u.timeout = c),
        (u.async = s),
        u
      );
    }
    function oi(e, t) {
      const n = ri(t),
        r = n.method,
        o = n.url,
        i = n.headers,
        c = n.data,
        s = n.credentials,
        u = n.timeout,
        a = n.async;
      return dn((t, n) => {
        let f = new e.XMLHttpRequest();
        (f = (function (e, t, n) {
          return (
            (e.onload = () => {
              const r = 1223 === e.status ? 204 : e.status;
              if (r < 100 || r > 599)
                return void n(new Error("Network request failed"));
              const o = e.responseText,
                i = e.getAllResponseHeaders();
              t({ status: r, headers: i, response: o });
            }),
            e
          );
        })(f, t, n)),
          (f = (function (e, t) {
            return (
              (e.onerror = () => {
                t(new Error("Network request failed"));
              }),
              e
            );
          })(f, n)),
          f.open(r, o, a),
          (f = (function (e, t) {
            return !0 === t && (e.withCredentials = t), e;
          })(f, s)),
          (f = (function (e, t) {
            return (
              q((t, n) => {
                q((t) => e.setRequestHeader(n, t), t);
              }, t),
              e
            );
          })(f, i)),
          a &&
            (f = (function (e, t, n) {
              return (
                (e.timeout = t),
                (e.ontimeout = () => {
                  n(new Error("Request timed out"));
                }),
                e
              );
            })(f, u, n)),
          f.send(c);
      });
    }
    function ii(e) {
      return oi(Ye, e);
    }
    function ci(e, t, n) {
      const r = { method: "GET" };
      return (
        (r.url = (function (e, t) {
          return ti(e, t, ei);
        })(e, t)),
        (r.timeout = n),
        r
      );
    }
    function si(e) {
      const { status: t } = e;
      if (
        !(function (e) {
          return (e >= 200 && e < 300) || 304 === e;
        })(t)
      )
        return null;
      const n = e.response;
      if ($(n)) return null;
      const r = { type: "html" };
      return (r.content = n), r;
    }
    const ui = /CLKTRK#(\S+)/,
      ai = /CLKTRK#(\S+)\s/;
    function fi(e) {
      const t = e[je],
        n = (function (e) {
          const t = e[Ve];
          if ($(t)) return "";
          const n = ui.exec(t);
          return U(n) || 2 !== n.length ? "" : n[1];
        })(e);
      if ($(n) || $(t)) return e;
      const r = e[Ve];
      return (
        (e[Ve] = r.replace(ai, "")),
        (e[je] = (function (e, t) {
          const n = document.createElement("div");
          n.innerHTML = t;
          const r = n.firstElementChild;
          return m(r) ? t : ((r.id = e), r.outerHTML);
        })(n, t)),
        e
      );
    }
    const li = (e) => !m(e);
    function di(e) {
      const { selector: t } = e;
      return !m(t);
    }
    function pi(e) {
      const t = e[Le];
      if ($(t)) return null;
      switch (t) {
        case "setHtml":
          return (function (e) {
            if (!di(e)) return null;
            const t = fi(e);
            return P(t[je]) ? t : (zt(ze, t), null);
          })(e);
        case "setText":
          return (function (e) {
            if (!di(e)) return null;
            const t = fi(e);
            return P(t[je]) ? t : (zt(ze, t), null);
          })(e);
        case "appendHtml":
          return (function (e) {
            if (!di(e)) return null;
            const t = fi(e);
            return P(t[je]) ? t : (zt(ze, t), null);
          })(e);
        case "prependHtml":
          return (function (e) {
            if (!di(e)) return null;
            const t = fi(e);
            return P(t[je]) ? t : (zt(ze, t), null);
          })(e);
        case "replaceHtml":
          return (function (e) {
            if (!di(e)) return null;
            const t = fi(e);
            return P(t[je]) ? t : (zt(ze, t), null);
          })(e);
        case "insertBefore":
          return (function (e) {
            if (!di(e)) return null;
            const t = fi(e);
            return P(t[je]) ? t : (zt(ze, t), null);
          })(e);
        case "insertAfter":
          return (function (e) {
            if (!di(e)) return null;
            const t = fi(e);
            return P(t[je]) ? t : (zt(ze, t), null);
          })(e);
        case "customCode":
          return (function (e) {
            return di(e) ? (P(e[je]) ? e : (zt(ze, e), null)) : null;
          })(e);
        case "setAttribute":
          return (function (e) {
            return di(e)
              ? x(e[je])
                ? e
                : (zt("Action has no attributes", e), null)
              : null;
          })(e);
        case "setImageSource":
          return (function (e) {
            return di(e)
              ? P(e[je])
                ? e
                : (zt("Action has no image url", e), null)
              : null;
          })(e);
        case "setStyle":
          return (function (e) {
            return di(e)
              ? x(e[je])
                ? e
                : (zt("Action has no CSS properties", e), null)
              : null;
          })(e);
        case "resize":
          return (function (e) {
            return di(e)
              ? x(e[je])
                ? e
                : (zt("Action has no height or width", e), null)
              : null;
          })(e);
        case "move":
          return (function (e) {
            return di(e)
              ? x(e[je])
                ? e
                : (zt("Action has no left, top or position", e), null)
              : null;
          })(e);
        case "remove":
          return (function (e) {
            return di(e) ? e : null;
          })(e);
        case "rearrange":
          return (function (e) {
            return di(e)
              ? x(e[je])
                ? e
                : (zt("Action has no from or to", e), null)
              : null;
          })(e);
        case "redirect":
          return (function (e) {
            const { content: t } = e;
            return $(t)
              ? (zt("Action has no url", e), null)
              : ((e.content = ni(t, {})), e);
          })(e);
        default:
          return null;
      }
    }
    function hi() {
      let e =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      const { options: t } = e;
      return g(t) ? (U(t) ? [] : _o(ne(Ro, t))) : [];
    }
    function mi() {
      let e =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      const { execute: t = {} } = e,
        { pageLoad: n = {}, mboxes: r = [] } = t,
        o = qo(n) || [],
        i = _(_o(ne(qo, r))),
        c = _([o, i]),
        s = _(ne(Mo, O(No, c))),
        u = O(Oo, c),
        a = O(Oo, s),
        f = u.concat(a),
        l = {};
      if (U(f)) return l;
      const d = f[0],
        p = d.content;
      return $(p) || (l.url = p), l;
    }
    function gi() {
      let e =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      const { analytics: t } = e;
      return U(t) ? [] : [t];
    }
    function vi() {
      let e =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      const { execute: t = {}, prefetch: n = {} } = e,
        { pageLoad: r = {}, mboxes: o = [] } = t,
        { mboxes: i = [], views: c = [], metrics: s = [] } = n,
        u = gi(r),
        a = _(ne(gi, o)),
        f = _(ne(gi, i)),
        l = _(ne(gi, c)),
        d = _(ne(gi, s));
      return _([u, a, f, l, d]);
    }
    function yi(e, t) {
      (e.parameters = t.parameters),
        (e.profileParameters = t.profileParameters),
        (e.order = t.order),
        (e.product = t.product);
    }
    function bi(e, t) {
      const n = t[0],
        r = t[1],
        o = !U(n),
        i = !U(r);
      return o || i ? (o && (e.options = n), i && (e.metrics = r), e) : e;
    }
    function xi(e) {
      const { type: t } = e;
      switch (t) {
        case "redirect":
          return pn(
            (function (e) {
              const t = e.content;
              if ($(t)) return zt("Action has no url", e), null;
              const n = h({}, e);
              return (n.content = ni(t, {})), n;
            })(e)
          );
        case "dynamic":
          return (function (e) {
            const { content: t } = e;
            return ii(ci(t, {}, it().timeout))
              .then(si)
              ["catch"](() => null);
          })(e);
        case "actions":
          return pn(
            (function (e) {
              const t = e[je];
              if (!g(t)) return null;
              if (U(t)) return null;
              const n = O(li, ne(pi, t));
              if (U(n)) return null;
              const r = h({}, e);
              return (r.content = n), r;
            })(e)
          );
        default:
          return pn(e);
      }
    }
    function wi(e, t) {
      if (!g(e)) return pn([]);
      if (U(e)) return pn([]);
      const n = O(t, e);
      if (U(n)) return pn([]);
      return mn(ne((e) => xi(e), n)).then(_o);
    }
    function Si(e, t) {
      return g(e) ? (U(e) ? pn([]) : pn(O(t, e))) : pn([]);
    }
    function Ei(e) {
      const { name: t, analytics: n, options: r, metrics: o } = e,
        i = { name: t, analytics: n };
      return mn([wi(r, Fo), Si(o, Jo)]).then((e) => bi(i, e));
    }
    function Ti(e, t) {
      const {
          index: n,
          name: r,
          state: o,
          analytics: i,
          options: c,
          metrics: s,
        } = t,
        u = (function (e, t, n) {
          const { prefetch: r = {} } = e,
            { mboxes: o = [] } = r;
          return U(o)
            ? null
            : (i = O(
                (e) =>
                  (function (e, t, n) {
                    return e.index === t && e.name === n;
                  })(e, t, n),
                o
              )) && i.length
            ? i[0]
            : void 0;
          var i;
        })(e, n, r),
        a = { name: r, state: o, analytics: i };
      return m(u) || yi(a, u), mn([wi(c, $o), Si(s, Jo)]).then((e) => bi(a, e));
    }
    function Ci(e, t) {
      const { name: n, state: r, analytics: o, options: i, metrics: c } = t,
        s = (function (e) {
          const { prefetch: t = {} } = e,
            { views: n = [] } = t;
          return U(n) ? null : n[0];
        })(e),
        u = { name: n.toLowerCase(), state: r, analytics: o };
      return m(s) || yi(u, s), mn([wi(i, $o), Si(c, Zo)]).then((e) => bi(u, e));
    }
    function ki(e) {
      if (m(e) || $(e.id)) return pn(null);
      const { id: t } = e;
      return pn({ id: t });
    }
    function Ii(e) {
      const t = e[0],
        n = e[1],
        r = e[2],
        o = e[3],
        i = e[4],
        c = e[5],
        s = e[6],
        u = {},
        a = {};
      x(t) && (a.pageLoad = t), U(n) || (a.mboxes = n);
      const f = {};
      return (
        U(r) || (f.mboxes = r),
        U(o) || (f.views = o),
        U(i) || (f.metrics = i),
        U(a) || (u.execute = a),
        U(f) || (u.prefetch = f),
        U(c) || (u.meta = c),
        U(s) || (u.notifications = s),
        u
      );
    }
    function Ni(e) {
      const t = A([Wo, Ko, Xo])(e),
        n = (function (e) {
          const { response: t } = e,
            { execute: n } = t;
          if (!x(n)) return pn(null);
          const { pageLoad: r } = n;
          if (!x(r)) return pn(null);
          const { analytics: o, options: i, metrics: c } = r,
            s = { analytics: o };
          return mn([wi(i, Fo), Si(c, Zo)]).then((e) => bi(s, e));
        })(t),
        r = (function (e) {
          const { response: t } = e,
            { execute: n } = t;
          if (!x(n)) return pn([]);
          const { mboxes: r } = n;
          return !g(r) || U(r) ? pn([]) : mn(ne(Ei, O(Lo, r))).then(_o);
        })(t),
        o = (function (e) {
          const { request: t, response: n } = e,
            { prefetch: r } = n;
          if (!x(r)) return pn([]);
          const { mboxes: o } = r;
          return !g(o) || U(o)
            ? pn([])
            : mn(ne((e) => Ti(t, e), O(jo, o))).then(_o);
        })(t),
        i = (function (e) {
          const { request: t, response: n } = e,
            { prefetch: r } = n;
          if (!x(r)) return pn([]);
          const { views: o } = r;
          return !g(o) || U(o)
            ? pn([])
            : mn(ne((e) => Ci(t, e), O(Vo, o))).then(_o);
        })(t),
        c = (function (e) {
          const { response: t } = e,
            { prefetch: n } = t;
          if (!x(n)) return pn([]);
          const { metrics: r } = n;
          return Si(r, Zo);
        })(t),
        s = (function (e) {
          const { response: t } = e,
            { remoteMboxes: n, remoteViews: r, decisioningMethod: o } = t,
            i = {};
          return (
            x(n) && (i.remoteMboxes = n),
            x(r) && (i.remoteViews = r),
            P(o) && (i.decisioningMethod = o),
            pn(i)
          );
        })(t),
        u = (function (e) {
          const { response: t } = e,
            { notifications: n } = t;
          return g(n) ? mn(ne(ki, n)).then(_o) : pn([]);
        })(t);
      return mn([n, r, o, i, c, s, u]).then(Ii);
    }
    function Oi(e) {
      return !U(mi(e));
    }
    function _i(e) {
      const t = (function () {
          let e =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
          const { execute: t = {}, prefetch: n = {} } = e,
            { pageLoad: r = {}, mboxes: o = [] } = t,
            { mboxes: i = [], views: c = [] } = n,
            s = hi(r),
            u = _(ne(hi, o)),
            a = _(ne(hi, i)),
            f = _(ne(hi, c));
          return _([s, u, a, f]);
        })(e),
        n = {};
      return U(t) || (n.responseTokens = t), n;
    }
    function Ai(e) {
      const t = it().globalMboxName,
        { mbox: n, timeout: r } = e,
        o = x(e.params) ? e.params : {},
        i = {},
        c = {};
      n === t ? (c.pageLoad = {}) : (c.mboxes = [{ index: 0, name: n }]),
        (i.execute = c);
      const s = vo(n, i);
      if (!U(s)) {
        const e = {};
        (e.analytics = s), (i.experienceCloud = e);
      }
      return (
        _n({ mbox: n }),
        xo(i, o)
          .then((e) => wo(0, e, r))
          .then(Ni)
          .then((e) =>
            (function (e, t) {
              const n = _i(t);
              n.mbox = e;
              const r = vi(t);
              return (
                U(r) || (n.analyticsDetails = r),
                zt("request succeeded", t),
                An(n, Oi(t)),
                pn(t)
              );
            })(n, e)
          )
          ["catch"]((e) =>
            (function (e, t) {
              return Bt("request failed", t), qn({ mbox: e, error: t }), hn(t);
            })(n, e)
          )
      );
    }
    function qi(e) {
      const t = it().globalMboxName,
        { consumerId: n = t, request: r, timeout: o } = e,
        i = vo(n, r);
      if (!U(i)) {
        const e = r.experienceCloud || {};
        (e.analytics = i), (r.experienceCloud = e);
      }
      return (
        _n({}),
        xo(r, {})
          .then((e) => wo(0, e, o))
          .then(Ni)
          .then((e) =>
            (function (e) {
              const t = _i(e),
                n = vi(e);
              return (
                U(n) || (t.analyticsDetails = n),
                zt("request succeeded", e),
                An(t, Oi(e)),
                pn(e)
              );
            })(e)
          )
          ["catch"]((e) =>
            (function (e) {
              return Bt("request failed", e), qn({ error: e }), hn(e);
            })(e)
          )
      );
    }
    function Mi(e, t) {
      return Fn(t).addClass(e);
    }
    function Pi(e, t) {
      return Fn(t).css(e);
    }
    function Ri(e, t) {
      return Fn(t).attr(e);
    }
    function Di(e, t, n) {
      return Fn(n).attr(e, t);
    }
    function Li(e, t) {
      return Fn(t).removeAttr(e);
    }
    function ji(e, t, n) {
      const r = Ri(e, n);
      J(r) && (Li(e, n), Di(t, r, n));
    }
    function Vi(e) {
      return new Error("Could not find: " + e);
    }
    function Hi(e, t, n) {
      return dn((r, o) => {
        const i = fn(() => {
          const t = n(e);
          U(t) || (i.disconnect(), r(t));
        });
        fe(() => {
          i.disconnect(), o(Vi(e));
        }, t),
          i.observe(Xe, { childList: !0, subtree: !0 });
      });
    }
    function Ui() {
      return "visible" === Xe.visibilityState;
    }
    function Bi(e, t, n) {
      return dn((r, o) => {
        !(function t() {
          const o = n(e);
          U(o) ? Ye.requestAnimationFrame(t) : r(o);
        })(),
          fe(() => {
            o(Vi(e));
          }, t);
      });
    }
    function zi(e, t, n) {
      return dn((r, o) => {
        !(function t() {
          const o = n(e);
          U(o) ? fe(t, 100) : r(o);
        })(),
          fe(() => {
            o(Vi(e));
          }, t);
      });
    }
    function Fi(e) {
      let t =
          arguments.length > 1 && void 0 !== arguments[1]
            ? arguments[1]
            : it().selectorsPollingTimeout,
        n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : Fn;
      const r = n(e);
      return U(r)
        ? an()
          ? Hi(e, t, n)
          : Ui()
          ? Bi(e, t, n)
          : zi(e, t, n)
        : pn(r);
    }
    function $i(e) {
      return Ri("data-at-src", e);
    }
    function Ji(e) {
      return J(Ri("data-at-src", e));
    }
    function Zi(e) {
      return q((e) => ji(He, "data-at-src", e), j(Gn("img", e))), e;
    }
    function Gi(e) {
      return q((e) => ji("data-at-src", He, e), j(Gn("img", e))), e;
    }
    function Ki(e) {
      return zt("Loading image", e), Ri(He, Di(He, e, sn("<img/>")));
    }
    function Xi(e) {
      const t = O(Ji, j(Gn("img", e)));
      return U(t) || q(Ki, ne($i, t)), e;
    }
    function Yi(e) {
      const t = Ri(He, e);
      return J(t) ? t : null;
    }
    function Wi(e, t) {
      return Bt("Unexpected error", t), Zt({ action: e, error: t }), e;
    }
    function Qi(e, t) {
      const n = Fn(t[Ve]),
        r = (function (e) {
          return A([Zi, Xi, Gi])(e);
        })(Jn(t[je])),
        o = (function (e) {
          return O(J, ne(Yi, j(Gn("script", e))));
        })(r);
      let i;
      try {
        i = pn(e(n, r));
      } catch (e) {
        return hn(Wi(t, e));
      }
      return U(o)
        ? i.then(() => t)["catch"]((e) => Wi(t, e))
        : i
            .then(() =>
              (function (e) {
                return ce(
                  (e, t) =>
                    e.then(
                      () => (
                        zt("Script load", t), Zt({ remoteScript: t }), Vn(t)
                      )
                    ),
                  pn(),
                  e
                );
              })(o)
            )
            .then(() => t)
            ["catch"]((e) => Wi(t, e));
    }
    function ec(e) {
      const t = h({}, e),
        n = t[je];
      if ($(n)) return t;
      const r = Fn(t[Ve]);
      return (
        (o = "head"),
        Fn(r).is(o)
          ? ((t[Le] = "appendHtml"),
            (t[je] = (function (e) {
              return ee(
                "",
                ce(
                  (e, t) => (e.push(ur(Jn(t))), e),
                  [],
                  j(Gn("script,link,style", Jn(e)))
                )
              );
            })(n)),
            t)
          : t
      );
      var o;
    }
    function tc(e) {
      return e.indexOf("px") === e.length - 2 ? e : e + "px";
    }
    function nc(e, t) {
      return (n = ur(t)), Fn(e).html(n);
      var n;
    }
    function rc(e) {
      const t = Fn(e[Ve]),
        n = e[je];
      return (
        zt("Rendering action", e),
        Zt({ action: e }),
        (function (e, t) {
          Fn(t).text(e);
        })(n, t),
        pn(e)
      );
    }
    function oc(e, t) {
      return sr(ur(t), e);
    }
    function ic(e, t) {
      return (n = ur(t)), Fn(e).prepend(n);
      var n;
    }
    function cc(e, t) {
      const n = Zn(e);
      return or(cr(ur(t), e)), n;
    }
    function sc(e, t) {
      return Fn(cr(ur(t), e)).prev();
    }
    function uc(e, t) {
      return Fn(ir(ur(t), e)).next();
    }
    function ac(e, t) {
      return Zn(cr(ur(t), e));
    }
    function fc(e) {
      const t = Fn(e[Ve]),
        n = e[je],
        r = n.priority;
      return (
        zt("Rendering action", e),
        Zt({ action: e }),
        $(r)
          ? Pi(n, t)
          : (function (e, t, n) {
              q((e) => {
                q((t, r) => e.style.setProperty(r, t, n), t);
              }, j(e));
            })(t, n, r),
        pn(e)
      );
    }
    function lc(e) {
      const t = Fn(e[Ve]),
        n = e[je],
        r = Number(n.from),
        o = Number(n.to);
      if (isNaN(r) && isNaN(o))
        return zt('Rearrange has incorrect "from" and "to" indexes', e), hn(e);
      const i = j(Fn(t).children());
      const c = i[r],
        s = i[o];
      return $n(c) && $n(s)
        ? (zt("Rendering action", e),
          Zt({ action: e }),
          r < o ? ir(c, s) : cr(c, s),
          pn(e))
        : (zt("Rearrange elements are missing", e), hn(e));
    }
    function dc(e) {
      const t = ec(e);
      switch (t[Le]) {
        case "setHtml":
          return (function (e) {
            return zt("Rendering action", e), Qi(nc, e);
          })(t);
        case "setText":
          return rc(t);
        case "appendHtml":
          return (function (e) {
            return zt("Rendering action", e), Qi(oc, e);
          })(t);
        case "prependHtml":
          return (function (e) {
            return zt("Rendering action", e), Qi(ic, e);
          })(t);
        case "replaceHtml":
          return (function (e) {
            return zt("Rendering action", e), Qi(cc, e);
          })(t);
        case "insertBefore":
          return (function (e) {
            return zt("Rendering action", e), Qi(sc, e);
          })(t);
        case "insertAfter":
          return (function (e) {
            return zt("Rendering action", e), Qi(uc, e);
          })(t);
        case "customCode":
          return (function (e) {
            return zt("Rendering action", e), Qi(ac, e);
          })(t);
        case "setAttribute":
          return (function (e) {
            const t = e[je],
              n = Fn(e[Ve]);
            return (
              zt("Rendering action", e),
              Zt({ action: e }),
              q((e, t) => Di(t, e, n), t),
              pn(e)
            );
          })(t);
        case "setImageSource":
          return (function (e) {
            const t = e[je],
              n = Fn(e[Ve]);
            return (
              zt("Rendering action", e),
              Zt({ action: e }),
              Li(He, n),
              Di(He, Ki(t), n),
              pn(e)
            );
          })(t);
        case "setStyle":
          return fc(t);
        case "resize":
          return (function (e) {
            const t = Fn(e[Ve]),
              n = e[je];
            return (
              (n.width = tc(n.width)),
              (n.height = tc(n.height)),
              zt("Rendering action", e),
              Zt({ action: e }),
              Pi(n, t),
              pn(e)
            );
          })(t);
        case "move":
          return (function (e) {
            const t = Fn(e[Ve]),
              n = e[je];
            return (
              (n.left = tc(n.left)),
              (n.top = tc(n.top)),
              zt("Rendering action", e),
              Zt({ action: e }),
              Pi(n, t),
              pn(e)
            );
          })(t);
        case "remove":
          return (function (e) {
            const t = Fn(e[Ve]);
            return zt("Rendering action", e), Zt({ action: e }), or(t), pn(e);
          })(t);
        case "rearrange":
          return lc(t);
        default:
          return pn(t);
      }
    }
    function pc(e) {
      const t = e[Ve];
      return J(t) || Hn(t);
    }
    function hc(e) {
      const t = e.cssSelector;
      $(t) || or("#at-" + R(t));
    }
    function mc(e) {
      if (!pc(e)) return void hc(e);
      const t = e[Ve];
      !(function (e) {
        return "trackClick" === e[Le] || "signalClick" === e[Le];
      })(e)
        ? (Mi("at-element-marker", t), hc(e))
        : Mi("at-element-click-tracking", t);
    }
    function gc(e) {
      return (function (e) {
        const { key: t } = e;
        if ($(t)) return !0;
        if ("customCode" === e[Le]) return e.page;
        const n = Ri("at-action-key", e[Ve]);
        return n !== t || (n === t && !e.page);
      })(e)
        ? dc(e)
            .then(
              () => (
                zt("Action rendered successfully", e),
                Zt({ action: e }),
                (function (e) {
                  const { key: t } = e;
                  if ($(t)) return;
                  if (!pc(e)) return;
                  Di("at-action-key", t, e[Ve]);
                })(e),
                mc(e),
                e
              )
            )
            ["catch"]((t) => {
              Bt("Unexpected error", t), Zt({ action: e, error: t }), mc(e);
              const n = h({}, e);
              return (n[$e] = !0), n;
            })
        : (mc(e), e);
    }
    function vc(e) {
      const t = O((e) => !0 === e[$e], e);
      return U(t)
        ? pn()
        : ((function (e) {
            q(mc, e);
          })(t),
          hn(e));
    }
    function yc(e) {
      return (function (e) {
        return Fi(e[Ve])
          .then(() => e)
          ["catch"](() => {
            const t = h({}, e);
            return (t[$e] = !0), t;
          });
      })(e).then(gc);
    }
    function bc(e, t, n) {
      return Fn(n).on(e, t);
    }
    function xc(e) {
      const t = e.name,
        n = Ir("views") || {};
      (n[t] = e), kr("views", n);
    }
    function wc(e) {
      let t =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
      const { page: n = !0 } = t,
        r = Ir("views") || {},
        o = r[e];
      if (m(o)) return o;
      const { impressionId: i } = t;
      return m(i) ? o : h({ page: n, impressionId: i }, o);
    }
    function Sc(e) {
      const t = vo(e, {}),
        n = { context: { beacon: !0 } };
      if (!U(t)) {
        const e = {};
        (e.analytics = t), (n.experienceCloud = e);
      }
      return n;
    }
    function Ec(e, t, n) {
      const r = (function (e, t) {
        return bo(e, t, no());
      })(Sc(e), t);
      return (r.notifications = n), r;
    }
    function Tc(e, t, n) {
      const r = De(),
        o = re(),
        { parameters: i, profileParameters: c, order: s, product: u } = e,
        a = {
          id: r,
          type: t,
          timestamp: o,
          parameters: i,
          profileParameters: c,
          order: s,
          product: u,
        };
      return U(n) || (a.tokens = n), a;
    }
    function Cc(e) {
      const t = Yr(it());
      return (function (e, t) {
        return "navigator" in (n = Ye) && "sendBeacon" in n.navigator
          ? (function (e, t, n) {
              return e.navigator.sendBeacon(t, n);
            })(Ye, e, t)
          : (function (e, t, n) {
              const r = { "Content-Type": ["text/plain"] },
                o = { method: "POST" };
              (o.url = t),
                (o.data = n),
                (o.credentials = !0),
                (o.async = !1),
                (o.headers = r);
              try {
                e(o);
              } catch (e) {
                return !1;
              }
              return !0;
            })(ii, e, t);
        var n;
      })(t, JSON.stringify(e))
        ? (zt("Beacon data sent", t, e), !0)
        : (Bt("Beacon data sent failed", t, e), !1);
    }
    function kc(e, t, n) {
      const r = Vr(it().globalMboxName),
        o = Tc(ho({}, r), t, [n]),
        i = Ec(De(), r, [o]);
      zt("Event handler notification", e, o),
        Zt({ source: e, event: t, request: i }),
        Cc(i);
    }
    function Ic(e, t, n) {
      const r = Vr(e),
        o = Tc(ho({}, r), t, [n]);
      o.mbox = { name: e };
      const i = Ec(De(), r, [o]);
      zt("Mbox event handler notification", e, o),
        Zt({ mbox: e, event: t, request: i }),
        Cc(i);
    }
    function Nc(e) {
      const t = it().globalMboxName,
        n = [],
        r = Ke;
      if (
        (q((e) => {
          const { mbox: t, data: o } = e;
          if (m(o)) return;
          const { eventTokens: i = [] } = o;
          U(i) ||
            n.push(
              (function (e, t, n) {
                const { name: r, state: o } = e,
                  i = Tc(e, t, n);
                return (i.mbox = { name: r, state: o }), i;
              })(t, r, i)
            );
        }, e),
        U(n))
      )
        return;
      const o = Ec(t, {}, n);
      zt("Mboxes rendered notification", n),
        Zt({ source: "prefetchMboxes", event: "rendered", request: o }),
        Cc(o);
    }
    function Oc(e, t, n) {
      const r = Vr(it().globalMboxName),
        o = Tc(ho({}, r), t, [n]);
      o.view = { name: e };
      const i = Ec(De(), r, [o]);
      zt("View event handler notification", e, o),
        Zt({ view: e, event: t, request: i }),
        Cc(i);
    }
    function _c(e) {
      const { viewName: t, impressionId: n } = e,
        r = Vr(it().globalMboxName),
        o = Tc(ho({}, r), Ke, []);
      (o.view = { name: t }),
        zt("View triggered notification", t),
        (function (e, t, n) {
          return xo(Sc(e), t).then((e) => ((e.notifications = n), e));
        })(t, r, [o]).then((e) => {
          (e.impressionId = n),
            Zt({ view: t, event: "triggered", request: e }),
            Cc(e);
        });
    }
    function Ac(e) {
      if (m(e)) return;
      const { view: t, data: n = {} } = e,
        { eventTokens: r = [] } = n,
        { name: o, impressionId: i } = t,
        c = wc(o);
      if (m(c)) return;
      const s = Ec(o, {}, [
        (function (e, t, n) {
          const { name: r, state: o } = e,
            i = Tc(e, t, n);
          return (i.view = { name: r, state: o }), i;
        })(c, Ke, r),
      ]);
      (s.impressionId = i),
        zt("View rendered notification", o, r),
        Zt({ view: o, event: "rendered", request: s }),
        Cc(s);
    }
    const qc = {},
      Mc = So("metrics"),
      Pc = () => Bo("metric"),
      Rc = (e) => zo("metric", e);
    function Dc(e, t, n) {
      if (!m(qc[e])) return;
      const r = T(qc);
      U(r) ||
        q((e) => {
          q((r) => {
            const o = qc[e][r];
            !(function (e, t, n) {
              Fn(n).off(e, t);
            })(t, o, n);
          }, T(qc[e])),
            delete qc[e];
        }, r);
    }
    function Lc(e, t, n, r) {
      const { type: o, selector: i, eventToken: c } = n,
        s = R(o + ":" + i + ":" + c),
        u = () => r(e, o, c);
      !(function (e, t) {
        "click" === e && Mi("at-element-click-tracking", t);
      })(o, i),
        t
          ? (function (e, t) {
              return !m(qc[e]) && !m(qc[e][t]);
            })(e, s) ||
            (Dc(e, o, i),
            (function (e, t, n) {
              (qc[e] = qc[e] || {}), (qc[e][t] = n);
            })(e, s, u),
            bc(o, u, i))
          : bc(o, u, i);
    }
    function jc(e, t, n, r) {
      return (function (e) {
        return Fi(e[Ve])
          .then(() => {
            Zt({ metric: e });
            return h({ found: !0 }, e);
          })
          ["catch"](
            () => (
              Bt("metric element not found", e),
              Zt({ metric: e, message: "metric element not found" }),
              e
            )
          );
      })(n).then((n) => {
        n.found && Lc(e, t, n, r);
      });
    }
    function Vc(e, t, n, r) {
      return mn(ne((n) => jc(e, t, n, r), n))
        .then(Pc)
        ["catch"](Rc);
    }
    function Hc(e) {
      const { name: t } = e;
      return Vc(t, !1, Mc(e), Ic);
    }
    function Uc(e) {
      const { name: t } = e;
      return Vc(t, !0, Mc(e), Oc);
    }
    function Bc(e) {
      return Vc("pageLoadMetrics", !1, Mc(e), kc);
    }
    function zc(e) {
      return Vc("prefetchMetrics", !1, Mc(e), kc);
    }
    const Fc = So(je),
      $c = So("cssSelector"),
      Jc = (e) => zo("render", e),
      Zc = (e) => Eo(Io)(e) && Uo(e);
    function Gc(e) {
      const t = ne($c, e);
      var n;
      (n = Ao(t)), fr(it(), n);
    }
    function Kc(e) {
      const t = ne($c, e);
      var n;
      (n = _o(t)), lr(it(), n);
    }
    function Xc(e) {
      const t = O(No, qo(e));
      return _(ne(Fc, t));
    }
    function Yc(e) {
      return x(e) && "setJson" !== e.type;
    }
    function Wc(e, t, n) {
      const { eventToken: r, responseTokens: o, content: i } = e;
      return (function (e) {
        return mn(ne(yc, e)).then(vc);
      })(
        (function (e, t, n) {
          return ne((e) => h({ key: t, page: n }, e), O(Yc, e));
        })(i, t, n)
      )
        .then(() => Bo("render", { eventToken: r, responseTokens: o }))
        ["catch"](Jc);
    }
    function Qc(e) {
      return x(e) && "json" !== e.type;
    }
    function es(e, t) {
      return ne(e, O(Qc, qo(t)));
    }
    function ts(e, t, n) {
      const r = { status: Ze, [e]: t },
        o = ne(Ho, O(Io, n)),
        i = {};
      return U(o) || ((r.status = $e), (i.errors = o)), U(i) || (r.data = i), r;
    }
    function ns(e, t, n) {
      return mn(es((e) => Wc(e, !0), e))
        .then(t)
        .then((t) => (n(e), t));
    }
    function rs(e, t, n, r) {
      const { name: o } = t;
      return mn(es((e) => Wc(e, o, n), t))
        .then((n) =>
          (function (e, t, n) {
            const r = { status: Ze, [e]: t },
              o = ne(Ho, O(Io, n)),
              i = ne(Ho, O(Zc, n)),
              c = _o(ne(Po, i)),
              s = _o(ne(Ro, i)),
              u = {};
            return (
              U(o) || ((r.status = $e), (u.errors = o)),
              U(c) || (u.eventTokens = c),
              U(s) || (u.responseTokens = s),
              U(u) || (r.data = u),
              r
            );
          })(e, t, n)
        )
        .then((e) => (r(t), e));
    }
    function os(e) {
      return ns(e, (t) => ts("mbox", e, t), Hc);
    }
    function is(e) {
      return rs("mbox", e, !0, Hc);
    }
    function cs(e) {
      Gc(Xc(e));
    }
    function ss(e) {
      let t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
      if (t) return;
      const { execute: n = {} } = e,
        { pageLoad: r = {} } = n;
      U(r) || cs(r);
    }
    function us(e) {
      Gc(Xc(e)), $n("#at-views") && or("#at-views");
    }
    var as = { exports: {} };
    function fs() {}
    (fs.prototype = {
      on: function (e, t, n) {
        var r = this.e || (this.e = {});
        return (r[e] || (r[e] = [])).push({ fn: t, ctx: n }), this;
      },
      once: function (e, t, n) {
        var r = this;
        function o() {
          r.off(e, o), t.apply(n, arguments);
        }
        return (o._ = t), this.on(e, o, n);
      },
      emit: function (e) {
        for (
          var t = [].slice.call(arguments, 1),
            n = ((this.e || (this.e = {}))[e] || []).slice(),
            r = 0,
            o = n.length;
          r < o;
          r++
        )
          n[r].fn.apply(n[r].ctx, t);
        return this;
      },
      off: function (e, t) {
        var n = this.e || (this.e = {}),
          r = n[e],
          o = [];
        if (r && t)
          for (var i = 0, c = r.length; i < c; i++)
            r[i].fn !== t && r[i].fn._ !== t && o.push(r[i]);
        return o.length ? (n[e] = o) : delete n[e], this;
      },
    }),
      (as.exports = fs),
      (as.exports.TinyEmitter = fs);
    const ls = new (0, as.exports)();
    function ds(e, t) {
      !(function (e, t, n) {
        e.emit(t, n);
      })(ls, e, t);
    }
    function ps(e, t) {
      !(function (e, t, n) {
        e.on(t, n);
      })(ls, e, t);
    }
    function hs(e) {
      return { type: "redirect", content: e.url };
    }
    function ms(e) {
      const t = {};
      if (U(e)) return t;
      const n = [],
        r = [],
        o = [];
      q((e) => {
        switch (e.action) {
          case "setContent":
            J((t = e).selector) && J(t.cssSelector)
              ? o.push(
                  (function (e) {
                    const t = { type: "setHtml" };
                    return (
                      (t.content = e.content),
                      (t.selector = e.selector),
                      (t.cssSelector = e.cssSelector),
                      t
                    );
                  })(e)
                )
              : n.push({ type: "html", content: e.content });
            break;
          case "setJson":
            U(e.content) ||
              q((e) => n.push({ type: "json", content: e }), e.content);
            break;
          case "setText":
            o.push(
              (function (e) {
                const t = { type: "setText" };
                return (
                  (t.content = e.content),
                  (t.selector = e.selector),
                  (t.cssSelector = e.cssSelector),
                  t
                );
              })(e)
            );
            break;
          case "appendContent":
            o.push(
              (function (e) {
                const t = { type: "appendHtml" };
                return (
                  (t.content = e.content),
                  (t.selector = e.selector),
                  (t.cssSelector = e.cssSelector),
                  t
                );
              })(e)
            );
            break;
          case "prependContent":
            o.push(
              (function (e) {
                const t = { type: "prependHtml" };
                return (
                  (t.content = e.content),
                  (t.selector = e.selector),
                  (t.cssSelector = e.cssSelector),
                  t
                );
              })(e)
            );
            break;
          case "replaceContent":
            o.push(
              (function (e) {
                const t = { type: "replaceHtml" };
                return (
                  (t.content = e.content),
                  (t.selector = e.selector),
                  (t.cssSelector = e.cssSelector),
                  t
                );
              })(e)
            );
            break;
          case "insertBefore":
            o.push(
              (function (e) {
                const t = { type: "insertBefore" };
                return (
                  (t.content = e.content),
                  (t.selector = e.selector),
                  (t.cssSelector = e.cssSelector),
                  t
                );
              })(e)
            );
            break;
          case "insertAfter":
            o.push(
              (function (e) {
                const t = { type: "insertAfter" };
                return (
                  (t.content = e.content),
                  (t.selector = e.selector),
                  (t.cssSelector = e.cssSelector),
                  t
                );
              })(e)
            );
            break;
          case "customCode":
            o.push(
              (function (e) {
                const t = { type: "customCode" };
                return (
                  (t.content = e.content),
                  (t.selector = e.selector),
                  (t.cssSelector = e.cssSelector),
                  t
                );
              })(e)
            );
            break;
          case "setAttribute":
            o.push(
              (function (e) {
                const t = {};
                if (
                  ((t.selector = e.selector),
                  (t.cssSelector = e.cssSelector),
                  e.attribute === He)
                )
                  return (t.type = "setImageSource"), (t.content = e.value), t;
                t.type = "setAttribute";
                const n = {};
                return (n[e.attribute] = e.value), (t.content = n), t;
              })(e)
            );
            break;
          case "setStyle":
            o.push(
              (function (e) {
                const { style: t = {} } = e,
                  n = {};
                return (
                  (n.selector = e.selector),
                  (n.cssSelector = e.cssSelector),
                  m(t.left) || m(t.top)
                    ? m(t.width) || m(t.height)
                      ? ((n.type = "setStyle"), (n.content = t), n)
                      : ((n.type = "resize"), (n.content = t), n)
                    : ((n.type = "move"), (n.content = t), n)
                );
              })(e)
            );
            break;
          case "remove":
            o.push(
              (function (e) {
                const t = { type: "remove" };
                return (
                  (t.selector = e.selector), (t.cssSelector = e.cssSelector), t
                );
              })(e)
            );
            break;
          case "rearrange":
            o.push(
              (function (e) {
                const t = {};
                (t.from = e.from), (t.to = e.to);
                const n = { type: "rearrange" };
                return (
                  (n.selector = e.selector),
                  (n.cssSelector = e.cssSelector),
                  (n.content = t),
                  n
                );
              })(e)
            );
            break;
          case "redirect":
            n.push(hs(e));
            break;
          case "trackClick":
            r.push({
              type: "click",
              selector: e.selector,
              eventToken: e.clickTrackId,
            });
        }
        var t;
      }, e);
      const i = {};
      !U(o) && n.push({ type: "actions", content: o });
      !U(n) && (i.options = n);
      if ((!U(r) && (i.metrics = r), U(i))) return t;
      const c = {};
      return (c.pageLoad = i), (t.execute = c), t;
    }
    function gs(e, t, n) {
      return n
        ? ms(t)
        : (function (e, t) {
            const n = {};
            if (U(t)) return n;
            const r = [],
              o = [];
            q((e) => {
              switch (e.action) {
                case "setContent":
                  r.push({ type: "html", content: e.content });
                  break;
                case "setJson":
                  U(e.content) ||
                    q((e) => r.push({ type: "json", content: e }), e.content);
                  break;
                case "redirect":
                  r.push(hs(e));
                  break;
                case "signalClick":
                  o.push({ type: "click", eventToken: e.clickTrackId });
              }
            }, t);
            const i = { name: e };
            if ((!U(r) && (i.options = r), !U(o) && (i.metrics = o), U(i)))
              return n;
            const c = {},
              s = [i];
            return (c.mboxes = s), (n.execute = c), n;
          })(e, t);
    }
    const vs = (e) => !U(O(Io, e));
    function ys(e) {
      const { status: t, data: n } = e,
        r = { status: t, pageLoad: !0 };
      return m(n) || (r.data = n), r;
    }
    function bs(e) {
      const { status: t, mbox: n, data: r } = e,
        { name: o } = n,
        i = { status: t, mbox: o };
      return m(r) || (i.data = r), i;
    }
    function xs(e) {
      const { status: t, view: n, data: r } = e,
        { name: o } = n,
        i = { status: t, view: o };
      return m(r) || (i.data = r), i;
    }
    function ws(e) {
      const { status: t, data: n } = e,
        r = { status: t, prefetchMetrics: !0 };
      return m(n) || (r.data = n), r;
    }
    function Ss(e) {
      if (m(e)) return [null];
      const t = ne(ys, [e]);
      return vs(t) && Bt("Page load rendering failed", e), t;
    }
    function Es(e) {
      if (m(e)) return [null];
      const t = ne(bs, e);
      return vs(t) && Bt("Mboxes rendering failed", e), t;
    }
    function Ts(e) {
      let t =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Nc;
      if (m(e)) return [null];
      const n = ne(bs, e);
      return vs(n) && Bt("Mboxes rendering failed", e), t(e), n;
    }
    function Cs(e) {
      let t =
        arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : Ac;
      if (m(e)) return [null];
      const n = ne(xs, [e]);
      vs(n) && Bt("View rendering failed", e);
      const { view: r } = e;
      return r.page ? (t(e), n) : n;
    }
    function ks(e) {
      if (m(e)) return [null];
      const t = ne(ws, [e]);
      return vs(t) && Bt("Prefetch rendering failed", e), t;
    }
    function Is(e) {
      const t = _([Ss(e[0]), Es(e[1]), Ts(e[2]), ks(e[3])]),
        n = O(To, t),
        r = O(Io, n);
      return U(r) ? pn(n) : hn(r);
    }
    function Ns(e) {
      return hn(e);
    }
    function Os(e, t) {
      if (U(t)) return;
      const { options: n } = t;
      U(n) ||
        q((t) => {
          if ("html" !== t.type) return;
          const { content: n } = t;
          (t.type = "actions"),
            (t.content = [{ type: "setHtml", selector: e, content: n }]);
        }, n);
    }
    function _s(e, t) {
      const { metrics: n } = t;
      if (U(n)) return;
      const { name: r } = t;
      q((t) => {
        (t.name = r), (t.selector = t.selector || e);
      }, n);
    }
    function As(e, t) {
      const n = h({}, t),
        { execute: r = {}, prefetch: o = {} } = n,
        { pageLoad: i = {}, mboxes: c = [] } = r,
        { mboxes: s = [] } = o;
      return (
        Os(e, i),
        q((t) => Os(e, t), c),
        q((t) => _s(e, t), c),
        q((t) => Os(e, t), s),
        q((t) => _s(e, t), s),
        n
      );
    }
    function qs(e) {
      const { prefetch: t = {} } = e,
        { views: n = [] } = t;
      U(n) ||
        (function (e) {
          q(xc, e);
        })(n);
    }
    function Ms(e) {
      const t = [],
        { execute: n = {} } = e,
        { pageLoad: r = {}, mboxes: o = [] } = n;
      U(r)
        ? t.push(pn(null))
        : t.push(
            (function (e) {
              return ns(e, (t) => ts("pageLoad", e, t), Bc);
            })(r)
          ),
        U(o)
          ? t.push(pn(null))
          : t.push(
              (function (e) {
                return mn(ne(os, e));
              })(o)
            );
      const { prefetch: i = {} } = e,
        { mboxes: c = [], metrics: s = [] } = i;
      return (
        U(c)
          ? t.push(pn(null))
          : t.push(
              (function (e) {
                return mn(ne(is, e));
              })(c)
            ),
        g(s) && !U(s)
          ? t.push(
              (function (e) {
                return mn([zc(e)]).then(ts);
              })(i)
            )
          : t.push(pn(null)),
        pr(),
        mn(t).then(Is)["catch"](Ns)
      );
    }
    function Ps(e, t) {
      fe(() => e.location.replace(t));
    }
    function Rs(e) {
      return J(e) || Hn(e) ? e : "head";
    }
    function Ds(e) {
      Mi("at-element-marker", e);
    }
    function Ls() {
      let e =
        arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
      const { prefetch: t = {} } = e,
        { execute: n = {} } = e,
        { pageLoad: r = {} } = n,
        { mboxes: o = [] } = n,
        { pageLoad: i = {} } = t,
        { views: c = [] } = t,
        { mboxes: s = [] } = t;
      return U(r) && U(o) && U(i) && U(c) && U(s);
    }
    function js(e) {
      let t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
      const { selector: n, response: r } = e;
      if (Ls(r))
        return zt(Fe), Ds(n), pr(), Dn({}), ds("no-offers-event"), pn();
      const o = As(n, r),
        i = mi(o);
      if (!U(i)) {
        const { url: e } = i;
        return (
          zt("Redirect action", i),
          Ln({ url: e }),
          ds("redirect-offer-event"),
          Ps(Ye, e),
          pn()
        );
      }
      return (
        Mn({}),
        qs(o),
        ds("cache-updated-event"),
        ss(o, t),
        Ms(o)
          .then((e) => {
            U(e) || Pn({ execution: e });
          })
          ["catch"]((e) => Rn({ error: e }))
      );
    }
    const Vs = "[page-init]";
    function Hs(e) {
      Bt(Vs, "View delivery error", e),
        ds("no-offers-event"),
        Zt({ source: Vs, error: e }),
        pr();
    }
    function Us(e) {
      let t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
      const n = { selector: "head", response: e };
      zt(Vs, "response", e),
        Zt({ source: Vs, response: e }),
        js(n, t)["catch"](Hs);
    }
    function Bs(e) {
      const t = (function (e) {
          return e.serverState;
        })(e),
        { request: n, response: r } = t;
      zt(Vs, "Using server state"), Zt({ source: Vs, serverState: t });
      const o = (function (e, t) {
        const n = h({}, t),
          { execute: r, prefetch: o } = n,
          i = e.pageLoadEnabled,
          c = e.viewsEnabled;
        return (
          r && (n.execute.mboxes = void 0),
          r && !i && (n.execute.pageLoad = void 0),
          o && (n.prefetch.mboxes = void 0),
          o && !c && (n.prefetch.views = void 0),
          n
        );
      })(e, r);
      ss(o),
        (function (e) {
          const { prefetch: t = {} } = e,
            { views: n = [] } = t;
          if (U(n)) return;
          Kc(_(ne(Xc, n)));
        })(o),
        (function (e) {
          window.__target_telemetry.addServerStateEntry(e);
        })(n),
        Ni({ request: n, response: o })
          .then((e) => Us(e, !0))
          ["catch"](Hs);
    }
    function zs() {
      if (!Rt() && !Lt()) return Bt(Vs, Ue), void Zt({ source: Vs, error: Ue });
      const e = it();
      if (
        (function (e) {
          const t = e.serverState;
          if (U(t)) return !1;
          const { request: n, response: r } = t;
          return !U(n) && !U(r);
        })(e)
      )
        return void Bs(e);
      const t = e.pageLoadEnabled,
        n = e.viewsEnabled;
      if (!t && !n)
        return (
          zt(Vs, "Page load disabled"),
          void Zt({ source: Vs, error: "Page load disabled" })
        );
      dr();
      const r = {};
      if (t) {
        const e = { pageLoad: {} };
        r.execute = e;
      }
      if (n) {
        const e = { views: [{}] };
        r.prefetch = e;
      }
      const o = e.timeout;
      zt(Vs, "request", r), Zt({ source: Vs, request: r });
      const i = { request: r, timeout: o };
      bn() && !xn()
        ? wn()
            .then(() => {
              qi(i).then(Us)["catch"](Hs);
            })
            ["catch"](Hs)
        : qi(i).then(Us)["catch"](Hs);
    }
    function Fs() {
      const e = { valid: !0 };
      return e;
    }
    function $s(e) {
      const t = { valid: !1 };
      return (t[$e] = e), t;
    }
    function Js(e) {
      return $(e)
        ? $s("mbox option is required")
        : e.length > 250
        ? $s("mbox option is too long")
        : Fs();
    }
    function Zs(e) {
      return { action: "redirect", url: e.content };
    }
    function Gs(e) {
      const t = [];
      return (
        q((e) => {
          const { type: n } = e;
          switch (n) {
            case "setHtml":
              t.push(
                (function (e) {
                  const t = { action: "setContent" };
                  return (
                    (t.content = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "setText":
              t.push(
                (function (e) {
                  const t = { action: "setText" };
                  return (
                    (t.content = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "appendHtml":
              t.push(
                (function (e) {
                  const t = { action: "appendContent" };
                  return (
                    (t.content = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "prependHtml":
              t.push(
                (function (e) {
                  const t = { action: "prependContent" };
                  return (
                    (t.content = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "replaceHtml":
              t.push(
                (function (e) {
                  const t = { action: "replaceContent" };
                  return (
                    (t.content = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "insertBefore":
              t.push(
                (function (e) {
                  const t = { action: "insertBefore" };
                  return (
                    (t.content = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "insertAfter":
              t.push(
                (function (e) {
                  const t = { action: "insertAfter" };
                  return (
                    (t.content = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "customCode":
              t.push(
                (function (e) {
                  const t = { action: "customCode" };
                  return (
                    (t.content = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "setAttribute":
              t.push(
                (function (e) {
                  const t = T(e.content)[0],
                    n = { action: "setAttribute" };
                  return (
                    (n.attribute = t),
                    (n.value = e.content[t]),
                    (n.selector = e.selector),
                    (n.cssSelector = e.cssSelector),
                    n
                  );
                })(e)
              );
              break;
            case "setImageSource":
              t.push(
                (function (e) {
                  const t = { action: "setAttribute" };
                  return (
                    (t.attribute = He),
                    (t.value = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "setStyle":
              t.push(
                (function (e) {
                  const t = { action: "setStyle" };
                  return (
                    (t.style = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "resize":
              t.push(
                (function (e) {
                  const t = { action: "setStyle" };
                  return (
                    (t.style = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "move":
              t.push(
                (function (e) {
                  const t = { action: "setStyle" };
                  return (
                    (t.style = e.content),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "remove":
              t.push(
                (function (e) {
                  const t = { action: "remove" };
                  return (
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "rearrange":
              t.push(
                (function (e) {
                  const t = { action: "rearrange" };
                  return (
                    (t.from = e.content.from),
                    (t.to = e.content.to),
                    (t.selector = e.selector),
                    (t.cssSelector = e.cssSelector),
                    t
                  );
                })(e)
              );
              break;
            case "redirect":
              t.push(Zs(e));
          }
        }, e),
        t
      );
    }
    function Ks(e) {
      if (U(e)) return [];
      const t = [];
      return (
        q((e) => {
          "click" === e.type &&
            (J(e.selector)
              ? t.push({
                  action: "trackClick",
                  selector: e.selector,
                  clickTrackId: e.eventToken,
                })
              : t.push({ action: "signalClick", clickTrackId: e.eventToken }));
        }, e),
        t
      );
    }
    function Xs(e) {
      if (U(e)) return [];
      const t = [],
        n = [],
        r = [],
        { options: o = [], metrics: i = [] } = e;
      q((e) => {
        const { type: o } = e;
        switch (o) {
          case "html":
            t.push(e.content);
            break;
          case "json":
            n.push(e.content);
            break;
          case "redirect":
            r.push(Zs(e));
            break;
          case "actions":
            r.push.apply(r, Gs(e.content));
        }
      }, o),
        U(t) || r.push({ action: "setContent", content: t.join("") }),
        U(n) || r.push({ action: "setJson", content: n });
      const c = Ks(i);
      return U(c) || r.push.apply(r, c), r;
    }
    const Ys = "[getOffer()]";
    function Ws(e, t) {
      const n = (function (e) {
        const { execute: t = {} } = e,
          { pageLoad: n = {} } = t,
          { mboxes: r = [] } = t,
          o = [];
        return o.push.apply(o, Xs(n)), o.push.apply(o, _(ne(Xs, r))), o;
      })(t);
      e[Ze](n);
    }
    function Qs(e) {
      const t = (function (e) {
          if (!x(e)) return $s(Be);
          const t = Js(e.mbox);
          return t[Je]
            ? w(e[Ze])
              ? w(e[$e])
                ? Fs()
                : $s("error option is required")
              : $s("success option is required")
            : t;
        })(e),
        n = t[$e];
      if (!t[Je])
        return Bt(Ys, n), void Zt({ source: Ys, options: e, error: n });
      if (!Rt() && !Lt())
        return (
          fe(e[$e]("warning", Ue)),
          Bt(Ys, Ue),
          void Zt({ source: Ys, options: e, error: Ue })
        );
      const r = (t) => Ws(e, t),
        o = (t) =>
          (function (e, t) {
            const n = t.status || "unknown";
            e[$e](n, t);
          })(e, t);
      zt(Ys, e),
        Zt({ source: Ys, options: e }),
        bn() && !xn()
          ? wn().then(() => {
              Ai(e).then(r)["catch"](o);
            })
          : Ai(e).then(r)["catch"](o);
    }
    const eu = "[getOffers()]";
    function tu(e) {
      const t = (function (e) {
          if (!x(e)) return $s(Be);
          const { request: t } = e;
          if (!x(t)) return $s("request option is required");
          const { execute: n, prefetch: r } = t;
          return x(n) || x(r) ? Fs() : $s("execute or prefetch is required");
        })(e),
        n = t[$e];
      return t[Je]
        ? Rt() || Lt()
          ? (zt(eu, e),
            Zt({ source: eu, options: e }),
            !bn() || xn() ? qi(e) : wn().then(() => qi(e)))
          : (Bt(eu, Ue),
            Zt({ source: eu, options: e, error: Ue }),
            hn(new Error(Ue)))
        : (Bt(eu, n), Zt({ source: eu, options: e, error: n }), hn(t));
    }
    const nu = "[applyOffer()]";
    function ru(e) {
      const t = Rs(e.selector),
        n = R(t);
      Oe.timeStart(n);
      const r = (function (e) {
          if (!x(e)) return $s(Be);
          const t = Js(e.mbox);
          if (!t[Je]) return t;
          const n = e.offer;
          return g(n) ? Fs() : $s("offer option is required");
        })(e),
        o = r[$e];
      if (!r[Je])
        return (
          Bt(nu, e, o), Zt({ source: nu, options: e, error: o }), void Ds(t)
        );
      if (!Rt() && !Lt())
        return (
          Bt(nu, Ue), Zt({ source: nu, options: e, error: Ue }), void Ds(t)
        );
      (e.selector = t),
        zt(nu, e),
        Zt({ source: nu, options: e }),
        (function (e) {
          const { mbox: t, selector: n, offer: r } = e,
            o = it(),
            i = t === o.globalMboxName;
          if (U(r)) return zt(Fe), Ds(n), pr(), void Dn({ mbox: t });
          const c = As(n, gs(t, r, i)),
            s = mi(c);
          if (!U(s)) {
            const { url: e } = s;
            return zt("Redirect action", s), Ln({ url: e }), void Ps(Ye, e);
          }
          Mn({ mbox: t }),
            ss(c),
            Ms(c)
              .then((e) => {
                U(e) || Pn({ mbox: t, execution: e });
              })
              ["catch"]((e) => Rn({ error: e }));
        })(e);
      const i = Oe.timeEnd(n);
      Oe.clearTiming(n), window.__target_telemetry.addRenderEntry(n, i);
    }
    function ou(e) {
      const t = Rs(e.selector),
        n = R(t);
      Oe.timeStart(n);
      const r = (function (e) {
          if (!x(e)) return $s(Be);
          const { response: t } = e;
          return x(t) ? Fs() : $s("response option is required");
        })(e),
        o = r[$e];
      return r[Je]
        ? Rt() || Lt()
          ? ((e.selector = t),
            zt("[applyOffers()]", e),
            Zt({ source: "[applyOffers()]", options: e }),
            js(e).then(() => {
              const e = Oe.timeEnd(n);
              Oe.clearTiming(n), window.__target_telemetry.addRenderEntry(n, e);
            }))
          : (Bt("[applyOffers()]", Ue),
            Zt({ source: "[applyOffers()]", options: e, error: Ue }),
            Ds(t),
            hn(new Error(Ue)))
        : (Bt("[applyOffers()]", e, o),
          Zt({ source: "[applyOffers()]", options: e, error: o }),
          Ds(t),
          hn(r));
    }
    function iu(e) {
      const t = it().globalMboxName,
        { consumerId: n = t, request: r } = e,
        o = (function (e) {
          if (!x(e)) return $s(Be);
          const { request: t } = e;
          if (!x(t)) return $s("request option is required");
          const { execute: n, prefetch: r, notifications: o } = t;
          return x(n) || x(r)
            ? $s("execute or prefetch is not allowed")
            : g(o)
            ? Fs()
            : $s("notifications are required");
        })(e),
        i = o[$e];
      if (!o[Je])
        return (
          Bt("[sendNotifications()]", i),
          void Zt({ source: "[sendNotifications()]", options: e, error: i })
        );
      if (!Rt() && !Lt())
        return (
          Bt("[sendNotifications()]", Ue),
          void Zt({ source: "[sendNotifications()]", options: e, error: Ue })
        );
      zt("[sendNotifications()]", e),
        Zt({ source: "[sendNotifications()]", options: e });
      const { notifications: c } = r,
        s = Ec(n, {}, c);
      !bn() || xn()
        ? Cc(s)
        : Bt("[sendNotifications()]", "Adobe Target is not opted in");
    }
    const cu = "[trackEvent()]";
    function su(e) {
      if (bn() && !xn())
        return (
          Bt("Track event request failed", "Adobe Target is not opted in"),
          void e[$e]($e, "Adobe Target is not opted in")
        );
      !(function (e) {
        const { mbox: t, type: n = Ke } = e,
          r = x(e.params) ? e.params : {},
          o = h({}, Vr(t), r),
          i = Tc(ho({}, o), n, []);
        if (((i.mbox = { name: t }), Cc(Ec(t, o, [i]))))
          return zt("Track event request succeeded", e), void e[Ze]();
        Bt("Track event request failed", e),
          e[$e]("unknown", "Track event request failed");
      })(e);
    }
    function uu(e) {
      const t = e[Ve],
        n = e[Le],
        r = j(Fn(t)),
        o = () =>
          (function (e) {
            return su(e), !e.preventDefault;
          })(e);
      q((e) => bc(n, o, e), r);
    }
    function au(e) {
      const t = (function (e) {
          if (!x(e)) return $s(Be);
          const t = Js(e.mbox);
          return t[Je] ? Fs() : t;
        })(e),
        n = t[$e];
      if (!t[Je])
        return Bt(cu, n), void Zt({ source: cu, options: e, error: n });
      const r = (function (e, t) {
        const n = t.mbox,
          r = h({}, t),
          o = x(t.params) ? t.params : {};
        return (
          (r.params = h({}, Vr(n), o)),
          (r.timeout = Kr(e, t.timeout)),
          (r[Ze] = w(t[Ze]) ? t[Ze] : ye),
          (r[$e] = w(t[$e]) ? t[$e] : ye),
          r
        );
      })(it(), e);
      if (!Rt() && !Lt())
        return (
          Bt(cu, Ue),
          fe(r[$e]("warning", Ue)),
          void Zt({ source: cu, options: e, error: Ue })
        );
      zt(cu, r),
        Zt({ source: cu, options: r }),
        (function (e) {
          const t = e[Le],
            n = e[Ve];
          return J(t) && (J(n) || Hn(n));
        })(r)
          ? uu(r)
          : su(r);
    }
    const fu = [];
    let lu = 0;
    function du(e) {
      return (
        us(e),
        (function (e) {
          const { page: t } = e;
          return rs("view", e, t, Uc);
        })(e)
          .then(Cs)
          .then((e) => {
            U(e) || Pn({ execution: e });
          })
          ["catch"]((e) => {
            Bt("View rendering failed", e), Rn({ error: e });
          })
      );
    }
    function pu() {
      for (; fu.length > 0; ) {
        const e = fu.pop(),
          { viewName: t, page: n } = e,
          r = wc(t, e);
        m(r) ? n && _c(e) : du(r);
      }
    }
    function hu() {
      (lu = 1), pu();
    }
    function mu(e, t) {
      if (!it().viewsEnabled)
        return void Bt("[triggerView()]", "Views are not enabled");
      if (!P(e) || $(e))
        return (
          Bt("[triggerView()]", "View name should be a non-empty string", e),
          void Zt({
            source: "[triggerView()]",
            view: e,
            error: "View name should be a non-empty string",
          })
        );
      const n = e.toLowerCase(),
        r = (function (e, t) {
          const n = {};
          return (
            (n.viewName = e),
            (n.impressionId = De()),
            (n.page = !0),
            U(t) || (n.page = !!t.page),
            n
          );
        })(n, t);
      if (Lt())
        return (
          zt("[triggerView()]", n, r),
          void (function (e) {
            const t = e.viewName;
            Ye._AT.currentView = t;
          })(r)
        );
      zt("[triggerView()]", n, r),
        Zt({ source: "[triggerView()]", view: n, options: r }),
        (function (e) {
          fu.push(e), 0 !== lu && pu();
        })(r);
    }
    ps("cache-updated-event", hu),
      ps("no-offers-event", hu),
      ps("redirect-offer-event", hu);
    const gu =
        "function has been deprecated. Please use getOffer() and applyOffer() functions instead.",
      vu =
        "adobe.target.registerExtension() function has been deprecated. Please review the documentation for alternatives.",
      yu = "mboxCreate() " + gu,
      bu = "mboxDefine() " + gu,
      xu = "mboxUpdate() " + gu;
    function wu() {
      Bt(vu, arguments);
    }
    function Su() {
      Bt(yu, arguments);
    }
    function Eu() {
      Bt(bu, arguments);
    }
    function Tu() {
      Bt(xu, arguments);
    }
    const Cu = /^tgt:.+/i,
      ku = (e) => Cu.test(e);
    function Iu(e, t) {
      try {
        localStorage.setItem(e, JSON.stringify(t));
      } catch (e) {
        Object.keys(localStorage)
          .filter(ku)
          .forEach((e) => localStorage.removeItem(e));
      }
    }
    function Nu() {
      function e(e) {
        return "tgt:tlm:" + e;
      }
      function t(e) {
        const t = localStorage.getItem(e);
        let n = parseInt(t, 10);
        return Number.isNaN(n) && (n = -1), n;
      }
      function n(e, t) {
        localStorage.setItem(e, t);
      }
      function r(t) {
        const n = e(t),
          r = localStorage.getItem(n);
        return localStorage.removeItem(n), r;
      }
      return {
        addEntry: function (r) {
          !(function (t, n) {
            Iu(e(t), n);
          })(
            (function () {
              const e = t("tgt:tlm:upper") + 1;
              return n("tgt:tlm:upper", e), e;
            })(),
            r
          );
        },
        getAndClearEntries: function () {
          return (function () {
            const e = [],
              o = t("tgt:tlm:lower") || -1,
              i = t("tgt:tlm:upper") || -1;
            for (let t = i; t > o; t -= 1) {
              const n = r(t);
              n && e.push(JSON.parse(n));
            }
            return n("tgt:tlm:lower", i), e;
          })();
        },
        hasEntries: function () {
          const n = e(t("tgt:tlm:upper"));
          return !!localStorage.getItem(n);
        },
      };
    }
    return {
      init: function (e, t, n) {
        if (e.adobe && e.adobe.target && void 0 !== e.adobe.target.getOffer)
          return void Bt("Adobe Target has already been initialized.");
        ot(n);
        const r = it(),
          o = r.version;
        if (
          ((e.adobe.target.VERSION = o),
          (e.adobe.target.event = {
            LIBRARY_LOADED: "at-library-loaded",
            REQUEST_START: "at-request-start",
            REQUEST_SUCCEEDED: "at-request-succeeded",
            REQUEST_FAILED: "at-request-failed",
            CONTENT_RENDERING_START: "at-content-rendering-start",
            CONTENT_RENDERING_SUCCEEDED: "at-content-rendering-succeeded",
            CONTENT_RENDERING_FAILED: "at-content-rendering-failed",
            CONTENT_RENDERING_NO_OFFERS: "at-content-rendering-no-offers",
            CONTENT_RENDERING_REDIRECT: "at-content-rendering-redirect",
          }),
          !r.enabled)
        )
          return (
            (function (e) {
              (e.adobe = e.adobe || {}),
                (e.adobe.target = {
                  VERSION: "",
                  event: {},
                  getOffer: ye,
                  getOffers: be,
                  applyOffer: ye,
                  applyOffers: be,
                  sendNotifications: ye,
                  trackEvent: ye,
                  triggerView: ye,
                  registerExtension: ye,
                  init: ye,
                }),
                (e.mboxCreate = ye),
                (e.mboxDefine = ye),
                (e.mboxUpdate = ye);
            })(e),
            void Bt(Ue)
          );
        Ft(Ye, it(), Dt()),
          Xn(),
          (function (e) {
            const t = nr(e.location.search);
            if (m(t)) return;
            const n = new Date(re() + 186e4),
              r = it().secureOnly,
              o = h({ expires: n, secure: r }, r ? { sameSite: "None" } : {});
            Tt("at_qa_mode", JSON.stringify(t), o);
          })(e),
          rr(e),
          zs(),
          (e.adobe.target.getOffer = Qs),
          (e.adobe.target.getOffers = tu),
          (e.adobe.target.applyOffer = ru),
          (e.adobe.target.applyOffers = ou),
          (e.adobe.target.sendNotifications = iu),
          (e.adobe.target.trackEvent = au),
          (e.adobe.target.triggerView = mu),
          (e.adobe.target.registerExtension = wu),
          (e.mboxCreate = Su),
          (e.mboxDefine = Eu),
          (e.mboxUpdate = Tu),
          (e.__target_telemetry = (function () {
            let e =
                !(arguments.length > 0 && void 0 !== arguments[0]) ||
                arguments[0],
              t =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : pe,
              n =
                arguments.length > 2 && void 0 !== arguments[2]
                  ? arguments[2]
                  : ke();
            function r(e, t) {
              return 200 !== e || (t !== de && t !== he) ? me : ge;
            }
            function o(e) {
              const t = {},
                n = xe(e),
                r = we(e),
                o = Se(e),
                i = Ee(e),
                c = Te(e);
              return (
                n && (t.executePageLoad = n),
                r && (t.executeMboxCount = r),
                o && (t.prefetchPageLoad = o),
                i && (t.prefetchMboxCount = i),
                c && (t.prefetchViewCount = c),
                t
              );
            }
            function i(e) {
              const t = {};
              return (
                e.dns && (t.dns = Ce(e.dns)),
                e.tls && (t.tls = Ce(e.tls)),
                e.timeToFirstByte &&
                  (t.timeToFirstByte = Ce(e.timeToFirstByte)),
                e.download && (t.download = Ce(e.download)),
                e.responseSize && (t.responseSize = Ce(e.responseSize)),
                t
              );
            }
            function c(e) {
              const t = {};
              return (
                e.execution && (t.execution = Ce(e.execution)),
                e.parsing && (t.parsing = Ce(e.parsing)),
                e.request && (t.request = i(e.request)),
                h(e, t)
              );
            }
            function s(e) {
              n.addEntry(c(e));
            }
            function u(t) {
              e && s({ requestId: t.requestId, timestamp: re() });
            }
            function a(t, n) {
              e && s({ requestId: t, timestamp: re(), execution: n });
            }
            function f(e, t) {
              s(h(t, { requestId: e, timestamp: re() }));
            }
            function l(t, n) {
              e && n && f(t, n);
            }
            function d(n, i, c) {
              let s =
                arguments.length > 3 && void 0 !== arguments[3]
                  ? arguments[3]
                  : t;
              if (!e || !i) return;
              const { requestId: u } = n,
                a = h(o(n), { decisioningMethod: s }),
                l = { mode: r(c, s), features: a },
                d = h(i, l);
              f(u, d);
            }
            function p() {
              return n.getAndClearEntries();
            }
            function m() {
              return n.hasEntries();
            }
            function g(e) {
              return m() ? h(e, { telemetry: { entries: p() } }) : e;
            }
            return {
              addDeliveryRequestEntry: d,
              addArtifactRequestEntry: l,
              addRenderEntry: a,
              addServerStateEntry: u,
              getAndClearEntries: p,
              hasEntries: m,
              addTelemetryToDeliveryRequest: g,
            };
          })(
            r.telemetryEnabled &&
              (function () {
                try {
                  const e = window.localStorage,
                    t = "__storage_test__";
                  return e.setItem(t, t), e.removeItem(t), !0;
                } catch (e) {
                  return !1;
                }
              })(),
            r.decisioningMethod,
            Nu()
          )),
          (function () {
            const e = On("at-library-loaded", {});
            Nn(Ye, Xe, "at-library-loaded", e);
          })();
      },
    };
  })()),
  window.adobe.target.init(window, document, {
    clientCode: "microsoftmscompoc",
    imsOrgId: "EA76ADE95776D2EC7F000101@AdobeOrg",
    serverDomain: "target.microsoft.com",
    timeout: Number("15000"),
    globalMboxName: "target-global-mbox",
    version: "2.8.2",
    defaultContentHiddenStyle: "visibility: hidden;",
    defaultContentVisibleStyle: "visibility: visible;",
    bodyHiddenStyle: "body {opacity: 0 !important}",
    bodyHidingEnabled: !0,
    deviceIdLifetime: 3.418e10,
    sessionIdLifetime: 186e4,
    selectorsPollingTimeout: 5e3,
    visitorApiTimeout: 2e3,
    overrideMboxEdgeServer: !1,
    overrideMboxEdgeServerTimeout: 186e4,
    optoutEnabled: !1,
    optinEnabled: !1,
    secureOnly: !1,
    supplementalDataIdParamTimeout: 30,
    authoringScriptUrl: "//cdn.tt.omtrdc.net/cdn/target-vec.js",
    urlSizeLimit: 2048,
    endpoint: "/rest/v1/delivery",
    pageLoadEnabled: "true" === String("true"),
    viewsEnabled: !0,
    analyticsLogging: "client_side",
    serverState: {},
    decisioningMethod: "server-side",
    legacyBrowserSupport: !1,
  });

//No custom JavaScript
