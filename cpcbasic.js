// cpcbasic.js - GCFiddle
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CpcBasic/
//
/* XXXglobals Controller, Model, BasicParser, Utils, View */

/* globals BasicParser, Utils */

//TTT file:///E:/work/develop/2019/CPCBasic/cpcbasic.html

"use strict";

/* ... */

function Model(config, initialConfig) {
	this.init(config, initialConfig);
}

Model.prototype = {
	init: function (config, initialConfig) {
		this.config = config || {}; // store only a reference
		this.initialConfig = initialConfig || {};
		this.initVariables();
	},
	getProperty: function (sProperty) {
		return this.config[sProperty];
	},
	setProperty: function (sProperty, sValue) {
		this.config[sProperty] = sValue;
		return this;
	},
	getAllProperties: function () {
		return this.config;
	},
	getAllInitialProperties: function () {
		return this.initialConfig;
	},

	getVariable: function (sVar) {
		return this.variables[sVar];
	},
	setVariable: function (sVar, sValue) {
		this.variables[sVar] = sValue;
		return this;
	},
	getAllVariables: function () {
		return this.variables;
	},
	initVariables: function () {
		this.variables = { };
		return this;
	}
};

/* ... */

function View(options) {
	this.init(options);
}

View.fnEventHandler = null;

View.prototype = {
	init: function (/* options */) {
		this.bDirty = false;
	},

	getHidden: function (sId) {
		return document.getElementById(sId).hidden;
	},
	setHidden: function (sId, bHidden) {
		var element = document.getElementById(sId);

		element.hidden = bHidden;
		element.style.display = (bHidden) ? "none" : "block"; // for old browsers
		return this;
	},
	toogleHidden: function (sId) {
		return this.setHidden(sId, !this.getHidden(sId));
	},

	getAreaValue: function (sId) {
		var area = document.getElementById(sId);

		return area.value;
	},
	setAreaValue: function (sId, sValue) {
		var area = document.getElementById(sId);

		area.value = sValue;
		return this;
	},

	fnSetSelectionRange: function (textarea, selectionStart, selectionEnd) {
		var fullText, scrollHeight, scrollTop, textareaHeight;

		// First scroll selection region to view
		fullText = textarea.value;
		textarea.value = fullText.substring(0, selectionEnd);
		// For some unknown reason, you must store the scollHeight to a variable before setting the textarea value. Otherwise it won't work for long strings
		scrollHeight = textarea.scrollHeight;
		textarea.value = fullText;
		scrollTop = scrollHeight;
		textareaHeight = textarea.clientHeight;
		if (scrollTop > textareaHeight) {
			// scroll selection to center of textarea
			scrollTop -= textareaHeight / 2;
		} else {
			scrollTop = 0;
		}
		textarea.scrollTop = scrollTop;

		// Continue to set selection range
		textarea.setSelectionRange(selectionStart, selectionEnd);
	},
	setAreaSelection: function (sId, iPos, iEndPos) {
		var area = document.getElementById(sId);

		if (area.selectionStart !== undefined) {
			if (area.setSelectionRange) {
				area.focus(); // not needed for scrolling but we want to see the selected text
				this.fnSetSelectionRange(area, iPos, iEndPos);
			} else {
				area.focus();
				area.selectionStart = iPos;
				area.selectionEnd = iEndPos;
			}
		}
		return this;
	},

	attachEventHandler: function (fnEventHandler) {
		if (Utils.debug) {
			Utils.console.debug("attachEventHandler: fnEventHandler=" + fnEventHandler);
		}
		document.addEventListener("click", fnEventHandler, false);
		document.addEventListener("change", fnEventHandler, false);

		/*
		varInput = document.getElementById("varInput");
		if (varInput.addEventListener) { // not for IE8
			varInput.addEventListener("input", fnEventHandler, false); // for range slider
		}
		*/
		return this;
	}
};

/* ... */

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

	onCpcLegendClick: function () {
		this.toogleHidden("cpcArea", "showCpc");
	},


	mVm: {
		iLine: 0,
		bStop: false,
		iStartTime: Date.now(),
		sOut: "",
		v: {}, // variables
		iZone: 13,

		vmInit: function () {
			this.iLine = 0;
			this.bStop = false;
			this.iStartTime = Date.now();
			this.sOut = "";
			this.v = {};
			this.iZone = 13;
		},

		vmDefault: function () {
			//Utils.console.log("vmDefault: " + this.iLine);
			this.sOut += "Line not found: " + this.iLine;
			this.bStop = true;
		},
		/*
		vmSleep: async function (n) {
			function Sleep(milliseconds) {
				return new Promise(resolve => setTimeout(resolve, milliseconds));
			}
			Utils.console.log("before sleep");
			await Sleep(n);
			Utils.console.log("after sleep");
		},
		*/

		call: function (n) {
			Utils.console.log("call: " + n);
			if (n === 0xbd19) {
				this.bStop = true; //HOWTO??
				//this.vmSleep(3000); //TTT
			}
			Utils.console.log("call end: " + n);
		},

		cls: function (n) {
			Utils.console.log("cls: " + n);
			this.sOut = "";
		},
		end: function () {
			this.bStop = true;
		},
		"goto": function (n) {
			//Utils.console.log("goto: " + n);
			this.iLine = n;
		},
		mode: function (n) {
			Utils.console.log("mode: " + n);
			this.sOut = "";
		},
		print: function (s) {
			var s = "",
				i;

			for (i = 0; i < arguments.length; i += 1) {
				s += arguments[i];
			}
			this.sOut += s;
		},
		stop: function () {
			//Utils.console.log("stop");
			this.bStop = true;
		},
		tab: function () {
			return "   "; //TODO
		},
		time: function () {
			return Math.floor((Date.now() - this.iStartTime) * 300 / 1000); //TODO since program start
		},
		wait: function (iPort, iMask, iInv) {
			if (iPort === 0) {
				debugger;
			}
		}
	},

	/*
	fnExecTest1: function () {
		var sOut = "",
			iLine = 0,
			bStop = false,
			a,
			clear = function () {
				a = 0;
			},
			cls = function () {
				sOut = "";
			},
			goto = function (n) {
				iLine = n;
			},
			print = function (s) {
				Utils.console.log("print: " + s);
				sOut += s;
			},
			stop = function () {
				//Utils.console.log("stop");
				bStop = true;
			};

		//eval("var a = 0;"); //TTT

		function simulate() {
			while (!bStop) {
				switch (iLine) {
					case 0:
					case 50: cls();
					//case 100: oVm.mode(2); oVm.mode((3 + (1 * 2)) - 4);
					case 110: a = 0;
					case 120: //b=3;
					case 130: a = a + 1; print(a + "\n");
					case 140: if (a == (3 | (3 == a))) { print(a + "\n"); } else { print("small" + "\n"); }
					case 160: if (a < 5) { goto(130); break; }
					case 170: stop(); break;
					case 170: clear(); break;
					case 190: stop(); break; bStop = true; break;
					default: vmDefault(); stop(); break;
				}
			}
			return sOut;
		}

		//var fn1 = eval("function simulate() { print(\"sim2\"); return sOut; }");
		clear();
		return simulate;
	},
	*/

	/*
	fnExecTest2: function () {
		var oVm = {},
			fn1,
			sScript = String.raw`
//function simulate(oVm) {
	with (oVm) { //TTT do not use "with", has performance penalties
		while (!bStop) {
			switch (iLine) {
				case 0:
				case 50: cls();
				//case 100: mode(2); mode((3 + (1 * 2)) - 4);
				case 110: a = 0;
				case 120: //b=3;
				case 130: a = a + 1; print(a + "\n");
				case 140: if (a == (3 | (3 == a))) { print(a + "\n"); } else { print("small" + "\n"); }
				case 160: if (a < 5) { goto(130); break; }
				case 170: stop(); break;
				case 170: clear(); break;
				case 190: stop(); break; bStop = true; break;
				default: vmDefault(); stop(); break;
			}
		}
		return sOut;
	}
//}`;

		fn1 = new Function("oVm", sScript);

		return fn1;
	},
	*/
			
	fnExec: function (sScript) {
		var oVm = this.mVm,
			sOut = oVm.sOut,
			fn, rc;

		/*
		//TTT
		sScript = String.raw`
		function simulate(oVm) {
			while (oVm.iLine >= 0) {
				debugger;
			//oVm.iLine = oVm.iGoto;
			switch (oVm.iLine) {
			case 0:
			case 110: oVm.iLine = oVm.goto(0); break;
			default: oVm.vmDefault(oVm.iLine); break;
			}}}
		`;
		*/

		//sScript = "(" + sScript + ")"; // only for eval
		//try {
			//fn = eval(sScript);
			fn = new Function("o", sScript)
		//} catch (e) {
		//	sOut += "\n" + String(e) + "\n";
		//}
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
		return sOut;
	},

	fnCalculate2: function (sInput) {
		var oVariables = this.model.getAllVariables(), // current variables
			sResult = "",
			oParseOptions, oOutput, oError, iEndPos, sOutput;

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

		this.mVm.sOut = this.view.getAreaValue("resultText");
		if (!oOutput.error) {
			sResult += this.fnExec(sOutput);

			/*
			var sim2 = this.fnExecTest1();
			sResult += "\nTEST2:" + sim2();

			var sim3 = this.fnExecTest2();
			sResult += "\nTEST3:" + sim3(this.mVm);
			*/
		}
		this.view.setAreaValue("resultText", sResult);
	},

	onExecuteButtonClick: function () {
		var sInput = this.view.getAreaValue("inputText");

		this.model.initVariables();
		this.fnCalculate2(sInput);
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
	}
};


/* ... */

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
	}
};


/* ... */

var cpcBasicExternalConfig, // eslint-disable-line vars-on-top
	cpcBasic = {
		config: {
			debug: 0,

			showSpecial: true,
			showInput: true,
		   	showOutput: true,
			showResult: true,
			showCpc: true
		},
		model: null,
		view: null,
		controller: null,

		// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
		fnParseUri: function (oConfig) {
			var aMatch,
				rPlus = /\+/g, // Regex for replacing addition symbol with a space
				rSearch = /([^&=]+)=?([^&]*)/g,
				fnDecode = function (s) { return decodeURIComponent(s.replace(rPlus, " ")); },
				sQuery = window.location.search.substring(1),
				sName,
				sValue;

			while ((aMatch = rSearch.exec(sQuery)) !== null) {
				sName = fnDecode(aMatch[1]);
				sValue = fnDecode(aMatch[2]);
				if (sValue !== null && oConfig.hasOwnProperty(sName)) {
					switch (typeof oConfig[sName]) {
					case "string":
						break;
					case "boolean":
						sValue = (sValue === "true");
						break;
					case "number":
						sValue = Number(sValue);
						break;
					case "object":
						break;
					default:
						break;
					}
				}
				oConfig[sName] = sValue;
			}
		},

		fnDoStart: function () {
			var that = this,
				oStartConfig = this.config,
				sInput,
				oInitialConfig,	iDebug;

			Object.assign(oStartConfig, cpcBasicExternalConfig || {}); // merge external config from gcconfig.js
			oInitialConfig = Object.assign({}, oStartConfig); // save config
			this.fnParseUri(oStartConfig); // modify config with URL parameters
			this.model = new Model(oStartConfig, oInitialConfig);
			this.view = new View({});

			//Utils.console.changeLog(this.model.getProperty("showConsole") ? this.view.getArea("consoleArea") : null);
			iDebug = Number(this.model.getProperty("debug"));
			Utils.debug = iDebug;

			that.controller = new Controller(this.model, this.view);


			//sInput = "100 mode 2\n110 a=1+3:?a:'a comment\n150 stop\n";
			//sInput = "100 mode 2\n110 a=1+3:print a:'a comment\n150 stop\n";
			//sInput = "50 cls#1\n100 mode 2:mode 3+1*2-4\n110 a=0\n120 'wait 0,0\n130 a=a+1:print a:'a comment\n140 if a=4 or 4 = a then print a else print \"small\"\n160 if a < 10 then goto 130\n170 stop";
		
			sInput=String.raw`10 rem
90 for i=1 to 10:print i: next i
95 stop
100 rem Test1
110 'wait 0,0
120 'clear
130 mode 2:'comment
131 cls: cls#0: a=2: cls #(a*3)
140 a=0
150 print a;: a=a+1: if a < 5 then goto 150 else print
180 'a=0: while a<5: print a;: a=a+1: wend: print
185 'a=0: while a<5: if a=3 or 3=a then print "three" else print "not three:";a;: wend
187 a=0: s$="": while a<5: s$=s$+str$(a)+":": a=a+1: b=0: while b<3: b=b+1: s$=s$+str$(b): wend: s$=s$+" ": wend: print s$
190 rem xx
200 a=4 or 7 and 2: print a:if a<>6 then print "error200": stop
300 'print
310 print 1 2 3: ' 123
320 print 1;2;3: ' 1  2  3
330 print 1,2,3: ' 1             2             3   [zone 13]
331 print -1 -2 -3: '-6
332 print -1;-2;-3: '-1 -2 -3
340 print "a" "b" "c": 'abc
350 print "a";"b";"c": 'abc
360 print "a","b","c": 'a        b           c   [zone 13]
900 print "ok"
`;

			this.view.setAreaValue("inputText", sInput);
		},

		fnOnLoad: function () {
			Utils.console.log("cpcBasic started at " + Utils.dateFormat(new Date()));
			this.fnDoStart();
		}
	};


cpcBasic.fnOnLoad(); // if cpcbasic.js is the last script, we do not need to wait for window.onload
