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
	},
	getProperty: function (sProperty) {
		return this.config[sProperty];
	},
	setProperty: function (sProperty, sValue) {
		this.config[sProperty] = sValue;
	},
	getAllProperties: function () {
		return this.config;
	},
	getAllInitialProperties: function () {
		return this.initialConfig;
	},

	getChangedProperties: function () {
		var oCurrent = this.config,
			oInitial = this.initialConfig,
			oChanged = {},
			sName;

		for (sName in oCurrent) {
			if (oCurrent.hasOwnProperty(sName)) {
				if (oCurrent[sName] !== oInitial[sName]) {
					oChanged[sName] = oCurrent[sName];
				}
			}
		}
		return oChanged;
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
	},
	removeExample: function (sKey) {
		var selectedDatabase = this.getProperty("database");

		if (!this.examples[selectedDatabase][sKey]) {
			Utils.console.warn("removeExample: example does not exist: " + sKey);
		}
		delete this.examples[selectedDatabase][sKey];
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = Model;
}
