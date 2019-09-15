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

		this.fnRunStart1Handler = this.fnRunStart1.bind(this);
		//this.fnKeyDownHandler = this.fnOnKeyDown.bind(this);
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

	fnWaitForKey: function () {
		var sKey;

		this.oCanvas.options.fnOnKeyDown = null;
		sKey = this.oCanvas.getKeyFromBuffer();
		this.oVm.vmStop("", 0, true);
		//this.oVm.sStopLabel = "";
		//this.oVm.iStopPriority = 0;
		Utils.console.log("Wait for key: " + sKey);
		if (this.iTimeoutHandle === null) {
			this.fnRunStart1();
		}
	},

	fnWaitForInput: function () {
		var sInput = this.oVm.vmGetInput(),
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
			//this.oVm.sStopLabel = "";
			//this.oVm.iStopPriority = 0;
			this.oVm.vmStop("", 0, true);
			Utils.console.log("Wait for input: " + sInput);
			if (this.oVm.fnInputCallback !== null) {
				this.oVm.fnInputCallback(sInput);
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
			this.oVm.print(0, sOutput + "\n"); // Error
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
			//oVm.sStopLabel = "";
			//oVm.iStopPriority = 0;
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

	fnRunStart1: function () {
		var oVm = this.oVm,
			iTimeOut = 0;

		if (oVm.sStopLabel === "") {
			this.fnRunPart1();
		}

		switch (oVm.sStopLabel) {
		case "":
			break;

		case "break":
			break;

		case "end":
			break;

		case "error":
			break;

		case "frame":
			//oVm.sStopLabel = "";
			//oVm.iStopPriority = 0;
			oVm.vmStop("", 0, true);
			iTimeOut = oVm.vmGetTimeUntilFrame(); // wait until next frame
			break;

		case "input":
			this.oCanvas.options.fnOnKeyDown = this.fnOnWaitForInput; // wait until keypress handler
			oVm.vmSetInput("");
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
			this.fnRun2(oVm.vmGetNextInput("")); //TTT
			break;

		case "stop":
			break;

		case "timer":
			//oVm.sStopLabel = "";
			//oVm.iStopPriority = 0;
			oVm.vmStop("", 0, true);
			break;

		default:
			Utils.console.warn("fnRunStart1: Unknown run mode: " + oVm.sStopLabel);
			break;
		}

		if (!oVm.sStopLabel) {
			this.iTimeoutHandle = setTimeout(this.fnRunStart1Handler, iTimeOut);
		} else {
			this.view.setAreaValue("resultText", oVm.sOut);
			this.view.setAreaScrollTop("resultText"); // scroll to bottom

			this.view.setDisabled("runButton", false);
			this.view.setDisabled("stopButton", true);
			this.view.setDisabled("continueButton", oVm.sStopLabel === "end" || oVm.sStopLabel === "reset");
			if (this.oVariables) {
				this.fnSetVarSelectOptions("varSelect", this.oVariables);
				this.commonEventHandler.onVarSelectChange();
			}
			this.iTimeoutHandle = null; // not running any more
		}
	},

	/*
	fnTestScript1: function (o) {
		var v = o.v;

		//while (1) { //o.vmLoopCondition()) {
			switch (o.iLine) {
			case 0:
			case "s0":
				v.i = 0;
				v.t = o.time() + 1500;
			case 110:
				if (o.time() < v.t) {
					v.i = v.i + 1; o.goto(110);
					break;
				}
			case 120:
				o.print(0, v.i, "\n");
			case "end":
				o.vmStop("end", 90);
				break;
			default:
				o.error(8);
				o.goto("end");
				break;
			}
	//return;
	//	}
	},

	fnTest2: function () {
		var oVm = this.oVm;

		this.fnTestScript1(oVm);

		if (oVm.sStopLabel === "") {
			//setTimeout(this.fnTest2.bind(this), 0);
			setTimeout(this.fnTest2Bound, 0);
			//return this.fnTest2Bound();
		} else {
			Utils.console.log("DEBUG: fnTest2: stopped with i=" + oVm.v.i);
		}
	},

	fnTest2Bound: null,

	fnTest1: function () {
		var oVm = this.oVm;

		oVm.vmInitStack();
		oVm.vmInitVariables();
		oVm.vmInitInks();
		oVm.clearInput();

		oVm.sStopLabel = "";
		oVm.iStopPriority = 0;
		oVm.iLine = 0;

		this.fnTest2Bound = this.fnTest2.bind(this);
		this.fnTest2();

		//while (oVm.sStopLabel === "") {
		//	this.fnTestScript1(oVm);
		//}
		//Utils.console.log("DEBUG: fnTest1 finsished: i=" + oVm.v.i);
	},
	*/

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
		this.oVm.vmStop("break", 80);
		/*
		if (sStopLabel === "key" || sStopLabel === "input") { // current sStopLabel was key or input? //TODO
			this.oCanvas.options.fnOnKeyDown = null;
		}
		*/
		if (this.iTimeoutHandle === null) {
			this.fnRunStart1();
		}
	},

	fnContinue: function () {
		var oVm = this.oVm;

		this.view.setDisabled("runButton", true);
		this.view.setDisabled("stopButton", false);
		this.view.setDisabled("continueButton", true);
		if (oVm.sStopLabel === "break" || oVm.sStopLabel === "stop") {
			this.oVm.vmStop("", 0, true);
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
	}

};
