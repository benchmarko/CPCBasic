// CpcVm.js - CPC Virtual Machine
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//

"use strict";

var Utils, CpcVmRsx, Random;

if (typeof require !== "undefined") {
	/* eslint-disable global-require */
	Utils = require("./Utils.js");
	CpcVmRsx = require("./CpcVmRsx.js");
	Random = require("./Random.js");
	/* eslint-enable global-require */
}

function CpcVm(options) {
	this.vmInit(options);
}

CpcVm.prototype = {
	iFrameTimeMs: 1000 / 50, // 50 Hz => 20 ms
	iTimerCount: 4, // number of timers
	iSqTimerCount: 3, // sound queue timers
	iStreamCount: 10, // 0..7 window, 8 printer, 9 cassette
	iMinHimem: 370,
	iMaxHimem: 42747, // high memory limit (42747 after symbol after 256)

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

		this.fnOpeninHandler = this.vmOpeninCallback.bind(this);
		this.fnCloseinHandler = this.vmCloseinCallback.bind(this);
		this.fnCloseoutHandler = this.vmCloseoutCallback.bind(this);
		this.fnLoadHandler = this.vmLoadCallback.bind(this);
		this.fnRunHandler = this.vmRunCallback.bind(this);

		this.oCanvas = this.options.canvas;
		this.oKeyboard = this.options.keyboard;
		this.oSound = this.options.sound;

		this.rsx = new CpcVmRsx(this);

		this.oRandom = new Random();

		this.vmSetVariables({});

		this.oStop = {
			sReason: "", // stop reason
			iPriority: 0, // stop priority (higher number means higher priority which can overwrite lower priority)
			oParas: null // optional stop parameters
		};
		// special stop reasons and priorities:
		// "timer": 20 (timer expired)
		// "key": 30  (wait for key)
		// "waitFrame": 40 (FRAME command: wait for frame fly)
		// "waitSound": 43 (wait for sound queue)
		// "waitInput": 45 (wait for input: INPUT, LINE INPUT, RANDOMIZE without parameter)
		// "fileCat": 45 (CAT)
		// "fileDir": 45 (|DIR)
		// "fileEra": 45 (|ERA)
		// "fileRen": 45 (|REN)
		// "error": 50 (BASIC error, ERROR command)
		// "onError": 50 (ON ERROR GOTO active, hide error)
		// "stop": 60 (STOP or END command)
		// "break": 80 (break pressed)
		// "escape": 85 (escape key, set in controller)
		// "renumLines": 85 (RENUMber program)
		// "deleteLines": 90,
		// "end": 90 (end of program)
		// "list": 90,
		// "fileLoad": 90 (CHAIN, CHAIN MERGE, LOAD, MERGE, OPENIN, RUN)
		// "fileSave": 90 (OPENOUT, SAVE)
		// "reset": 90 (reset system)
		// "run": 90

		this.aInputValues = []; // values to input into script

		this.oInFile = {}; // file handling
		this.oOutFile = {}; // file handling
		// "bOpen": File open flag
		// "sCommand": Command that started the file open (in: chain, chainMerge, load, merge, openin, run; out: save, openput)
		// "sName": File name
		// "iAddress": // load address, save address
		// "iLine": ?
		// "fnFileCallback": Callback for stop reason "fileLoad", "fileSave"
		// "aFileData": File contents for (LINE) INPUT #9; PRINT #9, WRITE #9

		this.iInkeyTime = 0; // if >0, next time when inkey$ can be checked without inserting "waitFrame"

		this.aGosubStack = []; // stack of line numbers for gosub/return

		this.aMem = []; // for peek, poke

		this.aData = []; // array for BASIC data lines (continuous)

		this.aWindow = []; // window data for window 0..7,8,9
		for (i = 0; i < this.iStreamCount; i += 1) {
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
		this.iErrorResumeLine = 0;
		this.iBreakGosubLine = 0;
		this.bBreakResumeLine = 0; //TTT

		this.aInputValues.length = 0;
		this.vmResetFileHandling(this.oInFile);
		this.vmResetFileHandling(this.oOutFile);

		this.sOut = ""; // console output

		this.vmStop("", 0, true);

		this.vmResetData();

		this.iErr = 0; // last error code
		this.iErl = 0; // line of last error

		this.aGosubStack.length = 0;
		this.bDeg = false; // degree or radians

		this.bTron = this.options.tron || false; // trace flag
		this.iTronLine = 0; // last trace line

		this.aMem.length = 0; // for peek, poke
		this.iRamSelect = 0; // for banking with 16K banks in the range 0x4000-0x7fff (0=default; 1...=additional)
		this.iScreenPage = 3; // 16K screen page, 3=0xc000..0xffff

		this.iMinCharHimem = this.iMaxHimem;
		this.iMaxCharHimem = this.iMaxHimem;
		this.iHimem = this.iMaxHimem;
		this.iMinCustomChar = 256;
		this.symbolAfter(240); // set also iMinCustomChar

		this.vmResetTimers();
		this.bTimersDisabled = false; // flag if timers are disabled

		this.iZone = 13; // print tab zone value

		this.oVarTypes = {}; // variable types
		this.defreal("a-z");

		this.iMode = null;
		this.vmResetWindowData(true); // reset all, including pen and paper
		this.width(132); // set default printer width

		this.mode(1); // including vmResetWindowData() without pen and paper

		this.oCanvas.reset();
		this.oKeyboard.reset();
		this.oSound.reset();
		this.aSoundData.length = 0;

		this.iInkeyTime = 0; // if >0, next time when inkey$ can be checked without inserting "waitFrame"
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

	vmResetWindowData: function (bResetPenPaper) {
		var oWinData = this.mWinData[this.iMode],
			oData = {
				iPos: 0, // current text position in line
				iVpos: 0,
				bTextEnabled: true, // text enabled
				bTag: false, // tag=text at graphics
				bTransparent: false, // transparent mode
				bCursorOn: false, // system switch
				bCursorEnabled: true // user switch
			},
			oPrintData = {
				iPos: 0,
				iVpos: 0,
				iRight: 132 // override
			},
			oCassetteData = {
				iPos: 0,
				iVpos: 0,
				iRight: 255 // override
			},
			i, oWin;

		if (bResetPenPaper) {
			oData.iPen = 1;
			oData.iPaper = 0;
		}

		for (i = 0; i < this.aWindow.length - 2; i += 1) { // for window streams
			oWin = this.aWindow[i];
			Object.assign(oWin, oWinData, oData);
		}

		oWin = this.aWindow[8]; // printer
		Object.assign(oWin, oWinData, oPrintData);

		oWin = this.aWindow[9]; // cassette
		Object.assign(oWin, oWinData, oCassetteData);
	},

	vmResetFileHandling: function (oFile) {
		oFile.bOpen = false;
		oFile.sCommand = ""; // to be sure
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

	vmReset4Run: function () {
		var iStream = 0;

		this.vmResetInks();
		this.clearInput();
		this.closein();
		this.closeout();
		this.cursor(iStream, 0);
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
			if (!this.iBreakResumeLine) { // do not nest break gosub
				this.iBreakResumeLine = this.iLine;
				this.gosub(this.iLine, this.iBreakGosubLine);
			}
			bStop = false;
		} else if (this.iBreakGosubLine < 0) { // on break cont
			bStop = false;
		} // else: on break stop

		return bStop;
	},

	vmAssertNumber: function (n, sErr) {
		if (typeof n !== "number") {
			throw this.vmComposeError(Error(), 13, sErr + " " + n); // Type mismatch
		}
	},

	vmAssertString: function (s, sErr) {
		if (typeof s !== "string") {
			throw this.vmComposeError(Error(), 13, sErr + " " + s); // Type mismatch
		}
	},

	// round number (-2^31..2^31) to integer; throw error if no number
	vmRound: function (n, sErr) { // optional sErr
		this.vmAssertNumber(n, sErr || "?");
		return (n >= 0) ? (n + 0.5) | 0 : (n - 0.5) | 0; // eslint-disable-line no-bitwise
	},

	/*
	// round for comparison TODO
	vmRound4Cmp: function (n) {
		var nAdd = (n >= 0) ? 0.5 : -0.5;

		return ((n * 1e12 + nAdd) | 0) / 1e12; // eslint-disable-line no-bitwise
	},
	*/

	vmInRangeRound: function (n, iMin, iMax, sErr) { // optional sErr
		n = this.vmRound(n, sErr);
		if (n < iMin || n > iMax) {
			Utils.console.warn("vmInRangeRound: number not in range:", iMin + "<=" + n + "<=" + iMax);
			throw this.vmComposeError(Error(), n < -32768 || n > 32767 ? 6 : 5, sErr + " " + n); // 6=Overflow, 5=Improper argument
		}
		return n;
	},

	vmDetermineVarType: function (sVarType) { // used in controller
		var sType = (sVarType.length > 1) ? sVarType.charAt(1) : this.oVarTypes[sVarType.charAt(0)];

		return sType;
	},

	vmAssertNumberType: function (sVarType) {
		var sType = (sVarType.length > 1) ? sVarType.charAt(1) : this.oVarTypes[sVarType.charAt(0)];

		if (sType !== "I" && sType !== "R") { // not integer or real?
			throw this.vmComposeError(Error(), 13, "type " + sType); // "Type mismatch"
		}
	},

	// format a value for assignment to a variable with type determined from sVarType
	vmAssign: function (sVarType, value) {
		var sType = (sVarType.length > 1) ? sVarType.charAt(1) : this.oVarTypes[sVarType.charAt(0)];

		if (sType === "R") { // real
			this.vmAssertNumber(value, "=");
		} else if (sType === "I") { // integer
			value = this.vmRound(value, "="); // round number to integer
		} else if (sType === "$") { // string
			if (typeof value !== "string") {
				Utils.console.warn("vmAssign: expected string but got:", value);
				throw this.vmComposeError(Error(), 13, "type " + sType + "=" + value); // "Type mismatch"
			}
		}
		return value;
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
				"Broken", // 32 "Broken in" (derr=146: xxx not found)
				"Unknown error" // 33...
			],
			sError = aErrors[iErr] || aErrors[aErrors.length - 1]; // Unknown error

		return sError;
	},

	vmGotoLine: function (line, sMsg) {
		if (Utils.debug > 5) {
			if (typeof line === "number" || Utils.debug > 7) { // non-number labels only in higher debug levels
				Utils.console.debug("dvmGotoLine:", sMsg + ": " + line);
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
			this.oCanvas.updateSpeedInk();
			this.vmCheckTimer(iTime); // check BASIC timers and sound queue
			this.oSound.scheduler(); // on a real CPC it is 100 Hz, we use 50 Hz
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

	vmDefineVarTypes: function (sType, sNameOrRange, sErr) {
		var aRange, iFirst, iLast, i, sVarChar;

		this.vmAssertString(sNameOrRange, sErr);
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

	vmStop: function (sReason, iPriority, bForce, oParas) { // optional bForce, oParas
		iPriority = iPriority || 0;
		if (bForce || iPriority >= this.oStop.iPriority) {
			this.oStop.iPriority = iPriority;
			this.oStop.sReason = sReason;
			this.oStop.oParas = oParas;
		}
	},

	vmNotImplemented: function (sName) {
		Utils.console.warn("Not implemented:", sName);
	},

	// not complete
	vmUsingFormat1: function (sFormat, arg) {
		var sPadChar = " ",
			re1 = /^\\ *\\$/,
			iDecimals, iPadLen, sPad, aFormat, sStr;

		if (typeof arg === "string") {
			if (sFormat === "&") {
				sStr = arg;
			} else if (sFormat === "!") {
				sStr = arg.charAt(0);
			} else if (re1.test(sFormat)) { // "\...\"
				sStr = arg.substr(0, sFormat.length);
				iPadLen = sFormat.length - arg.length;
				sPad = (iPadLen > 0) ? sPadChar.repeat(iPadLen) : "";
				sStr = arg + sPad; // string left aligned
			} else { // no string format
				throw this.vmComposeError(Error(), 13, "USING format " + sFormat); // "Type mismatch"
			}
		} else { // number (not fully implemented)
			if (sFormat === "&" || sFormat === "!" || re1.test(sFormat)) { // string format for number?
				throw this.vmComposeError(Error(), 13, "USING format " + sFormat); // "Type mismatch"
			}
			if (sFormat.indexOf(".") < 0) { // no decimal point?
				arg = Number(arg).toFixed(0);
			} else { // assume ###.##
				aFormat = sFormat.split(".", 2);
				iDecimals = aFormat[1].length;
				// To avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
				arg = Number(Math.round(arg + "e" + iDecimals) + "e-" + iDecimals);
				arg = String(arg);
			}
			iPadLen = sFormat.length - arg.length;
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

	vmGetInFileObject: function () {
		return this.oInFile;
	},

	vmGetOutFileObject: function () {
		return this.oOutFile;
	},

	vmAdaptFilename: function (sName, sErr) {
		var iIndex;

		this.vmAssertString(sName, sErr);
		if (sName.indexOf("!") === 0) {
			sName = sName.substr(1); // remove preceding "!"
		}
		iIndex = sName.indexOf(":");
		if (iIndex >= 0) {
			sName = sName.substr(iIndex + 1); // remove user and drive letter including ":"
		}
		sName = sName.toLowerCase();

		if (!sName) {
			throw this.vmComposeError(Error(), 32, "Bad filename: " + sName);
		}
		return sName;
	},

	vmGetSoundData: function () {
		return this.aSoundData;
	},

	vmTrace: function (iLine) {
		var iStream = 0;

		this.iTronLine = iLine;
		if (this.bTron) {
			this.print(iStream, "[" + iLine + "]");
		}
	},

	vmDrawMovePlot: function (sType, x, y, iGPen, iGColMode) {
		var sTypeUc = sType.toUpperCase();

		x = this.vmInRangeRound(x, -32768, 32767, sTypeUc);
		y = this.vmInRangeRound(y, -32768, 32767, sTypeUc);
		if (iGPen !== undefined && iGPen !== null) {
			this.graphicsPen(iGPen);
		}
		if (iGColMode !== undefined) {
			iGColMode = this.vmInRangeRound(iGColMode, 0, 3, sTypeUc);
			this.oCanvas.setGColMode(iGColMode);
		}
		this.oCanvas[sType](x, y); // draw, drawr, move, mover, plot, plotr
	},

	vmAfterEveryGosub: function (sType, iInterval, iTimer, iLine) {
		var sTypeUc = sType.toUpperCase(),
			oTimer,	iIntervalMs;

		iInterval = this.vmInRangeRound(iInterval, 0, 32767, sTypeUc); // more would be overflow
		iTimer = this.vmInRangeRound(iTimer || 0, 0, 3, sTypeUc);
		oTimer = this.aTimer[iTimer];
		iIntervalMs = iInterval * this.iFrameTimeMs; // convert to ms

		oTimer.iIntervalMs = iIntervalMs;
		oTimer.iLine = iLine;
		oTimer.bRepeat = (sType === "every");
		oTimer.bActive = true;
		oTimer.iNextTimeMs = Date.now() + iIntervalMs;
	},

	vmCopyFromScreen: function (iSource, iDest) {
		var i, iByte;

		for (i = 0; i < 0x4000; i += 1) {
			iByte = this.oCanvas.getByte(iSource + i); // get byte from screen memory
			if (iByte === null) { // byte not visible on screen?
				iByte = this.aMem[iSource + i] || 0; // get it from our memory
			}
			this.aMem[iDest + i] = iByte;
		}
	},

	vmCopyToScreen: function (iSource, iDest) {
		var i, iByte;

		for (i = 0; i < 0x4000; i += 1) {
			iByte = this.aMem[iSource + i] || 0; // get it from our memory
			this.oCanvas.setByte(iDest + i, iByte);
		}
	},

	vmSetScreenBase: function (iByte) {
		var iPage, iOldPage, iAddr;

		iByte = this.vmInRangeRound(iByte, 0, 255, "screenBase");
		iPage = iByte >> 6; // eslint-disable-line no-bitwise
		iOldPage = this.iScreenPage;

		if (iPage !== iOldPage) {
			iAddr = iOldPage << 14; // eslint-disable-line no-bitwise
			this.vmCopyFromScreen(iAddr, iAddr);

			this.iScreenPage = iPage;
			iAddr = iPage << 14; // eslint-disable-line no-bitwise
			this.vmCopyToScreen(iAddr, iAddr);
		}
	},

	vmSetTransparentMode: function (iStream, iTransparent) {
		var oWin = this.aWindow[iStream];

		oWin.bTransparent = Boolean(iTransparent);
	},

	// --

	abs: function (n) {
		this.vmAssertNumber(n, "ABS");
		return Math.abs(n);
	},

	addressOf: function (sVar) { // addressOf operator
		var aVarNames = Object.keys(this.v),
			iPos;

		// not really implemented
		sVar = sVar.replace("v.", "");

		sVar = sVar.replace("[", "(");
		iPos = sVar.indexOf("("); // array variable with indices?
		if (iPos >= 0) {
			sVar = sVar.substr(0, iPos); // remove indices
		}

		iPos = aVarNames.indexOf(sVar);
		if (iPos === -1) {
			throw this.vmComposeError(Error(), 5, "@" + sVar); // Improper argument
		}
		return iPos;
	},

	afterGosub: function (iInterval, iTimer, iLine) {
		this.vmAfterEveryGosub("after", iInterval, iTimer, iLine);
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
		this.vmAssertString(s, "ASC");
		if (!s.length) {
			throw this.vmComposeError(Error(), 5, "ASC"); // Improper argument
		}
		return this.vmGetCpcCharCode(s.charCodeAt(0));
	},

	atn: function (n) {
		this.vmAssertNumber(n, "ATN");
		return Math.atan((this.bDeg) ? Utils.toRadians(n) : n);
	},

	auto: function () {
		this.vmNotImplemented("AUTO");
	},

	bin$: function (n, iPad) {
		n = this.vmInRangeRound(n, -32768, 65535, "BIN$");
		iPad = this.vmInRangeRound(iPad || 0, 0, 16, "BIN$");
		return n.toString(2).padStart(iPad || 16, 0);
	},

	border: function (iInk1, iInk2) { // ink2 optional
		iInk1 = this.vmInRangeRound(iInk1, 0, 31, "BORDER");
		if (iInk2 === undefined) {
			iInk2 = iInk1;
		} else {
			iInk2 = this.vmInRangeRound(iInk2, 0, 31, "BORDER");
		}
		this.oCanvas.setBorder(iInk1, iInk2);
	},

	// break

	vmTxtInverse: function (iStream) { // iStream must be checked
		var oWin = this.aWindow[iStream],
			iTmp;

		iTmp = oWin.iPen;
		this.pen(iStream, oWin.iPaper);
		this.paper(iStream, iTmp);
	},

	call: function (iAddr) { // varargs (adr + parameters)
		iAddr = this.vmInRangeRound(iAddr, -32768, 65535, "CALL");
		if (iAddr < 0) { // 2nd complement of 16 bit address?
			iAddr += 65536;
		}
		switch (iAddr) {
		case 0xbb00: // KM Initialize (ROM &19E0)
			this.oKeyboard.resetCpcKeysExpansions();
			this.call(0xbb03); // KM Reset
			break;
		case 0xbb03: // KM Reset (ROM &1AE1)
			this.clearInput();
			this.oKeyboard.resetExpansionTokens();
			// TODO: reset also speed key
			break;
		case 0xbb18: // KM Wait Key (ROM &1B56)
			if (this.inkey$() === "") { // no key?
				this.vmStop("waitKey", 30); // wait for key
			}
			break;
		case 0xbb7b: // TXT Cursor Enable (ROM &1289); user switch (cursor enabled)
			Utils.console.log("TODO: CALL", iAddr);
			this.cursor(0, null, 1);
			break;
		case 0xbb7e: // TXT Cursor Disable (ROM &129A); user switch
			this.cursor(0, null, 0);
			break;
		case 0xbb81: // TXT Cursor On (ROM &1279); system switch (cursor on)
			this.cursor(0, 1);
			break;
		case 0xbb84: // TXT Cursor Off (ROM &1281); system switch
			this.cursor(0, 0);
			break;
		case 0xbb4e: // TXT Initialize (ROM &1078)
			this.vmResetWindowData(true); // reset windows, including pen and paper
			this.oCanvas.resetCustomChars();
			break;
		case 0xbb9c: // TXT Inverse (ROM &12C9), same as print chr$(24);
			this.vmTxtInverse(0);
			break;
		case 0xbbde: // GRA Set Pen (ROM &17F6)
			// we can only set graphics pen depending on number of args (pen 0=no arg, pen 1=one arg)
			this.graphicsPen(arguments.length - 1);
			break;
		case 0xbbff: // SCR Initialize (ROM &0AA0)
			this.iMode = 1;
			this.vmResetInks();
			this.oCanvas.setMode(this.iMode); // does not clear canvas
			this.oCanvas.clearFullWindow(); // (SCR Mode Clear)
			break;
		case 0xbc06: // SCR SET BASIC (&BC08, ROM &0B45); We use &BC06 to load reg A from reg E
			this.vmSetScreenBase(arguments[1]);
			break;
		case 0xbca7: // SOUND Reset (ROM &1E68)
			this.oSound.reset();
			break;
		case 0xbcb6: // SOUND Hold (ROM &1ECB)
			Utils.console.log("TODO: CALL", iAddr);
			break;
		case 0xbcb9: // SOUND Continue (ROM &1EE6)
			Utils.console.log("TODO: CALL", iAddr);
			break;
		case 0xbd19: // MC Wait Flyback (ROM &07BA)
			this.frame();
			break;
		default:
			Utils.console.log("Ignored: CALL", iAddr);
			break;
		}
	},

	cat: function () {
		var iStream = 0;

		this.vmStop("fileCat", 45, false, {
			iStream: iStream,
			sCommand: "cat"
		});
	},

	chain: function (sName, iLine) { // optional iLine
		var oInFile = this.oInFile;

		sName = this.vmAdaptFilename(sName, "CHAIN");
		this.closein();
		oInFile.bOpen = true;
		oInFile.sCommand = "chain";
		oInFile.sName = sName;
		oInFile.iLine = iLine;
		oInFile.fnFileCallback = this.fnCloseinHandler;
		this.vmStop("fileLoad", 90);
	},

	chainMerge: function (sName, iLine, iFirst, iLast) { // optional iLine, iStart, iEnd
		var oInFile = this.oInFile;

		sName = this.vmAdaptFilename(sName, "CHAIN MERGE");
		this.closein();
		oInFile.bOpen = true;
		oInFile.sCommand = "chainMerge";
		oInFile.sName = sName;
		oInFile.iLine = iLine;
		oInFile.iFirst = iFirst;
		oInFile.iLast = iLast;
		oInFile.fnFileCallback = this.fnCloseinHandler;
		this.vmStop("fileLoad", 90);
	},

	chr$: function (n) {
		n = this.vmInRangeRound(n, 0, 255, "CHR$");
		return String.fromCharCode(n);
	},

	cint: function (n) {
		return this.vmInRangeRound(n, -32768, 32767);
	},

	clear: function () {
		this.vmResetTimers();
		this.vmSetStartLine(0);
		this.iErr = 0;
		this.iBreakGosubLine = 0;
		this.iBreakResumeLine = 0;
		this.iErrorGotoLine = 0;
		this.iErrorResumeLine = 0;
		this.aGosubStack.length = 0;
		this.vmResetVariables();
		this.defreal("a-z");
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

	clg: function (iGPaper) {
		if (iGPaper !== undefined) {
			iGPaper = this.vmInRangeRound(iGPaper, 0, 15, "CLG");
			this.oCanvas.setGPaper(iGPaper);
		}
		this.oCanvas.clearGraphicsWindow();
	},

	vmCloseinCallback: function () {
		var oInFile = this.oInFile;

		this.vmResetFileHandling(oInFile);
	},

	closein: function () {
		var oInFile = this.oInFile;

		if (oInFile.bOpen) {
			this.vmCloseinCallback(); // not really used as a callback here
		}
	},

	vmCloseoutCallback: function () {
		var oOutFile = this.oOutFile;

		this.vmResetFileHandling(oOutFile);
	},

	closeout: function () {
		var oOutFile = this.oOutFile;

		if (oOutFile.bOpen) {
			if (oOutFile.sCommand !== "openout") {
				Utils.console.warn("closeout: command=", oOutFile.sCommand); // should not occure
			}
			if (!oOutFile.aFileData.length) { // openout without data?
				this.vmCloseoutCallback(); // close directly
			} else { // data to save
				oOutFile.sCommand = "closeout";
				oOutFile.fnFileCallback = this.fnCloseoutHandler;
				this.vmStop("fileSave", 90); // must stop directly after closeout
			}
		}
	},

	cls: function (iStream) { // optional iStream
		var oWin;

		iStream = this.vmInRangeRound(iStream || 0, 0, 7, "CLS");
		oWin = this.aWindow[iStream];

		this.oCanvas.clearTextWindow(oWin.iLeft, oWin.iRight, oWin.iTop, oWin.iBottom, oWin.iPaper); // cls window
		oWin.iPos = 0;
		oWin.iVpos = 0;

		if (!iStream) {
			this.sOut = ""; // clear also console, if stream===0
		}
	},

	commaTab: function (iStream) { // special function used for comma in print (ROM &F25C), called delayed by print
		var	iZone = this.iZone,
			oWin, iCount;

		iStream = this.vmInRangeRound(iStream || 0, 0, 9, "commaTab");
		oWin = this.aWindow[iStream];
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
		if (!this.iStartLine) {
			throw this.vmComposeError(Error(), 17, "CONT"); // cannot continue
		}
		this.vmGotoLine(this.iStartLine, "CONT");
		this.iStartLine = 0;
	},

	copychr$: function (iStream) {
		var oWin, iChar, sChar;

		iStream = this.vmInRangeRound(iStream, 0, 7, "COPYCHR$");
		this.vmMoveCursor2AllowedPos(iStream);
		oWin = this.aWindow[iStream];
		this.vmDrawUndrawCursor(iStream); // undraw
		iChar = this.oCanvas.readChar(oWin.iPos + oWin.iLeft, oWin.iVpos + oWin.iTop, oWin.iPen, oWin.iPaper);
		this.vmDrawUndrawCursor(iStream); // draw
		sChar = (iChar >= 0) ? String.fromCharCode(iChar) : "";
		return sChar;
	},

	cos: function (n) {
		this.vmAssertNumber(n, "COS");
		return Math.cos((this.bDeg) ? Utils.toRadians(n) : n);
	},

	creal: function (n) {
		this.vmAssertNumber(n, "CREAL");
		return n;
	},

	vmDrawUndrawCursor: function (iStream) {
		var oWin = this.aWindow[iStream];

		if (oWin.bCursorOn && oWin.bCursorEnabled) {
			this.vmMoveCursor2AllowedPos(iStream);
			this.oCanvas.drawCursor(oWin.iPos + oWin.iLeft, oWin.iVpos + oWin.iTop, oWin.iPen, oWin.iPaper);
		}
	},

	cursor: function (iStream, iCursorOn, iCursorEnabled) { // one of iCursorOn, iCursorEnabled is optional
		var oWin;

		iStream = this.vmInRangeRound(iStream || 0, 0, 7, "CURSOR");
		oWin = this.aWindow[iStream];
		if (iCursorOn !== null) { // system
			iCursorOn = this.vmInRangeRound(iCursorOn, 0, 1, "CURSOR");
			this.vmDrawUndrawCursor(iStream); // undraw
			oWin.bCursorOn = Boolean(iCursorOn);
			if (oWin.bCursorOn && oWin.bCursorEnabled) {
				this.vmDrawUndrawCursor(iStream); // draw
			}
		}
		if (iCursorEnabled !== undefined) { // user
			iCursorEnabled = this.vmInRangeRound(iCursorEnabled, 0, 1, "CURSOR");
			this.vmDrawUndrawCursor(iStream); // undraw
			oWin.bCursorEnabled = Boolean(iCursorEnabled);
			if (oWin.bCursorEnabled && oWin.bCursorOn) {
				this.vmDrawUndrawCursor(iStream); // draw
			}
		}
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
		this.vmAssertNumber(n, "DEC$");
		this.vmAssertString(sFrmt, "DEC$");
		return this.vmUsingFormat1(sFrmt, n);
	},

	// def fn

	defint: function (sNameOrRange) {
		this.vmDefineVarTypes("I", sNameOrRange, "DEFINT");
	},

	defreal: function (sNameOrRange) {
		this.vmDefineVarTypes("R", sNameOrRange, "DEFREAL");
	},

	defstr: function (sNameOrRange) {
		this.vmDefineVarTypes("$", sNameOrRange, "DEFSTR");
	},

	deg: function () {
		this.bDeg = true;
	},

	"delete": function (iFirst, iLast) { // varargs
		if (iFirst !== undefined && iFirst !== null) {
			iFirst = this.vmInRangeRound(iFirst, 1, 65535, "DELETE");
		}

		if (iLast === null) { // range with missing last?
			iLast = 65535;
		} else if (iLast !== undefined) {
			iLast = this.vmInRangeRound(iLast, 1, 65535, "DELETE");
		}

		this.vmStop("deleteLines", 90, false, {
			iFirst: iFirst || 1,
			iLast: iLast || iFirst,
			sCommand: "DELETE"
		});
	},

	derr: function () {
		return 0; // "[Not implemented yet: derr]"
	},

	di: function () {
		this.bTimersDisabled = true;
	},

	dim: function (sStringType) { // varargs
		var aArgs = [],
			bIsString = (sStringType === "$"), // includes("$"),
			varDefault = (bIsString) ? "" : 0,
			i;

		for (i = 1; i < arguments.length; i += 1) {
			aArgs.push(arguments[i] + 1); // for basic we have sizes +1
		}
		this.initVal = varDefault; // TODO fast hack
		return this.fnCreateNDimArray.apply(this, aArgs);
	},

	draw: function (x, y, iGPen, iGColMode) {
		this.vmDrawMovePlot("draw", x, y, iGPen, iGColMode);
	},

	drawr: function (x, y, iGPen, iGColMode) {
		this.vmDrawMovePlot("drawr", x, y, iGPen, iGColMode);
	},

	edit: function (iLine) {
		this.vmStop("editLine", 90, false, {
			iLine: iLine
		});
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

		iToneEnv = this.vmInRangeRound(iToneEnv, -15, 15, "ENT");

		if (iToneEnv < 0) {
			iToneEnv = -iToneEnv;
			bRepeat = true;
		}

		if (iToneEnv) { // not 0
			for (i = 1; i < arguments.length; i += 3) { // starting with 1: 3 parameters per section
				if (arguments[i] !== null) {
					oArg = {
						steps: this.vmInRangeRound(arguments[i], 0, 239, "ENT"), // number of steps: 0..239
						diff: this.vmInRangeRound(arguments[i + 1], -128, 127, "ENT"), // size (period change) of steps: -128..+127
						time: this.vmInRangeRound(arguments[i + 2], 0, 255, "ENT") // time per step: 0..255 (0=256)
					};
					if (bRepeat) {
						oArg.repeat = true;
					}
				} else { // special handling
					oArg = {
						period: this.vmInRangeRound(arguments[i + 1], 0, 4095, "ENT"), // absolute period
						time: this.vmInRangeRound(arguments[i + 2], 0, 255, "ENT") // time: 0..255 (0=256)
					};
				}
				aArgs.push(oArg);
			}
			this.oSound.setToneEnv(iToneEnv, aArgs);
		} else { // 0
			Utils.console.warn("ENT: iToneEnv", iToneEnv);
			throw this.vmComposeError(Error(), 5, "ENT " + iToneEnv); // Improper argument
		}
	},

	env: function (iVolEnv) { // varargs
		var aArgs = [],
			i, oArg;

		iVolEnv = this.vmInRangeRound(iVolEnv, 1, 15, "ENV");

		for (i = 1; i < arguments.length; i += 3) { // starting with 1: 3 parameters per section
			if (arguments[i] !== null) {
				oArg = {
					steps: this.vmInRangeRound(arguments[i], 0, 127, "ENV"), // number of steps: 0..127
					/* eslint-disable no-bitwise */
					diff: this.vmInRangeRound(arguments[i + 1], -128, 127, "ENV") & 0x0f, // size (volume) of steps: moved to range 0..15
					/* eslint-enable no-bitwise */
					time: this.vmInRangeRound(arguments[i + 2], 0, 255, "ENV") // time per step: 0..255 (0=256)
				};
				if (!oArg.time) { // (0=256)
					oArg.time = 256;
				}
			} else { // special handling for register parameters
				oArg = {
					register: this.vmInRangeRound(arguments[i + 1], 0, 15, "ENV"), // register: 0..15
					period: this.vmInRangeRound(arguments[i + 2], 0, 255, "ENV")
				};
			}
			aArgs.push(oArg);
		}
		this.oSound.setVolEnv(iVolEnv, aArgs);
	},

	eof: function () {
		var oInFile = this.oInFile,
			iEof = -1;

		if (oInFile.bOpen && oInFile.aFileData.length) {
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
				throw this.vmComposeError(Error(), 5, "ERASE " + arguments[i]); // Improper argument
			}
		}
	},

	erl: function () {
		var iErl = parseInt(this.iErl, 10); // in cpcBasic we have an error label here, so return number only

		return iErl || 0;
	},

	err: function () {
		return this.iErr;
	},

	vmComposeError: function (oError, iErr, sErrInfo) {
		var sError, sErrorWithInfo, sLine,
			bHidden = false; // hide errors wich are catched

		this.iErr = iErr;
		this.iErl = this.iLine;

		sError = this.vmGetError(iErr);

		sLine = this.iErl;
		if (this.iTronLine) {
			sLine += " (trace: " + this.iTronLine + ")";
		}

		sErrorWithInfo = sError + " in " + sLine;
		if (sErrInfo) {
			sErrorWithInfo += ": " + sErrInfo;
		}

		if (this.iErrorGotoLine && !this.iErrorResumeLine) {
			this.iErrorResumeLine = this.iErl;
			this.vmGotoLine(this.iErrorGotoLine, "onError");
			this.vmStop("onError", 50);
			bHidden = true;
		} else {
			this.vmStop("error", 50);
		}
		Utils.console.log("BASIC error(" + iErr + "):", sErrorWithInfo + (bHidden ? " (hidden: " + bHidden + ")" : ""));
		//return new CpcVm.ErrorObject({}, sError, sErrInfo, undefined, sLine, bHidden);
		return Utils.composeError("CpcVm", oError, sError, sErrInfo, undefined, sLine, bHidden);
	},

	/*
	composeError: function (oError, value, pos) {
		oError.name = "CpcVm.ErrorObject";
		oError.value = value;
		oError.pos = pos;
		return oError;
	},
	*/

	error: function (iErr, sErrInfo) {
		iErr = this.vmInRangeRound(iErr, 0, 255, "ERROR"); // could trigger another error
		throw this.vmComposeError(Error(), iErr, sErrInfo);
	},

	everyGosub: function (iInterval, iTimer, iLine) {
		this.vmAfterEveryGosub("every", iInterval, iTimer, iLine);
	},

	exp: function (n) {
		this.vmAssertNumber(n, "EXP");
		return Math.exp(n);
	},

	fill: function (iGPen) {
		iGPen = this.vmInRangeRound(iGPen, 0, 15, "FILL");
		this.oCanvas.fill(iGPen);
	},

	fix: function (n) {
		this.vmAssertNumber(n, "FIX");
		return Math.trunc(n); // (ES6: Math.trunc)
	},

	// fn

	// for

	frame: function () {
		this.vmStop("waitFrame", 40);
	},

	fre: function (/* arg */) { // arg is number or string
		return this.iHimem; // example, e.g. 42245;
	},

	gosub: function (retLabel, n) {
		this.vmGotoLine(n, "gosub (ret=" + retLabel + ")");
		this.aGosubStack.push(retLabel);
	},

	"goto": function (n) {
		this.vmGotoLine(n, "goto");
	},

	graphicsPaper: function (iGPaper) {
		iGPaper = this.vmInRangeRound(iGPaper, 0, 15, "GRAPHICS PAPER");
		this.oCanvas.setGPaper(iGPaper);
	},

	graphicsPen: function (iGPen, iTransparentMode) {
		iGPen = this.vmInRangeRound(iGPen, 0, 15, "GRAPHICS PEN");
		this.oCanvas.setGPen(iGPen);

		if (iTransparentMode !== undefined) {
			iTransparentMode = this.vmInRangeRound(iTransparentMode, 0, 1, "GRAPHICS PEN");
			this.oCanvas.setGTransparentMode(Boolean(iTransparentMode));
		}
	},

	hex$: function (n, iPad) {
		n = this.vmInRangeRound(n, -32768, 65535, "HEX$");
		iPad = this.vmInRangeRound(iPad || 0, 0, 16, "HEX$");
		return n.toString(16).toUpperCase().padStart(iPad, "0");
	},

	himem: function () {
		return this.iHimem;
	},

	// if

	ink: function (iPen, iInk1, iInk2) { // optional iInk2
		iPen = this.vmInRangeRound(iPen, 0, 15, "INK");
		iInk1 = this.vmInRangeRound(iInk1, 0, 31, "INK");
		if (iInk2 === undefined) {
			iInk2 = iInk1;
		} else {
			iInk2 = this.vmInRangeRound(iInk2, 0, 31, "INK");
		}
		this.oCanvas.setInk(iPen, iInk1, iInk2);
	},

	inkey: function (iKey) {
		iKey = this.vmInRangeRound(iKey, 0, 79, "INKEY");
		return this.oKeyboard.getKeyState(iKey);
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

	inp: function (iPort) {
		var iByte = 255;

		iPort = this.vmInRangeRound(iPort, -32768, 65535, "INP");
		if (iPort < 0) { // 2nd complement of 16 bit address?
			iPort += 65536;
		}
		// this.vmNotImplemented("INP");
		return iByte;
	},

	vmSetInputValues: function (aInputValues) {
		this.aInputValues = aInputValues;
	},

	vmGetNextInput: function () {
		var aInputValues = this.aInputValues,
			sValue;

		sValue = aInputValues.shift();
		return sValue;
	},

	vmInputCallback: function () {
		var oInput = this.vmGetStopObject().oParas,
			iStream = oInput.iStream,
			sInput = oInput.sInput,
			aInputValues = sInput.split(","),
			aTypes = oInput.aTypes,
			bInputOk = true,
			i, sVarType, sType, value;

		Utils.console.log("vmInputCallback:", sInput);
		if (aInputValues.length === aTypes.length) {
			for (i = 0; i < aTypes.length; i += 1) {
				sVarType = aTypes[i];
				sType = (sVarType.length > 1) ? sVarType.charAt(1) : this.oVarTypes[sVarType.charAt(0)];
				value = aInputValues[i];
				if (sType !== "$") { // no string?
					value = this.vmVal(value); // convert to number (also binary, hex)
					if (isNaN(value)) {
						bInputOk = false;
					}
					aInputValues[i] = this.vmAssign(sVarType, value);
				}
			}
		} else {
			bInputOk = false;
		}

		this.cursor(iStream, 0);
		if (!bInputOk) {
			this.print(iStream, "?Redo from start\r\n");
			oInput.sInput = "";
			this.print(iStream, oInput.sMessage);
			this.cursor(iStream, 1);
		} else {
			this.vmSetInputValues(aInputValues);
		}
		return bInputOk;
	},

	vmInputFromFile: function (aTypes) {
		var aFileData = this.oInFile.aFileData,
			aInputValues = [],
			i, sVarType, sType, value, aValue;

		for (i = 0; i < aTypes.length; i += 1) {
			sVarType = aTypes[i];
			sType = (sVarType.length > 1) ? sVarType.charAt(1) : this.oVarTypes[sVarType.charAt(0)];

			if (sType === "$") { // string?
				value = aFileData.shift(); // get complete (remaining) line
				value = value.replace(/^\s+/, ""); // remove preceding whitespace
			} else { // number (in same line or in next line)
				value = "";
				while (aFileData.length && value === "") {
					aFileData[0] = aFileData[0].replace(/^\s+/, ""); // remove preceding whitespace
					if (aFileData[0].length) { // do we have something in line?
						aValue = aFileData[0].match(/^(\S+)(.*)/);
						value = aValue[1];
						aFileData[0] = aValue[2];
						if (!aFileData[0].length) { // eslint-disable-line max-depth
							aFileData.shift(); // remove empty line
						}
						value = this.vmVal(value); // convert to number (also binary, hex)
						if (isNaN(value)) { // eslint-disable-line max-depth
							throw this.vmComposeError(Error(), 13, "INPUT #9 " + value); // Type mismatch
						}
					} else { // empty line
						aFileData.shift(); // remove empty line
					}
				}
				if (value === "") {
					throw this.vmComposeError(Error(), 24, "INPUT #9"); // EOF met
				}
			}

			aInputValues[i] = this.vmAssign(sVarType, value);
		}
		this.vmSetInputValues(aInputValues);
	},

	input: function (iStream, sNoCRLF, sMsg) { // varargs
		iStream = this.vmInRangeRound(iStream || 0, 0, 9, "waitInput");
		if (iStream < 8) {
			this.print(iStream, sMsg);
			this.vmStop("waitInput", 45, false, {
				iStream: iStream,
				sMessage: sMsg,
				sNoCRLF: sNoCRLF,
				fnInputCallback: this.vmInputCallback.bind(this),
				aTypes: Array.prototype.slice.call(arguments, 3), // remaining arguments
				sInput: "",
				iLine: this.iLine // to repeat in case of break
			});
			this.cursor(iStream, 1);
		} else if (iStream === 8) {
			this.vmSetInputValues(["I am the printer!"]);
		} else if (iStream === 9) {
			if (!this.oInFile.bOpen) {
				throw this.vmComposeError(Error(), 31, "INPUT #" + iStream); // File not open
			} else if (this.eof()) {
				throw this.vmComposeError(Error(), 24, "INPUT #" + iStream); // EOF met
			}
			this.vmInputFromFile(Array.prototype.slice.call(arguments, 3)); // remaining arguments
		}
	},

	instr: function (p1, p2, p3) { // optional startpos as first parameter
		this.vmAssertString(p2, "INSTR");
		if (typeof p1 === "string") { // p1=string, p2=search string
			return p1.indexOf(p2) + 1;
		}
		p1 = this.vmInRangeRound(p1, 1, 255, "INSTR"); // p1=startpos
		this.vmAssertString(p2, "INSTR");
		return p2.indexOf(p3, p1) + 1; // p2=string, p3=search string
	},

	"int": function (n) {
		this.vmAssertNumber(n, "INT");
		return Math.floor(n);
	},

	joy: function (iJoy) {
		iJoy = this.vmInRangeRound(iJoy, 0, 1, "JOY");
		return this.oKeyboard.getJoyState(iJoy);
	},

	key: function (iToken, s) {
		iToken = this.vmRound(iToken, "KEY");
		if (iToken >= 128 && iToken <= 159) {
			iToken -= 128;
		}
		iToken = this.vmInRangeRound(iToken, 0, 31, "KEY"); // round again, but we want the check
		this.vmAssertString(s);
		this.oKeyboard.setExpansionToken(iToken, s);
	},

	keyDef: function (iCpcKey, iRepeat, iNormal, iShift, iCtrl) { // optional args iNormal,...
		var oOptions = {
			iCpcKey: this.vmInRangeRound(iCpcKey, 0, 79, "KEY DEF"),
			iRepeat: this.vmInRangeRound(iRepeat, 0, 1, "KEY DEF")
		};

		if (iNormal !== undefined && iNormal !== null) {
			oOptions.iNormal = this.vmInRangeRound(iNormal, 0, 255, "KEY DEF");
		}
		if (iShift !== undefined && iShift !== null) {
			oOptions.iShift = this.vmInRangeRound(iShift, 0, 255, "KEY DEF");
		}
		if (iCtrl !== undefined && iCtrl !== null) {
			oOptions.iCtrl = this.vmInRangeRound(iCtrl, 0, 255, "KEY DEF");
		}

		this.oKeyboard.setCpcKeyExpansion(oOptions);
	},

	left$: function (s, iLen) {
		this.vmAssertString(s);
		iLen = this.vmInRangeRound(iLen, 0, 255, "LEFT$");
		return s.substr(0, iLen);
	},

	len: function (s) {
		this.vmAssertString(s, "LEN");
		return s.length;
	},

	// let

	vmLineInputCallback: function () {
		var oInput = this.vmGetStopObject().oParas,
			sInput = oInput.sInput;

		Utils.console.log("vmLineInputCallback:", sInput);
		this.vmSetInputValues([sInput]);
		this.cursor(oInput.iStream, 0);
		return true;
	},

	lineInput: function (iStream, sNoCRLF, sMsg, sVarType) { // sVarType must be string variable
		var sType = (sVarType.length > 1) ? sVarType.charAt(1) : this.oVarTypes[sVarType.charAt(0)];

		iStream = this.vmInRangeRound(iStream || 0, 0, 9, "LINE INPUT");
		if (iStream < 8) {
			this.print(iStream, sMsg);
			if (sType !== "$") { // not string?
				this.print(iStream, "\r\n");
				throw this.vmComposeError(Error(), 13, "LINE INPUT " + sType); // Type mismatch
			}

			this.cursor(iStream, 1);
			this.vmStop("waitInput", 45, false, {
				iStream: iStream,
				sMessage: sMsg,
				sNoCRLF: sNoCRLF,
				fnInputCallback: this.vmLineInputCallback.bind(this),
				sInput: "",
				iLine: this.iLine // to repeat in case of break
			});
		} else if (iStream === 8) {
			this.vmSetInputValues(["I am the printer!"]);
		} else if (iStream === 9) {
			if (!this.oInFile.bOpen) {
				throw this.vmComposeError(Error(), 31, "LINE INPUT #" + iStream); // File not open
			} else if (this.eof()) {
				throw this.vmComposeError(Error(), 24, "LINE INPUT #" + iStream); // EOF met
			}
			this.vmSetInputValues(this.oInFile.aFileData.splice(0, arguments.length - 3)); // always 1 element
		}
	},

	list: function (iStream, iFirst, iLast) { // varargs
		iStream = this.vmInRangeRound(iStream || 0, 0, 9, "LIST");

		if (iFirst !== undefined && iFirst !== null) {
			iFirst = this.vmInRangeRound(iFirst, 1, 65535, "LIST");
		}

		if (iLast === null) { // range with missing last?
			iLast = 65535;
		} else if (iLast !== undefined) {
			iLast = this.vmInRangeRound(iLast, 1, 65535, "LIST");
		}

		this.vmStop("list", 90, false, {
			iStream: iStream,
			iFirst: iFirst || 1,
			iLast: iLast || iFirst
		});
	},

	vmLoadCallback: function (sInput, sMeta) {
		var oInFile = this.oInFile,
			aMeta, iAddress, iLength, i, iByte;

		if (sInput !== null) {
			if (sMeta && Utils.stringStartsWith(sMeta, "B")) { // only for binary files
				aMeta = sMeta.split(",");

				iAddress = oInFile.iAddress !== undefined ? oInFile.iAddress : Number(aMeta[1]);
				iLength = Number(aMeta[2]); // we do not really need the length from metadata

				sInput = Utils.atob(sInput);
				if (isNaN(iLength)) {
					iLength = sInput.length; // only valid after atob()
				}
				for (i = 0; i < iLength; i += 1) {
					iByte = sInput.charCodeAt(i);
					this.poke((iAddress + i) & 0xffff, iByte); // eslint-disable-line no-bitwise
				}
			}
		}
		this.closein();
	},

	load: function (sName, iAddress) { // optional iAddress
		var oInFile = this.oInFile;

		sName = this.vmAdaptFilename(sName, "LOAD");
		if (iAddress !== undefined) {
			iAddress = this.vmInRangeRound(iAddress, -32768, 65535, "LOAD");
			if (iAddress < 0) { // 2nd complement of 16 bit address
				iAddress += 65536;
			}
		}
		this.closein();
		oInFile.bOpen = true;
		oInFile.sCommand = "load";
		oInFile.sName = sName;
		oInFile.iAddress = iAddress;
		oInFile.fnFileCallback = this.fnLoadHandler;
		this.vmStop("fileLoad", 90);
	},

	vmLocate: function (iStream, iPos, iVpos) {
		var oWin = this.aWindow[iStream];

		oWin.iPos = iPos - 1;
		oWin.iVpos = iVpos - 1;
	},

	locate: function (iStream, iPos, iVpos) {
		iStream = this.vmInRangeRound(iStream || 0, 0, 7, "LOCATE");
		iPos = this.vmInRangeRound(iPos, 1, 255, "LOCATE");
		iVpos = this.vmInRangeRound(iVpos, 1, 255, "LOCATE");

		this.vmDrawUndrawCursor(iStream); // undraw
		this.vmLocate(iStream, iPos, iVpos);
		this.vmDrawUndrawCursor(iStream); // draw
	},

	log: function (n) {
		this.vmAssertNumber(n, "LOG");
		return Math.log(n);
	},

	log10: function (n) {
		this.vmAssertNumber(n, "LOG10");
		return Math.log10(n);
	},

	lower$: function (s) {
		this.vmAssertString(s, "LOWER$");
		if (s >= "A" && s <= "Z") {
			s = s.toLowerCase();
		}
		return s;
	},

	mask: function (iMask, iFirst) { // one of iMask, iFirst is optional
		if (iMask !== null) {
			iMask = this.vmInRangeRound(iMask, 0, 255, "MASK");
		}

		if (iFirst !== undefined) {
			iFirst = this.vmInRangeRound(iFirst, 0, 1, "MASK");
		}
		this.vmNotImplemented("MASK: " + iMask + " " + iFirst);
	},

	max: function () { // varargs
		var i;

		for (i = 0; i < arguments.length; i += 1) {
			this.vmAssertNumber(arguments[i], "MAX");
		}
		return Math.max.apply(null, arguments);
	},

	memory: function (n) {
		n = this.vmInRangeRound(n, -32768, 65535, "MEMORY");

		if (n < this.iMinHimem || n > this.iMinCharHimem) {
			throw this.vmComposeError(Error(), 7, "MEMORY " + n); // Memory full
		}
		this.iHimem = n;
	},

	merge: function (sName) {
		var oInFile = this.oInFile;

		sName = this.vmAdaptFilename(sName, "MERGE");
		this.closein();
		oInFile.bOpen = true;
		oInFile.sCommand = "merge";
		oInFile.sName = sName;
		oInFile.fnFileCallback = this.fnCloseinHandler;
		this.vmStop("fileLoad", 90);
	},

	mid$: function (s, iStart, iLen) { // as function; iLen is optional
		this.vmAssertString(s, "MID$");
		iStart = this.vmInRangeRound(iStart, 1, 255, "MID$");
		if (iLen !== undefined) {
			iLen = this.vmInRangeRound(iLen, 0, 255, "MID$");
		}
		return s.substr(iStart - 1, iLen);
	},

	mid$Assign: function (s, iStart, iLen, sNew) {
		this.vmAssertString(s, "MID$");
		this.vmAssertString(sNew, "MID$");
		iStart = this.vmInRangeRound(iStart, 1, 255, "MID$") - 1;
		iLen = (iLen !== null) ? this.vmInRangeRound(iLen, 0, 255, "MID$") : sNew.length;
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
		var i;

		for (i = 0; i < arguments.length; i += 1) {
			this.vmAssertNumber(arguments[i], "MIN");
		}
		return Math.min.apply(null, arguments);
	},

	// mod

	mode: function (iMode) {
		iMode = this.vmInRangeRound(iMode, 0, 3, "MODE");
		this.iMode = iMode;
		this.vmResetWindowData(false); // do not reset pen and paper
		this.sOut = ""; // clear console
		this.oCanvas.setMode(iMode); // does not clear canvas

		this.oCanvas.clearFullWindow(); // always with paper 0 (SCR MODE CLEAR)
	},

	move: function (x, y, iGPen, iGColMode) {
		this.vmDrawMovePlot("move", x, y, iGPen, iGColMode);
	},

	mover: function (x, y, iGPen, iGColMode) {
		this.vmDrawMovePlot("mover", x, y, iGPen, iGColMode);
	},

	"new": function () {
		this.clear();
		this.vmStop("new", 90, false, {
			sCommand: "NEW"
		});
	},

	// next

	// not

	onBreakCont: function () {
		this.iBreakGosubLine = -1;
		this.iBreakResumeLine = 0;
	},

	onBreakGosub: function (iLine) {
		this.iBreakGosubLine = iLine;
		this.iBreakResumeLine = 0;
	},

	onBreakStop: function () {
		this.iBreakGosubLine = 0;
		this.iBreakResumeLine = 0;
	},

	onErrorGoto: function (iLine) {
		this.iErrorGotoLine = iLine;
		if (!iLine && this.iErrorResumeLine) { // line=0 but an error to resume?
			//throw this.vmComposeError(this.iErr, "ON ERROR GOTO without RESUME from " + this.iErl);
			throw this.vmComposeError(Error(), this.iErr, "ON ERROR GOTO without RESUME from " + this.iErl);
		}
	},

	onGosub: function (retLabel, n) { // varargs
		var iLine;

		n = this.vmInRangeRound(n, 0, 255, "ON GOSUB");
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

		n = this.vmInRangeRound(n, 0, 255, "ON GOTO");
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

		iChannel = this.vmInRangeRound(iChannel, 1, 4, "ON SQ GOSUB");
		if (iChannel === 3) {
			throw this.vmComposeError(Error(), 5, "ON SQ GOSUB " + iChannel); // Improper argument
		}
		iChannel = this.fnChannel2ChannelIndex(iChannel);
		oSqTimer = this.aSqTimer[iChannel];
		oSqTimer.iLine = iLine;
		oSqTimer.bActive = true;
		oSqTimer.bRepeat = true; // means reloaded for sq
	},

	vmOpeninCallback: function (sInput) {
		var oInFile = this.oInFile;

		if (sInput !== null) {
			if (Utils.stringEndsWith(sInput, "\n")) {
				sInput = sInput.substr(0, sInput.length - 1); // remove last "\n"
			}
			oInFile.aFileData = sInput.split("\n");
		} else {
			this.closein();
		}
	},

	openin: function (sName) {
		var oInFile = this.oInFile;

		sName = this.vmAdaptFilename(sName, "OPENIN");
		if (!oInFile.bOpen) {
			if (sName) {
				oInFile.bOpen = true;
				oInFile.sCommand = "openin";
				oInFile.sName = sName;
				oInFile.fnFileCallback = this.fnOpeninHandler;
				this.vmStop("fileLoad", 90);
			}
		} else {
			throw this.vmComposeError(Error(), 27, "OPENIN " + oInFile.sName); // file already open
		}
	},

	openout: function (sName) {
		var oOutFile = this.oOutFile;

		if (oOutFile.bOpen) {
			throw this.vmComposeError(Error(), 27, "OPENOUT " + oOutFile.sName); // file already open
		}
		sName = this.vmAdaptFilename(sName, "OPENOUT");

		oOutFile.bOpen = true;
		oOutFile.sCommand = "openout";
		oOutFile.sName = sName;
		oOutFile.aFileData = []; // no data yet
		oOutFile.sType = "A"; // ASCII
	},

	// or

	origin: function (xOff, yOff, xLeft, xRight, yTop, yBottom) { // parameters starting from xLeft are optional
		xOff = this.vmInRangeRound(xOff, -32768, 32767, "ORIGIN");
		yOff = this.vmInRangeRound(yOff, -32768, 32767, "ORIGIN");
		this.oCanvas.setOrigin(xOff, yOff);

		if (xLeft !== undefined) {
			xLeft = this.vmInRangeRound(xLeft, -32768, 32767, "ORIGIN");
			xRight = this.vmInRangeRound(xRight, -32768, 32767, "ORIGIN");
			yTop = this.vmInRangeRound(yTop, -32768, 32767, "ORIGIN");
			yBottom = this.vmInRangeRound(yBottom, -32768, 32767, "ORIGIN");
			this.oCanvas.setGWindow(xLeft, xRight, yTop, yBottom);
		}
	},

	out: function (iPort, iByte) {
		iPort = this.vmInRangeRound(iPort, -32768, 65535, "OUT");
		if (iPort < 0) { // 2nd complement of 16 bit address?
			iPort += 65536;
		}
		iByte = this.vmInRangeRound(iByte, 0, 255, "OUT");
		// 7Fxx = RAM select
		if (iPort >> 8 === 0x7f) { // eslint-disable-line no-bitwise
			if (iByte === 0xc0) {
				this.iRamSelect = 0;
			} else if (iByte >= 0xc4) {
				this.iRamSelect = iByte - 0xc4 + 1;
			}
		} else if (Utils.debug > 0) {
			Utils.console.debug("OUT", Number(iPort).toString(16, 4), iByte, ": unknown port");
		}
	},

	paper: function (iStream, iPaper) {
		var oWin;

		iStream = this.vmInRangeRound(iStream || 0, 0, 7, "PAPER");
		iPaper = this.vmInRangeRound(iPaper, 0, 15, "PAPER");
		oWin = this.aWindow[iStream];
		oWin.iPaper = iPaper;
	},

	vmGetCharDataByte: function (iAddr) {
		var iDataPos = (iAddr - 1 - this.iMinCharHimem) % 8,
			iChar = this.iMinCustomChar + (iAddr - 1 - iDataPos - this.iMinCharHimem) / 8,
			aCharData = this.oCanvas.getCharData(iChar);

		return aCharData[iDataPos];
	},

	vmSetCharDataByte: function (iAddr, iByte) {
		var iDataPos = (iAddr - 1 - this.iMinCharHimem) % 8,
			iChar = this.iMinCustomChar + (iAddr - 1 - iDataPos - this.iMinCharHimem) / 8,
			aCharData = Object.assign({}, this.oCanvas.getCharData(iChar)); // we need a copy to not modify original data

		aCharData[iDataPos] = iByte; // change one byte
		this.oCanvas.setCustomChar(iChar, aCharData);
	},

	peek: function (iAddr) {
		var iByte, iPage;

		iAddr = this.vmInRangeRound(iAddr, -32768, 65535, "PEEK");
		if (iAddr < 0) { // 2nd complement of 16 bit address
			iAddr += 65536;
		}
		// check two higher bits of 16 bit address to get 16K page
		iPage = iAddr >> 14; // eslint-disable-line no-bitwise
		if (iPage === this.iScreenPage) { // screen memory page?
			iByte = this.oCanvas.getByte(iAddr); // get byte from screen memory
			if (iByte === null) { // byte not visible on screen?
				iByte = this.aMem[iAddr] || 0; // get it from our memory
			}
		} else if (iPage === 1 && this.iRamSelect) { // memory mapped RAM with page 1=0x4000..0x7fff?
			iAddr = (this.iRamSelect - 1) * 0x4000 + 0x10000 + iAddr;
			iByte = this.aMem[iAddr] || 0;
		} else if (iAddr > this.iMinCharHimem && iAddr <= this.iMaxCharHimem) { // character map?
			iByte = this.vmGetCharDataByte(iAddr);
		} else {
			iByte = this.aMem[iAddr] || 0;
		}
		return iByte;
	},

	pen: function (iStream, iPen, iTransparent) {
		var sPen = "PEN",
			oWin;

		if (iPen !== null) {
			iStream = this.vmInRangeRound(iStream || 0, 0, 7, sPen);
			oWin = this.aWindow[iStream];
			iPen = this.vmInRangeRound(iPen, 0, 15, sPen);
			oWin.iPen = iPen;
		}

		if (iTransparent !== null && iTransparent !== undefined) {
			iTransparent = this.vmInRangeRound(iTransparent, 0, 1, sPen);
			this.vmSetTransparentMode(iStream, iTransparent);
		}
	},

	pi: function () {
		return Math.PI; // or less precise: 3.14159265
	},

	plot: function (x, y, iGPen, iGColMode) { // 2, up to 4 parameters
		this.vmDrawMovePlot("plot", x, y, iGPen, iGColMode);
	},

	plotr: function (x, y, iGPen, iGColMode) {
		this.vmDrawMovePlot("plotr", x, y, iGPen, iGColMode);
	},

	poke: function (iAddr, iByte) {
		var iPage;

		iAddr = this.vmInRangeRound(iAddr, -32768, 65535, "POKE address");
		if (iAddr < 0) { // 2nd complement of 16 bit address?
			iAddr += 65536;
		}
		iByte = this.vmInRangeRound(iByte, 0, 255, "POKE byte");

		// check two higher bits of 16 bit address to get 16K page
		iPage = iAddr >> 14; // eslint-disable-line no-bitwise

		if (iPage === 1 && this.iRamSelect) { // memory mapped RAM with page 1=0x4000..0x7fff?
			iAddr = (this.iRamSelect - 1) * 0x4000 + 0x10000 + iAddr;
		} else if (iPage === this.iScreenPage) { // screen memory page?
			this.oCanvas.setByte(iAddr, iByte); // write byte also to screen memory
		} else if (iAddr > this.iMinCharHimem && iAddr <= this.iMaxCharHimem) { // character map?
			this.vmSetCharDataByte(iAddr, iByte);
		}
		this.aMem[iAddr] = iByte;
	},

	pos: function (iStream) {
		var iPos;

		iStream = this.vmInRangeRound(iStream, 0, 9, "POS");
		if (iStream < 8) {
			this.vmMoveCursor2AllowedPos(iStream);
			iPos = this.aWindow[iStream].iPos + 1;
		} else if (iStream === 8) { // printer position
			iPos = 1; // TODO
		} else { // stream 9: number of characters written since last CR (\r)
			iPos = 1; // TODO
		}
		return iPos;
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
			if (iStream < 8) {
				this.oCanvas.windowScrollDown(iLeft, iRight, iTop, iBottom, oWin.iPaper);
			}
		}

		if (y > (iBottom - iTop)) {
			y = iBottom - iTop;
			if (iStream < 8) {
				this.oCanvas.windowScrollUp(iLeft, iRight, iTop, iBottom, oWin.iPaper);
			}
		}
		oWin.iPos = x;
		oWin.iVpos = y;
	},

	vmPrintChars: function (sStr, iStream) {
		var oWin = this.aWindow[iStream],
			i, iChar;

		if (!oWin.bTextEnabled) {
			if (Utils.debug > 0) {
				Utils.console.debug("DEBUG: vmPrintChars: text output disabled:", sStr);
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
			this.oCanvas.printChar(iChar, oWin.iPos + oWin.iLeft, oWin.iVpos + oWin.iTop, oWin.iPen, oWin.iPaper, oWin.bTransparent);
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
			sOut = "";

		switch (iCode) {
		case 0x00: // NUL, ignore
			break;
		case 0x01: // SOH 0-255
			this.vmPrintChars(sPara, iStream);
			break;
		case 0x02: // STX
			oWin.bCursorEnabled = false; // cursor disable (user)
			break;
		case 0x03: // ETX
			oWin.bCursorEnabled = true; // cursor enable (user)
			break;
		case 0x04: // EOT 0-3 (on CPC: 0-2, 3 is ignored; really mod 4)
			this.mode(sPara.charCodeAt(0) & 0x03); // eslint-disable-line no-bitwise
			break;
		case 0x05: // ENQ
			this.vmPrintGraphChars(sPara);
			break;
		case 0x06: // ACK
			oWin.bCursorEnabled = true;
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
			this.paper(iStream, sPara.charCodeAt(0) & 0x0f); // eslint-disable-line no-bitwise
			break;
		case 0x0f: // SI
			this.pen(iStream, sPara.charCodeAt(0) & 0x0f); // eslint-disable-line no-bitwise
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
			oWin.bCursorEnabled = false;
			oWin.bTextEnabled = false;
			break;
		case 0x16: // SYN
			// parameter: only bit 0 relevant (ROM: &14E3)
			this.vmSetTransparentMode(iStream, sPara.charCodeAt(0) & 0x01); // eslint-disable-line no-bitwise
			break;
		case 0x17: // ETB
			this.oCanvas.setGColMode(sPara.charCodeAt(0) % 4);
			break;
		case 0x18: // CAN
			this.vmTxtInverse(iStream);
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
			this.ink(sPara.charCodeAt(0) & 0x0f, sPara.charCodeAt(1) & 0x1f, sPara.charCodeAt(2) & 0x1f); // eslint-disable-line no-bitwise
			break;
		case 0x1d: // GS
			this.border(sPara.charCodeAt(0) & 0x1f, sPara.charCodeAt(1) & 0x1f); // eslint-disable-line no-bitwise
			break;
		case 0x1e: // RS
			oWin.iPos = 0;
			oWin.iVpos = 0;
			break;
		case 0x1f: // US
			this.vmLocate(iStream, sPara.charCodeAt(0), sPara.charCodeAt(1));
			break;
		default:
			Utils.console.warn("vmHandleControlCode: Unknown control code:", iCode);
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
		var sBuf = "",
			oWin, aSpecialArgs, sStr, i, arg;

		iStream = this.vmInRangeRound(iStream || 0, 0, 9, "PRINT");
		oWin = this.aWindow[iStream];

		if (iStream < 8) {
			if (!oWin.bTag) {
				this.vmDrawUndrawCursor(iStream); // undraw
			}
		} else if (iStream === 8) {
			this.vmNotImplemented("PRINT # " + iStream);
		} else if (iStream === 9) {
			if (!this.oOutFile.bOpen) {
				throw this.vmComposeError(Error(), 31, "PRINT #" + iStream); // File not open
			}
			this.oOutFile.iStream = iStream;
		}

		for (i = 1; i < arguments.length; i += 1) {
			arg = arguments[i];
			if (typeof arg === "object") { // delayed call for spc(), tab(), commaTab() with side effect (position)
				aSpecialArgs = arg.args; // just a reference
				aSpecialArgs.unshift(iStream);
				sStr = this[arg.type].apply(this, aSpecialArgs);
			} else if (typeof arg === "number") {
				sStr = ((arg >= 0) ? " " : "") + String(arg) + " ";
			} else {
				sStr = String(arg);
			}

			if (iStream < 8) {
				if (oWin.bTag) {
					this.vmPrintGraphChars(sStr);
				} else {
					sBuf = this.vmPrintCharsOrControls(sStr, iStream, sBuf);
				}
				this.sOut += sStr; // console
			} else { // iStream === 9
				oWin.iPos += sStr.length;
				if (sStr === "\r\n") { // for now we replace CRLF by LF
					sStr = "\n";
					oWin.iPos = 0;
				}
				if (oWin.iPos >= oWin.iRight) {
					sStr = "\n" + sStr; // e.g. after tab(256)
					oWin.iPos = 0;
				}
				sBuf += sStr;
			}
		}

		if (iStream < 8) {
			if (!oWin.bTag) {
				this.vmDrawUndrawCursor(iStream); // draw
			}
		} else if (iStream === 9) {
			this.oOutFile.aFileData.push(sBuf);
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

	vmRandomizeCallback: function () {
		var oInput = this.vmGetStopObject().oParas,
			sInput = oInput.sInput,
			bInputOk = true,
			value;

		Utils.console.log("vmRandomizeCallback:", sInput);
		value = this.vmVal(sInput); // convert to number (also binary, hex)
		if (isNaN(value)) {
			bInputOk = false;
			oInput.sInput = "";
			this.print(oInput.iStream, oInput.sMessage);
		} else {
			this.vmSetInputValues([value]);
		}
		return bInputOk;
	},

	randomize: function (n) {
		var iRndInit = 0x89656c07, // an arbitrary 32 bit number <> 0 (this one is used by the CPC)
			iStream = 0,
			sMsg;

		if (n === undefined) { // no arguments? input...
			sMsg = "Random number seed ? ";
			this.print(iStream, sMsg);
			this.vmStop("waitInput", 45, false, {
				iStream: iStream,
				sMessage: sMsg,
				fnInputCallback: this.vmRandomizeCallback.bind(this),
				sInput: "",
				iLine: this.iLine // to repeat in case of break
			});
		} else { // n can also be floating point, so compute a hash value of n
			this.vmAssertNumber(n, "RANDOMIZE");
			n = this.vmHashCode(String(n));
			if (n === 0) {
				n = iRndInit;
			}
			if (Utils.debug > 0) {
				Utils.console.debug("randomize:", n);
			}
			this.oRandom.init(n);
		}
	},

	read: function (sVarType) {
		var sType = (sVarType.length > 1) ? sVarType.charAt(1) : this.oVarTypes[sVarType.charAt(0)],
			item = 0;

		if (this.iData < this.aData.length) {
			item = this.aData[this.iData];
			this.iData += 1;
			if (sType !== "$") { // not string? => convert to number (also binary, hex)
				// Note : Using a number variable ro read a string would cause a syntax error on a real CPC. We cannot detect it since we get always strings.
				item = this.val(item);
			}
			item = this.vmAssign(sVarType, item); // maybe rounding for type I
		} else {
			throw this.vmComposeError(Error(), 4, "READ"); // DATA exhausted
		}
		return item;
	},

	release: function (iChannelMask) {
		iChannelMask = this.vmInRangeRound(iChannelMask, 0, 7, "RELEASE");
		this.oSound.release(iChannelMask);
	},

	// rem

	remain: function (iTimer) {
		var oTimer,
			iRemain = 0;

		iTimer = this.vmInRangeRound(iTimer, 0, 3, "REMAIN");
		oTimer = this.aTimer[iTimer];
		if (oTimer.bActive) {
			iRemain = oTimer.iNextTimeMs - Date.now();
			iRemain /= this.iFrameTimeMs;
			oTimer.bActive = false; // switch off timer
		}
		return iRemain;
	},

	renum: function (iNew, iOld, iStep, iKeep) { // varargs: new number, old number, step, keep line (only for |renum)
		if (iNew !== null && iNew !== undefined) {
			iNew = this.vmInRangeRound(iNew, 1, 65535, "RENUM");
		}
		if (iOld !== null && iOld !== undefined) {
			iOld = this.vmInRangeRound(iOld, 1, 65535, "RENUM");
		}
		if (iStep !== undefined) {
			iStep = this.vmInRangeRound(iStep, 1, 65535, "RENUM");
		}
		if (iKeep !== undefined) {
			iKeep = this.vmInRangeRound(iKeep, 1, 65535, "RENUM");
		}

		this.vmStop("renumLines", 85, false, {
			iNew: iNew || 10,
			iOld: iOld || 1,
			iStep: iStep || 10,
			iKeep: iKeep || 65535 // keep lines
		});
	},

	restore: function (iLine) {
		var oDataLineIndex = this.oDataLineIndex,
			iDataLine;

		iLine = iLine || 0;
		if (iLine in oDataLineIndex) {
			this.iData = oDataLineIndex[iLine];
		} else {
			Utils.console.log("restore: search for dataLine >", iLine);
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
				Utils.console.warn("restore", iLine + ": No DATA found starting at line");
				this.iData = this.aData.length;
			}
		}
	},

	resume: function (iLine) { // resume, resume n
		if (this.iErrorGotoLine) {
			if (iLine === undefined) {
				iLine = this.iErrorResumeLine;
			}
			this.vmGotoLine(iLine, "resume");
			this.iErrorResumeLine = 0;
		} else {
			throw this.vmComposeError(Error(), 20, iLine); // Unexpected RESUME
		}
	},

	resumeNext: function () {
		if (!this.iErrorGotoLine) {
			throw this.vmComposeError(Error(), 20, "RESUME NEXT"); // Unexpected RESUME
		}
		this.vmNotImplemented("RESUME NEXT");
	},

	"return": function () {
		var iLine = this.aGosubStack.pop();

		if (iLine === undefined) {
			throw this.vmComposeError(Error(), 3, ""); // Unexpected Return [in <line>]
		} else {
			this.vmGotoLine(iLine, "return");
		}
		if (iLine === this.iBreakResumeLine) { // end of break handler?
			this.iBreakResumeLine = 0; // can start another one
		}
		this.vmCheckTimerHandlers(); // if we are at end of a BASIC timer handler, delete handler flag
		if (this.vmCheckSqTimerHandlers()) { // same for sq timers, timer reloaded?
			this.fnCheckSqTimer(); // next one early
		}
	},

	right$: function (s, iLen) {
		this.vmAssertString(s);
		iLen = this.vmInRangeRound(iLen, 0, 255, "RIGHT$");
		return s.slice(-iLen);
	},

	rnd: function (n) {
		var x;

		if (n !== undefined) {
			this.vmAssertNumber(n, "RND");
		}

		if (n < 0) {
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
		this.vmAssertNumber(n, "ROUND");
		iDecimals = this.vmInRangeRound(iDecimals || 0, -39, 39, "ROUND");

		// To avoid rounding errors: https://www.jacklmoore.com/notes/rounding-in-javascript
		return Number(Math.round(n + "e" + iDecimals) + "e" + ((iDecimals >= 0) ? "-" + iDecimals : "+" + -iDecimals));
	},

	vmRunCallback: function (sInput) {
		var oInFile = this.oInFile;

		if (sInput !== null) {
			this.vmStop("run", 90, false, {
				iLine: oInFile.iLine
			});
		}
		this.closein();
	},

	run: function (numOrString) {
		var oInFile = this.oInFile,
			sName;

		if (typeof numOrString === "string") { // filename?
			sName = this.vmAdaptFilename(numOrString, "RUN");
			this.closein();
			oInFile.bOpen = true;
			oInFile.sCommand = "run";
			oInFile.sName = sName;
			oInFile.fnFileCallback = this.fnRunHandler;
			this.vmStop("fileLoad", 90);
		} else { // line number or no argument = undefined
			this.vmStop("run", 90, false, {
				iLine: numOrString || 0
			});
		}
	},

	save: function (sName, sType, iAddr, iLen, iEntry) { // varargs; parameter sType,... are optional
		var oOutFile = this.oOutFile,
			aFileData = [],
			i;

		sName = this.vmAdaptFilename(sName, "SAVE");
		if (sType !== undefined) {
			sType = String(sType).toUpperCase();
			if (sType === "A" && iAddr === undefined) { // ascii
				// ...
			} else if (sType === "B") { // binary
				iAddr = this.vmInRangeRound(iAddr, -32768, 65535, "SAVE");
				if (iAddr < 0) { // 2nd complement of 16 bit address
					iAddr += 65536;
				}
				iLen = this.vmInRangeRound(iLen, -32768, 65535, "SAVE");
				if (iLen < 0) {
					iLen += 65536;
				}
				sType += "," + iAddr + "," + iLen; // it gets sMeta
				if (iEntry !== undefined) {
					iEntry = this.vmInRangeRound(iEntry, -32768, 65535, "SAVE");
					if (iEntry < 0) {
						iEntry += 65536;
					}
					sType += "," + iEntry;
				}
				for (i = 0; i < iLen; i += 1) {
					aFileData[i] = String.fromCharCode(this.peek(iAddr + i));
				}
				aFileData = [Utils.btoa(aFileData.join(""))];
			} else if (sType === "P" && iAddr === undefined) { // protected BASIC
				// ...
			} else {
				throw this.vmComposeError(Error(), 2, "SAVE " + sType); // Syntax Error
			}
		} else {
			sType = "T"; // new (default) type: tokenized BASIC
		}

		oOutFile.bOpen = true;
		oOutFile.sCommand = "save";
		oOutFile.sName = sName;
		oOutFile.sType = sType;
		oOutFile.aFileData = aFileData;
		oOutFile.fnFileCallback = this.fnCloseoutHandler; // we use closeout handler to reset out file handling

		this.vmStop("fileSave", 90); // must stop directly after save
	},

	sgn: function (n) {
		this.vmAssertNumber(n, "SGN");
		return Math.sign(n);
	},

	sin: function (n) {
		this.vmAssertNumber(n, "SIN");
		return Math.sin((this.bDeg) ? Utils.toRadians(n) : n);
	},

	sound: function (iState, iPeriod, iDuration, iVolume, iVolEnv, iToneEnv, iNoise) {
		var oSoundData, i, oSqTimer;

		iState = this.vmInRangeRound(iState, 1, 255, "SOUND");
		iPeriod = this.vmInRangeRound(iPeriod, 0, 4095, "SOUND ,");

		if (iDuration !== undefined) {
			iDuration = this.vmInRangeRound(iDuration, -32768, 32767, "SOUND ,,");
		} else {
			iDuration = 20;
		}

		if (iVolume !== undefined && iVolume !== null) {
			iVolume = this.vmInRangeRound(iVolume, 0, 15, "SOUND ,,,");
		} else {
			iVolume = 12;
		}

		if (iVolEnv !== undefined && iVolEnv !== null) {
			iVolEnv = this.vmInRangeRound(iVolEnv, 0, 15, "SOUND ,,,,");
		}
		if (iToneEnv !== undefined && iToneEnv !== null) {
			iToneEnv = this.vmInRangeRound(iToneEnv, 0, 15, "SOUND ,,,,,");
		}
		if (iNoise !== undefined && iNoise !== null) {
			iNoise = this.vmInRangeRound(iNoise, 0, 31, "SOUND ,,,,,,");
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
			this.vmStop("waitSound", 43);
			for (i = 0; i < 3; i += 1) {
				if (iState & (1 << i)) { // eslint-disable-line no-bitwise
					oSqTimer = this.aSqTimer[i];
					oSqTimer.bActive = false; // set onSq timer to inactive
				}
			}
		}
	},

	space$: function (n) {
		n = this.vmInRangeRound(n, 0, 255, "SPACE$");
		return " ".repeat(n);
	},

	spc: function (iStream, n) { // special spc function with additional parameter iStream, which is called delayed by print (ROM &F277)
		var sStr = "",
			oWin, iWidth;

		iStream = this.vmInRangeRound(iStream || 0, 0, 9, "SPC");
		n = this.vmInRangeRound(n, -32768, 32767, "SPC");
		if (n >= 0) {
			oWin = this.aWindow[iStream];
			iWidth = oWin.iRight - oWin.iLeft + 1;
			if (iWidth) {
				n %= iWidth;
			}
			sStr = " ".repeat(n);
		} else {
			Utils.console.log("SPC: negative number ignored:", n);
		}
		return sStr;
	},

	speedInk: function (iTime1, iTime2) { // default: 10,10
		iTime1 = this.vmInRangeRound(iTime1, 1, 255, "SPEED INK");
		iTime2 = this.vmInRangeRound(iTime2, 1, 255, "SPEED INK");
		this.oCanvas.setSpeedInk(iTime1, iTime2);
	},

	speedKey: function (iDelay, iRepeat) {
		iDelay = this.vmInRangeRound(iDelay, 1, 255, "SPEED KEY");
		iRepeat = this.vmInRangeRound(iRepeat, 1, 255, "SPEED KEY");
		this.vmNotImplemented("SPEED KEY " + iDelay + " " + iRepeat);
	},

	speedWrite: function (n) {
		n = this.vmInRangeRound(n, 0, 1, "SPEED WRITE");
		this.vmNotImplemented("SPEED WRITE " + n);
	},

	sq: function (iChannel) {
		var oSqTimer, iSq;

		iChannel = this.vmInRangeRound(iChannel, 1, 4, "SQ");
		if (iChannel === 3) {
			throw this.vmComposeError(Error(), 5, "ON SQ GOSUB " + iChannel); // Improper argument
		}
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
		this.vmAssertNumber(n, "SQR");
		return Math.sqrt(n);
	},

	// step

	stop: function (sLabel) {
		this.vmGotoLine(sLabel, "stop");
		this.vmStop("stop", 60);
	},

	str$: function (n) { // number (also hex or binary)
		var sStr;

		this.vmAssertNumber(n, "STR$");
		sStr = ((n >= 0) ? " " : "") + String(n);
		return sStr;
	},

	string$: function (iLen, chr) {
		iLen = this.vmInRangeRound(iLen, 0, 255, "STRING$");
		if (typeof chr === "number") {
			chr = this.vmInRangeRound(chr, 0, 255, "STRING$");
			chr = String.fromCharCode(chr); // chr$
		} else { // string
			chr = chr.charAt(0); // only one char
		}
		return chr.repeat(iLen);
	},

	// swap (window swap)

	symbol: function (iChar) { // varargs  (iChar, rows 1..8)
		var aArgs = [],
			i, iBitMask;

		iChar = this.vmInRangeRound(iChar, this.iMinCustomChar, 255, "SYMBOL");
		for (i = 1; i < arguments.length; i += 1) { // start with 1, get available args
			iBitMask = this.vmInRangeRound(arguments[i], 0, 255, "SYMBOL");
			aArgs.push(iBitMask);
		}
		// Note: If there are less than 8 rows, the othere are assumed as 0 (actually empty)
		this.oCanvas.setCustomChar(iChar, aArgs);
	},

	symbolAfter: function (iChar) {
		var iMinCharHimem;

		iChar = this.vmInRangeRound(iChar, 0, 256, "SYMBOL AFTER");

		if (this.iMinCustomChar < 256) { // symbol after <256 set?
			if (this.iMinCharHimem !== this.iHimem) { // himem changed?
				throw this.vmComposeError(Error(), 5, "SYMBOL AFTER " + iChar); // Improper argument
			}
		} else {
			this.iMaxCharHimem = this.iHimem; // no characters defined => use current himem
		}

		iMinCharHimem = this.iMaxCharHimem - (256 - iChar) * 8;
		if (iMinCharHimem < this.iMinHimem) {
			throw this.vmComposeError(Error(), 7, "SYMBOL AFTER " + iMinCharHimem); // Memory full
		}
		this.iHimem = iMinCharHimem;

		this.oCanvas.resetCustomChars();
		if (iChar === 256) { // maybe move up again
			iMinCharHimem = this.iMaxHimem;
			this.MaxCharHimem = iMinCharHimem;
		}
		// TODO: Copy char data to screen memory, if screen starts at 0x4000 and chardata is in that range (and ram 0 is selected)
		this.iMinCustomChar = iChar;
		this.iMinCharHimem = iMinCharHimem;
	},

	tab: function (iStream, n) { // special tab function with additional parameter iStream, which is called delayed by print (ROM &F280)
		var	sStr = "",
			oWin, iWidth, iCount;

		iStream = this.vmInRangeRound(iStream || 0, 0, 9, "TAB");
		oWin = this.aWindow[iStream];
		iWidth = oWin.iRight - oWin.iLeft + 1;
		n = this.vmInRangeRound(n, -32768, 32767, "TAB");
		if (n > 0) {
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
			sStr = " ".repeat(iCount);
		} else {
			Utils.console.log("TAB: no tab for value", n);
		}
		return sStr;
	},

	tag: function (iStream) { // optional iStream
		var oWin;

		if (iStream) {
			iStream = this.vmInRangeRound(iStream, 0, 7, "TAG");
		} else {
			iStream = 0;
		}
		oWin = this.aWindow[iStream];
		oWin.bTag = true;
	},

	tagoff: function (iStream) { // optional iStream
		var oWin;

		if (iStream) {
			iStream = this.vmInRangeRound(iStream, 0, 7, "TAGOFF");
		} else {
			iStream = 0;
		}
		oWin = this.aWindow[iStream];
		oWin.bTag = false;
	},

	tan: function (n) {
		this.vmAssertNumber(n, "TAN");
		return Math.tan((this.bDeg) ? Utils.toRadians(n) : n);
	},

	test: function (x, y) {
		x = this.vmInRangeRound(x, -32768, 32767, "TEST");
		y = this.vmInRangeRound(y, -32768, 32767, "TEST");
		return this.oCanvas.test(x, y);
	},

	testr: function (x, y) {
		x = this.vmInRangeRound(x, -32768, 32767, "TESTR");
		y = this.vmInRangeRound(y, -32768, 32767, "TESTR");
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
		n = this.vmInRangeRound(n, -32768, 65535, "UNT");
		if (n > 32767) {
			n -= 65536;
		}
		return n;
	},

	upper$: function (s) {
		this.vmAssertString(s, "UPPER$");
		if (s >= "a" && s <= "z") {
			s = s.toUpperCase();
		}
		return s;
	},

	using: function (sFormat) { // varargs
		var reFormat = /(!|&|\\ *\\|(?:\*\*|\$\$|\*\*\$)?\+?#+,?\.?#*(?:\^\^\^\^)?[+-]?)/g,
			s = "",
			aFormat = [],
			iIndex,	oMatch,	sFrmt, iFormat, i, arg;

		this.vmAssertString(sFormat, "USING");

		// We simulate sFormat.split(reFormat) here since it does not work with IE8
		iIndex = 0;
		while ((oMatch = reFormat.exec(sFormat)) !== null) {
			/*
			if (oMatch.index > iIndex) { // non-format characters at the beginning?
				s += sFormat.substring(iIndex, oMatch.index);
			}
			*/
			aFormat.push(sFormat.substring(iIndex, oMatch.index)); // non-format characters at the beginning
			aFormat.push(oMatch[0]);
			iIndex = oMatch.index + oMatch[0].length;
		}
		if (iIndex < sFormat.length) { // non-format characters at the end
			aFormat.push(sFormat.substr(iIndex));
		}

		if (aFormat.length < 2) {
			Utils.console.warn("USING: empty or invalid format:", sFormat);
			throw this.vmComposeError(Error(), 5, "USING format " + sFormat); // Improper argument
		}

		iFormat = 0;
		for (i = 1; i < arguments.length; i += 1) { // start with 1
			iFormat %= aFormat.length;
			if (iFormat === 0) {
				sFrmt = aFormat[iFormat]; // non-format characters at the beginning of the format string
				iFormat += 1;
				s += sFrmt;
			}
			if (iFormat < aFormat.length) {
				arg = arguments[i];
				sFrmt = aFormat[iFormat]; // format characters
				iFormat += 1;
				s += this.vmUsingFormat1(sFrmt, arg);
			}
			if (iFormat < aFormat.length) {
				sFrmt = aFormat[iFormat]; // following non-format characters
				iFormat += 1;
				s += sFrmt;
			}
		}
		return s;
	},

	/*
	using_ok: function (sFormat) { // varargs
		var reFormat = /(!|&|\\ *\\|(?:\*\*|\$\$|\*\*\$)?\+?#+,?\.?#*(?:\^\^\^\^)?[+-]?)/,
			s = "",
			aFormat, sFrmt, iFormat, i, arg;

		this.vmAssertString(sFormat, "USING");
		aFormat = sFormat.split(reFormat);
		if (aFormat.length < 2) {
			Utils.console.warn("USING: empty or invalid format:", sFormat);
			throw this.vmComposeError(Error(), 5, "USING format " + sFormat); // Improper argument
		}

		iFormat = 0;
		for (i = 1; i < arguments.length; i += 1) { // start with 1
			iFormat %= aFormat.length;
			if (iFormat === 0) {
				sFrmt = aFormat[iFormat]; // non-format characters at the beginning of the format string
				iFormat += 1;
				s += sFrmt;
			}
			if (iFormat < aFormat.length) {
				arg = arguments[i];
				sFrmt = aFormat[iFormat]; // format characters
				iFormat += 1;
				s += this.vmUsingFormat1(sFrmt, arg);
			}
			if (iFormat < aFormat.length) {
				sFrmt = aFormat[iFormat]; // following non-format characters
				iFormat += 1;
				s += sFrmt;
			}
		}
		return s;
	},
	*/

	vmVal: function (s) {
		var iNum = 0;

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
		return iNum;
	},

	val: function (s) {
		var iNum;

		this.vmAssertString(s, "VAL");
		iNum = this.vmVal(s);

		if (isNaN(iNum)) {
			iNum = 0;
		}
		return iNum;
	},

	vpos: function (iStream) {
		iStream = this.vmInRangeRound(iStream, 0, 7, "VPOS");
		this.vmMoveCursor2AllowedPos(iStream);
		return this.aWindow[iStream].iVpos + 1;
	},

	wait: function (iPort, iMask, iInv) { // optional iInv
		iPort = this.vmInRangeRound(iPort, -32768, 65535, "WAIT");
		if (iPort < 0) { // 2nd complement of 16 bit address
			iPort += 65536;
		}
		iMask = this.vmInRangeRound(iMask, 0, 255, "WAIT");
		if (iInv !== undefined) {
			iInv = this.vmInRangeRound(iInv, 0, 255, "WAIT");
		}
		if (iPort === 0) {
			debugger; // Testing
		}
	},

	// wend

	// while

	width: function (iWidth) {
		var oWin = this.aWindow[8];

		iWidth = this.vmInRangeRound(iWidth, 1, 255, "WIDTH");
		oWin.iRight = oWin.iLeft + iWidth;
	},

	window: function (iStream, iLeft, iRight, iTop, iBottom) {
		var oWin;

		iStream = this.vmInRangeRound(iStream || 0, 0, 7, "WINDOW");
		oWin = this.aWindow[iStream];

		iLeft = this.vmInRangeRound(iLeft, 1, 255, "WINDOW");
		iRight = this.vmInRangeRound(iRight, 1, 255, "WINDOW");
		iTop = this.vmInRangeRound(iTop, 1, 255, "WINDOW");
		iBottom = this.vmInRangeRound(iBottom, 1, 255, "WINDOW");
		oWin.iLeft = Math.min(iLeft, iRight) - 1;
		oWin.iRight = Math.max(iLeft, iRight) - 1;
		oWin.iTop = Math.min(iTop, iBottom) - 1;
		oWin.iBottom = Math.max(iTop, iBottom) - 1;

		oWin.iPos = 0;
		oWin.iVpos = 0;
	},

	windowSwap: function (iStream1, iStream2) { // iStream2 is optional
		var oTemp;

		iStream1 = this.vmInRangeRound(iStream1 || 0, 0, 7, "WINDOW SWAP");
		iStream2 = this.vmInRangeRound(iStream2 || 0, 0, 7, "WINDOW SWAP");

		oTemp = this.aWindow[iStream1];
		this.aWindow[iStream1] = this.aWindow[iStream2];
		this.aWindow[iStream2] = oTemp;
	},

	write: function (iStream) { // varargs
		var aArgs = [],
			oWin, i, arg, sStr;

		iStream = this.vmInRangeRound(iStream || 0, 0, 9, "WRITE");
		oWin = this.aWindow[iStream];

		for (i = 1; i < arguments.length; i += 1) {
			arg = arguments[i];
			if (typeof arg === "number") {
				sStr = String(arg);
			} else {
				sStr = '"' + String(arg) + '"';
			}
			aArgs.push(sStr);
		}
		sStr = aArgs.join(",");

		if (iStream < 8) {
			if (oWin.bTag) {
				this.vmPrintGraphChars(sStr + "\r\n");
			} else {
				this.vmDrawUndrawCursor(iStream); // undraw
				this.vmPrintChars(sStr, iStream);
				this.vmPrintCharsOrControls("\r\n", iStream);
				this.vmDrawUndrawCursor(iStream); // draw
			}
			this.sOut += sStr + "\n"; // console
		} else if (iStream === 8) {
			this.vmNotImplemented("WRITE #" + iStream);
		} else if (iStream === 9) {
			this.oOutFile.iStream = iStream;
			if (!this.oOutFile.bOpen) {
				throw this.vmComposeError(Error(), 31, "WRITE #" + iStream); // File not open
			}
			this.oOutFile.aFileData.push(sStr + "\n"); // real CPC would use CRLF, we use LF
			// currently we print data also to console...
		}
	},

	// xor

	xpos: function () {
		return this.oCanvas.getXpos();
	},

	ypos: function () {
		return this.oCanvas.getYpos();
	},

	zone: function (n) {
		n = this.vmInRangeRound(n, 1, 255, "ZONE");
		this.iZone = n;
	}

	//ErrorObject: Utils.createErrorType("CpcVm.prototype.ErrorObject")

	// ErrorObject: Utils.createErrorType2("CpcVm.prototype.ErrorObject", function () {
	// 	this.setValues.apply(this, arguments);
	// 	//Utils.ErrorObject.apply(this, arguments);
	// 	return this;
	// })

	//ErrorObject: Error

	// ErrorObject: function ErrorObject() {
	// 	Error.captureStackTrace(this, ErrorObject);
	// }
};

//CpcVm.ErrorObject = Error; //Utils.ErrorObject;

/*
CpcVm.ErrorObject = function (oWrappedErr) {
	Object.assign(oWrappedErr, this);
	//this.wrapped = oWrappedErr;
	oWrappedErr.name = "CpcVm.ErrorObject";
	oWrappedErr.bla = "bla2";
	return oWrappedErr;
};
*/


// CpcVm.ErrorObject = Utils.createErrorType("CpcVm.ErrorObject", function (/* message */) {
// 	// this.message = "Message: " + message;
// });

/*
CpcVm.ErrorObject = function () {
	Utils.ErrorObject.apply(this, arguments);
};
CpcVm.ErrorObject.prototype = Object.create(Utils.ErrorObject.prototype);
CpcVm.ErrorObject.prototype.constructor = CpcVm.ErrorObject;
CpcVm.ErrorObject.prototype.name = "CpcVm.ErrorObject";
*/

/*
CpcVm.ErrorObject = function (message, value, pos, hidden) {
	this.message = message;
	this.value = value;
	this.pos = pos;
	this.hidden = hidden;

	// if (Error.hasOwnProperty("captureStackTrace")) { // V8
	// 	Error.captureStackTrace(this, CpcVm.ErrorObject);
	// } else {
	// 	this.stack = (new Error(message)).stack;
	// }
};

CpcVm.ErrorObject.prototype = Object.create(Error.prototype); // not for IE8
CpcVm.ErrorObject.prototype.constructor = CpcVm.ErrorObject;
CpcVm.ErrorObject.prototype.name = "CpcVm.ErrorObject";
CpcVm.ErrorObject.prototype.toString = function () {
	return this.message + " in " + this.pos + ((this.value !== undefined) ? ": " + this.value : "");
};

// CpcVm.ErrorObject.prototype = {
// 	toString: function () {
// 		return this.message + " in " + this.pos + ((this.value !== undefined) ? ": " + this.value : "");
// 	}
// };
*/

if (typeof module !== "undefined" && module.exports) {
	module.exports = CpcVm;
}
