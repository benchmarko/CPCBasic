// BasicFormatter.js - Format BASIC source
// (c) Marco Vieth, 2020
// https://benchmarko.github.io/CPCBasic/
//
//

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

function BasicFormatter(options) {
	this.init(options);
}

BasicFormatter.prototype = {
	init: function (options) {
		this.options = options || {};

		this.lexer = this.options.lexer;
		this.parser = this.options.parser;
		this.iLine = 0; // current line (label)
	},

	/*
	reset: function () {
		this.iLine = 0; // current line (label)
	},
	*/

	composeError: function () { // varargs
		var aArgs = Array.prototype.slice.call(arguments);

		aArgs.unshift("BasicFormatter");
		return Utils.composeError.apply(null, aArgs);
	},

	fnRenumber: function (sInput, aParseTree, iNew, iOld, iStep, iKeep) {
		var that = this,
			oLines = {}, // line numbers
			aRefs = [], // references
			oChanges = {},

			fnCreateLineNumbersMap = function () { // create line numbers map
				var iLastLine = 0,
					i, oNode, sLine, iLine;

				oLines[0] = { // dummy line 0 for: on error goto 0
					value: 0
				};
				for (i = 0; i < aParseTree.length; i += 1) {
					oNode = aParseTree[i];
					if (oNode.type === "label") {
						sLine = oNode.value;
						iLine = Number(oNode.value);
						if (sLine in oLines) {
							throw that.composeError(Error(), "Duplicate line number", sLine, oNode.pos);
						}
						if (iLine <= iLastLine) {
							throw that.composeError(Error(), "Line number not increasing", sLine, oNode.pos);
						}
						if (iLine < 1 || iLine > 65535) {
							throw that.composeError(Error(), "Line number overflow", sLine, oNode.pos);
						}
						oLines[oNode.value] = {
							value: iLine,
							pos: oNode.pos,
							len: String(oNode.orig || oNode.value).length
						};
						iLastLine = iLine;
					}
				}
			},

			/*
			fnAddReferences = function (aNodes) {
				var i, oNode;

				for (i = 0; i < aNodes.length; i += 1) {
					oNode = aNodes[i];
					if (oNode.type === "linenumber") {
						if (oNode.value in oLines) {
							aRefs.push({
								value: Number(oNode.value),
								pos: oNode.pos,
								len: String(oNode.orig || oNode.value).length
							});
						} else {
							throw that.composeError(Error(), "Line does not exist", oNode.value, oNode.pos);
						}
					}
					if (oNode.left) {
						fnAddReferences(oNode.left);
					}
					if (oNode.right) {
						fnAddReferences(oNode.right);
					}
					if (oNode.third) {
						fnAddReferences(oNode.third);
					}
					if (oNode.args) {
						fnAddReferences(oNode.args);
					}
				}
			},
			*/

			fnAddSingleReference = function (oNode) {
				if (oNode.type === "linenumber") {
					if (oNode.value in oLines) {
						aRefs.push({
							value: Number(oNode.value),
							pos: oNode.pos,
							len: String(oNode.orig || oNode.value).length
						});
					} else {
						throw that.composeError(Error(), "Line does not exist", oNode.value, oNode.pos);
					}
				}
			},

			fnAddReferences = function (aNodes) {
				var i, oNode;

				for (i = 0; i < aNodes.length; i += 1) {
					oNode = aNodes[i];

					if (oNode.type === "label") {
						//TTT this.iLine = Number(oNode.value); // for error messages
					} else {
						fnAddSingleReference(oNode);
					}

					if (oNode.left) {
						fnAddSingleReference(oNode.left);
						//fnAddReferences(oNode.left); // recursive for e.g. lineRange ?
					}
					if (oNode.right) {
						fnAddSingleReference(oNode.right);
					}
					if (oNode.args) {
						fnAddReferences(oNode.args); // recursive
					}
					if (oNode.args2) { // for "ELSE"
						fnAddReferences(oNode.args2); // recursive
					}
				}
			},

			fnRenumberLines = function () {
				var aKeys = Object.keys(oLines),
					i, oLine, oRef;

				for (i = 0; i < aKeys.length; i += 1) {
					oLine = oLines[aKeys[i]];
					if (oLine.value >= iOld && oLine.value < iKeep) {
						if (iNew > 65535) {
							throw that.composeError(Error(), "Line number overflow", oLine.value, oLine.pos);
						}
						oLine.newLine = iNew;
						oChanges[oLine.pos] = oLine;
						iNew += iStep;
					}
				}

				for (i = 0; i < aRefs.length; i += 1) {
					oRef = aRefs[i];
					if (oRef.value >= iOld && oRef.value < iKeep) {
						if (oRef.value !== oLines[oRef.value].newLine) {
							oRef.newLine = oLines[oRef.value].newLine;
							oChanges[oRef.pos] = oRef;
						}
					}
				}
			},
			fnSortNumbers = function (a, b) {
				return a - b;
			},
			fnApplyChanges = function () {
				var aKeys = Object.keys(oChanges).map(Number),
					i, oLine;

				aKeys.sort(fnSortNumbers);

				// apply changes to input in reverse order
				for (i = aKeys.length - 1; i >= 0; i -= 1) {
					oLine = oChanges[aKeys[i]];
					sInput = sInput.substring(0, oLine.pos) + oLine.newLine + sInput.substr(oLine.pos + oLine.len);
				}
			};

		fnCreateLineNumbersMap();

		fnAddReferences(aParseTree); // create reference list

		fnRenumberLines();

		fnApplyChanges();

		return sInput;
	},

	renumber: function (sInput, iNew, iOld, iStep, iKeep) {
		var oOut = {
				text: "",
				error: undefined
			},
			aTokens, aParseTree, sOutput;

		try {
			aTokens = this.lexer.lex(sInput);
			aParseTree = this.parser.parse(aTokens);
			sOutput = this.fnRenumber(sInput, aParseTree, iNew, iOld, iStep, iKeep || 65535);
			oOut.text = sOutput;
		} catch (e) {
			oOut.error = e;
		}
		return oOut;
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = BasicFormatter;
}
