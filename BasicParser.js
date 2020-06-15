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
// following are arguments: n=number, s=string, l=line number (checked), v=variable (checked), r=letter or range, a=any, n0?=optional papameter with default null, #=stream, #0?=optional stream with default 0; suffix ?=optional (optionals must be last); last *=any number of arguments may follow
BasicParser.mKeywords = {
	abs: "f n", // ABS(<numeric expression>)
	after: "c", // => afterGosub
	afterGosub: "c n n?", // AFTER <timer delay>[,<timer number>] GOSUB <line number> / (special, cannot check optional first n, and line number)
	and: "o", // <argument> AND <argument>
	asc: "f s", // ASC(<string expression>)
	atn: "f n", // ATN(<numeric expression>)
	auto: "c", // TODO: AUTO [<line number>][,<increment>]
	bin$: "f n n?", // BIN$(<unsigned integer expression>[,<integer expression>])
	border: "c n n?", // BORDER <color>[,<color>]
	"break": "x", // see: ON BREAK...
	call: "c n *", // CALL <address expression>[,<list of: parameter>]
	cat: "c", // CAT
	chain: "c s n?", // CHAIN <filename>[,<line number expression>]  or: => chainMerge
	chainMerge: "c s n? *", // CHAIN MERGE <filename>[,<line number expression>][,DELETE <line number range>] / (special)
	chr$: "f n", // CHR$(<integer expression>)
	cint: "f n", // CINT(<numeric expression>)
	clear: "c", // CLEAR  or: => clearInput
	clearInput: "c", // CLEAR INPUT
	clg: "c n?", // CLG[<ink>]
	closein: "c", // CLOSEIN
	closeout: "c", // CLOSEOUT
	cls: "c #?", // CLS[#<stream expression>]
	cont: "c", // CONT
	copychr$: "f #", // COPYCHR$(#<stream expression>)
	cos: "f n", // COS(<numeric expression>)
	creal: "f n", // CREAL(<numeric expression>)
	cursor: "c #0? n0? n?", // CURSOR [<system switch>][,<user switch>] (either parameter can be omitted but not both)
	data: "c n0*", // DATA <list of: constant> (rather 0*, insert dummy null, if necessary)
	dec$: "f n s", // DEC$(<numeric expression>,<format template>)
	def: "c s *", // DEF FN[<space>]<function name>[(<formal parameters>)]=<expression> / (not checked from this)
	defint: "c r r*", // DEFINT <list of: letter range>
	defreal: "c r r*", // DEFREAL <list of: letter range>
	defstr: "c r r*", // DEFSTR <list of: letter range>
	deg: "c", // DEG
	"delete": "c q?", // DELETE [<line number range>] / (not checked from this)
	derr: "f", // DERR
	di: "c", // DI
	dim: "c v *", // DIM <list of: subscripted variable>
	draw: "c n n n0? n?", // DRAW <x coordinate>,<y coordinate>[,[<ink>][,<ink mode>]]
	drawr: "c n n n0? n?", // DRAWR <x offset>,<y offset>[,[<ink>][,<ink mode>]]
	edit: "c l", // EDIT <line number>
	ei: "c", // EI
	"else": "c", // see: IF (else belongs to "if", but can also be used as command)
	end: "c", // END
	ent: "c n *", // ENT <envelope number>[,<envelope section][,<envelope section>]... (up to 5) / section: <number of steps>,<step size>,<pause time>  or: =<tone period>,<pause time>
	env: "c n *", // ENV <envelope number>[,<envelope section][,<envelope section>]... (up to 5) / section: <number of steps>,<step size>,<pause time>  or: =<hardware envelope>,<envelope period>
	eof: "f", // EOF
	erase: "c v *", // ERASE <list of: variable name>  (array names without indices or dimensions)
	erl: "f", // ERL
	err: "f", // ERR
	error: "c n", // ERROR <integer expression>
	every: "c", // => everyGosub
	everyGosub: "c n n?", // EVERY <timer delay>[,<timer number>] GOSUB <line number>  / (special, cannot check optional first n, and line number)
	exp: "f n", // EXP(<numeric expression>)
	fill: "c n", // FILL <ink>
	fix: "f n", // FIX(<numeric expression>)
	fn: "f", // see DEF FN / (FN can also be separate from <function name>)
	"for": "c", // FOR <simple variable>=<start> TO <end> [STEP <size>]
	frame: "c", // FRAME
	fre: "f a", // FRE(<numeric expression>)  or: FRE(<string expression>)
	gosub: "c l", // GOSUB <line number>
	"goto": "c l", // GOTO <line number>
	graphics: "c", // => graphicsPaper or graphicsPen
	graphicsPaper: "x n", // GRAPHICS PAPER <ink>  / (special)
	graphicsPen: "x n n?", // GRAPHICS PEN <ink>[,<background mode>]  / (special)
	hex$: "f n n?", // HEX$(<unsigned integer expression>[,<field width>])
	himem: "f", // HIMEM
	"if": "c", // IF <logical expression> THEN <option part> [ELSE <option part>]
	ink: "c n n n?", // INK <ink>,<color>[,<color>]
	inkey: "f n", // INKEY(<integer expression>)
	inkey$: "f", // INKEY$
	inp: "f n", // INP(<port number>)
	input: "c #0? *", // INPUT[#<stream expression>,][;][<quoted string><separator>]<list of: variable>  / (special: not checked from this)
	instr: "f a a a?", // INSTR([<start position>,]<searched string>,<searched for string>)  / (cannot check "f n? s s")
	"int": "f n", // INT(<numeric expression>)
	joy: "f n", // JOY(<integer expression>)
	key: "c n s", // KEY <expansion token number>,<string expression>  / or: => keyDef
	keyDef: "c n n n? n? n?", // KEY DEF <key number>,<repeat>[,<normal>[,<shifted>[,<control>]]]
	left$: "f s n", // LEFT$(<string expression>,<required length>)
	len: "f s", // LEN(<string expression>)
	let: "c", // LET <variable>=<expression>
	line: "c", // => lineInput / (not checked from this)
	lineInput: "c #0? *", // INPUT INPUT[#<stream expression>,][;][<quoted string><separator>]<string variable> (not checked from this)
	list: "c q?", // LIST <line number range>[,#<stream expression>] (not checked from this)
	load: "c s n?", // LOAD <filename>[,<address expression>]
	locate: "c #0? n n", // LOCATE [#<stream expression>,]<x coordinate>,<y coordinate>
	log: "f n", // LOG(<numeric expression>)
	log10: "f n", // LOG10(<numeric expression>)
	lower$: "f s", // LOWER$(<string expression>)
	mask: "c n0? n?", // MASK [<integer expression>][,<first point setting>]  / (either of the parameters may be omitted, but not both)
	max: "f n *", // MAX(<list of: numeric expression>)
	memory: "c n", // MEMORY <address expression>
	merge: "c s", // MERGE <filename>
	mid$: "f s n n?", // MID$(<string expression>,<start position>[,<sub-string length>])  / (start position=1..255, sub-string length=0..255)
	mid$Assign: "c s n n?", // MID$(<string variable>,<insertion point>[,<new string length>])=<new string expression>  / (mid$ as assign, not really a command because it has parenthesis)
	min: "f n *", // MIN(<list of: numeric expression>)
	mod: "o", // <argument> MOD <argument>
	mode: "c n", // MODE <integer expression>
	move: "c n n n0? n?", // MOVE <x coordinate>,<y coordinate>[,[<ink>][,<ink mode>]]
	mover: "c n n n0? n?", // MOVER <x offset>,<y offset>[,[<ink>][,<ink mode>]]
	"new": "c", // NEW
	next: "c v*", // NEXT [<list of: variable>]
	not: "o", // NOT <argument>
	on: "c", // => onBreakCont, on break gosub, on break stop, on error goto, on <ex> gosub, on <ex> goto, on sq(n) gosub
	onBreakCont: "c", // ON BREAK CONT  / (special)
	onBreakGosub: "c l", // ON BREAK GOSUB <line number>  / (special)
	onBreakStop: "c", // ON BREAK STOP  / (special)
	onErrorGoto: "c l", // ON ERROR GOTO <line number>  / (special)
	onGosub: "c l l*", // ON <selector> GOSUB <list of: line number>  / (special; n not checked from this)
	onGoto: "c l l*", // ON <selector> GOTO <list of: line number>  / (special; n not checked from this)
	onSqGosub: "c l", // ON SQ(<channel>) GOSUB <line number>  / (special)
	openin: "c s", // OPENIN <filename>
	openout: "c s", // OPENOUT <filename>
	or: "o", // <argument> OR <argument>
	origin: "c n n n? n? n? n?", // ORIGIN <x>,<y>[,<left>,<right>,<top>,<bottom>]
	out: "c n n", // OUT <port number>,<integer expression>
	paper: "c #0? n", // PAPER[#<stream expression>,]<ink>
	peek: "f n", // PEEK(<address expression>)
	pen: "c #0? n0 n?", // PEN[#<stream expression>,][<ink>][,<background mode>]  / ink=0..15; background mode=0..1
	pi: "f", // PI
	plot: "c n n n0? n?", // PLOT <x coordinate>,<y coordinate>[,[<ink>][,<ink mode>]]
	plotr: "c n n n0? n?", // PLOTR <x offset>,<y offset>[,[<ink>][,<ink mode>]]
	poke: "c n n", // POKE <address expression>,<integer expression>
	pos: "f #", // POS(#<stream expression>)
	print: "c #0? *", // PRINT[#<stream expression>,][<list of: print items>] ... [;][SPC(<integer expression>)] ... [;][TAB(<integer expression>)] ... [;][USING <format template>][<separator expression>]
	rad: "c", // RAD
	randomize: "c n?", // RANDOMIZE [<numeric expression>]
	read: "c v v*", // READ <list of: variable>
	release: "c n", // RELEASE <sound channels>  / (sound channels=1..7)
	rem: "c s?", // REM <rest of line>
	remain: "f n", // REMAIN(<timer number>)  / (timer number=0..3)
	renum: "c n0? n0? n?", // RENUM [<new line number>][,<old line number>][,<increment>]
	restore: "c l?", // RESTORE [<line number>]
	resume: "c l?", // RESUME [<line number>]  or: => resumeNext
	resumeNext: "c", // RESUME NEXT
	"return": "c", // RETURN
	right$: "f s n", // RIGHT$(<string expression>,<required length>)
	rnd: "f n?", // RND[(<numeric expression>)]
	round: "f n n?", // ROUND(<numeric expression>[,<decimals>])
	run: "c a?", // RUN <string expression>  or: RUN [<line number>]  / (cannot check "c s | l?")
	save: "c s a? n? n? n?", // SAVE <filename>[,<file type>][,<binary parameters>]  // <binary parameters>=<start address>,<file tength>[,<entry point>]
	sgn: "f n", // SGN(<numeric expression>)
	sin: "f n", // SIN(<numeric expression>)
	sound: "c n n n? n0? n0? n0? n?", // SOUND <channel status>,<tone period>[,<duration>[,<volume>[,<valume envelope>[,<tone envelope>[,<noise period>]]]]]
	space$: "f n", // SPACE$(<integer expression>)
	spc: "x n", // SPC(<integer expression)  / see: PRINT SPC
	speed: "c", // => speedInk, speedKey, speedWrite
	speedInk: "c n n", // SPEED INK <period1>,<period2>  / (special)
	speedKey: "c n n", // SPEED KEY <start delay>,<repeat period>  / (special)
	speedWrite: "c n", // SPEED WRITE <integer expression>  / (integer expression=0..1)
	sq: "f n", // SQ(<channel>)  / (channel=1,2 or 4)
	sqr: "f n", // SQR(<numeric expression>)
	step: "x", // STEP <size> / see: FOR
	stop: "c", // STOP
	str$: "f n", // STR$(<numeric expression>)
	string$: "f n a", // STRING$(<length>,<character specificier>) / character specificier=string character or number 0..255
	swap: "x n n?", // => windowSwap
	symbol: "c n n *", // SYMBOL <character number>,<list of: rows>   or => symbolAfter  / character number=0..255, list of 1..8 rows=0..255
	symbolAfter: "c n", // SYMBOL AFTER <integer expression>  / integer expression=0..256 (special)
	tab: "x n", // TAB(<integer expression)  / see: PRINT TAB
	tag: "c #?", // TAG[#<stream expression>]
	tagoff: "c #?", // TAGOFF[#<stream expression>]
	tan: "f n", // TAN(<numeric expression>)
	test: "f n n", // TEST(<x coordinate>,<y coordinate>)
	testr: "f n n", // TESTR(<x offset>,<y offset>)
	then: "x", // THEN <option part>  / see: IF
	time: "f", // TIME
	to: "x", // TO <end>  / see: FOR
	troff: "c", // TROFF
	tron: "c", // TRON
	unt: "f n", // UNT(<address expression>)
	upper$: "f s", // UPPER$(<string expression>)
	using: "x", // USING <format template>[<separator expression>]  / see: PRINT
	val: "f s", // VAL (<string expression>)
	vpos: "f #", // VPOS(#<stream expression>)
	wait: "c n n n?", // WAIT <port number>,<mask>[,<inversion>]
	wend: "c", // WEND
	"while": "c n", // WHILE <logical expression>
	width: "c n", // WIDTH <integer expression>
	window: "c #0? n n n n", // WINDOW[#<stream expression>,]<left>,<right>,<top>,<bottom>  / or: => windowSwap
	windowSwap: "c n n?", // WINDOW SWAP <stream expression>,<stream expression>  / (special: with numbers, not streams)
	write: "c #0? *", // WRITE [#<stream expression>,][<write list>]  / (not checked from this)
	xor: "o", // <argument> XOR <argument>
	xpos: "f", // XPOS
	ypos: "f", // YPOS
	zone: "c n" // ZONE <integer expression>  / integer expression=1..255
};

BasicParser.prototype = {
	init: function (options) {
		this.options = options || {}; // e.g. tron

		this.reset();
	},

	reset: function () {
		this.iLine = 0; // for error messages
	},

	composeError: function () { // varargs
		var aArgs = Array.prototype.slice.call(arguments);

		aArgs.unshift("BasicParser");
		aArgs.push(this.iLine);
		return Utils.composeError.apply(null, aArgs);
	},

	// http://crockford.com/javascript/tdop/tdop.html (old: http://javascript.crockford.com/tdop/tdop.html)
	// http://crockford.com/javascript/tdop/parse.js
	// Operator precedence parsing
	//
	// Operator: With left binding power (lbp) and operational function.
	// Manipulates tokens to its left (e.g: +)? => left denotative function led(), otherwise null denotative function nud()), (e.g. unary -)
	// identifiers, numbers: also nud.
	parse: function (aTokens, bAllowDirect) {
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
					throw that.composeError(Error(), "Token expected", id, oToken.pos);
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
					throw that.composeError(Error(), "Unknown token", oToken.type, oToken.pos);
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
						throw that.composeError(Error(), "Unexpected end of file", "", t.pos);
					} else {
						throw that.composeError(Error(), "Unexpected token", t.type, t.pos);
					}
				}
				left = s.nud(t); // process literals, variables, and prefix operators
				while (rbp < oSymbols[oToken.type].lbp) { // as long as the right binding power is less than the left binding power of the next token...
					t = oToken;
					s = oSymbols[t.type];
					advance();
					if (!s.led) {
						throw that.composeError(Error(), "Unexpected token", t.type, t.pos); //TTT how to get this error?
					}
					left = s.led(left); // ...the led method is invoked on the following token (infix and suffix operators), can be recursive
				}
				return left;
			},

			assignment = function () { // "=" as assignment, similar to let
				var oValue, oLeft;

				if (oToken.type !== "identifier") {
					throw that.composeError(Error(), "Expected identifier at", oToken.type, oToken.pos);
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
					throw that.composeError(Error(), "Bad expression statement", t.value, t.pos);
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

				if (oToken.type !== "number" && bAllowDirect) {
					bAllowDirect = false; // allow only once
					oValue = { // insert "direct" label
						type: "label",
						value: "direct",
						len: 0
					};
				} else {
					advance("number");
					oValue = oPreviousToken; // number token
					oValue.type = "label"; // number => label
				}
				that.iLine = oValue.value; // set line number for error messages
				oValue.args = statements();

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

			fnCreateDummyArg = function () {
				return {
					type: "null",
					value: null,
					len: 0
				};
			},

			fnGetOptionalStream = function () {
				var oValue;

				if (oToken.type === "#") { // stream?
					advance("#");
					oValue = expression(0);
				} else { // create dummy
					oValue = fnCreateDummyArg();
				}
				return oValue;
			},

			fnGetLineRange = function () { // l1 or l1-l2 or l1- or -l2 or nothing
				var oValue = oPreviousToken,
					oRange, oLeft, oRight;

				oValue.args = [];

				if (oToken.type === "number") {
					oLeft = oToken;
					advance("number");
				}

				if (oToken.type === "-") {
					oRange = oToken;
					advance("-");
				}

				if (oToken.type === "number") {
					oRight = oToken;
					advance("number");
				}

				if (oRange) {
					if (!oLeft && !oRight) {
						throw that.composeError(Error(), "Invalid range at", oRange.type, oRange.pos);
					}
					oRange.type = "linerange"; // change "-" => "linerange"
					oRange.left = oLeft || fnCreateDummyArg(); // insert dummy for left
					oRange.right = oRight || fnCreateDummyArg(); // insert dummy for right (do not skip it)
					oValue.args.push(oRange);
				} else if (oLeft) {
					oValue.args.push(oLeft); // single line number
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
						throw that.composeError(Error(), "Expected parameter " + sType + " for arguments after", oPreviousToken.value, oToken.pos);
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
							throw that.composeError(Error(), "Expected end of arguments", oPreviousToken.type, oPreviousToken.pos);
						}
					}
					if (sType === "#0?") { // optional stream?
						if (oToken.type === "#") { // stream?
							advance("#");
							oExpression = expression(0); // keep just number or expression without "#"
							if (oToken.type === ",") {
								advance(",");
								bNeedMore = true;
							}
						} else { // insert default stream parameter
							oExpression = fnCreateDummyArg();
						}
					} else {
						if (sType.substr(0, 1) === "#") { // stream expected? (for functions)
							advance("#");
							oExpression = expression(0); // keep just number or expression without "#"
						} else if (oToken.type === sSeparator && sType.substr(0, 2) === "n0") { // n0 or n0?: if parameter not specified, insert default value null?
							oExpression = fnCreateDummyArg();
						} else if (sType.substr(0, 1) === "l") {
							oExpression = expression(0);
							if (oExpression.type !== "number") { // maybe an expression and no plain number
								throw that.composeError(Error(), "Line number expected at", oExpression.value, oExpression.pos);
							}
							oExpression.type = "linenumber"; // change type: number => linenumber
						} else if (sType.substr(0, 1) === "v") { // variable (identifier)
							oExpression = expression(0);
							if (oExpression.type !== "identifier") {
								throw that.composeError(Error(), "Variable expected at", oExpression.value, oExpression.pos);
							}
						} else if (sType.substr(0, 1) === "r") { // character or range of characters (defint, defreal, defstr)
							if (oToken.type !== "identifier") {
								throw that.composeError(Error(), "Letter expected at", oToken.value, oToken.pos);
							}
							oExpression = expression(0);
							if (fnIsSingleLetterIdentifier(oExpression)) { // ok
								oExpression.type = "letter"; // change type: identifier -> letter
							} else if (oExpression.type === "-" && fnIsSingleLetterIdentifier(oExpression.left) && fnIsSingleLetterIdentifier(oExpression.right)) { // also ok
								oExpression.type = "range"; // change type: "-" => range
								oExpression.left.type = "letter"; // change type: identifier -> letter
								oExpression.right.type = "letter"; // change type: identifier -> letter
							} else {
								throw that.composeError(Error(), "Letter or range expected at", oExpression.value, oExpression.pos);
							}
						} else {
							oExpression = expression(0);
							if (oExpression.type === "#") { // got stream?
								throw that.composeError(Error(), "Unexpected stream at", oExpression.value, oExpression.pos);
							}
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
					throw that.composeError(Error(), "Expected closing parenthesis for argument list after", oPreviousToken.value, oToken.pos);
				}
				advance(")");
				return aArgs;
			},

			fnGetArgsInBrackets = function () {
				var aArgs;

				advance("[");
				aArgs = fnGetArgs(null, "]");
				if (oToken.type !== "]") {
					throw that.composeError(Error(), "Expected closing brackets for argument list after", oPreviousToken.value, oToken.pos);
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
				var oValue = oPreviousToken,
					sKeyOpts;

				if (sType) {
					oValue.type = sType;
				}

				if (oToken.type === "(") { // args in parenthesis?
					advance("(");
					oValue.args = fnGetArgs(oValue.type, ")");
					if (oToken.type !== ")") {
						throw that.composeError(Error(), "Expected closing parenthesis for argument list after", oPreviousToken.value, oToken.pos);
					}
					advance(")");
				} else { // no parenthesis?
					oValue.args = [];

					// if we have a check, make sure there are no non-optional parameters left
					sKeyOpts = BasicParser.mKeywords[oValue.type];
					if (sKeyOpts) {
						fnCheckRemainingTypes(sKeyOpts.substr(2).split(" "));
					}
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

		symbol("#"); // stream

		infixr("=", 30); // equal for comparison

		symbol("fn", function () { // separate fn
			var oValue = oPreviousToken;

			if (oToken.type === "identifier") {
				oToken.value = "fn" + oToken.value;
				oValue.left = oToken;
				advance();
			} else {
				throw that.composeError(Error(), "Expected identifier at", oToken.type, oToken.pos);
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
				oValue.args.push(fnCreateDummyArg());
			}
			advance("gosub");
			aLine = fnGetArgs("gosub"); // line number
			oValue.args.push(aLine[0]);
			return oValue;
		});

		stmt("chain", function () {
			var sName = "chain",
				bNumber = false, // line number found
				oValue, oValue2;

			if (oToken.type !== "merge") { // not chain merge?
				oValue = fnCreateCmdCall(sName);
			} else { // chain merge with optional DELETE
				advance("merge");
				oValue = oPreviousToken;
				sName = "chainMerge";
				oValue.type = sName;
				oValue.args = [];

				oValue2 = expression(0); // filename
				oValue.args.push(oValue2);

				if (oToken.type === ",") {
					advance(",");

					if (oToken.type === "number") {
						oValue2 = expression(0); // line number
						oValue2.type = "linenumber"; // number -> linenumber
						oValue.args.push(oValue2);
						bNumber = true;
					}

					if (oToken.type === ",") {
						advance(",");
						advance("delete");

						if (!bNumber) {
							oValue2 = fnCreateDummyArg(); // insert dummy arg for line
							oValue.args.push(oValue2);
						}

						oValue2 = fnGetLineRange();
						oValue2 = oValue2.args[0]; // we only want the line range and not the delete token
						oValue.args.push(oValue2);
					}
				}
			}
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

		stmt("data", function () {
			var oValue = oPreviousToken,
				bParameterFound = false;

			oValue.args = [];

			// data is special: it can have empty parameters, also the last parameter, and also if no parameters
			if (oToken.type !== "," && oToken.type !== "(eol)") {
				oValue.args.push(expression(0)); // take first argument
				bParameterFound = true;
			}

			while (oToken.type === ",") {
				if (!bParameterFound) {
					oValue.args.push(fnCreateDummyArg()); // insert null parameter
				}
				advance(",");
				bParameterFound = false;
				if (oToken.type === "(eol)") {
					break;
				} else if (oToken.type !== ",") {
					oValue.args.push(expression(0));
					bParameterFound = true;
				}
			}

			if (!bParameterFound) {
				oValue.args.push(fnCreateDummyArg()); // insert null parameter
			}

			/*
			if (oToken.type === "," || oToken.type === "(eol)") { // starts with "," or eol?
				oExpression = fnCreateDummyArg(); // insert null parameter
				oValue.args.push(oExpression);
			} else {
				oValue.args.push(expression(0)); // take first argument
			}

			while (oToken.type === ",") {
				advance(",");
				if (oToken.type === "," || oToken.type === "(eol)") { // no parameter?
					oExpression = fnCreateDummyArg(); // insert null parameter
					oValue.args.push(oExpression);
					if (oToken.type === "(eol)") {
						break;
					}
				}
				oExpression = expression(0);
				oValue.args.push(oExpression);
			}
			*/

			return oValue;
		});

		stmt("def", function () { // somehow special
			var oValue = oPreviousToken;

			if (oToken.type === "fn") { // fn <identifier> separate?
				advance("fn");
				if (oToken.type === "identifier") {
					oToken.value = "FN" + oToken.value;
					oValue.left = oToken;
				} else {
					throw that.composeError(Error(), "Invalid DEF at", oToken.type, oToken.pos);
				}
			} else if (oToken.type === "identifier" && Utils.stringStartsWith(oToken.value.toLowerCase(), "fn")) { // fn<identifier>
				oValue.left = oToken;
			} else {
				throw that.composeError(Error(), "Invalid DEF at", oToken.type, oToken.pos);
			}
			advance();

			oValue.args = (oToken.type === "(") ? fnGetArgsInParenthesis() : [];
			advance("=");

			oValue.right = expression(0);
			return oValue;
		});

		stmt("delete", function () {
			var oValue = fnGetLineRange();

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

			Utils.console.warn(that.composeError({}, "ELSE: Weird use of ELSE", oToken.type, oToken.pos).message);

			// TODO: data line as separate statement is taken
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
					oExpression = fnCreateDummyArg(); // insert null parameter
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
					oExpression = fnCreateDummyArg(); // insert null parameter
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
				oValue.args.push(fnCreateDummyArg());
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
				throw that.composeError(Error(), "Expected identifier at", oToken.type, oToken.pos);
			}
			oName = expression(90); // take simple identifier, nothing more
			oValue.args = [oName];
			if (oName.type !== "identifier") {
				throw that.composeError(Error(), "Expected simple identifier at", oToken.type, oToken.pos);
			}
			advance("=");
			oValue.args.push(expression(0));

			advance("to");
			oValue.args.push(expression(0));

			if (oToken.type === "step") {
				advance("step");
				oValue.args.push(expression(0));
			} else {
				oValue.args.push(fnCreateDummyArg()); // created
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
				throw that.composeError(Error(), "Expected PEN or PAPER at", oToken.type, oToken.pos);
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
						Utils.console.warn(that.composeError({}, "IF: Unreachable code after THEN", oToken2.type, oToken2.pos).message);
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
						Utils.console.warn(that.composeError({}, "IF: Unreachable code after ELSE", oToken2.type, oToken2.pos).message);
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
				oValue2, oStream;

			oValue.args = [];

			oStream = fnGetOptionalStream();
			oValue.args.push(oStream);
			if (oStream.len !== 0) { // not an inserted stream?
				advance(",");
			}

			oValue.args.push({ // create
				type: "string",
				value: (oToken.type === ";") ? ";" : "",
				len: 0
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
					throw that.composeError(Error(), "Expected ; or , at", oToken.type, oToken.pos);
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
					throw that.composeError(Error(), "Expected identifier at", oToken.type, oToken.pos);
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
				throw that.composeError(Error(), "Expected identifier at", oToken.type, oToken.pos);
			}
			oValue.left = expression(90); // take it (can also be an array) and stop
			advance("="); // equal as assignment
			oValue.right = expression(0);
			return oValue;
		});

		stmt("line", function () {
			var oValue = oPreviousToken,
				sText = "",
				oValue2, oStream;

			advance("input");

			oValue.type = "lineInput";
			oValue.args = [];

			oStream = fnGetOptionalStream();
			oValue.args.push(oStream);
			if (oStream.len !== 0) { // not an inserted stream?
				advance(",");
			}

			oValue.args.push({ // create
				type: "string",
				value: (oToken.type === ";") ? ";" : "",
				len: 0
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
					throw that.composeError(Error(), "Expected ; or , at", oToken.type, oToken.pos);
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
				throw that.composeError(Error(), "Expected identifier at", oToken.type, oToken.pos);
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

		stmt("list", function () {
			var oValue = fnGetLineRange(),
				oStream;

			if (oToken.type === ",") {
				advance(",");
			}

			oStream = fnGetOptionalStream();
			oValue.args.unshift(oStream); // set as first parameter

			return oValue;
		});

		stmt("mid$", function () { // mid$Assign
			var oValue = { // create
					type: "assign",
					pos: oToken.pos,
					len: 0
				},
				oMid, oRight;

			oMid = fnCreateFuncCall("mid$Assign");
			if (oMid.args[0].type !== "identifier") {
				throw that.composeError(Error(), "Expected identifier at", oMid.args[0].type, oMid.args[0].pos);
			}

			if (oMid.args.length < 3) {
				oMid.args.push(fnCreateDummyArg()); // add dummy parameter for iLen
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
					throw that.composeError(Error(), "Expected GOSUB, CONT or STOP", oToken.type, oToken.pos);
				}
			} else if (oToken.type === "error") { // on error goto
				advance("error");
				if (oToken.type === "goto") {
					advance("goto");
					oValue.type = "onErrorGoto";
					oValue.args = fnGetArgs(oValue.type);
				} else {
					throw that.composeError(Error(), "Expected GOTO", oToken.type, oToken.pos);
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
					throw that.composeError(Error(), "Expected GOSUB", oToken.type, oToken.pos);
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
					throw that.composeError(Error(), "Expected GOTO or GOSUB", oToken.type, oToken.pos);
				}
			}
			return oValue;
		});

		stmt("print", function () {
			var oValue = oPreviousToken,
				bTrailingSemicolon = false,
				iSpcOrTabEnd = 0,
				bCommaAfterStream = false,
				oValue2, t, oStream;

			oValue.args = [];

			oStream = fnGetOptionalStream();
			oValue.args.push(oStream);
			if (oStream.len !== 0) { // not an inserted stream?
				bCommaAfterStream = true;
			}

			while (oToken.type !== ":" && oToken.type !== "(eol)" && oToken.type !== "(end)" && oToken.type !== "'") {
				if (bCommaAfterStream) {
					advance(",");
					bCommaAfterStream = false;
				}
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

			bTrailingSemicolon = (oPreviousToken.type === ";" || oPreviousToken.type === "commaTab");
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
				throw that.composeError(Error(), "Expected INK, KEY or WRITE", oToken.type, oToken.pos);
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


		// line
		iIndex = 0;
		advance();
		while (oToken.type !== "(end)") {
			aParseTree.push(line());
		}
		return aParseTree;
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = BasicParser;
}
