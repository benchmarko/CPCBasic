// BasicParser.js - BASIC Parser
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
// BASIC parser for Locomotive BASIC 1.1 for Amstrad CPC 6128
//

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

// [ https://www.codeproject.com/Articles/345888/How-to-write-a-simple-interpreter-in-JavaScript ; test online: http://jsfiddle.net/h3xwj/embedded/result/ ]
//
// http://crockford.com/javascript/tdop/tdop.html
// Top Down Operator Precedence
// http://crockford.com/javascript/tdop/parse.js
// http://crockford.com/javascript/tdop/index.html
//
// http://stevehanov.ca/blog/?id=92
// http://stevehanov.ca/qb.js/qbasic.js
//
// http://www.csidata.com/custserv/onlinehelp/vbsdocs/vbs232.htm  (operator precedence) ?
// How to write a simple interpreter in JavaScript
// Peter_Olson, 30 Oct 2014
function BasicParser(options) {
	this.init(options);
}

// first letter: c=command, f=function, o=operator, x=additional keyword for command
// following are arguments: n=number, s=string, a=any, n0?=optional papameter with default null, #0?=optional stream with default 0; suffix ?=optional (optionals must be last); last *=any number of arguments may follow
BasicParser.mKeywords = {
	abs: "f n",
	after: "c n n?",
	and: "o",
	asc: "f s",
	atn: "f n",
	auto: "c",
	bin$: "f n n?",
	border: "c n n?",
	"break": "x",
	call: "c n *",
	cat: "c",
	chain: "c s n?", // chain, chain merge
	chr$: "f n",
	cint: "f n",
	clear: "c", // clear, clear input
	clg: "c n?",
	closein: "c",
	closeout: "c",
	cls: "c n?",
	cont: "c",
	copychr$: "f n?",
	cos: "f n",
	creal: "f n",
	cursor: "c n? n?",
	data: "c",
	dec$: "f n s",
	def: "c s *", // not checked
	defint: "c v *",
	defreal: "c v *",
	defstr: "c v *",
	deg: "c",
	"delete": "c",
	derr: "f",
	di: "c",
	dim: "c v *",
	draw: "c n n n0? n?",
	drawr: "c n n n0? n?",
	edit: "c n",
	ei: "c",
	"else": "x",
	end: "c",
	ent: "c n *",
	env: "c n *",
	eof: "f",
	erase: "c v *",
	erl: "f",
	err: "f",
	error: "c n",
	every: "c n n?",
	exp: "f n",
	fill: "c n",
	fix: "f n",
	fn: "f", // can also be separate
	"for": "c",
	frame: "c",
	fre: "f a",
	gosub: "c n",
	"goto": "c n",
	graphics: "c", // graphics paper, graphics pen
	graphicsPaper: "x n", // special
	graphicsPen: "x n n?", // special
	hex$: "f n n?",
	himem: "f",
	"if": "c",
	ink: "c n n n?",
	inkey: "f n",
	inkey$: "f",
	inp: "f n",
	input: "c #0? *", // not checked
	instr: "f a a a?", // cannot check "f n? s s"
	"int": "f n",
	joy: "f n",
	key: "c n s", // key, key def
	left$: "f s n",
	len: "f s",
	let: "c",
	line: "c", // line input (not checked)
	list: "c",
	load: "c s n?",
	locate: "c #0? n n",
	log: "f n",
	log10: "f n",
	lower$: "f s",
	mask: "c n? n?",
	max: "f n *",
	memory: "c n",
	merge: "c s",
	mid$: "f s n n?",
	mid$Assign: "c s n n?", // mid$ as assign, not really a command because it has parenthesis
	min: "f n *",
	mod: "o",
	mode: "c n",
	move: "c n n n0? n?",
	mover: "c n n n0? n?",
	"new": "c",
	next: "c *", // v*
	not: "o",
	on: "c", // on break cont, on break gosub, on break stop, on error goto, on <ex> gosub, on <ex> goto, on sq(n) gosub
	openin: "c s",
	openout: "c s",
	or: "o",
	origin: "c n n n? n? n? n?",
	out: "c n n",
	paper: "c #0? n",
	peek: "f n",
	pen: "c #0? n0 n?",
	pi: "f",
	plot: "c n n n0? n?",
	plotr: "c n n n0? n?",
	poke: "c n n",
	pos: "f n",
	print: "c #0? *", // print also with spc(), tab(), using
	rad: "c",
	randomize: "c n?",
	read: "c v *",
	release: "c n",
	rem: "c",
	remain: "f n",
	renum: "c n? n? n?",
	restore: "c n?",
	resume: "c n?", // resume, resume next
	"return": "c",
	right$: "f s n",
	rnd: "f n?",
	round: "f n n?",
	run: "c a?", // cannot check "c s | n?"
	save: "c s a n? n? n?",
	sgn: "f n",
	sin: "f n",
	sound: "c n n n? n0? n0? n0? n?",
	space$: "f n",
	spc: "x", // print spc
	speed: "c", // speed ink, speed key, speed write
	sq: "f n",
	sqr: "f n",
	step: "x", // for ... to ... step
	stop: "c",
	str$: "f n",
	string$: "f n s",
	swap: "x", // window swap
	symbol: "c n n *", // symbol, symbol after
	tab: "x", // print tab
	tag: "c n?",
	tagoff: "c n?",
	tan: "f n",
	test: "f n n",
	testr: "f n n",
	then: "x", // if...then
	time: "f",
	to: "x", // for...to
	troff: "c",
	tron: "c",
	unt: "f n",
	upper$: "f s",
	using: "x", // print using
	val: "f s",
	vpos: "f n",
	wait: "c n n n?",
	wend: "c",
	"while": "c",
	width: "c n",
	window: "c #0? n n n n", // window, window swap
	write: "c #0? *", // not checked
	xor: "o",
	xpos: "f",
	ypos: "f",
	zone: "c n"
};

BasicParser.prototype = {
	init: function (options) {
		this.options = options || {}; // e.g. tron

		//this.lexer = this.options.lexer; //TTT TODO
		this.reset();
	},

	reset: function () {
	},

	// http://crockford.com/javascript/tdop/tdop.html (old: http://javascript.crockford.com/tdop/tdop.html)
	// http://crockford.com/javascript/tdop/parse.js
	// Operator precedence parsing
	//
	// Operator: With left binding power (lbp) and operational function.
	// Manipulates tokens to its left (e.g: +)? => left denotative function led(), otherwise null denotative function nud()), (e.g. unary -)
	// identifiers, numbers: also nud.
	parse: function (aTokens) {
		var oSymbols = {},
			iIndex = 0,
			aParseTree = [],
			oPreviousToken, oToken,

			symbol = function (id, nud, lbp, led) {
				var oSymbol = oSymbols[id];

				if (!oSymbol) {
					oSymbols[id] = {};
					oSymbol = oSymbols[id];
				}
				if (nud) {
					oSymbol.nud = nud;
				}
				if (lbp) {
					oSymbol.lbp = lbp;
				}
				if (led) {
					oSymbol.led = led;
				}
				return oSymbol;
			},

			advance = function (id) {
				var oLexToken, sType, oSym;

				oPreviousToken = oToken;
				if (id && oToken.type !== id) {
					throw new BasicParser.ErrorObject("Expected", id, oToken.pos);
				}
				if (iIndex >= aTokens.length) {
					oToken = oSymbols["(end)"];
					return oToken;
				}
				oLexToken = aTokens[iIndex];
				iIndex += 1;
				sType = oLexToken.type;
				if (sType === "identifier" && BasicParser.mKeywords[oLexToken.value.toLowerCase()]) {
					sType = oLexToken.value.toLowerCase(); // modify type identifier => keyword xy
					//oLexToken.type = sType; //TTT currently we need to change it also here because we use aTokens at other places
				}
				oSym = oSymbols[sType];

				if (!oSym) {
					Utils.console.error("parse: Undefined object: type=" + sType + " t=%o", oLexToken);
					oSym = {}; // just to continue
				}
				oToken = Object.create(oSym);
				oToken.type = sType;
				oToken.value = oLexToken.value;
				oToken.pos = oLexToken.pos;
				return oToken;
			},

			expression = function (rbp) {
				var left,
					t = oToken;

				if (Utils.debug > 3) {
					Utils.console.debug("parse: expression rbp=" + rbp + " type=" + t.type + " t=%o", t);
				}
				advance();
				if (!t.nud) {
					if (t.type === "(end)") {
						throw new BasicParser.ErrorObject("Unexpected end of file", "", t.pos);
					} else {
						throw new BasicParser.ErrorObject("Unexpected token", t.type, t.pos);
					}
				}
				left = t.nud(t); // process literals, variables, and prefix operators
				while (rbp < oToken.lbp) { // as long as the right binding power is less than the left binding power of the next token...
					t = oToken;
					advance();
					if (!t.led) {
						throw new BasicParser.ErrorObject("Unexpected token", t.type, t.pos); //TTT how to get this error?
					}
					left = t.led(left); // ...the led method is invoked on the following token (infix and suffix operators), can be recursive
				}
				return left;
			},

			assignment = function () { // similar to let
				var oValue = {
					type: "assign",
					pos: oToken.pos
				};

				if (oToken.type !== "identifier") {
					throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos);
				}
				oValue.left = expression(90); // take it (can also be an array) and stop
				advance("="); // equal as assignment
				oValue.right = expression(0);
				return oValue;
			},

			statement = function () {
				var t = oToken,
					v;

				if (t.std) { // statement?
					advance();
					return t.std();
				}

				if (t.type === "identifier") {
					v = assignment();
				} else {
					v = expression(0);
				}
				if (v.type !== "assign" && v.type !== "fcall" && v.type !== "def" && v.type !== "(" && v.type !== "[") {
					throw new BasicParser.ErrorObject("Bad expression statement", t.value, t.pos);
				}
				return v;
			},

			statements = function (sStopType) {
				var aStatements = [],
					oStatement;

				while (oToken.type !== "(end)" && oToken.type !== "(eol)") {
					if (sStopType && oToken.type === sStopType) {
						break;
					}
					if (oToken.type === ":") {
						advance();
					} else {
						oStatement = statement();
						aStatements.push(oStatement);
					}
				}
				return aStatements;
			},

			line = function () {
				var oValue = {
					type: "label",
					value: oToken.value,
					pos: oToken.pos,
					left: null
				};

				advance("number");
				oValue.left = statements();
				if (oToken.type === "(eol)") {
					advance("(eol)");
				}
				return oValue;
			},

			infix = function (id, lbp, rbp, led) {
				rbp = rbp || lbp;
				symbol(id, null, lbp, led || function (left) {
					return {
						type: id,
						left: left,
						right: expression(rbp)
					};
				});
			},
			infixr = function (id, lbp, rbp, led) {
				rbp = rbp || lbp;
				symbol(id, null, lbp, led || function (left) {
					return {
						type: id,
						left: left,
						right: expression(rbp - 1)
					};
				});
			},
			prefix = function (id, rbp) {
				symbol(id, function () {
					return {
						pos: oPreviousToken.pos,
						type: id,
						right: expression(rbp)
					};
				});
			},
			stmt = function (s, f) {
				var x = symbol(s);

				x.std = f;
				return x;
			},

			fnGetOptionalStream = function () {
				var oValue;

				if (oToken.type === "#") { // stream?
					advance("#");
					oValue = expression(0);
					if (oToken.type === ",") {
						advance(",");
					}
				} else {
					oValue = {
						type: "number",
						value: 0,
						bInserted: true // inserted value
					};
				}
				return oValue;
			},

			fnCheckRemainingTypes = function (aTypes) {
				var sType;

				if (aTypes && aTypes.length) { // some more parameters expected?
					do {
						sType = aTypes.shift();
					} while (sType && (sType === "*" || Utils.stringEndsWith(sType, "?")));
					if (sType && !Utils.stringEndsWith(sType, "?")) {
						throw new BasicParser.ErrorObject("Expected parameter " + sType + " for arguments after", oPreviousToken.value, oToken.pos);
					}
				}
			},

			fnGetArgs = function (aTypes) {
				var aArgs = [],
					sSeparator = ",",
					bNeedMore = false,
					sType = "ok",
					oExpression;

				while (bNeedMore || (sType && oToken.type !== ":" && oToken.type !== "(eol)" && oToken.type !== "(end)" && oToken.type !== "else" && oToken.type !== "rem" && oToken.type !== "'")) {
					if (aTypes && sType !== "*") { // "*"= any number of parameters
						sType = aTypes.shift();
						if (!sType) {
							throw new BasicParser.ErrorObject("Expected end of arguments", oPreviousToken.type, oPreviousToken.pos);
						}
					}
					if (sType === "#0?") { // optional stream?
						if (oToken.type === "#") { // stream?
							advance("#");
							oExpression = expression(0);
							if (oToken.type === ",") {
								advance(",");
								bNeedMore = true;
							}
						} else { // insert default stream number 0
							oExpression = {
								type: "number",
								value: 0
							};
						}
					} else {
						if (oToken.type === sSeparator && sType.substr(0, 2) === "n0") { // n0 or n0?: if parameter not specified, insert default value null?
							oExpression = {
								type: "null",
								value: null
							};
						} else {
							oExpression = expression(0);
						}
						if (oToken.type === sSeparator) {
							advance(sSeparator);
							bNeedMore = true;
						} else {
							bNeedMore = false;
							sType = ""; // stop
						}
					}
					aArgs.push(oExpression);
				}
				if (aTypes && aTypes.length) { // some more parameters expected?
					fnCheckRemainingTypes(aTypes);
				}
				return aArgs;
			},

			fnGetArgsSepByCommaSemi = function () {
				var aArgs = [];

				while (oToken.type !== ":" && oToken.type !== "(eol)" && oToken.type !== "(end)" && oToken.type !== "else" && oToken.type !== "rem" && oToken.type !== "'") {
					aArgs.push(expression(0));
					if (oToken.type === "," || oToken.type === ";") {
						advance();
					} else {
						break;
					}
				}
				return aArgs;
			},

			fnGetArgsInParenthesisOrBrackets = function (aTypes) {
				var aArgs = [],
					sType = "ok",
					sOpen, sClose, oExpression;

				sOpen = oToken.type;
				if (sOpen === "(") {
					sClose = ")";
				} else if (sOpen === "[") {
					sClose = "]";
				} else {
					throw new BasicParser.ErrorObject("Expected parenthesis or brackets", oPreviousToken.value, oToken.pos);
				}

				if (oToken.type === sClose) {
					advance();
				} else {
					do {
						if (aTypes && sType !== "*") { // "*"= any number of parameters
							sType = aTypes.shift();
							if (!sType) {
								throw new BasicParser.ErrorObject("Expected end of argument list after", oPreviousToken.value, oPreviousToken.pos);
							}
						}
						advance();
						oExpression = expression(0);
						aArgs.push(oExpression);
					} while (oToken.type === "," && sType);

					if (oToken.type !== sClose) {
						throw new BasicParser.ErrorObject("Expected closing parenthesis for argument list after", oPreviousToken.value, oToken.pos);
					}
				}
				if (aTypes && aTypes.length) { // some more parameters expected?
					if (aTypes && aTypes.length) { // some more parameters expected?
						fnCheckRemainingTypes(aTypes);
					}
				}
				advance(sClose);
				return aArgs;
			},

			fnCreateCmdCall = function (sName) {
				var oValue = {
						type: "fcall",
						args: null,
						name: sName || oPreviousToken.type,
						pos: oPreviousToken.pos
					},
					aTypes = null,
					sKeyOpts;

				sKeyOpts = BasicParser.mKeywords[oValue.name];
				if (sKeyOpts && sKeyOpts.length > 1) {
					aTypes = sKeyOpts.substr(2).split(" ");
				}
				oValue.args = fnGetArgs(aTypes);
				return oValue;
			},

			fnCreateFuncCall = function (sName) {
				var oValue = {
						type: "fcall",
						args: null,
						name: sName || oPreviousToken.type,
						pos: oPreviousToken.pos
					},
					aTypes = null,
					sKeyOpts;

				sKeyOpts = BasicParser.mKeywords[oValue.name];
				if (sKeyOpts && sKeyOpts.length > 1) {
					aTypes = sKeyOpts.substr(2).split(" ");
				}

				oValue.args = (oToken.type === "(") ? fnGetArgsInParenthesisOrBrackets(aTypes) : [];
				return oValue;
			},
			fnGenerateKeywordSymbols = function () {
				var sKey, sValue,
					fnFunc = function () {
						return fnCreateFuncCall();
					},
					fnCmd = function () {
						return fnCreateCmdCall();
					};

				for (sKey in BasicParser.mKeywords) {
					if (BasicParser.mKeywords.hasOwnProperty(sKey)) {
						sValue = BasicParser.mKeywords[sKey];
						if (sValue.charAt(0) === "f") {
							symbol(sKey, fnFunc);
						} else if (sValue.charAt(0) === "c") {
							stmt(sKey, fnCmd);
						}
					}
				}
			};

		fnGenerateKeywordSymbols();

		symbol(":");
		symbol(";");
		symbol(",");
		symbol(")");
		symbol("]");

		// define additional statement parts
		symbol("break");
		symbol("else");
		symbol("spc");
		symbol("step");
		symbol("swap");
		symbol("then");
		symbol("tab");
		symbol("to");
		symbol("using");

		symbol("(eol)");
		symbol("(end)");

		symbol("number", function (number) {
			return number;
		});

		symbol("binnumber", function (number) {
			return number;
		});

		symbol("hexnumber", function (number) {
			return number;
		});

		symbol("string", function (s) {
			return s;
		});
		symbol("identifier", function (oName) {
			var //iParseIndex = iIndex,
				sName = oName.value,
				oValue;

			if (Utils.stringStartsWith(sName.toLowerCase(), "fn")) {
				if (oToken.type !== "(") { // Fnxxx name without ()?
					oValue = {
						type: "fcall",
						name: "fn",
						args: [],
						left: sName,
						pos: oToken.pos
					};
					return oValue;
				}
			}

			if (oToken.type === "(" || oToken.type === "[") {
				oValue = {
					type: "array",
					args: null,
					name: sName,
					pos: oToken.pos
				};
				oValue.args = fnGetArgsInParenthesisOrBrackets();

				if (Utils.stringStartsWith(sName.toLowerCase(), "fn")) {
					oValue.type = "fcall";
					oValue.left = oValue.name;
					oValue.name = "fn"; // FNxxx in e.g. print
				}
			} else {
				oValue = oName;
			}
			return oValue;
		});

		symbol("(", function () {
			var //iParseIndex = iIndex,
				value = expression(0);

			if (oToken.type !== ")") {
				throw new BasicParser.ErrorObject("Expected closing parenthesis", ")", oPreviousToken.pos);
			}
			advance();
			return value;
		});

		symbol("[", function () {
			var //iParseIndex = iIndex, //aTokens[iParseIndex].pos
				value = expression(0);

			if (oToken.type !== "]") {
				throw new BasicParser.ErrorObject("Expected closing brackets", "]", oPreviousToken.pos);
			}
			advance();
			return value;
		});

		infix("^", 90, 80);

		prefix("-", 80);

		infix("*", 70);
		infix("/", 70);

		infix("\\", 60); // integer division

		infix("mod", 50);

		infix("+", 40);
		infix("-", 40);

		infixr("<>", 30);
		infixr("<", 30);
		infixr("<=", 30);
		infixr(">", 30);
		infixr(">=", 30);

		prefix("not", 23);
		infixr("and", 22);
		infixr("or", 21);
		infixr("xor", 20);

		prefix("#", 10); // stream

		prefix("@", 10); // address of

		infixr("=", 30); // equal for comparison

		symbol("fn", function () { // separate fn
			var oValue = {
				type: "fcall",
				name: "fn",
				args: null,
				pos: oToken.pos
			};

			if (oToken.type === "identifier") {
				oValue.left = "fn" + oToken.value;
				advance();
			} else {
				throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos);
			}

			if (oToken.type !== "(") { // FN xxx name without ()?
				oValue.args = [];
			} else {
				oValue.args = fnGetArgsInParenthesisOrBrackets();
			}
			return oValue;
		});


		// statements ...
		stmt("'", function () { // apostrophe comment
			var oValue;

			oValue = {
				type: "comment",
				name: "'",
				value: "",
				pos: oToken.pos
			};

			if (oToken.type === "string") {
				oValue.value = oToken.value;
				advance();
			}

			return oValue;
		});

		stmt("after", function () {
			var oValue = fnCreateCmdCall("afterGosub"); // interval and optional timer

			if (oValue.args.length < 2) { // add default timer 0
				oValue.args.push({
					type: "number",
					value: 0
				});
			}
			advance("gosub");
			oValue.args.push(expression(0)); // line
			return oValue;
		});

		stmt("chain", function () {
			var sName = "chain";

			if (oToken.type === "merge") { // chain merge?
				advance("merge");
				sName = "chainMerge"; // TODO: optional DELETE
			}
			return fnCreateCmdCall(sName);
		});

		stmt("clear", function () {
			var sName = "clear";

			if (oToken.type === "input") { // clear input?
				advance("input");
				sName = "clearInput";
			}
			return fnCreateCmdCall(sName);
		});

		stmt("def", function () {
			var oValue = {
				type: "def", // somehow special
				args: [],
				pos: oToken.pos
			};

			if (oToken.type === "fn") { // fn <identifier> separate?
				advance("fn");
				if (oToken.type === "identifier") {
					oValue.left = "FN" + oToken.value;
				} else {
					throw new BasicParser.ErrorObject("Invalid DEF at", oToken.type, oToken.pos);
				}
			} else if (oToken.type === "identifier" && Utils.stringStartsWith(oToken.value.toLowerCase(), "fn")) { // fn<identifier>
				oValue.left = oToken.value;
			} else {
				throw new BasicParser.ErrorObject("Invalid DEF at", oToken.type, oToken.pos);
			}
			advance();

			oValue.args = (oToken.type === "(") ? fnGetArgsInParenthesisOrBrackets() : [];
			advance("=");

			oValue.value = expression(0);
			return oValue;
		});

		stmt("defint", function () { // somehow special since arguments are only first characters of variables
			var oValue;

			oValue = fnCreateCmdCall("defint");
			oValue.type = oValue.name;
			return oValue;
		});

		stmt("defreal", function () { // somehow special since arguments are only first characters of variables
			var oValue;

			oValue = fnCreateCmdCall("defreal");
			oValue.type = oValue.name;
			return oValue;
		});

		stmt("defstr", function () { // somehow special since arguments are only first characters of variables
			var oValue;

			oValue = fnCreateCmdCall("defstr");
			oValue.type = oValue.name;
			return oValue;
		});

		stmt("ent", function () {
			var oValue = {
					type: "fcall",
					name: "ent",
					args: []
				},
				iCount = 0,
				oExpression;

			oValue.args.push(expression(0)); // should be number or variable

			while (oToken.type === ",") {
				advance(",");
				if (oToken.type === "=" && iCount % 3 === 0) { // special handling for parameter "number of steps"
					advance("=");
					oExpression = { // insert null parameter
						type: "null",
						value: null
					};
					oValue.args.push(oExpression);
					iCount += 1;
				}
				oExpression = expression(0);
				oValue.args.push(oExpression);
				iCount += 1;
			}

			return oValue;
		});

		stmt("env", function () {
			var oValue = {
					type: "fcall",
					name: "env",
					args: []
				},
				iCount = 0,
				oExpression;

			oValue.args.push(expression(0)); // should be number or variable

			while (oToken.type === ",") {
				advance(",");
				if (oToken.type === "=" && iCount % 3 === 0) { // special handling for parameter "number of steps"
					advance("=");
					oExpression = { // insert null parameter
						type: "null",
						value: null
					};
					oValue.args.push(oExpression);
					iCount += 1;
				}
				oExpression = expression(0);
				oValue.args.push(oExpression);
				iCount += 1;
			}

			return oValue;
		});

		stmt("erase", function () { // somehow special since arguments are only names of array variables
			var oValue = fnCreateCmdCall();

			oValue.type = oValue.name;
			return oValue;
		});

		stmt("every", function () {
			var oValue = fnCreateCmdCall("everyGosub"); // interval and optional timer

			if (oValue.args.length < 2) { // add default timer
				oValue.args.push({
					type: "number",
					value: 0
				});
			}
			advance("gosub");
			oValue.args.push(expression(0)); // line
			return oValue;
		});

		stmt("for", function () {
			var oValue = {
					type: "fcall",
					name: "for",
					args: null
				},
				oName;

			if (oToken.type !== "identifier") {
				throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos);
			}
			oName = expression(90); // take simple identifier, nothing more
			oValue.args = [oName];
			if (oName.type !== "identifier") {
				throw new BasicParser.ErrorObject("Expected simple identifier at", oToken.type, oToken.pos);
			}
			advance("=");
			oValue.left = expression(0);

			advance("to");
			oValue.right = expression(0);

			if (oToken.type === "step") {
				advance("step");
				oValue.third = expression(0);
			} else {
				oValue.third = {
					type: "number",
					value: "1"
				};
			}
			return oValue;
		});

		stmt("graphics", function () {
			var sName, oValue;

			if (oToken.type === "pen" || oToken.type === "paper") { // graphics pen/paper
				sName = "graphics" + Utils.stringCapitalize(oToken.type);
				advance(oToken.type);
				oValue = fnCreateCmdCall(sName);
			} else {
				throw new BasicParser.ErrorObject("Expected PEN or PAPER at", oToken.type, oToken.pos);
			}
			return oValue;
		});

		stmt("if", function () {
			var oValue = {
					type: "fcall",
					name: "if",
					args: []
				},
				oValue2, oToken2;

			oValue.left = expression(0);
			if (oToken.type === "goto") {
				// skip "then"
				oValue.right = statements("else");
			} else {
				advance("then");
				if (oToken.type === "number") {
					oValue2 = fnCreateCmdCall("goto");
					oToken2 = oToken;
					oValue.right = statements("else");
					if (oValue.right.length) {
						Utils.console.warn("IF: Unreachable code after THEN at pos", oToken2.pos);
						// throw new BasicParser.ErrorObject("Unreachable code after THEN at", oToken2.type, oToken2.pos);
					}
					oValue.right.unshift(oValue2);
				} else {
					oValue.right = statements("else");
				}
			}

			if (oToken.type === "else") {
				advance("else");
				if (oToken.type === "number") {
					oValue2 = fnCreateCmdCall("goto");
					oToken2 = oToken;
					oValue.third = statements("else");
					if (oValue.third.length) {
						Utils.console.warn("IF: Unreachable code after ELSE at pos", oToken2.pos);
						// throw new BasicParser.ErrorObject("Unreachable code after ELSE at", oToken2.type, oToken2.pos);
					}
					oValue.third.unshift(oValue2);
				} else if (oToken.type === "if") {
					oValue.third = [statement()];
				} else {
					oValue.third = statements("else");
				}
			} else {
				oValue.third = null;
			}
			return oValue;
		});

		stmt("input", function () {
			var oValue = {
					type: "fcall",
					name: "input",
					args: [],
					pos: oToken.pos
				},
				sText = "",
				sName, oValue2;

			oValue.args.push(fnGetOptionalStream());

			oValue.args.push({
				type: "string",
				value: (oToken.type === ";") ? ";" : ""
			});
			if (oToken.type === ";") { // no newline after input?
				advance(";");
			}

			if (oToken.type === "string") {
				sText += oToken.value;
				advance();
				if (oToken.type === ";") { // ";" => append "? "
					sText += "? ";
					advance(";");
				} else if (oToken.type === ",") {
					advance(",");
				} else {
					throw new BasicParser.ErrorObject("Expected ; or , at", oToken.type, oToken.pos);
				}
			}

			if (sText === "") { // no message => also append "? "
				sText = "? ";
			}

			oValue.args.push({
				type: "string",
				value: sText
			});

			do {
				if (oToken.type !== "identifier") {
					throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos);
				}
				sName = oToken.value;
				advance();
				if (oToken.type === "(") {
					oValue2 = {
						type: "array",
						args: null,
						name: sName,
						pos: oToken.pos
					};
					oValue2.args = fnGetArgsInParenthesisOrBrackets();
				} else {
					oValue2 = {
						type: "identifier",
						value: sName
					};
				}
				oValue.args.push(oValue2);
			} while ((oToken.type === ",") && advance());
			return oValue;
		});

		stmt("key", function () {
			var sName = "key";

			if (oToken.type === "def") { // key def?
				advance("def");
				sName = "keyDef";
			}
			return fnCreateCmdCall(sName);
		});

		stmt("let", function () {
			var oValue = {
				type: "assign",
				pos: oToken.pos
			};

			if (oToken.type !== "identifier") {
				throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos);
			}
			oValue.left = expression(90); // take it (can also be an array) and stop
			advance("="); // equal as assignment
			oValue.right = expression(0);
			return oValue;
		});

		stmt("line", function () {
			var oValue = {
					type: "fcall",
					name: "lineInput",
					args: [],
					pos: oToken.pos
				},
				sText = "",
				sName, oValue2;

			advance("input");

			oValue.args.push(fnGetOptionalStream());

			oValue.args.push({
				type: "string",
				value: (oToken.type === ";") ? ";" : ""
			});
			if (oToken.type === ";") { // no newline after input?
				advance(";");
			}

			if (oToken.type === "string") {
				sText += oToken.value;
				advance();
				if (oToken.type === ";") { // ";" => append "? "
					sText += "? ";
					advance();
				} else if (oToken.type === ",") {
					advance();
				} else {
					throw new BasicParser.ErrorObject("Expected ; or , at", oToken.type, oToken.pos);
				}
			}

			if (sText === "") { // no message => also append "? "
				sText = "? ";
			}

			oValue.args.push({
				type: "string",
				value: sText
			});


			if (oToken.type !== "identifier") {
				throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos);
			}
			sName = oToken.value;
			advance();
			if (oToken.type === "(") {
				oValue2 = {
					type: "array",
					args: null,
					name: sName,
					pos: oToken.pos
				};
				oValue2.args = fnGetArgsInParenthesisOrBrackets();
			} else {
				oValue2 = {
					type: "identifier",
					value: sName
				};
			}
			oValue.args.push(oValue2);

			return oValue;
		});

		stmt("mid$", function () { // mid$Assign
			var oValue = {
					type: "assign",
					pos: oToken.pos
				},
				oMid, oRight;

			oMid = fnCreateFuncCall("mid$Assign");
			if (oMid.args[0].type !== "identifier") {
				throw new BasicParser.ErrorObject("Expected identifier at", oMid.args[0].type, oMid.args[0].pos);
			}

			if (oMid.args.length < 3) {
				oMid.args.push({ // add dummy parameter for iLen
					type: "null",
					value: null
				});
			}

			oValue.left = Object.assign({}, oMid.args[0]); // set identifier also on left side

			advance("="); // equal as assignment
			oRight = expression(0);

			oMid.args.push(oRight);
			oValue.right = oMid; // put it on right side

			return oValue;
		});

		stmt("next", function () {
			var oValue = {
				type: "fcall",
				name: "next",
				args: [],
				pos: oPreviousToken.pos
			};

			while (oToken.type === "identifier") {
				oValue.args.push({
					type: "identifier",
					value: oToken.value
				});
				advance();
				if (oToken.type === ",") {
					advance(",");
				}
			}
			return oValue;
		});

		stmt("on", function () {
			var oValue = {
					type: "fcall",
					name: null,
					args: [],
					pos: oPreviousToken.pos
				},
				oLeft;

			if (oToken.type === "break") {
				advance("break");
				if (oToken.type === "gosub") {
					advance("gosub");
					oValue.name = "onBreakGosub";
					oValue.args = fnGetArgs();
				} else if (oToken.type === "cont") {
					advance("cont");
					oValue.name = "onBreakCont";
				} else if (oToken.type === "stop") {
					advance("stop");
					oValue.name = "onBreakStop";
				} else {
					throw new BasicParser.ErrorObject("Expected GOSUB, CONT or STOP", oToken.type, oToken.pos);
				}
			} else if (oToken.type === "error") { // on error goto
				advance("error");
				if (oToken.type === "goto") {
					advance("goto");
					oValue.name = "onErrorGoto";
					oValue.args = fnGetArgs();
				} else {
					throw new BasicParser.ErrorObject("Expected GOTO", oToken.type, oToken.pos);
				}
			} else if (oToken.type === "sq") { // on sq(n) gosub
				oLeft = expression(0);
				oLeft = oLeft.args[0];
				if (oToken.type === "gosub") {
					advance("gosub");
					oValue.name = "onSqGosub";
					oValue.args = fnGetArgs();
					oValue.args.unshift(oLeft);
				} else {
					throw new BasicParser.ErrorObject("Expected GOSUB", oToken.type, oToken.pos);
				}
			} else {
				oLeft = expression(0);
				if (oToken.type === "gosub") {
					advance("gosub");
					oValue.name = "onGosub";
					oValue.args = fnGetArgs();
					oValue.args.unshift(oLeft);
				} else if (oToken.type === "goto") {
					advance("goto");
					oValue.name = "onGoto";
					oValue.args = fnGetArgs();
					oValue.args.unshift(oLeft);
				} else {
					throw new BasicParser.ErrorObject("Expected GOTO or GOSUB", oToken.type, oToken.pos);
				}
			}
			return oValue;
		});

		stmt("print", function () {
			var oValue = {
					type: "fcall",
					args: [],
					name: "print",
					pos: oPreviousToken.pos
				},
				oValue2,
				iPos = oPreviousToken.pos,
				bTrailingSemicolon = false,
				iSpcOrTabEnd = 0,
				t, oStream;

			oStream = fnGetOptionalStream();
			oValue.args.push(oStream);

			while (oToken.type !== ":" && oToken.type !== "(eol)" && oToken.type !== "(end)") {
				if (oToken.type === "spc") {
					advance("spc");
					oValue2 = fnCreateFuncCall();
					oValue.args.push(oValue2);
					iSpcOrTabEnd = iIndex; // save index so we can ignore newline if spc or tab is printed last
				} else if (oToken.type === "tab") {
					advance("tab");
					oValue2 = fnCreateFuncCall();
					oValue.args.push(oValue2);
					iSpcOrTabEnd = iIndex;
				} else if (oToken.type === "using") {
					advance("using");
					t = expression(0); // format
					advance(";");
					oValue2 = {
						type: "fcall",
						name: "using",
						args: null,
						pos: oPreviousToken.pos
					};
					oValue2.args = fnGetArgsSepByCommaSemi();
					oValue2.args.unshift(t);
					oValue.args.push(oValue2);
				} else if (BasicParser.mKeywords[oToken.type] && (BasicParser.mKeywords[oToken.type].charAt(0) === "c" || BasicParser.mKeywords[oToken.type].charAt(0) === "x")) { // stop also at keyword which is c=command or x=command addition
					break;
				} else if (oToken.type === ";") {
					advance(";");
				} else if (oToken.type === ",") { // comma tabulator
					oValue.args.push({
						type: "fcall",
						name: "commaTab",
						args: [],
						pos: iPos
					});
					advance(",");
				} else {
					t = expression(0);
					oValue.args.push(t);
				}
			}

			bTrailingSemicolon = (oPreviousToken.type === ";");
			if (!bTrailingSemicolon && iSpcOrTabEnd !== iIndex) {
				oValue.args.push({
					type: "string",
					value: "\\r\\n"
				});
			}
			return oValue;
		});

		oSymbols["?"] = oSymbols.print; // "?" is same as print

		stmt("rem", function () {
			var oValue;

			oValue = {
				type: "comment",
				name: "rem",
				value: "",
				pos: oToken.pos
			};

			if (oToken.type === "string") {
				oValue.value = oToken.value;
				advance();
			}

			return oValue;
		});

		stmt("resume", function () {
			var sName = "resume",
				oValue;

			if (oToken.type === "next") { // resume next
				advance("next");
				sName = "resumeNext";
			}
			oValue = fnCreateCmdCall(sName);
			return oValue;
		});

		stmt("rsx", function () {
			var rsxToken = oPreviousToken,
				oValue;

			if (oToken.type === ",") {
				advance(",");
			}
			oValue = fnCreateCmdCall(rsxToken.type + Utils.stringCapitalize(rsxToken.value.toLowerCase()));
			return oValue;
		});

		stmt("speed", function () {
			var sName = "";

			switch (oToken.type) {
			case "ink":
				sName = "speedInk";
				advance("ink");
				break;
			case "key":
				sName = "speedKey";
				advance("key");
				break;
			case "write":
				sName = "speedWrite";
				advance("write");
				break;
			default:
				throw new BasicParser.ErrorObject("Expected INK, KEY or WRITE", oToken.type, oToken.pos);
			}
			return fnCreateCmdCall(sName);
		});

		stmt("symbol", function () {
			var sName = "symbol";

			if (oToken.type === "after") { // symbol after?
				advance("after");
				sName = "symbolAfter";
			}
			return fnCreateCmdCall(sName);
		});

		stmt("window", function () {
			var oValue;

			if (oToken.type === "swap") {
				advance("swap");
				oValue = fnCreateCmdCall("windowSwap");
			} else {
				oValue = fnCreateCmdCall("window");
			}
			return oValue;
		});

		stmt("write", function () {
			var oValue, oStream;

			oStream = fnGetOptionalStream();
			oValue = fnCreateCmdCall("write");
			oValue.args.unshift(oStream);
			return oValue;
		});


		// line
		iIndex = 0;
		advance();
		while (oToken.type !== "(end)") {
			aParseTree.push(line());
		}
		return aParseTree;
	}
};


BasicParser.ErrorObject = function (message, value, pos) {
	this.message = message;
	this.value = value;
	this.pos = pos;
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = BasicParser;
}
