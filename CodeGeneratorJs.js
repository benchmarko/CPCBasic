// CodeGeneratorJs.js - Code Generator for JavaScript
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
//

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

function CodeGeneratorJs(options) {
	this.init(options);
}

CodeGeneratorJs.prototype = {
	init: function (options) {
		this.options = options || {}; // e.g. tron, rsx

		this.lexer = this.options.lexer;
		this.parser = this.options.parser;

		this.reJsKeywords = this.createJsKeywordRegex();
		this.reset();
	},

	reset: function () {
		this.iLine = 0; // current line (label)

		this.oStack = {
			forLabel: [],
			forVarName: [],
			whileLabel: []
		};

		this.resetCountsPerLine();

		this.aData = []; // collected data from data lines

		this.oLabels = {}; // labels or line numbers
		this.bMergeFound = false; // if we find chain or chain merge, the program is not complete and we cannot check for existing line numbers during compile time (or do a renumber)

		this.lexer.reset();
		this.parser.reset();
		return this;
	},

	resetCountsPerLine: function () {
		this.iGosubCount = 0;
		this.iIfCount = 0;
		this.iStopCount = 0;
		this.iForCount = 0; // stack needed
		this.iWhileCount = 0; // stack needed
	},

	composeError: function () { // varargs
		var aArgs = Array.prototype.slice.call(arguments);

		aArgs.unshift("CodeGeneratorJs");
		aArgs.push(this.iLine);
		return Utils.composeError.apply(null, aArgs);
	},

	// ECMA 3 JS Keywords which must be avoided in dot notation for properties when using IE8
	aJsKeywords: [
		"do",
		"if",
		"in",
		"for",
		"int",
		"new",
		"try",
		"var",
		"byte",
		"case",
		"char",
		"else",
		"enum",
		"goto",
		"long",
		"null",
		"this",
		"true",
		"void",
		"with",
		"break",
		"catch",
		"class",
		"const",
		"false",
		"final",
		"float",
		"short",
		"super",
		"throw",
		"while",
		"delete",
		"double",
		"export",
		"import",
		"native",
		"public",
		"return",
		"static",
		"switch",
		"throws",
		"typeof",
		"boolean",
		"default",
		"extends",
		"finally",
		"package",
		"private",
		"abstract",
		"continue",
		"debugger",
		"function",
		"volatile",
		"interface",
		"protected",
		"transient",
		"implements",
		"instanceof",
		"synchronized"
	],

	createJsKeywordRegex: function () {
		var reJsKeywords;

		reJsKeywords = new RegExp("^(" + this.aJsKeywords.join("|") + ")$");
		return reJsKeywords;
	},

	//
	// evaluate
	//
	evaluate: function (parseTree, oVariables) {
		var that = this,

			fnDeclareVariable = function (sName) {
				if (!oVariables.variableExist(sName)) { // variable not yet defined?
					oVariables.initVariable(sName);
				}
			},

			oDevScopeArgs = null,
			bDevScopeArgsCollect = false,

			fnAdaptVariableName = function (sName, iArrayIndices) {
				sName = sName.toLowerCase();
				sName = sName.replace(/\./g, "_");

				if (oDevScopeArgs || !Utils.bSupportReservedNames) { // avoid keywords as def fn parameters; and for IE8 avoid keywords in dot notation
					if (that.reJsKeywords.test(sName)) { // IE8: avoid keywords in dot notation
						sName = "_" + sName; // prepend underscore
					}
				}

				if (Utils.stringEndsWith(sName, "!")) { // real number?
					sName = sName.slice(0, -1) + "R"; // "!" => "R"
				} else if (Utils.stringEndsWith(sName, "%")) { // integer number?
					sName = sName.slice(0, -1) + "I";
				}
				if (iArrayIndices) {
					sName += "A".repeat(iArrayIndices);
				}
				if (oDevScopeArgs) {
					if (sName === "o") { // we must not use format parameter "o" since this is our vm object
						sName = "oNo"; // change variable name to something we cannot set in BASIC
					}
					if (bDevScopeArgsCollect) {
						oDevScopeArgs[sName] = 1; // declare devscope variable
					} else if (!(sName in oDevScopeArgs)) {
						// variable
						fnDeclareVariable(sName);
						sName = "v." + sName; // access with "v."
					}
				} else {
					fnDeclareVariable(sName);
					sName = "v." + sName; // access with "v."
				}
				return sName;
			},

			fnParseOneArg = function (oArg) {
				var sValue = parseNode(oArg); // eslint-disable-line no-use-before-define

				return sValue;
			},

			fnParseArgs = function (aArgs) {
				var aNodeArgs = [], // do not modify node.args here (could be a parameter of defined function)
					i;

				for (i = 0; i < aArgs.length; i += 1) {
					aNodeArgs[i] = fnParseOneArg(aArgs[i]);
				}
				return aNodeArgs;
			},

			fnDetermineStaticVarType = function (sName) {
				return oVariables.determineStaticVarType(sName);
			},

			fnIsIntConst = function (a) {
				var reIntConst = /^[+-]?([0-9]+|0x[0-9a-f]+|0b[0-1]+)$/; // regex for integer, hex, binary constant

				return reIntConst.test(String(a));
			},

			fnGetRoundString = function (node) {
				if (node.pt !== "I") { // no rounding needed for integer, hex, binary constants, integer variables, functions returning integer (optimization)
					node.pv = "o.vmRound(" + node.pv + ")";
				}
				return node.pv;
			},

			fnIsInString = function (sString, sFind) {
				return sFind && sString.indexOf(sFind) >= 0;
			},

			fnPropagateStaticTypes = function (node, oLeft, oRight, sTypes) {
				if (oLeft.pt && oRight.pt) {
					if (fnIsInString(sTypes, oLeft.pt + oRight.pt)) {
						node.pt = oLeft.pt === oRight.pt ? oLeft.pt : "R";
					} else {
						throw that.composeError(Error(), "Type error", node.value, node.pos);
					}
				} else if (oLeft.pt && !fnIsInString(sTypes, oLeft.pt) || oRight.pt && !fnIsInString(sTypes, oRight.pt)) {
					throw that.composeError(Error(), "Type error", node.value, node.pos);
				}
			},

			mOperators = {
				"+": function (node, oLeft, oRight) {
					var a = oLeft.pv;

					if (oRight === undefined) { // unary plus? => skip it
						node.pv = a;
						if (fnIsInString("IR$", oLeft.pt)) { // I, R or $?
							node.pt = oLeft.pt;
						} else if (oLeft.pt) {
							throw that.composeError(Error(), "Type error", node.value, node.pos);
						}
					} else {
						node.pv = a + " + " + oRight.pv;
						fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI $$");
					}
					return node.pv;
				},
				"-": function (node, oLeft, oRight) {
					var a = oLeft.pv;

					if (oRight === undefined) { // unary minus?
						// when optimizing, beware of "--" operator in JavaScript!
						if (fnIsIntConst(a) || oLeft.type === "number") { // int const or number const (also fp)
							a = String(a); // also ok for hex or bin strings
							if (a.charAt(0) === "-") { // starting already with "-"?
								node.pv = a.substr(1); // remove "-"
							} else {
								node.pv = "-" + a;
							}
						} else {
							node.pv = "-(" + a + ")"; // a can be an expression
						}

						if (fnIsInString("IR", oLeft.pt)) { // I or R?
							node.pt = oLeft.pt;
						} else if (oLeft.pt) {
							throw that.composeError(Error(), "Type error", node.value, node.pos);
						}
					} else {
						node.pv = a + " - " + oRight.pv;
						fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI");
					}
					return node.pv;
				},
				"*": function (node, oLeft, oRight) {
					node.pv = oLeft.pv + " * " + oRight.pv;
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI");
					return node.pv;
				},
				"/": function (node, oLeft, oRight) {
					node.pv = oLeft.pv + " / " + oRight.pv;
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI");
					return node.pv;
				},
				"\\": function (node, oLeft, oRight) {
					node.pv = "(" + oLeft.pv + " / " + oRight.pv + ") | 0"; // integer division
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI");
					node.pt = "I";
					return node.pv;
				},
				"^": function (node, oLeft, oRight) {
					node.pv = "Math.pow(" + oLeft.pv + ", " + oRight.pv + ")";
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI");
					return node.pv;
				},
				and: function (node, oLeft, oRight) {
					node.pv = fnGetRoundString(oLeft) + " & " + fnGetRoundString(oRight);
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI");
					node.pt = "I";
					return node.pv;
				},
				or: function (node, oLeft, oRight) {
					node.pv = fnGetRoundString(oLeft) + " | " + fnGetRoundString(oRight);
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI");
					node.pt = "I";
					return node.pv;
				},
				xor: function (node, oLeft, oRight) {
					node.pv = fnGetRoundString(oLeft) + " ^ " + fnGetRoundString(oRight);
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI");
					node.pt = "I";
					return node.pv;
				},
				not: function (node, oLeft) {
					node.pv = "~(" + fnGetRoundString(oLeft) + ")"; // a can be an expression
					node.pt = "I";
					return node.pv;
				},
				mod: function (node, oLeft, oRight) {
					node.pv = fnGetRoundString(oLeft) + " % " + fnGetRoundString(oRight);
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI");
					node.pt = "I";
					return node.pv;
				},
				">": function (node, oLeft, oRight) {
					node.pv = oLeft.pv + " > " + oRight.pv + " ? -1 : 0";
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI $$");
					node.pt = "I";
					return node.pv;
				},
				"<": function (node, oLeft, oRight) {
					node.pv = oLeft.pv + " < " + oRight.pv + " ? -1 : 0";
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI $$");
					node.pt = "I";
					return node.pv;
				},
				">=": function (node, oLeft, oRight) {
					node.pv = oLeft.pv + " >= " + oRight.pv + " ? -1 : 0";
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI $$");
					node.pt = "I";
					return node.pv;
				},
				"<=": function (node, oLeft, oRight) {
					node.pv = oLeft.pv + " <= " + oRight.pv + " ? -1 : 0";
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI $$");
					node.pt = "I";
					return node.pv;
				},
				"=": function (node, oLeft, oRight) {
					node.pv = oLeft.pv + " === " + oRight.pv + " ? -1 : 0";
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI $$");
					node.pt = "I";
					return node.pv;
				},
				"<>": function (node, oLeft, oRight) {
					node.pv = oLeft.pv + " !== " + oRight.pv + " ? -1 : 0";
					fnPropagateStaticTypes(node, oLeft, oRight, "II RR IR RI $$");
					node.pt = "I";
					return node.pv;
				},
				"@": function (node, oLeft) {
					node.pv = 'o.addressOf("' + oLeft.pv + '")'; // address of
					if (oLeft.type !== "identifier") {
						throw that.composeError(Error(), "Identifier expected", node.value, node.pos);
					}
					node.pt = "I";
					return node.pv;
				}
			},

			mParseFunctions = {
				fnParseDefIntRealStr: function (node) {
					var aNodeArgs, i, sArg;

					aNodeArgs = fnParseArgs(node.args);

					for (i = 0; i < aNodeArgs.length; i += 1) {
						sArg = aNodeArgs[i];
						aNodeArgs[i] = "o." + node.type + '("' + sArg + '")';
					}
					node.pv = aNodeArgs.join("; ");
					return node.pv;
				},

				fnParseErase: function (node) {
					var aNodeArgs, i;

					oDevScopeArgs = {};
					bDevScopeArgsCollect = true;
					aNodeArgs = fnParseArgs(node.args);
					bDevScopeArgsCollect = false;
					oDevScopeArgs = null;

					for (i = 0; i < aNodeArgs.length; i += 1) {
						aNodeArgs[i] = '"' + aNodeArgs[i] + '"'; // put in quotes
					}
					node.pv = "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
					return node.pv;
				},

				fnAddReferenceLabel: function (sLabel, node) {
					if (sLabel in that.oLabels) {
						that.oLabels[sLabel] += 1;
					} else {
						if (Utils.debug > 1) {
							Utils.console.debug("fnAddReferenceLabel: line does not (yet) exist:", sLabel);
						}
						if (!that.bMergeFound) {
							throw that.composeError(Error(), "Line does not exist", sLabel, node.pos);
						}
					}
				},

				fnCommandWithGoto: function (node, aNodeArgs) { // optional aNodeArgs
					var sCommand = node.type,
						sLabel;

					aNodeArgs = aNodeArgs || fnParseArgs(node.args);
					sLabel = that.iLine + "s" + that.iStopCount; // we use stopCount
					that.iStopCount += 1;
					node.pv = "o." + sCommand + "(" + aNodeArgs.join(", ") + "); o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":";
					return node.pv;
				},

				"|": function (node) { // rsx
					var sRsxName, bRsxAvailable, aNodeArgs, sLabel, oError;

					sRsxName = node.value.substr(1).toLowerCase().replace(/\./g, "_");
					bRsxAvailable = that.options.rsx.rsxIsAvailable(sRsxName);
					aNodeArgs = fnParseArgs(node.args);
					sLabel = that.iLine + "s" + that.iStopCount; // we use stopCount
					that.iStopCount += 1;

					if (!bRsxAvailable) { // if RSX not available, we delay the error until it is executed (or catched by on error goto)
						oError = that.composeError(Error(), "Unknown RSX command", node.value, node.pos);
						Utils.console.warn(oError);
						aNodeArgs.unshift('"' + sRsxName + '"'); // put as first arg
						sRsxName = "rsxExec"; // and call special handler which triggers error if not available
					}

					node.pv = "o.rsx." + sRsxName + "(" + aNodeArgs.join(", ") + "); o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":"; // most RSX commands need goto (era, ren,...)
					return node.pv;
				},
				number: function (node) {
					node.pt = (/^[0-9]+$/).test(node.value) ? "I" : "R";
					node.pv = node.value;
					return node.pv;
				},
				binnumber: function (node) {
					var sValue = node.value.slice(2);

					if (Utils.bSupportsBinaryLiterals) {
						sValue = "0b" + ((sValue.length) ? sValue : "0"); // &x->0b; 0b is ES6
					} else {
						sValue = "0x" + ((sValue.length) ? parseInt(sValue, 2).toString(16) : "0"); // we convert it to hex
					}
					node.pt = "I";
					node.pv = sValue;
					return node.pv;
				},
				hexnumber: function (node) {
					var value = node.value.slice(1);

					value = "0x" + ((value.length) ? value : "0"); // &->0x
					node.pt = "I";
					node.pv = value;
					return node.pv;
				},
				linenumber: function (node) {
					node.pv = node.value;
					return node.pv;
				},
				identifier: function (node) { // identifier or identifier with array
					var aNodeArgs, sName, sValue, sVarType;

					aNodeArgs = node.args ? fnParseArgs(node.args) : []; // array?
					sName = fnAdaptVariableName(node.value, aNodeArgs.length); // here we use node.value

					sValue = sName + aNodeArgs.map(function (val) {
						return "[" + val + "]";
					}).join("");

					sVarType = fnDetermineStaticVarType(sName);
					if (sVarType.length > 1) {
						sVarType = sVarType.charAt(1);
						node.pt = sVarType;
					}
					node.pv = sValue;
					return node.pv;
				},
				letter: function (node) { // for defint, defreal, defstr
					node.pv = node.value;
					return node.pv;
				},
				range: function (node) { // for defint, defreal, defstr
					var sLeft = fnParseOneArg(node.left),
						sRight = fnParseOneArg(node.right);

					if (sLeft > sRight) {
						throw that.composeError(Error(), "Decreasing range", node.value, node.pos);
					}
					node.pv = sLeft + " - " + sRight;
					return node.pv;
				},
				linerange: function (node) { // for delete, list
					var sLeft = fnParseOneArg(node.left),
						sRight = fnParseOneArg(node.right);

					if (sLeft > sRight) {
						throw that.composeError(Error(), "Decreasing line range", node.value, node.pos);
					}
					node.pv = !sRight ? sLeft : sLeft + ", " + sRight;
					return node.pv;
				},
				string: function (node) {
					node.pt = "$";
					node.pv = '"' + node.value + '"';
					return node.pv;
				},
				"null": function (node) { // means: no parameter specified
					node.pv = "null";
					return node.pv;
				},
				assign: function (node) {
					// see also "let"
					var sName, sVarType, value, sValue;

					if (node.left.type === "identifier") {
						sName = fnParseOneArg(node.left);
					} else {
						throw that.composeError(Error(), "Unexpected assing type", node.type, node.pos); // should not occur
					}

					value = fnParseOneArg(node.right);

					fnPropagateStaticTypes(node, node.left, node.right, "II RR IR RI $$");
					sVarType = fnDetermineStaticVarType(sName);

					if (node.pt) {
						if (node.left.pt === "I" && node.right.pt === "R") {
							sValue = "o.vmRound(" + value + ")";
						} else {
							sValue = value;
						}
					} else {
						sValue = "o.vmAssign(\"" + sVarType + "\", " + value + ")";
					}
					sValue = sName + " = " + sValue;
					node.pv = sValue;
					return node.pv;
				},
				label: function (node) {
					var bDirect = false,
						value = "",
						label, aNodeArgs, value2, i;

					label = node.value;
					that.iLine = label; // set line before parsing args

					that.resetCountsPerLine(); // we want to have "stable" counts, even if other lines change, e.g. direct

					if (isNaN(label)) {
						if (label === "direct") { // special handling
							bDirect = true;
							value = "o.goto(\"directEnd\"); break;\n";
						}
						label = '"' + label + '"'; // for "direct"
					}

					value += "case " + label + ":";

					aNodeArgs = fnParseArgs(node.args);

					if (that.options.tron) {
						value += " o.vmTrace(\"" + that.iLine + "\");";
					}
					for (i = 0; i < aNodeArgs.length; i += 1) {
						value2 = aNodeArgs[i];
						if (value2 !== "") {
							if (!(/[}:;\n]$/).test(value2)) { // does not end with } : ; \n
								value2 += ";";
							} else if (value2.substr(-1) === "\n") {
								value2 = value2.substr(0, value2.length - 1);
							}
							value += " " + value2;
						}
					}

					if (bDirect) {
						value += "\n o.goto(\"end\"); break;\ncase \"directEnd\":"; // put in next line because of possible "rem"
					}

					node.pv = value;
					return node.pv;
				},

				// special keyword functions

				afterGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					this.fnAddReferenceLabel(aNodeArgs[2], node.args[2]); // argument 2 = line number
					node.pv = "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
					return node.pv;
				},
				call: function (node) {
					node.pv = this.fnCommandWithGoto(node);
					return node.pv;
				},
				chain: function (node) {
					node.pv = this.fnCommandWithGoto(node);
					return node.pv;
				},
				chainMerge: function (node) {
					that.bMergeFound = true;
					node.pv = this.fnCommandWithGoto(node);
					return node.pv;
				},
				clear: function (node) { // will also do e.g. closeout
					node.pv = this.fnCommandWithGoto(node);
					return node.pv;
				},
				closeout: function (node) {
					node.pv = this.fnCommandWithGoto(node);
					return node.pv;
				},
				commaTab: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					node.pv = "{type: \"commaTab\", args: [" + aNodeArgs.join(", ") + "]}"; // we must delay the commaTab() call until print() is called
					return node.pv;
				},
				cont: function (node) {
					node.pv = "o." + node.type + "(); break;"; // append break
					return node.pv;
				},
				data: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					aNodeArgs.unshift(that.iLine); // prepend line number
					that.aData.push("o.data(" + aNodeArgs.join(", ") + ")"); // will be set at the beginning of the script
					node.pv = "/* data */";
					return node.pv;
				},
				def: function (node) { // somehow special because we need to get plain variables
					var aNodeArgs, sName, sExpression, sVarType, sValue;

					sName = fnParseOneArg(node.left);

					oDevScopeArgs = {};
					bDevScopeArgsCollect = true;
					aNodeArgs = fnParseArgs(node.args);
					bDevScopeArgsCollect = false;
					sExpression = fnParseOneArg(node.right);
					oDevScopeArgs = null;

					fnPropagateStaticTypes(node, node.left, node.value, "II RR IR RI $$");
					sVarType = fnDetermineStaticVarType(sName);
					if (node.pt) {
						sValue = sExpression;
					} else {
						sValue = "o.vmAssign(\"" + sVarType + "\", " + sExpression + ")";
					}
					sValue = sName + " = function (" + aNodeArgs.join(", ") + ") { return " + sValue + "; };";
					node.pv = sValue;
					return node.pv;
				},
				defint: function (node) { // somehow special
					node.pv = this.fnParseDefIntRealStr(node);
					return node.pv;
				},
				defreal: function (node) { // somehow special
					node.pv = this.fnParseDefIntRealStr(node);
					return node.pv;
				},
				defstr: function (node) { // somehow special
					node.pv = this.fnParseDefIntRealStr(node);
					return node.pv;
				},
				dim: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						i, sName, aName, sStringType;

					for (i = 0; i < aNodeArgs.length; i += 1) {
						sName = aNodeArgs[i];
						sName += " "; // for buggy IE8 split: Otherwise it won't return last empty element in split
						aName = sName.split(/\[|\]\[|\]/); // split in variable and dimension(s)
						aName.pop(); // remove empty last element
						sName = aName.shift();
						sStringType = (sName.indexOf("$") > -1) ? "$" : "";
						aNodeArgs[i] = sName + " = o.dim(\"" + sStringType + "\", " + aName.join(", ") + ")";
					}
					node.pv = aNodeArgs.join("; ");
					return node.pv;
				},
				"delete": function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sName = Utils.bSupportReservedNames ? "o.delete" : 'o["delete"]';

					node.pv = sName + "(" + aNodeArgs.join(", ") + "); break;";
					return node.pv;
				},
				end: function (node) {
					var sName = that.iLine + "s" + that.iStopCount; // same as stop, use also stopCount

					that.iStopCount += 1;
					node.pv = "o.end(\"" + sName + "\"); break;\ncase \"" + sName + "\":";
					return node.pv;
				},
				erase: function (node) { // somehow special because we need to get plain variables
					var value = this.fnParseErase(node);

					node.pv = value;
					return node.pv;
				},
				error: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					node.pv = "o.error(" + aNodeArgs[0] + "); break";
					return node.pv;
				},
				everyGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					this.fnAddReferenceLabel(aNodeArgs[2], node.args[2]); // argument 2 = line number
					node.pv = "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
					return node.pv;
				},
				fn: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sName = fnParseOneArg(node.left);

					if (node.left.pt) {
						node.pt = node.left.pt;
					}
					node.pv = sName + "(" + aNodeArgs.join(", ") + ")";
					return node.pv;
				},

				"for": function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sVarName, sLabel, value, startValue, endValue, stepValue, startNode, endNode, stepNode, bStartIsIntConst, bEndIsIntConst, bStepIsIntConst, sStepName, sEndName, sVarType, sType, sEndNameOrValue;

					sVarName = aNodeArgs[0];
					sLabel = that.iLine + "f" + that.iForCount;
					that.oStack.forLabel.push(sLabel);
					that.oStack.forVarName.push(sVarName);
					that.iForCount += 1;

					startValue = aNodeArgs[1];
					endValue = aNodeArgs[2];
					stepValue = aNodeArgs[3];
					if (stepValue === "null") {
						stepValue = 1;
					}

					startNode = node.args[1];
					endNode = node.args[2];
					stepNode = node.args[3];

					// optimization for integer constants (check value and not type, because we also want to accept e.g. -<number>)
					bStartIsIntConst = fnIsIntConst(startValue);
					bEndIsIntConst = fnIsIntConst(endValue);
					bStepIsIntConst = fnIsIntConst(stepValue);

					sVarType = fnDetermineStaticVarType(sVarName);
					sType = (sVarType.length > 1) ? sVarType.charAt(1) : "";
					if (sType === "$") {
						throw that.composeError(Error(), "String type in FOR at", node.type, node.pos);
					}

					if (!bStartIsIntConst) {
						if (startNode.pt !== "I") {
							startValue = "o.vmAssign(\"" + sVarType + "\", " + startValue + ")"; // assign checks and rounds, if needed
						}
					}
					if (!bEndIsIntConst) {
						if (endNode.pt !== "I") {
							endValue = "o.vmAssign(\"" + sVarType + "\", " + endValue + ")";
						}
						sEndName = sVarName + "End";
						value = sEndName.substr(2); // remove preceding "v."
						fnDeclareVariable(value); // declare also end variable
					}
					if (!bStepIsIntConst) {
						if (stepNode.pt !== "I") {
							stepValue = "o.vmAssign(\"" + sVarType + "\", " + stepValue + ")";
						}
						sStepName = sVarName + "Step";
						value = sStepName.substr(2); // remove preceding "v."
						fnDeclareVariable(value); // declare also step variable
					}

					value = "/* for() */";
					if (sType !== "I") {
						value += " o.vmAssertNumberType(\"" + sVarType + "\");"; // do a type check: assert number type
					}

					value += " " + sVarName + " = " + startValue + ";";

					if (!bEndIsIntConst) {
						value += " " + sEndName + " = " + endValue + ";";
					}
					if (!bStepIsIntConst) {
						value += " " + sStepName + " = " + stepValue + ";";
					}
					value += " o.goto(\"" + sLabel + "b\"); break;";
					value += "\ncase \"" + sLabel + "\": ";

					value += sVarName + " += " + (bStepIsIntConst ? stepValue : sStepName) + ";";

					value += "\ncase \"" + sLabel + "b\": ";

					sEndNameOrValue = bEndIsIntConst ? endValue : sEndName;
					if (bStepIsIntConst) {
						if (stepValue > 0) {
							value += "if (" + sVarName + " > " + sEndNameOrValue + ") { o.goto(\"" + sLabel + "e\"); break; }";
						} else if (stepValue < 0) {
							value += "if (" + sVarName + " < " + sEndNameOrValue + ") { o.goto(\"" + sLabel + "e\"); break; }";
						} else { // stepValue === 0 => endless loop, if starting with var < end
							value += "if (" + sVarName + " < " + sEndNameOrValue + ") { o.goto(\"" + sLabel + "e\"); break; }";
						}
					} else {
						value += "if (" + sStepName + " > 0 && " + sVarName + " > " + sEndNameOrValue + " || " + sStepName + " < 0 && " + sVarName + " < " + sEndNameOrValue + ") { o.goto(\"" + sLabel + "e\"); break; }";
					}
					node.pv = value;
					return node.pv;
				},

				frame: function (node) {
					node.pv = this.fnCommandWithGoto(node);
					return node.pv;
				},
				gosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						iLine = aNodeArgs[0],
						sName = that.iLine + "g" + that.iGosubCount;

					that.iGosubCount += 1;
					this.fnAddReferenceLabel(iLine, node.args[0]);
					node.pv = 'o.gosub("' + sName + '", ' + iLine + '); break; \ncase "' + sName + '":';
					return node.pv;
				},
				"goto": function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						iLine = aNodeArgs[0];

					this.fnAddReferenceLabel(iLine, node.args[0]);
					node.pv = "o.goto(" + iLine + "); break";
					return node.pv;
				},
				"if": function (node) {
					var aNodeArgs, sLabel, value, sPart;

					sLabel = that.iLine + "i" + that.iIfCount;
					that.iIfCount += 1;

					value = "if (" + fnParseOneArg(node.left) + ') { o.goto("' + sLabel + '"); break; } ';
					if (node.third) {
						aNodeArgs = fnParseArgs(node.third);
						sPart = aNodeArgs.join("; ");
						value += "/* else */ " + sPart + "; ";
					}
					value += 'o.goto("' + sLabel + 'e"); break;';
					aNodeArgs = fnParseArgs(node.right);
					sPart = aNodeArgs.join("; ");
					value += '\ncase "' + sLabel + '": ' + sPart + ";";
					value += '\ncase "' + sLabel + 'e": ';
					node.pv = value;
					return node.pv;
				},
				input: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						aVarTypes = [],
						i, sLabel, sVarType, value, sStream, sNoCRLF, sMsg;

					sLabel = that.iLine + "s" + that.iStopCount;
					that.iStopCount += 1;

					sStream = aNodeArgs.shift();
					sNoCRLF = aNodeArgs.shift();
					sMsg = aNodeArgs.shift();

					for (i = 0; i < aNodeArgs.length; i += 1) {
						sVarType = fnDetermineStaticVarType(aNodeArgs[i]);
						aVarTypes[i] = sVarType;
					}

					value = "o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":"; // also before input
					sLabel = that.iLine + "s" + that.iStopCount;
					that.iStopCount += 1;

					value += "o.input(" + sStream + ", " + sNoCRLF + ", " + sMsg + ", \"" + aVarTypes.join('", "') + "\"); o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":";
					for (i = 0; i < aNodeArgs.length; i += 1) {
						value += "; " + aNodeArgs[i] + " = o.vmGetNextInput()";
					}

					node.pv = value;
					return node.pv;
				},
				let: function (node) {
					node.pv = this.assign(node);
					return node.pv;
				},
				lineInput: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						aVarTypes = [],
						sLabel, value, i, sStream, sNoCRLF, sMsg;

					sLabel = that.iLine + "s" + that.iStopCount;
					that.iStopCount += 1;

					sStream = aNodeArgs.shift();
					sNoCRLF = aNodeArgs.shift();
					sMsg = aNodeArgs.shift();

					// we should have just one variable name
					for (i = 0; i < aNodeArgs.length; i += 1) {
						aVarTypes[i] = fnDetermineStaticVarType(aNodeArgs[i]);
					}

					value = "o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":"; // also before input
					sLabel = that.iLine + "s" + that.iStopCount;
					that.iStopCount += 1;

					value += "o.lineInput(" + sStream + ", " + sNoCRLF + ", " + sMsg + ", \"" + aVarTypes.join('", "') + "\"); o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":";
					for (i = 0; i < aNodeArgs.length; i += 1) {
						value += "; " + aNodeArgs[i] + " = o.vmGetNextInput()";
					}
					node.pv = value;
					return node.pv;
				},
				list: function (node) {
					var aNodeArgs = fnParseArgs(node.args); // or: fnCommandWithGoto

					node.pv = "o.list(" + aNodeArgs.join(", ") + "); break;";
					return node.pv;
				},
				load: function (node) {
					node.pv = this.fnCommandWithGoto(node);
					return node.pv;
				},
				merge: function (node) {
					that.bMergeFound = true;
					node.pv = this.fnCommandWithGoto(node);
					return node.pv;
				},
				"new": function (node) {
					var sName = Utils.bSupportReservedNames ? "o.new" : 'o["new"]';

					node.pv = sName + "();";
					return node.pv;
				},
				next: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						i, sLabel, sVarName, oErrorNode;

					if (!aNodeArgs.length) {
						aNodeArgs.push(""); // we have no variable, so use empty argument
					}
					for (i = 0; i < aNodeArgs.length; i += 1) {
						sLabel = that.oStack.forLabel.pop();
						sVarName = that.oStack.forVarName.pop();
						if (sLabel === undefined) {
							if (aNodeArgs[i] === "") { // inserted node?
								oErrorNode = node;
							} else { // identifier arg
								oErrorNode = node.args[i];
							}
							throw that.composeError(Error(), "Unexpected NEXT at", oErrorNode.type, oErrorNode.pos);
						}
						if (aNodeArgs[i] !== "" && aNodeArgs[i] !== sVarName) {
							oErrorNode = node.args[i];
							throw that.composeError(Error(), "Unexpected NEXT variable", oErrorNode.value, oErrorNode.pos);
						}
						aNodeArgs[i] = "/* next(\"" + aNodeArgs[i] + "\") */ o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "e\":";
					}
					node.pv = aNodeArgs.join("; ");
					return node.pv;
				},
				onBreakGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						iLine = aNodeArgs[0];

					this.fnAddReferenceLabel(iLine, node.args[0]);
					node.pv = "o." + node.type + "(" + iLine + ")";
					return node.pv;
				},
				onErrorGoto: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						iLine = aNodeArgs[0];

					if (iLine) { // only for lines > 0
						this.fnAddReferenceLabel(iLine, node.args[0]);
					}
					node.pv = "o." + node.type + "(" + iLine + ")";
					return node.pv;
				},
				onGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sName = node.type,
						sLabel = that.iLine + "g" + that.iGosubCount,
						i;

					that.iGosubCount += 1;
					for (i = 1; i < aNodeArgs.length; i += 1) { // start with argument 1
						this.fnAddReferenceLabel(aNodeArgs[i], node.args[i]);
					}
					aNodeArgs.unshift('"' + sLabel + '"');
					node.pv = "o." + sName + "(" + aNodeArgs.join(", ") + '); break; \ncase "' + sLabel + '":';
					return node.pv;
				},
				onGoto: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sName = node.type,
						sLabel = that.iLine + "s" + that.iStopCount,
						i;

					that.iStopCount += 1;
					for (i = 1; i < aNodeArgs.length; i += 1) { // start with argument 1
						this.fnAddReferenceLabel(aNodeArgs[i], node.args[i]);
					}
					aNodeArgs.unshift('"' + sLabel + '"');
					node.pv = "o." + sName + "(" + aNodeArgs.join(", ") + "); break\ncase \"" + sLabel + "\":";
					return node.pv;
				},
				onSqGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					this.fnAddReferenceLabel(aNodeArgs[1], node.args[1]); // argument 1: line number
					node.pv = "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
					return node.pv;
				},
				openin: function (node) {
					return this.fnCommandWithGoto(node);
				},
				randomize: function (node) {
					var aNodeArgs, value, sLabel;

					if (node.args.length) {
						aNodeArgs = fnParseArgs(node.args);
						value = "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
					} else {
						sLabel = that.iLine + "s" + that.iStopCount;
						that.iStopCount += 1;
						value = "o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":"; // also before input

						value += this.fnCommandWithGoto(node) + " o.randomize(o.vmGetNextInput())";
					}
					node.pv = value;
					return node.pv;
				},
				read: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						i, sName, sVarType;

					for (i = 0; i < aNodeArgs.length; i += 1) {
						sName = aNodeArgs[i];
						sVarType = fnDetermineStaticVarType(sName);
						aNodeArgs[i] = sName + " = o.read(\"" + sVarType + "\")";
					}
					node.pv = aNodeArgs.join("; ");
					return node.pv;
				},
				rem: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sValue = aNodeArgs[0];

					if (sValue !== undefined) {
						sValue = " " + sValue.substr(1, sValue.length - 2); // remove surrounding quotes
					} else {
						sValue = "";
					}
					node.pv = "//" + sValue + "\n";
					return node.pv;
				},
				renum: function (node) {
					node.pv = this.fnCommandWithGoto(node);
					return node.pv;
				},
				restore: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					if (aNodeArgs.length) {
						this.fnAddReferenceLabel(aNodeArgs[0], node.args[0]); // optional line number
					}
					node.pv = "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
					return node.pv;
				},
				resume: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					if (aNodeArgs.length) {
						this.fnAddReferenceLabel(aNodeArgs[0], node.args[0]); // optional line number
					}
					node.pv = "o." + node.type + "(" + aNodeArgs.join(", ") + "); break"; // append break
					return node.pv;
				},
				"return": function (node) {
					var sName = Utils.bSupportReservedNames ? "o.return" : 'o["return"]';

					node.pv = sName + "(); break;";
					return node.pv;
				},
				run: function (node) { // optional arg can be number or string
					if (node.args.length) {
						if (node.args[0].type === "linenumber" || node.args[0].type === "number") { // optional line number //TTT should be linenumber only
							this.fnAddReferenceLabel(fnParseOneArg(node.args[0]), node.args[0]); // parse only one arg, args are parsed later
						}
					}

					node.pv = this.fnCommandWithGoto(node);
					return node.pv;
				},
				save: function (node) {
					var aNodeArgs = [],
						sFileName, sType, aNodeArgs2;

					if (node.args.length) {
						sFileName = fnParseOneArg(node.args[0]);
						aNodeArgs.push(sFileName);
						if (node.args.length > 1) {
							oDevScopeArgs = {};
							bDevScopeArgsCollect = true;
							sType = '"' + fnParseOneArg(node.args[1]) + '"';
							aNodeArgs.push(sType);
							bDevScopeArgsCollect = false;
							oDevScopeArgs = null;
							aNodeArgs2 = node.args.slice(2); // get remaining args
							aNodeArgs2 = fnParseArgs(aNodeArgs2);
							aNodeArgs = aNodeArgs.concat(aNodeArgs2);
						}
					}
					node.pv = this.fnCommandWithGoto(node, aNodeArgs);
					return node.pv;
				},
				sound: function (node) {
					node.pv = this.fnCommandWithGoto(node); // maybe queue is full, so insert break
					return node.pv;
				},
				spc: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					node.pv = "{type: \"spc\", args: [" + aNodeArgs.join(", ") + "]}"; // we must delay the spc() call until print() is called because we need stream
					return node.pv;
				},
				stop: function (node) {
					var sName = that.iLine + "s" + that.iStopCount;

					that.iStopCount += 1;
					node.pv = "o.stop(\"" + sName + "\"); break;\ncase \"" + sName + "\":";
					return node.pv;
				},
				tab: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					node.pv = "{type: \"tab\", args: [" + aNodeArgs.join(", ") + "]}"; // we must delay the tab() call until print() is called
					return node.pv;
				},
				wend: function (node) {
					var sLabel = that.oStack.whileLabel.pop();

					if (sLabel === undefined) {
						throw that.composeError(Error(), "Unexpected WEND at", node.type, node.pos);
					}
					node.pv = "/* o.wend() */ o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "e\":";
					return node.pv;
				},
				"while": function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sLabel = that.iLine + "w" + that.iWhileCount;

					that.oStack.whileLabel.push(sLabel);
					that.iWhileCount += 1;
					node.pv = "\ncase \"" + sLabel + "\": if (!(" + aNodeArgs + ")) { o.goto(\"" + sLabel + "e\"); break; }";
					return node.pv;
				}
			},

			fnParseOther = function (node) {
				var aNodeArgs = fnParseArgs(node.args),
					sTypeWithSpaces = " " + node.type + " ";

				node.pv = "o." + node.type + "(" + aNodeArgs.join(", ") + ")";

				if (fnIsInString(" asc cint derr eof erl err fix fre inkey inp instr int joy len memory peek pos remain sgn sq test testr unt vpos xpos ypos ", sTypeWithSpaces)) {
					node.pt = "I";
				} else if (fnIsInString(" abs atn cos creal exp log log10 max min pi rnd round sin sqr tan time val ", sTypeWithSpaces)) {
					node.pt = "R";
				} else if (fnIsInString(" bin$ chr$ copychr$ dec$ hex$ inkey$ left$ lower$ mid$ right$ space$ str$ string$ upper$ ", sTypeWithSpaces)) {
					node.pt = "$";
				}

				return node.pv;
			},


			parseNode = function (node) {
				var value, value2;

				if (Utils.debug > 3) {
					Utils.console.debug("evaluate: parseNode node=%o type=" + node.type + " value=" + node.value + " left=%o right=%o args=%o", node, node.left, node.right, node.args);
				}

				if (mOperators[node.type]) {
					if (node.left) {
						value = parseNode(node.left);
						if (mOperators[node.left.type] && node.left.left) { // binary operator?
							value = "(" + value + ")";
							node.left.pv = value;
						}
						value2 = parseNode(node.right);
						if (mOperators[node.right.type] && node.right.left) { // binary operator?
							value2 = "(" + value2 + ")";
							node.right.pv = value2;
						}
						value = mOperators[node.type](node, node.left, node.right);
					} else {
						value = parseNode(node.right);
						value = mOperators[node.type](node, node.right);
					}
				} else if (mParseFunctions[node.type]) { // function with special handling?
					value = mParseFunctions[node.type](node);
				} else { // for other functions, generate code directly
					value = fnParseOther(node);
				}

				return value;
			},

			fnCommentUnusedCases = function (sOutput2, oLabels2) {
				sOutput2 = sOutput2.replace(/^case (\d+):/gm, function (sAll, sLine) {
					return (oLabels2[sLine]) ? sAll : "/* " + sAll + " */";
				});
				return sOutput2;
			},

			fnCreateLabelsMap = function (oLabels2) {
				var iLastLine = -1,
					i, oNode, sLine, iLine;

				for (i = 0; i < parseTree.length; i += 1) {
					oNode = parseTree[i];
					if (oNode.type === "label") {
						sLine = oNode.value;
						if (sLine in oLabels2) {
							throw that.composeError(Error(), "Duplicate line number", sLine, oNode.pos);
						}
						iLine = Number(sLine);
						if (!isNaN(iLine)) { // not for "direct"
							if (iLine <= iLastLine) {
								throw that.composeError(Error(), "Line number not increasing", sLine, oNode.pos);
							}
							if (iLine < 1 || iLine > 65535) {
								throw that.composeError(Error(), "Line number overflow", sLine, oNode.pos);
							}
							iLastLine = iLine;
						}
						oLabels2[sLine] = 0; // init call count
					}
				}
			},

			fnEvaluate = function () {
				var sOutput = "",
					i, sNode;

				for (i = 0; i < parseTree.length; i += 1) {
					if (Utils.debug > 2) {
						Utils.console.debug("evaluate: parseTree i=%d, node=%o", i, parseTree[i]);
					}
					sNode = parseNode(parseTree[i]);
					if ((sNode !== undefined) && (sNode !== "")) {
						if (sNode !== null) {
							if (sOutput.length === 0) {
								sOutput = sNode;
							} else {
								sOutput += "\n" + sNode;
							}
						} else {
							sOutput = ""; // cls (clear output when sNode is set to null)
						}
					}
				}

				// optimize: comment lines which are not referenced
				if (!that.bMergeFound) {
					sOutput = fnCommentUnusedCases(sOutput, that.oLabels);
				}
				return sOutput;
			};

		// create labels map
		fnCreateLabelsMap(this.oLabels);

		return fnEvaluate();
	},

	generate: function (sInput, oVariables, bAllowDirect) {
		var fnCombineData = function (aData) {
				var sData = "";

				sData = aData.join(";\n");
				if (sData.length) {
					sData += ";\n";
				}
				return sData;
			},
			oOut = {
				text: ""
			},
			aTokens, aParseTree, sOutput;

		try {
			aTokens = this.lexer.lex(sInput);
			aParseTree = this.parser.parse(aTokens, bAllowDirect);
			sOutput = this.evaluate(aParseTree, oVariables);
			oOut.text = '"use strict"\n'
				+ "var v=o.vmGetAllVariables();\n"
				+ "while (o.vmLoopCondition()) {\nswitch (o.iLine) {\ncase 0:\n"
				+ fnCombineData(this.aData)
				+ " o.goto(o.iStartLine ? o.iStartLine : \"start\"); break;\ncase \"start\":\n"
				+ sOutput
				+ "\ncase \"end\": o.vmStop(\"end\", 90); break;\ndefault: o.error(8); o.goto(\"end\"); break;\n}}\n";
		} catch (e) {
			oOut.error = e;
			if ("pos" in e) {
				Utils.console.warn(e); // our errors have "pos" defined => show as warning
			} else { // other errors
				Utils.console.error(e);
			}
		}
		return oOut;
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = CodeGeneratorJs;
}
