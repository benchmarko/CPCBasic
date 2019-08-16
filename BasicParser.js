// BasicParser.js - PArse Locomotive BASIC 1.1 for Amstrad CPC 6128
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
// http://www.csidata.com/custserv/onlinehelp/vbsdocs/vbs232.htm  (operator precedence) ??
//
// How to write a simple interpreter in JavaScript
// Peter_Olson, 30 Oct 2014
function BasicParser(options) {
	this.init(options);
}

BasicParser.mKeywords = { // c=command, f=function, o=operator
	abs: "f",
	after: "c",
	and: "o",
	asc: "f",
	atn: "f",
	auto: "c",
	bin$: "f",
	border: "c",
	call: "c",
	cat: "c",
	chain: "c",
	chr$: "f",
	cint: "f",
	clear: "c",
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
	"else": "c",
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
	fn: "c", // def fn??? TTT
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
	step: "c", // for ... to ... step
	stop: "c",
	str$: "f",
	string$: "f",
	swap: "c", // window swap
	symbol: "c", // symbol, symbol after
	tab: "f",
	tag: "c",
	tagoff: "c",
	tan: "f",
	test: "f",
	testr: "f",
	then: "c", // if...then
	time: "f",
	to: "c", // for...to
	troff: "c",
	tron: "c",
	unt: "f",
	upper$: "f",
	using: "c", // print using
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
	ypos: "d",
	zone: "c"
};

BasicParser.prototype = {
	init: function (options) {
		this.options = options || {}; // ignoreFuncCase, ignoreVarCase
	},
	iForIndex: 0,
	iWhileIndex: 0,

	lex: function (input) {
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
			isHexOrBin = function (c) {
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
			advanceWhileEscape = function (fn) {
				var sToken2 = "";

				do {
					if (sChar === "\\") {
						sChar = advance();
						if (sChar === "n") {
							sChar = "\n";
						}
					}
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
				} else if (isHex2(sChar)) { // hex
					sToken += advanceWhile(isHex2);
					addToken("hexnumber", sToken, iStartPos);
				} else {
					throw new BasicParser.ErrorObject("Number expected", sToken, iStartPos);
				}
			} else if (isQuotes(sChar)) {
				sChar = "";
				sToken = advanceWhileEscape(isNotQuotes);
				if (!isQuotes(sChar)) {
					throw new BasicParser.ErrorObject("Unterminated string", sToken, iStartPos + 1);
				}
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
			fnCreateCall = function (sName, iCount) {
				var aArgs = [],
					iParseIndex = iIndex;

				if (iCount) {
					aArgs.push(expression(0));
					while (oToken.type === ",") {
						advance();
						aArgs.push(expression(0));
					}
				}
				return {
					type: "call",
					args: aArgs,
					name: sName,
					pos: aTokens[iParseIndex - 2].pos
				};
			};

		symbol(":");
		symbol(";");
		symbol(",");
		symbol(")");
		symbol("]");

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
				aArgs = [],
				sName = oName.value,
				oValue;
				/*
				fnCollectArgs = function () {
					while (oToken.type === ",") {
						advance(",");
						aArgs.push(expression(0));
					}
					return {
						type: "call",
						args: aArgs,
						name: oName.value,
						pos: aTokens[iParseIndex - 1].pos
					};
				};
				*/

			if (Utils.stringStartsWith(sName.toLowerCase(), "fn")) {
				if (oToken.type !== "(") { // Fnxxx name without ()?
					oValue = {
						type: "function",
						args: [],
						name: sName,
						pos: aTokens[iParseIndex - 1].pos
					};
					return oValue;
				}
			}

			if (oToken.type === "(") {
				if (aTokens[iIndex].type === ")") {
					advance();
				} else {
					do {
						advance();
						aArgs.push(expression(0));
					} while (oToken.type === ",");
					if (oToken.type !== ")") {
						throw new BasicParser.ErrorObject("Expected closing parenthesis for array or function call", aTokens[iParseIndex - 1].value, aTokens[iParseIndex].pos);
					}
				}
				advance();
				oValue = {
					type: "array",
					args: aArgs,
					name: sName,
					pos: aTokens[iParseIndex - 1].pos
				};
				if (Utils.stringStartsWith(sName.toLowerCase(), "fn")) {
					oValue.type = "function"; // FNxxx in e.g. print
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

		symbol("fix", function () {
			return fnCreateCall("fix", 1);
		});

		symbol("hex$", function () { // 1 or 2
			return fnCreateCall("hex$", 2);
		});

		symbol("inkey$", function () {
			return fnCreateCall("inkey$", 0);
		});

		symbol("int", function () {
			return fnCreateCall("int", 1);
		});

		symbol("rnd", function () {
			return fnCreateCall("rnd", 1); // 0 or 1 parameters
		});

		symbol("space$", function () {
			return fnCreateCall("space$", 1);
		});

		symbol("str$", function () {
			return fnCreateCall("str$", 1);
		});

		symbol("tab", function () {
			return fnCreateCall("tab", 1);
		});

		symbol("time", function () {
			return fnCreateCall("time", 0);
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
						right: expression(0),
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

		stmt("call", function () {
			return fnCreateCall("call", 1);
		});

		stmt("clear", function () {
			return fnCreateCall("clear", 0);
		});

		stmt("cls", function () { // 0 or 1 parameters
			var iCount = 0;

			if (oToken.type === "#") { // stream
				iCount = 1;
			}
			return fnCreateCall("cls", iCount);
		});

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

			if (oToken.type === "(") { // args?
				advance("(");
				oValue.args.push(expression(0));
				while (oToken.type === ",") {
					advance(",");
					oValue.args.push(expression(0));
				}
				advance(")");
			}
			advance("=");

			oValue.value = expression(0);
			return oValue;
		});

		stmt("defint", function () {
			return fnCreateCall("defint", 999);
		});

		stmt("dim", function () {
			return fnCreateCall("dim", 999);
		});

		stmt("end", function () {
			return fnCreateCall("end", 0);
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

		stmt("gosub", function () {
			return fnCreateCall("gosub", 1);
		});

		stmt("goto", function () {
			return fnCreateCall("goto", 1);
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

		stmt("locate", function () { // 2 or 3 parameters
			var iCount = 2;

			if (oToken.type === "#") { // stream
				iCount = 3;
			}
			return fnCreateCall("locate", iCount);
		});

		stmt("mode", function () {
			return fnCreateCall("mode", 1);
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
				type: "on"
			};

			if (oToken.type === "break") {
				advance("break");
				oValue.Type = "onBreak"; // cont, gosub..., stop
				if (oToken.type === "gosub") {
					// TODO
				}
			}
			// TODO
			oValue.left = expression(0);
			if (oToken.type === "gosub") {
				advance("gosub");
				oValue.value = fnCreateCall("gosub", 1);
			}

			return oValue;
		});

		stmt("print", function () {
			var aArgs = [],
				oValue,
				iParseIndex = iIndex,
				bTrailingSemicolon = false,
				t;

			while (oToken.type !== ":" && oToken.type !== "(eol)" && oToken.type !== "(end)") {
				if (oToken.type === "using") {
					advance("using");
					t = expression(0); // format
					oValue = {
						type: "call",
						name: "using",
						args: [t]
					};
					if (oToken.type === ";") {
						advance();
					}
					t = expression(0); // value
					oValue.args.push(t);

					aArgs.push(oValue);
				} else if (BasicParser.mKeywords[oToken.type] && BasicParser.mKeywords[oToken.type] !== "f") { // stop also at keyword which is not a function
					break;
				} else if (oToken.type === ";") {
					advance();
				} else if (oToken.type === ",") { // default tab, simulate tab...
					aArgs.push({
						type: "call",
						args: [
							{
								type: "number",
								value: -2
							}
						],
						name: "tab",
						pos: aTokens[iParseIndex - 2].pos
					});
					advance();
				} else {
					t = expression(0);
					aArgs.push(t);
					bTrailingSemicolon = (oToken.type === ";");
				}
			}

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

		stmt("randomize", function () { // 0 or 1 parameters
			return fnCreateCall("randomize", 1);
		});

		stmt("return", function () {
			return fnCreateCall("return", 0);
		});

		stmt("stop", function () {
			return fnCreateCall("stop", 0);
		});

		stmt("wait", function () {
			return fnCreateCall("wait", 3); // 2 or 3 parameters
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
					return a + " == " + b;
				},
				"<>": function (a, b) {
					return a + " != " + b;
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

			fnAdaptVariableName = function (sName) {
				sName = sName.toLowerCase();
				if (Utils.stringEndsWith(sName, "!")) { // real number?
					sName = sName.slice(0, -1) + "R"; // "!" => "R"
				} else if (Utils.stringEndsWith(sName, "%")) { // integer number?
					sName = sName.slice(0, -1) + "I";
				}
				return sName;
			},

			parseNode = function (node) {
				var i, value, value2, sName, aNodeArgs;

				if (Utils.debug > 3) {
					Utils.console.debug("evaluate: parseNode node=%o type=" + node.type + " name=" + node.name + " value=" + node.value + " left=%o right=%o args=%o", node, node.left, node.right, node.args);
				}
				if (node.type === "number") {
					value = node.value;
				} else if (node.type === "string") {
					value = '"' + node.value + '"';
				} else if (node.type === "binnumber") {
					value = node.value.slice(2);
					value = "0b" + ((value.length) ? value : "0"); // &x->0b; 0b is ES6
				} else if (node.type === "hexnumber") {
					value = node.value.slice(1);
					value = "0x" + ((value.length) ? value : "0"); // &->0x
				} else if (mOperators[node.type]) {
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
				} else if (node.type === "identifier") {
					sName = fnAdaptVariableName(node.value); // here we use node.value
					value = sName;
				} else if (node.type === "array") {
					aNodeArgs = [];
					for (i = 0; i < node.args.length; i += 1) {
						aNodeArgs[i] = parseNode(node.args[i]);
					}
					sName = fnAdaptVariableName(node.name);
					value = sName + "[" + aNodeArgs.join(", ") + "]";
				} else if (node.type === "assign") {
					if (node.args) { // array?
						value = "";
						for (i = 0; i < node.args.length; i += 1) {
							value += parseNode(node.args[i]) + ",";
						}
					} else {
						value = parseNode(node.value);
					}
					sName = fnAdaptVariableName(node.name);
					value = "var " + sName + " = " + value;
				} else if (node.type === "call") {
					aNodeArgs = []; // do not modify node.args here (could be a parameter of defined function)
					for (i = 0; i < node.args.length; i += 1) {
						aNodeArgs[i] = parseNode(node.args[i]);
					}
					sName = node.name;
					if (mFunctions[sName] === undefined) {
						throw new BasicParser.ErrorObject("Function is undefined", sName, node.pos);
					}
					checkArgs(sName, aNodeArgs, node.pos);
					value = mFunctions[sName].apply(node, aNodeArgs);
				} else if (node.type === "def") {
					aNodeArgs = []; // do not modify node.args here (could be a parameter of defined function)
					for (i = 0; i < node.args.length; i += 1) {
						aNodeArgs[i] = parseNode(node.args[i]);
					}
					sName = fnAdaptVariableName(node.name);
					value = "var " + sName + " = function (" + aNodeArgs.join(", ") + ") { return " + parseNode(node.value) + "; };";
				} else if (node.type === "function") { // FNxxx function call
					aNodeArgs = [];
					for (i = 0; i < node.args.length; i += 1) {
						aNodeArgs[i] = parseNode(node.args[i]);
					}
					sName = fnAdaptVariableName(node.name);
					value = sName + "(" + aNodeArgs.join(", ") + ")";
				} else if (node.type === "for") {
					sName = "f" + that.iForIndex;
					value = "/* for() */ " + parseNode(node.left) + "; var " + node.left.name + "Step = " + parseNode(node.third) + "; o.goto(\"" + sName + "a2\"); break;";
					value += "\ncase \"" + sName + "\": ";

					value += node.left.name + " += " + node.left.name + "Step;";
					value += "\ncase \"" + sName + "a2\": ";
					value2 = parseNode(node.right);
					value += "if (" + node.left.name + "Step > 0 && " + node.left.name + " > " + value2 + " || " + node.left.name + "Step < 0 && " + node.left.name + " < " + value2 + ") { o.goto(\"" + sName + "e\"); break; }";
					that.iForIndex += 1;
				} else if (node.type === "label") {
					value = "case " + node.value + ":";
					for (i = 0; i < node.left.length; i += 1) {
						value += " " + parseNode(node.left[i]);
						if (!Utils.stringEndsWith(value, "}") && !Utils.stringEndsWith(value, ":") && !Utils.stringEndsWith(value, ";")) {
							value += ";";
						}
					}
				} else if (node.type === "if") { // statement
					value = "if (" + parseNode(node.left) + ") { ";
					for (i = 0; i < node.right.length; i += 1) {
						value += parseNode(node.right[i]) + ";";
					}
					value += " }";
					if (node.third) {
						value += " else { ";
						for (i = 0; i < node.third.length; i += 1) {
							value += parseNode(node.third[i]) + ";";
						}
						value += " }";
					}
				} else if (node.type === "next") {
					that.iForIndex -= 1;
					sName = "f" + that.iForIndex;
					value = "/* next() */ o.goto(\"" + sName + "\"); break;\ncase \"" + sName + "e\":";
				} else if (node.type === "on") {
					Utils.console.log("on"); // TODO
					value = " /* on(" + "" + ") */ "; //TTT
				} else if (node.type === "wend") {
					that.iWhileIndex -= 1;
					sName = "w" + that.iWhileIndex;
					value = "/* o.wend() */ o.goto(\"" + sName + "\"); break;\ncase \"" + sName + "e\":";
				} else if (node.type === "while") {
					sName = "w" + that.iWhileIndex;
					value = "\ncase \"" + sName + "\": if (!(" + parseNode(node.left) + ")) { o.goto(\"" + sName + "e\"); break; }";
					that.iWhileIndex += 1;

				/*
				} else if (node.type === "goto") { // statement
					value = "o.iLine = " + parseNode(node.left) + "; break"; //TTT
				*/
				} else {
					Utils.console.error("parseNode node=%o unknown type=" + node.type, node);
					value = node;
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
	calculate: function (input, variables) {
		var mFunctions = {
				call: function (n) {
					return "o.call(" + n + ")";
				},
				clear: function () {
					Utils.console.log("clear");
					return "o.clear()";
				},
				cls: function (iStream) { // optional args 1: iStream
					iStream = iStream || 0;
					return "o.cls(" + iStream + ")";
				},
				defint: function () { // varargs
					var	s = "",
						i;

					for (i = 0; i < arguments.length; i += 1) {
						if (s !== "") {
							s += "; ";
						}
						s += "o.defint(" + String(arguments[i]) + ")";
					}
					return s;
				},
				dim: function () { // varargs
					var	s = "",
						i;

					for (i = 0; i < arguments.length; i += 1) {
						if (s !== "") {
							s += "; ";
						}
						s += "o.dim(" + String(arguments[i]) + ")";
					}
					return s;
				},
				end: function () {
					Utils.console.log("end");
					return "o.end(); break"; // TODO: how to allow cont?
				},
				fix: function (x) {
					return "Math.trunc(" + x + ")"; // (ES6: Math.trunc)
				},
				gosub: function (n) {
					return "o.gosub(" + n + "); break";
				},
				"goto": function (n) {
					return "o.goto(" + n + "); break";
				},
				hex$: function (n, iWidth) { // optional args 1: iWidth
					iWidth = iWidth || 0;
					return "o.iLine = o.hex$(" + n + ", " + iWidth + "); break";
				},
				inkey$: function () {
					return "o.inkey$()";
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
				"int": function (x) {
					return "Math.floor(" + x + ")";
				},
				locate: function (iStream, x, y) { // TODO XXXoptional args 1: iStream
					iStream = iStream || 0;
					return "o.locate(" + iStream + ", " + x + ", " + y + ")";
				},
				mode: function (n) {
					Utils.console.log("mode=", n);
					return "o.mode(" + n + ")";
				},
				/*
				on: function (n) {
					Utils.console.log("on=", n); // TODO
					return "o.on(" + n + ")";
				},
				*/
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
				print: function () { // varargs
					var	aArgs = [],
						i;

					for (i = 0; i < arguments.length; i += 1) {
						aArgs.push(String(arguments[i]));
					}
					return "o.print(" + aArgs.join(", ") + ")";
				},
				randomize: function (n) { // optional args 1: n
					return "o.randomize(" + n + ");";
				},
				"return": function () {
					return "o.return(); break";
				},
				rnd: function (n) { // optional args 1: n
					return "o.rnd(" + n + ");";
				},
				space$: function (n) {
					return "\" \".repeat(" + n + ")";
				},
				stop: function () {
					Utils.console.log("stop");
					return "o.stop(); break"; //TTT: how to allow cont?
				},
				str$: function (n) {
					return "String(" + n + ")";
				},
				tab: function (n) {
					return "o.tab(" + n + ")";
				},
				time: function () {
					Utils.console.log("time");
					return "o.time()";
				},
				using: function (format, expr) { // print using
					return "o.using(" + format + ", " + expr + ")";
				},
				wait: function (iPort, iMask, iInv) { // optional args 1: iInv
					iInv = iInv || 0;
					return "o.wait(" + iPort + ", " + iMask + ", " + iInv + ")";
				},
				wend: function () {
					return "o.wend()";
				}

				/*
				// concat(s1, s2, ...) concatenate strings (called by operator [..] )
				concat: function () { // varargs
					var	s = "",
						i;

					for (i = 0; i < arguments.length; i += 1) {
						s += String(arguments[i]);
					}
					return s;
				},

				// sin(d) sine of d (d in degrees)
				sin: function (degrees) {
					return Math.sin(Utils.toRadians(degrees));
				},

				// cos(d) cosine of d (d in degrees)
				cos: function (degrees) {
					return Math.cos(Utils.toRadians(degrees));
				},

				// tan(d) tangent of d (d in degrees)
				tan: function (degrees) {
					return Math.tan(Utils.toRadians(degrees));
				},

				// asin(x) arcsine of x (returns degrees)
				asin: function (x) {
					return Utils.toDegrees(Math.asin(x));
				},

				// acos(x) arccosine of x (returns degrees)
				acos: function (x) {
					return Utils.toDegrees(Math.acos(x));
				},

				// atan(x) arctangent of x (returns degrees)
				atan: function (x) {
					return Utils.toDegrees(Math.atan(x));
				},
				abs: Math.abs,

				// round(x) round to the nearest integer
				round: Math.round,

				// ceil(x) round upwards to the nearest integer
				ceil: Math.ceil,

				// floor(x) round downwards to the nearest integer
				floor: Math.floor,
				"int": function (x) { return (x > 0) ? Math.floor(x) : Math.ceil(x); }, // ES6: Math.trunc
				// mod: or should it be... https://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
				mod: function (a, b) { return a % b; },
				log: Math.log,
				exp: Math.exp,
				sqrt: Math.sqrt,

				// max(x, y, ...)
				max: Math.max,

				// min(x, y, ...)
				min: Math.min,

				// random() random number between [0,1)
				random: Math.random,

				// deg() switch do degrees mode (default, ignored, we always use degrees)
				deg: function () {
					Utils.console.log("deg() ignored.");
				},

				// rad() switch do radians mode (not supported, we always use degrees)
				rad: function () {
					Utils.console.warn("rad() not supported.");
				},

				// len(s) length of string
				len: function (s) {
					return String(s).length;
				},

				// mid(s, index, len) substr with positions starting with 1
				mid: function (s, start, length) {
					return String(s).substr(start - 1, length);
				},

				// uc (toUpperCase)  beware: toUpperCase converts 'ß' to 'SS'!
				uc: function (s) {
					return String(s).toUpperCase();
				},

				// lc (toLowerCase)
				lc: function (s) {
					return String(s).toLowerCase();
				},
				parse: function (s) {
					var oVars = {},
						oOut, oErr, iEndPos;

					oOut = new BasicParser().calculate(s, oVars);
					if (oOut.error) {
						oErr = oOut.error;
						iEndPos = oErr.pos + String(oErr.value).length;
						oOut.text = oErr.message + ": '" + oErr.value + "' (pos " + oErr.pos + "-" + iEndPos + ")";
					}
					return oOut.text;
				},
				// assert(c1, c2) (assertEqual: c1 === c2)
				assert: function (a, b) {
					if (a !== b) {
						throw new BasicParser.ErrorObject("Assertion failed: '" + a + " != " + b + "'", "assert", this.pos);
					}
				},
				cls: function () {
					return null; // clear output trigger
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
			oOut.text = "while (!o.bStop) {\nswitch (o.iLine) {\ncase 0:\n" + sOutput + " o.bStop = true; break;\ndefault: o.vmDefault(); o.stop(); break;\n}}";
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
