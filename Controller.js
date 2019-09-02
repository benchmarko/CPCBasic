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
		var sExample;

		this.model = oModel;
		this.view = oView;
		this.commonEventHandler = new CommonEventHandler(oModel, oView, this);

		oView.setHidden("specialArea", !oModel.getProperty("showSpecial"));
		oView.setHidden("inputArea", !oModel.getProperty("showInput"));
		oView.setHidden("outputArea", !oModel.getProperty("showOutput"));
		oView.setHidden("resultArea", !oModel.getProperty("showResult"));
		oView.setHidden("variableArea", !oModel.getProperty("showVariable"));

		oView.setHidden("cpcArea", false); // make sure canvas is not hidden (allows to get width, height)
		this.oCanvas = new Canvas({
			aCharset: cpcBasicCharset, //TTT
			cpcDivId: "cpcArea",
			view: this.view
		});
		oView.setHidden("cpcArea", !oModel.getProperty("showCpc"));

		sExample = oModel.getProperty("example");
		oView.setSelectValue("exampleSelect", sExample);

		this.oVm = new CpcVm({}, this.oCanvas);
		this.fnScript = null;

		this.iTimeoutHandle = null;

		this.fnRunPartHandler = this.fnRunPart1.bind(this);
		this.fnKeyDownHandler = this.fnOnKeyDown.bind(this);

		this.fnSetExampleSelectOptions();
		this.commonEventHandler.onExampleSelectChange();
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
			oItem, sKey, sValue, sTitle, sStrippedTitle;

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
		this.view.setSelectOptions(sSelect, aItems);
	},

	fnInvalidateScript: function () {
		this.fnScript = null;
	},

	fnRunPart1: function () {
		var oVm = this.oVm,
			iLength;

		if (this.iTimeoutHandle !== null) {
			clearTimeout(this.iTimeoutHandle);
			this.iTimeoutHandle = null;
		}
		iLength = oVm.sOut.length;
		oVm.bStop = false;
		try {
			this.fnScript(oVm);
		} catch (e) {
			oVm.sOut += "\n" + String(e) + "\n";
			oVm.error(2); // Syntax Error
		}
		if (oVm.sOut.length !== iLength) {
			this.view.setAreaValue("resultText", oVm.sOut);
			this.view.setAreaScrollTop("resultText"); // scroll to bottom
		}
		this.fnRunStart1();
	},

	fnOnKeyDown: function () {
		var sKey;

		this.oCanvas.options.fnOnKeyDown = null;
		sKey = this.oCanvas.getKeyFromBuffer();
		this.oVm.sStopLabel = "";
		this.oVm.iStopPriority = 0;
		Utils.console.log("Wait for key: " + sKey);
		this.fnRunStart1(); // continue
	},

	fnRunStart1: function () {
		var iTimeUntilFrame,
			iTimeOut = 0,
			iNextLine;

		iTimeUntilFrame = this.oVm.vmCheckNextFrame();
		if (this.oVm.bStop) {
			if (this.oVm.sStopLabel === "end" || this.oVm.sStopLabel === "stop" || this.oVm.sStopLabel === "break" || this.oVm.iErr) {
				this.view.setDisabled("runButton", false);
				this.view.setDisabled("stopButton", true);
				this.view.setDisabled("continueButton", this.oVm.sStopLabel === "end");
				this.fnSetVarSelectOptions("varSelect", this.oVariables);
				this.commonEventHandler.onVarSelectChange();
				return;
			} else if (this.oVm.sStopLabel === "frame") {
				this.oVm.sStopLabel = "";
				this.oVm.iStopPriority = 0;
				iTimeOut = iTimeUntilFrame; // wait until next frame
			} else if (this.oVm.sStopLabel === "key") {
				this.oCanvas.options.fnOnKeyDown = this.fnKeyDownHandler; // wait until keypress handler
				return;
			}
			/*
			} else if (this.oVm.sStopLabel === "run") {
				this.oVm.sStopLabel = "";
				this.oVm.iStopPriority = 0;
				iNextLine = this.oVm.iLine; // save line
				this.oVm.vmInitVariables();
				this.oVm.vmInitStack();
				this.oVm.clearInput();
				this.oVm.goto(iNextLine);
			}
			*/
		}
		this.iTimeoutHandle = setTimeout(this.fnRunPartHandler, iTimeOut);
	},

	fnRun: function (sScript) {
		var oVm = this.oVm;

		if (!this.fnScript) {
			oVm.vmInit({
				variables: this.oVariables
			});
			this.oVm.clear(); // init variables
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
		this.oVm.vmInitInks();
		this.oVm.clearInput();

		if (this.fnScript) {
			this.oVm.sOut = this.view.getAreaValue("resultText");
			oVm.bStop = false;
			oVm.sStopLabel = "";
			oVm.iStopPriority = 0;
			oVm.iLine = 0;

			this.iTimeoutHandle = null;


			this.view.setDisabled("runButton", true);
			this.view.setDisabled("stopButton", false);
			this.view.setDisabled("continueButton", true);
			this.fnRunStart1();
		}
		if (Utils.debug > 1) {
			Utils.console.debug("DEBUG: End of fnRun");
		}
	},

	fnParse: function (sInput) {
		var oParseOptions, oOutput, oError, iEndPos, sOutput;

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

	fnParseRun: function (sInput) {
		var oOutput, sScript;

		oOutput = this.fnParse(sInput);

		if (!oOutput.error) {
			sScript = this.view.getAreaValue("outputText");
			this.fnRun(sScript);
		}
	},

	fnStop: function () {
		var sStopLabel = this.oVm.sStopLabel;

		this.oVm.vmStop("break", 80);
		if (sStopLabel === "key") { // current sStopLabel was key?
			this.oCanvas.options.fnOnKeyDown = null;
			this.fnRunStart1(); //TTT handle break
		}
	},

	fnContinue: function () {
		this.iTimeoutHandle = null;

		this.view.setDisabled("runButton", true);
		this.view.setDisabled("stopButton", false);
		this.view.setDisabled("continueButton", true);
		if (this.oVm.sStopLabel === "break" || this.oVm.sStopLabel === "stop") {
			this.oVm.sStopLabel = "";
			this.oVm.iStopPriority = 0;
		}
		this.fnRunStart1();
	}
};
