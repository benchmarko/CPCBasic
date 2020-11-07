// CodeGeneratorBasic.js - Code Generator for BASIC (for testing, pretty print?)
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
//

"use strict";

var Utils, BasicParser; // BasicParser just for keyword definitions

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
	BasicParser = require("./BasicParser.js"); // eslint-disable-line global-require
}

function CodeGeneratorBasic(options) {
	this.init(options);
}

CodeGeneratorBasic.mCombinedKeywords = {
	chainMerge: "CHAIN MERGE",
	clearInput: "CLEAR INPUT",
	graphicsPaper: "GRAPHICS PAPER",
	graphicsPen: "GRAPHICS PEN",
	keyDef: "KEY DEF",
	lineInput: "LINE INPUT",
	mid$Assign: "MID$",
	onBreakCont: "ON BREAK CONT",
	onBreakGosub: "ON BREAK GOSUB",
	onBreakStop: "ON BREAK STOP",
	onErrorGoto: "ON ERROR GOTO",
	resumeNext: "RESUME NEXT",
	speedInk: "SPEED INK",
	speedKey: "SPEED KEY",
	speedWrite: "SPEED WRITE",
	symbolAfter: "SYMBOL AFTER",
	windowSwap: "WINDOW SWAP"
};

CodeGeneratorBasic.prototype = {
	init: function (options) {
		this.options = options || {}; // e.g. tron, rsx

		this.lexer = this.options.lexer;
		this.parser = this.options.parser;

		this.reset();
	},

	reset: function () {
		this.lexer.reset();
		this.parser.reset();
		return this;
	},

	composeError: function () { // varargs
		var aArgs = Array.prototype.slice.call(arguments);

		aArgs.unshift("CodeGeneratorBasic");
		aArgs.push(this.iLine);
		return Utils.composeError.apply(null, aArgs);
	},

	//
	// evaluate
	//
	evaluate: function (parseTree) {
		var that = this,

			fnParseOneArg = function (oArg) {
				var sValue = parseNode(oArg); // eslint-disable-line no-use-before-define

				return sValue;
			},

			fnParseArgs = function (aArgs) {
				var aNodeArgs = [], // do not modify node.args here (could be a parameter of defined function)
					sValue, i;

				for (i = 0; i < aArgs.length; i += 1) {
					sValue = fnParseOneArg(aArgs[i]);
					if (!(i === 0 && sValue === "#" && aArgs[i].type === "#")) { // ignore empty stream as first argument (hmm, not for e.g. data!)
						aNodeArgs.push(sValue);
					}
				}
				return aNodeArgs;
			},

			mOperators = {
				"+": "+",
				"-": "-",
				"*": "*",
				"/": "/",
				"\\": "\\",
				"^": "^",
				and: " AND ",
				or: " OR ",
				xor: " XOR ",
				not: "NOT ",
				mod: " MOD ",
				">": ">",
				"<": "<",
				">=": ">=",
				"<=": "<=",
				"=": "=",
				"<>": "<>",
				"@": "@",
				"#": "#"
			},

			mOperatorPrecedence = {
				"@": 95, // prefix
				"^": 90,

				"p-": 80, // prefix - (fast hack)
				"p+": 80, // prefix + (fast hack)

				"*": 70,
				"/": 70,
				"\\": 60,

				mod: 50,

				"+": 40,
				"-": 40,

				"=": 30,
				"<>": 30,
				"<": 30,
				"<=": 30,
				">": 30,
				">=": 30,

				not: 23, // prefix
				and: 22,
				or: 21,
				xor: 20,
				"#": 10 // priority?
			},

			fnDecodeEscapeSequence = function (str) {
				return str.replace(/\\x([0-9A-Fa-f]{2})/g, function () {
					return String.fromCharCode(parseInt(arguments[1], 16));
				});
			},


			mParseFunctions = {
				string: function (node) {
					var sValue = fnDecodeEscapeSequence(node.value);

					sValue = sValue.replace(/\\\\/g, "\\"); // unescape backslashes
					return '"' + sValue + '"';
				},
				"null": function () { // means: no parameter specified
					return "";
				},
				assign: function (node) {
					// see also "let"
					var sValue;

					if (node.left.type !== "identifier") {
						throw that.composeError(Error(), "Unexpected assing type", node.type, node.pos); // should not occur
					}
					sValue = fnParseOneArg(node.left) + node.value + fnParseOneArg(node.right);
					return sValue;
				},
				number: function (node) {
					return String(node.value).toUpperCase(); // maybe "e" inside
				},
				binnumber: function (node) {
					return String(node.value).toUpperCase(); // maybe "&x"
				},
				hexnumber: function (node) {
					return String(node.value).toUpperCase();
				},
				identifier: function (node) { // identifier or identifier with array
					var sValue, aNodeArgs, sBracketOpen, sBracketClose;

					sValue = node.value; // keep case, maybe mixed
					if (node.args) { // args including brackets
						aNodeArgs = fnParseArgs(node.args);
						sBracketOpen = aNodeArgs.shift();
						sBracketClose = aNodeArgs.pop();
						sValue += sBracketOpen + aNodeArgs.join(",") + sBracketClose;
					}

					return sValue;
				},
				linenumber: function (node) {
					return node.value;
				},
				label: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sValue;

					sValue = aNodeArgs.join(":");

					if (node.value !== "direct") {
						sValue = node.value + " " + sValue;
					}
					return sValue;
				},

				// special keyword functions
				"|": function (node) { // rsx
					var aNodeArgs = fnParseArgs(node.args),
						sValue;

					sValue = node.value.toUpperCase(); // use value!

					if (aNodeArgs.length) {
						sValue += "," + aNodeArgs.join(",");
					}
					return sValue;
				},
				afterGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sValue;

					sValue = "AFTER " + aNodeArgs[0];
					if (aNodeArgs[1]) {
						sValue += "," + aNodeArgs[1];
					}
					sValue += " GOSUB " + aNodeArgs[2];
					return sValue;
				},
				chainMerge: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sTypeUc = CodeGeneratorBasic.mCombinedKeywords[node.type] || node.type.toUpperCase(),
						sValue;

					if (aNodeArgs.length === 3) {
						aNodeArgs[2] = "DELETE " + aNodeArgs[2];
					}

					sValue = sTypeUc + " " + aNodeArgs.join(",");
					return sValue;
				},
				data: function (node) {
					var aNodeArgs = [],
						regExp = new RegExp(",|^ +| +$"),
						i, sValue, sName;

					for (i = 0; i < node.args.length; i += 1) {
						sValue = fnParseOneArg(node.args[i]);

						if (sValue) {
							sValue = sValue.substr(1, sValue.length - 2); // remove surrounding quotes
							sValue = sValue.replace(/\\"/g, "\""); // unescape "

							if (sValue) {
								if (regExp.test(sValue)) {
									sValue = '"' + sValue + '"';
								}
							}
						}
						aNodeArgs.push(sValue);
					}

					sName = node.type.toUpperCase();
					sValue = aNodeArgs.join(",");
					if (sValue !== "") { // argument?
						sName += " ";
					}

					sValue = sName + sValue;
					return sValue;
				},
				def: function (node) {
					var sName = fnParseOneArg(node.left),
						sSpace = node.left.bSpace ? " " : "", // fast hack
						aNodeArgs = fnParseArgs(node.args),
						sNodeArgs = aNodeArgs.join(","),
						sExpression = fnParseOneArg(node.right),
						sValue;

					if (sNodeArgs !== "") { // not empty?
						sNodeArgs = "(" + sNodeArgs + ")";
					}

					sName = sName.substr(0, 2).toUpperCase() + sSpace + sName.substr(2);

					sValue = node.type.toUpperCase() + " " + sName + sNodeArgs + "=" + sExpression;
					return sValue;
				},
				"else": function (node) { // similar to a comment, with unchecked tokens
					var aArgs = node.args,
						sValue = "",
						oToken, i;

					for (i = 0; i < aArgs.length; i += 1) {
						oToken = aArgs[i];
						if (oToken.value) {
							sValue += " " + oToken.value;
						}
					}
					// TODO: whitespaces?
					sValue = node.type.toUpperCase() + sValue;
					return sValue;
				},
				ent: function (node) {
					var aArgs = node.args,
						aNodeArgs = [],
						bEqual = false,
						sArg, i, sValue;

					for (i = 0; i < aArgs.length; i += 1) {
						if (aArgs[i].type !== "null") {
							sArg = fnParseOneArg(aArgs[i]);
							if (bEqual) {
								sArg = "=" + sArg;
								bEqual = false;
							}
							aNodeArgs.push(sArg);
						} else {
							bEqual = true;
						}
					}
					sValue = node.type.toUpperCase() + " " + aNodeArgs.join(",");
					return sValue;
				},
				env: function (node) {
					return this.ent(node);
				},
				everyGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sValue;

					sValue = "EVERY " + aNodeArgs[0];
					if (aNodeArgs[1]) {
						sValue += "," + aNodeArgs[1];
					}
					sValue += " GOSUB " + aNodeArgs[2];
					return sValue;
				},
				fn: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sNodeArgs = aNodeArgs.join(","),
						sName = fnParseOneArg(node.left),
						sSpace = node.left.bSpace ? " " : "", // fast hack
						sValue;

					if (sNodeArgs !== "") { // not empty?
						sNodeArgs = "(" + sNodeArgs + ")";
					}

					sName = sName.substr(0, 2).toUpperCase() + sSpace + sName.substr(2);

					sValue = sName + sNodeArgs;
					return sValue;
				},
				"for": function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sVarName, startValue, endValue, stepValue, sValue;

					sVarName = aNodeArgs[0];
					startValue = aNodeArgs[1];
					endValue = aNodeArgs[2];
					stepValue = aNodeArgs[3];

					sValue = node.type.toUpperCase() + " " + sVarName + "=" + startValue + " TO " + endValue;
					if (stepValue !== "") { // "null" is ""
						sValue += " STEP " + stepValue;
					}
					return sValue;
				},
				"if": function (node) {
					var sValue, oNodeBranch, aNodeArgs;

					sValue = node.type.toUpperCase() + " " + fnParseOneArg(node.left) + " THEN ";

					oNodeBranch = node.right;
					aNodeArgs = fnParseArgs(oNodeBranch); // args for "then"
					if (oNodeBranch.length && oNodeBranch[0].type === "goto" && oNodeBranch[0].len === 0) { // inserted goto?
						aNodeArgs[0] = fnParseOneArg(oNodeBranch[0].args[0]); // take just line number
					}
					sValue += aNodeArgs.join(":");

					if (node.third) {
						sValue += " ELSE ";
						oNodeBranch = node.third;
						aNodeArgs = fnParseArgs(oNodeBranch); // args for "else"
						if (oNodeBranch.length && oNodeBranch[0].type === "goto" && oNodeBranch[0].len === 0) { // inserted goto?
							aNodeArgs[0] = fnParseOneArg(oNodeBranch[0].args[0]); // take just line number
						}
						sValue += aNodeArgs.join(":");
					}
					return sValue;
				},
				input: function (node) { // input or line input
					var aNodeArgs = fnParseArgs(node.args),
						sTypeUc = CodeGeneratorBasic.mCombinedKeywords[node.type] || node.type.toUpperCase(),
						i = 0,
						bHasStream, sValue;

					sValue = sTypeUc;
					bHasStream = aNodeArgs.length && (String(aNodeArgs[0]).charAt(0) === "#");
					if (bHasStream) { // stream?
						i += 1;
					}

					if (aNodeArgs.length && !bHasStream && String(aNodeArgs[0]).charAt(0) !== '"') {
						// TODO: empty CRLF marker
						sValue += " ";
					}

					aNodeArgs.splice(i, 4, aNodeArgs[i] + aNodeArgs[i + 1] + aNodeArgs[i + 2] + aNodeArgs[i + 3]); // combine 4 elements into one
					sValue += aNodeArgs.join(",");
					return sValue;
				},
				lineInput: function (node) {
					return this.input(node);
				},
				list: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sValue, sName;

					if (aNodeArgs.length && aNodeArgs[0] === "") { // empty range?
						aNodeArgs.shift(); // remove
					}

					if (aNodeArgs.length && aNodeArgs[aNodeArgs.length - 1] === "#") { // dummy stream?
						aNodeArgs.pop(); // remove
					}
					sValue = aNodeArgs.join(",");

					sName = node.type.toUpperCase();
					if (sValue !== "") { // argument?
						sName += " ";
					}

					sValue = sName + sValue;
					return sValue;
				},
				mid$Assign: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sTypeUc = CodeGeneratorBasic.mCombinedKeywords[node.type],
						sValue;

					sValue = sTypeUc + "(" + aNodeArgs.join(",") + ")=" + fnParseOneArg(node.right);
					return sValue;
				},
				onGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sValue;

					sValue = aNodeArgs.shift();
					sValue = "ON " + sValue + " GOSUB " + aNodeArgs.join(",");
					return sValue;
				},
				onGoto: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sValue;

					sValue = aNodeArgs.shift();
					sValue = "ON " + sValue + " GOTO " + aNodeArgs.join(",");
					return sValue;
				},
				onSqGosub: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sValue;

					sValue = "ON SQ(" + aNodeArgs[0] + ") GOSUB " + aNodeArgs[1];
					return sValue;
				},
				print: function (node) {
					var regExp = new RegExp("[a-zA-Z0-9.]"),
						aNodeArgs = fnParseArgs(node.args),
						bHasStream, sValue, i, sArg;

					sValue = node.value.toUpperCase(); // we use value to get PRINT or ?
					bHasStream = aNodeArgs.length && (String(aNodeArgs[0]).charAt(0) === "#");

					if (sValue === "PRINT" && aNodeArgs.length && !bHasStream) { // PRINT with args and not stream?
						sValue += " ";
					}
					if (bHasStream && aNodeArgs.length > 1) { // more args after stream?
						aNodeArgs[0] = String(aNodeArgs[0]) + ",";
					}

					for (i = 0; i < aNodeArgs.length; i += 1) {
						sArg = String(aNodeArgs[i]);
						if (regExp.test(sValue.charAt(sValue.length - 1)) && regExp.test(sArg.charAt(0))) { // last character and first character of next arg: char, number, dot? (not for token "FN"??)
							sValue += " "; // additional space
						}
						sValue += aNodeArgs[i];
					}
					return sValue;
				},
				rem: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sValue = aNodeArgs[0],
						sName;

					if (sValue !== undefined) {
						sValue = sValue.substr(1, sValue.length - 2); // remove surrounding quotes
					} else {
						sValue = "";
					}
					sName = node.value;
					if (sName !== "'") { // not simple rem?
						sName = sName.toUpperCase();
						if (sValue !== "") { // argument?
							sName += " ";
						}
					}
					sValue = sName + sValue;
					return sValue;
				},
				using: function (node) {
					var aNodeArgs = fnParseArgs(node.args),
						sTemplate, sValue;

					sTemplate = aNodeArgs.shift();
					if (sTemplate.charAt(0) !== '"') { // not a string => space required
						sTemplate = " " + sTemplate;
					}
					sValue = node.type.toUpperCase() + sTemplate + ";" + aNodeArgs.join(","); // separator between args could be "," or ";", we use ","
					return sValue;
				}
			},

			fnParseOther = function (node) {
				var sType = node.type,
					sArgs = "",
					sTypeUc = CodeGeneratorBasic.mCombinedKeywords[sType] || sType.toUpperCase(),
					sKeyType = BasicParser.mKeywords[sType],
					sValue;

				if (node.left) {
					sArgs += fnParseOneArg(node.left);
				}

				if (!sKeyType) {
					if (node.value) { // e.g. string,...
						sArgs += node.value;
					}
				}

				if (node.right) {
					sArgs += fnParseOneArg(node.right);
				}
				if (node.third) {
					sArgs += fnParseOneArg(node.third);
				}
				if (node.args) {
					sArgs += fnParseArgs(node.args).join(",");
				}

				if (sKeyType) {
					sValue = sTypeUc;
					if (sArgs.length) {
						if (sKeyType.charAt(0) === "f") { // function with parameters?
							sValue += "(" + sArgs + ")";
						} else {
							if (sArgs.charAt(0) !== "#") { // only if not a stream
								sValue += " ";
							}
							sValue += sArgs;
						}
					}
				} else {
					sValue = sArgs; // for e.g. string
				}
				return sValue;
			},

			parseNode = function (node) { // eslint-disable-line complexity
				var sType = node.type,
					mPrecedence = mOperatorPrecedence,
					value, value2, p, pl, pr;

				if (Utils.debug > 3) {
					Utils.console.debug("evaluate: parseNode node=%o type=" + node.type + " value=" + node.value + " left=%o right=%o args=%o", node, node.left, node.right, node.args);
				}

				if (mOperators[sType]) {
					if (node.left) {
						value = parseNode(node.left);
						if (mOperators[node.left.type] && (node.left.left || node.left.right)) { // binary operator (or unary operator, e.g. not)
							p = mPrecedence[node.type];
							if (node.left.left) { // left is binary
								pl = mPrecedence[node.left.type] || 0;
							} else { // left is unary
								pl = mPrecedence["p" + node.left.type] || mPrecedence[node.left.type] || 0;
							}

							if (pl < p) {
								value = "(" + value + ")";
							}
						}

						value2 = parseNode(node.right);
						if (mOperators[node.right.type] && (node.right.left || node.right.right)) { // binary operator (or unary operator, e.g. not)
							p = mPrecedence[node.type];
							if (node.right.left) { // right is binary
								pr = mPrecedence[node.right.type] || 0;
							} else {
								pr = mPrecedence["p" + node.right.type] || mPrecedence[node.right.type] || 0;
							}

							if ((pr < p) || ((pr === p) && node.type === "-")) { // "-" is special
								value2 = "(" + value2 + ")";
							}
						}
						value = value + mOperators[sType].toUpperCase() + value2;
					} else { // unary operator
						value = parseNode(node.right);
						p = mPrecedence["p" + node.type] || mPrecedence[node.type] || 0; // check unary operator first
						if (node.right.left) { // was binary op?
							pr = mPrecedence[node.right.type] || 0; // no special prio
						} else {
							pr = mPrecedence["p" + node.right.type] || mPrecedence[node.right.type] || 0; // check unary operator first
						}
						if (p && pr && (pr < p)) {
							value = "(" + value + ")";
						}
						value = mOperators[sType].toUpperCase() + value;
					}
				} else if (mParseFunctions[sType]) { // function with special handling?
					value = mParseFunctions[sType](node);
				} else { // for other functions, generate code directly
					value = fnParseOther(node);
				}

				return value;
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
				return sOutput;
			};

		return fnEvaluate();
	},

	generate: function (sInput, oVariables, bAllowDirect) {
		var oOut = {
				text: ""
			},
			aTokens, aParseTree, sOutput;

		try {
			aTokens = this.lexer.lex(sInput);
			aParseTree = this.parser.parse(aTokens, bAllowDirect);
			sOutput = this.evaluate(aParseTree, oVariables);
			oOut.text = sOutput;
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
	module.exports = CodeGeneratorBasic;
}
