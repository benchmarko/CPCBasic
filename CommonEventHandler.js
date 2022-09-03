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
				} else if (!sHandler.endsWith("SelectClick") && !sHandler.endsWith("InputClick")) { // do not print all messages
					Utils.console.log("Event handler not found:", sHandler);
				}
			}
		} else if (oTarget.getAttribute("data-key") === null) { // not for keyboard buttons
			if (Utils.debug) {
				Utils.console.debug("Event handler for", sType, "unknown target:", oTarget.tagName, oTarget.id);
			}
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

	toogleHidden: function (sId, sProp, sDisplay) {
		var bVisible = !this.model.getProperty(sProp);

		this.model.setProperty(sProp, bVisible);
		this.view.setHidden(sId, !bVisible, sDisplay);
		return bVisible;
	},

	fnActivateUserAction: function (fnAction) {
		this.fnUserAction = fnAction;
	},

	fnDeactivateUserAction: function () {
		this.fnUserAction = null;
	},

	onSpecialButtonClick: function () {
		this.toogleHidden("specialArea", "showSpecial");
	},

	onInputButtonClick: function () {
		this.toogleHidden("inputArea", "showInput");
	},

	onInp2ButtonClick: function () {
		this.toogleHidden("inp2Area", "showInp2");
	},

	onOutputButtonClick: function () {
		this.toogleHidden("outputArea", "showOutput");
	},

	onResultButtonClick: function () {
		this.toogleHidden("resultArea", "showResult");
	},

	onTextButtonClick: function () {
		this.toogleHidden("textArea", "showText");
	},

	onVariableButtonClick: function () {
		this.toogleHidden("variableArea", "showVariable");
	},

	onCpcButtonClick: function () {
		if (this.toogleHidden("cpcArea", "showCpc")) {
			this.controller.oCanvas.startUpdateCanvas();
		} else {
			this.controller.oCanvas.stopUpdateCanvas();
		}
	},

	onKbdButtonClick: function () {
		if (this.toogleHidden("kbdArea", "showKbd", "flex")) {
			if (this.view.getHidden("kbdArea")) { // on old browsers, display "flex" is not available, so set "block" if still hidden
				this.view.setHidden("kbdArea", false);
			}
			this.controller.virtualKeyboardCreate(); // maybe draw it
		}
	},

	onKbdLayoutButtonClick: function () {
		this.toogleHidden("kbdLayoutArea", "showKbdLayout");
	},

	onConsoleButtonClick: function () {
		this.toogleHidden("consoleArea", "showConsole");
	},

	onParseButtonClick: function () {
		this.controller.startParse();
	},

	onRenumButtonClick: function () {
		this.controller.startRenum();
	},

	onPrettyButtonClick: function () {
		this.controller.fnPretty();
	},

	fnUpdateAreaText: function (sInput) {
		this.controller.setInputText(sInput, true);
		this.view.setAreaValue("outputText", "");
	},

	onUndoButtonClick: function () {
		var sInput = this.controller.inputStack.undo();

		this.fnUpdateAreaText(sInput);
	},

	onRedoButtonClick: function () {
		var sInput = this.controller.inputStack.redo();

		this.fnUpdateAreaText(sInput);
	},

	onRunButtonClick: function () {
		var sInput = this.view.getAreaValue("outputText");

		this.controller.startRun(sInput);
	},

	onStopButtonClick: function () {
		this.controller.startBreak();
	},

	onContinueButtonClick: function (event) {
		this.controller.startContinue();
		this.onCpcCanvasClick(event);
	},

	onResetButtonClick: function () {
		this.controller.startReset();
	},

	onParseRunButtonClick: function (event) {
		this.controller.startParseRun();
		this.onCpcCanvasClick(event);
	},

	onHelpButtonClick: function () {
		window.open("https://github.com/benchmarko/CPCBasic/#readme");
	},

	onInputTextClick: function () {
		// nothing
	},

	onOutputTextClick: function () {
		// nothing
	},

	onResultTextClick: function () {
		// nothing
	},

	onVarTextClick: function () {
		// nothing
	},

	onOutputTextChange: function () {
		this.controller.invalidateScript();
	},

	encodeUriParam: function (params) {
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
		var oChanged = this.model.getChangedProperties(),
			sParas = this.encodeUriParam(oChanged);

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
				that.controller.setExampleSelectOptions();
				if (oDatabase.error) {
					Utils.console.error("fnDatabaseLoaded: database contains errors: " + sDatabase + ": " + sUrl);
					that.controller.setInputText(oDatabase.script);
					that.view.setAreaValue("resultText", oDatabase.error);
				} else {
					that.onExampleSelectChange();
				}
			},
			fnDatabaseError = function (/* sFullUrl */) {
				oDatabase.loaded = false;
				Utils.console.error("fnDatabaseError: database error: " + sDatabase + ": " + sUrl);
				that.controller.setExampleSelectOptions();
				that.onExampleSelectChange();
				that.controller.setInputText("");
				that.view.setAreaValue("resultText", "Cannot load database: " + sDatabase);
			};

		this.model.setProperty("database", sDatabase);
		this.view.setSelectTitleFromSelectedOption("databaseSelect");
		oDatabase = this.model.getDatabase();
		if (!oDatabase) {
			Utils.console.error("onDatabaseSelectChange: database not available:", sDatabase);
			return;
		}

		if (oDatabase.text === "storage") { // sepcial handling: browser localStorage
			this.controller.updateStorageDatabase("set", null); // set all
			oDatabase.loaded = true;
		}

		if (oDatabase.loaded) {
			this.controller.setExampleSelectOptions();
			this.onExampleSelectChange();
		} else {
			that.controller.setInputText("#loading database " + sDatabase + "...");
			sUrl = oDatabase.src + "/" + this.model.getProperty("exampleIndex");
			Utils.loadScript(sUrl, fnDatabaseLoaded, fnDatabaseError, sDatabase);
		}
	},

	onExampleSelectChange: function () {
		var oController = this.controller,
			oVm = oController.oVm,
			oInFile = oVm.vmGetInFileObject(),
			sDataBase = this.model.getProperty("database"),
			sExample, oExample, sType;

		oVm.closein();

		oInFile.bOpen = true;

		sExample = this.view.getSelectValue("exampleSelect");
		oExample = this.model.getExample(sExample);
		oInFile.sCommand = "run";
		if (oExample && oExample.meta) { // TODO: this is just a workaround, meta is in input now; should change command after loading!
			sType = oExample.meta.charAt(0);
			if (sType === "B" || sType === "D" || sType === "G") { // binary, data only, Gena Assembler?
				oInFile.sCommand = "load";
			}
		}

		if (sDataBase !== "storage") {
			sExample = "/" + sExample; // load absolute
		} else {
			this.model.setProperty("example", sExample);
		}

		oInFile.sName = sExample;
		oInFile.iStart = undefined;
		oInFile.fnFileCallback = oVm.fnLoadHandler;
		oVm.vmStop("fileLoad", 90);
		oController.startMainLoop();
	},

	onVarSelectChange: function () {
		var sPar = this.view.getSelectValue("varSelect"),
			oVariables = this.controller.oVariables,
			sValue;

		sValue = oVariables.getVariable(sPar);
		if (sValue === undefined) {
			sValue = "";
		}
		this.view.setAreaValue("varText", sValue);
	},

	onKbdLayoutSelectChange: function () {
		var sValue = this.view.getSelectValue("kbdLayoutSelect");

		this.model.setProperty("kbdLayout", sValue);
		this.view.setSelectTitleFromSelectedOption("kbdLayoutSelect");

		this.view.setHidden("kbdAlpha", sValue === "num");
		this.view.setHidden("kbdNum", sValue === "alpha");
	},

	onVarTextChange: function () {
		this.controller.changeVariable();
	},

	onScreenshotButtonClick: function () {
		var sExample = this.view.getSelectValue("exampleSelect"),
			image = this.controller.startScreenshot(),
			link = document.getElementById("screenshotLink"),
			sName = sExample + ".png";

		link.setAttribute("download", sName);
		link.setAttribute("href", image);
		link.click();
	},

	onEnterButtonClick: function () {
		this.controller.startEnter();
	},

	onSoundButtonClick: function () {
		this.model.setProperty("sound", !this.model.getProperty("sound"));
		this.controller.setSoundActive();
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
