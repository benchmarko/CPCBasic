// Model.js - Model
//
/* globals */

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
		this.examples = {}; // loaded examples
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

	/*
	getVariable: function (sVar) {
		return this.variables[sVar];
	},
	setVariable: function (sVar, sValue) {
		this.variables[sVar] = sValue;
		return this;
	},
	getAllVariables: function () {
		return this.variables;
	},
	initVariables: function () {
		this.variables = { };
		return this;
	},
	*/

	getAllExamples: function () {
		return this.examples;
	},
	getExample: function (sKey) {
		return this.examples[sKey];
	},
	setExample: function (oExample) {
		var sKey = oExample.key;

		if (!this.examples[sKey]) {
			if (Utils.debug) {
				Utils.console.debug("setExample: creating new example: " + sKey);
			}
		}
		this.examples[sKey] = oExample;
		return this;
	}
};
