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


/*
// test
function Stat(bVari) {
	this.bVari = bVari;
}

Stat.prototype = {
	collect: function (x) {
		if (!this.cnt) { // set values the first time
			this.min = x;
			this.max = x;
			this.cnt = 1;
			this.avg = x;
			this.sum = x;
			if (this.bVari) {
				this.vri = 0;
			}
		} else {
			this.cnt += 1;
			this.sum += x;

			if (this.bVari) { // variance...
				this.vri = (this.cnt - 2.0) / (this.cnt - 1.0) * (this.vri) + (x - this.avg) * (x - this.avg) / this.cnt;
			}

			this.avg += (x - this.avg) / this.cnt;

			if (x < this.min) {
				this.min = x;
			} else if (x > this.max) {
				this.max = x;
			}
		}
	},

	postprocess: function () {
		if (this.bVari) {
			this.std = (this.vri !== null) ? Math.sqrt(this.vri) : 0; // compute standard deviation from variance (0 for undefined)
		}
	},

	get: function (sType) {
		return this[sType]; // 'sum', 'cnt', 'avg', 'min', 'max', 'vri', 'std'
	},

	toFormattedString: function (aTypes) {
		var aResult = [],
			sType, i;

		for (i = 0; i < aTypes.length; i += 1) {
			sType = aTypes[i];
			aResult.push(this.get(sType));
		}
		return aResult.join(", ");
	}
};
*/


function Controller(oModel, oView) {
	this.init(oModel, oView);
}

Controller.prototype = {
	init: function (oModel, oView) {
		var sExample;

		this.model = oModel;
		this.view = oView;
		this.commonEventHandler = new CommonEventHandler(oModel, oView, this);

		//oView.setHidden("specialArea", !oModel.getProperty("showSpecial"));
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
		//this.fnKeyDownHandler = this.fnOnKeyDown.bind(this);
		this.fnOnWaitForKey = this.fnWaitForKey.bind(this);
		this.fnOnWaitForInput = this.fnWaitForInput.bind(this);

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
		//oVm.bStop = false;
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

	fnWaitForKey: function () {
		var sKey;

		this.oCanvas.options.fnOnKeyDown = null;
		sKey = this.oCanvas.getKeyFromBuffer();
		this.oVm.sStopLabel = "";
		this.oVm.iStopPriority = 0;
		Utils.console.log("Wait for key: " + sKey);
		this.fnRunStart1(); // continue
	},

	fnWaitForInput: function () {
		var sInput = this.oVm.vmGetInput(), //this.sBufferedInput,
			sKey;

		do {
			sKey = this.oVm.inkey$(); // or: for iKey: this.oCanvas.getKeyFromBuffer();
			if (sKey !== "") { // chr13 shows as empty string!
				sInput += sKey;
				this.oVm.print(0, sKey);
			}
		} while (sKey !== "" && sKey !== "\n" && sKey.charCodeAt(0) !== 13); // get all keys until newline

		this.oVm.vmSetInput(sInput);
		if (sKey.charCodeAt(0) === 13 || sKey === "\n") {
			this.oCanvas.options.fnOnKeyDown = null;
			this.oVm.sStopLabel = "";
			this.oVm.iStopPriority = 0;
			Utils.console.log("Wait for input: " + sInput);
			//this.oVm.vmSetInput(sInput);
			if (this.oVm.fnInputCallback !== null) {
				this.oVm.fnInputCallback(sInput);
			}
			this.fnRunStart1(); // continue
		}
	},

	fnRunStart1: function () {
		var oVm = this.oVm,
			iTimeOut = 0,
			iTimeUntilFrame;

		iTimeUntilFrame = oVm.vmCheckNextFrame();
		/*
		if (Utils.debug > 1) {
			if (!this.oStat1) {
				this.oStat1 = new Stat(true);
			}
			this.oStat1.collect(iTimeUntilFrame);
		}
		*/

		switch (oVm.sStopLabel) {
		case "timer":
			oVm.sStopLabel = "";
			oVm.iStopPriority = 0;
			break;

		case "frame":
			oVm.sStopLabel = "";
			oVm.iStopPriority = 0;
			iTimeOut = iTimeUntilFrame; // wait until next frame
			break;

		case "reset":
			oVm.vmReset();
			// now fall through
		case "break":
			// fall through
		case "end":
			// fall through
		case "error":
			// fall through
		case "stop":
			this.view.setDisabled("runButton", false);
			this.view.setDisabled("stopButton", true);
			this.view.setDisabled("continueButton", oVm.sStopLabel === "end" || oVm.sStopLabel === "reset");
			this.fnSetVarSelectOptions("varSelect", this.oVariables);
			this.commonEventHandler.onVarSelectChange();
			if (Utils.debug > 0) {
				/*
				if (this.oStat1) {
					this.oStat1.postprocess(); // compute std
					Utils.console.log("fnRunStart1: " + oVm.sStopLabel + ": stat1: " + this.oStat1.toFormattedString(["min", "max", "avg", "std", "sum"])); // hdr,min,max,avg,std,sum
					this.oStat1 = null;
				}
				*/
				Utils.console.log("fnRunStart1: " + oVm.sStopLabel + ": " + oVm.vmStatStop());
			}
			//return;
			break;

		case "key":
			this.oCanvas.options.fnOnKeyDown = this.fnOnWaitForKey; // wait until keypress handler
			//return;
			break;

		case "input":
			this.oCanvas.options.fnOnKeyDown = this.fnOnWaitForInput; // wait until keypress handler
			oVm.vmSetInput("");
			this.fnWaitForInput();
			//return;
			break;

			/*
		case "run": // TODO: run with line number
			oVm.sStopLabel = "";
			oVm.iStopPriority = 0;
			iNextLine = oVm.iLine; // save line
			oVm.vmInitVariables();
			oVm.vmInitStack();
			oVm.clearInput();
			oVm.goto(iNextLine);
			break;
			*/

		default:
			break;
		}

		if (!oVm.sStopLabel) {
			this.iTimeoutHandle = setTimeout(this.fnRunPartHandler, iTimeOut);
		}
	},

	fnRun: function (sScript) {
		var oVm = this.oVm;

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
			//oVm.bStop = false;
			oVm.sStopLabel = "";
			oVm.iStopPriority = 0;
			oVm.iLine = 0;

			this.iTimeoutHandle = null;


			this.view.setDisabled("runButton", true);
			this.view.setDisabled("stopButton", false);
			this.view.setDisabled("continueButton", true);

			if (Utils.debug > 0) {
				oVm.vmStatStart(); //TTT
			}
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
		if (sStopLabel === "key" || sStopLabel === "input") { // current sStopLabel was key or input?
			this.oCanvas.options.fnOnKeyDown = null;
			this.fnRunStart1(); //TTT handle break
		}
	},

	fnContinue: function () {
		var oVm = this.oVm;

		this.iTimeoutHandle = null;

		this.view.setDisabled("runButton", true);
		this.view.setDisabled("stopButton", false);
		this.view.setDisabled("continueButton", true);
		if (oVm.sStopLabel === "break" || oVm.sStopLabel === "stop") {
			oVm.sStopLabel = "";
			oVm.iStopPriority = 0;
		}
		this.fnRunStart1();
	},

	fnReset: function () {
		var oVm = this.oVm,
			sStopLabel = oVm.sStopLabel;

		this.fnStop();
		oVm.vmStop("reset", 99);
		if (sStopLabel === "break" || sStopLabel === "end" || sStopLabel === "error") {
			oVm.vmReset();
		}
		this.view.setDisabled("continueButton", true);
	}

};
