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
		this.sLine = ""; // current line (label) for error messages
	},

	composeError: function (oError, message, value, pos) {
		return Utils.composeError("BasicFormatter", oError, message, value, pos, this.sLine);
	},

	fnRenumber: function (sInput, aParseTree, iNew, iOld, iStep, iKeep) {
		var that = this,
			oLines = {}, // line numbers
			aRefs = [], // references
			oChanges = {},

			fnCreateLineNumbersMap = function () { // create line numbers map
				var iLastLine = -1,
					i, oNode, sLine, iLine;

				for (i = 0; i < aParseTree.length; i += 1) {
					oNode = aParseTree[i];
					if (oNode.type === "label") {
						sLine = oNode.value;
						that.sLine = sLine;

						iLine = Number(sLine);
						if (sLine in oLines) {
							throw that.composeError(Error(), "Duplicate line number", sLine, oNode.pos);
						}
						if (iLine <= iLastLine) {
							throw that.composeError(Error(), "Line number not increasing", sLine, oNode.pos);
						}
						if (iLine < 1 || iLine > 65535) {
							throw that.composeError(Error(), "Line number overflow", sLine, oNode.pos);
						}
						oLines[sLine] = {
							value: iLine,
							pos: oNode.pos,
							len: (oNode.orig || sLine).length
						};
						iLastLine = iLine;
					}
				}
			},

			fnAddSingleReference = function (oNode) {
				if (oNode.type === "linenumber") {
					if (oNode.value in oLines) {
						aRefs.push({
							value: oNode.value,
							pos: oNode.pos,
							len: (oNode.orig || oNode.value).length
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
						that.sLine = oNode.value;
					} else {
						fnAddSingleReference(oNode);
					}

					if (oNode.left) {
						fnAddSingleReference(oNode.left);
					}
					if (oNode.right) {
						fnAddSingleReference(oNode.right);
					}
					if (oNode.args) {
						if (oNode.type === "onErrorGoto" && oNode.args.length === 1 && oNode.args[0].value === "0") {
							// ignore "on error goto 0"
						} else {
							fnAddReferences(oNode.args); // recursive
						}
					}
					if (oNode.args2) { // for "ELSE"
						fnAddReferences(oNode.args2); // recursive
					}
				}
			},

			fnRenumberLines = function () {
				var aKeys = Object.keys(oLines),
					i, oLine, iLine, oRef, sLine;

				for (i = 0; i < aKeys.length; i += 1) {
					oLine = oLines[aKeys[i]];
					iLine = Number(oLine.value);
					if (iLine >= iOld && iLine < iKeep) {
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
					sLine = oRef.value;
					iLine = Number(sLine);
					if (iLine >= iOld && iLine < iKeep) {
						if (iLine !== oLines[sLine].newLine) {
							oRef.newLine = oLines[sLine].newLine;
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

		this.sLine = ""; // current line (label)
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
