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
		this.options = options || {}; // e.g. tron

		this.lexer = this.options.lexer;
		this.parser = this.options.parser;
		this.reset();
	},

	reset: function () {
		this.iLine = 0; // current line (label)

		this.oStack = {
			forLabel: [],
			forVarName: [],
			whileLabel: []
		};
		this.iGosubCount = 0;
		this.iIfCount = 0;
		this.iStopCount = 0;
		this.iForCount = 0; // stack needed
		this.iWhileCount = 0; // stack needed

		this.aData = []; // collected data from data lines

		this.oLabels = {}; // labels or line numbers
		this.bMergeFound = false; // if we find chain or chain merge, the program is not complete and we cannot check for existing line numbers during compile time (or do a renumber)
	},

	//
	// evaluate
	//
	evaluate: function (parseTree, variables) {
		var that = this,

			fnGetVarDefault = function (/* sName */) {
				return 1; // during compile step, we just init all variables with 1
			},

			oDevScopeArgs = null,
			bDevScopeArgsCollect = false,

			fnAdaptVariableName = function (sName, iArrayIndices) {
				sName = sName.toLowerCase();
				sName = sName.replace(/\./g, "_");
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
						oDevScopeArgs[sName] = fnGetVarDefault(sName); // declare
					} else if (!(sName in oDevScopeArgs)) {
						// variable
						variables[sName] = fnGetVarDefault(sName); // declare
						sName = "v." + sName; // access with "v."
					}
				} else {
					variables[sName] = fnGetVarDefault(sName); // declare
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
				var sNameType;

				if (sName.indexOf("v.") === 0) {
					sName = sName.substr(2); // remove preceiding "v."
				}

				sNameType = sName.charAt(0); // take first character to determine var type later

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

			fnIsIntConst = function (a) {
				var reIntConst = /^[+-]?([0-9]+|0x[0-9a-f]+|0b[0-1]+)$/; // regex for integer, hex, binary constant

				return reIntConst.test(String(a));
			},

			fnGetRoundString = function (a) {
				if (!fnIsIntConst(a)) { // no rounding needed for integer, hex, binary constants (optimization)
					a = "o.vmRound(" + a + ")";
				}
				return a;
			},

			mOperators = {
				"+": function (a, b) {
					if (b === undefined) { // unary plus?
						if (typeof a === "string" && a.charAt(0) === "(" && a.charAt(a.length - 1) === ")") { // already in parenthesis?
							return a;
						}
						return fnIsIntConst(a) ? a : "(" + a + ")"; // a can be an expression
					}
					return a + " + " + b;
				},
				"-": function (a, b) {
					if (b === undefined) { // unary minus?
						// when optimizing, beware of "--"!
						if (fnIsIntConst(a)) {
							a = String(a);
							if (a.charAt(0) === "-") { // starting already with "-"?
								return a.substr(1); // remove "-"
							}
							return "-" + a;
						}
						return "-(" + a + ")"; // a can be an expression
					}
					return a + " - " + b;
				},
				"*": function (a, b) {
					return a + " * " + b;
				},
				"/": function (a, b) {
					return a + " / " + b;
				},
				"\\": function (a, b) {
					return "(" + a + " / " + b + ") | 0"; // integer division
				},
				"^": function (a, b) {
					return "Math.pow(" + a + " , " + b + ")";
				},
				and: function (a, b) {
					return fnGetRoundString(a) + " & " + fnGetRoundString(b);
				},
				or: function (a, b) {
					return fnGetRoundString(a) + " | " + fnGetRoundString(b);
				},
				xor: function (a, b) {
					return fnGetRoundString(a) + " ^ " + fnGetRoundString(b);
				},
				not: function (a) {
					return "~(" + fnGetRoundString(a) + ")"; // a can be an expression
				},
				mod: function (a, b) {
					return fnGetRoundString(a) + " % " + fnGetRoundString(b);
				},
				">": function (a, b) {
					return a + " > " + b + " ? -1 : 0";
				},
				"<": function (a, b) {
					return a + " < " + b + " ? -1 : 0";
				},
				">=": function (a, b) {
					return a + " >= " + b + " ? -1 : 0";
				},
				"<=": function (a, b) {
					return a + " <= " + b + " ? -1 : 0";
				},
				"=": function (a, b) {
					return a + " === " + b + " ? -1 : 0";
				},
				"<>": function (a, b) {
					return a + " !== " + b + " ? -1 : 0";
				},
				"@": function (a) {
					return 'o.addressOf("' + a + '")'; // address of
				},
				"#": function (a) {
					return a; // stream
				}
			},

			mParseFunctions = {
				fnParseDefIntRealStr: function (node) {
					var reVarLetters = /^[A-Za-z]( - [A-Za-z])?$/,
						aNodeArgs, i, sArg;

					oDevScopeArgs = {};
					bDevScopeArgsCollect = true;
					aNodeArgs = fnParseArgs(node.args);
					bDevScopeArgsCollect = false;
					oDevScopeArgs = null;

					for (i = 0; i < aNodeArgs.length; i += 1) {
						sArg = aNodeArgs[i];
						if (sArg.indexOf("oNo") >= 0) { // need to replace modified "o" variable!
							sArg = sArg.replace(/oNo/g, "o");
						}
						if (!reVarLetters.test(sArg)) {
							throw new CodeGeneratorJs.ErrorObject("Wrong format for " + node.type, sArg, node.args.length ? node.args[0].pos : node.pos);
							// how to get correct position and length of expression?
						}
						aNodeArgs[i] = "o." + node.type + '("' + sArg + '")';
					}
					return aNodeArgs.join("; ");
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
					return "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
				},

				fnAddReferenceLabel: function (sLabel, node) {
					if (sLabel in that.oLabels) {
						that.oLabels[sLabel] += 1;
					} else {
						if (Utils.debug > 1) {
							Utils.console.debug("fnAddReferenceLabel: line does not (yet) exist:", sLabel);
						}
						if (!that.bMergeFound) {
							throw new CodeGeneratorJs.ErrorObject("Line does not exist", sLabel, node.pos);
						}
					}
				},

				fnCommandWithGoto: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sCommand = node.type,
						sLabel, sValue;

					sLabel = that.iLine + "s" + that.iStopCount; // we use stopCount
					that.iStopCount += 1;
					sValue = "o." + sCommand + "(" + aNodeArgs.join(", ") + "); o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":";
					return sValue;
				},

				"|": function (node) { // rsx
					var sRsxName = "rsx" + Utils.stringCapitalize(node.value.toLowerCase()),
						aNodeArgs = fnParseArgs(node.args);

					return "o." + sRsxName + "(" + aNodeArgs.join(", ") + ")";
				},
				number: function (node) {
					return node.value;
				},
				string: function (node) {
					return '"' + node.value + '"';
				},
				binnumber: function (node) {
					var sValue = node.value.slice(2);

					if (Utils.bSupportsBinaryLiterals) {
						sValue = "0b" + ((sValue.length) ? sValue : "0"); // &x->0b; 0b is ES6
					} else {
						sValue = "0x" + ((sValue.length) ? parseInt(sValue, 2).toString(16) : "0"); // we convert it to hex
					}
					return sValue;
				},
				hexnumber: function (node) {
					var value = node.value.slice(1);

					value = "0x" + ((value.length) ? value : "0"); // &->0x
					return value;
				},
				linenumber: function (node) {
					return node.value;
				},
				identifier: function (node) {
					var sName = fnAdaptVariableName(node.value); // here we use node.value

					return sName;
				},
				"null": function () { // means: no parameter specified
					return "null";
				},
				array: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sName = fnAdaptVariableName(node.value, aNodeArgs.length),
						sValue = sName + aNodeArgs.map(function (val) {
							return "[" + val + "]";
						}).join("");

					return sValue;
				},
				assign: function (node) { // see also "let"
					var aNodeArgs, sName, sVarType, sArray, sValue;

					if (node.left.type === "array") {
						aNodeArgs = fnParseArgs(node.left.args);
						sName = fnAdaptVariableName(node.left.value, aNodeArgs.length);
						sArray = aNodeArgs.map(function (val) {
							return "[" + val + "]";
						}).join("");
					} else if (node.left.type === "identifier") {
						sName = fnAdaptVariableName(node.left.value);
						sArray = "";
					} else {
						throw new CodeGeneratorJs.ErrorObject("Unexpected assing type", node.type, node.pos); // should not occur
					}

					// value = sName + value + " = " + fnParseOneArg(node.right); // assign without type checking and rounding

					// type checking and rounding is more accurate but will cost much performance...
					sVarType = fnDetermineStaticVarType(sName);
					sValue = sName + sArray + " = o.vmAssign(\"" + sVarType + "\", " + fnParseOneArg(node.right) + ")";
					return sValue;
				},
				label: function (node) {
					var value = "case " + node.value + ":",
						aNodeArgs, value2, i;

					that.iLine = node.value; // set line first
					aNodeArgs = fnParseArgs(node.args);

					if (that.options.tron) {
						value += " o.vmTrace(" + that.iLine + ");";
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
					return value;
				},

				// special keyword functions

				afterGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					this.fnAddReferenceLabel(aNodeArgs[2], node.args[2]); // argument 2 = line number
					return "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
				},
				call: function (node) {
					return this.fnCommandWithGoto(node);
				},
				chain: function (node) {
					return this.fnCommandWithGoto(node);
				},
				chainMerge: function (node) {
					that.bMergeFound = true;
					return this.fnCommandWithGoto(node);
				},
				commaTab: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					return "{type: \"commaTab\", args: [" + aNodeArgs.join(", ") + "]}"; // we must delay the commaTab() call until print() is called
				},
				data: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					aNodeArgs.unshift(that.iLine); // prepend line number
					that.aData.push("o.data(" + aNodeArgs.join(", ") + ")"); // will be set at the beginning of the script
					return "/* data */";
				},
				def: function (node) { // somehow special because we need to get plain variables
					var aNodeArgs, sName, value;

					sName = fnAdaptVariableName(node.left);
					oDevScopeArgs = {};
					bDevScopeArgsCollect = true;
					aNodeArgs = fnParseArgs(node.args);
					bDevScopeArgsCollect = false;
					value = fnParseOneArg(node.value);
					oDevScopeArgs = null;
					value = sName + " = function (" + aNodeArgs.join(", ") + ") { return " + value + "; };";
					return value;
				},
				defint: function (node) { // somehow special because we need to get first character of variable only
					return this.fnParseDefIntRealStr(node);
				},
				defreal: function (node) { // somehow special because we need to get first character of variable only
					return this.fnParseDefIntRealStr(node);
				},
				defstr: function (node) { // somehow special because we need to get first character of variable only
					return this.fnParseDefIntRealStr(node);
				},
				dim: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						i, sName, aName, sStringType;

					for (i = 0; i < aNodeArgs.length; i += 1) {
						sName = aNodeArgs[i];
						aName = sName.split(/\[|\]\[|\]/);
						aName.pop(); // remove empty last element
						sName = aName.shift();
						sStringType = (sName.indexOf("$") > -1) ? "$" : "";
						aNodeArgs[i] = sName + " = o.dim(\"" + sStringType + "\", " + aName.join(", ") + ")";
					}
					return aNodeArgs.join("; ");
				},
				end: function () {
					var sName = that.iLine + "s" + that.iStopCount; // same as stop, use also stopCount

					that.iStopCount += 1;
					return "o.end(\"" + sName + "\"); break;\ncase \"" + sName + "\":";
				},
				erase: function (node) { // somehow special because we need to get plain variables
					var value = this.fnParseErase(node);

					return value;
				},
				error: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					return "o.error(" + aNodeArgs[0] + "); break";
				},
				everyGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					this.fnAddReferenceLabel(aNodeArgs[2], node.args[2]); // argument 2 = line number
					return "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
				},
				fn: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sName = fnAdaptVariableName(node.left);

					return sName + "(" + aNodeArgs.join(", ") + ")";
				},

				"for": function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sVarName, sLabel, value, startValue, endValue, stepValue, bStartIsIntConst, bEndIsIntConst, bStepIsIntConst, sStepName, sEndName, sVarType, sType, sEndNameOrValue;

					sVarName = aNodeArgs[0];
					sLabel = that.iLine + "f" + that.iForCount;
					that.oStack.forLabel.push(sLabel);
					that.oStack.forVarName.push(sVarName);
					that.iForCount += 1;

					startValue = fnParseOneArg(node.left);
					endValue = fnParseOneArg(node.right);
					stepValue = fnParseOneArg(node.third);

					// optimization for integer constants
					bStartIsIntConst = fnIsIntConst(startValue);
					bEndIsIntConst = fnIsIntConst(endValue);
					bStepIsIntConst = fnIsIntConst(stepValue);

					sVarType = fnDetermineStaticVarType(sVarName);
					sType = (sVarType.length > 1) ? sVarType.charAt(1) : "";
					if (sType === "$") {
						throw new CodeGeneratorJs.ErrorObject("String type in FOR at", node.type, node.pos);
					}

					if (!bStartIsIntConst) {
						startValue = "o.vmAssign(\"" + sVarType + "\", " + startValue + ")";
					}
					if (!bEndIsIntConst) {
						endValue = "o.vmAssign(\"" + sVarType + "\", " + endValue + ")";
						sEndName = sVarName + "End";
						value = sEndName.substr(2); // remove preceiding "v."
						variables[value] = 0; // declare also end variable
					}
					if (!bStepIsIntConst) {
						stepValue = "o.vmAssign(\"" + sVarType + "\", " + stepValue + ")";
						sStepName = sVarName + "Step";
						value = sStepName.substr(2); // remove preceiding "v."
						variables[value] = 0; // declare also step variable
					}

					value = "/* for() */ o.vmAssertNumberType(\"" + sVarType + "\");"; // do a type check: assert number type
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
					return value;
				},

				frame: function (node) {
					return this.fnCommandWithGoto(node);
				},
				gosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						iLine = aNodeArgs[0],
						sName = that.iLine + "g" + that.iGosubCount;

					that.iGosubCount += 1;
					this.fnAddReferenceLabel(iLine, node.args[0]);
					return 'o.gosub("' + sName + '", ' + iLine + '); break; \ncase "' + sName + '":';
				},
				"goto": function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						iLine = aNodeArgs[0];

					this.fnAddReferenceLabel(iLine, node.args[0]);
					return "o.goto(" + iLine + "); break";
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
					return value;
				},
				input: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sLabel, sVarType, value, i, sStream, sNoCRLF, sMsg;

					sLabel = that.iLine + "s" + that.iStopCount;
					that.iStopCount += 1;

					sStream = aNodeArgs.shift();
					sNoCRLF = aNodeArgs.shift();
					sMsg = aNodeArgs.shift();

					value = "o.input(" + sStream + ", " + sNoCRLF + ", " + sMsg + ", \"" + aNodeArgs.join('", "') + "\"); o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":";
					for (i = 0; i < aNodeArgs.length; i += 1) {
						sVarType = fnDetermineStaticVarType(aNodeArgs[i]);
						value += "; " + aNodeArgs[i] + " = o.vmGetNextInput(\"" + sVarType + "\")";
					}

					return value;
				},
				let: function (node) {
					return this.assign(node);
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

					value = "o.lineInput(" + sStream + ", " + sNoCRLF + ", " + sMsg + ", \"" + aVarTypes.join('", "') + "\"); o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":";
					for (i = 0; i < aNodeArgs.length; i += 1) {
						value += "; " + aNodeArgs[i] + " = o.vmGetNextInput(\"" + aVarTypes[i] + "\")";
					}
					return value;
				},
				load: function (node) {
					return this.fnCommandWithGoto(node);
				},
				merge: function (node) {
					that.bMergeFound = true;
					return this.fnCommandWithGoto(node);
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
							throw new CodeGeneratorJs.ErrorObject("Unexpected NEXT at", oErrorNode.type, oErrorNode.pos);
						}
						if (aNodeArgs[i] !== "" && aNodeArgs[i] !== sVarName) {
							oErrorNode = node.args[i];
							throw new CodeGeneratorJs.ErrorObject("Unexpected NEXT variable", oErrorNode.value, oErrorNode.pos);
						}
						aNodeArgs[i] = "/* next(\"" + aNodeArgs[i] + "\") */ o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "e\":";
					}
					return aNodeArgs.join("; ");
				},
				onBreakGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						iLine = aNodeArgs[0];

					this.fnAddReferenceLabel(iLine, node.args[0]);
					return "o." + node.type + "(" + iLine + ")";
				},
				onErrorGoto: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						iLine = aNodeArgs[0];

					if (iLine) { // only for lines > 0
						this.fnAddReferenceLabel(iLine, node.args[0]);
					}
					return "o." + node.type + "(" + iLine + ")";
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
					return "o." + sName + "(" + aNodeArgs.join(", ") + '); break; \ncase "' + sLabel + '":';
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
					return "o." + sName + "(" + aNodeArgs.join(", ") + "); break\ncase \"" + sLabel + "\":";
				},
				onSqGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					this.fnAddReferenceLabel(aNodeArgs[1], node.args[1]); // argument 1: line number
					return "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
				},
				openin: function (node) {
					return this.fnCommandWithGoto(node);
				},
				randomize: function (node) {
					var aNodeArgs, value;

					if (node.args.length) {
						aNodeArgs = fnParseArgs(node.args);
						value = "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
					} else {
						value = this.fnCommandWithGoto(node) + " o.randomize(o.vmGetNextInput(\"$$\"))";
					}
					return value;
				},
				read: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						i, sName, sVarType;

					for (i = 0; i < aNodeArgs.length; i += 1) {
						sName = aNodeArgs[i];
						sVarType = fnDetermineStaticVarType(sName);
						aNodeArgs[i] = sName + " = o.read(\"" + sVarType + "\")";
					}
					return aNodeArgs.join("; ");
				},
				rem: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sValue = aNodeArgs[0];

					if (sValue !== undefined) {
						sValue = " " + sValue.substr(1, sValue.length - 2); // remove surrounding quotes
					} else {
						sValue = "";
					}
					return "//" + sValue + "\n";
				},
				restore: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					if (aNodeArgs.length) {
						this.fnAddReferenceLabel(aNodeArgs[0], node.args[0]); // optional line number
					}
					return "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
				},
				resume: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					if (aNodeArgs.length) {
						this.fnAddReferenceLabel(aNodeArgs[0], node.args[0]); // optional line number
					}
					return "o." + node.type + "(" + aNodeArgs.join(", ") + "); break"; // append break
				},
				"return": function () {
					return "o.return(); break;";
				},
				run: function (node) { // optional arg can be number or string
					if (node.args.length) {
						if (node.args[0].type === "linenumber" || node.args[0].type === "number") { // optional line number //TTT should be linenumber only
							this.fnAddReferenceLabel(fnParseOneArg(node.args[0]), node.args[0]); // parse only one arg, args are parsed later
						}
					}

					return this.fnCommandWithGoto(node);
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
							aNodeArgs2 = fnParseArgs(node.args.splice(2)); // remaining args
							aNodeArgs = aNodeArgs.concat(aNodeArgs2);
						}
					}
					return "o." + node.type + "(" + aNodeArgs.join(", ") + ")";
				},
				sound: function (node) {
					return this.fnCommandWithGoto(node); // maybe queue is full, so insert break
				},
				spc: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					return "{type: \"spc\", args: [" + aNodeArgs.join(", ") + "]}"; // we must delay the spc() call until print() is called because we need stream
				},
				stop: function () {
					var sName = that.iLine + "s" + that.iStopCount;

					that.iStopCount += 1;
					return "o.stop(\"" + sName + "\"); break;\ncase \"" + sName + "\":";
				},
				tab: function (node) {
					var aNodeArgs = fnParseArgs(node.args);

					return "{type: \"tab\", args: [" + aNodeArgs.join(", ") + "]}"; // we must delay the tab() call until print() is called
				},
				wend: function (node) {
					var sLabel = that.oStack.whileLabel.pop();

					if (sLabel === undefined) {
						throw new CodeGeneratorJs.ErrorObject("Unexpected WEND at", node.type, node.pos);
					}
					return "/* o.wend() */ o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "e\":";
				},
				"while": function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sLabel = that.iLine + "w" + that.iWhileCount;

					that.oStack.whileLabel.push(sLabel);
					that.iWhileCount += 1;
					return "\ncase \"" + sLabel + "\": if (!(" + aNodeArgs + ")) { o.goto(\"" + sLabel + "e\"); break; }";
				}
			},


			parseNode = function (node) {
				var value, value2;

				if (Utils.debug > 3) {
					Utils.console.debug("evaluate: parseNode node=%o type=" + node.type + " value=" + node.value + " left=%o right=%o args=%o", node, node.left, node.right, node.args);
				}

				if (mOperators[node.type]) {
					if (node.left) {
						value = parseNode(node.left);
						if (mOperators[node.left.type]) { // binary operator?
							value = "(" + value + ")";
						}
						value2 = parseNode(node.right);
						if (mOperators[node.right.type]) { // binary operator?
							value2 = "(" + value2 + ")";
						}
						value = mOperators[node.type](value, value2);
					} else {
						value = mOperators[node.type](parseNode(node.right));
					}
				} else if (mParseFunctions[node.type]) { // function with special handling?
					value = mParseFunctions[node.type](node);
				} else { // for other functions, generate code directly
					node.args = fnParseArgs(node.args);
					value = "o." + node.type + "(" + node.args.join(", ") + ")";
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
				var iLastLine = 0,
					i, oNode, sLine, iLine;

				for (i = 0; i < parseTree.length; i += 1) {
					oNode = parseTree[i];
					if (oNode.type === "label") {
						sLine = oNode.value;
						iLine = Number(sLine);
						if (sLine in oLabels2) {
							throw new CodeGeneratorJs.ErrorObject("Duplicate line number", sLine, oNode.pos);
						}
						if (iLine <= iLastLine) {
							throw new CodeGeneratorJs.ErrorObject("Line number not increasing", sLine, oNode.pos);
						}
						if (iLine < 1 || iLine > 65535) {
							throw new CodeGeneratorJs.ErrorObject("Line number overflow", sLine, oNode.pos);
						}
						iLastLine = iLine;
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

				/*
				if (Utils.debug > 1) {
					Utils.console.debug("evaluate: line number reference counts:");
					for (sNode in oLabels) {
						if (oLabels[sNode]) {
							Utils.console.debug("evaluate: line", sNode, "count", oLabels[sNode]);
						}
					}
				}
				*/

				// optional: comment lines which are not referenced
				if (!that.bMergeFound) {
					sOutput = fnCommentUnusedCases(sOutput, that.oLabels);
				}
				return sOutput;
			};

		// create labels map
		fnCreateLabelsMap(this.oLabels);

		return fnEvaluate();
	},

	generate: function (input, variables) {
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
			aTokens = this.lexer.lex(input);
			aParseTree = this.parser.parse(aTokens);
			sOutput = this.evaluate(aParseTree, variables);
			oOut.text = "var v=o.v;\n";
			oOut.text += "while (o.vmLoopCondition()) {\nswitch (o.iLine) {\ncase 0:\n"
				+ fnCombineData(this.aData)
				+ " o.goto(o.iStartLine ? o.iStartLine : \"start\"); break;\ncase \"start\":\n"
				+ sOutput
				+ "\ncase \"end\": o.vmStop(\"end\", 90); break;\ndefault: o.error(8); o.goto(\"end\"); break;\n}}\n";
		} catch (e) {
			oOut.error = e;
		}
		return oOut;
	}
};


CodeGeneratorJs.ErrorObject = function (message, value, pos) {
	this.message = message;
	this.value = value;
	this.pos = pos;
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = CodeGeneratorJs;
}
