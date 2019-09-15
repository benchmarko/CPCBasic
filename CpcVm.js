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
	this.oCanvas = oCanvas;
	this.vmInit(options);
}

CpcVm.prototype = {
	iFrameTimeMs: 1000 / 50, // 50 Hz => 20 ms

	mWinData: [ // window data for mode mode 0,1,2 (we are counting from 0 here)
		{
			iLeft: 0,
			iRight: 19,
			iTop: 0,
			iBottom: 24
		},
		{
			iLeft: 0,
			iRight: 39,
			iTop: 0,
			iBottom: 24
		},
		{
			iLeft: 0,
			iRight: 79,
			iTop: 0,
			iBottom: 24
		},
		{
			iLeft: 0, // mode 3 not available on CPC
			iRight: 79,
			iTop: 0,
			iBottom: 24
		}
	],

	vmInit: function (options) {
		var i;

		this.options = options || {};

		this.iNextFrameTime = Date.now() + this.iFrameTimeMs; // next time of frame fly
		this.iTimeUntilFrame = 0;
		this.iStopCount = 0;

		this.iLine = 0; // current line number (or label)

		this.sStopLabel = ""; // stop label or reason
		this.iStopPriority = 0; // stop priority (higher number means higher priority which can overwrite lower priority)
		// special stop labels and priorities:
		// "timer": 20 (timer expired)
		// "key": 30  (wait for key)
		// "frame": 40 (frame command: wait for frame fly)
		// "input": 45  (wait for input: input, line input, randomize without parameter)
		// "error": 50 (BASIC error, error command)
		// "stop": 60 (stop or end command)
		// "break": 80 (break pressed)
		// "end": 90 (end of program)
		// "reset": 99 (reset canvas)
		this.fnInputCallback = null; // callback for stop reason "input"
		this.aInputValues = [];

		this.sOut = ""; // console output

		this.aData = []; // array for BASIC data lines (continuous)
		this.iData = 0; // current index
		this.oDataLineIndex = { // line number index for the data line buffer
			0: 0 // for line 0: index 0
		};

		this.iErr = 0; // last error code
		this.iErl = 0; // line of last error

		this.oGosubStack = []; // stack of line numbers for gosub/return
		this.bDeg = false; // degree or radians


		this.aMem = []; // for peek, poke
		this.iHimem = 42619; // high memory limit, just an example

		this.aTimer = []; // BASIC timer 0..3 (3 has highest priority)
		for (i = 0; i < 4; i += 1) {
			this.aTimer.push({
				iId: i,
				iLine: 0, // gosub line when timer expires
				bRepeat: false, // flag if timer is repeating (every) or one time (after)
				iIntervalMs: 0, // interval or timeout
				bActive: false, // flag if timer is active
				iNextTime: 0, // next expiration time
				bHandlerRunning: false, // flag if handler (subroutine) is running
				iStackIndexReturn: 0 // index in gosub stack with return, if handler is running
			});
		}
		this.bTimersDisabled = false; // flag if timers are disabled

		this.iStatFrameCount = 0; // debugging
		this.iStatFrameCountTs = 0; // debugging

		this.aWindow = [];

		this.iZone = 13; // print tab zone value

		this.v = options.variables || {}; // collection of BASIC variables

		this.iMode = null;
		this.mode(1);
		this.sInput = ""; // input handling
	},

	vmGetError: function (iErr) { // BASIC error numbers
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
				"Broken in", // 32  (derr=146: xxx not found)
				"Unknown error" // 33...
			],
			sError = aErrors[iErr] || aErrors[aErrors.length - 1]; // Unknown error

		return sError;
	},

	vmReset: function () {
		this.oCanvas.reset();
	},

	vmGotoLine: function (line, sMsg) {
		if (Utils.debug > 3) {
			if (typeof line === "number" || Utils.debug > 5) { // non-number labels only in higher debug levels
				Utils.console.debug("DEBUG: vmGotoLine: " + sMsg + ": " + line);
			}
		}
		this.iLine = line;
	},

	vmCheckTimer: function (iTime) {
		var iDelta, oTimer, i;

		if (this.bTimersDisabled) { // BASIC timers are disabled?
			return;
		}
		for (i = 3; i >= 0; i -= 1) { // check timers starting with highest priority first
			oTimer = this.aTimer[i];
			/* TTT
			if (oTimer.bHandlerRunning) { // a running handler will also block other timer
				break;
			}
			*/
			if (oTimer.bActive && !oTimer.bHandlerRunning && iTime > oTimer.iNextTimeMs) { // timer expired?
				this.gosub(this.iLine, oTimer.iLine);
				oTimer.bHandlerRunning = true;
				oTimer.iStackIndexReturn = this.oGosubStack.length; //TTT
				if (!oTimer.bRepeat) { // not repeating
					oTimer.bActive = false;
				} else {
					iDelta = iTime - oTimer.iNextTimeMs;
					oTimer.iNextTimeMs += oTimer.iIntervalMs * Math.ceil(iDelta / oTimer.iIntervalMs);
				}
				break; // TODO: found expired timer. What happens with timers with lower priority?
			}
		}
	},

	vmCheckTimerHandlers: function () {
		var i, oTimer;

		for (i = 3; i >= 0; i -= 1) {
			oTimer = this.aTimer[i];
			if (oTimer.bHandlerRunning) {
				if (oTimer.iStackIndexReturn > this.oGosubStack.length) {
					oTimer.bHandlerRunning = false;
					oTimer.iStackIndexReturn = 0;
				}
			}
		}
	},

	vmStatStart: function () {
		var iTime = Date.now();

		this.iStatFrameCount = 0;
		this.iStatFrameCountTs = iTime;
	},

	vmStatStop: function () {
		var iTime = Date.now(),
			iDelta = iTime - this.iStatFrameCountTs,
			iFps = this.iStatFrameCount * 1000 / iDelta;

		return iFps;
	},

	vmCheckNextFrame: function (iTime) {
		var //iTime = Date.now(),
			iDelta,
			iTimeUntilFrame;

		//if (this.oStatCheckFrame) {
		//	this.oStatCheckFrame.collect(1);
		//}
		if (iTime >= this.iNextFrameTime) { // next time of frame fly
			iDelta = iTime - this.iNextFrameTime;
			if (Utils.debug) {
				this.iStatFrameCount += 1;
			}

			if (iDelta > this.iFrameTimeMs) {
				this.iNextFrameTime += this.iFrameTimeMs * Math.ceil(iDelta / this.iFrameTimeMs);
			} else {
				this.iNextFrameTime += this.iFrameTimeMs;
			}
			//if (Utils.debug > 2) {
			//	Utils.console.debug("DEBUG: vmCheckNextFrame: iDelta=" + iDelta); //TTT TTT
			//}
			this.vmCheckTimer(iTime); // check BASIC timers
		}

		//iTimeUntilFrame = this.iNextFrameTime - iTime;
		//this.iTimeUntilFrame = iTimeUntilFrame; //TTT
	},

	vmGetTimeUntilFrame: function (iTime) {
		var iTimeUntilFrame;

		iTime = iTime || Date.now();
		iTimeUntilFrame = this.iNextFrameTime - iTime;
		return iTimeUntilFrame;
	},

	vmLoopCondition: function () {
		var iTime = Date.now();

		if (iTime >= this.iNextFrameTime) {
			this.vmCheckNextFrame(iTime);
			this.iStopCount += 1;
			if (this.iStopCount >= 5) { // do not stop too often because of just timer resason because setTimeout is expensive
				this.iStopCount = 0;
				this.vmStop("timer", 20);
			}
			//this.vmStop("timer", 20);
		}
		return this.sStopLabel === "";
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
			initVal = this.initVal,
			i, aArgs;

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

	vmInitWindowData: function () {
		var oData = {
				iPos: 0, // current text position in line
				iVpos: 0,
				iPaper: 0,
				iPen: 1,
				bTag: false
			},
			i;

		for (i = 0; i < 8; i += 1) {
			this.aWindow[i] = Object.assign({}, oData, this.mWinData[this.iMode]); // new object for every window
		}
	},

	vmInitVariables: function () {
		var aVariables = Object.keys(this.v),
			i, sName;

		for (i = 0; i < aVariables.length; i += 1) {
			sName = aVariables[i];
			this.v[sName] = this.fnGetVarDefault(sName);
		}
	},

	vmInitStack: function () {
		this.oGosubStack.length = 0;
	},

	vmInitInks: function () {
		this.oCanvas.setDefaultInks();
	},

	vmStop: function (sLabel, iStopPriority, bForce) {
		iStopPriority = iStopPriority || 0;
		if (bForce || iStopPriority >= this.iStopPriority) {
			this.iStopPriority = iStopPriority;
			this.sStopLabel = sLabel;
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

	vmAddGraphicsItem: function (sType, bRelative, x, y, iGPen, iGMask) {
		var oItem = {
			t: sType,
			x: x,
			y: y
		};

		if (bRelative) {
			oItem.r = true;
		}

		if (iGPen !== undefined) {
			oItem.c = iGPen;
			this.graphicsPen(iGPen);
		}
		if (iGMask !== undefined) { //TODO
			//oItem.m = iGMask;
			this.oCanvas.setMask(iGMask);
		}
		this.oCanvas.addPath(oItem);
	},

	vmSetInput: function (sInput) {
		this.sInput = sInput;
	},

	vmGetInput: function () {
		return this.sInput;
	},


	abs: function (n) {
		return Math.abs(n);
	},

	addressOf: function (sVar) { // addressOf operator
		var aVarNames = Object.keys(this.v),
			iPos;

		sVar = sVar.replace("v.", "");
		iPos = aVarNames.indexOf(sVar);
		if (iPos === -1) {
			this.error(5); // Improper argument
		}
		return iPos;
	},

	afterGosub: function (iInterval, iTimer, iLine) {
		var oTimer = this.aTimer[iTimer],
			iIntervalMs = iInterval * this.iFrameTimeMs; // convert to ms

		oTimer.iIntervalMs = iIntervalMs;
		oTimer.iLine = iLine;
		oTimer.bRepeat = false;
		oTimer.bActive = true;
		oTimer.iNextTimeMs = Date.now() + iIntervalMs;
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
		this.oCanvas.setBorder(iInk1);
	},

	// break

	call: function (n) { // varargs (adr + parameters)
		switch (n) {
		case 0xbb03: // KM Initialize
			this.clearInput();
			// TODO: reset also speed key
			break;
		case 0xbb18: // KM Wait Key
			if (this.inkey$() === "") { // no key?
				this.vmStop("key", 30); // wait for key
			}
			break;
		case 0xbd19: // MC Wait Flyback
			this.frame();
			break;
		default:
			Utils.console.log("Ignored: call ", n);
			break;
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

	clg: function (iPen) {
		this.vmNotImplemented("clg");
		this.oCanvas.clearGraphics(iPen);
	},

	closein: function () {
		this.vmNotImplemented("closein");
	},

	closeout: function () {
		this.vmNotImplemented("closeout");
	},

	cls: function (iStream) {
		var oWin;

		iStream = iStream || 0;
		oWin = this.aWindow[iStream];
		this.oCanvas.clearWindow(oWin.iLeft, oWin.iRight, oWin.iTop, oWin.iBottom); // cls window
		this.sOut = "";
		oWin.iPos = 0;
		oWin.iVpos = 0;
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
		return n;
	},

	cursor: function () {
		this.vmNotImplemented("cursor");
	},

	data: function () { // varargs
		var iLine, i;

		iLine = arguments[0]; // line number
		if (!this.oDataLineIndex[iLine]) {
			this.oDataLineIndex[iLine] = this.aData.length; // set current index for the line
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
		this.bTimersDisabled = true;
	},

	dim: function (sVar) { // varargs
		var aArgs = [],
			bIsString = sVar.includes("$"),
			varDefault = (bIsString) ? "" : 0,
			i;

		for (i = 1; i < arguments.length; i += 1) {
			aArgs.push(arguments[i] + 1); // for basic we have sizes +1
		}
		this.initVal = varDefault; //TTT fast hack
		return this.fnCreateNDimArray.apply(this, aArgs);
	},

	draw: function (x, y, iGPen, iGMask) {
		this.vmAddGraphicsItem("l", false, x, y, iGPen, iGMask);
	},

	drawr: function (x, y, iGPen, iGMask) {
		this.vmAddGraphicsItem("l", true, x, y, iGPen, iGMask);
	},

	edit: function () {
		this.vmNotImplemented("edit");
	},

	ei: function () {
		this.bTimersDisabled = false;
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
		return -1;
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
		var sError,
			iStream = 0; //TTT

		this.iErr = iErr;
		this.iErl = this.iLine;

		sError = this.vmGetError(iErr);
		Utils.console.log("BASIC error(" + iErr + "): " + sError + " in " + this.iErl);
		sError += " in " + this.iErl + "\n";
		this.print(iStream, sError);
		this.vmStop("error", 50);
	},

	everyGosub: function (iInterval, iTimer, iLine) {
		var oTimer = this.aTimer[iTimer],
			iIntervalMs = iInterval * this.iFrameTimeMs; // convert to ms

		oTimer.iIntervalMs = iIntervalMs;
		oTimer.iLine = iLine;
		oTimer.bRepeat = true;
		oTimer.bActive = true;
		oTimer.iNextTimeMs = Date.now() + iIntervalMs;
	},

	exp: function (n) {
		return Math.exp(n);
	},

	fill: function (iGPen) {
		this.oCanvas.addPath({
			t: "f", // type: fill
			c: iGPen
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
		this.vmGotoLine(n, "gosub (ret=" + retLabel + ")");
		this.oGosubStack.push(retLabel);
	},

	"goto": function (n) {
		this.vmGotoLine(n, "goto");
	},

	graphicsPaper: function (iGPaper) {
		iGPaper = this.int(iGPaper);
		if (iGPaper >= 0 && iGPaper < 16) {
			this.oCanvas.setGPaper(iGPaper);
		} else {
			this.error(5); // Improper argument
		}
	},

	graphicsPen: function (iGPen, iGMask) {
		iGPen = this.int(iGPen);
		if (iGPen >= 0 && iGPen < 16) {
			this.oCanvas.setGPen(iGPen);
		} else {
			this.error(5); // Improper argument
		}
	},

	hex$: function (n, iPad) {
		return (n >>> 0).toString(16).padStart(iPad || 16, 0); // eslint-disable-line no-bitwise
	},

	himem: function () {
		return this.iHimem;
	},

	// if

	ink: function (iPen, iInk1, iInk2) {
		this.oCanvas.setInk(iPen, iInk1, iInk2);
	},

	inkey: function (iKey) {
		var iKeyState = this.oCanvas.getKeyState(iKey);

		return iKeyState; //TTT
	},

	inkey$: function () {
		var sKey = this.oCanvas.getKeyFromBuffer(),
			sInput = "";

		sInput = sKey; //TTT
		/*
		var iCode = this.oCanvas.getKeyFromBuffer(),
			sInput = "";

		if (iCode !== -1) {
			sInput = String.fromCharCode(iCode);
			if (iCode === 0) {
				sInput += String.fromCharCode(this.oCanvas.getKeyFromBuffer());
			}
		}
		*/

		return sInput;
	},

	inp: function () {
		this.vmNotImplemented("inp");
	},

	vmGetNextInput: function (sVar) {
		var aInputValues = this.aInputValues,
			sValue;

		Utils.console.log("vmGetInput: " + sVar);
		sValue = aInputValues.shift(); //TTT
		if (sVar.indexOf("$") < 0) { //TTT no string?
			sValue = Number(sValue);
		}
		return sValue;
	},

	vmInputCallback: function (sInput) {
		Utils.console.log("vmInputCallback: " + sInput);
		this.aInputValues = sInput.split(",");
	},

	input: function (iStream, sMsg) { // varargs
		if (iStream < 8) {
			this.fnInputCallback = this.vmInputCallback.bind(this);
			this.print(iStream, sMsg);
			this.vmStop("input", 45);
		} else if (iStream === 8) {
			this.aInputValues = [];
			this.vmNotImplemented("input #8");
		} else if (iStream === 9) {
			this.aInputValues = [];
			this.vmNotImplemented("input #9");
		}
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

	joy: function (iJoy) {
		return this.oCanvas.getJoyState(iJoy);
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

	vmLineInputCallback: function (sInput) {
		Utils.console.log("vmLineInputCallback: " + sInput);
		this.aInputValues = [sInput];
	},

	lineInput: function (iStream, sMsg, sVar) { // sVar must be string variable
		//iStream = iStream || 0;
		if (iStream < 8) {
			this.fnInputCallback = this.vmLineInputCallback.bind(this);
			/*
			//TTT arguments.length
			for (i = 2; i < arguments.length; i += 1) {
				aInputVars[i].push(arguments[i]);
			}
			*/
			this.print(iStream, sMsg);
			this.vmStop("input", 45);
		} else if (iStream === 8) {
			this.aInputValues = [];
			this.vmNotImplemented("line input #8");
		} else if (iStream === 9) {
			this.aInputValues = [];
			this.vmNotImplemented("line input #9");
		}
	},

	list: function () {
		this.vmNotImplemented("list");
	},

	load: function () {
		this.vmNotImplemented("load");
	},

	locate: function (iStream, iPos, iVpos) {
		var oWin = this.aWindow[iStream];

		oWin.iPos = iPos - 1;
		oWin.iVpos = iVpos - 1;
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

	mode: function (iMode) {
		this.iMode = iMode;
		this.sOut = "";
		this.vmInitWindowData();
		this.oCanvas.setMode(iMode);
	},

	move: function (x, y, iGPen, iGMask) {
		this.vmAddGraphicsItem("m", false, x, y, iGPen, iGMask);
	},

	mover: function (x, y, iGPen, iGMask) {
		this.vmAddGraphicsItem("m", true, x, y, iGPen, iGMask);
	},

	"new": function () {
		this.vmNotImplemented("new");
	},

	// next

	// not

	onBreakCont: function () {
		this.vmNotImplemented("on break cont");
	},

	onBreakGosub: function () {
		this.vmNotImplemented("on break gosub");
	},

	onBreakStop: function () {
		this.vmNotImplemented("on break stop");
	},

	onErrorGoto: function () {
		this.vmNotImplemented("on error goto");
	},

	onGosub: function (retLabel, n) { // varargs
		var iLine;

		if (n) {
			iLine = arguments[n + 1]; // n=1...; start with argument 2
			this.vmGotoLine(iLine, "onGosub (n=" + n + ", ret=" + retLabel + ")");
			this.oGosubStack.push(retLabel);
		} else {
			Utils.console.warn("onGosub: n=" + n + " in " + this.iLine);
			this.error(8);
		}
	},

	onGoto: function (n) { // varargs
		var iLine;

		if (!n) { // NaN, null, 0...
			Utils.console.warn("onGoto: n=" + n + " in " + this.iLine);
		}
		iLine = arguments[n];
		this.vmGotoLine(iLine, "onGoto (n=" + n + ")");
	},

	// on sq gosub

	openin: function () {
		this.vmNotImplemented("openin");
	},

	openout: function () {
		this.vmNotImplemented("openout");
	},

	// or

	origin: function (xOff, yOff, xLeft, xRight, yTop, yBottom) { // parameters from xLeft are optional
		this.oCanvas.setOrigin(xOff, yOff);

		if (xLeft !== undefined) {
			this.oCanvas.setClipping(xLeft, yBottom, xRight - xLeft, yBottom - yTop);
		}
	},

	out: function () {
		this.vmNotImplemented("out");
	},

	paper: function (iStream, iPaper) {
		var oWin;

		iStream = iStream || 0;
		oWin = this.aWindow[iStream];

		oWin.iPaper = iPaper;
		this.oCanvas.setPaper(iPaper);
	},

	peek: function (iAddr) {
		var iByte = this.aMem[iAddr] || 0;

		//this.vmNotImplemented("peek");
		return iByte;
	},

	pen: function (iStream, iPen) {
		var oWin;

		iStream = iStream || 0;
		oWin = this.aWindow[iStream];

		oWin.iPen = iPen;
		this.oCanvas.setPen(iPen);
	},

	pi: function () {
		return Math.PI; // or less precise: 3.14159265
	},

	plot: function (x, y, iGPen, iGMask) { // 2, up to 4 parameters
		this.vmAddGraphicsItem("p", false, x, y, iGPen, iGMask);
	},

	plotr: function (x, y, iGPen, iGMask) {
		this.vmAddGraphicsItem("p", true, x, y, iGPen, iGMask);
	},

	poke: function (iAddr, iByte) {
		this.aMem[iAddr] = iByte;
		//this.vmNotImplemented("poke");
	},

	pos: function (iStream) {
		iStream = iStream || 0;
		return this.aWindow[iStream].iPos + 1;
	},

	vmPrintChars: function (sStr, iStream) {
		var oWin = this.aWindow[iStream],
			iLeft = oWin.iLeft,
			iRight = oWin.iRight,
			iTop = oWin.iTop,
			iBottom = oWin.iBottom,
			i, iChar, x, y;

		x = oWin.iPos;
		y = oWin.iVpos;
		if (sStr.length <= (iRight - iLeft) && (x + sStr.length > (iRight + 1 - iLeft))) { // TTT
			x = 0;
			y += 1; // newline if string does not fit
			/*
			if (y > oWin.iBottom) {
				y = oWin.iBottom;
				this.oCanvas.windowScroolDown(iLeft, iRight, iTop, iBottom);
			}
			*/
			/*
			if (x > iRight) {
				x = 0;
				y += 1;
			}
			*/
		}
		for (i = 0; i < sStr.length; i += 1) {
			iChar = sStr.charCodeAt(i);
			if (iChar === 10) {
				x = 0;
				y += 1;
				/*
				if (y > oWin.iBottom) {
					y = oWin.iBottom;
					this.oCanvas.windowScroolDown(iLeft, iRight, iTop, iBottom);
				}
				*/
			} else {
				if (y > (oWin.iBottom - iTop)) {
					y = oWin.iBottom - iTop;
					this.oCanvas.windowScroolDown(iLeft, iRight, iTop, iBottom);
				}
				this.oCanvas.printChar(iChar, x + iLeft, y + iTop);
				x += 1;
			}
			if (x > (iRight - iLeft)) {
				x = 0;
				y += 1;
				/*
				if (y > oWin.iBottom) {
					y = oWin.iBottom;
					this.oCanvas.windowScroolDown(iLeft, iRight, iTop, iBottom);
				}
				*/
			}
		}
		oWin.iPos = x;
		oWin.iVpos = y;
	},

	vmPrintGraphChars: function (sStr) {
		var iChar, i;

		for (i = 0; i < sStr.length; i += 1) {
			iChar = sStr.charCodeAt(i);
			this.oCanvas.printGChar(iChar);
		}
	},

	print: function (iStream) { // varargs
		var oWin = this.aWindow[iStream],
			sStr, i;

		for (i = 1; i < arguments.length; i += 1) {
			sStr = String(arguments[i]);
			if (typeof arguments[i] === "number" && arguments[i] >= 0) {
				sStr = " " + sStr;
			}

			if (oWin.bTag) {
				this.vmPrintGraphChars(sStr);
			} else {
				this.vmPrintChars(sStr, iStream);
			}
			this.sOut += sStr; // console

			/*
			iLf = sStr.indexOf("\n");
			if (iLf >= 0) {
				oWin.iPos = sStr.length - iLf; // TODO: tab in same print is already called, should depend on what is already printed
			} else {
				oWin.iPos += sStr.length;
			}
			*/
		}
	},

	rad: function () {
		this.bDeg = false;
	},

	/*
	vmRandomizeCallback: function (sInput) {
		var n;

		Utils.console.log("randomize: " + sInput);
		if (!sInput) {
			sInput = 1;
		}
		n = Number(sInput);
		this.oRandom.init(n);
	},
	*/

	randomize: function (n) {
		var iStream = 0,
			sMsg;

		if (n === undefined) { // no arguments? input...
			sMsg = "Random number seed?";
			this.fnInputCallback = null; // we do not need it //this.fnInputCallback = this.vmRandomizeCallback.bind(this);
			this.print(iStream, sMsg);
			this.vmStop("input", 45);
			/*
			// TODO
			// a simple input via prompt
			sInput = window.prompt("Random number seed?"); // eslint-disable-line no-alert
			if (!sInput) {
				sInput = 1;
			}
			n = Number(sInput);
			*/
		} else {
			Utils.console.log("randomize: " + n);
			if (!n) {
				n = 1;
			}
			n = Number(n);
			this.oRandom.init(n);
		}
	},

	read: function (sVar) {
		var item = 0;

		if (this.iData < this.aData.length) {
			item = this.aData[this.iData];
			this.iData += 1;
			if (sVar.indexOf("$") < 0) { // not a string variable? => convert to number
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
			iTime = oTimer.iNextTimeMs - Date.now();
			iTime /= this.iFrameTimeMs;
			oTimer.bActive = false; // switch off timer
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
			Utils.console.warn("restore: " + iLine + " not found or no data line");
			// TODO try to find next data line > iLine
			this.error(8); // Line does not exist
		}
	},

	resume: function () { // resume, resume n, resume next
		this.vmNotImplemented("resume");
	},

	resumeNext: function () {
		this.vmNotImplemented("resume next");
	},

	"return": function () {
		var iLine = this.oGosubStack.pop();

		if (iLine === undefined) {
			this.error(3); // Unexpected Return [in <line>]
		}
		this.vmCheckTimerHandlers();
		this.vmGotoLine(iLine, "return");
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
		this.vmStop("reset", 90);
	},

	rsxCpm: function () {
		this.vmNotImplemented("|CPM");
	},

	run: function (numOrString) {
		/*
		var iLine;

		if (typeof numOrString === "string") { // filename?
			this.vmNotImplemented("run \"file\"");
			this.goto("end");
		} else { // so number or undefined
			iLine = numOrString || 0;
			this.clear();
			this.vmInitStack();
			this.clearInput();
			this.goto(iLine);
		}
		*/
		this.aInputValues = [numOrString]; // we misuse aInputValues
		if (typeof numOrString === "string") { // filename?
			this.vmStop("loadFile", 90);
		} else {
			this.vmStop("run", 90); // number or undefined
		}
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
		var iSq = 4;

		this.vmNotImplemented("sq");
		return iSq;
	},

	sqr: function (n) {
		return Math.sqrt(n);
	},

	// step

	stop: function (iLine) {
		this.vmGotoLine(iLine, "stop");
		this.vmStop("stop", 60);
	},

	str$: function (n) {
		var sSign = (Number(n) > 0) ? " " : "",
			sStr = sSign + String(n);

		return sStr;
	},

	string$: function (iLen, chr) {
		if (typeof chr === "number") {
			chr = String.fromCharCode(chr); // chr$
		}
		return chr.repeat(iLen);
	},

	// swap (window swap)

	symbol: function (iChar) { // varargs  (iChar, rows 1..8)
		var aArgs = [],
			i;

		for (i = 1; i < arguments.length; i += 1) { // start with 1
			aArgs.push(arguments[i]);
		}
		this.oCanvas.setCustomChar(iChar, aArgs);
	},

	symbolAfter: function () {
		this.vmNotImplemented("symbolAfter"); // maybe not needed
	},

	tab: function (n) {
		if (n === undefined) { // simulated tab in print for ","
			n = this.iZone;
		}
		return " ".repeat(n); // TODO: adapt spaces for next tab position
	},

	tag: function (iStream) {
		var oWin;

		iStream = iStream || 0;
		oWin = this.aWindow[iStream];
		oWin.bTag = true;
	},

	tagoff: function (iStream) {
		var oWin;

		iStream = iStream || 0;
		oWin = this.aWindow[iStream];
		oWin.bTag = false;
	},

	tan: function (n) {
		return Math.tan((this.bDeg) ? Utils.toRadians(n) : n);
	},

	test: function (x, y) {
		return this.oCanvas.addPath({
			t: "t",
			x: x,
			y: y
		});
	},

	testr: function (x, y) {
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

	val: function (s) { // todo: interpret hex!
		var iNum,
			isHexOrBin = function (c) { // bin: &X, hex: & or &H
				return (/[&]/).test(c);
			};

		if (isHexOrBin(s)) {
			Utils.console.warn("val: possible hex number: " + s + " (TODO)");
		}
		iNum = parseFloat(s);
		if (isNaN(iNum)) {
			iNum = 0;
		}
		return iNum;
	},

	vpos: function (iStream) {
		iStream = iStream || 0;
		return this.aWindow[iStream].iVpos + 1;
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

		oWin.iLeft = Math.min(iLeft, iRight) - 1;
		oWin.iRight = Math.max(iLeft, iRight) - 1;
		oWin.iTop = Math.min(iTop, iBottom) - 1;
		oWin.iBottom = Math.max(iTop, iBottom) - 1;

		oWin.iPos = 0; //TTT
		oWin.iVpos = 0;
	},

	windowSwap: function (iStream1, iStream2) {
		var oTemp = this.aWindow[iStream1];

		iStream2 = iStream2 || 0; // iStream2 is optional

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
