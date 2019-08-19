// Controller.js - Controller
//
/* globals CommonEventHandler  */

"use strict";

var Utils, BasicParser, CpcVm;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
	BasicParser = require("./BasicParser.js"); // eslint-disable-line global-require
	CpcVm = require("./CpcVm.js"); // eslint-disable-line global-require
}

function Controller(oModel, oView) {
	this.init(oModel, oView);
}

Controller.prototype = {
	init: function (oModel, oView) {
		this.model = oModel;
		this.view = oView;
		this.commonEventHandler = new CommonEventHandler(oModel, oView, this);

		oView.setHidden("specialArea", !oModel.getProperty("showSpecial"));
		oView.setHidden("inputArea", !oModel.getProperty("showInput"));
		oView.setHidden("outputArea", !oModel.getProperty("showOutput"));
		oView.setHidden("resultArea", !oModel.getProperty("showResult"));
		oView.setHidden("cpcArea", !oModel.getProperty("showCpc"));


		this.mVm = new CpcVm();
	},

	fnParse: function (sInput) {
		var oVariables = this.model.getAllVariables(), // current variables
			oParseOptions, oOutput, oError, iEndPos, sOutput;

		//this.view.setAreaValue("outputText", "");
		oParseOptions = {
			ignoreVarCase: true
		};
		oOutput = new BasicParser(oParseOptions).calculate(sInput, oVariables);
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
