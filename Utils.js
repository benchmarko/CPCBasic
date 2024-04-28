// Utils.js - Utililities for CPCBasic
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//

"use strict";

var Utils = {
	debug: 0,
	console: typeof window !== "undefined" ? window.console : global.console, // browser or node.js

	fnLoadScriptOrStyle: function (script, fnSuccess, fnError) {
		// inspired by https://github.com/requirejs/requirejs/blob/master/require.js
		var iIEtimeoutCount = 3,
			onScriptLoad = function (event) {
				var sType = event.type, // "load" or "error"
					node = event.currentTarget || event.srcElement,
					sFullUrl = node.src || node.href, // src for script, href for link
					sKey = node.getAttribute("data-key");

				if (Utils.debug > 1) {
					Utils.console.debug("onScriptLoad:", node.src || node.href);
				}
				node.removeEventListener("load", onScriptLoad, false);
				node.removeEventListener("error", onScriptLoad, false); // eslint-disable-line no-use-before-define

				if (sType === "load") {
					fnSuccess(sFullUrl, sKey);
				} else {
					fnError(sFullUrl, sKey);
				}
			},
			onScriptReadyStateChange = function (event) { // for old IE8
				var node = event ? (event.currentTarget || event.srcElement) : script,
					sFullUrl = node.src || node.href, // src for script, href for link
					sKey = node.getAttribute("data-key"),
					iTimeout = 200; // some delay

				if (node.detachEvent) {
					node.detachEvent("onreadystatechange", onScriptReadyStateChange);
				}

				if (Utils.debug > 1) {
					Utils.console.debug("onScriptReadyStateChange: " + sFullUrl);
				}
				// check also: https://stackoverflow.com/questions/1929742/can-script-readystate-be-trusted-to-detect-the-end-of-dynamic-script-loading
				if (node.readyState !== "loaded" && node.readyState !== "complete") {
					if (node.readyState === "loading" && iIEtimeoutCount) {
						iIEtimeoutCount -= 1;
						iTimeout = 200; // some delay
						Utils.console.error("onScriptReadyStateChange: Still loading: " + sFullUrl + " Waiting " + iTimeout + "ms (count=" + iIEtimeoutCount + ")");
						setTimeout(function () {
							onScriptReadyStateChange(undefined); // check again
						}, iTimeout);
					} else {
						// iIEtimeoutCount = 3;
						Utils.console.error("onScriptReadyStateChange: Cannot load file " + sFullUrl + " readystate=" + node.readyState);
						fnError(sFullUrl, sKey);
					}
				} else {
					fnSuccess(sFullUrl, sKey);
				}
			};

		if (script.readyState) { // old IE8
			iIEtimeoutCount = 3;
			script.attachEvent("onreadystatechange", onScriptReadyStateChange);
		} else { // Others
			script.addEventListener("load", onScriptLoad, false);
			script.addEventListener("error", onScriptLoad, false);
		}
		document.getElementsByTagName("head")[0].appendChild(script);
	},
	loadScript: function (sUrl, fnSuccess, fnError, sKey) {
		var script;

		script = document.createElement("script");
		script.type = "text/javascript";
		script.charset = "utf-8";
		script.async = true;
		script.src = sUrl;

		script.setAttribute("data-key", sKey);

		this.fnLoadScriptOrStyle(script, fnSuccess, fnError);
	},
	loadStyle: function (sUrl, fnSuccess, fnError) {
		var link;

		link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = sUrl;
		this.fnLoadScriptOrStyle(link, fnSuccess, fnError);
	},

	dateFormat: function (d) {
		return d.getFullYear() + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + " "
			+ ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + "." + ("0" + d.getMilliseconds()).slice(-3);
	},
	stringCapitalize: function (str) { // capitalize first letter
		return str.charAt(0).toUpperCase() + str.substring(1);
	},
	numberWithCommas: function (x) {
		// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
		var aParts = String(x).split(".");

		aParts[0] = aParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return aParts.join(".");
	},
	toRadians: function (deg) {
		return deg * Math.PI / 180;
	},
	toDegrees: function (rad) {
		return rad * 180 / Math.PI;
	},
	bSupportsBinaryLiterals: (function () { // does the browser support binary literals?
		try {
			Function("0b01"); // eslint-disable-line no-new-func
		} catch (e) {
			return false;
		}
		return true;
	}()),

	bSupportReservedNames: (function () { // does the browser support reserved names (delete, new, return) in dot notation? (not old IE8; "goto" is ok)
		try {
			Function("({}).return()"); // eslint-disable-line no-new-func
		} catch (e) {
			return false;
		}
		return true;
	}()),

	localStorage: (function () {
		var rc;

		try {
			rc = typeof window !== "undefined" ? window.localStorage : null; // due to a bug in MS Edge this will throw an error when hosting locally (https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8816771/)
		} catch (e) {
			rc = null;
		}
		return rc;
	}()),

	atob: typeof window !== "undefined" && window.atob && window.atob.bind ? window.atob.bind(window) : null, // we need bind: https://stackoverflow.com/questions/9677985/uncaught-typeerror-illegal-invocation-in-chrome
	btoa: typeof window !== "undefined" && window.btoa && window.btoa.bind ? window.btoa.bind(window) : null,

	composeError: function (name, oError, message, value, pos, line, hidden) {
		var iEndPos;

		if (name !== undefined) {
			oError.name = name;
		}
		if (message !== undefined) {
			oError.message = message;
		}
		if (value !== undefined) {
			oError.value = value;
		}
		if (pos !== undefined) {
			oError.pos = pos;
		}
		// Safari: Some additional properties are already defined: line, column. Shall we use "cause" property now?
		if (line !== oError.line) {
			oError.line = line;
		}
		if (hidden !== undefined) {
			oError.hidden = hidden;
		}

		iEndPos = (oError.pos || 0) + ((oError.value !== undefined) ? String(oError.value).length : 0);
		oError.shortMessage = oError.message + (oError.line !== undefined ? " in " + oError.line : " at pos " + (oError.pos || 0) + "-" + iEndPos) + ": " + oError.value;
		oError.message += (oError.line !== undefined ? " in " + oError.line : "") + " at pos " + (oError.pos || 0) + "-" + iEndPos + ": " + oError.value;
		return oError;
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = Utils;
}
