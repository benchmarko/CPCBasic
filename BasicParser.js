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

BasicParser.mKeywords = { // c=command, f=function, o=operator, x=additional keyword for command
	abs: "f",
	after: "c",
	and: "o",
	asc: "f",
	atn: "f",
	auto: "c",
	bin$: "f",
	border: "c",
	"break": "x",
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
	plotr: "c",
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
	spc: "x", // print spc
	speed: "c", // speed ink, speed key, speed write
	sq: "f",
	sqr: "f",
	step: "x", // for ... to ... step
	stop: "c",
	str$: "f",
	string$: "f",
	swap: "x", // window swap
	symbol: "c", // symbol, symbol after
	tab: "x", // print tab
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

		this.iLine = 0; // current line (label)

		this.oStack = {
			f: [], // for
			w: [] // while
		};
		this.iGosubCount = 0;
		this.iIfCount = 0;
		this.iStopCount = 0;
		this.iForCount = 0; // stack needed
		this.iWhileCount = 0; // stack needed

		this.aData = []; // collected data from data lines
	},

	lex: function (input) { // eslint-disable-line complexity
		var isComment = function (c) { // isApostrophe
				return (/[']/).test(c);
			},
			isOperator = function (c) {
				return (/[+\-*/^=()[\],;:?\\]/).test(c);
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
			isDot = function (c) {
				return (/[.]/).test(c);
			},
			isSign = function (c) {
				return (/[+-]/).test(c);
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
				return c !== "" && !isQuotes(c) && !isNewLine(c); // quoted string must be in one line!
			},
			isIdentifierStart = function (c) {
				return c !== "" && (/[A-Za-z]/).test(c); // cannot use complete [A-Za-z]+[\w]*[$%!]?
			},
			isIdentifierMiddle = function (c) {
				return c !== "" && (/[A-Za-z0-9.]/).test(c);
			},
			isIdentifierEnd = function (c) {
				return c !== "" && (/[$%!]/).test(c);
			},
			isStream = function (c) {
				return (/[#]/).test(c);
			},
			isAddress = function (c) {
				return (/[@]/).test(c);
			},
			isRsx = function (c) {
				return (/[|]/).test(c);
			},
			isNotNewLine = function (c) {
				return c !== "" && c !== "\n";
			},
			isUnquotedData = function (c) {
				return c !== "" && (/[^:,\r\n]/).test(c);
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
			},
			hexEscape = function (str) {
				return str.replace(/[\x00-\x1f]/g, function (sChar2) { // eslint-disable-line no-control-regex
					return "\\x" + ("00" + sChar2.charCodeAt().toString(16)).slice(-2);
				});
			},
			fnParseKeyword = function () {
				sToken = sToken.toLowerCase();
				if (sToken === "rem") { // ignore comment
					if (isNotNewLine(sChar)) {
						advanceWhile(isNotNewLine);
					}
				} else {
					addToken(sToken, 0, iStartPos);
				}
				if (sToken === "data") { // special handling since strings in data lines need not be quoted
					if (isWhiteSpace(sChar)) {
						advanceWhile(isWhiteSpace);
					}
					while (true) { // eslint-disable-line no-constant-condition
						if (isQuotes(sChar)) {
							sChar = "";
							sToken = advanceWhile(isNotQuotes);
							if (!isQuotes(sChar)) {
								Utils.console.warn("Unterminated string ", sToken, " at position ", iStartPos + 1);
							}
							sToken = sToken.replace(/\\/g, "\\\\"); // escape backslashes
							sToken = hexEscape(sToken);
							addToken("string", sToken, iStartPos + 1);
							if (sChar === '"') { // not for newline
								sChar = advance();
							}
						} else {
							sToken = advanceWhile(isUnquotedData);
							sToken = sToken.replace(/\\/g, "\\\\"); // escape backslashes
							addToken("string", sToken, iStartPos);
						}
						if (sChar !== ",") {
							break;
						}
						addToken(sChar, 0, iStartPos); // ","
						sChar = advance();
					}
				}
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
				if (sChar === "e" || sChar === "E") {
					sToken += advanceWhile(isSign);
					if (isDigit(sChar)) {
						sToken += advanceWhile(isDigit);
					}
				}
				sToken = parseFloat(sToken);
				if (!isFinite(sToken)) {
					throw new BasicParser.ErrorObject("Number is too large or too small", sToken, iStartPos); // for a 64-bit double
				}
				addToken("number", sToken, iStartPos);
			} else if (isDot(sChar)) { // number starting with dot (similat code to normal number)
				sToken = sChar;
				sChar = advance();
				sToken += advanceWhile(isDigit);
				if (sChar === "e" || sChar === "E") {
					sToken += advanceWhile(isSign);
					if (isDigit(sChar)) {
						sToken += advanceWhile(isDigit);
					}
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
					Utils.console.warn("Unterminated string ", sToken, " at position ", iStartPos + 1);
				}
				sToken = sToken.replace(/\\/g, "\\\\"); // escape backslashes
				sToken = hexEscape(sToken);
				addToken("string", sToken, iStartPos + 1);
				if (sChar === '"') { // not for newline
					sChar = advance();
				}
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
					fnParseKeyword();
				} else {
					addToken("identifier", sToken, iStartPos);
				}
			} else if (isAddress(sChar)) {
				addToken(sChar, 0, iStartPos);
				sChar = advance();
			} else if (isRsx(sChar)) {
				sChar = advance();
				sToken = "";
				if (isIdentifierMiddle(sChar)) {
					sToken = advanceWhile(isIdentifierMiddle);
					addToken("rsx", sToken, iStartPos);
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

				if (t.std) {
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

				if (oToken.type !== ":" && oToken.type !== "(eol)" && oToken.type !== "(end)" && oToken.type !== "else") {
					aArgs.push(expression(0));
					while (oToken.type === ",") {
						advance();
						aArgs.push(expression(0));
					}
				}
				return aArgs;
			},

			fnGetArgsInParenthesisOrBrackets = function () {
				var aArgs = [],
					sOpen, sClose;

				sOpen = oToken.type;
				if (sOpen === "(") {
					sClose = ")";
				} else if (sOpen === "[") {
					sClose = "]";
				} else {
					throw new BasicParser.ErrorObject("Expected parenthesis or brackets", aTokens[iIndex - 2].value, aTokens[iIndex - 1].pos);
				}

				if (aTokens[iIndex].type === sClose) {
					advance(sClose);
				} else {
					do {
						advance();
						aArgs.push(expression(0));
					} while (oToken.type === ",");
					if (oToken.type !== sClose) {
						throw new BasicParser.ErrorObject("Expected closing parenthesis for argument list after", aTokens[iIndex - 2].value, aTokens[iIndex - 1].pos);
					}
				}
				advance(sClose);
				return aArgs;
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
						value: 0
					};
				}
				return oValue;
			},

			fnCreateCmdCall = function (sName) {
				var oValue = {
					type: "fcall",
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
					type: "fcall",
					args: null,
					name: sName || aTokens[iIndex - 2].type,
					pos: aTokens[iIndex - 2].pos
				};

				oValue.args = (oToken.type === "(") ? fnGetArgsInParenthesisOrBrackets() : [];
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

			if (oToken.type === "(" || oToken.type === "[") {
				oValue = {
					type: "array",
					args: null,
					name: sName,
					pos: aTokens[iParseIndex - 1].pos
				};
				oValue.args = fnGetArgsInParenthesisOrBrackets();

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
			var iParseIndex = iIndex,
				value = expression(0);

			if (oToken.type !== "]") {
				throw new BasicParser.ErrorObject("Expected closing brackets", "]", aTokens[iParseIndex].pos);
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

		stmt("call", function () {
			var oValue = {
				type: "call",
				args: fnGetArgs(),
				pos: aTokens[iIndex - 1].pos
			};

			return oValue;
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
				type: "def",
				args: [],
				pos: aTokens[iIndex - 1].pos
			};

			if ((oToken.type !== "identifier") || !Utils.stringStartsWith(oToken.value.toLowerCase(), "fn")) {
				throw new BasicParser.ErrorObject("Invalid def at", oToken.type, oToken.pos);
			}
			oValue.name = oToken.value;
			advance();

			oValue.args = (oToken.type === "(") ? fnGetArgsInParenthesisOrBrackets() : [];
			advance("=");

			oValue.value = expression(0);
			return oValue;
		});

		stmt("end", function () {
			var oValue = {
				type: "end"
			};

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
				type: "for"
			};

			if (oToken.type !== "identifier") {
				throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos);
			}
			oValue.name = expression(90); // take simple identifier, nothing more
			if (oValue.name.type !== "identifier") { //TTT not array?
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

		stmt("graphics", function () {
			var sName, oValue;

			if (oToken.type === "pen" || oToken.type === "paper") { // graphics pen/paper
				sName = "graphics" + Utils.stringCapitalize(oToken.type);
				advance(oToken.type);
				oValue = fnCreateCmdCall(sName);
			} else {
				throw new BasicParser.ErrorObject("Expected pen or paper at", oToken.type, oToken.pos);
			}
			return oValue;
		});

		stmt("if", function () {
			var oValue = {
				type: "if"
			};

			oValue.left = expression(0);
			if (oToken.type === "goto") {
				// skip "then"
				oValue.right = statements("else");
			} else {
				advance("then");
				if (oToken.type === "number") {
					oValue.right = [fnCreateCmdCall("goto")];
				} else {
					oValue.right = statements("else");
				}
			}

			if (oToken.type === "else") {
				advance("else");
				if (oToken.type === "number") {
					oValue.third = [fnCreateCmdCall("goto")];
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
					type: "input",
					args: [],
					pos: aTokens[iIndex - 1].pos
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
				if (oToken.type === ";") { // ";" => append "?"
					sText += "?";
					advance(";");
				} else if (oToken.type === ",") {
					advance(",");
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
					throw new BasicParser.ErrorObject("Expected identifier at", oToken.type, oToken.pos);
				}
				sName = oToken.value;
				advance();
				if (oToken.type === "(") {
					oValue2 = {
						type: "array",
						args: null,
						name: sName,
						pos: aTokens[iIndex - 1].pos
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
				pos: aTokens[iIndex - 1].pos
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
					type: "lineInput",
					args: [],
					pos: aTokens[iIndex - 1].pos
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
					pos: aTokens[iIndex - 1].pos
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

		stmt("locate", function () {
			var oStream = fnGetOptionalStream(),
				oValue = fnCreateCmdCall("locate");

			oValue.args.unshift(oStream);
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
					advance(",");
				}
			}
			return oValue;
		});

		stmt("on", function () {
			var oValue = {
					type: "on",
					name: null,
					args: null,
					pos: iIndex - 1
				},
				bOnBreak = false,
				bOnError = false;

			if (oToken.type === "break") {
				advance("break");
				if (oToken.type === "gosub") {
					advance("gosub");
					oValue.name = "onBreakGosub";
					oValue.args = fnGetArgs();
					bOnBreak = true;
				} else if (oToken.type === "cont") {
					advance("cont");
					oValue.name = "onBreakCont";
					oValue.args = [];
				} else if (oToken.type === "stop") {
					advance("stop");
					oValue.name = "onBreakStop";
					oValue.args = [];
				}
			} else if (oToken.type === "error") { // on error goto
				advance("error");
				bOnError = true;
				oValue.name = "onErrorGoto";
			} else {
				oValue.left = expression(0);
			}

			if (oToken.type === "gosub" && !bOnError && !bOnBreak) {
				advance("gosub");
				oValue.name = "onGosub";
				oValue.args = fnGetArgs();
			} else if (oToken.type === "goto") {
				advance("goto");
				if (!oValue.name) {
					oValue.name = "onGoto";
				}
				oValue.args = fnGetArgs();
			}

			return oValue;
		});

		stmt("paper", function () {
			var oStream = fnGetOptionalStream(),
				oValue = fnCreateCmdCall("paper");

			oValue.args.unshift(oStream);
			return oValue;
		});

		stmt("pen", function () {
			var oStream = fnGetOptionalStream(),
				oValue = fnCreateCmdCall("pen");

			oValue.args.unshift(oStream);
			return oValue;
		});

		stmt("print", function () {
			var oValue = {
					type: "fcall",
					args: [],
					name: "print",
					pos: aTokens[iIndex - 2].pos
				},
				oValue2,
				iParseIndex = iIndex,
				bTrailingSemicolon = false,
				reFormat = /!|&|\\ *\\|#+\.?#*[+-]?/,
				iSpcOrTabEnd = 0,
				t, aFormat, oStream;

			oStream = fnGetOptionalStream();
			oValue.args.push(oStream);

			while (oToken.type !== ":" && oToken.type !== "(eol)" && oToken.type !== "(end)") {
				if (oToken.type === "spc") {
					advance("spc");
					t = expression(0); // value
					oValue2 = {
						type: "fcall",
						name: "spc",
						args: [t]
					};
					oValue.args.push(oValue2);
					iSpcOrTabEnd = iIndex; // save index so we can ignore newline if spc or tab is printed last
				} else if (oToken.type === "tab") {
					advance("tab");
					t = expression(0); // value
					oValue2 = {
						type: "tab",
						args: [t]
					};
					oValue.args.push(oValue2);
					iSpcOrTabEnd = iIndex;
				} else if (oToken.type === "using") {
					advance("using");
					t = expression(0); // format
					aFormat = t.value.split(reFormat);
					aFormat.shift(); // remove one arg
					oValue2 = {
						type: "fcall",
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
						oValue2.args.push(t);
					}
					oValue.args.push(oValue2);
				} else if (BasicParser.mKeywords[oToken.type] && BasicParser.mKeywords[oToken.type].charAt(0) !== "f") { // stop also at keyword which is not a function
					break;
				} else if (oToken.type === ";") {
					advance(";");
				} else if (oToken.type === ",") { // default tab, simulate tab...
					oValue.args.push({
						type: "tab",
						args: [], // special: we use no args to get tab with current zone
						pos: aTokens[iParseIndex - 2].pos
					});
					advance(",");
				} else {
					t = expression(0);
					oValue.args.push(t);
				}
			}

			bTrailingSemicolon = (aTokens[iIndex - 2].type === ";"); //TTT
			if (!bTrailingSemicolon && iSpcOrTabEnd !== iIndex) {
				oValue.args.push({
					type: "string",
					value: "\\r\\n"
				});
			}
			return oValue;
		});

		oSymbols["?"] = oSymbols.print; // ? is same as print

		stmt("randomize", function () {
			var oValue = {
				type: "randomize",
				args: fnGetArgs()
			};

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
			var rsxToken = aTokens[iIndex - 2],
				oValue;

			if (oToken.type === ",") {
				advance(",");
			}
			oValue = fnCreateCmdCall(rsxToken.type + Utils.stringCapitalize(rsxToken.value));
			return oValue;
		});

		stmt("run", function () {
			var oValue;

			oValue = fnCreateCmdCall();
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
				break;
			}
			return fnCreateCmdCall(sName);
		});

		stmt("stop", function () {
			var oValue = {
				type: "stop"
			};

			return oValue;
		});

		stmt("symbol", function () {
			var sName = "symbol";

			if (oToken.type === "after") { // symbol after?
				advance("after");
				sName = "symbolAfter";
			}
			return fnCreateCmdCall(sName);
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

			oValue.left = expression(0);

			return oValue;
		});

		stmt("window", function () {
			var oValue, oStream;

			if (oToken.type === "swap") { // symbol after?
				advance("swap");
				oValue = fnCreateCmdCall("windowSwap");
			} else {
				oStream = fnGetOptionalStream();
				oValue = fnCreateCmdCall("window");
				oValue.args.unshift(oStream);
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
				"\\": function (a, b) {
					return "(" + a + " / " + b + ") | 0"; // integer division
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
					//return a + " > " + b;
					return a + " > " + b + " ? -1 : 0";
				},
				"<": function (a, b) {
					//return a + " < " + b;
					return a + " < " + b + " ? -1 : 0";
				},
				">=": function (a, b) {
					//return a + " >= " + b;
					return a + " >= " + b + " ? -1 : 0";
				},
				"<=": function (a, b) {
					//return a + " <= " + b;
					return a + " <= " + b + " ? -1 : 0";
				},
				"=": function (a, b) {
					//return a + " === " + b;
					return a + " === " + b + " ? -1 : 0";
				},
				"<>": function (a, b) {
					//return a + " !== " + b;
					return a + " !== " + b + " ? -1 : 0";
				},
				"@": function (a) {
					return 'o.addressOf("' + a + '")'; // address of
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

			fnParseArgs = function (aArgs) {
				var aNodeArgs = [], // do not modify node.args here (could be a parameter of defined function)
					i;

				for (i = 0; i < aArgs.length; i += 1) {
					aNodeArgs[i] = parseNode(aArgs[i]); // eslint-disable-line no-use-before-define
				}
				return aNodeArgs;
			},

			fnParseDef = function (node) {
				var aNodeArgs, sName, value;

				sName = fnAdaptVariableName(node.name);
				oDevScopeArgs = {};
				bDevScopeArgsCollect = true;
				aNodeArgs = fnParseArgs(node.args);
				bDevScopeArgsCollect = false;
				value = sName + " = function (" + aNodeArgs.join(", ") + ") { return " + parseNode(node.value) + "; };";
				oDevScopeArgs = null;
				return value;
			},

			fnParseFor = function (node) {
				var sVarName, sLabel, value, sStepName, sEndName;

				sVarName = parseNode(node.name);
				sLabel = that.iLine + "f" + that.iForCount;
				that.oStack.f.push(sLabel);
				that.iForCount += 1;

				sStepName = sVarName + "Step";
				value = sStepName.substr(2); // remove preceiding "v."
				variables[value] = 0; // declare also step variable
				sEndName = sVarName + "End";
				value = sEndName.substr(2); // remove preceiding "v."
				variables[value] = 0; // declare also step variable

				value = "/* for() */ " + sVarName + " = " + parseNode(node.left) + "; " + sEndName + " = " + parseNode(node.right) + "; " + sStepName + " = " + parseNode(node.third) + "; o.goto(\"" + sLabel + "b\"); break;";
				value += "\ncase \"" + sLabel + "\": ";

				value += sVarName + " += " + sStepName + ";";
				value += "\ncase \"" + sLabel + "b\": ";
				//value2 = parseNode(node.right);
				value += "if (" + sStepName + " > 0 && " + sVarName + " > " + sEndName + " || " + sStepName + " < 0 && " + sVarName + " < " + sEndName + ") { o.goto(\"" + sLabel + "e\"); break; }";
				return value;
			},

			fnParseIf = function (node) {
				var aNodeArgs, sLabel, value, sPart;

				sLabel = that.iLine + "i" + that.iIfCount;
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
				return value;
			},

			fnParseInput = function (node) {
				var aNodeArgs, sLabel, value, i, sStream, sNoCRLF, sMsg;

				sLabel = that.iLine + "s" + that.iStopCount;
				that.iStopCount += 1;

				aNodeArgs = fnParseArgs(node.args);
				sStream = aNodeArgs.shift();
				sNoCRLF = aNodeArgs.shift();
				sMsg = aNodeArgs.shift();

				value = "o.input(" + sStream + ", " + sNoCRLF + ", " + sMsg + ", \"" + aNodeArgs.join('", "') + "\"); o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":";
				for (i = 0; i < aNodeArgs.length; i += 1) {
					value += "; " + aNodeArgs[i] + " = o.vmGetNextInput(\"" + aNodeArgs[i] + "\")";
				}

				return value;
			},

			fnParseLineInput = function (node) {
				var aNodeArgs, sLabel, value, i, sStream, sNoCRLF, sMsg;

				sLabel = that.iLine + "s" + that.iStopCount;
				that.iStopCount += 1;

				aNodeArgs = fnParseArgs(node.args);
				sStream = aNodeArgs.shift();
				sNoCRLF = aNodeArgs.shift();
				sMsg = aNodeArgs.shift();

				value = "o.lineInput(" + sStream + ", " + sNoCRLF + ", " + sMsg + ", \"" + aNodeArgs.join('", "') + "\"); o.goto(\"" + sLabel + "\"); break;\ncase \"" + sLabel + "\":";
				for (i = 0; i < aNodeArgs.length; i += 1) {
					value += "; " + aNodeArgs[i] + " = o.vmGetNextInput(\"" + aNodeArgs[i] + "\")";
				}
				return value;
			},

			fnParseOn = function (node) {
				var aNodeArgs, i, sName, sLabel, value;

				aNodeArgs = fnParseArgs(node.args);
				if (node.left) {
					i = parseNode(node.left);
					aNodeArgs.unshift(i);
				}
				sName = node.name;
				if (sName === "onGosub") {
					sLabel = that.iLine + "g" + that.iGosubCount;
					that.iGosubCount += 1;
					aNodeArgs.unshift('"' + sLabel + '"');
					value = "o." + sName + "(" + aNodeArgs.join(", ") + '); break; \ncase "' + sLabel + '":';
				} else if (sName === "onGoto") {
					sLabel = that.iLine + "s" + that.iStopCount;
					that.iStopCount += 1;
					aNodeArgs.unshift('"' + sLabel + '"');
					value = "o." + sName + "(" + aNodeArgs.join(", ") + "); break\ncase \"" + sLabel + "\":";
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
					if (Utils.bSupportsBinaryLiterals) {
						value = "0b" + ((value.length) ? value : "0"); // &x->0b; 0b is ES6
					} else {
						value = "0x" + ((value.length) ? parseInt(value, 2).toString(16) : "0"); // we convert it to hex
					}
					break;
				case "hexnumber":
					value = node.value.slice(1);
					value = "0x" + ((value.length) ? value : "0"); // &->0x
					break;
				case "identifier":
					value = fnAdaptVariableName(node.value); // here we use node.value
					break;
				case "array":
					aNodeArgs = fnParseArgs(node.args);
					sName = fnAdaptVariableName(node.name, aNodeArgs.length);
					value = sName + aNodeArgs.map(function (val) {
						return "[" + val + "]";
					}).join("");
					break;
				case "assign":
					if (node.left.type === "array") {
						aNodeArgs = fnParseArgs(node.left.args);
						sName = fnAdaptVariableName(node.left.name, aNodeArgs.length);
						value = aNodeArgs.map(function (val) {
							return "[" + val + "]";
						}).join("");
					} else if (node.left.type === "identifier") {
						sName = fnAdaptVariableName(node.left.value);
						value = "";
					} else {
						value = "error "; //TTT
					}
					value = sName + value + " = " + parseNode(node.right);
					break;
				case "fcall":
					aNodeArgs = fnParseArgs(node.args);
					sName = node.name;
					if (mFunctions[sName] === undefined) {
						if (Utils.debug > 2) {
							Utils.console.debug("NOTE: Generating default call for function ", sName, " pos ", node.pos);
						}
						value = "o." + sName + "(" + aNodeArgs.join(", ") + ")";
					} else {
						checkArgs(sName, aNodeArgs, node.pos);
						value = mFunctions[sName].apply(node, aNodeArgs);
					}
					break;

				case "call":
					sName = that.iLine + "c" + that.iStopCount;
					that.iStopCount += 1;
					value = "o.call(" + fnParseArgs(node.args).join(", ") + "); o.goto(\"" + sName + "\"); break;\ncase \"" + sName + "\":";
					break;
				case "def":
					value = fnParseDef(node);
					break;
				case "end": // same as stop, use also stopCount
					sName = that.iLine + "s" + that.iStopCount;
					that.iStopCount += 1;
					value = "o.end(\"" + sName + "\"); break;\ncase \"" + sName + "\":";
					break;
				case "fn": // FNxxx function call
					aNodeArgs = fnParseArgs(node.args);
					sName = fnAdaptVariableName(node.name);
					value = sName + "(" + aNodeArgs.join(", ") + ")";
					break;
				case "for":
					value = fnParseFor(node);
					break;
				case "frame":
					sName = that.iLine + "s" + that.iStopCount; // use also stopCount for frame? TTT
					that.iStopCount += 1;
					value = "o.frame(); o.goto(\"" + sName + "\"); break;\ncase \"" + sName + "\":";
					break;
				case "gosub":
					sName = that.iLine + "g" + that.iGosubCount;
					that.iGosubCount += 1;
					value = 'o.gosub("' + sName + '", ' + parseNode(node.left) + '); break; \ncase "' + sName + '":';
					break;
				case "if":
					value = fnParseIf(node);
					break;
				case "input":
					value = fnParseInput(node);
					break;
				case "label":
					that.iLine = node.value;
					aNodeArgs = fnParseArgs(node.left);
					value = "case " + node.value + ":";
					for (i = 0; i < aNodeArgs.length; i += 1) {
						value += " " + aNodeArgs[i];
						if (!(/[}:;]$/).test(value)) { // does not end with "}" ":" ";"
							value += ";";
						}
					}
					break;
				case "lineInput":
					value = fnParseLineInput(node);
					break;
				case "next":
					aNodeArgs = fnParseArgs(node.args);
					value = "";
					if (!aNodeArgs.length) {
						aNodeArgs.push(""); // we have no variable, so use empty argument
					}
					for (i = 0; i < aNodeArgs.length; i += 1) {
						sName = that.oStack.f.pop();
						value += "/* next(\"" + aNodeArgs[i] + "\") */ o.goto(\"" + sName + "\"); break;\ncase \"" + sName + "e\":";
					}
					break;
				case "on":
					value = fnParseOn(node);
					break;
				case "randomize":
					aNodeArgs = fnParseArgs(node.args);
					if (aNodeArgs.length) {
						value = "o.randomize(" + aNodeArgs.join(", ") + ")";
					} else {
						sName = that.iLine + "s" + that.iStopCount; // use also stopCount for randomize? TTT
						that.iStopCount += 1;
						value = "o.randomize(); o.goto(\"" + sName + "\"); break;\ncase \"" + sName + "\": o.randomize(o.vmGetInput())";
					}
					break;
				case "return":
					value = "o.return(); break;";
					break;
				case "stop":
					sName = that.iLine + "s" + that.iStopCount;
					that.iStopCount += 1;
					value = "o.stop(\"" + sName + "\"); break;\ncase \"" + sName + "\":";
					break;
				case "tab":
					aNodeArgs = fnParseArgs(node.args);
					value = "{type: \"tab\", args: [" + aNodeArgs.join(", ") + "]}"; // we must delay the tab() call until print() is called
					break;
				case "wend":
					sName = that.oStack.w.pop();
					value = "/* o.wend() */ o.goto(\"" + sName + "\"); break;\ncase \"" + sName + "e\":";
					break;
				case "while":
					sName = that.iLine + "w" + that.iWhileCount;
					value = "\ncase \"" + sName + "\": if (!(" + parseNode(node.left) + ")) { o.goto(\"" + sName + "e\"); break; }";
					that.oStack.w.push(sName);
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

	calculate: function (input, variables) {
		var that = this,
			mFunctions = {
				data: function () { // varargs
					var	aArgs = [],
						sData, i;

					for (i = 0; i < arguments.length; i += 1) {
						aArgs.push(arguments[i]);
					}
					aArgs.unshift(that.iLine); // prepend line number
					sData = "o.data(" + aArgs.join(", ") + ")";
					that.aData.push(sData); // will be set at the beginning of the script
					return "/* data */";
				},
				defint: function () { // varargs
					var	aArgs = [],
						sName, i;

					for (i = 0; i < arguments.length; i += 1) {
						sName = arguments[i];
						sName = sName.replace(/v\./g, ""); // remove preceiding "v."
						aArgs.push("o.defint(\"" + sName + "\")");
					}
					return aArgs.join("; ");
				},
				defreal: function () { // varargs
					var	aArgs = [],
						sName, i;

					for (i = 0; i < arguments.length; i += 1) {
						sName = arguments[i];
						sName = sName.replace(/v\./g, ""); // remove preceiding "v."
						aArgs.push("o.defreal(\"" + sName + "\")");
					}
					return aArgs.join("; ");
				},
				defstr: function () { // varargs
					var	aArgs = [],
						sName, i;

					for (i = 0; i < arguments.length; i += 1) {
						sName = arguments[i];
						sName = sName.replace(/v\./g, ""); // remove preceiding "v."
						aArgs.push("o.defstr(\"" + sName + "\")");
					}
					return aArgs.join("; ");
				},
				dim: function () { // varargs
					var	aArgs = [],
						sName, aName, i;

					for (i = 0; i < arguments.length; i += 1) {
						sName = arguments[i];
						aName = sName.split(/\[|\]\[|\]/);
						aName.pop(); // remove empty last element
						sName = aName.shift();
						aArgs.push(sName + " = o.dim(\"" + sName + "\", " + aName.join(", ") + ")");
					}
					return aArgs.join("; ");
				},

				error: function (n) {
					return "o.error(" + n + "); break";
				},

				"goto": function (n) {
					return "o.goto(" + n + "); break";
				},

				read: function () { // varargs
					var	aArgs = [],
						sName, i;

					for (i = 0; i < arguments.length; i += 1) {
						sName = arguments[i];
						aArgs.push(sName + " = o.read(\"" + sName + "\")");
					}
					return aArgs.join("; ");
				},
				"return": function () {
					return "o.return(); break";
				},
				run: function () { // varargs
					var	aArgs = [],
						i;

					for (i = 0; i < arguments.length; i += 1) {
						aArgs.push(arguments[i]);
					}
					return "o.run(" + aArgs.join(", ") + "); break;";
				}
			},
			fnCombineData = function (aData) {
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
			aTokens = this.lex(input);
			aParseTree = this.parse(aTokens);
			sOutput = this.evaluate(aParseTree, variables, mFunctions);
			oOut.text = "var v=o.v;\n";
			oOut.text += "while (o.vmLoopCondition()) {\nswitch (o.iLine) {\ncase 0:\n" + fnCombineData(this.aData) + sOutput + "\ncase \"end\": o.vmStop(\"end\", 90); break;\ndefault: o.error(8); o.goto(\"end\"); break;\n}}\n";
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
