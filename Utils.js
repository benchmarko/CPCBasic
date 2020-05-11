// Utils.js - Utililities for CPCBasic
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//

"use strict";

var Utils = {
	debug: 0,
	console: typeof window !== "undefined" ? window.console : global.console, // browser or node.js

	fnLoadScriptOrStyle: function (script, sFullUrl, fnSuccess, fnError) {
		// inspired by https://github.com/requirejs/requirejs/blob/master/require.js
		var iIEtimeoutCount = 3,
			onScriptLoad = function (event) {
				var node = event.currentTarget || event.srcElement;

				if (Utils.debug > 1) {
					Utils.console.debug("onScriptLoad:", node.src || node.href);
				}
				node.removeEventListener("load", onScriptLoad, false);
				node.removeEventListener("error", onScriptError, false); // eslint-disable-line no-use-before-define

				if (fnSuccess) {
					fnSuccess(sFullUrl);
				}
			},
			onScriptError = function (event) {
				var node = event.currentTarget || event.srcElement;

				if (Utils.debug > 1) {
					Utils.console.debug("onScriptError:", node.src || node.href);
				}
				node.removeEventListener("load", onScriptLoad, false);
				node.removeEventListener("error", onScriptError, false);

				if (fnError) {
					fnError(sFullUrl);
				}
			},
			onScriptReadyStateChange = function (event) { // for old IE8
				var node, iTimeout;

				if (event) {
					node = event.currentTarget || event.srcElement;
				} else {
					node = script;
				}
				if (node.detachEvent) {
					node.detachEvent("onreadystatechange", onScriptReadyStateChange);
				}

				if (Utils.debug > 1) {
					Utils.console.debug("onScriptReadyStateChange: " + node.src || node.href);
				}
				// check also: https://stackoverflow.com/questions/1929742/can-script-readystate-be-trusted-to-detect-the-end-of-dynamic-script-loading
				if (node.readyState !== "loaded" && node.readyState !== "complete") {
					if (node.readyState === "loading" && iIEtimeoutCount) {
						iIEtimeoutCount -= 1;
						iTimeout = 200; // some delay
						Utils.console.error("onScriptReadyStateChange: Still loading: " + (node.src || node.href) + " Waiting " + iTimeout + "ms (count=" + iIEtimeoutCount + ")");
						setTimeout(function () {
							onScriptReadyStateChange(); // check again
						}, iTimeout);
					} else {
						// iIEtimeoutCount = 3;
						Utils.console.error("onScriptReadyStateChange: Cannot load file " + (node.src || node.href) + " readystate=" + node.readyState);
						if (fnError) {
							fnError(sFullUrl);
						}
					}
				} else if (fnSuccess) {
					fnSuccess(sFullUrl);
				}
			};

		if (script.readyState) { // old IE8
			iIEtimeoutCount = 3;
			script.attachEvent("onreadystatechange", onScriptReadyStateChange);
		} else { // Others
			script.addEventListener("load", onScriptLoad, false);
			script.addEventListener("error", onScriptError, false);
		}
		document.getElementsByTagName("head")[0].appendChild(script);
		return sFullUrl;
	},
	loadScript: function (sUrl, fnSuccess, fnError) {
		var script, sFullUrl;

		script = document.createElement("script");
		script.type = "text/javascript";
		script.charset = "utf-8";
		script.async = true;
		script.src = sUrl;
		sFullUrl = script.src;
		this.fnLoadScriptOrStyle(script, sFullUrl, fnSuccess, fnError);
	},
	loadStyle: function (sUrl, fnSuccess, fnError) {
		var link, sFullUrl;

		link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = sUrl;
		sFullUrl = link.href;
		this.fnLoadScriptOrStyle(link, sFullUrl, fnSuccess, fnError);
	},

	dateFormat: function (d) {
		return d.getFullYear() + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + " "
			+ ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + "." + ("0" + d.getMilliseconds()).slice(-3);
	},
	stringStartsWith: function (sStr, sFind, iPos) {
		iPos = iPos || 0;
		return sStr.indexOf(sFind, iPos) === iPos;
	},
	stringEndsWith: function (str, find) {
		return str.indexOf(find, str.length - find.length) !== -1;
	},
	stringCapitalize: function (str) { // capitalize first letter
		return str.charAt(0).toUpperCase() + str.substring(1);
	},
	toRadians: function (deg) {
		return deg * Math.PI / 180;
	},
	toDegrees: function (rad) {
		return rad * 180 / Math.PI;
	},
	getChangedParameters: function (current, initial) {
		var oChanged = {},
			sName;

		for (sName in current) {
			if (current.hasOwnProperty(sName)) {
				if (current[sName] !== initial[sName]) {
					oChanged[sName] = current[sName];
				}
			}
		}
		return oChanged;
	},
	bSupportsBinaryLiterals: (function () { // does the browser support binary literals?
		try {
			Function("0b01"); // eslint-disable-line no-new-func
			return true;
		} catch (err) {
			return false;
		}
	}()),

	bSupportReservedNames: (function () { // does the browser support reserved names (delete, new, return) in dot notation? (not old IE8; "goto" is ok)
		try {
			Function("({}).return()"); // eslint-disable-line no-new-func
			return true;
		} catch (err) {
			return false;
		}
	}()),

	localStorage: (function () {
		try {
			return typeof window !== "undefined" ? window.localStorage : null; // due to a bug in MS Edge this will throw an error when hosting locally (https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8816771/)
		} catch (e) {
			console.warn("Utils.localStorage:", e); // eslint-disable-line no-console
			return null;
		}
	}()),

	atob: typeof window !== "undefined" && window.atob ? window.atob.bind(window) : null, // we need bind: https://stackoverflow.com/questions/9677985/uncaught-typeerror-illegal-invocation-in-chrome
	btoa: typeof window !== "undefined" && window.btoa ? window.btoa.bind(window) : null
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = Utils;
}
