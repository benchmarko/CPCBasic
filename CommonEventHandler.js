// CommonEventHandler.js - Common event handler for browser events
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

function CommonEventHandler(oModel, oView, oController) {
	this.init(oModel, oView, oController);
}

CommonEventHandler.fnEventHandler = null;

CommonEventHandler.prototype = {
	init: function (oModel, oView, oController) {
		this.model = oModel;
		this.view = oView;
		this.controller = oController;

		this.fnUserAction = null;
		this.attachEventHandler();
	},

	fnCommonEventHandler: function (event) {
		var oTarget = event.target,
			sId = (oTarget) ? oTarget.getAttribute("id") : oTarget,
			sType = event.type, // click or change
			sHandler;

		if (this.fnUserAction) {
			this.fnUserAction(event, sId);
		}

		if (sId) {
			if (!oTarget.disabled) { // check needed for IE which also fires for disabled buttons
				sHandler = "on" + Utils.stringCapitalize(sId) + Utils.stringCapitalize(sType);
				if (Utils.debug) {
					Utils.console.debug("fnCommonEventHandler: sHandler=" + sHandler);
				}
				if (sHandler in this) {
					this[sHandler](event);
				} else if (!Utils.stringEndsWith(sHandler, "SelectClick") && !Utils.stringEndsWith(sHandler, "InputClick") && !Utils.stringEndsWith(sHandler, "KeyClick")) { // do not print all messages
					Utils.console.log("Event handler not found: " + sHandler);
				}
			}
		} else if (Utils.debug) {
			Utils.console.debug("Event handler for " + sType + " unknown target " + oTarget);
		}

		if (sType === "click") { // special
			if (sId !== "cpcCanvas") {
				this.onWindowClick(event);
			}
		}
	},

	attachEventHandler: function () {
		if (!CommonEventHandler.fnEventHandler) {
			CommonEventHandler.fnEventHandler = this.fnCommonEventHandler.bind(this);
		}
		this.view.attachEventHandler("click", CommonEventHandler.fnEventHandler);
		this.view.attachEventHandler("change", CommonEventHandler.fnEventHandler);
		return this;
	},

	toogleHidden: function (sId, sProp) {
		var bShow = !this.view.toogleHidden(sId).getHidden(sId);

		this.model.setProperty(sProp, bShow);
	},

	fnActivateUserAction: function (fnAction) {
		this.fnUserAction = fnAction;
	},

	fnDeactivateUserAction: function () {
		this.fnUserAction = null;
	},

	onSpecialLegendClick: function () {
		this.toogleHidden("specialArea", "showSpecial");
	},

	onInputLegendClick: function () {
		this.toogleHidden("inputArea", "showInput");
	},

	onInp2LegendClick: function () {
		this.toogleHidden("inp2Area", "showInp2");
	},

	onOutputLegendClick: function () {
		this.toogleHidden("outputArea", "showOutput");
	},

	onResultLegendClick: function () {
		this.toogleHidden("resultArea", "showResult");
	},

	onVariableLegendClick: function () {
		this.toogleHidden("variableArea", "showVariable");
	},

	onCpcLegendClick: function () {
		this.toogleHidden("cpcArea", "showCpc");
	},

	onKeyboardLegendClick: function () {
		this.toogleHidden("keyboardArea", "showKeyboard");
		if (this.model.getProperty("showKeyboard")) { // maybe we need to draw it
			this.controller.oKeyboard.virtualKeyboardCreate();
		}
	},

	onParseButtonClick: function () {
		this.controller.fnParse();
	},

	onRunButtonClick: function () {
		var sInput = this.view.getAreaValue("outputText");

		this.controller.fnRun(sInput);
	},

	onStopButtonClick: function () {
		this.controller.fnStop();
	},

	onContinueButtonClick: function (event) {
		this.controller.fnContinue();
		this.onCpcCanvasClick(event);
	},

	onResetButtonClick: function () {
		this.controller.fnReset();
	},

	onParseRunButtonClick: function (event) {
		this.controller.fnParseRun();
		this.onCpcCanvasClick(event);
	},

	onHelpButtonClick: function () {
		window.open("https://github.com/benchmarko/CPCBasic/#readme");
	},

	onOutputTextChange: function () {
		this.controller.fnInvalidateScript();
	},

	fnEncodeUriParam: function (params) {
		var aParts = [],
			sKey,
			sValue;

		for (sKey in params) {
			if (params.hasOwnProperty(sKey)) {
				sValue = params[sKey];
				aParts[aParts.length] = encodeURIComponent(sKey) + "=" + encodeURIComponent((sValue === null) ? "" : sValue);
			}
		}
		return aParts.join("&");
	},

	onReloadButtonClick: function () {
		var oChanged = Utils.getChangedParameters(this.model.getAllProperties(), this.model.getAllInitialProperties()),
			sParas = this.fnEncodeUriParam(oChanged);

		sParas = sParas.replace(/%2[Ff]/g, "/"); // unescape %2F -> /
		window.location.search = "?" + sParas;
	},

	onDatabaseSelectChange: function () {
		var that = this,
			sDatabase = this.view.getSelectValue("databaseSelect"),
			sUrl, oDatabase,

			fnDatabaseLoaded = function (/* sFullUrl */) {
				oDatabase.loaded = true;
				Utils.console.log("fnDatabaseLoaded: database loaded: " + sDatabase + ": " + sUrl);
				that.controller.fnSetExampleSelectOptions();
				if (oDatabase.error) {
					Utils.console.error("fnDatabaseLoaded: database contains errors: " + sDatabase + ": " + sUrl);
					that.view.setAreaValue("inputText", oDatabase.script);
					that.view.setAreaValue("resultText", oDatabase.error);
				} else {
					that.onExampleSelectChange();
				}
			},
			fnDatabaseError = function (/* sFullUrl */) {
				oDatabase.loaded = false;
				Utils.console.error("fnDatabaseError: database error: " + sDatabase + ": " + sUrl);
				that.controller.fnSetExampleSelectOptions();
				that.onExampleSelectChange();
				that.view.setAreaValue("inputText", "");
				that.view.setAreaValue("resultText", "Cannot load database: " + sDatabase);
			};
			/*
			fnLoadDatabaseLocalStorage = function () {
				var	oStorage = Utils.localStorage,
					i, sKey, sItem;

				for (i = 0; i < oStorage.length; i += 1) {
					sKey = oStorage.key(i);
					sItem = oStorage.getItem(sKey);
					that.controller.fnAddItem(sKey, sItem);
				}
				fnDatabaseLoaded("", sDatabase);
			};
			*/

		this.model.setProperty("database", sDatabase);
		this.view.setSelectTitleFromSelectedOption("databaseSelect");
		oDatabase = this.model.getDatabase();
		if (!oDatabase) {
			Utils.console.error("onDatabaseSelectChange: database not available: " + sDatabase);
			return;
		}

		if (oDatabase.loaded) {
			this.controller.fnSetExampleSelectOptions();
			this.onExampleSelectChange();
		} else {
			this.view.setAreaValue("inputText", "#loading database " + sDatabase + "...");
			if (sDatabase === "saved") { //TODO (currently not used)
				sUrl = "localStorage";
				//fnLoadDatabaseLocalStorage(sDatabase);
			} else {
				sUrl = oDatabase.src + "/" + this.model.getProperty("exampleIndex");
				Utils.loadScript(sUrl, fnDatabaseLoaded, fnDatabaseError);
			}
		}
	},


	onExampleSelectChange: function () {
		var that = this,
			sExample = this.view.getSelectValue("exampleSelect"),
			sUrl, oExample, sDatabaseDir,

			fnExampleLoaded = function (sFullUrl, bSuppressLog) {
				var sInput;

				if (!bSuppressLog) {
					Utils.console.log("Example " + sUrl + " loaded");
				}

				oExample = that.model.getExample(sExample);
				sInput = oExample.script;
				that.view.setAreaValue("inputText", sInput);
				that.view.setAreaValue("resultText", "");
				that.controller.fnReset2();
				if (!oExample.type || oExample.type !== "data") {
					that.controller.fnParseRun();
				}
			},
			fnExampleError = function () {
				Utils.console.log("Example " + sUrl + " error");
				that.view.setAreaValue("inputText", "");
				that.view.setAreaValue("resultText", "Cannot load example: " + sExample);
			};

		this.model.setProperty("example", sExample);
		this.view.setSelectTitleFromSelectedOption("exampleSelect");
		oExample = this.model.getExample(sExample); // already loaded
		if (oExample && oExample.loaded) {
			fnExampleLoaded("", true);
		} else if (sExample && oExample) { // need to load
			this.view.setAreaValue("inputText", "#loading " + sExample + "...");
			this.view.setAreaValue("resultText", "waiting...");
			sDatabaseDir = this.model.getDatabase().src;
			sUrl = sDatabaseDir + "/" + sExample + ".js";
			Utils.loadScript(sUrl, fnExampleLoaded, fnExampleError);
		} else {
			this.view.setAreaValue("inputText", "");
			this.model.setProperty("example", "");
		}
	},

	onVarSelectChange: function () {
		var sPar = this.view.getSelectValue("varSelect"),
			oVariables = this.controller.oVariables,
			sValue;

		sValue = oVariables[sPar];
		if (sValue === undefined) {
			sValue = "";
		}
		this.view.setAreaValue("varText", sValue);
	},

	onVarTextChange: function () {
		var sPar = this.view.getSelectValue("varSelect"),
			sValue = this.view.getSelectValue("varText"),
			oVariables = this.controller.oVariables,
			sType, value;

		if (typeof oVariables[sPar] === "function") { // TODO
			value = sValue;
			value = new Function("o", value); // eslint-disable-line no-new-func
		} else {
			sType = this.controller.oVm.vmDetermineVarType(sPar);
			if (sType !== "$") { // not string? => convert to number
				value = parseFloat(sValue);
			} else {
				value = sValue;
			}
		}
		Utils.console.log("Variable", sPar, "changed:", oVariables[sPar], "=>", value);
		oVariables[sPar] = value;

		this.controller.fnSetVarSelectOptions("varSelect", oVariables);
		this.onVarSelectChange(); // title change?
	},

	onScreenshotButtonClick: function () {
		var sExample = this.view.getSelectValue("exampleSelect"),
			image = this.controller.fnScreenshot(),
			link = document.getElementById("screenshotLink"),
			sName = sExample + ".png";

		link.setAttribute("download", sName);
		link.setAttribute("href", image);
		link.click();
	},

	onEnterButtonClick: function () {
		this.controller.fnEnter();
	},

	onSoundButtonClick: function () {
		this.model.setProperty("sound", !this.model.getProperty("sound"));
		this.controller.fnSetSoundActive();
	},

	onCpcCanvasClick: function (event) {
		this.controller.oCanvas.onCpcCanvasClick(event);
		this.controller.oKeyboard.setActive(true);
	},

	onWindowClick: function (event) {
		this.controller.oCanvas.onWindowClick(event);
		this.controller.oKeyboard.setActive(false);
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = CommonEventHandler;
}
