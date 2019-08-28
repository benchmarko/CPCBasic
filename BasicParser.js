// BasicParser.js - Parse Locomotive BASIC 1.1 for Amstrad CPC 6128
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

BasicParser.mKeywords = { // c=command, f=function, o=operator
	// TODO: test for function parameter count?
	/*
	abs: "f n",
	after: "c n N",
	and: "o",
	asc: "f t",
	atn: "f n",
	auto: "c N N",
	bin$: "f n N",
	border: "c n;n",
	"break": "x", //TTT
	call: "c 1 2",
	cat: "c 0 0",
	chain: "c 1 2", // chain, chain merge
	chr$: "f 1 1",
	cint: "f 1 1",
	clear: "c 0 0", // clear, clear input
	clg: "c 0 1",
	closein: "c 0 0",
	closeout: "c 0 0",
	*/
	abs: "f",
	after: "c",
	and: "o",
	asc: "f",
	atn: "f",
	auto: "c",
	bin$: "f",
	border: "c",
	"break": "x", //TTT
	call: "c",
	cat: "c",
	chain: "c", // chain, chain merge
	chr$: "f",
	cint: "f",
	clear: "c", // clear, clear input
	clg: "c",
	closein: "c",
	closeout: "c",
	cls: "c",
	cont: "c",
	copychr$: "f",
	cos: "f",
	creal: "f",
	cursor: "c",
	data: "c",
	dec$: "f",
	def: "c",
	defint: "c",
	defreal: "c",
	defstr: "c",
	deg: "c",
	"delete": "c",
	derr: "f",
	di: "c",
	dim: "c",
	draw: "c",
	drawr: "c",
	edit: "c",
	ei: "c",
	"else": "x",
	end: "c",
	ent: "c",
	env: "c",
	eof: "f",
	erase: "c",
	erl: "f",
	err: "f",
	error: "c",
	every: "c",
	exp: "f",
	fill: "c",
	fix: "f",
	fn: "x", // def fn??? TTT
	"for": "c",
	frame: "c",
	fre: "f",
	gosub: "c",
	"goto": "c",
	graphics: "c", // graphics paper, graphics pen
	hex$: "f",
	himem: "f",
	"if": "c",
	ink: "c",
	inkey: "f",
	inkey$: "f",
	inp: "f",
	input: "c",
	instr: "f",
	"int": "f",
	joy: "f",
	key: "c", // key, key def
	left$: "f",
	len: "f",
	let: "c",
	line: "c", // line input
	list: "c",
	load: "c",
	locate: "c",
	log: "f",
	log10: "f",
	lower$: "f",
	mask: "c",
	max: "f",
	memory: "c",
	merge: "c",
	mid$: "f",
	min: "f",
	mod: "o",
	mode: "c",
	move: "c",
	mover: "c",
	"new": "c",
	next: "c",
	not: "o",
	on: "c", // on break cont, on break gosub, on break stop, on error goto, on <ex> gosub, on <ex> goto, on sq gosub
	openin: "c",
	openout: "c",
	or: "o",
	origin: "c",
	out: "c",
	paper: "c",
	peek: "f",
	pen: "c",
	pi: "f",
	plot: "c",
	plorr: "c",
	poke: "c",
	pos: "f",
	print: "c", // print also with spc(), tab(), using
	rad: "c",
	randomize: "c",
	read: "c",
	release: "c",
	rem: "c",
	remain: "f",
	renum: "c",
	restore: "c",
	resume: "c", // resume, resume next
	"return": "c",
	right$: "f",
	rnd: "f",
	round: "f",
	run: "c",
	save: "c",
	sgn: "f",
	sin: "f",
	sound: "c",
	space$: "f",
	spc: "f",
	speed: "c", // speed ink, speed key, speed write
	sq: "f",
	sqr: "f",
	step: "x", // for ... to ... step
	stop: "c",
	str$: "f",
	string$: "f",
	swap: "x", // window swap
	symbol: "c", // symbol, symbol after
	tab: "f",
	tag: "c",
	tagoff: "c",
	tan: "f",
	test: "f",
	testr: "f",
	then: "x", // if...then
	time: "f",
	to: "x", // for...to
	troff: "c",
	tron: "c",
	unt: "f",
	upper$: "f",
	using: "x", // print using
	val: "f",
	vpos: "f",
	wait: "c",
	wend: "c",
	"while": "c",
	width: "c",
	window: "c", // window, window swap
	write: "c",
	xor: "o",
	xpos: "f",
	ypos: "f",
	zone: "c"
};

BasicParser.prototype = {
	init: function (options) {
		this.options = options || {}; // ignoreFuncCase, ignoreVarCase
	},
	oStack: {
		f: [], // for
		w: [] // while
	},
	iGosubCount: 0,
	iIfCount: 0,
	iStopCount: 0,
	iForCount: 0, // stack needed
	iWhileCount: 0, // stack needed

	lex: function (input) { // eslint-disable-line complexity
		var isComment = function (c) { // isApostrophe
				return (/[']/).test(c);
			},
			isOperator = function (c) {
				return (/[+\-*/^=()[\],;:?]/).test(c);
			},
			isComparison = function (c) {
				return (/[<>]/).test(c);
			},
			isComparison2 = function (c) {
				return (/[<>=]/).test(c);
			},
			isDigit = function (c) {
				return (/[0-9]/).test(c);
			},
			isHexOrBin = function (c) { // bin: &X, hex: & or &H
				return (/[&]/).test(c);
			},
			isBin2 = function (c) {
				return (/[01]/).test(c);
			},
			isHex2 = function (c) {
				return (/[0-9A-Fa-f]/).test(c);
			},
			isWhiteSpace = function (c) {
				return (/[ \r]/).test(c);
			},
			isNewLine = function (c) {
				return (/[\n]/).test(c);
			},
			isQuotes = function (c) {
				return (/["]/).test(c);
			},
			isNotQuotes = function (c) {
				return c !== "" && !isQuotes(c);
			},
			isIdentifierStart = function (c) {
				return c !== "" && (/[A-Za-z]/).test(c); // cannot use complete [A-Za-z]+[\w]*[$%!]
			},
			isIdentifierMiddle = function (c) {
				return c !== "" && (/[\w]/).test(c);
			},
			isIdentifierEnd = function (c) {
				return c !== "" && (/[\\$%!]/).test(c);
			},
			isStream = function (c) {
				return (/[#]/).test(c);
			},
			isNotNewLine = function (c) {
				return c !== "" && c !== "\n";
			},
			aTokens = [],
			sToken,
			sChar,
			iStartPos,
			iIndex = 0,

			advance = function () {
				iIndex += 1;
				return input.charAt(iIndex);
			},
			advanceWhile = function (fn) {
				var sToken2 = "";

				do {
					sToken2 += sChar;
					sChar = advance();
				} while (fn(sChar));
				return sToken2;
			},
			addToken = function (type, value, iPos) {
				aTokens.push({
					type: type,
					value: value,
					pos: iPos
				});
			};

		while (iIndex < input.length) {
			iStartPos = iIndex;
			sChar = input.charAt(iIndex);
			if (isWhiteSpace(sChar)) {
				sChar = advance();
			} else if (isNewLine(sChar)) {
				addToken("(eol)", 0, iStartPos);
				sChar = advance();
			} else if (isComment(sChar)) {
				advanceWhile(isNotNewLine);
			} else if (isOperator(sChar)) {
				addToken(sChar, 0, iStartPos);
				sChar = advance();
			} else if (isDigit(sChar)) {
				sToken = advanceWhile(isDigit);
				if (sChar === ".") {
					sToken += advanceWhile(isDigit);
				}
				sToken = parseFloat(sToken);
				if (!isFinite(sToken)) {
					throw new BasicParser.ErrorObject("Number is too large or too small", sToken, iStartPos); // for a 64-bit double
				}
				addToken("number", sToken, iStartPos);
			} else if (isHexOrBin(sChar)) {
				sToken = sChar;
				sChar = advance();
				if (sChar.toLowerCase() === "x") { // binary?
					sToken += advanceWhile(isBin2);
					addToken("binnumber", sToken, iStartPos);
				} else { // hex
					if (sChar.toLowerCase() === "h") { // optional h
						sChar = advance();
					}
					if (isHex2(sChar)) {
						sToken += advanceWhile(isHex2);
						addToken("hexnumber", sToken, iStartPos);
					} else {
						throw new BasicParser.ErrorObject("Number expected", sToken, iStartPos);
					}
				}
			} else if (isQuotes(sChar)) {
				sChar = "";
				sToken = advanceWhile(isNotQuotes);
				if (!isQuotes(sChar)) {
					throw new BasicParser.ErrorObject("Unterminated string", sToken, iStartPos + 1);
				}
				sToken = sToken.replace(/\\/g, "\\\\"); // escape backslashes
				addToken("string", sToken, iStartPos + 1);
				sChar = advance();
			} else if (isIdentifierStart(sChar)) {
				sToken = sChar;
				sChar = advance();
				if (isIdentifierMiddle(sChar)) {
					sToken += advanceWhile(isIdentifierMiddle);
				}
				if (isIdentifierEnd(sChar)) {
					sToken += sChar;
					sChar = advance();
				}
				if (BasicParser.mKeywords[sToken.toLowerCase()]) {
					sToken = sToken.toLowerCase();
					if (sToken === "rem") { // ignore comment
						if (isNotNewLine(sChar)) {
							advanceWhile(isNotNewLine);
						}
					} else {
						addToken(sToken, 0, iStartPos);
					}
				} else {
					addToken("identifier", sToken, iStartPos);
				}
			} else if (isStream(sChar)) { // stream can be an expression
				addToken(sChar, 0, iStartPos);
				sChar = advance();
			} else if (isComparison(sChar)) {
				sToken = advanceWhile(isComparison2);
				addToken(sToken, 0, iStartPos); // like operator
			} else {
				throw new BasicParser.ErrorObject("Unrecognized token", sChar, iStartPos);
			}
		}
		addToken("(end)", 0, iIndex);
		return aTokens;
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
			oToken,

			fnEqualAsAssign = function () {
				oSymbols["="] = oSymbols["(=)"];
			},

			fnEqualAsComparison = function () {
				oSymbols["="] = oSymbols["(==)"];
			},

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
				var t, oSym;

				if (id && oToken.type !== id) {
					throw new BasicParser.ErrorObject("Expected", id, oToken.pos);
				}
				if (iIndex >= aTokens.length) {
					oToken = oSymbols["(end)"];
					return oToken;
				}
				t = aTokens[iIndex];
				iIndex += 1;
				oSym = oSymbols[t.type];

				if (!oSym) {
					Utils.console.error("parse: Undefined object: type=" + t.type + " t=%o", t);
					oSym = {}; // just to continue
				}
				oToken = Object.create(oSym);
				oToken.type = t.type;
				oToken.value = t.value;
				oToken.pos = t.pos;
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
						throw new BasicParser.ErrorObject("Unexpected token", t.type, aTokens[iIndex].pos);
					}
					left = t.led(left); // ...the led method is invoked on the following token (infix and suffix operators), can be recursive
				}
				return left;
			},

			statement = function () {
				var t = oToken,
					v;

				if (t.std) {
					advance();
					return t.std();
				}
				v = expression(0);
				if (v.type !== "assign" && v.type !== "call" && v.type !== "def" && v.type !== "(") {
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
				var t = oToken,
					h;

				advance("number");
				h = {
					type: "label",
					value: t.value,
					left: statements()
				};
				if (oToken.type === "(eol)") {
					advance("(eol)");
				}
				return h;
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

			fnGetArgs = function () {
				var aArgs = [];

				if (oToken.type !== ":" && oToken.type !== "(eol)" && oToken.type !== "(end)") {
					aArgs.push(expression(0));
					while (oToken.type === ",") {
						advance();
						aArgs.push(expression(0));
					}
				}
				return aArgs;
			},

			fnGetArgsInParenthesis = function () {
				var aArgs = [];

				if (oToken.type === "(") {
					if (aTokens[iIndex].type === ")") {
						advance("(");
					} else {
						do {
							advance();
							aArgs.push(expression(0));
						} while (oToken.type === ",");
						if (oToken.type !== ")") {
							throw new BasicParser.ErrorObject("Expected closing parenthesis for argument list after", aTokens[iIndex - 2].value, aTokens[iIndex - 1].pos);
						}
					}
					advance(")");
				}
				return aArgs;
			},

			fnCreateCmdCall = function (sName) {
				var oValue = {
					type: "call",
					args: null,
					name: sName || aTokens[iIndex - 2].type,
					pos: aTokens[iIndex - 2].pos
				};

				// TODO check parameter count here
				oValue.args = fnGetArgs();
				return oValue;
			},

			fnCreateFuncCall = function (sName) {
				var oValue = {
					type: "call",
					args: null,
					name: sName || aTokens[iIndex - 2].type,
					pos: aTokens[iIndex - 2].pos
				};

				oValue.args = fnGetArgsInParenthesis();
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

		symbol("break");
		symbol("else");
		symbol("step");
		symbol("then");
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
			var iParseIndex = iIndex,
				sName = oName.value,
				oValue;

			if (Utils.stringStartsWith(sName.toLowerCase(), "fn")) {
				if (oToken.type !== "(") { // Fnxxx name without ()?
					oValue = {
						type: "fn",
						args: [],
						name: sName,
						pos: aTokens[iParseIndex - 1].pos
					};
					return oValue;
				}
			}

			if (oToken.type === "(") {
				oValue = {
					type: "array",
					args: null,
					name: sName,
					pos: aTokens[iParseIndex - 1].pos
				};
				oValue.args = fnGetArgsInParenthesis();

				if (Utils.stringStartsWith(sName.toLowerCase(), "fn")) {
					oValue.type = "fn"; // FNxxx in e.g. print
				}
			} else {
				oValue = oName;
			}
			return oValue;
		});

		symbol("(", function () {
			var iParseIndex = iIndex,
				value = expression(0);

			if (oToken.type !== ")") {
				throw new BasicParser.ErrorObject("Expected closing parenthesis", ")", aTokens[iParseIndex].pos);
			}
			advance();
			return value;
		});

		symbol("[", function () {
			var t = oToken,
				iParseIndex = iIndex,
				oValue,
				aArgs = [];

			if (t.type === "(end)") {
				throw new BasicParser.ErrorObject("Unexpected end of file", "", t.pos);
			}
			if (aTokens[iIndex + 1].type === "]") {
				oValue = expression(0);
			} else {
				do {
					aArgs.push(expression(0));
					t = oToken;
				} while (t.type !== "]" && t.type !== "(end)");
				if (t.type !== "]") {
					throw new BasicParser.ErrorObject("Expected closing bracket", "]", aTokens[iParseIndex].pos);
				}
				oValue = {
					type: "call",
					args: aArgs,
					name: "concat",
					pos: aTokens[iParseIndex - 1].pos
				};
			}
			advance();
			return oValue;
		});

		infix("^", 90, 80);

		prefix("-", 80);

		infix("*", 70);
		infix("/", 70);

		infix("\\", 60);

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

		infixr("=", 30); // equal for comparison, will be overwritten
		oSymbols["(==)"] = oSymbols["="];
		delete oSymbols["="];

		infix("=", 10, 20, function (left) {
			var oObj;

			if (oSymbols["="] === oSymbols["(=)"]) {
				if (left.type === "call") { // TODO: only in DEF FN context!
					oObj = {
						type: "def",
						name: left.name,
						args: left.args,
						value: expression(0),
						pos: left.pos
					};
				} else if (left.type === "identifier") {
					oObj = {
						type: "assign",
						name: left.value,
						value: expression(0),
						pos: left.pos
					};
				} else if (left.type === "array") {
					oObj = {
						type: "assign",
						name: left.name,
						args: left.args,
						value: expression(0),
						pos: left.pos
					};
				} else {
					oObj = aTokens[iIndex - 1]; // or this
					throw new BasicParser.ErrorObject("Invalid lvalue at", oObj.type, oObj.pos);
				}
			} else { // equal used as comparison
				oObj = { // default infix method
					type: "=", // comparison
					left: left,
					right: expression(0),
					pos: left.pos
				};
			}
			return oObj;
		});
		oSymbols["(=)"] = oSymbols["="];

		stmt("def", function () {
			var oValue = {
				type: "def",
				args: [],
				pos: aTokens[iIndex - 1].pos
			};

			if ((oToken.type !== "identifier") || !Utils.stringStartsWith(oToken.value.toLowerCase(), "fn")) {
				throw new BasicParser.ErrorObject("Invalid def at", oToken.type, oToken.pos);
			}
			oValue.name = oToken.value;
			advance();

			oValue.args = fnGetArgsInParenthesis();
			advance("=");

			oValue.value = expression(0);
			return oValue;
		});

		stmt("for", function () {
			var oValue = {
				type: "for"
			};

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

		stmt("frame", function () {
			var oValue = {
				type: "frame"
			};

			return oValue;
		});

		stmt("gosub", function () {
			var oValue = {
				type: "gosub"
			};

			oValue.left = expression(0);

			return oValue;
		});

		stmt("if", function () {
			var oValue = {
				type: "if"
			};

			fnEqualAsComparison();
			oValue.left = expression(0);
			fnEqualAsAssign();
			advance("then");
			oValue.right = statements("else");
			if (oToken.type === "else") {
				advance("else");
				oValue.third = oToken.type === "if" ? statement() : statements();
			} else {
				oValue.third = null;
			}
			return oValue;
		});

		stmt("input", function () {
			var oValue = {
					type: "call",
					name: "input",
					args: [],
					pos: aTokens[iIndex - 1].pos
				},
				sText = "";

			if (oToken.type === ";") { // no newline?
				advance(";");
			} else {
				sText = "\\n";
			}

			if (oToken.type === "string") {
				sText += oToken.value;
				advance();
				if (oToken.type === ";") { // ";" => append "?"
					sText += "?";
					advance();
				} else if (oToken.type === ",") {
					advance();
				} else {
					throw new BasicParser.ErrorObject("Expected ; or , at", oToken.type, oToken.pos);
				}
			}

			oValue.args.push({
				type: "string",
				value: sText
			});

			do {
				if (oToken.type !== "identifier") {
					throw new BasicParser.ErrorObject("Extected identifier at", oToken.type, oToken.pos);
				}
				oValue.args.push({
					type: "identifier",
					value: oToken.value
				});
				advance();
			} while ((oToken.type === ",") && advance());
			return oValue;
		});

		stmt("next", function () {
			var oValue = {
				type: "next",
				args: []
			};

			while (oToken.type === "identifier") {
				oValue.args.push({
					type: "identifier",
					value: oToken.value
				});
				advance();
				if (oToken.type === ",") {
					advance();
				}
			}
			return oValue;
		});

		stmt("on", function () {
			var oValue = {
				type: "on",
				args: null,
				pos: iIndex - 1
			};

			/*
			if (oToken.type === "break") {
				advance("break");
				oValue.Type = "onBreak"; // cont, gosub..., stop
				if (oToken.type === "gosub") {
					// TODO
				}
			}
			*/

			// TODO
			oValue.left = expression(0);
			if (oToken.type === "gosub") {
				advance("gosub");
				oValue.name = "onGosub";
				oValue.args = fnGetArgs();
			} else if (oToken.type === "goto") {
				advance("goto");
				oValue.name = "onGoto";
				oValue.args = fnGetArgs();
			} else {
				/*
				oValue = {
					type: "on", //TTT
					left: oLeft
				};
				*/
			}

			return oValue;
		});

		stmt("print", function () {
			var aArgs = [],
				oValue,
				iParseIndex = iIndex,
				bTrailingSemicolon = false,
				reFormat = /!|&|\\ *\\|#+\.?#*[+-]?/,
				t, aFormat;

			while (oToken.type !== ":" && oToken.type !== "(eol)" && oToken.type !== "(end)") {
				if (oToken.type === "using") {
					advance("using");
					t = expression(0); // format
					aFormat = t.value.split(reFormat);
					aFormat.shift(); // remove one arg
					oValue = {
						type: "call",
						name: "using",
						args: [t]
					};

					// get number of parameters depending on format
					while (aFormat.length) {
						aFormat.shift();
						if (oToken.type === ";") {
							advance(";");
						}
						t = expression(0); // value
						oValue.args.push(t);
					}
					aArgs.push(oValue);
				} else if (BasicParser.mKeywords[oToken.type] && BasicParser.mKeywords[oToken.type].charAt(0) !== "f") { // stop also at keyword which is not a function
					break;
				} else if (oToken.type === ";") {
					advance(";");
				} else if (oToken.type === ",") { // default tab, simulate tab...
					aArgs.push({
						type: "call",
						args: [], // special: we use no args to get tab with current zone
						name: "tab",
						pos: aTokens[iParseIndex - 2].pos
					});
					advance(",");
				} else {
					t = expression(0);
					aArgs.push(t);
					//bTrailingSemicolon = (oToken.type === ";");
				}
			}

			bTrailingSemicolon = (aTokens[iIndex - 2].type === ";"); //TTT
			if (!bTrailingSemicolon) {
				aArgs.push({
					type: "string",
					value: "\\n"
				});
			}
			return {
				type: "call",
				args: aArgs,
				name: "print",
				pos: aTokens[iParseIndex - 2].pos
			};
		});

		oSymbols["?"] = oSymbols.print; // ? is same as print

		stmt("stop", function () {
			var oValue = {
				type: "stop"
			};

			return oValue;
		});

		stmt("wend", function () {
			var oValue = {
				type: "wend"
			};

			return oValue;
		});

		stmt("while", function () {
			var oValue = {
				type: "while"
			};

			fnEqualAsComparison();
			oValue.left = expression(0);
			fnEqualAsAssign();

			return oValue;
		});

		// line
		iIndex = 0;
		fnEqualAsAssign();
		advance();
		while (oToken.type !== "(end)") {
			aParseTree.push(line());
		}
		return aParseTree;
	},


	//
	// evaluate
	//
	evaluate: function (parseTree, variables, functions) {
		var that = this,
			sOutput = "",
			mOperators = {
				"+": function (a, b) {
					return a + " + " + b;
				},
				"-": function (a, b) {
					if (b === undefined) {
						return "-" + a;
					}
					return a + " - " + b;
				},
				"*": function (a, b) {
					return a + " * " + b;
				},
				"/": function (a, b) {
					return a + " / " + b;
				},
				"^": function (a, b) {
					return "Math.pow(" + a + " , " + b + ")";
				},
				and: function (a, b) {
					return a + " & " + b;
				},
				or: function (a, b) {
					return a + " | " + b;
				},
				xor: function (a, b) {
					return a + " ^ " + b;
				},
				not: function (a) {
					return "!" + a;
				},
				mod: function (a, b) {
					return a + " % " + b;
				},
				">": function (a, b) {
					return a + " > " + b;
				},
				"<": function (a, b) {
					return a + " < " + b;
				},
				">=": function (a, b) {
					return a + " >= " + b;
				},
				"<=": function (a, b) {
					return a + " <= " + b;
				},
				"=": function (a, b) {
					return a + " === " + b;
				},
				"<>": function (a, b) {
					return a + " !== " + b;
				},
				"#": function (a) {
					return a; // stream
				}
			},

			mFunctions = Object.assign({}, functions), // create copy of predefined functions so that they can be redefined

			checkArgs = function (name, aArgs, iPos) {
				var oFunction = mFunctions[name],
					sFunction, sFirstLine, aMatch, iMin;

				if (oFunction.length !== aArgs.length) {
					sFunction = String(oFunction);
					sFirstLine = sFunction.split("\n", 1)[0];
					if (sFirstLine.indexOf("function () { // varargs") === 0) {
						return; // no check for functions with varargs comment
					}
					aMatch = sFirstLine.match(/{ \/\/ optional args (\d+)/);
					if (aMatch) {
						if (aMatch[1]) {
							iMin = oFunction.length - Number(aMatch[1]);
							if (aArgs.length >= iMin && aArgs.length <= oFunction.length) {
								return;
							}
						}
					}
					throw new BasicParser.ErrorObject("Wrong number of arguments for function", name, iPos);
				}
			},

			fnAdaptVariableName = function (sName, iArrayIndices) {
				sName = sName.toLowerCase();
				if (Utils.stringEndsWith(sName, "!")) { // real number?
					sName = sName.slice(0, -1) + "R"; // "!" => "R"
				} else if (Utils.stringEndsWith(sName, "%")) { // integer number?
					sName = sName.slice(0, -1) + "I";
				}
				if (iArrayIndices) {
					sName += "A".repeat(iArrayIndices);
				}
				return sName;
			},

			/*
			fnCreateNDimArray = function (length) {
				var arr = new Array(length || 0),
					i = length,
					args;

				if (arguments.length > 1) {
					args = Array.prototype.slice.call(arguments, 1);
					while (i) {
						i -= 1;
						arr[length - 1 - i] = fnCreateNDimArray.apply(this, args);
					}
				}
				return arr;
			},
			*/

			fnGetVarDefault = function (sName) {
				var iArrayIndices = sName.split("A").length - 1,
					bIsString = sName.includes("$"),
					value, aValue, i;

				value = bIsString ? "" : 0;
				if (iArrayIndices) {
					aValue = [];
					for (i = 0; i < 10; i += 1) {
						aValue.push(value);
					}
					value = aValue;
				}
				return value;
			},

			fnParseArgs = function (aArgs) {
				var aNodeArgs = [], // do not modify node.args here (could be a parameter of defined function)
					i;

				for (i = 0; i < aArgs.length; i += 1) {
					aNodeArgs[i] = parseNode(aArgs[i]);
				}
				return aNodeArgs;
			},

			fnParseIf = function (node) {
				var aNodeArgs, sLabel, value, sPart;

				sLabel = "i" + that.iIfCount;
				that.iIfCount += 1;

				value = "if (" + parseNode(node.left) + ') { o.goto("' + sLabel + '"); break; } ';
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

				/*
				aNodeArgs = fnParseArgs(node.right);
				value = "if (" + parseNode(node.left) + ") { " + aNodeArgs.join(";") + "; }";
				if (node.third) {
					aNodeArgs = fnParseArgs(node.third);
					value += " else { " + aNodeArgs.join(";") + "; }";
				}
				*/
				return value;
			},

			fnParseFor = function (node) {
				var sVarName, sLabel, value, value2, sStepName;

				sVarName = fnAdaptVariableName(node.left.name);
				sLabel = "f" + that.iForCount;
				that.oStack.f.push(that.iForCount);
				that.iForCount += 1;

				sStepName = sVarName + "Step";
				variables[sStepName] = 0; //TTT

				//value = "/* for() */ " + parseNode(node.left) + "; var " + sVarName + "Step = " + parseNode(node.third) + "; o.goto(\"" + sLabel + "b\"); break;";
				value = "/* for() */ " + parseNode(node.left) + "; " + sVarName + "Step = " + parseNode(node.third) + "; o.goto(\"" + sLabel + "b\"); break;";
				value += "\ncase \"" + sLabel + "\": ";

				value += sVarName + " += " + sVarName + "Step;";
				value += "\ncase \"" + sLabel + "b\": ";
				value2 = parseNode(node.right);
				value += "if (" + sVarName + "Step > 0 && " + sVarName + " > " + value2 + " || " + sVarName + "Step < 0 && " + sVarName + " < " + value2 + ") { o.goto(\"" + sLabel + "e\"); break; }";
				return value;
			},

			fnParseOn = function (node) {
				var aNodeArgs, i, sName, sLabel, value;

				aNodeArgs = fnParseArgs(node.args);
				i = parseNode(node.left);
				aNodeArgs.unshift(i);
				sName = node.name;
				//value = "o." + sName + "(" + aNodeArgs.join(", ") + ")";
				//value = "/* on(" + i + ") */  o." + sName + "(" + aNodeArgs.join(", ") + ")";
				if (sName === "onGosub") {
					sLabel = "g" + that.iGosubCount;
					that.iGosubCount += 1;
					aNodeArgs.unshift('"' + sLabel + '"');
					value = "o." + sName + "(" + aNodeArgs.join(", ") + '); break; \ncase "' + sLabel + '":';
				} else if (sName === "onGoto") {
					value = "o." + sName + "(" + aNodeArgs.join(", ") + "); break";
				} else { //TODO
					value = "/* on(" + i + ") */  o." + sName + "(" + aNodeArgs.join(", ") + ")";
				}
				return value;
			},

			parseNode = function (node) { // eslint-disable-line complexity
				var i, value, value2, sName, aNodeArgs;

				if (Utils.debug > 3) {
					Utils.console.debug("evaluate: parseNode node=%o type=" + node.type + " name=" + node.name + " value=" + node.value + " left=%o right=%o args=%o", node, node.left, node.right, node.args);
				}
				switch (node.type) {
				case "number":
					value = node.value;
					break;
				case "string":
					value = '"' + node.value + '"';
					break;
				case "binnumber":
					value = node.value.slice(2);
					value = "0b" + ((value.length) ? value : "0"); // &x->0b; 0b is ES6
					break;
				case "hexnumber":
					value = node.value.slice(1);
					value = "0x" + ((value.length) ? value : "0"); // &->0x
					break;
				case "identifier":
					value = fnAdaptVariableName(node.value); // here we use node.value
					variables[value] = fnGetVarDefault(value); //Utils.stringEndsWith(value, "$") ? "" : 0;
					break;
				case "array":
					aNodeArgs = fnParseArgs(node.args);
					sName = fnAdaptVariableName(node.name, aNodeArgs.length);
					//value = sName + "[" + aNodeArgs.join(", ") + "]";
					value = sName + aNodeArgs.map(function (val) {
						return "[" + val + "]";
					}).join("");
					break;
				case "assign":
					if (node.args) { // array?
						aNodeArgs = fnParseArgs(node.args);
						sName = fnAdaptVariableName(node.name, aNodeArgs.length);
						//value = "[" + aNodeArgs.join(", ") + "]";
						value = aNodeArgs.map(function (val) {
							return "[" + val + "]";
						}).join("");
					} else {
						sName = fnAdaptVariableName(node.name);
						value = "";
					}

					value = sName + value + " = " + parseNode(node.value);
					variables[sName] = fnGetVarDefault(sName); //Utils.stringEndsWith(sName, "$") ? "" : 0;
					break;
				case "call":
					aNodeArgs = fnParseArgs(node.args);
					sName = node.name;
					if (mFunctions[sName] === undefined) {
						if (Utils.debug > 1) {
							Utils.console.debug("NOTE: Generating default call for function ", sName, " pos ", node.pos);
						}
						value = "o." + sName + "(" + aNodeArgs.join(", ") + ")";
					} else {
						checkArgs(sName, aNodeArgs, node.pos);
						value = mFunctions[sName].apply(node, aNodeArgs);
					}
					break;
				case "def":
					aNodeArgs = fnParseArgs(node.args);
					sName = fnAdaptVariableName(node.name);
					//value = "var " + sName + " = function (" + aNodeArgs.join(", ") + ") { return " + parseNode(node.value) + "; };";
					value = sName + " = function (" + aNodeArgs.join(", ") + ") { return " + parseNode(node.value) + "; };";
					variables[sName] = 0; //TTT
					break;
				case "fn": // FNxxx function call
					aNodeArgs = fnParseArgs(node.args);
					sName = fnAdaptVariableName(node.name);
					value = sName + "(" + aNodeArgs.join(", ") + ")";
					break;
				case "for":
					value = fnParseFor(node);
					break;
				case "frame": //TTT
					sName = "s" + that.iStopCount; // use also stopcount for frame? TTT
					that.iStopCount += 1;
					value = "o.frame(); o.goto(\"" + sName + "\"); break;\ncase \"" + sName + "\":";
					break;
				case "gosub":
					sName = "g" + that.iGosubCount;
					that.iGosubCount += 1;
					value = 'o.gosub("' + sName + '", ' + parseNode(node.left) + '); break; \ncase "' + sName + '":';
					break;
				case "if":
					value = fnParseIf(node);
					break;
				case "label":
					aNodeArgs = fnParseArgs(node.left);
					value = "case " + node.value + ":";
					for (i = 0; i < aNodeArgs.length; i += 1) {
						value += " " + aNodeArgs[i];
						if (!(/[}:;]$/).test(value)) { // does not end with "}" ":" ";"
							value += ";";
						}
					}
					break;
				case "next":
					i = that.oStack.f.pop();
					sName = "f" + i;
					value = "/* next() */ o.goto(\"" + sName + "\"); break;\ncase \"" + sName + "e\":";
					break;
				case "on":
					value = fnParseOn(node);
					break;
				case "return":
					value = "o.return(); break;";
					break;
				case "stop": //TTT
					sName = "s" + that.iStopCount;
					that.iStopCount += 1;
					value = "o.stop(\"" + sName + "\"); break;\ncase \"" + sName + "\":";
					break;
				case "wend":
					i = that.oStack.w.pop();
					sName = "w" + i;
					value = "/* o.wend() */ o.goto(\"" + sName + "\"); break;\ncase \"" + sName + "e\":";
					break;
				case "while":
					sName = "w" + that.iWhileCount;
					value = "\ncase \"" + sName + "\": if (!(" + parseNode(node.left) + ")) { o.goto(\"" + sName + "e\"); break; }";
					that.oStack.w.push(that.iWhileCount);
					that.iWhileCount += 1;
					break;
				default:
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
					} else {
						Utils.console.error("parseNode node=%o unknown type=" + node.type, node);
						value = node;
					}
				}
				return value;
			},

			i,
			sNode;

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
	},

	fnVariables: function (oVariables, bSetInFunc) {
		var sVars = "",
			aVariables, aVmVariables;

		aVariables = Object.keys(oVariables);
		if (aVariables.length) {
			aVmVariables = aVariables.map(function (key) {
				return key + ": o.v." + key;
			});

			if (bSetInFunc) {
				sVars = "var {" + aVariables.join(", ") + "} = o.v;\n";
				//  ??? ({ a, b } = { a: v.a, b: v.b })
			} else {
				sVars = "({" + aVmVariables.join(", ") + "} = {" + aVariables.join(", ") + "});\n";
			}
		}

		return sVars;
	},

	calculate: function (input, variables) {
		var mFunctions = {
				defint: function () { // varargs
					var	aArgs = [],
						sName, i;

					/*
					for (i = 0; i < arguments.length; i += 1) {
						if (s !== "") {
							s += "; ";
						}
						s += "o.defint(" + String(arguments[i]) + ")";
					}
					*/
					for (i = 0; i < arguments.length; i += 1) {
						sName = arguments[i];
						aArgs.push("o.defint(\"" + sName + "\")");
					}
					return aArgs.join("; ");
				},
				dim: function () { // varargs
					var	aArgs = [],
						sName, aName, sName2, iBracket, i;

					/*
					for (i = 0; i < arguments.length; i += 1) {
						if (s !== "") {
							s += "; ";
						}
						s += "o.dim(" + String(arguments[i]) + ")";
					}
					*/
					for (i = 0; i < arguments.length; i += 1) {
						sName = arguments[i];
						aName = sName.split(/\[|\]\[|\]/);
						aName.pop(); // remove empty last element
						sName = aName.shift();

						/*
						iBracket = sName.indexOf("[");
						if (iBracket >= 0) {
							sName2 = sName.substring(0, iBracket); // without brackets
						}
						*/
						//aArgs.push("o.dim(\"" + sName + "\"); var " + sName2 + " = []");
						//aArgs.push("o.dim(\"" + sName + "\")");
						//aArgs.push("o.dim(" + aName.join(", ") + ")");
						aArgs.push(sName + " = o.dim(" + aName.join(", ") + ")");
					}
					return aArgs.join("; ");
				},
				end: function () {
					//Utils.console.log("end");
					//return "o.end(); break"; // TODO: how to allow cont?
					return "o.stop(\"end\"); break"; // end same as stop
				},

				/*
				gosub: function (n) {
					return "o.gosub(" + n + "); break";
				},
				*/
				error: function (n) {
					return "o.error(" + n + "); break";
				},

				"goto": function (n) {
					return "o.goto(" + n + "); break";
				},

				input: function () { // varargs
					var s = "",
						i, sMsg;

					sMsg = arguments[0];
					for (i = 1; i < arguments.length; i += 1) {
						if (s !== "") {
							s += "; ";
						}
						s += "var " + arguments[i] + " = o.input(" + sMsg + ", \"" + arguments[i] + "\")";
					}
					return s;
				},
				next: function () { // varargs
					var	s = "",
						i;

					for (i = 0; i < arguments.length; i += 1) {
						if (s !== "") {
							s += ";";
						}
						s += "o.next(" + String(arguments[i]) + ")";
					}
					return s;
				},
				"return": function () {
					return "o.return(); break";
				}
				/*
				stop: function () {
					return "o.stop(); break";
				}
				*/
			},
			oOut = {
				text: ""
			},
			aTokens, aParseTree, sOutput;

		try {
			aTokens = this.lex(input);
			aParseTree = this.parse(aTokens);
			sOutput = this.evaluate(aParseTree, variables, mFunctions);
			oOut.text = this.fnVariables(variables, true);
			oOut.text += "while (o.vmLoopCondition()) {\nswitch (o.iLine) {\ncase 0:\n" + sOutput + "\ncase \"end\": o.vmStop(\"end\", 90); break;\ndefault: o.error(8); o.goto(\"end\"); break;\n}}\n";
			oOut.text += this.fnVariables(variables, false);
		} catch (e) {
			oOut.error = e;
		}
		return oOut;
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
