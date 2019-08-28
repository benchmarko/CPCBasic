// cpcbasic.js - GCFiddle
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//

/* globals Controller, Model, Utils, View */

"use strict";

var cpcBasicExternalConfig, // eslint-disable-line vars-on-top
	cpcBasic = {
		config: {
			debug: 0,
			example: "testpage",
			exampleDir: "examples", // example base directory
			showSpecial: true,
			showInput: true,
			showOutput: true,
			showResult: true,
			showVariable: true,
			showCpc: true
		},
		model: null,
		view: null,
		controller: null,

		addItem: function (sKey, fnInput) {
			return cpcBasic.controller.fnAddItem(sKey, fnInput);
		},

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
				oInitialConfig,	iDebug;

			Object.assign(oStartConfig, cpcBasicExternalConfig || {}); // merge external config from cpcconfig.js (TODO)
			oInitialConfig = Object.assign({}, oStartConfig); // save config
			this.fnParseUri(oStartConfig); // modify config with URL parameters
			this.model = new Model(oStartConfig, oInitialConfig);
			this.view = new View({});

			iDebug = Number(this.model.getProperty("debug"));
			Utils.debug = iDebug;

			this.model.setExample({
				key: "testpage",
				title: "Test Page"
			});
			this.model.setExample({
				key: "bmbench3",
				title: "BM Benchmark 3"
			});

			that.controller = new Controller(this.model, this.view);
		},

		fnOnLoad: function () {
			Utils.console.log("cpcBasic started at " + Utils.dateFormat(new Date()));
			this.fnDoStart();
		}
	};


cpcBasic.fnOnLoad(); // if cpcbasic.js is the last script, we do not need to wait for window.onload
