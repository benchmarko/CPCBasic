// Model.js - Model (MVC)
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

function Model(config, initialConfig) {
	this.init(config, initialConfig);
}

Model.prototype = {
	init: function (config, initialConfig) {
		this.config = config || {}; // store only a reference
		this.initialConfig = initialConfig || {};
		this.databases = {};
		this.examples = {}; // loaded examples per database
		//this.oVariables = {};
		// this.initVariables();
	},
	getProperty: function (sProperty) {
		return this.config[sProperty];
	},
	setProperty: function (sProperty, sValue) {
		this.config[sProperty] = sValue;
		return this;
	},
	getAllProperties: function () {
		return this.config;
	},
	getAllInitialProperties: function () {
		return this.initialConfig;
	},

	addDatabases: function (oDb) {
		var sPar, oEntry;

		for (sPar in oDb) {
			if (oDb.hasOwnProperty(sPar)) {
				oEntry = oDb[sPar];
				this.databases[sPar] = oEntry;
				this.examples[sPar] = {};
			}
		}
		return this;
	},
	getAllDatabases: function () {
		return this.databases;
	},
	getDatabase: function () {
		var sDatabase = this.getProperty("database");

		return this.databases[sDatabase];
	},

	getAllExamples: function () {
		var selectedDatabase = this.getProperty("database");

		return this.examples[selectedDatabase];
	},
	getExample: function (sKey) {
		var selectedDatabase = this.getProperty("database");

		return this.examples[selectedDatabase][sKey];
	},
	setExample: function (oExample) {
		var selectedDatabase = this.getProperty("database"),
			sKey = oExample.key;

		if (!this.examples[selectedDatabase][sKey]) {
			if (Utils.debug > 1) {
				Utils.console.debug("setExample: creating new example:", sKey);
			}
		}
		this.examples[selectedDatabase][sKey] = oExample;
		return this;
	}

	/* TODO */
	/*
	getAllVariables: function () {
		return this.oVariables;
	},

	fnCreateNDimArray: function (aDims, initVal) {
		var aRet,
			fnCreateRec = function (iIndex) {
				var iLen, aArr, i;

				iLen = aDims[iIndex];
				iIndex += 1;
				aArr = new Array(iLen);
				if (iIndex < aDims.length) { // more dimensions?
					for (i = 0; i < iLen; i += 1) {
						aArr[i] = fnCreateRec(iIndex); // recursive call
					}
				} else { // one dimension
					for (i = 0; i < iLen; i += 1) {
						aArr[i] = initVal;
					}
				}
				return aArr;
			};

		aRet = fnCreateRec(0);
		return aRet;
	},
	getVarDefault: function (sVarName) { //TTT
		var iArrayIndices = sVarName.split("A").length - 1,
			bIsString = sVarName.includes("$"),
			value, aArgs, aValue, i;

		value = bIsString ? "" : 0;
		if (iArrayIndices) {
			// on CPC up to 3 dimensions 0..10 without dim
			if (iArrayIndices > 3) {
				iArrayIndices = 3;
			}
			aArgs = [];
			for (i = 0; i < iArrayIndices; i += 1) {
				aArgs.push(11);
			}
			aValue = this.fnCreateNDimArray(aArgs, value);
			value = aValue;
		}
		return value;
	}
	*/
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = Model;
}
