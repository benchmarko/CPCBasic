// cpcbasic.js - GCFiddle
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//

/* globals BasicParser, Controller, Model, Utils, View */

"use strict";

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

			Object.assign(oStartConfig, cpcBasicExternalConfig || {}); // merge external config from cpcconfig.js (TODO)
			oInitialConfig = Object.assign({}, oStartConfig); // save config
			this.fnParseUri(oStartConfig); // modify config with URL parameters
			this.model = new Model(oStartConfig, oInitialConfig);
			this.view = new View({});

			iDebug = Number(this.model.getProperty("debug"));
			Utils.debug = iDebug;

			that.controller = new Controller(this.model, this.view);

			sInput=String.raw`10 rem
100 rem test1
110 'wait 0,0
120 'clear
130 mode 2:'comment
135 cls: cls#0: a=2: cls #(a*3)
140 for i=1 to 5:print i;: next i: print
150 a=1
160 print a;: a=a+1: if a < 5 then goto 160 else print
180 a=1: while a<=5: print a;: a=a+1: wend: print
185 'a=0: while a<5: a=a+1: if a=3 or 3=a then print "three" else print "not three:";a;: wend : ?"after wend": 'wend in else currently does not work
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
