// BasicParser.qunit.js - QUnit tests for CPCBasic BasicParser
//
/* globals QUnit */

"use strict";

var bGenerateAllResults = false,
	BasicLexer, BasicParser, Utils;
// we use BasicLexer here just for convenient input

if (typeof require !== "undefined") {
	BasicLexer = require("../BasicLexer.js"); // eslint-disable-line global-require
	BasicParser = require("../BasicParser.js"); // eslint-disable-line global-require
	Utils = require("../Utils.js"); // eslint-disable-line global-require
}

QUnit.dump.maxDepth = 10;

QUnit.module("BasicParser: Tests", function (hooks) {
	hooks.before(function (/* assert */) {
		/*
		var that = this; // eslint-disable-line no-invalid-this

		that.oTester = {
			oBasicLexer: new BasicLexer(),
			oBasicParser: new BasicParser()
		};
		*/
	});
	hooks.beforeEach(function (/* assert */) {
		/*
		var that = this; // eslint-disable-line no-invalid-this

		that.oBasicLexer.reset();
		that.oBasicParser.reset();
		*/
	});

	var mAllTests = { // eslint-disable-line vars-on-top
		LIST: {
			"1 LIST": '[{"type":"label","value":1,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[]}]}]',
			"2 LIST 10": '[{"type":"label","value":2,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"number","value":10,"pos":7},{"type":"#","value":"#","len":0,"right":{"type":"null","value":null,"len":0}}]}]}]',
			"3 LIST 2-": '[{"type":"label","value":3,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"linerange","value":"-","pos":8,"left":{"type":"number","value":2,"pos":7},"right":{"type":"null","value":null,"len":0}},{"type":"#","value":"#","len":0,"right":{"type":"null","value":null,"len":0}}]}]}]',
			"4 LIST -2": '[{"type":"label","value":4,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"linerange","value":"-","pos":7,"left":{"type":"null","value":null,"len":0},"right":{"type":"number","value":2,"pos":8}},{"type":"#","value":"#","len":0,"right":{"type":"null","value":null,"len":0}}]}]}]',
			"5 LIST 2-3": '[{"type":"label","value":5,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"linerange","value":"-","pos":8,"left":{"type":"number","value":2,"pos":7},"right":{"type":"number","value":3,"pos":9}},{"type":"#","value":"#","len":0,"right":{"type":"null","value":null,"len":0}}]}]}]',
			"6 LIST #2": '[{"type":"label","value":6,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"null","value":null,"len":0},{"type":"#","value":"#","pos":7,"right":{"type":"number","value":2,"pos":8}}]}]}]',
			"7 LIST ,#2": '[{"type":"label","value":7,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"null","value":null,"len":0},{"type":"#","value":"#","pos":8,"right":{"type":"number","value":2,"pos":9}}]}]}]',
			"8 LIST 10,#2": '[{"type":"label","value":8,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"number","value":10,"pos":7},{"type":"#","value":"#","pos":10,"right":{"type":"number","value":2,"pos":11}}]}]}]',
			"9 LIST 1-,#2": '[{"type":"label","value":9,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"linerange","value":"-","pos":8,"left":{"type":"number","value":1,"pos":7},"right":{"type":"null","value":null,"len":0}},{"type":"#","value":"#","pos":10,"right":{"type":"number","value":2,"pos":11}}]}]}]',
			"1 LIST -1,#2": '[{"type":"label","value":1,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"linerange","value":"-","pos":7,"left":{"type":"null","value":null,"len":0},"right":{"type":"number","value":1,"pos":8}},{"type":"#","value":"#","pos":10,"right":{"type":"number","value":2,"pos":11}}]}]}]',
			"2 LIST 1-2,#3": '[{"type":"label","value":2,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"linerange","value":"-","pos":8,"left":{"type":"number","value":1,"pos":7},"right":{"type":"number","value":2,"pos":9}},{"type":"#","value":"#","pos":11,"right":{"type":"number","value":3,"pos":12}}]}]}]',
			"3 LIST 2-3,#4": '[{"type":"label","value":3,"pos":0,"args":[{"type":"list","value":"LIST","pos":2,"args":[{"type":"linerange","value":"-","pos":8,"left":{"type":"number","value":2,"pos":7},"right":{"type":"number","value":3,"pos":9}},{"type":"#","value":"#","pos":11,"right":{"type":"number","value":4,"pos":12}}]}]}]'
		}
	};

	function runTestsFor(assert, oTests) {
		var oBasicLexer = new BasicLexer(),
			oBasicParser = new BasicParser(),
			sKey, sExpected, oExpected, aTokens, aParseTree;

		for (sKey in oTests) {
			if (oTests.hasOwnProperty(sKey)) {
				sExpected = oTests[sKey];
				try {
					oExpected = JSON.parse(sExpected);
					aTokens = oBasicLexer.lex(sKey);
					aParseTree = oBasicParser.parse(aTokens);
				} catch (e) {
					Utils.console.error(e);
					aParseTree = e;
				}
				// or: sJson = JSON.stringify(aParseTree); //assert.strictEqual(sJson, sExpected);
				assert.deepEqual(aParseTree, oExpected, sKey);
			}
		}
	}

	function generateTests(oAllTests) {
		var sCategory;

		for (sCategory in oAllTests) {
			if (oAllTests.hasOwnProperty(sCategory)) {
				(function (sCat) {
					QUnit.test(sCat, function (assert) {
						runTestsFor(assert, oAllTests[sCat]);
					});
				}(sCategory));
			}
		}
	}

	generateTests(mAllTests);


	// generate result list (not used during the test, just for debugging)

	function generateCategoryResults(oTests) {
		var oBasicLexer = new BasicLexer(),
			oBasicParser = new BasicParser(),
			sKey, sActual, aTokens, aParseTree,
			aResults = [];

		for (sKey in oTests) {
			if (oTests.hasOwnProperty(sKey)) {
				try {
					aTokens = oBasicLexer.lex(sKey);
					aParseTree = oBasicParser.parse(aTokens);
					sActual = JSON.stringify(aParseTree);
				} catch (e) {
					Utils.console.error(e);
				}
				aResults.push('"' + sKey + '": \'' + sActual + "'");
			}
		}
		return aResults.join(",\n");
	}

	function generateAllResults(oAllTests) {
		var sCategory,
			sResult = "";

		for (sCategory in oAllTests) {
			if (oAllTests.hasOwnProperty(sCategory)) {
				sResult += sCategory + ": {\n";
				sResult += generateCategoryResults(oAllTests[sCategory]);
				sResult += "\n},\n";
			}
		}
		Utils.console.log(sResult);
		return sResult;
	}

	if (bGenerateAllResults) {
		generateAllResults(mAllTests);
	}
});

// end
