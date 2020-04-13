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
// following are arguments: n=number, s=string, l=line number (checked), v=variable (checked), r=letter or range, a=any, n0?=optional papameter with default null, #0?=optional stream with default 0; suffix ?=optional (optionals must be last); last *=any number of arguments may follow
BasicParser.mKeywords = {
	abs: "f n",
	after: "c n n?",
	afterGosub: "c n n?", // special, cannot check optional first n, and line number
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
	chainMerge: "c s *", // special
	chr$: "f n",
	cint: "f n",
	clear: "c", // clear, clear input
	clearInput: "c",
	clg: "c n?",
	closein: "c",
	closeout: "c",
	cls: "c n?",
	cont: "c",
	copychr$: "f n?",
	cos: "f n",
	creal: "f n",
	cursor: "c n0? n?",
	data: "c *",
	dec$: "f n s",
	def: "c s *", // not checked
	defint: "c r r*",
	defreal: "c r r*",
	defstr: "c r r*",
	deg: "c",
	"delete": "c",
	derr: "f",
	di: "c",
	dim: "c v *",
	draw: "c n n n0? n?",
	drawr: "c n n n0? n?",
	edit: "c n",
	ei: "c",
	"else": "c", // else belongs to "if", but can also be used as command
	end: "c",
	ent: "c n *",
	env: "c n *",
	eof: "f",
	erase: "c v *",
	erl: "f",
	err: "f",
	error: "c n",
	every: "c n n?",
	everyGosub: "c n n?", // special, cannot check optional first n, and line number
	exp: "f n",
	fill: "c n",
	fix: "f n",
	fn: "f", // can also be separate
	"for": "c",
	frame: "c",
	fre: "f a",
	gosub: "c l",
	"goto": "c l",
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
	keyDef: "c n n n? n? n?",
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
	mask: "c n0? n?",
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
	next: "c v*",
	not: "o",
	on: "c", // on break cont, on break gosub, on break stop, on error goto, on <ex> gosub, on <ex> goto, on sq(n) gosub
	onBreakGosub: "c l", // special
	onErrorGoto: "c l", // special
	onGosub: "c l l*", // special (n not checked)
	onGoto: "c l l*", // special (n not checked)
	onSqGosub: "c l", // special
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
	read: "c v v*",
	release: "c n",
	rem: "c s?",
	remain: "f n",
	renum: "c n0? n0? n?",
	restore: "c l?",
	resume: "c l?", // resume, resume <line>
	resumeNext: "c",
	"return": "c",
	right$: "f s n",
	rnd: "f n?",
	round: "f n n?",
	run: "c a?", // cannot check "c s | l?"
	save: "c s a? n? n? n?",
	sgn: "f n",
	sin: "f n",
	sound: "c n n n? n0? n0? n0? n?",
	space$: "f n",
	spc: "x n", // print spc
	speed: "c", // speed ink, speed key, speed write
	speedInk: "c n n", // special
	speedKey: "c n n", // special
	speedWrite: "c n", // special
	sq: "f n",
	sqr: "f n",
	step: "x", // for ... to ... step
	stop: "c",
	str$: "f n",
	string$: "f n s",
	swap: "x n n?", // window swap
	symbol: "c n n *", // symbol, symbol after
	symbolAfter: "c n", // special
	tab: "x n", // print tab
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
	"while": "c n",
	width: "c n",
	window: "c #0? n n n n", // window, window swap
	windowSwap: "c n n?", // special
	write: "c #0? *", // not checked
	xor: "o",
	xpos: "f",
	ypos: "f",
	zone: "c n"
};

BasicParser.prototype = {
	init: function (options) {
		this.options = options || {}; // e.g. tron

		this.reset();
	},

	reset: function () {
		this.iLine = 0; // for error messages
	},

	// http://crockford.com/javascript/tdop/tdop.html (old: http://javascript.crockford.com/tdop/tdop.html)
	// http://crockford.com/javascript/tdop/parse.js
	// Operator precedence parsing
	//
	// Operator: With left binding power (lbp) and operational function.
	// Manipulates tokens to its left (e.g: +)? => left denotative function led(), otherwise null denotative function nud()), (e.g. unary -)
	// identifiers, numbers: also nud.
	parse: function (aTokens) {
		var that = this,
			oSymbols = {},
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
				var oSym;

				oPreviousToken = oToken;
				if (id && oToken.type !== id) {
					throw new BasicParser.ErrorObject("Expected", id, oToken.pos, that.iLine);
				}
				if (iIndex >= aTokens.length) {
					oToken = oSymbols["(end)"];
					return oToken;
				}
				oToken = aTokens[iIndex]; // we get a lex token and reuse it as parseTree token
				iIndex += 1;
				if (oToken.type === "identifier" && BasicParser.mKeywords[oToken.value.toLowerCase()]) {
					oToken.type = oToken.value.toLowerCase(); // modify type identifier => keyword xy
				}
				oSym = oSymbols[oToken.type];
				if (!oSym) {
					throw new BasicParser.ErrorObject("Unknown token", oToken.type, oToken.pos, that.iLine);
				}
				return oToken;
			},

			expression = function (rbp) {
				var left,
					t = oToken,
					s = oSymbols[t.type];

				if (Utils.debug > 3) {
					Utils.console.debug("parse: expression rbp=" + rbp + " type=" + t.type + " t=%o", t);
				}
				advance();
				if (!s.nud) {
					if (t.type === "(end)") {
						throw new BasicParser.ErrorObject("Unexpected end of file", "", t.pos, that.iLine);
					} else {
						throw new BasicParser.ErrorObject("Unexpected token", t.type, t.pos, that.iLine);
					}
				}
				left = s.nud(t); // process literals, variables, and prefix operators
				while (rbp < oSymbols[oToken.type].lbp) { // as long as the right binding power is less than the left binding power of the next token...
					t = oToken;
					s = oSymbols[t.type];
					advance();
					if (!s.led) {
						throw new BasicParser.ErrorObject("Unexpected token", t.type, t.pos, that.iLine); //TTT how to get this error?
					}
					left = s.led(left); // ...the led method is invoked on the following token (infix and suffix operators), can be recursive
				}
				return left;
			},

			assignment = function () { // "=" as assignment, similar to let
				var oValue, oLeft;

				if (oToken.type !== "identifier") {
					throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos, that.iLine);
				}
				oLeft = expression(90); // take it (can also be an array) and stop
				oValue = oToken;
				advance("="); // equal as assignment
				oValue.left = oLeft;
				oValue.right = expression(0);
				oValue.type = "assign"; // replace "="
				return oValue;
			},

			statement = function () {
				var t = oToken,
					s = oSymbols[t.type],
					oValue;

				if (s.std) { // statement?
					advance();
					return s.std();
				}

				if (t.type === "identifier") {
					oValue = assignment();
				} else {
					oValue = expression(0);
				}

				if (oValue.type !== "assign" && oValue.type !== "fcall" && oValue.type !== "def" && oValue.type !== "(" && oValue.type !== "[") {
					throw new BasicParser.ErrorObject("Bad expression statement", t.value, t.pos, that.iLine);
				}
				return oValue;
			},

			statements = function (sStopType) {
				var aStatements = [],
					oStatement;

				while (oToken.type !== "(end)" && oToken.type !== "(eol)") {
					if (sStopType && oToken.type === sStopType) {
						break;
					}
					if (oToken.type === ":") {
						advance(":");
					} else {
						oStatement = statement();
						aStatements.push(oStatement);
					}
				}
				return aStatements;
			},

			line = function () {
				var oValue;

				advance("number");
				oValue = oPreviousToken; // number token
				that.iLine = oValue.value; // set line number for error messages
				oValue.args = statements();
				oValue.type = "label"; // number => label

				if (oToken.type === "(eol)") {
					advance("(eol)");
				}
				return oValue;
			},

			infix = function (id, lbp, rbp, led) {
				rbp = rbp || lbp;
				symbol(id, null, lbp, led || function (left) {
					var oValue = oPreviousToken;

					oValue.left = left;
					oValue.right = expression(rbp);
					return oValue;
				});
			},
			infixr = function (id, lbp, rbp, led) {
				rbp = rbp || lbp;
				symbol(id, null, lbp, led || function (left) {
					var oValue = oPreviousToken;

					oValue.left = left;
					oValue.right = expression(rbp - 1);
					return oValue;
				});
			},
			prefix = function (id, rbp) {
				symbol(id, function () {
					var oValue = oPreviousToken;

					oValue.right = expression(rbp);
					return oValue;
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
				} else { // create number token
					oValue = {
						type: "number",
						value: 0,
						len: 0 // no space in source
					};
				}
				return oValue;
			},

			fnCheckRemainingTypes = function (aTypes) {
				var sType;

				if (aTypes && aTypes.length) { // some more parameters expected?
					do {
						sType = aTypes.shift();
					} while (sType && (Utils.stringEndsWith(sType, "*") || Utils.stringEndsWith(sType, "?")));
					if (sType && !Utils.stringEndsWith(sType, "?")) {
						throw new BasicParser.ErrorObject("Expected parameter " + sType + " for arguments after", oPreviousToken.value, oToken.pos, that.iLine);
					}
				}
			},

			fnIsSingleLetterIdentifier = function (oValue) {
				return oValue.type === "identifier" && !oValue.args && oValue.value.length === 1;
			},

			fnGetArgs = function (sKeyword) { // eslint-disable-line complexity
				var aArgs = [],
					sSeparator = ",",
					oCloseTokens = {
						":": 1,
						"(eol)": 1,
						"(end)": 1,
						"else": 1,
						rem: 1,
						"'": 1
					},
					bNeedMore = false,
					sType = "ok",
					aTypes, sKeyOpts, oExpression;

				if (sKeyword) {
					sKeyOpts = BasicParser.mKeywords[sKeyword];
					if (sKeyOpts) {
						aTypes = sKeyOpts.substr(2).split(" ");
					} else {
						Utils.console.warn("fnGetArgs: No options for keyword", sKeyword);
					}
				}

				while (bNeedMore || (sType && !oCloseTokens[oToken.type])) {
					if (aTypes && sType.slice(-1) !== "*") { // "*"= any number of parameters
						sType = aTypes.shift();
						if (!sType) {
							throw new BasicParser.ErrorObject("Expected end of arguments", oPreviousToken.type, oPreviousToken.pos, that.iLine);
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
								value: 0,
								len: 0
							};
						}
					} else {
						if (oToken.type === sSeparator && sType.substr(0, 2) === "n0") { // n0 or n0?: if parameter not specified, insert default value null?
							oExpression = {
								type: "null",
								value: null,
								len: 0
							};
						} else if (sType.substr(0, 1) === "l") {
							oExpression = expression(0);
							if (oExpression.type !== "number") { // maybe an expression and no plain number
								throw new BasicParser.ErrorObject("Line number expected at", oExpression.value, oExpression.pos, that.iLine);
							}
							oExpression.type = "linenumber"; // change type: number => linenumber
						} else if (sType.substr(0, 1) === "v") { // variable (identifier)
							oExpression = expression(0);
							if (oExpression.type !== "identifier") {
								throw new BasicParser.ErrorObject("Variable expected at", oExpression.value, oExpression.pos, that.iLine);
							}
						} else if (sType.substr(0, 1) === "r") { // character or range of characters (defint, defreal, defstr)
							if (oToken.type !== "identifier") {
								throw new BasicParser.ErrorObject("Letter expected at", oToken.value, oToken.pos, that.iLine);
							}
							oExpression = expression(0);
							if (fnIsSingleLetterIdentifier(oExpression)) { // ok
								oExpression.type = "letter"; // change type: identifier -> letter
							} else if (oExpression.type === "-" && fnIsSingleLetterIdentifier(oExpression.left) && fnIsSingleLetterIdentifier(oExpression.right)) { // also ok
								oExpression.type = "range"; // change type: "-" => range
								oExpression.left.type = "letter"; // change type: identifier -> letter
								oExpression.right.type = "letter"; // change type: identifier -> letter
							} else {
								throw new BasicParser.ErrorObject("Letter or range expected at", oExpression.value, oExpression.pos, that.iLine);
							}
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

			fnGetArgsInParenthesis = function () {
				var aArgs;

				advance("(");
				aArgs = fnGetArgs(null, ")");
				if (oToken.type !== ")") {
					throw new BasicParser.ErrorObject("Expected closing parenthesis for argument list after", oPreviousToken.value, oToken.pos, that.iLine);
				}
				advance(")");
				return aArgs;
			},

			fnGetArgsInBrackets = function () {
				var aArgs;

				advance("[");
				aArgs = fnGetArgs(null, "]");
				if (oToken.type !== "]") {
					throw new BasicParser.ErrorObject("Expected closing brackets for argument list after", oPreviousToken.value, oToken.pos, that.iLine);
				}
				advance("]");
				return aArgs;
			},

			fnCreateCmdCall = function (sType) { // optional sType
				var oValue = oPreviousToken;

				if (sType) {
					oValue.type = sType;
				}

				oValue.args = fnGetArgs(oValue.type);
				return oValue;
			},

			fnCreateFuncCall = function (sType) { // optional sType
				var oValue = oPreviousToken;

				if (sType) {
					oValue.type = sType;
				}

				if (oToken.type === "(") { // args in parenthesis?
					advance("(");
					oValue.args = fnGetArgs(oValue.type, ")");
					if (oToken.type !== ")") {
						throw new BasicParser.ErrorObject("Expected closing parenthesis for argument list after", oPreviousToken.value, oToken.pos, that.iLine);
					}
					advance(")");
				} else {
					oValue.args = [];
				}

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

		symbol("linenumber", function (number) {
			return number;
		});

		symbol("string", function (s) {
			return s;
		});
		symbol("identifier", function (oName) {
			var sName = oName.value,
				oValue;

			if (Utils.stringStartsWith(sName.toLowerCase(), "fn")) {
				if (oToken.type !== "(") { // Fnxxx name without ()?
					oValue = {
						type: "fn",
						value: sName.substr(0, 2), // fn
						args: [],
						left: oName, // identifier
						pos: oName.pos // same pos as identifier?
					};
					return oValue;
				}
			}

			if (oToken.type === "(" || oToken.type === "[") {
				oValue = oPreviousToken;
				oValue.args = (oToken.type === "(") ? fnGetArgsInParenthesis() : fnGetArgsInBrackets();

				if (Utils.stringStartsWith(sName.toLowerCase(), "fn")) {
					oValue.type = "fn"; // FNxxx in e.g. print
					oValue.left = {
						type: "identifier",
						value: oValue.value,
						pos: oValue.pos
					};
				}
			} else {
				oValue = oName;
			}
			return oValue;
		});

		symbol("(", function () {
			var oValue = expression(0);

			advance(")");
			return oValue;
		});

		symbol("[", function () {
			var oValue = expression(0);

			advance("]");
			return oValue;
		});

		prefix("@", 95); // address of

		infix("^", 90, 80);

		prefix("+", 80);
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

		infixr("=", 30); // equal for comparison

		symbol("fn", function () { // separate fn
			var oValue = oPreviousToken;

			if (oToken.type === "identifier") {
				oToken.value = "fn" + oToken.value;
				oValue.left = oToken;
				advance();
			} else {
				throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos, that.iLine);
			}

			if (oToken.type !== "(") { // FN xxx name without ()?
				oValue.args = [];
			} else {
				oValue.args = fnGetArgsInParenthesis();
			}
			return oValue;
		});


		// statements ...

		stmt("'", function () { // apostrophe comment => rem
			return fnCreateCmdCall("rem");
		});

		stmt("|", function () { // rsx
			var oValue = oPreviousToken;

			if (oToken.type === ",") { // arguments starting with comma
				advance(",");
			}
			oValue.args = fnGetArgs();
			return oValue;
		});

		stmt("after", function () {
			var oValue = fnCreateCmdCall("afterGosub"), // interval and optional timer
				aLine;

			if (oValue.args.length < 2) { // add default timer 0
				oValue.args.push({ // create
					type: "number",
					value: 0,
					orig: ""
				});
			}
			advance("gosub");
			aLine = fnGetArgs("gosub"); // line number
			oValue.args.push(aLine[0]);
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

		stmt("def", function () { // somehow special
			var oValue = oPreviousToken;

			if (oToken.type === "fn") { // fn <identifier> separate?
				advance("fn");
				if (oToken.type === "identifier") {
					oToken.value = "FN" + oToken.value;
					oValue.left = oToken;
				} else {
					throw new BasicParser.ErrorObject("Invalid DEF at", oToken.type, oToken.pos, that.iLine);
				}
			} else if (oToken.type === "identifier" && Utils.stringStartsWith(oToken.value.toLowerCase(), "fn")) { // fn<identifier>
				oValue.left = oToken;
			} else {
				throw new BasicParser.ErrorObject("Invalid DEF at", oToken.type, oToken.pos, that.iLine);
			}
			advance();

			oValue.args = (oToken.type === "(") ? fnGetArgsInParenthesis() : [];
			advance("=");

			oValue.right = expression(0);
			return oValue;
		});

		stmt("else", function () {
			var oValue = oPreviousToken,
				oString = {
					type: "string",
					value: "else",
					pos: oToken.pos
				};

			oValue.type = "rem"; // create a comment form else
			oValue.args = [];

			Utils.console.warn("ELSE: Weird use of ELSE at pos", oToken.pos, ", line", that.iLine);

			// TTT TODO: data line as separate statement is taken
			while (oToken.type !== "(eol)" && oToken.type !== "(end)") {
				if (oToken.value) {
					oString.value += " " + oToken.value;
				}
				advance();
			}

			oValue.args.push(oString);

			return oValue;
		});

		stmt("ent", function () {
			var oValue = oPreviousToken,
				iCount = 0,
				oExpression;

			oValue.args = [];

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
			var oValue = oPreviousToken,
				iCount = 0,
				oExpression;

			oValue.args = [];

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

		stmt("every", function () {
			var oValue = fnCreateCmdCall("everyGosub"), // interval and optional timer
				aLine;

			if (oValue.args.length < 2) { // add default timer
				oValue.args.push({ // create
					type: "number",
					value: 0,
					orig: ""
				});
			}
			advance("gosub");
			aLine = fnGetArgs("gosub"); // line number
			oValue.args.push(aLine[0]);
			return oValue;
		});

		stmt("for", function () {
			var oValue = oPreviousToken,
				oName;

			if (oToken.type !== "identifier") {
				throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos, that.iLine);
			}
			oName = expression(90); // take simple identifier, nothing more
			oValue.args = [oName];
			if (oName.type !== "identifier") {
				throw new BasicParser.ErrorObject("Expected simple identifier at", oToken.type, oToken.pos, that.iLine);
			}
			advance("=");
			oValue.left = expression(0);

			advance("to");
			oValue.right = expression(0);

			if (oToken.type === "step") {
				advance("step");
				oValue.third = expression(0);
			} else {
				oValue.third = { // created
					type: "number",
					value: "1",
					len: 0
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
				throw new BasicParser.ErrorObject("Expected PEN or PAPER at", oToken.type, oToken.pos, that.iLine);
			}
			return oValue;
		});

		stmt("if", function () {
			var oValue = oPreviousToken,
				oValue2, oToken2;

			oValue.args = [];

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
					if (oValue.right.length && oValue.right[0].type !== "rem") {
						Utils.console.warn("IF: Unreachable code after THEN at pos", oToken2.pos + ", line", that.iLine);
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
						Utils.console.warn("IF: Unreachable code after ELSE at pos", oToken2.pos + ", line", that.iLine);
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
			var oValue = oPreviousToken,
				sText = "",
				oValue2;

			oValue.args = [];

			oValue.args.push(fnGetOptionalStream());

			oValue.args.push({ // create
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
					throw new BasicParser.ErrorObject("Expected ; or , at", oToken.type, oToken.pos, that.iLine);
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
					throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos, that.iLine);
				}
				oValue2 = oToken; // identifier
				advance();
				if (oToken.type === "(") {
					oValue2.args = fnGetArgsInParenthesis();
				} else if (oToken.type === "[") {
					oValue2.args = fnGetArgsInBrackets();
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
			var oValue = oPreviousToken;

			if (oToken.type !== "identifier") {
				throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos, that.iLine);
			}
			oValue.left = expression(90); // take it (can also be an array) and stop
			advance("="); // equal as assignment
			oValue.right = expression(0);
			return oValue;
		});

		stmt("line", function () {
			var oValue = oPreviousToken,
				sText = "",
				oValue2;

			advance("input");

			oValue.type = "lineInput";
			oValue.args = [];

			oValue.args.push(fnGetOptionalStream());

			oValue.args.push({ // create
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
					throw new BasicParser.ErrorObject("Expected ; or , at", oToken.type, oToken.pos, that.iLine);
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
				throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos, that.iLine);
			}
			oValue2 = oToken;
			advance();
			if (oToken.type === "(") {
				oValue2.args = fnGetArgsInParenthesis();
			} else if (oToken.type === "[") {
				oValue2.args = fnGetArgsInBrackets();
			}
			oValue.args.push(oValue2);

			return oValue;
		});

		stmt("mid$", function () { // mid$Assign
			var oValue = { // create
					type: "assign",
					pos: oToken.pos
				},
				oMid, oRight;

			oMid = fnCreateFuncCall("mid$Assign");
			if (oMid.args[0].type !== "identifier") {
				throw new BasicParser.ErrorObject("Expected identifier at", oMid.args[0].type, oMid.args[0].pos, that.iLine);
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

		stmt("on", function () {
			var oValue = oPreviousToken,
				oLeft;

			oValue.args = [];

			if (oToken.type === "break") {
				advance("break");
				if (oToken.type === "gosub") {
					advance("gosub");
					oValue.type = "onBreakGosub";
					oValue.args = fnGetArgs(oValue.type);
				} else if (oToken.type === "cont") {
					advance("cont");
					oValue.type = "onBreakCont";
				} else if (oToken.type === "stop") {
					advance("stop");
					oValue.type = "onBreakStop";
				} else {
					throw new BasicParser.ErrorObject("Expected GOSUB, CONT or STOP", oToken.type, oToken.pos, that.iLine);
				}
			} else if (oToken.type === "error") { // on error goto
				advance("error");
				if (oToken.type === "goto") {
					advance("goto");
					oValue.type = "onErrorGoto";
					oValue.args = fnGetArgs(oValue.type);
				} else {
					throw new BasicParser.ErrorObject("Expected GOTO", oToken.type, oToken.pos, that.iLine);
				}
			} else if (oToken.type === "sq") { // on sq(n) gosub
				oLeft = expression(0);
				oLeft = oLeft.args[0];
				if (oToken.type === "gosub") {
					advance("gosub");
					oValue.type = "onSqGosub";
					oValue.args = fnGetArgs(oValue.type);
					oValue.args.unshift(oLeft);
				} else {
					throw new BasicParser.ErrorObject("Expected GOSUB", oToken.type, oToken.pos, that.iLine);
				}
			} else {
				oLeft = expression(0);
				if (oToken.type === "gosub") {
					advance("gosub");
					oValue.type = "onGosub";
					oValue.args = fnGetArgs(oValue.type);
					oValue.args.unshift(oLeft);
				} else if (oToken.type === "goto") {
					advance("goto");
					oValue.type = "onGoto";
					oValue.args = fnGetArgs(oValue.type);
					oValue.args.unshift(oLeft);
				} else {
					throw new BasicParser.ErrorObject("Expected GOTO or GOSUB", oToken.type, oToken.pos, that.iLine);
				}
			}
			return oValue;
		});

		stmt("print", function () {
			var oValue = oPreviousToken,
				bTrailingSemicolon = false,
				iSpcOrTabEnd = 0,
				oValue2, t, oStream;

			oValue.args = [];

			oStream = fnGetOptionalStream();
			oValue.args.push(oStream);

			while (oToken.type !== ":" && oToken.type !== "(eol)" && oToken.type !== "(end)" && oToken.type !== "'") {
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
					oValue2 = oToken;
					advance("using");
					t = expression(0); // format
					advance(";");

					oValue2.args = fnGetArgsSepByCommaSemi();
					oValue2.args.unshift(t);
					oValue.args.push(oValue2);
				} else if (BasicParser.mKeywords[oToken.type] && (BasicParser.mKeywords[oToken.type].charAt(0) === "c" || BasicParser.mKeywords[oToken.type].charAt(0) === "x")) { // stop also at keyword which is c=command or x=command addition
					break;
				} else if (oToken.type === ";") {
					advance(";");
				} else if (oToken.type === ",") { // comma tabulator
					oValue2 = oToken;
					advance(",");
					oValue2.type = "commaTab";
					oValue2.args = [];
					oValue.args.push(oValue2);
				} else {
					t = expression(0);
					oValue.args.push(t);
				}
			}

			bTrailingSemicolon = (oPreviousToken.type === ";");
			if (!bTrailingSemicolon && iSpcOrTabEnd !== iIndex) {
				oValue.args.push({ // create
					type: "string",
					value: "\\r\\n"
				});
			}
			return oValue;
		});

		stmt("?", function () {
			var oValue = oSymbols.print.std(); // "?" is same as print

			oValue.type = "print";
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
				throw new BasicParser.ErrorObject("Expected INK, KEY or WRITE", oToken.type, oToken.pos, that.iLine);
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
			var sName = "window";

			if (oToken.type === "swap") {
				advance("swap");
				sName = "windowSwap";
			}
			return fnCreateCmdCall(sName);
		});

		/*
		stmt("write", function () {
			var oValue;

			//oStream = fnGetOptionalStream();
			oValue = fnCreateCmdCall("write");
			//oValue.args.unshift(oStream);
			return oValue;
		});
		*/


		// line
		iIndex = 0;
		advance();
		while (oToken.type !== "(end)") {
			aParseTree.push(line());
		}
		return aParseTree;
	}
};


BasicParser.ErrorObject = function (sMessage, value, iPos, iLine) {
	this.message = sMessage;
	this.value = value;
	this.pos = iPos;
	if (iLine) {
		this.line = iLine;
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = BasicParser;
}
