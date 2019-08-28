// Controller.js - Controller
//
/* globals CommonEventHandler  */

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

		// make sure canvas is not hidden (allows to get width, height)
		this.oCanvas = new Canvas({
			//zoom: mConfig.zoom,
			//mapType: sMapType2,
			mapDivId: "cpcCanvas",
			//onload: fnMapLoaded,
			//onGetInfoWindowContent: fnGetInfoWindowContent,
			view: this.view
		});

		oView.setHidden("cpcArea", !oModel.getProperty("showCpc"));

		sExample = oModel.getProperty("example");
		oView.setSelectValue("exampleSelect", sExample);

		this.oVm = new CpcVm({}, this.oCanvas);
		this.fnScript = null;

		this.iTimeoutHandle = null;

		this.fnSetExampleSelectOptions();
		this.commonEventHandler.onExampleSelectChange();
	},

	// Also called from example files xxxxx.js
	fnAddItem: function (sKey, input) { // optional sKey
		var sInput, oExample;

		//sInput = Utils.stringTrimLeft(input);
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

	fnSetVarSelectOptions: function (sSelect, oVariables) { //TTT
		var aItems = [],
			oItem, sKey, sValue;

		for (sKey in oVariables) {
			if (oVariables.hasOwnProperty(sKey)) {
				sValue = oVariables[sKey];
				oItem = {
					value: sKey,
					title: sKey + "=" + sValue
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

	fnParse: function (sInput) {
		var oParseOptions, oOutput, oError, iEndPos, sOutput;

		//this.view.setAreaValue("outputText", "");
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

		/*
		this.oVm.sOut = this.view.getAreaValue("resultText");
		if (!oOutput.error) {
			sResult += this.fnRun(sOutput);
		}
		this.view.setAreaValue("resultText", sResult);
		*/

		this.fnInvalidateScript();
		this.fnSetVarSelectOptions("varSelect", this.oVariables);
		return oOutput;
	},

	/*
	fnRunStop1: function () {
		this.oVm.stopTimer();
	},
	*/

	fnRunStart1: function () {
		var iTimeUntilFrame,
			iTime = 0;

		iTimeUntilFrame = this.oVm.vmCheckNextFrame();
		if (this.oVm.bStop) {
			if (this.oVm.sStopLabel === "end" || this.oVm.sStopLabel === "stop" || this.oVm.sStopLabel === "break" || this.oVm.iErr) {
				this.oVm.vmStopTimer();
				this.view.setDisabled("runButton", false);
				this.view.setDisabled("stopButton", true);
				this.view.setDisabled("continueButton", this.oVm.sStopLabel === "end");
				this.fnSetVarSelectOptions("varSelect", this.oVariables);
				return;
			} else if (this.oVm.sStopLabel === "frame") {
				this.oVm.sStopLabel = "";
				this.oVm.iStopPriority = 0;
				iTime = iTimeUntilFrame;
				//Utils.console.log("fnRunStart1: " + iTime + " " + this.oVm.iFrameCount, Date.now() - this.oVm.iStartTime);
			}
		}

		this.iTimeoutHandle = setTimeout(this.fnRunPart1.bind(this), iTime); //TTT
	},

	fnRunPart1: function () {
		var oVm = this.oVm,
			iLength;

		/*
		if (Utils.debug > 1) {
			Utils.console.log("DEBUG: fnRunPart1");
		}
		*/
		if (this.iTimeoutHandle !== null) {
			clearTimeout(this.iTimeoutHandle);
			this.iTimeoutHandle = null;
		}
		iLength = oVm.sOut.length;
		oVm.iLoopCount = 0;
		oVm.bStop = false; //TTT
		//TTT oVm.sStopLabel = "";
		//if (oVm.vmLoopCondition()) {
		try {
			this.fnScript(oVm);
		} catch (e) {
			oVm.sOut += "\n" + String(e) + "\n";
			oVm.error(2); // Syntax Error
		}
		if (oVm.sOut.length !== iLength) {
			this.view.setAreaValue("resultText", oVm.sOut);
		}
		this.fnRunStart1();
		//} else {
		//	this.oVm.vmStopTimer();
		//}
	},

	fnRun: function (sScript) {
		var oVm = this.oVm;

		if (!this.fnScript) {
			oVm.vmInit({
				variables: this.oVariables
			});
			try {
				this.fnScript = new Function("o", sScript); // eslint-disable-line no-new-func
			} catch (e) {
				//TTT sOut += "\n" + String(e) + "\n" + String(e.stack) + "\n";
				Utils.console.error(e);
				this.fnScript = null; //TTT
			}
		} else {
			oVm.vmInitVariables();
		}

		if (this.fnScript) {
			this.oVm.sOut = this.view.getAreaValue("resultText");
			oVm.bStop = false;
			oVm.sStopLabel = "";
			oVm.iStopPriority = 0;
			oVm.iLine = 0; //oVm.goto(0);

			this.iTimeoutHandle = null;


			this.view.setDisabled("runButton", true);
			this.view.setDisabled("stopButton", false);
			this.view.setDisabled("continueButton", true);
			oVm.vmStartTimer();
			this.fnRunStart1();
		}
		if (Utils.debug > 1) {
			Utils.console.debug("DEBUG: End of fnRun");
		}
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
		this.oVm.vmStop("break", 80);
		//this.oVm.error();
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
		this.oVm.vmStartTimer();
		this.fnRunStart1();
	}
};
