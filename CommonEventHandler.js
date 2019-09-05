// CommonEventHandler.js - CommonEventHandler
//
/* globals */

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

		this.attachEventHandler();
	},

	fnCommonEventHandler: function (event) {
		var oTarget = event.target,
			sId = (oTarget) ? oTarget.getAttribute("id") : oTarget,
			sType, sHandler;

		if (sId) {
			if (!oTarget.disabled) { // check needed for IE which also fires for disabled buttons
				sType = event.type; // click or change
				sHandler = "on" + Utils.stringCapitalize(sId) + Utils.stringCapitalize(sType);
				if (Utils.debug) {
					Utils.console.debug("fnCommonEventHandler: sHandler=" + sHandler);
				}
				if (sHandler in this) {
					this[sHandler](event);
				} else if (!Utils.stringEndsWith(sHandler, "SelectClick") && !Utils.stringEndsWith(sHandler, "InputClick")) { // do not print all messages
					Utils.console.log("Event handler not found: " + sHandler);
				}
			}
		} else if (Utils.debug) {
			Utils.console.debug("Event handler for " + event.type + " unknown target " + oTarget);
		}
	},

	attachEventHandler: function () {
		if (!CommonEventHandler.fnEventHandler) {
			CommonEventHandler.fnEventHandler = this.fnCommonEventHandler.bind(this);
		}
		this.view.attachEventHandler(CommonEventHandler.fnEventHandler);
		return this;
	},

	toogleHidden: function (sId, sProp) {
		var bShow = !this.view.toogleHidden(sId).getHidden(sId);

		this.model.setProperty(sProp, bShow);
	},

	onSpecialLegendClick: function () {
		this.toogleHidden("specialArea", "showSpecial");
	},

	onInputLegendClick: function () {
		this.toogleHidden("inputArea", "showInput");
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

	onParseButtonClick: function () {
		var sInput = this.view.getAreaValue("inputText");

		this.controller.fnParse(sInput);
	},

	onRunButtonClick: function () {
		var sInput = this.view.getAreaValue("outputText");

		this.controller.fnRun(sInput);
	},

	onStopButtonClick: function () {
		this.controller.fnStop();
	},

	onContinueButtonClick: function () {
		this.controller.fnContinue();
	},

	onParseRunButtonClick: function () {
		var sInput = this.view.getAreaValue("inputText");

		this.controller.fnParseRun(sInput);
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
		var oChanged = Utils.getChangedParameters(this.model.getAllProperties(), this.model.getAllInitialProperties());

		window.location.search = "?" + this.fnEncodeUriParam(oChanged); // jQuery.param(oChanged, true)
	},

	onExampleSelectChange: function () {
		var that = this,
			sExample = this.view.getSelectValue("exampleSelect"),
			sUrl, oExample,

			fnExampleLoaded = function (sFullUrl, bSuppressLog) {
				var sInput;

				if (!bSuppressLog) {
					Utils.console.log("Example " + sUrl + " loaded");
				}

				oExample = that.model.getExample(sExample);
				sInput = oExample.script;
				that.view.setAreaValue("inputText", sInput);
				that.view.setAreaValue("outputText", "");
			},
			fnExampleError = function () {
				Utils.console.log("Example " + sUrl + " error");
				that.view.setAreaValue("inputText", "");
				that.view.setAreaValue("outputText", "Cannot load example: " + sExample);
			};

		this.model.setProperty("example", sExample);
		this.view.setSelectTitleFromSelectedOption("exampleSelect");
		oExample = this.model.getExample(sExample); // already loaded
		if (oExample && oExample.loaded) {
			fnExampleLoaded("", true);
		} else if (sExample && oExample) { // need to load
			this.view.setAreaValue("inputText", "#loading " + sExample + "...");
			this.view.setAreaValue("outputText", "waiting...");

			sUrl = this.model.getProperty("exampleDir") + "/" + sExample + ".js";
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
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = CommonEventHandler;
}
