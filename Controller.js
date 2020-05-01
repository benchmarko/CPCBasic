/* eslint-disable spaced-comment */
// Controller.js - Controller
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
/* globals CommonEventHandler cpcBasicCharset  */

"use strict";

var Utils, BasicFormatter, BasicLexer, BasicParser, Canvas, CodeGeneratorJs, CpcVm, Keyboard, Sound;

if (typeof require !== "undefined") {
	/* eslint-disable global-require */
	Utils = require("./Utils.js");
	BasicFormatter = require("./BasicFormatter.js");
	BasicLexer = require("./BasicLexer.js");
	BasicParser = require("./BasicParser.js");
	Canvas = require("./Canvas.js");
	CodeGeneratorJs = require("./CodeGeneratorJs.js");
	CpcVm = require("./CpcVm.js");
	Keyboard = require("./Keyboard.js");
	Sound = require("./Sound.js");
	/* eslint-enable global-require */
}

function Controller(oModel, oView) {
	this.init(oModel, oView);
}

Controller.prototype = {
	init: function (oModel, oView) {
		var sExample, sKbdLayout;

		this.fnRunLoopHandler = this.fnRunLoop.bind(this);
		this.fnWaitForKeyHandler = this.fnWaitForKey.bind(this);
		this.fnWaitForInputHandler = this.fnWaitForInput.bind(this);
		this.fnEscapeHandler = this.fnEscape.bind(this);
		this.fnDirectInputHandler = this.fnDirectInput.bind(this);

		this.oCodeGeneratorJs = null;

		this.fnScript = null;

		this.bTimeoutHandlerActive = false;

		this.oSavedStop = {}; // backup of stop object

		this.oVariables = {};

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
			fnEscapeHandler: this.fnEscapeHandler
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
			tron: oModel.getProperty("tron")
		});
		this.oVm.vmReset();
		this.oNoStop = Object.assign({}, this.oVm.vmGetStopObject());

		this.fnInitDatabases();
		if (oModel.getProperty("sound")) { // activate sound needs user action
			this.fnSetSoundActive(); // activate in waiting state
		}
		if (oModel.getProperty("showCpc")) {
			this.oCanvas.startUpdateCanvas();
		}
	},

	fnInitDatabases: function () {
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

		this.fnSetDatabaseSelectOptions();
		this.commonEventHandler.onDatabaseSelectChange();
	},

	onUserAction: function (/* event, sId */) {
		this.commonEventHandler.fnDeactivateUserAction();
		this.oSound.setActivatedByUser(true);
		this.fnSetSoundActive();
	},

	// Also called from index file 0index.js
	fnAddIndex: function (sDir, input) { // optional sDir
		var sInput, aIndex, i;

		sInput = input.trim();
		aIndex = JSON.parse(sInput);
		for (i = 0; i < aIndex.length; i += 1) {
			aIndex[i].dir = sDir;
			this.model.setExample(aIndex[i]);
		}
	},

	// Also called from example files xxxxx.js
	fnAddItem: function (sKey, input) { // optional sKey
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
			Utils.console.log("fnAddItem: Creating new example:", sKey);
		}
		oExample.key = sKey; // maybe changed
		oExample.script = sInput;
		oExample.loaded = true;
		Utils.console.log("fnAddItem:", sKey);
		return sKey;
	},

	fnSetDatabaseSelectOptions: function () {
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

	fnSetExampleSelectOptions: function () {
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

	fnSetVarSelectOptions: function (sSelect, oVariables) {
		var iMaxVarLength = 35,
			aItems = [],
			oItem, sKey, sValue, sTitle, sStrippedTitle,
			fnSortByString = function (a, b) {
				var x = a.value,
					y = b.value;

				if (x < y) {
					return -1;
				} else if (x > y) {
					return 1;
				}
				return 0;
			};

		for (sKey in oVariables) {
			if (oVariables.hasOwnProperty(sKey)) {
				sValue = oVariables[sKey];
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
		}
		aItems = aItems.sort(fnSortByString);
		this.view.setSelectOptions(sSelect, aItems);
	},

	fnInvalidateScript: function () {
		this.fnScript = null;
	},

	fnWaitForContinue: function () {
		var iStream = 0,
			sKey;

		sKey = this.oKeyboard.getKeyFromBuffer();

		if (sKey !== "") {
			this.oVm.cursor(iStream, 0);
			this.oKeyboard.setKeyDownHandler(null);
			this.fnContinue();
		}
	},

	fnEscape: function () {
		var oStop = this.oVm.vmGetStopObject(),
			iStream = 0,
			sMsg;

		if (oStop.sReason === "direct") {
			oStop.oParas.sInput = "";
			sMsg = "*Break*\r\n";
			this.oVm.print(iStream, sMsg);
		} else if (oStop.sReason !== "escape") { // first escape?
			this.oVm.cursor(iStream, 1);
			this.oKeyboard.setKeyDownHandler(this.fnWaitForContinue.bind(this));
			this.oVm.vmStop("escape", 85, false, {
				iStream: iStream
			});
		} else { // second escape
			this.oKeyboard.setKeyDownHandler(null);
			this.oVm.cursor(iStream, 0);
			this.oVm.vmStop("stop", 0, true); // stop

			sMsg = "Break in " + this.oVm.iLine + "\r\n";
			this.oVm.print(iStream, sMsg);
		}

		this.startMainLoop();
	},

	fnWaitForKey: function () {
		var sKey;

		this.oKeyboard.setKeyDownHandler(null);
		sKey = this.oKeyboard.getKeyFromBuffer();
		this.oVm.vmStop("", 0, true);
		Utils.console.log("Wait for key:", sKey);
		this.startMainLoop();
	},

	fnWaitForInput: function () { // eslint-disable-line complexity
		var oStop = this.oVm.vmGetStopObject(),
			oInput = oStop.oParas,
			iStream = oInput.iStream,
			sInput = oInput.sInput,
			bInputOk = true,
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
			Utils.console.log("fnWaitForInput:", sInput);
			if (!oInput.sNoCRLF) {
				this.oVm.print(iStream, "\r\n");
			}
			if (oInput.fnInputCallback) {
				bInputOk = oInput.fnInputCallback();
			}
			if (bInputOk) {
				this.oKeyboard.setKeyDownHandler(null);
				this.fnContinue();
			}
		}
	},

	fnWaitForSound: function () {
		var aSoundData;

		this.oVm.vmLoopCondition(); // update iNextFrameTime, timers, inks; schedule sound: free queue
		if (!this.oSound.isActivatedByUser()) { // not yet activated?
			return;
		}

		aSoundData = this.oVm.vmGetSoundData();
		while (aSoundData.length && this.oSound.testCanQueue(aSoundData[0].iState)) {
			this.oSound.sound(aSoundData.shift());
		}
		if (!aSoundData.length) {
			this.oVm.vmStop("", 0, true); // no more wait
		}
	},

	// merge two scripts with sorted line numbers, lines from script2 overwrite lines from script1
	fnMergeScripts: function (sScript1, sScript2) {
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
		return aResult.join("\n");
	},

	// get line range from a script with sorted line numbers
	fnGetLineRange: function (sScript, iFirstLine, iLastLine) {
		var aLines = sScript ? sScript.split("\n") : [];

		while (aLines.length && parseInt(aLines[0], 10) < iFirstLine) {
			aLines.shift();
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

		if (oStorage) {
			if (sMask) {
				//iDotIndex
				sMask = sMask.replace(/([.+^$[\]\\(){}|-])/g, "\\$1");
				sMask = sMask.replace(/\?/g, ".");
				sMask = sMask.replace(/\*/g, ".*");
				oRegExp = new RegExp("^" + sMask + "$");
			}

			for (i = 0; i < oStorage.length; i += 1) {
				sKey = oStorage.key(i);
				//if (Utils.stringEndsWith(sKey, "_D")) {
				//sKey = sKey.substr(0, sKey.length - 2); // remove last 2 characters "_D"
				if (!oRegExp || oRegExp.test(sKey)) {
					aDir.push(sKey);
				}
				//}
			}
		}
		/*
		if (oStorage) {
			this.print(iStream, "\r\n");
			for (i = 0; i < oStorage.length; i += 1) {
				sKey = oStorage.key(i);
				if (Utils.stringEndsWith(sKey, "_D")) {
					sKey = sKey.substr(0, sKey.length - 2); // remove last 2 characters "_D"
					aParts = sKey.split(".");
					sKey = aParts[0].padStart(8, " ") + "." + (aParts[1] || "").padStart(3, " ") + "   ";
					this.print(iStream, sKey);
				}
			}
		}
		*/
		return aDir;
	},

	fnFileCat: function (oParas) {
		var iStream = oParas.iStream,
			aDir = this.fnGetDirectoryEntries(),
			i, sKey;

		this.oVm.print(iStream, "\r\n");
		// TODO: sort
		for (i = 0; i < aDir.length; i += 1) {
			sKey = aDir[i];
			sKey = sKey.padStart(12, " ") + "   ";
			this.oVm.print(iStream, sKey);
		}
		this.oVm.print(iStream, "\r\n");
		this.oVm.vmStop("", 0, true);
	},

	fnFileDir: function (oParas) {
		var iStream = oParas.iStream,
			sFileMask = oParas.sFileMask,
			aDir, i, sKey;

		if (sFileMask) {
			sFileMask =	this.fnLocalStorageName(sFileMask);
		}
		aDir = this.fnGetDirectoryEntries(sFileMask);
		this.oVm.print(iStream, "\r\n");
		for (i = 0; i < aDir.length; i += 1) {
			sKey = aDir[i];
			sKey = sKey.padStart(12, " ") + "   ";
			this.oVm.print(iStream, sKey);
		}
		this.oVm.print(iStream, "\r\n");
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
			sName = aDir[i]; //this.fnLocalStorageName(aDir[i]);
			if (oStorage) {
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

		if (oStorage) {
			sItem = oStorage.getItem(sOld);
			if (sItem !== null) {
				oStorage.setItem(sNew, sItem);
				oStorage.removeItem(sOld);
			} else {
				this.oVm.print(iStream, sOld + " not found\r\n");
			}
		}
		this.oVm.vmStop("", 0, true);
	},

	fnLoadContinue: function (sInput, sMeta) {
		var oInFile = this.oVm.vmGetInFileObject(),
			sCommand = oInFile.sCommand,
			iStartLine = 0;

		this.oVm.vmStop("", 0, true);
		if (oInFile.fnFileCallback) {
			try {
				oInFile.fnFileCallback(sInput, sMeta);
			} catch (e) {
				Utils.console.warn(e);
			}
		}
		if (sInput) {
			switch (sCommand) {
			case "openin":
				break;
			case "chainMerge":
				sInput = this.fnMergeScripts(this.view.getAreaValue("inputText"), sInput);
				this.view.setAreaValue("inputText", sInput);
				this.view.setAreaValue("resultText", "");
				iStartLine = oInFile.iLine || 0;
				this.fnParseRun2();
				break;
			case "load":
				if (!Utils.stringStartsWith(sMeta || "", "B")) { // not for binary files
					this.view.setAreaValue("inputText", sInput);
					this.view.setAreaValue("resultText", "");
					this.fnInvalidateScript();
					this.oVm.vmStop("end", 90);
				}
				break;
			case "merge":
				sInput = this.fnMergeScripts(this.view.getAreaValue("inputText"), sInput);
				this.view.setAreaValue("inputText", sInput);
				this.view.setAreaValue("resultText", "");
				this.fnInvalidateScript();
				this.oVm.vmStop("end", 90);
				break;
			case "chain": // run through...
			case "run":
				this.view.setAreaValue("inputText", sInput);
				this.view.setAreaValue("resultText", "");
				iStartLine = oInFile.iLine || 0;
				this.fnReset2();
				this.fnParseRun2();
				break;
			default:
				Utils.console.error("fnLoadFile: Unknown command:", sCommand);
				break;
			}
			this.oVm.vmSetStartLine(iStartLine);
		} else {
			this.oVm.vmStop("stop", 60);
		}
		this.startMainLoop();
	},

	fnLoadFile: function () {
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
				that.fnLoadContinue(sInput);
			},
			fnExampleError = function () {
				var oVm = that.oVm,
					iStream = 0,
					oError;

				Utils.console.log("Example", sUrl, "error");
				that.model.setProperty("example", oInFile.sMemorizedExample);
				oError = oVm.vmSetError(32, sExample + " not found"); // TODO: set also derr=146 (xx not found)
				oVm.print(iStream, String(oError) + "\r\n");
				that.fnLoadContinue(null);
			};

		sName = oInFile.sName;
		sKey = this.model.getProperty("example");
		oInFile.sMemorizedExample = sKey;
		iLastSlash = sKey.lastIndexOf("/");
		if (iLastSlash >= 0) {
			sPath = sKey.substr(0, iLastSlash); // take path from selected example
			sName = sPath + "/" + sName;
			sName = sName.replace(/\w+\/\.\.\//, ""); // simplify 2 dots (go back) in path: "dir/.."" => ""
		}
		sExample = sName;

		if (Utils.debug > 0) {
			Utils.console.debug("DEBUG: fnLoadFile: sName=" + sName + " (current=" + sKey + ")");
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
			Utils.console.warn("fnLoadFile: Unknown file:", sExample);
			fnExampleError(); //TTT
		}
	},

	fnLocalStorageName: function (sName) {
		// modify name so we do not clash with localstorage methods/properites
		if (sName.indexOf(".") < 0) { // no dot inside name?
			sName += "."; // append dot
		}
		//return sName + (bMeta ? "_M" : "_D"); // modify name to not clash with localstorage methods/properites
		return sName;
	},

	fnWaitForFile: function () {
		var oInFile = this.oVm.vmGetInFileObject(),
			oStorage = Utils.localStorage,
			sName, sStorageName, sInput, iIndex, sMeta;

		if (!oInFile.bOpen) {
			Utils.console.error("fnWaitForFile: File not open!");
			return;
		}

		sName = oInFile.sName;
		sStorageName = this.fnLocalStorageName(sName);

		//oInFile.sState = "loading";
		if (oStorage && (oStorage.getItem(sStorageName) !== null)) {
			if (Utils.debug > 0) {
				Utils.console.debug("fnWaitForFile: sName=" + sName + ": get from localStorage");
			}
			sInput = oStorage.getItem(sStorageName);
			//sMeta = oStorage.getItem(this.fnLocalStorageName(sName, true));
			iIndex = sInput.indexOf(";"); // metadata separator
			if (iIndex >= 0) {
				sMeta = sInput.substr(0, iIndex);
				sInput = sInput.substr(iIndex + 1);
			}
			this.fnLoadContinue(sInput, sMeta || "");
			//oInFile.sState = "loaded";
		} else { // load from example
			this.fnLoadFile(sName);
		}
	},

	fnSaveFile: function () {
		var oOutFile = this.oVm.vmGetOutFileObject(),
			oStorage = Utils.localStorage,
			sName, sStorageName, sFileData;

		if (!oOutFile.bOpen) {
			Utils.console.error("fnSaveFile: file not open!");
			return;
		}

		sName = oOutFile.sName;
		//oOutFile.sState = "saving"; // not really needed
		if (oStorage) {
			sStorageName = this.fnLocalStorageName(sName);
			sFileData = oOutFile.aFileData.join("");
			if (Utils.debug > 0) {
				Utils.console.debug("DEBUG: fnSaveFile: sName=" + sName + ": put into localStorage");
			}
			if (sFileData === "") {
				if (oOutFile.sType === "A" || oOutFile.sType === "P" || oOutFile.sType === "T") {
					sFileData = this.view.getAreaValue("inputText");
				}
			}

			if (oOutFile.fnFileCallback) {
				try {
					oOutFile.fnFileCallback(sFileData); // close file
				} catch (e) {
					Utils.console.warn(e);
				}
			}
			oStorage.setItem(sStorageName, (oOutFile.sType || "") + ";" + sFileData);
			//oStorage.setItem(this.fnLocalStorageName(sName, true), oOutFile.sType || "");
		}
		this.oVm.vmResetFileHandling(oOutFile); //TTT make sure it is closed
	},

	fnDelete: function (oParas) {
		var sInputText = this.view.getAreaValue("inputText"),
			aLines = this.fnGetLineRange(sInputText, oParas.iFirst, oParas.iLast),
			i, sInput;

		if (aLines.length) {
			for (i = 0; i < aLines.length; i += 1) {
				aLines[i] = parseInt(aLines[i], 10); // keep just the line numbers
			}
			sInput = aLines.join("\n");

			sInput = this.fnMergeScripts(sInputText, sInput); // delete sInput lines
			this.view.setAreaValue("inputText", sInput);
		}

		this.oVm.vmGotoLine(0); // reset current line
		this.oVm.vmStop("end", 0, true);
	},

	fnList: function (oParas) {
		var sInput = this.view.getAreaValue("inputText"),
			iStream = oParas.iStream,
			aLines = this.fnGetLineRange(sInput, oParas.iFirst, oParas.iLast),
			i;

		for (i = 0; i < aLines.length; i += 1) {
			this.oVm.print(iStream, aLines[i] + "\r\n");
		}

		this.oVm.vmGotoLine(0); // reset current line
		this.oVm.vmStop("end", 0, true);
	},

	fnReset2: function () {
		var oVm = this.oVm;

		this.oVariables = {};
		oVm.vmResetVariables();
		oVm.vmReset();
		//oVm.vmStop("reset", 0); // keep reset, but with priority 0, so that "compile only" still works
		oVm.vmStop("end", 0, true); // set "end" with priority 0, so that "compile only" still works
		oVm.sOut = "";
		this.view.setAreaValue("outputText", "");
		this.fnInvalidateScript();
	},

	fnRenum2: function (oParas) {
		var oVm = this.oVm,
			sInput = this.view.getAreaValue("inputText"),
			iStream = 0,
			oOutput, oError, iEndPos, sOutput;

		if (!this.oBasicFormatter) {
			this.oBasicFormatter = new BasicFormatter({
				lexer: new BasicLexer(),
				parser: new BasicParser()
			});
		}

		this.oBasicFormatter.reset();
		oOutput = this.oBasicFormatter.renumber(sInput, oParas.iNew, oParas.iOld, oParas.iStep, oParas.iKeep);

		if (oOutput.error) {
			oError = oOutput.error;
			iEndPos = oError.pos + ((oError.value !== undefined) ? String(oError.value).length : 0);
			this.view.setAreaSelection("inputText", oError.pos, iEndPos);
			sOutput = oError.message + ": '" + oError.value + "' (pos " + oError.pos + "-" + iEndPos + ")";
			Utils.console.warn(sOutput);
			this.oVm.print(iStream, sOutput + "\r\n"); // Error
		} else {
			sOutput = oOutput.text;
			this.view.setAreaValue("inputText", sOutput);
		}
		this.oVm.vmGotoLine(0); // reset current line
		oVm.vmStop("end", 0, true);
		return oOutput;
	},

	fnEditCallback: function () {
		var oInput = this.oVm.vmGetStopObject().oParas,
			sInput = oInput.sInput,
			sInputText = this.view.getAreaValue("inputText");

		sInput = this.fnMergeScripts(sInputText, sInput);
		this.view.setAreaValue("inputText", sInput);
		this.oVm.vmSetStartLine(0); //TTT or fnInvalidateScript?
		this.oVm.vmGotoLine(0); // to be sure
		this.view.setDisabled("continueButton", true);
		this.oVm.cursor(oInput.iStream, 0);
		this.oVm.vmStop("end", 90);
		return true;
	},

	fnEdit: function (iLine) {
		var sInput = this.view.getAreaValue("inputText"),
			aLines = this.fnGetLineRange(sInput, iLine, iLine),
			oStop = this.oVm.vmGetStopObject(),
			iStream = oStop.oParas.iStream,
			sLine, oError;

		if (aLines.length) {
			sLine = aLines[0];
			this.oVm.print(iStream, sLine);
			this.oVm.cursor(iStream, 1);
			this.oVm.vmStop("input", 45, true, { //TTT set new
				iStream: iStream,
				sMessage: "",
				fnInputCallback: this.fnEditCallback.bind(this),
				sInput: sLine
			});
			this.oKeyboard.setKeyDownHandler(this.fnWaitForInputHandler);
			this.fnWaitForInput();
		} else {
			oError = this.oVm.vmSetError(8, iLine); // "Line does not exist"
			this.oVm.print(iStream, String(oError) + "\r\n");
			this.oVm.vmStop("stop", 60, true); //TTT
		}
	},

	fnParse2: function () {
		var sInput = this.view.getAreaValue("inputText"),
			iBench = this.model.getProperty("bench"),
			iStream = 0,
			i, iTime, oOutput, oError, iEndPos, sOutput;

		if (!this.oCodeGeneratorJs) {
			this.oCodeGeneratorJs = new CodeGeneratorJs({
				lexer: new BasicLexer(),
				parser: new BasicParser(),
				tron: this.model.getProperty("tron"),
				rsx: this.oVm.rsx // just to check the names
			});
		}

		this.oVariables = {};
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
			oError = oOutput.error;
			iEndPos = oError.pos + ((oError.value !== undefined) ? String(oError.value).length : 0);
			this.view.setAreaSelection("inputText", oError.pos, iEndPos);
			sOutput = oError.message + ": '" + oError.value + "' (pos " + oError.pos + "-" + iEndPos + ")";
			oError.message = sOutput; // modifies message object
			this.oVm.print(iStream, sOutput + "\r\n");
		} else {
			sOutput = oOutput.text;
		}
		if (sOutput && sOutput.length > 0) {
			sOutput += "\n";
		}
		this.view.setAreaValue("outputText", sOutput);

		this.fnInvalidateScript();
		this.fnSetVarSelectOptions("varSelect", this.oVariables);
		this.commonEventHandler.onVarSelectChange();
		return oOutput;
	},

	fnRun2: function (iLine) {
		var sScript = this.view.getAreaValue("outputText"),
			iStream = 0,
			oVm = this.oVm;

		iLine = iLine || 0;

		if (this.oVm.vmGetOutFileObject().bOpen) { //TTT
			this.fnSaveFile(); //TTT
		}

		if (!this.fnScript) {
			oVm.vmSetVariables(this.oVariables);
			oVm.clear(); // init variables
			try {
				this.fnScript = new Function("o", sScript); // eslint-disable-line no-new-func
			} catch (e) {
				Utils.console.error(e);
				oVm.print(iStream, String(e) + "\r\n");
				this.fnScript = null;
			}
		} else {
			oVm.clear(); // we do a clear as well here //TTT
		}
		oVm.vmReset4Run();

		if (this.fnScript) {
			oVm.sOut = this.view.getAreaValue("resultText");
			oVm.vmStop("", 0, true);
			//TTT oVm.iLine = iLine; //TTT
			oVm.vmGotoLine(0); //TTT to load DATA lines
			this.oVm.vmSetStartLine(iLine); // clear resets also startline

			this.view.setDisabled("runButton", true);
			this.view.setDisabled("stopButton", false);
			this.view.setDisabled("continueButton", true);
		}
		if (Utils.debug > 1) {
			Utils.console.debug("End of fnRun2");
		}
	},

	fnParseRun2: function () {
		var oOutput = this.fnParse2();

		if (!oOutput.error) {
			this.fnRun2();
		}
	},

	fnRunPart1: function () {
		var oVm = this.oVm,
			iStream = 0,
			oError;

		try {
			this.fnScript(oVm);
		} catch (e) {
			if (e instanceof CpcVm.ErrorObject) {
				if (!e.hidden) {
					oVm.print(iStream, String(e) + "\r\n");
					Utils.console.warn(e);
				} else {
					Utils.console.log(e);
				}
			} else {
				oError = oVm.vmSetError(2, String(e)); // Syntax Error
				oVm.print(iStream, String(oError) + "\r\n");
				Utils.console.error(e);
			}
		}
	},

	fnDirectInput: function () {
		var oInput = this.oVm.vmGetStopObject().oParas,
			iStream = oInput.iStream,
			sInput = oInput.sInput,
			oVm = this.oVm,
			sInputText, sMsg, oOutput, oError, sOutput, fnScript;

		this.oVm.cursor(iStream, 0);
		sInput = sInput.trim();
		if (sInput !== "") {
			oInput.sInput = "";
			sInputText = this.view.getAreaValue("inputText");
			if ((/^(\d)+/).test(sInput)) { // start with number?
				if (Utils.debug > 0) {
					Utils.console.debug("fnDirectInput: insert line=" + sInput);
				}
				sInput = this.fnMergeScripts(sInputText, sInput);
				this.view.setAreaValue("inputText", sInput);

				this.oVm.vmSetStartLine(0); //TTT or fnInvalidateScript?
				this.oVm.vmGotoLine(0); // to be sure
				this.view.setDisabled("continueButton", true);

				this.oVm.cursor(iStream, 1);
				return false; // continue direct input
			}

			Utils.console.log("fnDirectInput: execute:", sInput);

			// see: fnParse2()

			if (sInputText) { // do we have a program?
				this.oCodeGeneratorJs.reset();
				oOutput = this.oCodeGeneratorJs.generate(sInput + "\n" + sInputText, this.oVariables, true); // compile both; allow direct command
			}
			if (!oOutput || oOutput.error) {
				this.oCodeGeneratorJs.reset();
				oOutput = this.oCodeGeneratorJs.generate(sInput, this.oVariables, true); // compile direct input only
			}

			if (oOutput.error) {
				oError = oOutput.error;
				sOutput = oError.message + ": '" + oError.value + "' (pos " + oError.pos + ")";
				oError.message = sOutput;
				this.oVm.print(iStream, sOutput + "\r\n");
			} else {
				sOutput = oOutput.text;
			}

			if (sOutput && sOutput.length > 0) {
				sOutput += "\n";
			}
			this.view.setAreaValue("outputText", sOutput);

			if (!oOutput.error) {
				oVm.vmSetVariables(this.oVariables);
				this.oVm.vmSetStartLine(this.oVm.iLine); // fast hack
				this.oVm.vmGotoLine("direct");

				try {
					fnScript = new Function("o", sOutput); // eslint-disable-line no-new-func
					this.fnScript = fnScript;
				} catch (e) {
					Utils.console.error(e);
					oVm.print(iStream, String(e) + "\r\n");
				}
			}

			if (!oOutput.error) {
				return true;
			}
			sMsg = oInput.sMessage;
		} else {
			sMsg = "";
		}
		if (sMsg) {
			this.oVm.print(iStream, sMsg);
		}
		this.oVm.cursor(iStream, 1);
		return false;
	},

	fnStartDirectInput: function () {
		var oVm = this.oVm,
			iStream = 0,
			sMsg = "Ready\r\n";

		this.oVm.tagoff(iStream);
		if (this.oVm.pos(iStream) > 1) {
			this.oVm.print(iStream, "\r\n");
		}
		this.oVm.print(iStream, sMsg);
		this.oVm.cursor(iStream, 1);

		oVm.vmStop("direct", 0, true, {
			iStream: iStream,
			sMessage: sMsg,
			// sNoCRLF: true,
			fnInputCallback: this.fnDirectInputHandler,
			sInput: ""
		});
		this.oKeyboard.setKeyDownHandler(this.fnWaitForInputHandler);
		this.fnWaitForInput();
	},

	fnExitLoop: function () {
		var oVm = this.oVm,
			oStop = oVm.vmGetStopObject(),
			sReason = oStop.sReason;

		this.view.setAreaValue("resultText", oVm.sOut);
		this.view.setAreaScrollTop("resultText"); // scroll to bottom

		this.view.setDisabled("runButton", sReason === "reset");
		this.view.setDisabled("stopButton", sReason !== "input" && sReason !== "waitKey" && sReason !== "loadFile" && sReason !== "saveFile");
		this.view.setDisabled("continueButton", sReason === "end" || sReason === "input" || sReason === "waitKey" || sReason === "loadFile" || sReason === "saveFile" || sReason === "parse" || sReason === "renum" || sReason === "reset");
		if (this.oVariables) {
			this.fnSetVarSelectOptions("varSelect", this.oVariables);
			this.commonEventHandler.onVarSelectChange();
		}
		this.bTimeoutHandlerActive = false; // not running any more

		if (sReason === "stop" || sReason === "end" || sReason === "error" || sReason === "parse" || sReason === "parseRun") {
			this.fnStartDirectInput();
		}
	},

	fnRunLoop: function () { // eslint-disable-line complexity
		var oVm = this.oVm,
			oStop = oVm.vmGetStopObject(),
			iTimeOut = 0;

		if (!oStop.sReason && this.fnScript) {
			this.fnRunPart1(); // could change sReason
		}

		switch (oStop.sReason) {
		case "":
			break;

		case "break":
			break;

		case "delete":
			this.fnDelete(oStop.oParas);
			break;

		case "edit":
			this.fnEdit(oStop.oParas.iLine);
			break;

		case "end":
			break;

		case "error":
			break;

		case "escape":
			if (!oVm.vmEscape()) {
				oVm.vmStop("", 0, true); // continue
			}
			break;

		case "fileCat":
			this.fnFileCat(oStop.oParas);
			break;

		case "fileDir":
			this.fnFileDir(oStop.oParas);
			break;

		case "fileEra":
			this.fnFileEra(oStop.oParas);
			break;

		case "fileRen":
			this.fnFileRen(oStop.oParas);
			break;

		case "frame":
			oVm.vmStop("", 0, true);
			iTimeOut = oVm.vmGetTimeUntilFrame(); // wait until next frame
			break;

		case "input":
			this.oKeyboard.setKeyDownHandler(this.fnWaitForInputHandler);
			this.fnWaitForInput();
			break;

		case "list":
			this.fnList(oStop.oParas);
			break;

		case "waitKey":
			this.oKeyboard.setKeyDownHandler(this.fnWaitForKeyHandler); // wait until keypress handler (for call &bb18)
			break;

		case "loadFile":
			this.fnWaitForFile();
			iTimeOut = oVm.vmGetTimeUntilFrame(); // wait until next frame
			break;

		case "onError":
			oVm.vmStop("", 0, true); // continue
			break;

		case "parse":
			this.fnParse2();
			break;

		case "parseRun":
			this.fnParseRun2();
			break;

		case "renum":
			//this.fnRenum2(oVm.vmGetNextInput(), oVm.vmGetNextInput(), oVm.vmGetNextInput(), oVm.vmGetNextInput());
			this.fnRenum2(oStop.oParas);
			break;

		case "reset":
			this.fnReset2();
			break;

		case "run":
			this.fnRun2(oStop.oParas && oStop.oParas.iLine);
			//this.oVm.vmSetStartLine(oVm.vmGetNextInput() || 0); // set start line number (after line 0)
			break;

		case "saveFile":
			this.fnSaveFile();
			oVm.vmStop("", 0, true); // continue
			break;

		case "sound":
			this.fnWaitForSound();
			iTimeOut = oVm.vmGetTimeUntilFrame(); // wait until next frame
			break;

		case "stop":
			break;

		case "timer":
			oVm.vmStop("", 0, true);
			break;

		default:
			Utils.console.warn("fnRunLoop: Unknown run mode:", oStop.sReason);
			break;
		}

		if (oStop.sReason && oStop.sReason !== "sound") {
			this.fnExitLoop();
		} else {
			setTimeout(this.fnRunLoopHandler, iTimeOut);
		}
	},

	startMainLoop: function () {
		if (!this.bTimeoutHandlerActive) {
			this.bTimeoutHandlerActive = true;
			this.fnRunLoop();
		}
	},

	fnSetStopObject: function (oStop) {
		Object.assign(this.oSavedStop, oStop);
	},
	fnGetStopObject: function () {
		return this.oSavedStop;
	},


	fnParse: function () {
		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("parse", 99);
		this.startMainLoop();
	},

	fnRenum: function () {
		var iStream = 0;

		/*
		this.oVm.vmSetInputValues([
			10,
			1,
			10,
			65535
		]);
		*/
		this.oVm.vmStop("renum", 99, false, {
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

	fnRun: function () {
		this.fnSetStopObject(this.oNoStop);

		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("run", 99);
		this.startMainLoop();
	},

	fnParseRun: function () {
		this.fnSetStopObject(this.oNoStop);
		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("parseRun", 99);
		this.startMainLoop();
	},

	fnStop: function () {
		var oVm = this.oVm,
			oStop = oVm.vmGetStopObject();

		this.fnSetStopObject(oStop);
		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("break", 80);
		this.startMainLoop();
	},

	fnContinue: function () {
		var oVm = this.oVm,
			oStop = oVm.vmGetStopObject(),
			oSavedStop = this.fnGetStopObject();

		this.view.setDisabled("runButton", true);
		this.view.setDisabled("stopButton", false);
		this.view.setDisabled("continueButton", true);
		if (oStop.sReason === "break" || oStop.sReason === "escape" || oStop.sReason === "stop" || oStop.sReason === "direct" || oStop.sReason === "input") {
			if (!oSavedStop.fnInputCallback) { // no keyboard callback? make sure no handler is set (especially for direct->continue)
				this.oKeyboard.setKeyDownHandler(null);
			}
			if (oStop.sReason === "direct" || oStop.sReason === "escape") {
				this.oVm.cursor(oStop.oParas.iStream, 0); // switch it off (for continue button)
			}
			Object.assign(oStop, oSavedStop); // fast hack
			this.fnSetStopObject(this.oNoStop);
		}
		this.startMainLoop();
	},

	fnReset: function () {
		this.fnSetStopObject(this.oNoStop);
		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("reset", 99);
		this.startMainLoop();
	},

	fnScreenshot: function () {
		var image = this.oCanvas.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); // here is the most important part because if you do not replace you will get a DOM 18 exception.

		return image;
	},

	fnEnter: function () {
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

	fnChangeVariable: function () {
		var sPar = this.view.getSelectValue("varSelect"),
			sValue = this.view.getSelectValue("varText"),
			oVariables = this.oVariables,
			sVarType, sType, value,

			// similar to that function in BasicParser
			fnDetermineStaticVarType = function (sName) {
				var sNameType;

				sNameType = sName.charAt(0); // take first character to determine var type later

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

		if (typeof oVariables[sPar] === "function") { // TODO
			value = sValue;
			value = new Function("o", value); // eslint-disable-line no-new-func
			oVariables[sPar] = value;
		} else {
			sVarType = fnDetermineStaticVarType(sPar);
			sType = this.oVm.vmDetermineVarType(sVarType); // do we know dynamic type?
			if (sType !== "$") { // not string? => convert to number
				value = parseFloat(sValue);
			} else {
				value = sValue;
			}
			try {
				oVariables[sPar] = this.oVm.vmAssign(sVarType, value);
				Utils.console.log("Variable", sPar, "changed:", oVariables[sPar], "=>", value);
			} catch (e) {
				Utils.console.warn(e);
			}
		}
		this.fnSetVarSelectOptions("varSelect", oVariables);
		this.commonEventHandler.onVarSelectChange(); // title change?
	},

	fnSetSoundActive: function () {
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
				Utils.console.error("soundOn:", e);
				sText = "Sound unavailable";
			}
		} else {
			oSound.soundOff();
			sText = "Sound is off";
			oStop = this.oVm && this.oVm.vmGetStopObject();
			if (oStop && oStop.sReason === "sound") {
				this.oVm.vmStop("", 0, true); //TTT do not wait
			}
		}
		soundButton.innerText = sText;
	}
};
