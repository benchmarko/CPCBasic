/* eslint-disable spaced-comment */
// Controller.js - Controller
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
/* globals cpcBasicCharset Uint8Array */

"use strict";

var Utils, BasicFormatter, BasicLexer, BasicParser, BasicTokenizer, Canvas, CodeGeneratorJs, CommonEventHandler, CpcVm, Keyboard, Sound, Variables, ZipFile;

if (typeof require !== "undefined") {
	/* eslint-disable global-require */
	Utils = require("./Utils.js");
	BasicFormatter = require("./BasicFormatter.js");
	BasicLexer = require("./BasicLexer.js");
	BasicParser = require("./BasicParser.js");
	BasicTokenizer = require("./BasicTokenizer.js");
	Canvas = require("./Canvas.js");
	CodeGeneratorJs = require("./CodeGeneratorJs.js");
	CommonEventHandler = require("./CommonEventHandler.js");
	CpcVm = require("./CpcVm.js");
	Keyboard = require("./Keyboard.js");
	Sound = require("./Sound.js");
	Variables = require("./Variables.js");
	ZipFile = require("./ZipFile.js");
	/* eslint-enable global-require */
}

function Controller(oModel, oView) {
	this.init(oModel, oView);
}

Controller.prototype = {

	init: function (oModel, oView) {
		var sExample, sKbdLayout;

		this.fnRunLoopHandler = this.fnRunLoop.bind(this);
		this.fnWaitKeyHandler = this.fnWaitKey.bind(this);
		this.fnWaitInputHandler = this.fnWaitInput.bind(this);
		this.fnOnEscapeHandler = this.fnOnEscape.bind(this);
		this.fnDirectInputHandler = this.fnDirectInput.bind(this);

		//this.oCodeGeneratorJs = null;

		this.fnScript = null;

		this.bTimeoutHandlerActive = false;
		this.iNextLoopTimeOut = 0; // next timeout for the main loop

		this.oVariables = new Variables();

		this.model = oModel;
		this.view = oView;
		this.commonEventHandler = new CommonEventHandler(oModel, oView, this);

		oView.setHidden("consoleBox", !oModel.getProperty("showConsole"));

		oView.setHidden("inputArea", !oModel.getProperty("showInput"));
		oView.setHidden("inp2Area", !oModel.getProperty("showInp2"));
		oView.setHidden("outputArea", !oModel.getProperty("showOutput"));
		oView.setHidden("resultArea", !oModel.getProperty("showResult"));
		oView.setHidden("variableArea", !oModel.getProperty("showVariable"));
		oView.setHidden("kbdArea", !oModel.getProperty("showKbd"), "flex");
		oView.setHidden("kbdLayoutArea", !oModel.getProperty("showKbdLayout"));

		oView.setHidden("cpcArea", false); // make sure canvas is not hidden (allows to get width, height)
		this.oCanvas = new Canvas({
			aCharset: cpcBasicCharset,
			cpcDivId: "cpcArea"
		});
		oView.setHidden("cpcArea", !oModel.getProperty("showCpc"));

		sKbdLayout = oModel.getProperty("kbdLayout");
		oView.setSelectValue("kbdLayoutSelect", sKbdLayout);
		this.commonEventHandler.onKbdLayoutSelectChange();

		this.oKeyboard = new Keyboard({
			fnOnEscapeHandler: this.fnOnEscapeHandler
		});
		if (this.model.getProperty("showKbd")) { // maybe we need to draw virtual keyboard
			this.oKeyboard.virtualKeyboardCreate();
		}

		this.oSound = new Sound();
		this.commonEventHandler.fnActivateUserAction(this.onUserAction.bind(this)); // check first user action, also if sound is not yet on

		sExample = oModel.getProperty("example");
		oView.setSelectValue("exampleSelect", sExample);

		this.oVm = new CpcVm({
			canvas: this.oCanvas,
			keyboard: this.oKeyboard,
			sound: this.oSound,
			variables: this.oVariables,
			tron: oModel.getProperty("tron")
		});
		this.oVm.vmReset();

		this.oNoStop = Object.assign({}, this.oVm.vmGetStopObject());
		this.oSavedStop = {}; // backup of stop object
		this.setStopObject(this.oNoStop);

		this.oCodeGeneratorJs = new CodeGeneratorJs({
			lexer: new BasicLexer(),
			parser: new BasicParser(),
			tron: this.model.getProperty("tron"),
			rsx: this.oVm.rsx // just to check the names
		});

		this.BasicTokenizer = new BasicTokenizer(); // for tokenized BASIC

		this.initDatabases();
		if (oModel.getProperty("sound")) { // activate sound needs user action
			this.setSoundActive(); // activate in waiting state
		}
		if (oModel.getProperty("showCpc")) {
			this.oCanvas.startUpdateCanvas();
		}

		this.initDropZone(); //TEST
	},

	initDatabases: function () {
		var oModel = this.model,
			oDatabases = {},
			aDatabaseDirs, i, sDatabaseDir, aParts, sName;

		aDatabaseDirs = oModel.getProperty("databaseDirs").split(",");
		for (i = 0; i < aDatabaseDirs.length; i += 1) {
			sDatabaseDir = aDatabaseDirs[i];
			aParts = sDatabaseDir.split("/");
			sName = aParts[aParts.length - 1];
			oDatabases[sName] = {
				text: sName,
				title: sName,
				src: sDatabaseDir
			};
		}
		this.model.addDatabases(oDatabases);

		this.setDatabaseSelectOptions();
		this.commonEventHandler.onDatabaseSelectChange();
	},

	onUserAction: function (/* event, sId */) {
		this.commonEventHandler.fnDeactivateUserAction();
		this.oSound.setActivatedByUser(true);
		this.setSoundActive();
	},

	// Also called from index file 0index.js
	addIndex: function (sDir, input) { // optional sDir
		var sInput, aIndex, i;

		sInput = input.trim();
		aIndex = JSON.parse(sInput);
		for (i = 0; i < aIndex.length; i += 1) {
			aIndex[i].dir = sDir;
			this.model.setExample(aIndex[i]);
		}
	},

	// Also called from example files xxxxx.js
	addItem: function (sKey, input) { // optional sKey
		var sInput, oExample;

		sInput = input.trim();

		if (!sKey) {
			sKey = this.model.getProperty("example");
		}
		oExample = this.model.getExample(sKey);
		if (!oExample) {
			oExample = this.fnCreateNewExample({
				key: sKey
			});
			sKey = oExample.key;
			this.model.setExample(oExample);
			Utils.console.log("addItem: Creating new example:", sKey);
		}
		oExample.key = sKey; // maybe changed
		oExample.script = sInput;
		oExample.loaded = true;
		Utils.console.log("addItem:", sKey);
		return sKey;
	},

	setDatabaseSelectOptions: function () {
		var sSelect = "databaseSelect",
			aItems = [],
			oDatabases = this.model.getAllDatabases(),
			sDatabase = this.model.getProperty("database"),
			sValue, oDb, oItem;

		for (sValue in oDatabases) {
			if (oDatabases.hasOwnProperty(sValue)) {
				oDb = oDatabases[sValue];
				oItem = {
					value: sValue,
					text: oDb.text,
					title: oDb.title
				};
				if (sValue === sDatabase) {
					oItem.selected = true;
				}
				aItems.push(oItem);
			}
		}
		this.view.setSelectOptions(sSelect, aItems);
	},

	setExampleSelectOptions: function () {
		var iMaxTitleLength = 160,
			iMaxTextLength = 60, // (32 visible?)
			sSelect = "exampleSelect",
			aItems = [],
			sExample = this.model.getProperty("example"),
			oAllExamples = this.model.getAllExamples(),
			bExampleSelected = false,
			sKey, oExample, oItem;

		for (sKey in oAllExamples) {
			if (oAllExamples.hasOwnProperty(sKey)) {
				oExample = oAllExamples[sKey];
				oItem = {
					value: oExample.key,
					title: (oExample.key + ": " + oExample.title).substr(0, iMaxTitleLength)
				};
				oItem.text = oItem.title.substr(0, iMaxTextLength);
				if (oExample.key === sExample) {
					oItem.selected = true;
					bExampleSelected = true;
				}
				aItems.push(oItem);
			}
		}
		if (!bExampleSelected && aItems.length) {
			aItems[0].selected = true; // if example is not found, select first element
		}
		this.view.setSelectOptions(sSelect, aItems);
	},

	setVarSelectOptions: function (sSelect, oVariables) {
		var iMaxVarLength = 35,
			aVarNames = oVariables.getAllVariableNames(),
			aItems = [],
			i, oItem, sKey, sValue, sTitle, sStrippedTitle,
			fnSortByStringProperties = function (a, b) { // can be used without "this" context
				var x = a.value,
					y = b.value;

				if (x < y) {
					return -1;
				} else if (x > y) {
					return 1;
				}
				return 0;
			};

		for (i = 0; i < aVarNames.length; i += 1) {
			sKey = aVarNames[i];
			sValue = oVariables.getVariable(sKey);
			sTitle = sKey + "=" + sValue;
			sStrippedTitle = sTitle.substr(0, iMaxVarLength); // limit length
			if (sTitle !== sStrippedTitle) {
				sStrippedTitle += " ...";
			}
			oItem = {
				value: sKey,
				title: sStrippedTitle
			};
			oItem.text = oItem.title;
			aItems.push(oItem);
		}
		aItems = aItems.sort(fnSortByStringProperties);
		this.view.setSelectOptions(sSelect, aItems);
	},

	invalidateScript: function () {
		this.fnScript = null;
	},

	fnWaitForContinue: function () {
		var iStream = 0,
			sKey;

		sKey = this.oKeyboard.getKeyFromBuffer();

		if (sKey !== "") {
			this.oVm.cursor(iStream, 0);
			this.oKeyboard.setKeyDownHandler(null);
			this.startContinue();
		}
	},

	fnOnEscape: function () {
		var oStop = this.oVm.vmGetStopObject(),
			iStream = 0,
			sMsg, oSavedStop;

		if (this.oVm.iBreakGosubLine < 0) { //TTT on break cont?  fast hack to access iBreakGosubLine
			// ignore break
		} else if (oStop.sReason === "direct" || this.oVm.iBreakResumeLine) { //TTT fast hack to access iBreakResumeLine
			oStop.oParas.sInput = "";
			sMsg = "*Break*\r\n";
			this.oVm.print(iStream, sMsg);
		} else if (oStop.sReason !== "escape") { // first escape?
			this.oVm.cursor(iStream, 1);
			this.oKeyboard.setKeyDownHandler(this.fnWaitForContinue.bind(this));
			this.setStopObject(oStop);
			this.oVm.vmStop("escape", 85, false, {
				iStream: iStream
			});
		} else { // second escape
			this.oKeyboard.setKeyDownHandler(null);
			this.oVm.cursor(iStream, 0);

			oSavedStop = this.getStopObject();
			if (oSavedStop.sReason === "waitInput") { // sepcial handling: set line to repeat input
				this.oVm.vmGotoLine(oSavedStop.oParas.iLine);
			}

			if (!this.oVm.vmEscape()) {
				this.oVm.vmStop("", 0, true); // continue program, in break handler?
				this.setStopObject(this.oNoStop);
			} else {
				this.oVm.vmStop("stop", 0, true); // stop
				sMsg = "Break in " + this.oVm.iLine + "\r\n";
				this.oVm.print(iStream, sMsg);
			}
		}

		this.startMainLoop();
	},

	fnWaitKey: function () {
		var sKey;

		sKey = this.oKeyboard.getKeyFromBuffer();
		if (sKey !== "") {
			Utils.console.log("Wait for key:", sKey);
			this.oVm.vmStop("", 0, true);
			this.oKeyboard.setKeyDownHandler(null);
			this.startMainLoop();
		} else {
			this.oKeyboard.setKeyDownHandler(this.fnWaitKeyHandler); // wait until keypress handler (for call &bb18)
		}
	},

	fnWaitInput: function () { // eslint-disable-line complexity
		var oStop = this.oVm.vmGetStopObject(),
			oInput = oStop.oParas,
			iStream = oInput.iStream,
			sInput = oInput.sInput,
			bInputOk = false,
			sKey;

		do {
			sKey = this.oKeyboard.getKeyFromBuffer(); // (inkey$ could insert frame if checked too often)
			// chr13 shows as empty string!
			switch (sKey) {
			case "":
				break;
			case "\r": // cr
				break;
			case "\x7f": // del
				if (sInput.length) {
					sInput = sInput.slice(0, -1);
					sKey = "\x08\x10"; // use BS and DLE
				} else {
					sKey = "\x07"; // ignore BS, use BEL
				}
				break;
			case "\xe0": // copy
				sKey = this.oVm.copychr$(iStream);
				if (sKey.length) {
					sInput += sKey;
					sKey = "\x09"; // TAB
				} else {
					sKey = "\x07"; // ignore (BEL)
				}
				break;
			case "\xf0": // cursor up
				if (!sInput.length) {
					sKey = "\x0b"; // VT
				} else {
					sKey = "\x07"; // ignore (BEL)
				}
				break;
			case "\xf1": // cursor down
				if (!sInput.length) {
					sKey = "\x0a"; // LF
				} else {
					sKey = "\x07"; // ignore (BEL)
				}
				break;
			case "\xf2": // cursor left
				if (!sInput.length) {
					sKey = "\x08"; // BS
				} else {
					sKey = "\x07"; // ignore (BEL) TODO
				}
				break;
			case "\xf3": // cursor right
				if (!sInput.length) {
					sKey = "\x09"; // TAB
				} else {
					sKey = "\x07"; // ignore (BEL) TODO
				}
				break;
			default:
				if (sKey >= "\x20") { // no control codes in buffer
					sInput += sKey;
				}
				break;
			}
			if (sKey && sKey !== "\r") {
				this.oVm.print(iStream, sKey);
			}
		} while (sKey !== "" && sKey !== "\r"); // get all keys until CR or no more key

		oInput.sInput = sInput;
		if (sKey === "\r") {
			Utils.console.log("fnWaitInput:", sInput);
			if (!oInput.sNoCRLF) {
				this.oVm.print(iStream, "\r\n");
			}
			if (oInput.fnInputCallback) {
				bInputOk = oInput.fnInputCallback();
			} else {
				bInputOk = true;
			}
			if (bInputOk) {
				this.oKeyboard.setKeyDownHandler(null);
				this.startContinue();
			}
		}

		if (!bInputOk) {
			this.oKeyboard.setKeyDownHandler(this.fnWaitInputHandler); // make sure it is set
		}
	},

	fnWaitSound: function () {
		var aSoundData;

		this.oVm.vmLoopCondition(); // update iNextFrameTime, timers, inks; schedule sound: free queue
		if (this.oSound.isActivatedByUser()) { // only if activated
			aSoundData = this.oVm.vmGetSoundData();
			while (aSoundData.length && this.oSound.testCanQueue(aSoundData[0].iState)) {
				this.oSound.sound(aSoundData.shift());
			}
			if (!aSoundData.length) {
				this.oVm.vmStop("", 0, true); // no more wait
			}
		}
		this.iNextLoopTimeOut = this.oVm.vmGetTimeUntilFrame(); // wait until next frame
	},

	// merge two scripts with sorted line numbers, lines from script2 overwrite lines from script1
	mergeScripts: function (sScript1, sScript2) {
		var aLines1 = sScript1.split("\n"),
			aLines2 = sScript2.split("\n"),
			aResult = [],
			iLine1, sLine2, iLine2;

		while (aLines1.length && aLines2.length) {
			iLine1 = iLine1 || parseInt(aLines1[0], 10);
			iLine2 = iLine2 || parseInt(aLines2[0], 10);
			if (iLine1 < iLine2) { // use line from script1
				aResult.push(aLines1.shift());
				iLine1 = 0;
			} else { // use line from script2
				sLine2 = aLines2.shift();
				if (String(iLine2) !== sLine2) { // line not empty?
					aResult.push(sLine2);
				}
				if (iLine1 === iLine2) { // same line numbber in script1 and script2
					aLines1.shift(); // ignore line from script1 (overwrite it)
					iLine1 = 0;
				}
				iLine2 = 0;
			}
		}

		aResult = aResult.concat(aLines1, aLines2); // put in remaining lines from one source
		if (aResult.length >= 2) {
			if (aResult[aResult.length - 2] === "" && aResult[aResult.length - 1] === "") {
				aResult.pop(); // remove additional newline
			}
		}
		return aResult.join("\n");
	},

	// get line range from a script with sorted line numbers
	fnGetLinesInRange: function (sScript, iFirstLine, iLastLine) {
		var aLines = sScript ? sScript.split("\n") : [];

		while (aLines.length && parseInt(aLines[0], 10) < iFirstLine) {
			aLines.shift();
		}

		if (aLines.length && aLines[aLines.length - 1] === "") { // trailing empty line?
			aLines.pop(); // remove
		}

		while (aLines.length && parseInt(aLines[aLines.length - 1], 10) > iLastLine) {
			aLines.pop();
		}
		return aLines;
	},

	fnGetDirectoryEntries: function (sMask) { // optional sMask
		var oStorage = Utils.localStorage,
			aDir = [],
			oRegExp, i, sKey;

		if (sMask) {
			sMask = sMask.replace(/([.+^$[\]\\(){}|-])/g, "\\$1");
			sMask = sMask.replace(/\?/g, ".");
			sMask = sMask.replace(/\*/g, ".*");
			oRegExp = new RegExp("^" + sMask + "$");
		}

		for (i = 0; i < oStorage.length; i += 1) {
			sKey = oStorage.key(i);
			if (!oRegExp || oRegExp.test(sKey)) {
				aDir.push(sKey);
			}
		}
		return aDir;
	},

	fnPrintDirectoryEntries: function (iStream, aDir, bSort) {
		var i, sKey, aParts;

		// first format names
		for (i = 0; i < aDir.length; i += 1) {
			sKey = aDir[i];
			aParts = sKey.split(".");
			aDir[i] = aParts[0].padEnd(8, " ") + "." + aParts[1].padEnd(3, " ");
		}

		if (bSort) {
			aDir = aDir.sort();
		}

		this.oVm.print(iStream, "\r\n");
		for (i = 0; i < aDir.length; i += 1) {
			sKey = aDir[i] + "  ";
			this.oVm.print(iStream, sKey);
		}
		this.oVm.print(iStream, "\r\n");
	},

	fnFileCat: function (oParas) {
		var iStream = oParas.iStream,
			aDir = this.fnGetDirectoryEntries();

		this.fnPrintDirectoryEntries(iStream, aDir, true);
		this.oVm.vmStop("", 0, true);
	},

	fnFileDir: function (oParas) {
		var iStream = oParas.iStream,
			sFileMask = oParas.sFileMask,
			aDir;

		if (sFileMask) {
			sFileMask =	this.fnLocalStorageName(sFileMask);
		}
		aDir = this.fnGetDirectoryEntries(sFileMask);
		this.fnPrintDirectoryEntries(iStream, aDir, false);
		this.oVm.vmStop("", 0, true);
	},

	fnFileEra: function (oParas) {
		var iStream = oParas.iStream,
			oStorage = Utils.localStorage,
			sFileMask = oParas.sFileMask,
			aDir, i, sName;

		sFileMask =	this.fnLocalStorageName(sFileMask);
		aDir = this.fnGetDirectoryEntries(sFileMask);

		if (!aDir.length) {
			this.oVm.print(iStream, sFileMask + " not found\r\n");
		}

		for (i = 0; i < aDir.length; i += 1) {
			sName = aDir[i];
			if (oStorage.getItem(sName) !== null) {
				oStorage.removeItem(sName);
				if (Utils.debug > 0) {
					Utils.console.debug("fnEraseFile: sName=" + sName + ": removed from localStorage");
				}
			} else {
				this.oVm.print(iStream, sName + " not found\r\n");
				Utils.console.warn("fnEraseFile: file not found in localStorage:", sName);
			}
		}
		this.oVm.vmStop("", 0, true);
	},

	fnFileRen: function (oParas) {
		var iStream = oParas.iStream,
			oStorage = Utils.localStorage,
			sNew = oParas.sNew,
			sOld = oParas.sOld,
			sItem;

		sNew = this.fnLocalStorageName(sNew);
		sOld = this.fnLocalStorageName(sOld);

		sItem = oStorage.getItem(sOld);
		if (sItem !== null) {
			oStorage.setItem(sNew, sItem);
			oStorage.removeItem(sOld);
		} else {
			this.oVm.print(iStream, sOld + " not found\r\n");
		}
		this.oVm.vmStop("", 0, true);
	},

	loadFileContinue: function (sInput, sMeta) {
		var oInFile = this.oVm.vmGetInFileObject(),
			sCommand = oInFile.sCommand,
			iStartLine = 0;

		this.oVm.vmStop("", 0, true);

		sMeta = sMeta || "";
		if (sMeta.charAt(0) === "T") { // tokenized basic?
			sInput = this.BasicTokenizer.decode(Utils.atob(sInput));
		} else if (sMeta.charAt(0) === "B") { // binary?
			sInput = Utils.atob(sInput);
		} else if (sMeta.charAt(0) === "A") { // ASCII?
			// remove EOF character(s) (0x1a) from the end of file
			sInput = sInput.replace(/\x1a+$/, ""); // eslint-disable-line no-control-regex
		}

		if (oInFile.fnFileCallback) {
			try {
				oInFile.fnFileCallback(sInput, sMeta);
			} catch (e) {
				Utils.console.warn(e);
			}
		}
		if (sInput !== null) {
			switch (sCommand) {
			case "openin":
				break;
			case "chainMerge":
				sInput = this.mergeScripts(this.view.getAreaValue("inputText"), sInput);
				this.view.setAreaValue("inputText", sInput);
				this.view.setAreaValue("resultText", "");
				iStartLine = oInFile.iLine || 0;
				this.fnReset();
				this.fnParseRun();
				break;
			case "load":
				if (!Utils.stringStartsWith(sMeta || "", "B")) { // not for binary files
					this.view.setAreaValue("inputText", sInput);
					this.view.setAreaValue("resultText", "");
					this.invalidateScript();
					this.oVm.vmStop("end", 90);
				}
				break;
			case "merge":
				sInput = this.mergeScripts(this.view.getAreaValue("inputText"), sInput);
				this.view.setAreaValue("inputText", sInput);
				this.view.setAreaValue("resultText", "");
				this.invalidateScript();
				this.oVm.vmStop("end", 90);
				break;
			case "chain": //TODO: run through... : if we have a line number, make sure it is not optimized away when compiling!
			case "run":
				this.view.setAreaValue("inputText", sInput);
				this.view.setAreaValue("resultText", "");
				iStartLine = oInFile.iLine || 0;
				this.fnReset();
				this.fnParseRun();
				break;
			default:
				Utils.console.error("loadExample: Unknown command:", sCommand);
				break;
			}
			this.oVm.vmSetStartLine(iStartLine);
		} else {
			this.oVm.vmStop("stop", 60);
		}
		this.startMainLoop();
	},

	loadExample: function () {
		var that = this,
			oInFile = this.oVm.vmGetInFileObject(),
			sPath = "",
			sDatabaseDir, sName, sExample, oExample, sKey, iLastSlash, sUrl,

			fnExampleLoaded = function (sFullUrl, bSuppressLog) {
				var sInput;

				if (!bSuppressLog) {
					Utils.console.log("Example", sUrl, "loaded");
				}

				oExample = that.model.getExample(sExample);
				sInput = oExample.script;
				that.model.setProperty("example", oInFile.sMemorizedExample);
				that.loadFileContinue(sInput, oExample.meta);
			},
			fnExampleError = function () {
				var oError;

				Utils.console.log("Example", sUrl, "error");
				that.model.setProperty("example", oInFile.sMemorizedExample);
				oError = that.oVm.vmComposeError(Error(), 32, sExample + " not found"); // TODO: set also derr=146 (xx not found)
				that.outputError(oError, true);
				that.loadFileContinue(null);
			};

		sName = oInFile.sName;
		sKey = this.model.getProperty("example");

		if (sName.charAt(0) === "/") { // absolute path?
			sName = sName.substr(1); // remove "/"
			oInFile.sMemorizedExample = sName; // change!
		} else {
			oInFile.sMemorizedExample = sKey;
			iLastSlash = sKey.lastIndexOf("/");
			if (iLastSlash >= 0) {
				sPath = sKey.substr(0, iLastSlash); // take path from selected example
				sName = sPath + "/" + sName;
				sName = sName.replace(/\w+\/\.\.\//, ""); // simplify 2 dots (go back) in path: "dir/.."" => ""
			}
		}
		sExample = sName;

		if (Utils.debug > 0) {
			Utils.console.debug("loadExample: sName=" + sName + " (current=" + sKey + ")");
		}

		oExample = this.model.getExample(sExample); // already loaded
		if (oExample && oExample.loaded) {
			this.model.setProperty("example", sExample);
			fnExampleLoaded("", true);
		} else if (sExample && oExample) { // need to load
			this.model.setProperty("example", sExample);
			sDatabaseDir = this.model.getDatabase().src;
			sUrl = sDatabaseDir + "/" + sExample + ".js";
			Utils.loadScript(sUrl, fnExampleLoaded, fnExampleError);
		} else { // keep original sExample in this error case
			sUrl = sExample;
			Utils.console.warn("loadExample: Unknown file:", sExample);
			fnExampleError();
		}
	},

	computeChecksum: function (sData) {
		var iSum = 0,
			i;

		for (i = 0; i < sData.length; i += 1) {
			iSum += sData.charCodeAt(i);
		}
		return iSum;
	},

	parseAmsdosHeader: function (sData) {
		var oHeader = null,
			iComputed, iSum;

		// http://www.cpcwiki.eu/index.php/AMSDOS_Header
		if (sData.length >= 0x80) {
			iComputed = this.computeChecksum(sData.substr(0, 66));
			iSum = sData.charCodeAt(67) + sData.charCodeAt(68) * 256;
			if (iComputed === iSum) {
				oHeader = {
					iType: sData.charCodeAt(18),
					iStart: sData.charCodeAt(21) + sData.charCodeAt(22) * 256,
					iPseudoLen: sData.charCodeAt(24) + sData.charCodeAt(25) * 256,
					iEntry: sData.charCodeAt(26) + sData.charCodeAt(27) * 256,
					iLength: sData.charCodeAt(64) + sData.charCodeAt(65) * 256 + sData.charCodeAt(66) * 65536
				};
				if (oHeader.iType === 0) {
					oHeader.sType = "T";
				} else if (oHeader.iType === 1) {
					oHeader.sType = "P";
				} else if (oHeader.iType === 2) {
					oHeader.sType = "B";
				} else {
					oHeader.sType = "A"; //TTT
				}
			}
		}
		return oHeader;
	},


	fnLocalStorageName: function (sName, sDefaultExtension) {
		// modify name so we do not clash with localstorage methods/properites
		if (sName.indexOf(".") < 0) { // no dot inside name?
			sName += "." + (sDefaultExtension || ""); // append dot or default extension
		}
		return sName;
	},

	fnFileLoad: function () {
		var oInFile = this.oVm.vmGetInFileObject(),
			oStorage = Utils.localStorage,
			sName, sStorageName, sInput, iIndex, sMeta;

		if (oInFile.bOpen) {
			if (oInFile.sCommand === "chainMerge" && oInFile.iFirst && oInFile.iLast) { // special handling to delete line numbers first
				this.fnDeleteLines({
					iFirst: oInFile.iFirst,
					iLast: oInFile.iLast,
					sCommand: "CHAIN MERGE"
				});
				this.oVm.vmStop("fileLoad", 90); // restore
			}

			sName = oInFile.sName;
			sStorageName = this.fnLocalStorageName(sName);
			if (oStorage.getItem(sStorageName) === null && sName !== sStorageName) {
				sStorageName = this.fnLocalStorageName(sName, "bas");
				if (oStorage.getItem(sStorageName) === null) {
					sStorageName = this.fnLocalStorageName(sName, "bin");
				}
			}

			if (Utils.debug > 0) {
				Utils.console.debug("fnFileLoad: sName=" + sName + " oStorage=" + oStorage);
			}

			if (oStorage.getItem(sStorageName) !== null) {
				if (Utils.debug > 0) {
					Utils.console.debug("fnFileLoad: sName=" + sName + ": get from localStorage");
				}
				sInput = oStorage.getItem(sStorageName);
				iIndex = sInput.indexOf(";"); // metadata separator
				if (iIndex >= 0) {
					sMeta = sInput.substr(0, iIndex);
					sInput = sInput.substr(iIndex + 1);
				}
				this.loadFileContinue(sInput, sMeta || "");
			} else { // load from example
				this.loadExample(sName);
			}
		} else {
			Utils.console.error("fnFileLoad: File not open!");
		}
		this.iNextLoopTimeOut = this.oVm.vmGetTimeUntilFrame(); // wait until next frame
	},

	fnFileSave: function () {
		var oOutFile = this.oVm.vmGetOutFileObject(),
			oStorage = Utils.localStorage,
			sDefaultExtension = "",
			sName, sMeta, sType, sStorageName, sFileData;

		if (oOutFile.bOpen) {
			sMeta = oOutFile.sType;
			sType = sMeta.charAt(0);
			sName = oOutFile.sName;

			if (sType === "P" || sType === "T") {
				sDefaultExtension = "bas";
			} else if (sType === "B") {
				sDefaultExtension = "bin";
			}
			sStorageName = this.fnLocalStorageName(sName, sDefaultExtension);

			sFileData = oOutFile.aFileData.join("");
			if (Utils.debug > 0) {
				Utils.console.debug("fnFileSave: sName=" + sName + ": put into localStorage");
			}
			if (sFileData === "") {
				if (sType === "A" || sType === "P" || sType === "T") { // TODO: only "A" supported, not "P" or "T"
					sFileData = this.view.getAreaValue("inputText");
					sMeta = "A"; // currently we support type "A" only
				}
			}

			if (oOutFile.fnFileCallback) {
				try {
					oOutFile.fnFileCallback(sFileData); // close file
				} catch (e) {
					Utils.console.warn(e);
				}
			}

			if (sMeta.indexOf(",") < 0) { // no start and length?
				sMeta += ",0," + sFileData.length;
			}

			oStorage.setItem(sStorageName, sMeta + ";" + sFileData);
			this.oVm.vmResetFileHandling(oOutFile); //TTT make sure it is closed
		} else {
			Utils.console.error("fnFileSave: file not open!");
		}
		this.oVm.vmStop("", 0, true); // continue
	},

	fnDeleteLines: function (oParas) {
		var sInputText = this.view.getAreaValue("inputText"),
			aLines = this.fnGetLinesInRange(sInputText, oParas.iFirst, oParas.iLast),
			iLine, i, oError, sInput;

		if (aLines.length) {
			for (i = 0; i < aLines.length; i += 1) {
				iLine = parseInt(aLines[i], 10);
				if (isNaN(iLine)) {
					oError = this.oVm.vmComposeError(Error(), 21, oParas.sCommand); // "Direct command found"
					this.outputError(oError, true);
					//this.oVm.print(iStream, (oError.shortMessage || oError.message) + "\r\n");
					break;
				}
				aLines[i] = iLine; // keep just the line numbers
			}
			if (!oError) {
				sInput = aLines.join("\n");
				sInput = this.mergeScripts(sInputText, sInput); // delete sInput lines
				this.view.setAreaValue("inputText", sInput);
			}
		}

		this.oVm.vmGotoLine(0); // reset current line
		this.oVm.vmStop("end", 0, true);
	},

	fnNew: function (/* oParas */) {
		this.view.setAreaValue("inputText", "");
		this.oVariables.removeAllVariables();

		this.oVm.vmGotoLine(0); // reset current line
		this.oVm.vmStop("end", 0, true);
		this.invalidateScript();
	},

	fnList: function (oParas) {
		var sInput = this.view.getAreaValue("inputText"),
			iStream = oParas.iStream,
			aLines = this.fnGetLinesInRange(sInput, oParas.iFirst, oParas.iLast),
			i;

		for (i = 0; i < aLines.length; i += 1) {
			this.oVm.print(iStream, aLines[i] + "\r\n");
		}

		this.oVm.vmGotoLine(0); // reset current line
		this.oVm.vmStop("end", 0, true);
	},

	fnReset: function () {
		var oVm = this.oVm;

		//this.oVariables = {};
		this.oVariables.removeAllVariables();
		//oVm.vmResetVariables(); this.oVariables.initAllVariables();
		oVm.vmReset();
		oVm.vmStop("end", 0, true); // set "end" with priority 0, so that "compile only" still works
		oVm.sOut = "";
		this.view.setAreaValue("outputText", "");
		this.invalidateScript();
	},

	outputError: function (oError, bNoSelection) {
		var iStream = 0,
			sShortError = oError.shortMessage || oError.message,
			iEndPos;

		if (!bNoSelection) {
			iEndPos = oError.pos + ((oError.value !== undefined) ? String(oError.value).length : 0);
			this.view.setAreaSelection("inputText", oError.pos, iEndPos);
		}

		this.oVm.print(iStream, sShortError + "\r\n");
		return sShortError;
	},

	fnRenumLines: function (oParas) {
		var oVm = this.oVm,
			sInput = this.view.getAreaValue("inputText"),
			oOutput;

		if (!this.oBasicFormatter) {
			this.oBasicFormatter = new BasicFormatter({
				lexer: new BasicLexer(),
				parser: new BasicParser()
			});
		}

		this.oBasicFormatter.reset();
		oOutput = this.oBasicFormatter.renumber(sInput, oParas.iNew, oParas.iOld, oParas.iStep, oParas.iKeep);

		if (oOutput.error) {
			Utils.console.warn(oOutput.error);
			this.outputError(oOutput.error);
		} else {
			this.view.setAreaValue("inputText", oOutput.text);
		}
		this.oVm.vmGotoLine(0); // reset current line
		oVm.vmStop("end", 0, true);
		return oOutput;
	},

	fnEditLineCallback: function () {
		var oInput = this.oVm.vmGetStopObject().oParas,
			sInput = oInput.sInput,
			sInputText = this.view.getAreaValue("inputText");

		sInput = this.mergeScripts(sInputText, sInput);
		this.view.setAreaValue("inputText", sInput);
		this.oVm.vmSetStartLine(0); //TTT or invalidateScript?
		this.oVm.vmGotoLine(0); // to be sure
		this.view.setDisabled("continueButton", true);
		this.oVm.cursor(oInput.iStream, 0);
		this.oVm.vmStop("end", 90);
		return true;
	},

	fnEditLine: function (oParas) {
		var sInput = this.view.getAreaValue("inputText"),
			iStream = oParas.iStream,
			iLine = oParas.iLine,
			aLines = this.fnGetLinesInRange(sInput, iLine, iLine),
			sLine, oError;

		if (aLines.length) {
			sLine = aLines[0];
			this.oVm.print(iStream, sLine);
			this.oVm.cursor(iStream, 1);
			this.oVm.vmStop("waitInput", 45, true, {
				iStream: iStream,
				sMessage: "",
				fnInputCallback: this.fnEditLineCallback.bind(this),
				sInput: sLine
			});
			this.fnWaitInput();
		} else {
			oError = this.oVm.vmComposeError(Error(), 8, iLine); // "Line does not exist"
			this.oVm.print(iStream, String(oError) + "\r\n");
			this.oVm.vmStop("stop", 60, true);
		}
	},

	fnParse: function () {
		var sInput = this.view.getAreaValue("inputText"),
			iBench = this.model.getProperty("bench"),
			i, iTime, oOutput, sOutput;

		//this.oVariables = {};
		this.oVariables.removeAllVariables();
		if (!iBench) {
			this.oCodeGeneratorJs.reset();
			oOutput = this.oCodeGeneratorJs.generate(sInput, this.oVariables);
		} else {
			for (i = 0; i < iBench; i += 1) {
				this.oCodeGeneratorJs.reset();
				iTime = Date.now();
				oOutput = this.oCodeGeneratorJs.generate(sInput, this.oVariables);
				iTime = Date.now() - iTime;
				Utils.console.debug("bench size", sInput.length, "labels", Object.keys(this.oCodeGeneratorJs.oLabels).length, "loop", i, ":", iTime, "ms");
				if (oOutput.error) {
					break;
				}
			}
		}

		if (oOutput.error) {
			sOutput = this.outputError(oOutput.error);
		} else {
			sOutput = oOutput.text;
		}
		if (sOutput && sOutput.length > 0) {
			sOutput += "\n";
		}
		this.view.setAreaValue("outputText", sOutput);

		this.invalidateScript();
		this.setVarSelectOptions("varSelect", this.oVariables);
		this.commonEventHandler.onVarSelectChange();
		return oOutput;
	},

	selectJsError: function (sScript, e) {
		var iPos = 0,
			iLine = 0,
			iErrLine = e.lineNumber - 3; // for some reason line 0 is 3

		while (iPos < sScript.length && iLine < iErrLine) {
			iPos = sScript.indexOf("\n", iPos) + 1;
			iLine += 1;
		}
		iPos += e.columnNumber;

		Utils.console.warn("Info: JS Error occurred at line", e.lineNumber, "column", e.columnNumber, "pos", iPos);

		this.view.setAreaSelection("outputText", iPos, iPos + 1);
	},

	fnRun: function (oParas) {
		var sScript = this.view.getAreaValue("outputText"),
			iLine = oParas && oParas.iLine || 0,
			oVm = this.oVm;

		iLine = iLine || 0;
		if (iLine === 0) {
			oVm.vmResetData(); // start from the beginning => also reset data! (or put it in line 0 in the script)
		}

		if (this.oVm.vmGetOutFileObject().bOpen) {
			this.fnFileSave(); //TTT
		}

		if (!this.fnScript) {
			//oVm.vmSetVariables(this.oVariables);
			oVm.clear(); // init variables
			try {
				this.fnScript = new Function("o", sScript); // eslint-disable-line no-new-func
			} catch (e) {
				Utils.console.error(e);
				if (e.lineNumber || e.columnNumber) { // only available on Firefox
					this.selectJsError(sScript, e);
				}
				e.shortMessage = "JS " + String(e);
				this.outputError(e, true);
				this.fnScript = null;
			}
		} else {
			oVm.clear(); // we do a clear as well here
		}
		oVm.vmReset4Run();

		if (this.fnScript) {
			oVm.sOut = this.view.getAreaValue("resultText");
			oVm.vmStop("", 0, true);
			oVm.vmGotoLine(0); // to load DATA lines
			this.oVm.vmSetStartLine(iLine); // clear resets also startline

			this.view.setDisabled("runButton", true);
			this.view.setDisabled("stopButton", false);
			this.view.setDisabled("continueButton", true);
		}
		if (Utils.debug > 1) {
			Utils.console.debug("End of fnRun");
		}
	},

	fnParseRun: function () {
		var oOutput = this.fnParse();

		if (!oOutput.error) {
			this.fnRun();
		}
	},

	fnRunPart1: function () {
		try {
			this.fnScript(this.oVm);
		} catch (e) {
			if (e.name === "CpcVm") {
				if (!e.hidden) {
					Utils.console.warn(e);
					this.outputError(e, true);
				} else {
					Utils.console.log(e.message);
				}
			} else {
				Utils.console.error(e);
				if (e.lineNumber || e.columnNumber) { // only available on Firefox
					this.selectJsError(this.view.getAreaValue("outputText"), e);
				}
				this.oVm.vmComposeError(e, 2, "JS " + String(e)); // generate Syntax Error, set also err and erl and set stop
				this.outputError(e, true);
			}
		}
	},

	fnDirectInput: function () {
		var oInput = this.oVm.vmGetStopObject().oParas,
			iStream = oInput.iStream,
			sInput = oInput.sInput,
			oVm = this.oVm,
			sInputText, sMsg, oOutput, sOutput, fnScript;

		sInput = sInput.trim();
		oInput.sInput = "";
		if (sInput !== "") {
			this.oVm.cursor(iStream, 0);
			sInputText = this.view.getAreaValue("inputText");
			if ((/^\d+($| )/).test(sInput)) { // start with number?
				if (Utils.debug > 0) {
					Utils.console.debug("fnDirectInput: insert line=" + sInput);
				}
				sInput = this.mergeScripts(sInputText, sInput);
				this.view.setAreaValue("inputText", sInput);

				this.oVm.vmSetStartLine(0); //TTT or invalidateScript?
				this.oVm.vmGotoLine(0); // to be sure
				this.view.setDisabled("continueButton", true);

				this.oVm.cursor(iStream, 1);
				this.updateResultText(); //TTT
				return false; // continue direct input
			}

			Utils.console.log("fnDirectInput: execute:", sInput);

			if (sInputText) { // do we have a program?
				oOutput = this.oCodeGeneratorJs.reset().generate(sInput + "\n" + sInputText, this.oVariables, true); // compile both; allow direct command
				if (oOutput.error) {
					if (oOutput.error.pos >= sInput.length + 1) { // error not in direct?
						oOutput.error.pos -= (sInput.length + 1);
						oOutput.error.message = "[prg] " + oOutput.error.message;
						if (oOutput.error.shortMessage) {
							oOutput.error.shortMessage = "[prg] " + oOutput.error.shortMessage;
						}
						sOutput = this.outputError(oOutput.error, true);
						oOutput = null;
					}
				}
			}

			if (!oOutput) {
				oOutput = this.oCodeGeneratorJs.reset().generate(sInput, this.oVariables, true); // compile direct input only
			}

			if (oOutput.error) {
				sOutput = this.outputError(oOutput.error, true);
			} else {
				sOutput = oOutput.text;
			}

			if (sOutput && sOutput.length > 0) {
				sOutput += "\n";
			}
			this.view.setAreaValue("outputText", sOutput);

			if (!oOutput.error) {
				//oVm.vmSetVariables(this.oVariables);
				this.oVm.vmSetStartLine(this.oVm.iLine); // fast hack
				this.oVm.vmGotoLine("direct");

				try {
					fnScript = new Function("o", sOutput); // eslint-disable-line no-new-func
					this.fnScript = fnScript;
				} catch (e) {
					Utils.console.error(e);
					this.outputError(e, true);
					//oVm.print(iStream, (e.shortMessage || e.message) + "\r\n");
				}
			}

			if (!oOutput.error) {
				this.updateResultText(); //TTT
				return true;
			}
			sMsg = oInput.sMessage;
			this.oVm.print(iStream, sMsg);
			this.oVm.cursor(iStream, 1);
		}
		this.updateResultText(); //TTT
		return false;
	},

	startWithDirectInput: function () {
		var oVm = this.oVm,
			iStream = 0,
			sMsg = "Ready\r\n";

		this.oVm.tagoff(iStream);
		if (this.oVm.pos(iStream) > 1) {
			this.oVm.print(iStream, "\r\n");
		}
		this.oVm.print(iStream, sMsg);
		this.oVm.cursor(iStream, 1, 1);

		oVm.vmStop("direct", 0, true, {
			iStream: iStream,
			sMessage: sMsg,
			// sNoCRLF: true,
			fnInputCallback: this.fnDirectInputHandler,
			sInput: ""
		});
		this.fnWaitInput();
	},

	updateResultText: function () {
		this.view.setAreaValue("resultText", this.oVm.sOut);
		this.view.setAreaScrollTop("resultText"); // scroll to bottom
	},

	exitLoop: function () {
		var oStop = this.oVm.vmGetStopObject(),
			sReason = oStop.sReason;

		this.updateResultText();

		this.view.setDisabled("runButton", sReason === "reset");
		this.view.setDisabled("stopButton", sReason !== "waitInput" && sReason !== "waitKey" && sReason !== "fileLoad" && sReason !== "fileSave");
		this.view.setDisabled("continueButton", sReason === "end" || sReason === "waitInput" || sReason === "waitKey" || sReason === "fileLoad" || sReason === "fileSave" || sReason === "parse" || sReason === "renumLines" || sReason === "reset");

		/*
		if (this.oVariables) {
			this.setVarSelectOptions("varSelect", this.oVariables);
			this.commonEventHandler.onVarSelectChange();
		}
		*/
		this.setVarSelectOptions("varSelect", this.oVariables);
		this.commonEventHandler.onVarSelectChange();

		if (sReason === "stop" || sReason === "end" || sReason === "error" || sReason === "parse" || sReason === "parseRun") {
			this.startWithDirectInput();
		}
	},

	fnBreak: function () {
		// empty
	},

	fnDirect: function () {
		// TTT: break in direct mode?
	},

	fnEnd: function () {
		// empty
	},

	fnError: function () {
		// empty
	},

	fnEscape: function () {
		// empty
	},

	fnWaitFrame: function () {
		this.oVm.vmStop("", 0, true);
		this.iNextLoopTimeOut = this.oVm.vmGetTimeUntilFrame(); // wait until next frame
	},

	fnOnError: function () { //TTT
		this.oVm.vmStop("", 0, true); // continue
	},

	fnStop: function () {
		// empty
	},

	fnTimer: function () {
		this.oVm.vmStop("", 0, true); // continue
	},

	fnRunLoop: function () {
		var oStop = this.oVm.vmGetStopObject(),
			sHandler;

		this.iNextLoopTimeOut = 0;
		if (!oStop.sReason && this.fnScript) {
			this.fnRunPart1(); // could change sReason
		}

		sHandler = "fn" + Utils.stringCapitalize(oStop.sReason);
		if (sHandler in this) {
			// Utils.console.debug("fnRunLoop: calling: ", sHandler);
			this[sHandler](oStop.oParas);
			// Utils.console.debug("fnRunLoop: back from : ", sHandler);
		} else {
			Utils.console.warn("runLoop: Unknown run mode:", oStop.sReason);
			this.oVm.vmStop("error", 55); //TTT
		}

		if (oStop.sReason && oStop.sReason !== "waitSound") {
			this.bTimeoutHandlerActive = false; // not running any more
			this.exitLoop();
		} else {
			setTimeout(this.fnRunLoopHandler, this.iNextLoopTimeOut);
		}
	},

	startMainLoop: function () {
		if (!this.bTimeoutHandlerActive) {
			this.bTimeoutHandlerActive = true;
			this.fnRunLoop();
		}
	},

	setStopObject: function (oStop) {
		Object.assign(this.oSavedStop, oStop);
	},

	getStopObject: function () {
		return this.oSavedStop;
	},


	startParse: function () {
		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("parse", 99);
		this.startMainLoop();
	},

	startRenum: function () {
		var iStream = 0;

		this.oVm.vmStop("renumLines", 99, false, {
			iNew: 10,
			iOld: 1,
			iStep: 10,
			iKeep: 65535 // keep lines
		});

		if (this.oVm.pos(iStream) > 1) {
			this.oVm.print(iStream, "\r\n");
		}
		this.oVm.print(iStream, "renum\r\n");
		this.startMainLoop();
	},

	startRun: function () {
		this.setStopObject(this.oNoStop);

		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("run", 99);
		this.startMainLoop();
	},

	startParseRun: function () {
		this.setStopObject(this.oNoStop);
		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("parseRun", 99);
		this.startMainLoop();
	},

	startBreak: function () {
		var oVm = this.oVm,
			oStop = oVm.vmGetStopObject();

		this.setStopObject(oStop);
		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("break", 80);
		this.startMainLoop();
	},

	startContinue: function () {
		var oVm = this.oVm,
			oStop = oVm.vmGetStopObject(),
			oSavedStop = this.getStopObject();

		this.view.setDisabled("runButton", true);
		this.view.setDisabled("stopButton", false);
		this.view.setDisabled("continueButton", true);
		if (oStop.sReason === "break" || oStop.sReason === "escape" || oStop.sReason === "stop" || oStop.sReason === "direct" || oStop.sReason === "waitInput") {
			if (!oSavedStop.fnInputCallback) { // no keyboard callback? make sure no handler is set (especially for direct->continue)
				this.oKeyboard.setKeyDownHandler(null);
			}
			if (oStop.sReason === "direct" || oStop.sReason === "escape") {
				this.oVm.cursor(oStop.oParas.iStream, 0); // switch it off (for continue button)
			}
			Object.assign(oStop, oSavedStop); // fast hack
			this.setStopObject(this.oNoStop);
		}
		this.startMainLoop();
	},

	startReset: function () {
		this.setStopObject(this.oNoStop);
		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("reset", 99);
		this.startMainLoop();
	},

	startScreenshot: function () {
		var image = this.oCanvas.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); // here is the most important part because if you do not replace you will get a DOM 18 exception.

		return image;
	},

	startEnter: function () {
		var sInput = this.view.getAreaValue("inp2Text"),
			i, oKeyDownHandler;

		sInput = sInput.replace("\n", "\r"); // LF => CR
		if (!Utils.stringEndsWith(sInput, "\r")) {
			sInput += "\r";
		}
		for (i = 0; i < sInput.length; i += 1) {
			this.oKeyboard.putKeyInBuffer(sInput.charAt(i));
		}

		oKeyDownHandler = this.oKeyboard.getKeyDownHandler();
		if (oKeyDownHandler) {
			oKeyDownHandler();
		}
		this.view.setAreaValue("inp2Text", "");
	},

	changeVariable: function () {
		var sPar = this.view.getSelectValue("varSelect"),
			sValue = this.view.getSelectValue("varText"),
			oVariables = this.oVariables,
			sVarType, sType, value, value2;

		/*
			// similar to that function in BasicParser
			fnDetermineStaticVarType = function (sName) {
				var sNameType;

				sNameType = sName.charAt(0); // take first character to determine var type later
				if (sNameType === "_") { // ignore underscore (do not clash with keywords)
					sNameType = sName.charAt(1);
				}

				// explicit type specified?
				if (sName.indexOf("I") >= 0) {
					sNameType += "I";
				} else if (sName.indexOf("R") >= 0) {
					sNameType += "R";
				} else if (sName.indexOf("$") >= 0) {
					sNameType += "$";
				}
				return sNameType;
			};
		*/

		value = oVariables.getVariable(sPar);
		//if (typeof oVariables[sPar] === "function") { // TODO
		if (typeof value === "function") { // TODO
			value = sValue;
			value = new Function("o", value); // eslint-disable-line no-new-func
			//oVariables[sPar] = value;
			oVariables.setVariable(sPar, value);
		} else {
			sVarType = this.oVariables.determineStaticVarType(sPar);
			sType = this.oVm.vmDetermineVarType(sVarType); // do we know dynamic type?

			if (sType !== "$") { // not string? => convert to number
				value = parseFloat(sValue);
			} else {
				value = sValue;
			}

			try {
				//oVariables[sPar] = this.oVm.vmAssign(sVarType, value);
				value2 = this.oVm.vmAssign(sVarType, value);
				oVariables.setVariable(sPar, value2);
				Utils.console.log("Variable", sPar, "changed:", oVariables[sPar], "=>", value);
			} catch (e) {
				Utils.console.warn(e);
			}
		}
		this.setVarSelectOptions("varSelect", oVariables);
		this.commonEventHandler.onVarSelectChange(); // title change?
	},

	setSoundActive: function () {
		var oSound = this.oSound,
			soundButton = document.getElementById("soundButton"),
			bActive = this.model.getProperty("sound"),
			sText = "",
			oStop;

		if (bActive) {
			try {
				oSound.soundOn();
				sText = (oSound.isActivatedByUser()) ? "Sound is on" : "Sound on (waiting)";
			} catch (e) {
				Utils.console.warn("soundOn:", e);
				sText = "Sound unavailable";
			}
		} else {
			oSound.soundOff();
			sText = "Sound is off";
			oStop = this.oVm && this.oVm.vmGetStopObject();
			if (oStop && oStop.sReason === "waitSound") {
				this.oVm.vmStop("", 0, true); //TTT do not wait
			}
		}
		soundButton.innerText = sText;
	},

	// https://stackoverflow.com/questions/10261989/html5-javascript-drag-and-drop-file-from-external-window-windows-explorer
	// https://www.w3.org/TR/file-upload/#dfn-filereader
	fnHandleFileSelect: function (event) {
		var aFiles = event.dataTransfer ? event.dataTransfer.files : event.target.files, // dataTransfer for drag&drop, target.files for file input
			iFile = 0,
			oStorage = Utils.localStorage,
			that = this,
			oRegExpIsText = new RegExp(/^\d+ |^[\t\r\n\x20-\x7e]*$/), // starting with (line) number, or 7 bit ASCII characters without control codes
			aImported = [],
			f, oReader;


		function fnReadNextFile() {
			var iStream = 0,
				sText;

			if (iFile < aFiles.length) {
				f = aFiles[iFile];
				iFile += 1;
				sText = escape(f.name) + " " + (f.type || "n/a") + " " + f.size + " " + (f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : "n/a");
				Utils.console.log(sText);
				if (f.type === "text/plain") {
					oReader.readAsText(f);
				} else if (f.type === "application/x-zip-compressed") { //TODO
					oReader.readAsArrayBuffer(f);
				} else {
					oReader.readAsDataURL(f);
				}
			} else {
				that.oVm.print(iStream, (aImported.length ? aImported.join(", ") : "No files") + " imported.\r\n");
			}
		}

		function fnErrorHandler(evt) {
			switch (evt.target.error.code) {
			case evt.target.error.NOT_FOUND_ERR:
				Utils.console.warn("File Not Found!");
				break;
			case evt.target.error.NOT_READABLE_ERR:
				Utils.console.warn("File is not readable");
				break;
			case evt.target.error.ABORT_ERR:
				break; // nothing
			default:
				Utils.console.warn("An error occurred reading this file.");
			}
			fnReadNextFile();
		}

		function fnLoad2(sData, sName, sType) {
			var //sData = evt.target.result,
				//sName = escape(f.name),
				sStorageName, sMeta, iIndex, sDecodedData, iLength, oHeader;

			sName = that.oVm.vmAdaptFilename(sName, "FILE");
			sStorageName = that.fnLocalStorageName(sName);

			if (sType === "text/plain") {
				sMeta = "A,0," + sData.length;
			} else {
				if (sType === "application/x-zip-compressed") {
					sDecodedData = sData; // already decoded
					sData = Utils.btoa(sData); // encode data
				} else {
					iIndex = sData.indexOf(",");
					sData = iIndex >= 0 ? sData.substr(iIndex + 1) : ""; // remove meta prefix
					sDecodedData = Utils.atob(sData);
				}
				iLength = sDecodedData.length; // or use: f.size

				oHeader = that.parseAmsdosHeader(sDecodedData);
				if (oHeader) {
					sMeta = oHeader.sType + "," + oHeader.iStart + "," + oHeader.iLength + "," + oHeader.iEntry;
					sData = sDecodedData.substr(0x80); // remove header
					if (oHeader.sType !== "A") {
						sData = Utils.btoa(sData); // encode data without header
					}
				} else if (oRegExpIsText.test(sDecodedData)) {
					sMeta = "A,0," + iLength;
					sData = sDecodedData;
				} else {
					sMeta = "B,0," + iLength; // byte length (not base64 encoded)
				}
			}

			oStorage.setItem(sStorageName, sMeta + ";" + sData);
			Utils.console.log("fnOnLoad: file: " + sStorageName + " meta: " + sMeta + " imported");
			aImported.push(sStorageName);

			//fnReadNextFile();
		}

		function fnOnLoad(evt) {
			var sData = evt.target.result,
				sName = escape(f.name),
				sType = f.type,
				oZip, aEntries, i;

			if (sType === "application/x-zip-compressed") {
				try {
					oZip = new ZipFile(new Uint8Array(sData), sName); // rather aData
				} catch (e) {
					Utils.console.error(e);
					that.outputError(e, true);
				}
				if (oZip) {
					aEntries = Object.keys(oZip.oEntryTable);
					for (i = 0; i < aEntries.length; i += 1) {
						sName = aEntries[i];
						try {
							sData = oZip.oEntryTable[sName].read("utf"); // or: "raw"
						} catch (e) {
							Utils.console.error(e);
							that.outputError(e, true);
							sData = null;
						}
						if (sData) {
							//sType = "";
							fnLoad2(sData, sName, sType);
						}
					}
				}
			} else {
				fnLoad2(sData, sName, sType);
			}

			fnReadNextFile();
		}

		/*
		function fnOnLoad(evt) {
			var sData = evt.target.result,
				sName = escape(f.name),
				sStorageName, sMeta, iIndex, sDecodedData, iLength, oHeader;

			sName = that.oVm.vmAdaptFilename(sName, "FILE");
			sStorageName = that.fnLocalStorageName(sName);

			if (f.type === "text/plain") {
				sMeta = "A,0," + sData.length;
			} else if (f.type === "application/x-zip-compressed") { //TODO
				var zip = new ZipFile(new Uint8Array(sData)); // rather aData
				var aEntries = Object.keys(zip.entryTable);
				var data1 = zip.entryTable[aEntries[0]].read("raw");
				data1 = data1;
			} else {
				iIndex = sData.indexOf(",");
				sData = iIndex >= 0 ? sData.substr(iIndex + 1) : ""; // remove meta prefix

				sDecodedData = Utils.atob(sData);
				iLength = sDecodedData.length; // or use: f.size

				oHeader = that.parseAmsdosHeader(sDecodedData);
				if (oHeader) {
					sMeta = oHeader.sType + "," + oHeader.iStart + "," + oHeader.iLength + "," + oHeader.iEntry;
					sData = sDecodedData.substr(0x80); // remove header
					if (oHeader.sType !== "A") {
						sData = Utils.btoa(sData); // encode data without header
					}
				} else if (oRegExpIsText.test(sDecodedData)) {
					sMeta = "A,0," + iLength;
					sData = sDecodedData;
				} else {
					sMeta = "B,0," + iLength; // byte length (not base64 encoded)
				}
			}

			oStorage.setItem(sStorageName, sMeta + ";" + sData);
			Utils.console.log("fnOnLoad: file: " + sStorageName + " meta: " + sMeta + " imported");
			aImported.push(sStorageName);
			//that.oVm.print(iStream, sStorageName + " imported\r\n");

			fnReadNextFile();
		}
		*/

		event.stopPropagation();
		event.preventDefault();

		oReader = new FileReader();
		oReader.onerror = fnErrorHandler;
		oReader.onload = fnOnLoad;

		fnReadNextFile();
	},

	fnHandleDragOver: function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
	},

	initDropZone: function () {
		var dropZone = document.getElementById("dropZone");

		dropZone.addEventListener("dragover", this.fnHandleDragOver.bind(this), false);
		dropZone.addEventListener("drop", this.fnHandleFileSelect.bind(this), false);

		this.oCanvas.canvas.addEventListener("dragover", this.fnHandleDragOver.bind(this), false); //TTT fast hack
		this.oCanvas.canvas.addEventListener("drop", this.fnHandleFileSelect.bind(this), false);

		document.getElementById("fileInput").addEventListener("change", this.fnHandleFileSelect.bind(this), false);
	}
};
