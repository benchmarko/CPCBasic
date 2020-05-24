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
				} else if (!Utils.stringEndsWith(sHandler, "SelectClick") && !Utils.stringEndsWith(sHandler, "InputClick")) { // do not print all messages
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
			this.controller.oKeyboard.virtualKeyboardCreate(); // maybe draw it
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
		var oChanged = Utils.getChangedParameters(this.model.getAllProperties(), this.model.getAllInitialProperties()),
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
					that.view.setAreaValue("inputText", oDatabase.script);
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
				that.view.setAreaValue("inputText", "");
				that.view.setAreaValue("resultText", "Cannot load database: " + sDatabase);
			};

		this.model.setProperty("database", sDatabase);
		this.view.setSelectTitleFromSelectedOption("databaseSelect");
		oDatabase = this.model.getDatabase();
		if (!oDatabase) {
			Utils.console.error("onDatabaseSelectChange: database not available:", sDatabase);
			return;
		}

		if (oDatabase.loaded) {
			this.controller.setExampleSelectOptions();
			this.onExampleSelectChange();
		} else {
			this.view.setAreaValue("inputText", "#loading database " + sDatabase + "...");
			sUrl = oDatabase.src + "/" + this.model.getProperty("exampleIndex");
			Utils.loadScript(sUrl, fnDatabaseLoaded, fnDatabaseError);
		}
	},


	/*
	onExampleSelectChange: function () {
		var that = this,
			sExample = this.view.getSelectValue("exampleSelect"),
			sUrl, oExample, sDatabaseDir,

			fnExampleLoaded = function (sFullUrl, bSuppressLog) {
				var sInput;

				if (!bSuppressLog) {
					Utils.console.log("Example", sUrl, "loaded");
				}

				oExample = that.model.getExample(sExample);
				sInput = oExample.script;
				that.view.setAreaValue("inputText", sInput);
				that.view.setAreaValue("resultText", "");
				that.controller.fnReset();
				if (!oExample.type || oExample.type !== "data") {
					that.controller.startParseRun();
				}
			},
			fnExampleError = function () {
				Utils.console.log("Example", sUrl, " error");
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
	*/

	onExampleSelectChange: function () {
		var oController = this.controller,
			oVm = oController.oVm,
			oInFile = oVm.vmGetInFileObject(),
			sExample, oExample;

		oVm.closein();

		oInFile.bOpen = true;

		sExample = this.view.getSelectValue("exampleSelect");
		oExample = this.model.getExample(sExample);
		if (oExample && oExample.meta && oExample.meta.charAt(0) === "D") { // data only?
			oInFile.sCommand = "load";
		} else {
			oInFile.sCommand = "run";
		}

		/*
		this.model.setProperty("example", sExample); // maybe with path

		iLastSlash = sExample.lastIndexOf("/");
		if (iLastSlash >= 0) {
			sExample = sExample.substr(iLastSlash + 1); // keep just the name
		}
		*/


		oInFile.sName = "/" + sExample; // load absolute
		oInFile.fnFileCallback = null;
		oVm.vmStop("fileLoad", 90);
		oController.startMainLoop();
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
