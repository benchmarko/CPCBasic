// CpcVm.js - CPC Virtual Machine
//
/* globals */

"use strict";

var Random, Utils;

if (typeof require !== "undefined") {
	Random = require("./Random.js"); // eslint-disable-line global-require
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

function CpcVm(options, oCanvas) {
	this.iStartTime = Date.now();
	this.oRandom = new Random();
	this.lastRnd = 0.1; // TODO this.oRandom.random();
	this.vmInit(options);
	this.oCanvas = oCanvas;
}

CpcVm.prototype = {
	vmInit: function (options) {
		var i;

		this.options = options || {};

		this.iNextFrameTime = Date.now() + this.iFrameTimeMs;
		//this.iLoopCount = 0;

		this.iLine = 0;

		this.bStop = false;
		this.sStopLabel = "";
		this.iStopPriority = 0;

		this.sOut = "";

		this.aData = [];
		this.iData = 0;
		this.oDataLineIndex = {
			0: 0 // for line 0: index 0
		};

		this.iErr = 0;
		this.iErl = 0;
		// this.iStartTime = Date.now();
		this.oGosubStack = [];
		this.bDeg = false;
		this.iHimem = 42619; // example

		this.aTimer = []; // timer 0..3
		for (i = 0; i < 4; i += 1) {
			this.aTimer.push({
				iId: i,
				iLine: 0,
				iRepeat: 0,
				iInterval: 0,
				bActive: false,
				iNextTime: 0
			});
		}

		this.aWindow = [];
		for (i = 0; i < 8; i += 1) {
			this.aWindow.push({ // depends on mode
				iId: i,
				iLeft: 0,
				iRight: 0,
				iTop: 0,
				iBottom: 0,
				iPos: 0, // current text position in line
				iVpos: 0,
				iPaper: 0,
				iPen: 1
			});
		}

		this.iZone = 13;

		this.v = options.variables || {};
	},

	iFrameTimeMs: 1000 / 50, // 50 Hz

	/*
	vmDefault: function () {
		this.sOut += "Line not found: " + this.iLine;
		this.bStop = true;
	},
	*/

	vmGetError: function (iErr) {
		var aErrors = [
				"Improper argument", // 0
				"Unexpected NEXT", // 1
				"Syntax Error", // 2
				"Unexpected RETURN", // 3
				"DATA exhausted", // 4
				"Improper argument", // 5
				"Overflow", // 6
				"Memory full", // 7
				"Line does not exist", // 8
				"Subscript out of range", // 9
				"Array already dimensioned", // 10
				"Division by zero", // 11
				"Invalid direct command", // 12
				"Type mismatch", // 13
				"String space full", // 14
				"String too long", // 15
				"String expression too complex", // 16
				"Cannot CONTinue", // 17
				"Unknown user function", // 18
				"RESUME missing", // 19
				"Unexpected RESUME", // 20
				"Direct command found", // 21
				"Operand missing", // 22
				"Line too long", // 23
				"EOF met", // 24
				"File type error", // 25
				"NEXT missing", // 26
				"File already open", // 27
				"Unknown command", // 28
				"WEND missing", // 29
				"Unexpected WEND", // 30
				"File not open", // 31,
				"Broken in", // 32
				"Unknown error" // 33...
			],
			sError = aErrors[iErr] || aErrors[aErrors.length - 1]; // Unknown error

		return sError;
	},

	vmCheckTimer: function (iTime) {
		var oTimer, i;

		for (i = 3; i >= 0; i -= 1) {
			oTimer = this.aTimer[i];
			if (oTimer.bActive && iTime > oTimer.iNextTime) {
				this.gosub(this.iLine, oTimer.iLine);
				if (!oTimer.bRepeat) { // not repeating
					oTimer.bActive = false;
				} else {
					oTimer.iNextTime += oTimer.iInterval * 1000 / 50; //TTT
				}
			}
		}
	},

	vmCheckNextFrame: function () {
		var iTime = Date.now(),
			iDelta,
			iTimeUntilFrame;

		if (iTime > this.iNextFrameTime) {
			iDelta = iTime - this.iNextFrameTime;
			if (iDelta > this.iFrameTimeMs) {
				this.iNextFrameTime += this.iFrameTimeMs * Math.ceil(iDelta / this.iFrameTimeMs);
			} else {
				this.iNextFrameTime += this.iFrameTimeMs;
			}
			this.vmCheckTimer(iTime);
		}

		iTimeUntilFrame = this.iNextFrameTime - iTime;
		return iTimeUntilFrame;
	},

	vmLoopCondition: function () {
		var iTime = Date.now();

		/*
		var iMaxLoops = 1000;

		this.iLoopCount += 1;
		if (this.iLoopCount >= iMaxLoops) {
			this.vmStop("counter", 20);
		}
		*/
		if (iTime > this.iNextFrameTime) {
			this.vmStop("timer", 20);
		}
		return !this.bStop;
	},

	fnGetVarDefault: function (sName) {
		var iArrayIndices = sName.split("A").length - 1,
			bIsString = sName.includes("$"),
			value, aValue, i;

		value = bIsString ? "" : 0;
		if (iArrayIndices) {
			aValue = [];
			for (i = 0; i <= 10; i += 1) { // arrays without declaration
				aValue.push(value);
			}
			value = aValue;
		}
		return value;
	},

	fnCreateNDimArray: function (length) {
		var arr = new Array(length || 0),
			initVal = this.initVal, //TTT
			i,
			aArgs;


		length = length || 0;
		for (i = 0; i < length; i += 1) {
			arr[i] = initVal;
		}

		i = length;
		if (arguments.length > 1) {
			aArgs = Array.prototype.slice.call(arguments, 1);
			while (i) {
				i -= 1;
				arr[length - 1 - i] = this.fnCreateNDimArray.apply(this, aArgs);
			}
		}
		return arr;
	},

	vmInitVariables: function () {
		var aVariables = Object.keys(this.v),
			i, sName;

		for (i = 0; i < aVariables.length; i += 1) {
			sName = aVariables[i];
			this.v[sName] = this.fnGetVarDefault(sName); //Utils.stringEndsWith(sName, "$") ? "" : 0;
		}
	},

	vmStop: function (sLabel, iStopPriority) {
		iStopPriority = iStopPriority || 0;
		this.bStop = true;
		if (sLabel === "end") {
			iStopPriority = 90;
			this.iLine = sLabel;
		}
		if (iStopPriority > this.iStopPriority) {
			this.iStopPriority = iStopPriority;
			this.sStopLabel = sLabel; // || this.iLine;
		}
	},

	vmNotImplemented: function (sName) {
		Utils.console.warn("Not implemented: " + sName);
	},

	// not complete
	vmUsingFormat1: function (sFormat, arg) {
		var sPadChar = " ",
			iPadLen, sPad, aFormat,
			sStr;

		if (typeof arg === "string") {
			if (sFormat === "&") {
				sStr = arg;
			} else if (sFormat === "!") {
				sStr = arg.charAt(0);
			} else {
				sStr = arg.substr(0, sFormat.length); // assuming "\...\"
				iPadLen = sFormat.length - arg.length;
				sPad = (iPadLen > 0) ? sPadChar.repeat(iPadLen) : "";
				sStr = sPad + arg;
			}
		} else { // number
			if (sFormat.indexOf(".") < 0) { // no decimal point?
				arg = Number(arg).toFixed(0);
			} else { // assume ###.##
				aFormat = sFormat.split(".", 2);
				arg = Number(arg).toFixed(aFormat[1].length);
			}
			iPadLen = sFormat.length - arg.length; //ph.width - (sign + arg).length;
			sPad = (iPadLen > 0) ? sPadChar.repeat(iPadLen) : "";
			sStr = sPad + arg;
			if (sStr.length > sFormat.length) {
				sStr = "%" + sStr; // mark too long
			}
		}
		return sStr;
	},

	abs: function (n) {
		return Math.abs(n);
	},

	afterGosub: function (iInterval, iTimer, iLine) {
		var oTimer = this.aTimer[iTimer];

		oTimer.iInterval = iInterval;
		oTimer.iLine = iLine;
		oTimer.bRepeat = false;
		oTimer.bActive = true;
		oTimer.iNextTime = Date.now() + iInterval;
		//this.vmNotImplemented("everyGosub");
		//this.vmNotImplemented("afterGosub");
	},

	// and

	asc: function (s) {
		return String(s).charCodeAt(0);
	},

	atn: function (n) {
		return Math.atan((this.bDeg) ? Utils.toRadians(n) : n);
	},

	auto: function () {
		this.vmNotImplemented("auto");
	},

	bin$: function (n, iPad) {
		return (n >>> 0).toString(2).padStart(iPad || 16, 0); // eslint-disable-line no-bitwise
	},

	border: function (iInk1, iInk2) { // ink2 optional
		this.vmNotImplemented("border");
	},

	// break

	call: function (n) { // TODO adr + parameters
		if (n === 0xbd19) { // frame
			this.frame();
		} else if (n === 0xbb18) { // wait for any key
			if (this.inkey$() === "") { // no key?
				//TODO: wait for key
				this.vmStop("key", 30); //TODO
			}
		} else {
			Utils.console.log("Ignored: call ", n);
		}
	},

	cat: function () {
		this.vmNotImplemented("cat");
	},

	chain: function () {
		this.vmNotImplemented("chain, chain merge");
	},

	chr$: function (n) {
		return String.fromCharCode(n);
	},

	cint: function (n) {
		return Math.round(n);
	},

	clear: function () {
		this.vmInitVariables();
		this.rad();
	},

	clearInput: function () {
		this.oCanvas.clearInput();
	},

	clg: function () {
		this.vmNotImplemented("clg");
	},

	closein: function () {
		this.vmNotImplemented("closein");
	},

	closeout: function () {
		this.vmNotImplemented("closeout");
	},

	cls: function (iStream) {
		iStream = iStream || 0;
		this.sOut = "";
		this.oCanvas.cls(); //TTT
	},

	cont: function () {
		this.vmNotImplemented("cont");
	},

	copychr$: function (iStream) {
		iStream = iStream || 0;
		this.vmNotImplemented("copychr$");
	},

	cos: function (n) {
		return Math.cos((this.bDeg) ? Utils.toRadians(n) : n);
	},

	creal: function (n) {
		return n; // TODO
	},

	cursor: function () {
		this.vmNotImplemented("cursor");
	},

	data: function () { // varargs
		var iLine, i;

		iLine = arguments[0]; // line number
		if (!this.oDataLineIndex[iLine]) {
			this.oDataLineIndex[iLine] = this.aData.length; // current index
		}
		// append data
		for (i = 1; i < arguments.length; i += 1) {
			this.aData.push(arguments[i]);
		}
	},

	dec$: function () {
		this.vmNotImplemented("dec$");
	},

	// def fn

	defint: function () {
		this.vmNotImplemented("defint");
	},

	defreal: function () {
		this.vmNotImplemented("defreal");
	},

	defstr: function () {
		this.vmNotImplemented("defstr");
	},

	deg: function () {
		this.bDeg = true;
	},

	"delete": function () {
		this.vmNotImplemented("delete");
	},

	derr: function () {
		return 0; // "[Not implemented yet: derr]"
	},

	di: function () {
		this.vmNotImplemented("di");
	},

	dim: function (sVar) { // varargs
		var aArgs = [],
			bIsString = sVar.includes("$"),
			varDefault = (bIsString) ? "" : 0,
			i;

		//aArgs = Array.prototype.slice.call(arguments, 0);
		for (i = 1; i < arguments.length; i += 1) {
			aArgs.push(arguments[i] + 1); // for basic we have sizes +1
		}
		this.initVal = varDefault; //TTT fast hack
		return this.fnCreateNDimArray.apply(this, aArgs);
	},

	draw: function (x, y) {
		this.oCanvas.addPath({
			t: "l",
			x: x,
			y: y
		});
	},

	drawr: function (x, y) {
		this.oCanvas.addPath({
			t: "l",
			x: x,
			y: y,
			r: true
		});
	},

	edit: function () {
		this.vmNotImplemented("edit");
	},

	ei: function () {
		this.vmNotImplemented("ei");
	},

	// else

	end: function (sLabel) {
		this.stop(sLabel);
	},

	ent: function () {
		this.vmNotImplemented("ent");
	},

	env: function () {
		this.vmNotImplemented("env");
	},

	eof: function () {
		this.vmNotImplemented("eof");
	},

	erase: function () {
		this.vmNotImplemented("erase");
	},

	erl: function () {
		return this.iErl;
	},

	err: function () {
		return this.iErr;
	},

	error: function (iErr) {
		var sError;

		this.iErr = iErr;
		this.iErl = this.iLine;

		sError = this.vmGetError(iErr);
		this.sOut += sError + " in " + this.iErl + "\n";
		this.vmStop("error", 50);
	},

	/*
	everyGosub: function (iInterval) { // varargs
		var iTimer = 0,
			iLine;

		if (arguments.length > 2) {
			iTimer = arguments[1];
			iLine = arguments[2];
		} else {
			iLine = arguments[1];
		}
		this.vmNotImplemented("everyGosub");
	},
	*/

	everyGosub: function (iInterval, iTimer, iLine) {
		var oTimer = this.aTimer[iTimer];

		oTimer.iInterval = iInterval;
		oTimer.iLine = iLine;
		oTimer.bRepeat = true;
		oTimer.bActive = true;
		oTimer.iNextTime = Date.now() + iInterval;
		//this.vmNotImplemented("everyGosub");
	},

	exp: function (n) {
		return Math.exp(n);
	},

	fill: function () {
		this.oCanvas.addPath({
			t: "f", // type: fill
			c: "red" //TODO
		});
	},

	fix: function (n) {
		return Math.trunc(n); // (ES6: Math.trunc)
	},

	// fn

	// for

	frame: function () {
		this.vmStop("frame", 40);
	},

	fre: function (/* n */) {
		return 42245; // example
	},

	gosub: function (retLabel, n) {
		this.iLine = n;
		this.oGosubStack.push(retLabel);
	},

	"goto": function (n) {
		this.iLine = n;
	},

	graphicsPaper: function () {
		this.vmNotImplemented("graphicsPaper");
	},

	graphicsPen: function () {
		this.vmNotImplemented("graphicsPen");
	},

	hex$: function (n, iPad) {
		return (n >>> 0).toString(16).padStart(iPad || 16, 0); // eslint-disable-line no-bitwise
	},

	himem: function () {
		return this.iHimem;
	},

	// if

	ink: function () {
		this.vmNotImplemented("ink");
	},

	inkey: function (n) {
		this.vmNotImplemented("inkey");
		return -1; //TTT
	},

	inkey$: function () {
		var iCode = this.oCanvas.getKeyFromBuffer(),
			sInput = "";

		if (iCode !== -1) {
			sInput = String.fromCharCode(iCode);
			if (iCode === 0) {
				sInput += String.fromCharCode(this.oCanvas.getKeyFromBuffer());
			}
		}
		return sInput;
	},

	inp: function () {
		this.vmNotImplemented("inp");
	},

	input: function (iStream, sMsg, sVar) {
		var sInput;

		Utils.console.log("input:");
		// a simple input via prompt
		sInput = window.prompt(sMsg + " " + sVar); // eslint-disable-line no-alert
		if (sInput === null) {
			sInput = "";
		}
		if (sVar.indexOf("$") < 0) { //TTT no string?
			sInput = Number(sInput);
		}
		return sInput;
	},

	instr: function (p1, p2, p3) { // optional startpos as first parameter
		if (typeof p1 === "string") {
			return p1.indexOf(p2) + 1;
		}
		return p2.indexOf(p3, p1) + 1;
	},

	"int": function (n) {
		return Math.floor(n);
	},

	joy: function () {
		this.vmNotImplemented("joy");
	},

	key: function () {
		this.vmNotImplemented("key");
	},

	keyDef: function () {
		this.vmNotImplemented("keyDef");
	},

	left$: function (s, iLen) {
		return s.substr(0, iLen);
	},

	len: function (s) {
		return s.length;
	},

	let: function () {
		this.vmNotImplemented("let");
	},

	lineInput: function (iStream, sMsg, sVar) { // sVar must be string variable
		var sInput;

		Utils.console.log("lineInput:");
		// a simple input via prompt
		sInput = window.prompt(sMsg + " " + sVar); // eslint-disable-line no-alert
		if (sInput === null) {
			sInput = "";
		}
		return sInput;
	},

	list: function () {
		this.vmNotImplemented("list");
	},

	load: function () {
		this.vmNotImplemented("load");
	},

	locate: function () {
		this.vmNotImplemented("locate");
		//Utils.console.log("locate: ", n, x, y, "(not implemented)");
	},

	log: function (n) {
		return Math.log(n);
	},

	log10: function (n) {
		return Math.log10(n);
	},

	lower$: function (s) {
		return s.toLowerCase();
	},

	mask: function () {
		this.vmNotImplemented("mask");
	},

	max: function () { // varargs
		return Math.max.apply(null, arguments);
	},

	memory: function (n) {
		this.iHimem = n;
	},

	merge: function () {
		this.vmNotImplemented("merge");
	},

	mid$: function (s, iStart, iLen) { // as function
		return s.substr(iStart - 1, iLen);
	},

	mid$Cmd: function () {
		this.vmNotImplemented("mid$ as cmd");
	},

	min: function () { // varargs
		return Math.min.apply(null, arguments);
	},

	// mod

	mode: function (n) {
		this.sOut = "";
		this.oCanvas.mode(n);
	},

	move: function (x, y) {
		this.oCanvas.addPath({
			t: "m",
			x: x,
			y: y
		});
	},

	mover: function (x, y) {
		this.oCanvas.addPath({
			t: "m",
			x: x,
			y: y,
			r: true
		});
	},

	"new": function () {
		this.vmNotImplemented("new");
	},

	// next

	// not

	// on break cont

	// on break gosub

	// on break stop

	// on error goto

	onGosub: function (retLabel, n) { // varargs
		this.iLine = arguments[n + 1]; // n=1...; start with argument 2
		this.oGosubStack.push(retLabel);
	},

	onGoto: function (n) { // varargs
		this.iLine = arguments[n];
	},

	// on sq gosub

	openin: function () {
		this.vmNotImplemented("openin");
	},

	openout: function () {
		this.vmNotImplemented("openout");
	},

	// or

	origin: function () {
		this.vmNotImplemented("origin");
	},

	out: function () {
		this.vmNotImplemented("out");
	},

	paper: function () {
		this.vmNotImplemented("paper");
	},

	peek: function () {
		this.vmNotImplemented("peek");
		return 0;
	},

	pen: function () {
		this.vmNotImplemented("pen");
	},

	pi: function () {
		return Math.PI; // or less precise: 3.14159265
	},

	plot: function (x, y) { // TODO: up to 4 parameters
		this.oCanvas.addPath({
			t: "p",
			x: x,
			y: y
		});
	},

	plotr: function (x, y) {
		this.oCanvas.addPath({
			t: "p",
			x: x,
			y: y,
			r: true
		});
	},

	poke: function () {
		this.vmNotImplemented("poke");
	},

	pos: function (iStream) {
		iStream = iStream || 0;
		return this.aWindow[iStream].iPos;
	},

	print: function (iStream) { // varargs
		var oWin = this.aWindow[iStream],
			sStr, i, iLf;

		for (i = 1; i < arguments.length; i += 1) {
			sStr = String(arguments[i]);
			this.sOut += sStr;

			iLf = sStr.indexOf("\n");
			if (iLf >= 0) {
				oWin.iPos = sStr.length - iLf; // TODO: tab in same print is already called, should depend on what is already printed
			} else {
				oWin.iPos += sStr.length;
			}
		}
		//this.sOut += s;
	},

	rad: function () {
		this.bDeg = false;
	},

	randomize: function (n) {
		var sInput;

		if (n === undefined) {
			// a simple input via prompt
			sInput = window.prompt("Random number seed?"); // eslint-disable-line no-alert
			if (!sInput) {
				sInput = 1;
			}
			n = Number(sInput);
		}
		Utils.console.log("randomize: " + n);
		this.oRandom.init(n);
	},

	read: function (sVar) {
		var item = 0;

		if (this.iData < this.aData.length) {
			item = this.aData[this.iData];
			this.iData += 1;
			if (sVar.indexOf("$") < 0) { //TTT no string?
				item = Number(item);
			}
		} else {
			this.error(4); // DATA exhausted
		}
		return item;
	},

	release: function () {
		this.vmNotImplemented("release");
	},

	// rem

	remain: function (iTimer) {
		var oTimer = this.aTimer[iTimer],
			iTime = 0;

		if (oTimer.bActive) {
			iTime = oTimer.iNextTime - Date.now();
			iTime /= 1000 / 50;
			oTimer.bActive = false;
		}
		return iTime;
	},

	renum: function () {
		this.vmNotImplemented("renum");
	},

	restore: function (iLine) {
		iLine = iLine || 0;
		if (iLine in this.oDataLineIndex) {
			this.iData = this.oDataLineIndex[iLine];
		} else {
			this.error(8); // Line does not exist
		}
	},

	resume: function () { // resume, resume n, resume next
		this.vmNotImplemented("resume");
	},

	"return": function () {
		var retLabel = this.oGosubStack.pop();

		if (retLabel === undefined) {
			this.error(3); // Unexpected Return [in <line>]
		}
		this.iLine = retLabel;
	},

	right$: function (s, iLen) {
		return s.slice(-iLen);
	},

	rnd: function (n) {
		var x;

		if (n < 0) { // TODO
			x = this.lastRnd;
		} else if (n === 0) {
			x = this.lastRnd;
		} else { // >0 or undefined
			x = this.oRandom.random();
			this.lastRnd = x;
		}
		return x;
	},

	round: function (n, iDecimals) {
		var iFact;

		iDecimals = iDecimals || 0;
		if (iDecimals >= 0) {
			iFact = Math.pow(10, iDecimals);
		} else {
			iFact = 1 / Math.pow(10, -iDecimals);
		}
		return Math.round(n * iFact) / iFact;
		// TEST: or to avoid rounding errors: return Number(Math.round(value + "e" + iDecimals) + "e-" + iDecimals); // https://www.jacklmoore.com/notes/rounding-in-javascript/
	},

	rsxBasic: function () {
		this.vmNotImplemented("|BASIC");
	},

	rsxCpm: function () {
		this.vmNotImplemented("|CPM");
	},

	run: function () {
		this.vmNotImplemented("run");
	},

	save: function () {
		this.vmNotImplemented("save");
	},

	sgn: function (n) {
		return Math.sign(n);
	},

	sin: function (n) {
		return Math.sin((this.bDeg) ? Utils.toRadians(n) : n);
	},

	sound: function () {
		this.vmNotImplemented("sound");
	},

	space$: function (n) {
		return " ".repeat(n);
	},

	spc: function (n) {
		return " ".repeat(n);
	},

	speedInk: function () {
		this.vmNotImplemented("speedInk");
	},

	speedKey: function () {
		this.vmNotImplemented("speedKey");
	},

	speedWrite: function () {
		this.vmNotImplemented("speedWrite");
	},

	sq: function () {
		this.vmNotImplemented("sq");
	},

	sqr: function (n) {
		return Math.sqrt(n);
	},

	// step

	stop: function (sLabel) {
		this.iLine = sLabel;
		this.vmStop("stop", 60);
	},

	str$: function (n) {
		return String(n);
	},

	string$: function (iLen, chr) {
		if (typeof chr === "number") {
			chr = String.fromCharCode(chr); // chr$
		}
		return chr.repeat(iLen);
	},

	// swap (window swap)

	symbol: function () {
		this.vmNotImplemented("symbol");
	},

	symbolAfter: function () {
		this.vmNotImplemented("symbolAfter");
	},

	tab: function (n) {
		if (n === undefined) { // simulated tab in print for ","
			n = this.iZone;
		}
		return " ".repeat(n); // TODO: adapt spaces for next tab position
	},

	tag: function (iStream) {
		iStream = iStream || 0;
		this.vmNotImplemented("tag");
	},

	tagoff: function (iStream) {
		iStream = iStream || 0;
		this.vmNotImplemented("tagoff");
	},

	tan: function (n) {
		return Math.tan((this.bDeg) ? Utils.toRadians(n) : n);
	},

	test: function (x, y) {
		//this.vmNotImplemented("test");
		return this.oCanvas.addPath({
			t: "t",
			x: x,
			y: y
		});
	},

	testr: function (x, y) {
		//this.vmNotImplemented("testr");
		return this.oCanvas.addPath({
			t: "t",
			x: x,
			y: y,
			r: true
		});
	},

	// then

	time: function () {
		return Math.floor((Date.now() - this.iStartTime) * 300 / 1000);
	},

	// to

	troff: function () {
		this.vmNotImplemented("troff");
	},

	tron: function () {
		this.vmNotImplemented("tron");
	},

	unt: function (n) {
		if (n > 32767) {
			n -= 65536;
		}
		return n;
	},

	upper$: function (s) {
		return s.toUpperCase();
	},

	using: function (sFormat) { // varargs
		var reFormat = /(!|&|\\ *\\|#+\.?#*[+-]?)/,
			s = "",
			aFormat, i;

		aFormat = sFormat.split(reFormat);
		i = 1;
		while (aFormat.length) {
			s += aFormat.shift();
			if (aFormat.length) {
				s += this.vmUsingFormat1(aFormat.shift(), arguments[i]);
			}
			i += 1;
		}
		return s;
	},

	val: function (s) {
		return parseFloat(s);
	},

	vpos: function (iStream) { //TTT
		iStream = iStream || 0;
		return this.aWindow[iStream].iVpos;
	},

	wait: function (iPort /* , iMask, iInv */) {
		if (iPort === 0) {
			debugger;
		}
	},

	// wend

	// while

	width: function () {
		this.vmNotImplemented("width");
	},

	window: function (iStream, iLeft, iRight, iTop, iBottom) {
		var oWin = this.aWindow[iStream];

		oWin.left = Math.min(iLeft, iRight);
		oWin.right = Math.max(iLeft, iRight);
		oWin.top = Math.max(iTop, iBottom);
		oWin.bottom = Math.min(iTop, iBottom);
		//this.vmNotImplemented("window");
	},

	windowSwap: function (iStream1, iStream2) {
		var oTemp = this.aWindow[iStream1];

		this.aWindow[iStream1] = this.aWindow[iStream2];
		this.aWindow[iStream2] = oTemp;
	},

	write: function (iStream) { // varargs
		this.vmNotImplemented("write");
	},

	// xor

	xpos: function () {
		return this.oCanvas.getXpos();
	},

	ypos: function () {
		return this.oCanvas.getYpos();
	},

	zone: function (n) {
		this.iZone = n;
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = CpcVm;
}
