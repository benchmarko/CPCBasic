// cpcbasic.js - CPCBasic for the Browser
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//

/* globals Controller, Model, Utils, View */

"use strict";

var cpcBasicExternalConfig, cpcBasic;

cpcBasic = {
	config: {
		bench: 0, // debug: number of parse bench loops
		debug: 0,
		databaseDirs: "examples", // example base directories (comma separated)
		database: "examples", // examples, apps, saved
		example: "cpcbasic",
		exampleIndex: "0index.js", // example index for every exampleDir
		kbdLayout: "alphanum", // alphanum, alpha, num
		showInput: true,
		showInp2: false,
		showCpc: true,
		showKbd: false,
		showKbdLayout: false,
		showOutput: false,
		showResult: false,
		showVariable: false,
		showConsole: false,
		sound: false,
		tron: false // trace on
	},
	model: null,
	view: null,
	controller: null,

	fnHereDoc: function (fn) {
		return String(fn).
			replace(/^[^/]+\/\*\S*/, "").
			replace(/\*\/[^/]+$/, "");
	},

	addIndex: function (sDir, input) {
		if (typeof input !== "string") {
			input = this.fnHereDoc(input);
		}
		return cpcBasic.controller.fnAddIndex(sDir, input);
	},

	addItem: function (sKey, input) {
		if (typeof input !== "string") {
			input = this.fnHereDoc(input);
		}
		return cpcBasic.controller.fnAddItem(sKey, input);
	},

	// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	fnParseUri: function (oConfig) {
		var aMatch,
			rPlus = /\+/g, // Regex for replacing addition symbol with a space
			rSearch = /([^&=]+)=?([^&]*)/g,
			fnDecode = function (s) { return decodeURIComponent(s.replace(rPlus, " ")); },
			sQuery = window.location.search.substring(1),
			sName,
			sValue;

		while ((aMatch = rSearch.exec(sQuery)) !== null) {
			sName = fnDecode(aMatch[1]);
			sValue = fnDecode(aMatch[2]);
			if (sValue !== null && oConfig.hasOwnProperty(sName)) {
				switch (typeof oConfig[sName]) {
				case "string":
					break;
				case "boolean":
					sValue = (sValue === "true");
					break;
				case "number":
					sValue = Number(sValue);
					break;
				case "object":
					break;
				default:
					break;
				}
			}
			oConfig[sName] = sValue;
		}
	},

	setDebugUtilsConsole: function () {
		var oCurrentConsole = Utils.console,
			oConsole = {
				consoleLog: {
					value: ""
				},
				console: oCurrentConsole,
				fnMapObjectProperties: function (arg) {
					var aRes, sKey, value;

					if (typeof arg === "object") {
						aRes = [];
						for (sKey in arg) { // eslint-disable-line guard-for-in
							// if (arg.hasOwnProperty(sKey)) {
							value = arg[sKey];
							if (typeof value !== "object" && typeof value !== "function") {
								aRes.push(sKey + ": " + value);
							}
						}
						arg = String(arg) + "{" + aRes.join(", ") + "}";
					}
					return arg;
				},
				rawLog: function (fnMethod, sLevel, aArgs) {
					if (sLevel) {
						aArgs.unshift(sLevel);
					}
					if (fnMethod) {
						if (fnMethod.apply) {
							fnMethod.apply(console, aArgs);
						}
					}
					if (this.consoleLog) {
						this.consoleLog.value += aArgs.map(this.fnMapObjectProperties).join(" ") + ((sLevel !== null) ? "\n" : "");
					}
				},
				log: function () {
					this.rawLog(this.console && this.console.log, "", Array.prototype.slice.call(arguments));
				},
				debug: function () {
					this.rawLog(this.console && this.console.debug, "DEBUG:", Array.prototype.slice.call(arguments));
				},
				info: function () {
					this.rawLog(this.console && this.console.info, "INFO:", Array.prototype.slice.call(arguments));
				},
				warn: function () {
					this.rawLog(this.console && this.console.warn, "WARN:", Array.prototype.slice.call(arguments));
				},
				error: function () {
					this.rawLog(this.console && this.console.error, "ERROR:", Array.prototype.slice.call(arguments));
				},
				changeLog: function (oLog) {
					var oldLog = this.consoleLog;

					this.consoleLog = oLog;
					if (oldLog && oldLog.value && oLog) { // some log entires collected?
						oLog.value += oldLog.value; // take collected log entries
					}
				}
			};

		Utils.console = oConsole;
	},

	fnDoStart: function () {
		var that = this,
			oStartConfig = this.config,
			oInitialConfig,	iDebug;

		Object.assign(oStartConfig, cpcBasicExternalConfig || {}); // merge external config from cpcconfig.js
		oInitialConfig = Object.assign({}, oStartConfig); // save config
		this.fnParseUri(oStartConfig); // modify config with URL parameters
		this.model = new Model(oStartConfig, oInitialConfig);
		this.view = new View({});

		iDebug = Number(this.model.getProperty("debug"));
		Utils.debug = iDebug;

		if (Utils.debug > 1) {
			if (this.model.getProperty("showConsole")) { // console log window?
				this.setDebugUtilsConsole("consoleText");
				Utils.console.log("CPCBasic log started at", Utils.dateFormat(new Date()));
				Utils.console.changeLog(document.getElementById("consoleText"));
			}
		}

		that.controller = new Controller(this.model, this.view);
	},

	fnOnLoad: function () {
		Utils.console.log("CPCBasic started at", Utils.dateFormat(new Date()));
		this.fnDoStart();
	}
};


// some polyfills for IE11 (which is not fully supported)
if (!Math.sign) {
	Math.sign = function (x) {
		return ((x > 0) - (x < 0)) || +x; // eslint-disable-line no-implicit-coercion
	};
}

if (!Object.assign) {
	Object.assign = function (oTarget) { // varargs // Object.assign is ES6, not in IE
		var oTo = oTarget,
			i,
			oNextSource,
			sNextKey;

		for (i = 1; i < arguments.length; i += 1) {
			oNextSource = arguments[i];
			for (sNextKey in oNextSource) {
				if (oNextSource.hasOwnProperty(sNextKey)) {
					oTo[sNextKey] = oNextSource[sNextKey];
				}
			}
		}
		return oTo;
	};
}

if (!String.prototype.includes) {
	String.prototype.includes = function (search, start) { // eslint-disable-line no-extend-native
		var bRet;

		if (start + search.length > this.length) {
			bRet = false;
		} else {
			bRet = this.indexOf(search, start) !== -1;
		}
		return bRet;
	};
}

if (!String.prototype.padStart) {
	String.prototype.padStart = function (iTargetLength, sPad) { // eslint-disable-line no-extend-native
		var sRet = String(this);

		iTargetLength >>= 0; // eslint-disable-line no-bitwise
		if (this.length < iTargetLength) {
			sPad = String(typeof sPad !== "undefined" ? sPad : " ");
			iTargetLength -= this.length;
			if (iTargetLength > sPad.length) {
				sPad += sPad.repeat(iTargetLength / sPad.length);
			}
			sRet = sPad.slice(0, iTargetLength) + sRet;
		}
		return sRet;
	};
}

if (!String.prototype.repeat) {
	String.prototype.repeat = function (iCount) { // eslint-disable-line no-extend-native
		var sStr = String(this),
			sOut = "",
			i;

		for (i = 0; i < iCount; i += 1) {
			sOut += sStr;
		}
		return sOut;
	};
}


// And a polyfill for older browsers (e.g. SliTaz tazweb browser)
// https://wiki.selfhtml.org/wiki/JavaScript/Window/requestAnimationFrame
(function () {
	var lastTime = 0;

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function (callback /* , element */) {
			var currTime = new Date().getTime(),
				timeToCall = Math.max(0, 16 - (currTime - lastTime)),
				id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);

			lastTime = currTime + timeToCall;
			return id;
		};
	}
}());


cpcBasic.fnOnLoad(); // if cpcbasic.js is the last script, we do not need to wait for window.onload
