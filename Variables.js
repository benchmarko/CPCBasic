// Variables.js - Variables
// (c) Marco Vieth, 2020
// https://benchmarko.github.io/CPCBasic/

"use strict";

function Variables(config) {
	this.init(config);
}

Variables.prototype = {
	init: function (config) {
		this.config = config || {}; // store only a reference
		this.oVariables = {};
		this.oVarTypes = {}; // default variable types for variables starting with letters a-z
	},

	removeAllVariables: function () {
		var oVariables = this.oVariables,
			sName;

		for (sName in oVariables) { // eslint-disable-line guard-for-in
			delete oVariables[sName];
		}
		return this;
	},

	getAllVariables: function () {
		return this.oVariables;
	},


	createNDimArray: function (aDims, initVal) {
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

	// determine static varType (first letter + optional fixed vartype) from a variable name
	// format: (v.)<sname>(I|R|$)([...]([...])) with optional parts in ()
	determineStaticVarType: function (sName) {
		var sNameType;

		if (sName.indexOf("v.") === 0) { // preceding variable object?
			sName = sName.substr(2); // remove preceding "v."
		}

		sNameType = sName.charAt(0); // take first character to determine var type later
		if (sNameType === "_") { // ignore underscore (do not clash with keywords)
			sNameType = sName.charAt(1);
		}

		// explicit type specified?
		if (sName.indexOf("I") >= 0) {
			sNameType += "I";
		} else if (sName.indexOf("R") >= 0) {
			sNameType += "R";
		} else if (sName.indexOf("$") >= 0) {
			sNameType += "$";
		}
		return sNameType;
	},

	getVarDefault: function (sVarName, aDimensions) { // optional aDimensions
		var iArrayIndices = sVarName.split("A").length - 1,
			bIsString = sVarName.includes("$"),
			sFirst, value, aValue, i;

		if (!bIsString) { // check dynamic varType...
			sFirst = sVarName.charAt(0);
			if (sFirst === "_") { // ignore underscore (do not clash with keywords)
				sFirst = sFirst.charAt(1);
			}
			bIsString = (this.getVarType(sFirst) === "$");
		}
		value = bIsString ? "" : 0;
		if (iArrayIndices) {
			if (!aDimensions) {
				aDimensions = [];
				if (iArrayIndices > 3) { // on CPC up to 3 dimensions 0..10 without dim
					iArrayIndices = 3;
				}
				for (i = 0; i < iArrayIndices; i += 1) {
					aDimensions.push(11);
				}
			}
			aValue = this.createNDimArray(aDimensions, value);
			value = aValue;
		}
		return value;
	},

	initVariable: function (sName) {
		this.oVariables[sName] = this.getVarDefault(sName, null);
		return this;
	},

	dimVariable: function (sName, aDimensions) {
		this.oVariables[sName] = this.getVarDefault(sName, aDimensions);
		return this;
	},

	getAllVariableNames: function () {
		return Object.keys(this.oVariables);
	},

	getVariableIndex: function (sName) {
		var aVarNames = this.getAllVariableNames(),
			iPos;

		iPos = aVarNames.indexOf(sName);
		return iPos;
	},

	initAllVariables: function () {
		var aVariables = this.getAllVariableNames(),
			i;

		for (i = 0; i < aVariables.length; i += 1) {
			this.initVariable(aVariables[i]);
		}
		return this;
	},

	getVariable: function (sName) {
		return this.oVariables[sName];
	},

	setVariable: function (sName, value) {
		this.oVariables[sName] = value;
		return this;
	},

	getVariableByIndex: function (iIndex) { // needed for RSX: @var
		var aVariables = this.getAllVariableNames(),
			sName = aVariables[iIndex];

		return this.oVariables[sName];
	},

	variableExist: function (sName) {
		return sName in this.oVariables;
	},


	getVarType: function (sVarChar) {
		return this.oVarTypes[sVarChar];
	},

	setVarType: function (sVarChar, sType) {
		this.oVarTypes[sVarChar] = sType;
		return this;
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = Variables;
}
