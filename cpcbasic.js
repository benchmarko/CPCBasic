// cpcbasic.js - GCFiddle
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//

/* globals Controller, Model, Utils, View */

"use strict";

var cpcBasicExternalConfig, cpcBasic;

cpcBasic = {
	config: {
		debug: 0,
		example: "rectangles",
		exampleDir: "examples", // example base directory
		exampleIndex: "0index.js", // example index in exampleDir
		showInput: true,
		showCpc: true,
		showOutput: false,
		showResult: false,
		showVariable: false
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

	fnDoStart: function () {
		var that = this,
			oStartConfig = this.config,
			oInitialConfig,	iDebug;

		Object.assign(oStartConfig, cpcBasicExternalConfig || {}); // merge external config from cpcconfig.js (TODO)
		oInitialConfig = Object.assign({}, oStartConfig); // save config
		this.fnParseUri(oStartConfig); // modify config with URL parameters
		this.model = new Model(oStartConfig, oInitialConfig);
		this.view = new View({});

		iDebug = Number(this.model.getProperty("debug"));
		Utils.debug = iDebug;

		that.controller = new Controller(this.model, this.view);
	},

	fnOnLoad: function () {
		Utils.console.log("cpcBasic started at " + Utils.dateFormat(new Date()));
		this.fnDoStart();
	}
};


// some polyfills for IE11 (which is not fully supported)
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


cpcBasic.fnOnLoad(); // if cpcbasic.js is the last script, we do not need to wait for window.onload
