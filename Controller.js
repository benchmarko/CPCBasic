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
		this.fnOnWaitForKey = this.fnWaitForKey.bind(this);
		this.fnOnWaitForInput = this.fnWaitForInput.bind(this);
		this.fnEscapeHandler = this.fnEscape.bind(this);

		this.oCodeGeneratorJs = null;

		this.fnScript = null;

		this.iTimeoutHandle = null;

		this.sLabelBeforeStop = "";
		this.iPrioBeforeStop = 0;

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

		sKbdLayout = oModel.getProperty("kbdLayout");
		oView.setSelectValue("kbdLayoutSelect", sKbdLayout);
		this.commonEventHandler.onKbdLayoutSelectChange();

		this.oKeyboard = new Keyboard({
			fnEscapeHandler: this.fnEscapeHandler
		});
		if (this.model.getProperty("showKbd")) { // maybe we need to draw virtual keyboard
			this.oKeyboard.virtualKeyboardCreate();
		}

		oView.setHidden("cpcArea", !oModel.getProperty("showCpc"));

		this.oSound = new Sound();
		if (oModel.getProperty("sound")) { // activate sound needs user action
			this.fnSetSoundActive(); // activate in waiting state
		}
		this.commonEventHandler.fnActivateUserAction(this.onUserAction.bind(this)); // check first user action, also if sound is not yet on

		sExample = oModel.getProperty("example");
		oView.setSelectValue("exampleSelect", sExample);

		this.oVm = new CpcVm({
			canvas: this.oCanvas,
			keyboard: this.oKeyboard,
			sound: this.oSound,
			tron: oModel.getProperty("tron")
		});

		this.fnInitDatabases();
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
		var sKey;

		sKey = this.oKeyboard.getKeyFromBuffer();

		if (sKey !== "") {
			this.oKeyboard.setKeyDownHandler(null);
			this.fnContinue();
		}
	},

	fnEscape: function () {
		var oStop = this.oVm.vmGetStopObject();

		this.fnSetStopLabelPrio(oStop.sReason, oStop.iPriority);
		this.oKeyboard.setKeyDownHandler(this.fnWaitForContinue.bind(this));

		this.oVm.vmStop("escape", 85);
		if (this.iTimeoutHandle === null) {
			this.fnRunLoop();
		}
	},

	fnWaitForKey: function () {
		var sKey;

		this.oKeyboard.setKeyDownHandler(null);
		sKey = this.oKeyboard.getKeyFromBuffer();
		this.oVm.vmStop("", 0, true);
		Utils.console.log("Wait for key:", sKey);
		if (this.iTimeoutHandle === null) {
			this.fnRunLoop();
		}
	},

	fnWaitForInput: function () {
		var oInput = this.oVm.vmGetInputObject(),
			iStream = oInput.iStream,
			sInput = oInput.sInput,
			bInputOk = true,
			sKey;

		do {
			sKey = this.oKeyboard.getKeyFromBuffer(); // (inkey$ could insert frame if checked too often)
			// chr13 shows as empty string!
			if (sKey !== "") {
				if (sKey === "\x7f") { // del?
					if (sInput.length > 0) {
						sInput = sInput.slice(0, -1);
						sKey = "\x08\x10"; // use backspace and clr  // or: "\x08 \x08"
					} else {
						sKey = "\x07"; // ignore Backspace, use BEL
					}
					this.oVm.print(iStream, sKey);
				} else if (sKey === "\r") {
					// ignore
				} else {
					this.oVm.print(iStream, sKey);
					if (sKey >= "\x20") { // no control codes in buffer
						sInput += sKey;
					}
				}
			}
		} while (sKey !== "" && sKey !== "\r"); // get all keys until CR

		oInput.sInput = sInput;
		if (sKey === "\r") {
			Utils.console.log("fnWaitForInput:", sInput);
			if (!oInput.sNoCRLF) {
				this.oVm.print(iStream, "\r\n");
			}
			if (oInput.fnInputCallback) {
				bInputOk = oInput.fnInputCallback(sInput);
			}
			if (bInputOk) {
				this.oKeyboard.setKeyDownHandler(null);
				this.oVm.vmStop("", 0, true);
				if (this.iTimeoutHandle === null) {
					this.fnRunLoop();
				}
			}
		}
	},

	fnWaitForSound: function () {
		var aSoundData;

		if (!this.oSound.isActivatedByUser()) { // not yet activated?
			return;
		}

		this.oSound.scheduler(); // we need to schedule here as well to free queue
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
			iLine1, iLine2;

		while (aLines1.length && aLines2.length) {
			iLine1 = iLine1 || parseInt(aLines1[0], 10);
			iLine2 = iLine2 || parseInt(aLines2[0], 10);
			if (iLine1 < iLine2) {
				aResult.push(aLines1.shift());
				iLine1 = 0;
			} else {
				aResult.push(aLines2.shift());
				if (iLine1 === iLine2) {
					aLines1.shift(); // overwrite line1
					iLine1 = 0;
				}
				iLine2 = 0;
			}
		}
		aResult = aResult.concat(aLines1, aLines2); // put in remaining lines from one source
		return aResult.join("\n");
	},

	fnLoadFile: function () {
		var that = this,
			oVm = this.oVm,
			oInFile = this.oVm.vmGetFileObject(),
			sPath = "",
			sDatabaseDir, sName, sExample, oExample, sKey, iLastSlash, sUrl, oError,

			fnContinue = function (sInput) {
				var sCommand = oInFile.sCommand,
					iStartLine = 0;

				that.model.setProperty("example", oInFile.sMemorizedExample);
				that.oVm.vmStop("", 0, true);
				if (oInFile.fnFileCallback) {
					try {
						oInFile.fnFileCallback(sInput);
					} catch (e) {
						Utils.console.error(String(e) + "\n");
					}
				}
				if (sInput) {
					switch (sCommand) {
					case "openin":
						break;
					case "chainMerge":
						sInput = that.fnMergeScripts(that.view.getAreaValue("inputText"), sInput);
						that.view.setAreaValue("inputText", sInput);
						that.view.setAreaValue("resultText", "");
						iStartLine = oInFile.iLine || 0;
						that.fnParseRun2();
						break;
					case "load":
						that.view.setAreaValue("inputText", sInput);
						that.view.setAreaValue("resultText", "");
						that.fnInvalidateScript();
						break;
					case "merge":
						sInput = that.fnMergeScripts(that.view.getAreaValue("inputText"), sInput);
						that.view.setAreaValue("inputText", sInput);
						that.view.setAreaValue("resultText", "");
						that.fnInvalidateScript();
						break;
					case "chain": // run through...
					case "run":
						that.view.setAreaValue("inputText", sInput);
						that.view.setAreaValue("resultText", "");
						iStartLine = oInFile.iLine || 0;
						that.fnReset2();
						that.fnParseRun2();
						break;
					default:
						Utils.console.error("fnLoadFile: Unknown command:", sCommand);
						break;
					}
					that.oVm.vmSetStartLine(iStartLine);
				}
				if (that.iTimeoutHandle === null) {
					that.fnRunLoop();
				}
			},

			fnExampleLoaded = function (sFullUrl, bSuppressLog) {
				var sInput;

				if (!bSuppressLog) {
					Utils.console.log("Example", sUrl, "loaded");
				}

				oExample = that.model.getExample(sExample);
				sInput = oExample.script;
				fnContinue(sInput);
			},
			fnExampleError = function () {
				Utils.console.log("Example", sUrl, "error");
				fnContinue(null);
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
			Utils.console.warn("fnLoadFile: Unknown file:", sExample);
			oError = oVm.vmSetError(32, sExample + " not found"); // TODO: set also derr=146 (xx not found)
			oVm.print(0, String(oError) + "\r\n");
		}
	},

	fnWaitForFile: function () {
		var oInFile = this.oVm.vmGetFileObject(),
			sName = oInFile.sName;

		if (!oInFile.sState) {
			oInFile.sState = "loading";
			this.fnLoadFile(sName);
		}
	},

	fnReset2: function () {
		var oVm = this.oVm;

		this.oVariables = {};
		oVm.vmResetVariables();
		oVm.vmReset();
		oVm.vmStop("reset", 0); // keep reset, but with priority 0, so that "compile only" still works
		oVm.sOut = "";
		this.view.setAreaValue("outputText", "");
		this.fnInvalidateScript();
	},

	fnRenum2: function (iNew, iOld, iStep, iKeep) {
		var sInput = this.view.getAreaValue("inputText"),
			oOutput, oError, iEndPos, sOutput;

		if (!this.oBasicFormatter) {
			this.oBasicFormatter = new BasicFormatter({
				lexer: new BasicLexer(),
				parser: new BasicParser()
			});
		}

		this.oBasicFormatter.reset();
		oOutput = this.oBasicFormatter.renumber(sInput, iNew, iOld, iStep, iKeep);

		if (oOutput.error) {
			oError = oOutput.error;
			iEndPos = oError.pos + ((oError.value !== undefined) ? String(oError.value).length : 0);
			this.view.setAreaSelection("inputText", oError.pos, iEndPos);
			sOutput = oError.message + ": '" + oError.value + "' (pos " + oError.pos + "-" + iEndPos + ")";
			Utils.console.warn(sOutput);
			this.oVm.print(0, sOutput + "\r\n"); // Error
		} else {
			sOutput = oOutput.text;
			this.view.setAreaValue("inputText", sOutput);
			this.view.setAreaValue("outputText", ""); // JS
		}
		return oOutput;
	},

	fnParse2: function () {
		var sInput = this.view.getAreaValue("inputText"),
			iBench = this.model.getProperty("bench"),
			i, iTime, oOutput, oError, iEndPos, sOutput;

		if (!this.oCodeGeneratorJs) {
			this.oCodeGeneratorJs = new CodeGeneratorJs({
				lexer: new BasicLexer(),
				parser: new BasicParser(),
				tron: this.model.getProperty("tron")
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
			oError.message = sOutput;
			//Utils.console.warn(oError); // already done
			this.oVm.print(0, sOutput + "\r\n"); // Error
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
			oVm = this.oVm;

		iLine = iLine || 0;

		if (iLine === 0) {
			this.oVm.vmSetStartLine(0);
			oVm.vmResetData();
		}

		if (!this.fnScript) {
			oVm.vmSetVariables(this.oVariables);
			oVm.clear(); // init variables
			try {
				this.fnScript = new Function("o", sScript); // eslint-disable-line no-new-func
			} catch (e) {
				Utils.console.error(e);
				oVm.print(0, String(e) + "\r\n");
				this.fnScript = null;
			}
		} else {
			oVm.clear(); // we do a clear as well here //TTT
		}
		oVm.vmResetInks();
		oVm.clearInput();

		if (this.fnScript) {
			oVm.sOut = this.view.getAreaValue("resultText");
			oVm.vmStop("", 0, true);
			oVm.iLine = iLine;

			this.view.setDisabled("runButton", true);
			this.view.setDisabled("stopButton", false);
			this.view.setDisabled("continueButton", true);
		}
		if (Utils.debug > 1) {
			Utils.console.debug("End of fnRun2");
		}
	},

	fnParseRun2: function () {
		var sInput = this.view.getAreaValue("inputText"),
			oOutput;

		oOutput = this.fnParse2(sInput);
		if (!oOutput.error) {
			this.fnRun2();
		}
	},

	fnRunPart1: function () {
		var oVm = this.oVm,
			oError;

		try {
			this.fnScript(oVm);
		} catch (e) {
			if (e instanceof CpcVm.ErrorObject) {
				if (!e.hidden) {
					oVm.print(0, String(e) + "\r\n");
					Utils.console.warn(e);
				} else {
					Utils.console.log(e);
				}
			} else {
				oError = oVm.vmSetError(2, String(e)); // Syntax Error
				oVm.print(0, String(oError) + "\r\n");
				Utils.console.error(e);
			}
		}
	},

	fnExitLoop: function () {
		var oVm = this.oVm,
			oStop = oVm.vmGetStopObject(),
			sReason = oStop.sReason;

		this.view.setAreaValue("resultText", oVm.sOut);
		this.view.setAreaScrollTop("resultText"); // scroll to bottom

		this.view.setDisabled("runButton", sReason === "reset");
		this.view.setDisabled("stopButton", sReason !== "input" && sReason !== "key" && sReason !== "loadFile");
		this.view.setDisabled("continueButton", sReason === "end" || sReason === "input" || sReason === "key" || sReason === "loadFile" || sReason === "parse" || sReason === "renum" || sReason === "reset");
		if (this.oVariables) {
			this.fnSetVarSelectOptions("varSelect", this.oVariables);
			this.commonEventHandler.onVarSelectChange();
		}
		this.iTimeoutHandle = null; // not running any more
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

		case "end":
			break;

		case "error":
			break;

		case "escape":
			if (!oVm.vmEscape()) {
				oVm.vmStop("", 0, true); // continue
			}
			break;

		case "frame":
			oVm.vmStop("", 0, true);
			iTimeOut = oVm.vmGetTimeUntilFrame(); // wait until next frame
			break;

		case "input":
			this.oKeyboard.setKeyDownHandler(this.fnOnWaitForInput);
			this.fnWaitForInput();
			break;

		case "key":
			this.oKeyboard.setKeyDownHandler(this.fnOnWaitForKey); // wait until keypress handler
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
			this.fnRenum2(oVm.vmGetNextInput(), oVm.vmGetNextInput(), oVm.vmGetNextInput(), oVm.vmGetNextInput());
			break;

		case "reset":
			this.fnReset2();
			break;

		case "run":
			this.fnRun2();
			this.oVm.vmSetStartLine(oVm.vmGetNextInput() || 0); // set start line number (after line 0)
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

		if (!oStop.sReason || oStop.sReason === "sound") {
			this.iTimeoutHandle = setTimeout(this.fnRunLoopHandler, iTimeOut);
		} else {
			this.fnExitLoop();
		}
	},

	fnSetStopLabelPrio: function (sReason, iPriority) {
		this.sLabelBeforeStop = sReason;
		this.iPrioBeforeStop = iPriority;
	},

	fnParse: function () {
		this.oVm.vmStop("parse", 99);
		if (this.iTimeoutHandle === null) {
			this.fnRunLoop();
		}
	},

	fnRenum: function () {
		// set input values for renum
		this.oVm.vmResetInputHandling([
			10,
			1,
			10,
			65535
		]);
		this.oVm.vmStop("renum", 99);
		if (this.iTimeoutHandle === null) {
			this.fnRunLoop();
		}
	},

	fnRun: function () {
		this.fnSetStopLabelPrio("", 0);
		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("run", 99);
		if (this.iTimeoutHandle === null) {
			this.fnRunLoop();
		}
	},

	fnParseRun: function () {
		this.fnSetStopLabelPrio("", 0);
		this.oKeyboard.setKeyDownHandler(null);
		this.oVm.vmStop("parseRun", 99);
		if (this.iTimeoutHandle === null) {
			this.fnRunLoop();
		}
	},

	fnStop: function () {
		var oVm = this.oVm,
			oStop = oVm.vmGetStopObject();

		this.fnSetStopLabelPrio(oStop.sReason, oStop.iPriority);
		this.oKeyboard.setKeyDownHandler(null);
		oVm.vmStop("break", 80);
		if (this.iTimeoutHandle === null) {
			this.fnRunLoop();
		}
	},

	fnContinue: function () {
		var oVm = this.oVm,
			oStop = oVm.vmGetStopObject();

		this.view.setDisabled("runButton", true);
		this.view.setDisabled("stopButton", false);
		this.view.setDisabled("continueButton", true);
		if (oStop.sReason === "break" || oStop.sReason === "escape" || oStop.sReason === "stop") {
			oVm.vmStop(this.sLabelBeforeStop, this.iPrioBeforeStop, true);
			this.fnSetStopLabelPrio("", 0);
		}
		if (this.iTimeoutHandle === null) {
			this.fnRunLoop();
		}
	},

	fnReset: function () {
		var oVm = this.oVm;

		this.fnSetStopLabelPrio("", 0);
		this.oKeyboard.setKeyDownHandler(null);
		oVm.vmStop("reset", 99);
		if (this.iTimeoutHandle === null) {
			this.fnRunLoop();
		}
	},

	fnScreenshot: function () {
		var image = this.oCanvas.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); // here is the most important part because if you do not replace you will get a DOM 18 exception.

		return image;
	},

	fnEnter: function () {
		var oVm = this.oVm,
			oStop = oVm.vmGetStopObject(),
			sInput = this.view.getAreaValue("inp2Text"),
			i;

		for (i = 0; i < sInput.length; i += 1) {
			this.oKeyboard.putKeyInBuffer(sInput.charAt(i));
		}
		this.oKeyboard.putKeyInBuffer("\r");
		if (oStop.sReason === "input") {
			this.fnWaitForInput();
		} else if (oStop.sReason === "key") {
			this.fnWaitForKey();
		}
		this.view.setAreaValue("inp2Text", "");
	},

	fnSetSoundActive: function () {
		var oSound = this.oSound,
			soundButton = document.getElementById("soundButton"),
			bActive = this.model.getProperty("sound"),
			sText = "";

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
		}
		soundButton.innerText = sText;
	}
};
