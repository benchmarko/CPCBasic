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

		this.mVm = new CpcVm({}, this.oCanvas);

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

	fnParse: function (sInput) {
		var oParseOptions, oOutput, oError, iEndPos, sOutput;

		//this.view.setAreaValue("outputText", "");
		oParseOptions = {
			ignoreVarCase: true
		};
		oOutput = new BasicParser(oParseOptions).calculate(sInput, {});
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
		this.mVm.sOut = this.view.getAreaValue("resultText");
		if (!oOutput.error) {
			sResult += this.fnRun(sOutput);
		}
		this.view.setAreaValue("resultText", sResult);
		*/
		return oOutput;
	},

	fnRun: function (sScript) {
		var oVm = this.mVm,
			sOut = oVm.sOut,
			fn, rc;

		try {
			fn = new Function("o", sScript); // eslint-disable-line no-new-func
		} catch (e) {
			sOut += "\n" + String(e) + "\n" + String(e.stack) + "\n";
			Utils.console.error(e);
		}

		if (fn) {
			this.mVm.sOut = this.view.getAreaValue("resultText");
			oVm.vmInit();
			try {
				rc = fn(oVm);
				sOut = oVm.sOut;
				if (rc) {
					sOut += rc;
				}
			} catch (e) {
				sOut += "\n" + String(e) + "\n";
			}
		}
		this.view.setAreaValue("resultText", sOut);
		return sOut;
	},

	fnParseRun: function (sInput) {
		var oOutput, sScript;

		oOutput = this.fnParse(sInput);

		if (!oOutput.error) {
			sScript = this.view.getAreaValue("outputText");
			this.fnRun(sScript);
		}
	}
};
