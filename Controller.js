// Controller.js - Controller
//
/* globals CommonEventHandler cpcBasicCharset  */

"use strict";

var Utils, BasicParser, Canvas, CpcVm;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
	BasicParser = require("./BasicParser.js"); // eslint-disable-line global-require
	Canvas = require("./Canvas.js"); // eslint-disable-line global-require
	CpcVm = require("./CpcVm.js"); // eslint-disable-line global-require
}

function Controller(oModel, oView) {
	this.init(oModel, oView);
}

Controller.prototype = {
	init: function (oModel, oView) {
		var that = this,
			sUrl, sExample,
			onExampleIndexLoaded = function () {
				Utils.console.log(sUrl + " loaded");
				that.fnSetExampleSelectOptions();
				that.commonEventHandler.onExampleSelectChange();
			},
			onExampleIndexError = function () {
				Utils.console.log(sUrl + " error");
			};

		this.model = oModel;
		this.view = oView;
		this.commonEventHandler = new CommonEventHandler(oModel, oView, this);

		oView.setHidden("inputArea", !oModel.getProperty("showInput"));
		oView.setHidden("inp2Area", !oModel.getProperty("showInp2"));
		oView.setHidden("outputArea", !oModel.getProperty("showOutput"));
		oView.setHidden("resultArea", !oModel.getProperty("showResult"));
		oView.setHidden("variableArea", !oModel.getProperty("showVariable"));

		oView.setHidden("cpcArea", false); // make sure canvas is not hidden (allows to get width, height)
		this.oCanvas = new Canvas({
			aCharset: cpcBasicCharset,
			cpcDivId: "cpcArea",
			view: this.view
		});
		oView.setHidden("cpcArea", !oModel.getProperty("showCpc"));

		sExample = oModel.getProperty("example");
		oView.setSelectValue("exampleSelect", sExample);

		this.oVm = new CpcVm({}, this.oCanvas);
		this.fnScript = null;

		this.iTimeoutHandle = null;

		this.sLabelBeforeStop = ""; //TTT
		this.iPrioBeforeStop = 0;

		this.fnRunStart1Handler = this.fnRunStart1.bind(this);
		this.fnOnWaitForKey = this.fnWaitForKey.bind(this);
		this.fnOnWaitForInput = this.fnWaitForInput.bind(this);

		sUrl = oModel.getProperty("exampleDir") + "/" + oModel.getProperty("exampleIndex");
		if (sUrl) {
			Utils.loadScript(sUrl, onExampleIndexLoaded, onExampleIndexError);
		} else {
			Utils.console.error("ExampleIndex not set");
		}
	},

	// Also called from index file 0index.js
	fnAddIndex: function (sDir, input) { // optional sDir
		var sInput, aIndex, i;

		sInput = input.trim();
		aIndex = JSON.parse(sInput);
		for (i = 0; i < aIndex.length; i += 1) {
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
			Utils.console.log("fnAddItem: Creating new example: " + sKey);
		}
		oExample.key = sKey; // maybe changed
		oExample.script = sInput;
		oExample.loaded = true;
		Utils.console.log("fnAddItem: " + sKey);
		return sKey;
	},

	fnSetExampleSelectOptions: function () {
		var sSelect = "exampleSelect",
			aItems = [],
			sExample = this.model.getProperty("example"),
			oAllExamples = this.model.getAllExamples(),
			sKey, oExample, oItem;

		for (sKey in oAllExamples) {
			if (oAllExamples.hasOwnProperty(sKey)) {
				oExample = oAllExamples[sKey];
				oItem = {
					value: oExample.key,
					title: (oExample.key + ": " + oExample.title).substr(0, 160)
				};
				oItem.text = oItem.title.substr(0, 34);
				if (oExample.key === sExample) {
					oItem.selected = true;
				}
				aItems.push(oItem);
			}
		}
		this.view.setSelectOptions(sSelect, aItems);
	},

	fnSetVarSelectOptions: function (sSelect, oVariables) {
		var aItems = [],
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
				sStrippedTitle = sTitle.substr(0, 35); // limit length
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

	fnWaitForKey: function () {
		var sKey;

		this.oCanvas.options.fnOnKeyDown = null;
		sKey = this.oCanvas.getKeyFromBuffer();
		this.oVm.vmStop("", 0, true);
		Utils.console.log("Wait for key: " + sKey);
		if (this.iTimeoutHandle === null) {
			this.fnRunStart1();
		}
	},

	fnWaitForInput: function () {
		var oInput = this.oVm.vmGetInputObject(),
			iStream = oInput.iStream,
			sInput = oInput.sInput,
			sKey;

		do {
			sKey = this.oVm.inkey$(); // or: this.oCanvas.getKeyFromBuffer()
			// chr13 shows as empty string!
			if (sKey !== "") {
				if (sKey === "\x08") { // Backspace
					if (sInput.length > 0) {
						sInput = sInput.slice(0, -1);
						sKey = sKey + " " + sKey;
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
			this.oCanvas.options.fnOnKeyDown = null;
			this.oVm.vmStop("", 0, true);
			Utils.console.log("Wait for input: " + sInput);
			if (!oInput.sNoCRLF) {
				this.oVm.print(iStream, "\r\n");
			}
			if (oInput.fnInputCallback) {
				oInput.fnInputCallback(sInput);
			}
			if (this.iTimeoutHandle === null) {
				this.fnRunStart1();
			}
		}
	},

	fnParse2: function () {
		var sInput = this.view.getAreaValue("inputText"),
			oParseOptions, oOutput, oError, iEndPos, sOutput;

		oParseOptions = {
			ignoreVarCase: true
		};
		this.oVariables = {};
		oOutput = new BasicParser(oParseOptions).calculate(sInput, this.oVariables);
		if (oOutput.error) {
			oError = oOutput.error;
			iEndPos = oError.pos + ((oError.value !== undefined) ? String(oError.value).length : 0);
			this.view.setAreaSelection("inputText", oError.pos, iEndPos);
			sOutput = oError.message + ": '" + oError.value + "' (pos " + oError.pos + "-" + iEndPos + ")";
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

		if (!this.fnScript) {
			oVm.vmInit({
				variables: this.oVariables
			});
			oVm.clear(); // init variables
			try {
				this.fnScript = new Function("o", sScript); // eslint-disable-line no-new-func
			} catch (e) {
				Utils.console.error(e);
				this.fnScript = null;
			}
		} else {
			oVm.vmInitStack();
			oVm.vmInitVariables();
		}
		oVm.vmInitInks();
		oVm.clearInput();

		if (this.fnScript) {
			oVm.sOut = this.view.getAreaValue("resultText");
			oVm.vmStop("", 0, true);
			oVm.iLine = iLine;

			this.view.setDisabled("runButton", true);
			this.view.setDisabled("stopButton", false);
			this.view.setDisabled("continueButton", true);

			if (Utils.debug > 0) {
				oVm.vmStatStart(); //TTT
			}
		}
		if (Utils.debug > 1) {
			Utils.console.debug("DEBUG: End of fnRun2");
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

	fnLoadFile: function (sName) {
		var oVm = this.oVm;

		if (sName) {
			this.view.setSelectValue("exampleSelect", sName);
			this.commonEventHandler.onExampleSelectChange();
		} else {
			oVm.error(32); //TODO: set also derr=146 (xx not found)
		}
	},

	fnRunPart1: function () {
		var oVm = this.oVm;

		try {
			this.fnScript(oVm);
		} catch (e) {
			oVm.sOut += "\n" + String(e) + "\n";
			oVm.error(2); // Syntax Error
		}
	},

	fnRunStart1: function () { // eslint-disable-line complexity
		var oVm = this.oVm,
			sReason = oVm.vmGetStopReason(),
			iTimeOut = 0;

		if (!sReason) {
			this.fnRunPart1();
			sReason = oVm.vmGetStopReason();
		}

		switch (sReason) {
		case "":
			break;

		case "break":
			break;

		case "end":
			break;

		case "error":
			break;

		case "frame":
			oVm.vmStop("", 0, true);
			iTimeOut = oVm.vmGetTimeUntilFrame(); // wait until next frame
			break;

		case "input":
			this.oCanvas.options.fnOnKeyDown = this.fnOnWaitForInput;
			this.fnWaitForInput();
			break;

		case "key":
			this.oCanvas.options.fnOnKeyDown = this.fnOnWaitForKey; // wait until keypress handler
			break;

		case "loadFile":
			this.fnLoadFile(oVm.vmGetNextInput("$"));
			break;

		case "parse":
			this.fnParse2();
			break;

		case "parseRun":
			this.fnParseRun2();
			break;

		case "reset":
			oVm.vmReset();
			oVm.sOut = "";
			this.view.setAreaValue("outputText", "");
			//TTT variables?
			break;

		case "run": // TODO: run with line number
			this.fnRun2(oVm.vmGetNextInput(""));
			break;

		case "stop":
			break;

		case "timer":
			oVm.vmStop("", 0, true);
			break;

		default:
			Utils.console.warn("fnRunStart1: Unknown run mode: " + sReason);
			break;
		}

		sReason = oVm.vmGetStopReason();
		if (!sReason) {
			this.iTimeoutHandle = setTimeout(this.fnRunStart1Handler, iTimeOut);
		} else {
			this.view.setAreaValue("resultText", oVm.sOut);
			this.view.setAreaScrollTop("resultText"); // scroll to bottom

			this.view.setDisabled("runButton", false);
			this.view.setDisabled("stopButton", sReason !== "input" && sReason !== "key");
			this.view.setDisabled("continueButton", sReason === "end" || sReason === "reset" || sReason === "input" || sReason === "key");
			if (this.oVariables) {
				this.fnSetVarSelectOptions("varSelect", this.oVariables);
				this.commonEventHandler.onVarSelectChange();
			}
			this.iTimeoutHandle = null; // not running any more
		}
	},

	fnParse: function () {
		this.oVm.vmStop("parse", 90);
		if (this.iTimeoutHandle === null) {
			this.fnRunStart1();
		}
	},

	fnRun: function () {
		this.oVm.vmStop("run", 99);
		if (this.iTimeoutHandle === null) {
			this.fnRunStart1();
		}
	},

	fnParseRun: function () {
		this.oVm.vmStop("parseRun", 99);
		if (this.iTimeoutHandle === null) {
			this.fnRunStart1();
		}
	},

	fnStop: function () {
		var oVm = this.oVm,
			sReason = oVm.vmGetStopReason(),
			iPriority = oVm.vmGetStopPriority();

		this.sLabelBeforeStop = sReason;
		this.iPrioBeforeStop = iPriority;
		if (sReason === "input" || sReason === "key") {
			this.oCanvas.options.fnOnKeyDown = null;
		}
		oVm.vmStop("break", 80);
		if (this.iTimeoutHandle === null) {
			this.fnRunStart1();
		}
	},

	fnContinue: function () {
		var oVm = this.oVm,
			sReason = oVm.vmGetStopReason();

		this.view.setDisabled("runButton", true);
		this.view.setDisabled("stopButton", false);
		this.view.setDisabled("continueButton", true);
		if (sReason === "break" || sReason === "stop") {
			oVm.vmStop(this.sLabelBeforeStop, this.iPrioBeforeStop, true);
			this.sLabelBeforeStop = "";
			this.iPrioBeforeStop = 0;
		}
		if (this.iTimeoutHandle === null) {
			this.fnRunStart1();
		}
	},

	fnReset: function () {
		var oVm = this.oVm;

		oVm.vmStop("reset", 99);
		if (this.iTimeoutHandle === null) {
			this.fnRunStart1();
		}
	},

	fnScreenshot: function () {
		var image = this.oCanvas.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); // here is the most important part because if you do not replace you will get a DOM 18 exception.

		return image;
	},

	fnEnter: function () {
		var oVm = this.oVm,
			sReason = oVm.vmGetStopReason(),
			sInput = this.view.getAreaValue("inp2Text"),
			i;

		for (i = 0; i < sInput.length; i += 1) {
			this.oCanvas.putKeyInBuffer(sInput.charAt(i));
		}
		this.oCanvas.putKeyInBuffer("\r"); //TTT
		if (sReason === "input") {
			this.fnWaitForInput();
		} else if (sReason === "key") {
			this.fnWaitForKey();
		}
		this.view.setAreaValue("inp2Text", "");
	}
};
