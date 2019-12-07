// CpcVm.js - CPC Virtual Machine
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//

"use strict";

var Random, Utils;

if (typeof require !== "undefined") {
	Random = require("./Random.js"); // eslint-disable-line global-require
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

function CpcVm(options) {
	this.vmInit(options);
}

CpcVm.prototype = {
	iFrameTimeMs: 1000 / 50, // 50 Hz => 20 ms
	iTimerCount: 4, // number of timers
	iSqTimerCount: 3, // sound queue timers
	iStreamCount: 10, // 0..7 window, 8 printer, 9 cassette

	mWinData: [ // window data for mode mode 0,1,2,3 (we are counting from 0 here)
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
			iBottom: 49
		}
	],

	mUtf8ToCpc: { // needed for UTF-8 character data in openin / input#9
		8364: 128,
		8218: 130,
		402: 131,
		8222: 132,
		8230: 133,
		8224: 134,
		8225: 135,
		710: 136,
		8240: 137,
		352: 138,
		8249: 139,
		338: 140,
		381: 142,
		8216: 145,
		8217: 146,
		8220: 147,
		8221: 148,
		8226: 149,
		8211: 150,
		8212: 151,
		732: 152,
		8482: 153,
		353: 154,
		8250: 155,
		339: 156,
		382: 158,
		376: 159
	},

	vmInit: function (options) {
		var i;

		this.options = options || {};
		this.oCanvas = this.options.canvas;
		this.oKeyboard = this.options.keyboard;
		this.oSound = this.options.sound;

		this.oRandom = new Random();

		this.vmSetVariables({});

		this.oStop = {
			sReason: "", // stop reason
			iPriority: 0, // stop priority (higher number means higher priority which can overwrite lower priority)
			oPara: null // stop parameters (currently not used)
		};
		// special stop reasons and priorities:
		// "timer": 20 (timer expired)
		// "key": 30  (wait for key)
		// "frame": 40 (frame command: wait for frame fly)
		// "sound": 43 (wait for sound queue) //TTT
		// "input": 45 (wait for input: input, line input, randomize without parameter)
		// "error": 50 (BASIC error, error command)
		// "stop": 60 (stop or end command)
		// "break": 80 (break pressed)
		// "end": 90 (end of program)
		// "reset": 99 (reset canvas)

		this.oInput = {}; // input handling

		this.oInFile = {}; // file handline

		this.iInkeyTime = 0; // if >0, next time when inkey$ can be checked without inserting "frame"

		this.aGosubStack = []; // stack of line numbers for gosub/return

		this.aMem = []; // for peek, poke

		this.aData = []; // array for BASIC data lines (continuous)

		this.aWindow = []; // window data for window 0..7
		for (i = 0; i < this.iStreamCount - 2; i += 1) {
			this.aWindow[i] = {};
		}

		this.aTimer = []; // BASIC timer 0..3 (3 has highest priority)
		for (i = 0; i < this.iTimerCount; i += 1) {
			this.aTimer[i] = {};
		}

		this.aSoundData = [];

		this.aSqTimer = []; // Sound queue timer 0..2
		for (i = 0; i < this.iSqTimerCount; i += 1) {
			this.aSqTimer[i] = {};
		}
	},

	vmReset: function () {
		this.iStartTime = Date.now();
		this.oRandom.init();
		this.lastRnd = 0;

		this.iNextFrameTime = Date.now() + this.iFrameTimeMs; // next time of frame fly
		this.iTimeUntilFrame = 0;
		this.iStopCount = 0;

		this.iLine = 0; // current line number (or label)
		this.iStartLine = 0; // line to start

		this.iErrorGotoLine = 0;
		this.iBreakGosubLine = 0;

		this.vmResetInputHandling();
		this.vmResetInFileHandling();

		this.sOut = ""; // console output

		this.vmStop("", 0, true);

		this.vmResetData();

		this.iErr = 0; // last error code
		this.iErl = 0; // line of last error

		this.aGosubStack.length = 0;
		this.bDeg = false; // degree or radians

		this.bTron = this.options.tron || false; // trace flag

		this.aMem.length = 0; // for peek, poke
		this.iHimem = 42747; // high memory limit (42747 after symbol after 256)
		this.symbolAfter(240);

		this.vmResetTimers();
		this.bTimersDisabled = false; // flag if timers are disabled

		this.iZone = 13; // print tab zone value

		//this.vmResetVariables(); //TTT
		this.oVarTypes = {}; // variable types
		this.vmDefineVarTypes("R", "a-z");

		this.iMode = null;
		this.mode(1); // including vmResetWindowData()

		this.oCanvas.reset();
		this.oKeyboard.reset();
		this.oSound.reset();
		this.aSoundData.length = 0;
		this.iClgPen = 0;

		this.iInkeyTime = 0; // if >0, next time when inkey$ can be checked without inserting "frame"
	},

	vmResetTimers: function () {
		var oData = {
				iLine: 0, // gosub line when timer expires
				bRepeat: false, // flag if timer is repeating (every) or one time (after)
				iIntervalMs: 0, // interval or timeout
				bActive: false, // flag if timer is active
				iNextTime: 0, // next expiration time
				bHandlerRunning: false, // flag if handler (subroutine) is running
				iStackIndexReturn: 0 // index in gosub stack with return, if handler is running
			},
			aTimer = this.aTimer,
			aSqTimer = this.aSqTimer,
			i;

		for (i = 0; i < this.iTimerCount; i += 1) {
			Object.assign(aTimer[i], oData);
		}

		// sound queue timer
		for (i = 0; i < this.iSqTimerCount; i += 1) {
			Object.assign(aSqTimer[i], oData);
		}
	},

	vmResetWindowData: function () {
		var oWinData = this.mWinData[this.iMode],
			oData = {
				iPos: 0, // current text position in line
				iVpos: 0,
				iPaper: 0,
				iPen: 1,
				bTextEnabled: true, // text enabled
				bTag: false // tag=text at graphics
			},
			i, oWin;

		for (i = 0; i < this.iStreamCount - 2; i += 1) { // for window streams
			oWin = this.aWindow[i];
			Object.assign(oWin, oData, oWinData);
		}
	},

	vmResetInputHandling: function () {
		var oData = {
			iStream: 0,
			sInput: "",
			sNoCRLF: "",
			fnInputCallback: null, // callback for stop reason "input"
			aInputValues: []
		};

		Object.assign(this.oInput, oData);
	},

	vmResetInFileHandling: function () {
		var oData = {
			bOpen: false, // file open flag
			sCommand: "", // the command which started the file open (chain, chainMerge, load, merge, openin, run)
			sState: "", // state: loading, loaded
			sName: "", // file name
			iAddress: null,
			iLine: null,
			fnFileCallback: null, // callback for stop reason "loadFile"
			aInput: [] // file contents for input#9
		};

		Object.assign(this.oInFile, oData);
	},

	vmResetData: function () {
		this.aData.length = 0; // array for BASIC data lines (continuous)
		this.iData = 0; // current index
		this.oDataLineIndex = { // line number index for the data line buffer
			0: 0 // for line 0: index 0
		};
	},

	vmResetInks: function () {
		this.oCanvas.setDefaultInks();
	},

	vmResetVariables: function () {
		var aVariables = Object.keys(this.v),
			i, sName;

		for (i = 0; i < aVariables.length; i += 1) {
			sName = aVariables[i];
			this.v[sName] = this.fnGetVarDefault(sName);
		}
	},

	vmSetVariables: function (oVariables) {
		this.v = oVariables; // collection of BASIC variables
	},

	vmSetStartLine: function (iLine) {
		this.iStartLine = iLine;
	},

	vmEscape: function () {
		var bStop = true;

		if (this.iBreakGosubLine > 0) { // on break gosub n
			this.gosub(this.iLine, this.iBreakGosubLine);
			bStop = false;
		} else if (this.iBreakGosubLine < 0) { // on break cont
			bStop = false;
		} // else: on break stop

		return bStop;
	},

	vmRound: function (n) {
		if (typeof n !== "number") {
			Utils.console.warn("vmRound: expected number but got:", n);
			this.error(13); // "Type mismatch"
			n = 0;
			throw new CpcVm.ErrorObject("Type mismatch", n, this.iLine);
		}
		return (n >= 0) ? (n + 0.5) | 0 : (n - 0.5) | 0; // eslint-disable-line no-bitwise
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

	vmGotoLine: function (line, sMsg) {
		if (Utils.debug > 3) {
			if (typeof line === "number" || Utils.debug > 5) { // non-number labels only in higher debug levels
				Utils.console.debug("DEBUG: vmGotoLine: " + sMsg + ": " + line);
			}
		}
		this.iLine = line;
	},

	fnCheckSqTimer: function () {
		var bTimerExpired = false,
			oTimer, i;

		if (!this.bTimersDisabled) { // BASIC timers not disabled?
			for (i = 0; i < this.iSqTimerCount; i += 1) {
				oTimer = this.aSqTimer[i];

				// use oSound.sq(i) and not this.sq(i) since that would reset onSq timer
				if (oTimer.bActive && !oTimer.bHandlerRunning && (this.oSound.sq(i) & 0x07)) { // eslint-disable-line no-bitwise
					this.gosub(this.iLine, oTimer.iLine);
					oTimer.bHandlerRunning = true;
					oTimer.iStackIndexReturn = this.aGosubStack.length;
					oTimer.bRepeat = false; // one shot
					bTimerExpired = true;
					break; // found expired timer
				}
			}
		}
		return bTimerExpired;
	},

	vmCheckTimer: function (iTime) {
		var bTimerExpired = false,
			iDelta, oTimer, i;

		if (!this.bTimersDisabled) { // BASIC timers not disabled?
			for (i = this.iTimerCount - 1; i >= 0; i -= 1) { // check timers starting with highest priority first
				oTimer = this.aTimer[i];
				if (oTimer.bActive && !oTimer.bHandlerRunning && iTime > oTimer.iNextTimeMs) { // timer expired?
					this.gosub(this.iLine, oTimer.iLine);
					oTimer.bHandlerRunning = true;
					oTimer.iStackIndexReturn = this.aGosubStack.length;
					if (!oTimer.bRepeat) { // not repeating
						oTimer.bActive = false;
					} else {
						iDelta = iTime - oTimer.iNextTimeMs;
						oTimer.iNextTimeMs += oTimer.iIntervalMs * Math.ceil(iDelta / oTimer.iIntervalMs);
					}
					bTimerExpired = true;
					break; // found expired timer
				} else if (i === 2) { // for priority 2 we check the sq timers which also have priority 2
					if (this.fnCheckSqTimer()) {
						break; // found expired timer
					}
				}
			}
		}
		return bTimerExpired;
	},

	vmCheckTimerHandlers: function () {
		var i, oTimer;

		for (i = this.iTimerCount - 1; i >= 0; i -= 1) {
			oTimer = this.aTimer[i];
			if (oTimer.bHandlerRunning) {
				if (oTimer.iStackIndexReturn > this.aGosubStack.length) {
					oTimer.bHandlerRunning = false;
					oTimer.iStackIndexReturn = 0;
				}
			}
		}
	},

	vmCheckSqTimerHandlers: function () {
		var bTimerReloaded = false,
			i, oTimer;

		for (i = this.iSqTimerCount - 1; i >= 0; i -= 1) {
			oTimer = this.aSqTimer[i];
			if (oTimer.bHandlerRunning) {
				if (oTimer.iStackIndexReturn > this.aGosubStack.length) {
					oTimer.bHandlerRunning = false;
					oTimer.iStackIndexReturn = 0;
					if (!oTimer.bRepeat) { // not reloaded
						oTimer.bActive = false;
					} else {
						bTimerReloaded = true;
					}
				}
			}
		}
		return bTimerReloaded;
	},

	vmCheckNextFrame: function (iTime) {
		var	iDelta;

		if (iTime >= this.iNextFrameTime) { // next time of frame fly
			iDelta = iTime - this.iNextFrameTime;

			if (iDelta > this.iFrameTimeMs) {
				this.iNextFrameTime += this.iFrameTimeMs * Math.ceil(iDelta / this.iFrameTimeMs);
			} else {
				this.iNextFrameTime += this.iFrameTimeMs;
			}
			this.vmCheckTimer(iTime); // check BASIC timers and sound queue
			this.oSound.scheduler();
		}
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
		}
		return this.oStop.sReason === "";
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

	fnGetVarDefault: function (sName) {
		var iArrayIndices = sName.split("A").length - 1,
			bIsString = sName.includes("$"),
			value, aArgs, aValue, i;

		value = bIsString ? "" : 0;
		if (iArrayIndices) {
			// on CPC up to 3 dimensions 0..10 without dim
			if (iArrayIndices > 3) {
				iArrayIndices = 3;
			}
			aArgs = [];
			for (i = 0; i < iArrayIndices; i += 1) {
				aArgs.push(11);
			}
			this.initVal = value; //TTT fast hack
			aValue = this.fnCreateNDimArray.apply(this, aArgs);
			value = aValue;
		}
		return value;
	},

	vmDefineVarTypes: function (sType, sNameOrRange) {
		var aRange, iFirst, iLast, i, sVarChar;

		if (sNameOrRange.indexOf("-") >= 0) {
			aRange = sNameOrRange.split("-", 2);
			iFirst = aRange[0].trim().toLowerCase().charCodeAt(0);
			iLast = aRange[1].trim().toLowerCase().charCodeAt(0);
		} else {
			iFirst = sNameOrRange.trim().toLowerCase().charCodeAt(0);
			iLast = iFirst;
		}
		for (i = iFirst; i <= iLast; i += 1) {
			sVarChar = String.fromCharCode(i);
			this.oVarTypes[sVarChar] = sType;
		}
	},

	/*
	vmGetStopReason: function () {
		return this.oStop.sReason;
	},

	vmGetStopPriority: function () {
		return this.oStop.iPriority;
	},
	*/

	vmStop: function (sReason, iPriority, bForce, oPara) { // optional bForce, oPara
		iPriority = iPriority || 0;
		if (bForce || iPriority >= this.oStop.iPriority) {
			this.oStop.iPriority = iPriority;
			this.oStop.sReason = sReason;
			this.oStop.oPara = oPara;
		}
	},

	vmNotImplemented: function (sName) {
		Utils.console.warn("Not implemented: " + sName);
		/*
		if (Utils.debug) {
			Utils.console.debug("WARN: Not implemented: " + sName);
		}
		*/
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
				sStr = arg + sPad; // string left aligned
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

	vmGetStopObject: function () {
		return this.oStop;
	},

	vmSetInputParas: function (sInput) {
		this.oInput.sInput = sInput;
	},

	vmGetInputObject: function () {
		return this.oInput;
	},

	vmGetFileObject: function () {
		return this.oInFile;
	},

	vmAdaptFilename: function (sName) {
		if (sName.indexOf("!") === 0) {
			sName = sName.substr(1); // remove preceiding "!"
		}
		return sName;
	},

	vmGetSoundData: function () {
		return this.aSoundData;
	},

	vmTrace: function (iLine) {
		if (this.bTron) {
			this.print(0, "[" + iLine + "]");
		}
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

	vmGetCpcCharCode: function (iCode) {
		if (iCode > 255) { // map some UTF-8 character codes
			if (this.mUtf8ToCpc[iCode]) {
				iCode = this.mUtf8ToCpc[iCode];
			}
		}
		return iCode;
	},

	asc: function (s) {
		var iCode = String(s).charCodeAt(0);

		iCode = this.vmGetCpcCharCode(iCode);
		return iCode;
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

	border: function (iInk1 /* , iInk2*/) { // ink2 optional
		iInk1 = this.vmRound(iInk1);
		this.oCanvas.setBorder(iInk1);
	},

	// break

	call: function (n) { // varargs (adr + parameters)
		n = this.vmRound(n);
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
		case 0xbb81: // TXT Cursor On
			// TODO
			break;
		case 0xbb84: // TXT Cursor Off
			// TODO
			break;
		case 0xbbde: // GRA Set Pen
			// we can only set graphics pen depending on number of additional args (0=no arg, 1=one arg)
			this.graphicsPen(arguments.length - 1);
			break;
		case 0xbbff: // SCR Initialize
			this.mode(1);
			this.vmResetInks();
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

	chain: function (sName, iLine) { // optional iLine
		var oInFile = this.oInFile;

		sName = this.vmAdaptFilename(sName);
		this.closein();
		oInFile.bOpen = true;
		oInFile.sCommand = "chain";
		oInFile.sName = sName;
		oInFile.iLine = iLine;
		this.vmStop("loadFile", 90);
	},

	chainMerge: function (sName, iLine) { // optional iLine; TODO more parameters: delete number range
		var oInFile = this.oInFile;

		sName = this.vmAdaptFilename(sName);
		this.closein();
		oInFile.bOpen = true;
		oInFile.sCommand = "chainMerge";
		oInFile.sName = sName;
		oInFile.iLine = iLine;
		this.vmStop("loadFile", 90);
	},

	chr$: function (n) {
		n = this.vmRound(n);
		return String.fromCharCode(n);
	},

	cint: function (n) {
		return Math.round(n);
	},

	clear: function () {
		this.vmResetTimers();
		this.vmSetStartLine(0);
		this.iErr = 0;
		this.iBreakGosubLine = 0;
		this.iErrorGotoLine = 0;
		this.iErrorResumeLine = 0;
		this.aGosubStack.length = 0;
		this.vmResetVariables();
		this.vmDefineVarTypes("R", "a-z");
		this.restore(); // restore data line index
		this.rad();
		this.oSound.resetQueue();
		this.aSoundData.length = 0;
		this.closein();
		this.closeout();
	},

	clearInput: function () {
		this.oKeyboard.clearInput();
	},

	clg: function (iClgPen) {
		if (iClgPen !== undefined) {
			iClgPen = this.vmRound(iClgPen);
			this.iClgPen = iClgPen;
		} else {
			iClgPen = this.iClgPen;
		}
		this.oCanvas.clearGraphics(iClgPen);
	},

	closein: function () {
		var oInFile = this.oInFile;

		if (oInFile.bOpen) {
			//oInFile.bOpen = false;
			this.vmResetInFileHandling();
		}
		/*
		} else {
			this.error(31); // File not open
		}
		*/
	},

	closeout: function () {
		//this.vmNotImplemented("closeout");
	},

	cls: function (iStream) {
		var oWin;

		iStream = this.vmRound(iStream || 0);
		oWin = this.aWindow[iStream];
		this.oCanvas.clearWindow(oWin.iLeft, oWin.iRight, oWin.iTop, oWin.iBottom, oWin.iPaper); // cls window
		this.sOut = "";
		oWin.iPos = 0;
		oWin.iVpos = 0;
	},

	commaTab: function (iStream) { // special function used for comma in print (ROM &F25C), called delayed by print
		var	oWin = this.aWindow[iStream],
			iZone = this.iZone,
			iCount;

		iStream = this.vmRound(iStream || 0);
		this.vmMoveCursor2AllowedPos(iStream);
		iCount = iZone - (oWin.iPos % iZone);
		if (oWin.iPos) { // <>0: not begin of line
			if (oWin.iPos + iCount + iZone > (oWin.iRight + 1 - oWin.iLeft)) {
				oWin.iPos += iCount + iZone;
				this.vmMoveCursor2AllowedPos(iStream);
				iCount = 0;
			}
		}
		return " ".repeat(iCount);
	},

	cont: function () {
		this.vmNotImplemented("cont");
	},

	copychr$: function (iStream) {
		iStream = this.vmRound(iStream || 0);
		this.vmNotImplemented("copychr$ " + iStream);
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

	dec$: function (n, sFrmt) {
		var sOut;

		if (typeof n !== "number") {
			this.error(13); // Type mismatch
		} else {
			sOut = this.vmUsingFormat1(sFrmt, n);
		}
		return sOut;
	},

	// def fn

	defint: function (sNameOrRange) {
		this.vmDefineVarTypes("I", sNameOrRange);
	},

	defreal: function (sNameOrRange) {
		this.vmDefineVarTypes("R", sNameOrRange);
	},

	defstr: function (sNameOrRange) {
		this.vmDefineVarTypes("$", sNameOrRange);
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

	draw: function (x, y, iGPen, iGColMode) {
		x = this.vmRound(x);
		y = this.vmRound(y);
		if (iGPen !== undefined && iGPen !== null) {
			this.graphicsPen(iGPen);
		}
		if (iGColMode !== undefined) {
			this.oCanvas.setGColMode(iGColMode);
		}
		this.oCanvas.draw(x, y);
	},

	drawr: function (x, y, iGPen, iGColMode) {
		x = this.vmRound(x);
		y = this.vmRound(y);
		if (iGPen !== undefined && iGPen !== null) {
			this.graphicsPen(iGPen);
		}
		if (iGColMode !== undefined) {
			this.oCanvas.setGColMode(iGColMode);
		}
		this.oCanvas.drawr(x, y);
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

	ent: function (iToneEnv) { // varargs
		var aArgs = [],
			bRepeat = false,
			i, oArg;

		iToneEnv = this.vmRound(iToneEnv);
		if (iToneEnv < 0) {
			iToneEnv = -iToneEnv;
			bRepeat = true;
		}
		if (iToneEnv > 0 && iToneEnv < 16) {
			for (i = 1; i < arguments.length; i += 3) { // starting with 1: 3 parameters per section
				/* eslint-disable no-bitwise */
				if (arguments[i] !== null) {
					oArg = {
						steps: this.vmRound(arguments[i]), // number of steps: 0..239
						diff: this.vmRound(arguments[i + 1]), // size (period change) of steps: -128..+127
						time: this.vmRound(arguments[i + 2]) & 0xff // time per step: 0..255 (0=256)
					};
					if (bRepeat) {
						oArg.repeat = true;
					}
				} else { // special handling
					oArg = {
						period: this.vmRound(arguments[i + 1]), // absolute period
						time: this.vmRound(arguments[i + 2]) & 0xff // time: 0..255 (0=256)
					};
				}
				/* eslint-enable no-bitwise */
				aArgs.push(oArg);
			}
			this.oSound.setToneEnv(iToneEnv, aArgs);
		} else {
			this.error(5); // Improper argument
		}
	},

	env: function (iVolEnv) { // varargs
		var aArgs = [],
			i, oArg;

		iVolEnv = this.vmRound(iVolEnv);
		if (iVolEnv > 0 && iVolEnv < 16) {
			for (i = 1; i < arguments.length; i += 3) { // starting with 1: 3 parameters per section
				/* eslint-disable no-bitwise */
				if (arguments[i] !== null) {
					oArg = {
						steps: this.vmRound(arguments[i]) & 0x7f, // number of steps: 0..127
						diff: this.vmRound(arguments[i + 1]) & 0x0f, // size (volume) of steps: 0..15
						time: this.vmRound(arguments[i + 2]) & 0xff // time per step: 0..255 (0=256)
					};
					if (!oArg.time) { // (0=256)
						oArg.time = 256;
					}
				} else { // special handling for register parameters
					oArg = {
						register: this.vmRound(arguments[i + 1]), // register: 0..15
						period: this.vmRound(arguments[i + 2])
					};
				}
				/* eslint-enable no-bitwise */
				aArgs.push(oArg);
			}
			this.oSound.setVolEnv(iVolEnv, aArgs);
		} else {
			this.error(5); // Improper argument
		}
	},

	eof: function () {
		var oInFile = this.oInFile,
			iEof = -1;

		if (oInFile.bOpen && oInFile.aInput.length) {
			iEof = 0;
		}
		return iEof;
	},

	vmFindArrayVariable: function (sName) {
		var aNames;

		sName += "A";
		if (sName in this.v) { // one dim array variable?
			return sName;
		}

		aNames = Object.keys(this.v).filter(function (sVar) {
			return (sVar.indexOf(sName) === 0) ? sVar : null;
		});
		return aNames[0];
	},

	erase: function () { // varargs
		var i, sName;

		for (i = 0; i < arguments.length; i += 1) {
			sName = this.vmFindArrayVariable(arguments[i]);
			if (sName) {
				this.v[sName] = this.fnGetVarDefault(sName); // reset variable
			} else {
				Utils.console.warn("Array variable not found:", arguments[i]);
				this.error(5); // Improper argument
			}
		}
	},

	erl: function () {
		return this.iErl;
	},

	err: function () {
		return this.iErr;
	},

	error: function (iErr) {
		var sError,
			iStream = 0;

		iErr = this.vmRound(iErr);
		this.iErr = iErr;
		this.iErl = this.iLine;

		sError = this.vmGetError(iErr);
		Utils.console.log("BASIC error(" + iErr + "): " + sError + " in " + this.iErl);
		sError += " in " + this.iErl + "\r\n";
		this.print(iStream, sError);

		if (this.iErrorGotoLine > 0) { //TTT only
			this.iErrorResumeLine = this.iErl; //TTT
			this.vmGotoLine(this.iErrorGotoLine, "onError");
			this.vmStop("onError", 50);
		} else {
			this.vmStop("error", 50);
		}
	},

	everyGosub: function (iInterval, iTimer, iLine) {
		var oTimer,	iIntervalMs;

		iInterval = this.vmRound(iInterval);
		iTimer = this.vmRound(iTimer);
		oTimer = this.aTimer[iTimer];
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
		iGPen = this.vmRound(iGPen);
		//TODO
		this.vmNotImplemented("fill");
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
		this.aGosubStack.push(retLabel);
	},

	"goto": function (n) {
		this.vmGotoLine(n, "goto");
	},

	graphicsPaper: function (iGPaper) {
		iGPaper = this.vmRound(iGPaper);
		if (iGPaper >= 0 && iGPaper < 16) {
			this.oCanvas.setGPaper(iGPaper);
		} else {
			this.error(5); // Improper argument
		}
	},

	graphicsPen: function (iGPen, iTransparentMode) {
		iGPen = this.vmRound(iGPen);
		if (iGPen >= 0 && iGPen < 16) {
			this.oCanvas.setGPen(iGPen);
		} else {
			this.error(5); // Improper argument
		}
		if (iTransparentMode !== undefined) {
			this.oCanvas.setTranspartentMode(iTransparentMode);
		}
	},

	hex$: function (n, iPad) {
		n = this.vmRound(n);
		iPad = this.vmRound(iPad || 0);
		return n.toString(16).toUpperCase().padStart(iPad, "0"); // eslint-disable-line no-bitwise
	},

	himem: function () {
		return this.iHimem;
	},

	// if

	ink: function (iPen, iInk1, iInk2) { // optional iInk2
		iPen = this.vmRound(iPen);
		iInk1 = this.vmRound(iInk1);
		if (iInk2 === undefined) {
			iInk2 = iInk1;
		} else {
			iInk2 = this.vmRound(iInk2);
		}
		this.oCanvas.setInk(iPen, iInk1, iInk2);
	},

	inkey: function (iKey) {
		var iKeyState;

		iKey = this.vmRound(iKey);
		iKeyState = this.oKeyboard.getKeyState(iKey);
		return iKeyState;
	},

	inkey$: function () {
		var sKey = this.oKeyboard.getKeyFromBuffer(),
			iNow;

		// do some slowdown, if checked too early again without key press
		if (sKey !== "") { // some key pressed?
			this.iInkeyTime = 0;
		} else { // no key
			iNow = Date.now();
			if (this.iInkeyTimeMs && iNow < this.iInkeyTimeMs) { // last inkey without key was in range of frame fly?
				this.frame(); // then insert a frame fly
			}
			this.iInkeyTimeMs = iNow + this.iFrameTimeMs; // next time of frame fly
		}
		return sKey;
	},

	inp: function () {
		//this.vmNotImplemented("inp");
	},

	vmDetermineVarType: function (sName) {
		var sType, aMatch, sChar;

		if (sName.indexOf("v.") === 0) {
			sName = sName.substr(2); // remove preceiding "v."
		}
		aMatch = sName.match(/[IR$]/); // explicit type?
		if (aMatch) {
			sType = aMatch[0];
		} else {
			sChar = sName.charAt(0); // take first character of variable name
			sType = this.oVarTypes[sChar];
		}
		return sType;
	},

	vmGetNextInput: function (sVar) {
		var aInputValues = this.oInput.aInputValues,
			sValue;

		// Utils.console.debug("vmGetInput: " + sVar);
		sValue = aInputValues.shift();

		if (this.vmDetermineVarType(sVar) !== "$") { // no string?
			sValue = Number(sValue);
			if (isNaN(sValue)) {
				this.print(this.oInput.iStream, "?Redo from start\r\n");
				sValue = 0; // the best we can do here
			}
		}
		return sValue;
	},

	vmInputCallback: function (sInput) {
		Utils.console.log("vmInputCallback: " + sInput);
		this.oInput.aInputValues = sInput.split(",");
	},

	input: function (iStream, sNoCRLF, sMsg) { // varargs
		iStream = this.vmRound(iStream);
		if (iStream < 8) {
			this.oInput.iStream = iStream;
			this.oInput.sNoCRLF = sNoCRLF;
			this.oInput.fnInputCallback = this.vmInputCallback.bind(this);
			this.oInput.sInput = "";
			this.print(iStream, sMsg);
			this.vmStop("input", 45);
		} else if (iStream === 8) {
			this.oInput.aInputValues = [];
			this.vmNotImplemented("input #8");
		} else if (iStream === 9) {
			this.oInput.iStream = iStream;
			this.oInput.aInputValues = [];
			if (!this.oInFile.bOpen) {
				this.error(31); // File not open
			} else if (this.eof()) {
				this.error(24); // EOF met
			} else {
				this.oInput.aInputValues = this.oInFile.aInput.splice(0, arguments.length - 3);
			}
		}
	},

	instr: function (p1, p2, p3) { // optional startpos as first parameter
		if (typeof p1 === "string") {
			return p1.indexOf(p2) + 1;
		}
		p1 = this.vmRound(p1);
		return p2.indexOf(p3, p1) + 1;
	},

	"int": function (n) {
		return Math.floor(n);
	},

	joy: function (iJoy) {
		iJoy = this.vmRound(iJoy);
		return this.oKeyboard.getJoyState(iJoy);
	},

	key: function () {
		this.vmNotImplemented("key");
	},

	keyDef: function () {
		this.vmNotImplemented("keyDef");
	},

	left$: function (s, iLen) {
		iLen = this.vmRound(iLen);
		return s.substr(0, iLen);
	},

	len: function (s) {
		return s.length;
	},

	// let

	vmLineInputCallback: function (sInput) {
		Utils.console.log("vmLineInputCallback: " + sInput);
		this.oInput.aInputValues = [sInput];
	},

	lineInput: function (iStream, sNoCRLF, sMsg, sVar) { // sVar must be string variable
		iStream = this.vmRound(iStream);
		if (iStream < 8) {
			this.print(iStream, sMsg);
			this.oInput.iStream = iStream;
			this.oInput.sNoCRLF = sNoCRLF;
			this.oInput.sInput = "";

			if (this.vmDetermineVarType(sVar) !== "$") { // not string?
				this.print(iStream, "\r\n");
				this.error(13); // Type mismatch
			} else {
				this.oInput.fnInputCallback = this.vmLineInputCallback.bind(this);
				this.vmStop("input", 45);
			}
		} else if (iStream === 8) {
			this.oInput.aInputValues = [];
			this.vmNotImplemented("line input #8");
		} else if (iStream === 9) {
			this.oInput.aInputValues = [];
			this.vmNotImplemented("line input #9");
		}
	},

	list: function () {
		this.vmNotImplemented("list");
	},

	load: function (sName, iAddress) { // optional iAddress
		var oInFile = this.oInFile;

		sName = this.vmAdaptFilename(sName);
		this.closein();
		oInFile.bOpen = true;
		oInFile.sCommand = "load";
		oInFile.sName = sName;
		oInFile.iAddress = iAddress;
		this.vmStop("loadFile", 90);
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
		if (s >= "A" && s <= "Z") {
			s = s.toLowerCase();
		}
		return s;
	},

	mask: function () {
		this.vmNotImplemented("mask");
	},

	max: function () { // varargs
		return Math.max.apply(null, arguments);
	},

	memory: function (n) {
		n = this.vmRound(n);
		this.iHimem = n;
	},

	merge: function (sName) {
		var oInFile = this.oInFile;

		sName = this.vmAdaptFilename(sName);
		this.closein();
		oInFile.bOpen = true;
		oInFile.sCommand = "merge";
		oInFile.sName = sName;
		this.vmStop("loadFile", 90);
	},

	mid$: function (s, iStart, iLen) { // as function; iLen is optional
		iStart = this.vmRound(iStart);
		if (iLen !== undefined) {
			iLen = this.vmRound(iLen);
		}
		return s.substr(iStart - 1, iLen);
	},

	mid$Assign: function (s, iStart, iLen, sNew) {
		iStart = this.vmRound(iStart) - 1;
		iLen = (iLen !== null) ? this.vmRound(iLen) : sNew.length;
		if (iLen > sNew.length) {
			iLen = sNew.length;
		}
		if (iLen > s.length - iStart) {
			iLen = s.length - iStart;
		}
		s = s.substr(0, iStart) + sNew.substr(0, iLen) + s.substr(iStart + iLen);
		return s;
	},

	min: function () { // varargs
		return Math.min.apply(null, arguments);
	},

	// mod

	mode: function (iMode) {
		var iStream = 0,
			oWin;

		iMode = this.vmRound(iMode);
		this.iMode = iMode;
		this.vmResetWindowData();
		oWin = this.aWindow[iStream];
		this.sOut = "";
		this.iClgPen = 0;
		this.oCanvas.setMode(iMode); // does not clear canvas
		this.oCanvas.clearGraphics(oWin.iPaper);
	},

	move: function (x, y, iGPen, iGColMode) {
		x = this.vmRound(x);
		y = this.vmRound(y);
		if (iGPen !== undefined && iGPen !== null) {
			this.graphicsPen(iGPen);
		}
		if (iGColMode !== undefined) {
			this.oCanvas.setGColMode(iGColMode);
		}
		this.oCanvas.move(x, y);
	},

	mover: function (x, y, iGPen, iGColMode) {
		x = this.vmRound(x);
		y = this.vmRound(y);
		if (iGPen !== undefined && iGPen !== null) {
			this.graphicsPen(iGPen);
		}
		if (iGColMode !== undefined) {
			this.oCanvas.setGColMode(iGColMode);
		}
		this.oCanvas.mover(x, y);
	},

	"new": function () {
		this.vmNotImplemented("new");
	},

	// next

	// not

	onBreakCont: function () {
		this.iBreakGosubLine = -1; //TTT
		//this.vmNotImplemented("on break cont");
	},

	onBreakGosub: function (iLine) {
		this.iBreakGosubLine = iLine;
		//this.vmNotImplemented("on break gosub");
	},

	onBreakStop: function () {
		this.iBreakGosubLine = 0;
		//this.vmNotImplemented("on break stop");
	},

	onErrorGoto: function (iLine) {
		this.iErrorGotoLine = iLine;
		//this.vmNotImplemented("on error goto");
	},

	onGosub: function (retLabel, n) { // varargs
		var iLine;

		if (!n || (n + 2) > arguments.length) { // out of range? => continue with line after onGosub
			if (Utils.debug > 0) {
				Utils.console.debug("DEBUG: onGosub: out of range: n=" + n + " in " + this.iLine);
			}
			iLine = retLabel;
		} else {
			iLine = arguments[n + 1]; // n=1...; start with argument 2
			this.aGosubStack.push(retLabel);
		}
		this.vmGotoLine(iLine, "onGosub (n=" + n + ", ret=" + retLabel + ", iLine=" + iLine + ")");
	},

	onGoto: function (retLabel, n) { // varargs
		var iLine;

		if (!n || (n + 2) > arguments.length) { // out of range? => continue with line after onGoto
			if (Utils.debug > 0) {
				Utils.console.debug("DEBUG: onGoto: out of range: n=" + n + " in " + this.iLine);
			}
			iLine = retLabel;
		} else {
			iLine = arguments[n + 1];
		}
		this.vmGotoLine(iLine, "onGoto (n=" + n + ", ret=" + retLabel + ", iLine=" + iLine + ")");
	},

	fnChannel2ChannelIndex: function (iChannel) {
		if (iChannel === 4) {
			iChannel = 2;
		} else {
			iChannel -= 1;
		}
		return iChannel;
	},

	onSqGosub: function (iChannel, iLine) {
		var oSqTimer;

		iChannel = this.vmRound(iChannel);
		iChannel = this.fnChannel2ChannelIndex(iChannel);
		oSqTimer = this.aSqTimer[iChannel];
		oSqTimer.iLine = iLine;
		oSqTimer.bActive = true;
		oSqTimer.bRepeat = true; // means reloaded for sq
	},

	vmOpeninCallback: function (sInput) {
		var oInFile = this.oInFile;

		if (sInput !== null) {
			oInFile.aInput = sInput.split("\n");
			oInFile.sState = "loaded";
		} else {
			Utils.console.error("Cannot open file: ", oInFile.sName);
			this.error(32); // broken in
			this.closein();
		}
	},

	openin: function (sName) {
		var oInFile = this.oInFile;

		sName = this.vmAdaptFilename(sName);
		if (!oInFile.bOpen) {
			if (sName) {
				oInFile.bOpen = true;
				oInFile.sCommand = "openin";
				oInFile.sName = sName;
				oInFile.fnFileCallback = this.vmOpeninCallback.bind(this);
				this.vmStop("loadFile", 90);
			}
		} else {
			this.error(27); // file already open
		}
	},

	openout: function () {
		this.vmNotImplemented("openout");
	},

	// or

	origin: function (xOff, yOff, xLeft, xRight, yTop, yBottom) { // parameters starting from xLeft are optional
		var tmp;

		xOff = this.vmRound(xOff);
		yOff = this.vmRound(yOff);
		this.oCanvas.setOrigin(xOff, yOff);

		if (xLeft !== undefined) {
			xLeft = this.vmRound(xLeft);
			xRight = this.vmRound(xRight);
			yTop = this.vmRound(yTop);
			yBottom = this.vmRound(yBottom);
			if (yTop < yBottom) {
				tmp = yTop;
				yTop = yBottom;
				yBottom = tmp;
			}
			this.oCanvas.setGWindow(xLeft, xRight, yTop, yBottom);
		}
	},

	out: function (iPort, iByte) {
		this.vmNotImplemented("out");
		if (Utils.debug > 0) {
			Utils.console.debug("DEBUG: out", Number(iPort).toString(16, 4), iByte);
		}
	},

	paper: function (iStream, iPaper) {
		var oWin;

		iStream = this.vmRound(iStream || 0);
		oWin = this.aWindow[iStream];
		iPaper = this.vmRound(iPaper);
		oWin.iPaper = iPaper;
	},

	peek: function (iAddr) {
		var iByte = this.aMem[iAddr] || 0;

		return iByte;
	},

	pen: function (iStream, iPen, iTransparent) {
		var oWin;

		if (iPen !== null) {
			iStream = this.vmRound(iStream || 0);
			oWin = this.aWindow[iStream];
			iPen = this.vmRound(iPen);
			oWin.iPen = iPen;
		}

		if (iTransparent !== null && iTransparent !== undefined) {
			iTransparent = this.vmRound(iTransparent);
			this.oCanvas.setTranspartentMode(iTransparent);
		}
	},

	pi: function () {
		return Math.PI; // or less precise: 3.14159265
	},

	plot: function (x, y, iGPen, iGColMode) { // 2, up to 4 parameters
		x = this.vmRound(x);
		y = this.vmRound(y);
		if (iGPen !== undefined && iGPen !== null) {
			this.graphicsPen(iGPen);
		}
		if (iGColMode !== undefined) {
			this.oCanvas.setGColMode(iGColMode);
		}
		this.oCanvas.plot(x, y);
	},

	plotr: function (x, y, iGPen, iGColMode) {
		x = this.vmRound(x);
		y = this.vmRound(y);
		if (iGPen !== undefined && iGPen !== null) {
			this.graphicsPen(iGPen);
		}
		if (iGColMode !== undefined) {
			this.oCanvas.setGColMode(iGColMode);
		}
		this.oCanvas.plotr(x, y);
	},

	poke: function (iAddr, iByte) {
		iAddr = this.vmRound(iAddr);
		iByte = this.vmRound(iByte);
		this.aMem[iAddr] = iByte;
	},

	pos: function (iStream) {
		iStream = this.vmRound(iStream || 0);
		this.vmMoveCursor2AllowedPos(iStream);
		return this.aWindow[iStream].iPos + 1;
	},

	vmMoveCursor2AllowedPos: function (iStream) {
		var oWin = this.aWindow[iStream],
			iLeft = oWin.iLeft,
			iRight = oWin.iRight,
			iTop = oWin.iTop,
			iBottom = oWin.iBottom,
			x = oWin.iPos,
			y = oWin.iVpos;

		if (x > (iRight - iLeft)) {
			y += 1;
			x = 0;
		}

		if (x < 0) {
			y -= 1;
			x = iRight - iLeft;
		}

		if (y < 0) {
			y = 0;
			this.oCanvas.windowScrollDown(iLeft, iRight, iTop, iBottom, oWin.iPaper);
		}

		if (y > (iBottom - iTop)) {
			y = iBottom - iTop;
			this.oCanvas.windowScrollUp(iLeft, iRight, iTop, iBottom, oWin.iPaper);
		}
		oWin.iPos = x;
		oWin.iVpos = y;
	},

	vmPrintChars: function (sStr, iStream) {
		var oWin = this.aWindow[iStream],
			i, iChar;

		if (!oWin.bTextEnabled) {
			if (Utils.debug > 0) {
				Utils.console.debug("DEBUG: vmPrintChars: text output disabled: " + sStr);
			}
			return;
		}

		// put cursor in next line if string does not fit in line any more
		this.vmMoveCursor2AllowedPos(iStream);
		if (oWin.iPos && (oWin.iPos + sStr.length > (oWin.iRight + 1 - oWin.iLeft))) {
			oWin.iPos = 0;
			oWin.iVpos += 1; // "\r\n", newline if string does not fit in line
		}
		for (i = 0; i < sStr.length; i += 1) {
			iChar = this.vmGetCpcCharCode(sStr.charCodeAt(i));
			this.vmMoveCursor2AllowedPos(iStream);
			this.oCanvas.printChar(iChar, oWin.iPos + oWin.iLeft, oWin.iVpos + oWin.iTop, oWin.iPen, oWin.iPaper);
			oWin.iPos += 1;
		}
	},

	vmControlSymbol: function (sPara) {
		var aPara = [],
			i;

		for (i = 0; i < sPara.length; i += 1) {
			aPara.push(sPara.charCodeAt(i));
		}
		this.symbol.apply(this, aPara);
	},

	vmControlWindow: function (sPara, iStream) {
		var aPara = [iStream],
			i;

		for (i = 0; i < sPara.length; i += 1) {
			aPara.push(sPara.charCodeAt(i));
		}

		this.window.apply(this, aPara);
	},

	vmHandleControlCode: function (iCode, sPara, iStream) { // eslint-disable-line complexity
		var oWin = this.aWindow[iStream],
			sOut = "",
			i;

		switch (iCode) {
		case 0x00: // NUL, ignore
			break;
		case 0x01: // SOH 0-255
			this.vmPrintChars(sPara, iStream);
			break;
		case 0x02: //TODO STX
			break;
		case 0x03: //TODO ETX
			break;
		case 0x04: // EOT 0-3 (on CPC: 0-2)
			this.mode(sPara.charCodeAt(0));
			break;
		case 0x05: // ENQ
			this.vmPrintGraphChars(sPara);
			break;
		case 0x06: // ACK
			oWin.bTextEnabled = true;
			break;
		case 0x07: // BEL
			this.sound(135, 90, 20, 12, 0, 0, 0);
			break;
		case 0x08: // BS
			this.vmMoveCursor2AllowedPos(iStream);
			oWin.iPos -= 1;
			break;
		case 0x09: // TAB
			this.vmMoveCursor2AllowedPos(iStream);
			oWin.iPos += 1;
			break;
		case 0x0a: // LF
			this.vmMoveCursor2AllowedPos(iStream);
			oWin.iVpos += 1;
			break;
		case 0x0b: // VT
			this.vmMoveCursor2AllowedPos(iStream);
			oWin.iVpos -= 1;
			break;
		case 0x0c: // FF
			this.cls(iStream);
			break;
		case 0x0d: // CR
			this.vmMoveCursor2AllowedPos(iStream);
			oWin.iPos = 0;
			break;
		case 0x0e: // SO
			this.paper(iStream, sPara.charCodeAt(0));
			break;
		case 0x0f: // SI
			this.pen(iStream, sPara.charCodeAt(0));
			break;
		case 0x10: // DLE
			this.vmMoveCursor2AllowedPos(iStream);
			this.oCanvas.fillTextBox(oWin.iLeft + oWin.iPos, oWin.iTop + oWin.iVpos, 1, 1, oWin.iPaper); // clear character under cursor
			break;
		case 0x11: // DC1
			this.vmMoveCursor2AllowedPos(iStream);
			this.oCanvas.fillTextBox(oWin.iLeft, oWin.iTop + oWin.iVpos, oWin.iPos + 1, 1, oWin.iPaper); // clear line up to cursor
			break;
		case 0x12: // DC2
			this.vmMoveCursor2AllowedPos(iStream);
			this.oCanvas.fillTextBox(oWin.iLeft + oWin.iPos, oWin.iTop + oWin.iVpos, oWin.iRight - oWin.iLeft + 1 - oWin.iPos, 1, oWin.iPaper); // clear line from cursor
			break;
		case 0x13: // DC3
			this.vmMoveCursor2AllowedPos(iStream);
			this.oCanvas.fillTextBox(oWin.iLeft, oWin.iTop, oWin.iRight - oWin.iLeft + 1, oWin.iTop - oWin.iVpos, oWin.iPaper); // clear window up to cursor line -1
			this.oCanvas.fillTextBox(oWin.iLeft, oWin.iTop + oWin.iVpos, oWin.iPos + 1, 1, oWin.iPaper); // clear line up to cursor (DC1)
			break;
		case 0x14: // DC4
			this.vmMoveCursor2AllowedPos(iStream);
			this.oCanvas.fillTextBox(oWin.iLeft + oWin.iPos, oWin.iTop + oWin.iVpos, oWin.iRight - oWin.iLeft + 1 - oWin.iPos, 1, oWin.iPaper); // clear line from cursor (DC2)
			this.oCanvas.fillTextBox(oWin.iLeft, oWin.iTop + oWin.iVpos + 1, oWin.iRight - oWin.iLeft + 1, oWin.iBottom - oWin.iTop - oWin.iVpos, oWin.iPaper); // clear window from cursor line +1
			break;
		case 0x15: // NAK
			oWin.bTextEnabled = false;
			break;
		case 0x16: // SYN
			// parameter: only bit 0 relevant (ROM: &14E3)
			this.oCanvas.setTranspartentMode(sPara.charCodeAt(0) & 0x01); // eslint-disable-line no-bitwise
			break;
		case 0x17: // ETB
			this.oCanvas.setGColMode(sPara.charCodeAt(0));
			break;
		case 0x18: // CAN
			i = oWin.iPen;
			this.pen(iStream, oWin.iPaper);
			this.paper(iStream, i);
			break;
		case 0x19: // EM
			this.vmControlSymbol(sPara);
			break;
		case 0x1a: // SUB
			this.vmControlWindow(sPara);
			break;
		case 0x1b: // ESC, ignored
			break;
		case 0x1c: // FS
			this.ink(sPara.charCodeAt(0), sPara.charCodeAt(1), sPara.charCodeAt(2));
			break;
		case 0x1d: // GS
			this.border(sPara.charCodeAt(0), sPara.charCodeAt(1));
			break;
		case 0x1e: // RS
			oWin.iPos = 0;
			oWin.iVpos = 0;
			break;
		case 0x1f: // US
			this.locate(iStream, sPara.charCodeAt(0), sPara.charCodeAt(1));
			break;
		default:
			Utils.console.warn("vmHandleControlCode: Unknown control code: " + iCode);
			break;
		}
		return sOut;
	},

	mControlCodeParameterCount: [
		0, // 0x00
		1, // 0x01
		0, // 0x02
		0, // 0x03
		1, // 0x04
		1, // 0x05
		0, // 0x06
		0, // 0x07
		0, // 0x08
		0, // 0x09
		0, // 0x0a
		0, // 0x0b
		0, // 0x0c
		0, // 0x0d
		1, // 0x0e
		1, // 0x0f
		0, // 0x10
		0, // 0x11
		0, // 0x12
		0, // 0x13
		0, // 0x14
		0, // 0x15
		1, // 0x16
		1, // 0x17
		0, // 0x18
		9, // 0x19
		4, // 0x1a
		0, // 0x1b
		3, // 0x1c
		2, // 0x1d
		0, // 0x1e
		2 //  0x1f
	],

	vmPrintCharsOrControls: function (sStr, iStream, sBuf) {
		var sOut = "",
			i = 0,
			iCode, iParaCount;

		if (sBuf && sBuf.length) {
			sStr = sBuf + sStr;
			sBuf = "";
		}

		while (i < sStr.length) {
			iCode = sStr.charCodeAt(i);
			i += 1;
			if (iCode <= 0x1f) { // control code?
				if (sOut !== "") {
					this.vmPrintChars(sOut, iStream); // print chars collected so far
					sOut = "";
				}
				iParaCount = this.mControlCodeParameterCount[iCode];
				if (i + iParaCount <= sStr.length) {
					sOut += this.vmHandleControlCode(iCode, sStr.substr(i, iParaCount), iStream);
					i += iParaCount;
				} else {
					sBuf = sStr.substr(i - 1); // not enough parameters, put code in buffer and wait for more
					i = sStr.length;
				}
			} else {
				sOut += String.fromCharCode(iCode);
			}
		}
		if (sOut !== "") {
			this.vmPrintChars(sOut, iStream); // print chars collected so far
			sOut = "";
		}
		return sBuf;
	},

	vmPrintGraphChars: function (sStr) {
		var iChar, i;

		for (i = 0; i < sStr.length; i += 1) {
			iChar = this.vmGetCpcCharCode(sStr.charCodeAt(i));
			this.oCanvas.printGChar(iChar);
		}
	},

	print: function (iStream) { // varargs
		var oWin = this.aWindow[iStream],
			sBuf = "",
			aSpecialArgs,
			sStr, i, arg;

		if (iStream < 8) {
			for (i = 1; i < arguments.length; i += 1) {
				arg = arguments[i];
				if (typeof arg === "object") { // delayed call for spc(), tab(), commaTab()
					aSpecialArgs = arg.args; // TODO: copy?
					aSpecialArgs.unshift(iStream);
					sStr = this[arg.type].apply(this, aSpecialArgs);
				} else if (typeof arg === "number") {
					sStr = ((arg >= 0) ? " " : "") + String(arg) + " ";
				} else {
					sStr = String(arg);
				}

				if (oWin.bTag) {
					this.vmPrintGraphChars(sStr);
				} else {
					sBuf = this.vmPrintCharsOrControls(sStr, iStream, sBuf);
				}
				this.sOut += sStr; // console
			}
		} else if (iStream === 8) {
			this.vmNotImplemented("print #8");
		} else if (iStream === 9) {
			this.vmNotImplemented("print #9");
		}
	},

	rad: function () {
		this.bDeg = false;
	},

	// https://en.wikipedia.org/wiki/Jenkins_hash_function
	vmHashCode: function (s) {
		var iHash = 0,
			i;

		/* eslint-disable no-bitwise */
		for (i = 0; i < s.length; i += 1) {
			iHash += s.charCodeAt(i);
			iHash += iHash << 10;
			iHash ^= iHash >> 6;
		}
		iHash += iHash << 3;
		iHash ^= iHash >> 11;
		iHash += iHash << 15;
		/* eslint-enable no-bitwise */
		return iHash;
	},

	vmRandomizeCallback: function (sInput) {
		Utils.console.log("vmRandomizeCallback: " + sInput);
		this.oInput.aInputValues = [sInput];
	},

	randomize: function (n) {
		var iRndInit = 0x89656c07, // an arbitrary 32 bit number <> 0 (this one is used by the CPC)
			iStream = 0,
			sMsg;

		if (n === undefined) { // no arguments? input...
			sMsg = "Random number seed?";
			this.oInput.fnInputCallback = this.vmRandomizeCallback.bind(this);
			this.oInput.sInput = "";
			this.print(iStream, sMsg);
			this.vmStop("input", 45);
		} else { // n can also be floating point, so compute a hash value of n
			n = this.vmHashCode(String(n));
			if (n === 0) {
				n = iRndInit;
			}
			Utils.console.log("randomize: " + n);
			this.oRandom.init(n);
		}
	},

	read: function (sVar) {
		var item = 0;

		if (this.iData < this.aData.length) {
			item = this.aData[this.iData];
			this.iData += 1;
			if (this.vmDetermineVarType(sVar) !== "$") { // not string? => convert to number (also binary, hex)
				item = this.val(item);
			}
		} else {
			this.error(4); // DATA exhausted
		}
		return item;
	},

	release: function (iChannelMask) {
		this.oSound.release(iChannelMask);
	},

	// rem

	remain: function (iTimer) {
		var oTimer,
			iTime = 0;

		iTimer = this.vmRound(iTimer);
		oTimer = this.aTimer[iTimer];
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
		var oDataLineIndex = this.oDataLineIndex,
			iDataLine;

		iLine = iLine || 0;
		if (iLine in oDataLineIndex) {
			this.iData = oDataLineIndex[iLine];
		} else {
			Utils.console.log("restore: search for dataLine>" + iLine);
			for (iDataLine in oDataLineIndex) { // linear search a data line > line
				if (oDataLineIndex.hasOwnProperty(iDataLine)) {
					if (iDataLine >= iLine) {
						oDataLineIndex[iLine] = oDataLineIndex[iDataLine]; // set data index also for iLine
						break;
					}
				}
			}
			if (iLine in oDataLineIndex) { // now found a data line?
				this.iData = oDataLineIndex[iLine];
			} else {
				Utils.console.warn("restore: " + iLine + " not found");
				this.error(8); // Line does not exist
			}
		}
	},

	resume: function (iLine) { // resume, resume n, resume next
		if (iLine) {
			this.vmGotoLine(iLine, "resume");
		} else if (this.iErrorResumeLine) {
			this.vmGotoLine(this.iErrorResumeLine, "resume");
			this.iErrorResumeLine = 0;
		} else {
			this.error(20); // Unexpected RESUME
		}
	},

	resumeNext: function () {
		this.vmNotImplemented("resume next");
	},

	"return": function () {
		var iLine = this.aGosubStack.pop();

		if (iLine === undefined) {
			this.error(3); // Unexpected Return [in <line>]
		} else {
			this.vmGotoLine(iLine, "return");
		}
		this.vmCheckTimerHandlers(); // if we are at end of a BASIC timer handler, delete handler flag
		if (this.vmCheckSqTimerHandlers()) { // same for sq timers, timer reloaded?
			this.fnCheckSqTimer(); // next one early
		}
	},

	right$: function (s, iLen) {
		iLen = this.vmRound(iLen);
		return s.slice(-iLen);
	},

	rnd: function (n) {
		var x;

		if (n < 0) { // TODO
			x = this.lastRnd || this.oRandom.random();
		} else if (n === 0) {
			x = this.lastRnd || this.oRandom.random();
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
		Utils.console.log("rsxBasic");
		this.vmStop("reset", 90);
	},

	rsxCpm: function () {
		this.vmNotImplemented("|CPM");
	},

	rsxMode: function (iMode, s) {
		var oWinData = this.mWinData[this.iMode],
			i, oWin;

		Utils.console.log("rsxMode: (test) " + iMode + " " + s);
		iMode = this.vmRound(iMode);
		this.iMode = iMode;

		for (i = 0; i < this.iStreamCount - 2; i += 1) { // for window streams
			oWin = this.aWindow[i];
			Object.assign(oWin, oWinData);
		}
		this.oCanvas.changeMode(iMode); // or setMode?
	},

	vmRunCallback: function (sInput) {
		var oInFile = this.oInFile;

		if (sInput !== null) {
			//oInFile.sState = "loaded";
			//TODO
			this.oInput.aInputValues = [oInFile.iLine]; // we misuse aInputValues
			this.vmStop("run", 90);
		} else {
			Utils.console.error("Cannot open file: ", oInFile.sName);
			this.error(32); // broken in
			this.closein();
		}
	},

	run: function (numOrString) {
		var oInFile = this.oInFile,
			sName;

		if (typeof numOrString === "string") { // filename?
			sName = this.vmAdaptFilename(numOrString);
			this.closein();
			oInFile.bOpen = true;
			oInFile.sCommand = "run";
			oInFile.sName = sName;
			oInFile.fnFileCallback = this.vmRunCallback.bind(this);
			this.vmStop("loadFile", 90);
		} else {
			this.oInput.aInputValues = [numOrString]; // we misuse aInputValues
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

	vmSoundCallback: function (sInput) {
		var oSoundData;

		Utils.console.log("vmSoundCallback: " + sInput);
		if (this.aSoundData.length) {
			oSoundData = this.aSoundData.shift();
			this.oSound.sound(oSoundData);
		}
	},

	sound: function (iState, iPeriod, iDuration, iVolume, iVolEnv, iToneEnv, iNoise) {
		var oSoundData, i, oSqTimer;

		if (iDuration === undefined) {
			iDuration = 20;
		}
		if (iVolume === undefined || iVolume === null) {
			iVolume = 12;
		}

		oSoundData = {
			iState: iState,
			iPeriod: iPeriod,
			iDuration: iDuration,
			iVolume: iVolume,
			iVolEnv: iVolEnv,
			iToneEnv: iToneEnv,
			iNoise: iNoise
		};

		if (this.oSound.testCanQueue(iState)) {
			this.oSound.sound(oSoundData);
		} else {
			this.aSoundData.push(oSoundData);
			this.vmStop("sound", 43);
			for (i = 0; i < 3; i += 1) {
				if (iState & (1 << i)) { // eslint-disable-line no-bitwise
					oSqTimer = this.aSqTimer[i];
					oSqTimer.bActive = false; // set onSq timer to inactive
				}
			}
		}
	},

	space$: function (n) {
		n = this.vmRound(n);
		return " ".repeat(n);
	},

	spc: function (iStream, n) { // special spc function with additional parameter iStream, which is called delayed by print (ROM &F277)
		var oWin = this.aWindow[iStream],
			iWidth = oWin.iRight - oWin.iLeft + 1;

		if (iWidth) {
			n %= iWidth;
		}
		n = this.vmRound(n);
		return " ".repeat(n);
	},

	speedInk: function () {
		this.vmNotImplemented("speedInk"); // default: 10,10
	},

	speedKey: function () {
		this.vmNotImplemented("speedKey");
	},

	speedWrite: function () {
		this.vmNotImplemented("speedWrite");
	},

	sq: function (iChannel) {
		var oSqTimer, iSq;

		iChannel = this.vmRound(iChannel);
		iChannel = this.fnChannel2ChannelIndex(iChannel);
		iSq = this.oSound.sq(iChannel);

		oSqTimer = this.aSqTimer[iChannel];
		// no space in queue and handler active?
		if (!(iSq & 0x07) && oSqTimer.bActive) { // eslint-disable-line no-bitwise
			oSqTimer.bActive = false; // set onSq timer to inactive
		}
		return iSq;
	},

	sqr: function (n) {
		return Math.sqrt(n);
	},

	// step

	stop: function (sLabel) {
		this.vmGotoLine(sLabel, "stop");
		this.vmStop("stop", 60);
	},

	str$: function (n) {
		var sStr;

		if (typeof n === "number") {
			sStr = ((n >= 0) ? " " : "") + String(n);
		} else {
			sStr = String(n);
		}
		return sStr;
	},

	string$: function (iLen, chr) {
		iLen = this.vmRound(iLen);
		if (typeof chr === "number") {
			chr = String.fromCharCode(chr); // chr$
		}
		return chr.repeat(iLen);
	},

	// swap (window swap)

	symbol: function (iChar) { // varargs  (iChar, rows 1..8)
		var aArgs = [],
			i;

		iChar = this.vmRound(iChar);
		for (i = 1; i < arguments.length; i += 1) { // start with 1
			aArgs.push(this.vmRound(arguments[i]));
		}
		// Note: If there are less than 8 rows, the othere are assumes as 0 (actually empty)
		this.oCanvas.setCustomChar(iChar, aArgs);
	},

	symbolAfter: function (n) {
		this.iHimem = 42747 - (256 - n) * 8;
		// symbolAfter not needed
	},

	tab: function (iStream, n) { // special tab function with additional parameter iStream, which is called delayed by print (ROM &F280)
		var	oWin = this.aWindow[iStream],
			iWidth = oWin.iRight - oWin.iLeft + 1,
			iCount;

		n = this.vmRound(n);
		n -= 1;
		if (iWidth) {
			n %= iWidth;
		}

		iCount = n - oWin.iPos;
		if (iCount < 0) { // does it fit until tab position?
			oWin.iPos = oWin.iRight + 1;
			this.vmMoveCursor2AllowedPos(iStream);
			iCount = n; // set tab in next line
		}
		return " ".repeat(iCount);
	},

	tag: function (iStream) {
		var oWin;

		iStream = this.vmRound(iStream || 0);
		oWin = this.aWindow[iStream];
		oWin.bTag = true;
	},

	tagoff: function (iStream) {
		var oWin;

		iStream = this.vmRound(iStream || 0);
		oWin = this.aWindow[iStream];
		oWin.bTag = false;
	},

	tan: function (n) {
		return Math.tan((this.bDeg) ? Utils.toRadians(n) : n);
	},

	test: function (x, y) {
		x = this.vmRound(x);
		y = this.vmRound(y);
		return this.oCanvas.test(x, y);
	},

	testr: function (x, y) {
		x = this.vmRound(x);
		y = this.vmRound(y);
		return this.oCanvas.testr(x, y);
	},

	// then

	time: function () {
		return ((Date.now() - this.iStartTime) * 300 / 1000) | 0; // eslint-disable-line no-bitwise
	},

	// to

	troff: function () {
		this.bTron = false;
	},

	tron: function () {
		this.bTron = true;
	},

	unt: function (n) {
		n = this.vmRound(n);
		if (n > 32767) {
			n -= 65536;
		}
		return n;
	},

	upper$: function (s) {
		if (s >= "a" && s <= "z") {
			s = s.toUpperCase();
		}
		return s;
	},

	using: function (sFormat) { // varargs
		var reFormat = /(!|&|\\ *\\|(?:\*\*|\$\$|\*\*\$)?\+?#+,?\.?#*(?:\^\^\^\^)?[+-]?)/,
			s = "",
			aFormat, sFrmt, iFormat, i, sArg;

		aFormat = sFormat.split(reFormat);

		if (!aFormat.length) {
			Utils.console.warn("using: empty format:", sFormat);
			this.error(2); // Syntax Error
			return "";
		}

		iFormat = 0;
		for (i = 1; i < arguments.length; i += 1) { // start with 1
			iFormat %= aFormat.length;
			if (iFormat === 0) {
				sFrmt = aFormat[iFormat];
				iFormat += 1;
				s += sFrmt;
			}
			if (iFormat < aFormat.length) {
				sArg = arguments[i];
				sFrmt = aFormat[iFormat];
				iFormat += 1;
				s += this.vmUsingFormat1(sFrmt, sArg);
			}
			if (iFormat < aFormat.length) {
				sFrmt = aFormat[iFormat];
				iFormat += 1;
				s += sFrmt;
			}
		}
		return s;
	},

	val: function (s) {
		var iNum = 0;

		if (typeof s !== "string") {
			this.error(13); // Type mismatch
		} else {
			s = s.trim().toLowerCase();
			if (Utils.stringStartsWith(s, "&x")) { // binary &x
				s = s.slice(2);
				iNum = parseInt(s, 2);
			} else if (Utils.stringStartsWith(s, "&h")) { // hex &h
				s = s.slice(2);
				iNum = parseInt(s, 16);
			} else if (Utils.stringStartsWith(s, "&")) { // hex &
				s = s.slice(1);
				iNum = parseInt(s, 16);
			} else {
				iNum = parseFloat(s);
			}

			if (isNaN(iNum)) {
				iNum = 0;
			}
		}
		return iNum;
	},

	vpos: function (iStream) {
		iStream = this.vmRound(iStream || 0);
		this.vmMoveCursor2AllowedPos(iStream);
		return this.aWindow[iStream].iVpos + 1;
	},

	wait: function (iPort /* , iMask, iInv */) {
		iPort = this.vmRound(iPort);
		if (iPort === 0) {
			debugger; // Testing
		}
	},

	// wend

	// while

	width: function () {
		this.vmNotImplemented("width");
	},

	window: function (iStream, iLeft, iRight, iTop, iBottom) {
		var oWin = this.aWindow[iStream];

		iLeft = this.vmRound(iLeft);
		iRight = this.vmRound(iRight);
		iTop = this.vmRound(iTop);
		iBottom = this.vmRound(iBottom);
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
		var aArgs = [],
			i, arg, sStr;

		for (i = 1; i < arguments.length; i += 1) {
			arg = arguments[i];
			if (typeof arg === "number") {
				aArgs.push(String(arg));
			} else {
				aArgs.push('"' + String(arg) + '"');
			}
		}
		sStr = aArgs.join(",");

		if (iStream < 8) {
			this.vmPrintChars(sStr, iStream);
			this.vmPrintCharsOrControls("\r\n", iStream);
		} else if (iStream === 8) {
			this.vmNotImplemented("write #8");
		} else if (iStream === 9) {
			this.vmNotImplemented("write #9");
		}
		this.sOut += sStr + "\n"; // console
	},

	// xor

	xpos: function () {
		return this.oCanvas.getXpos();
	},

	ypos: function () {
		return this.oCanvas.getYpos();
	},

	zone: function (n) {
		this.iZone = this.vmRound(n);
	}
};


CpcVm.ErrorObject = function (message, value, pos) {
	this.message = message;
	this.value = value;
	this.pos = pos;
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = CpcVm;
}
