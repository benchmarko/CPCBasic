// BasicFormatter.qunit.js - QUnit tests for CPCBasic BasicFormatter
//
/* globals QUnit */

"use strict";

var bGenerateAllResults = (typeof window !== "undefined") && window.location.search.indexOf("generateAll=true") > 0,
	BasicLexer, BasicParser, BasicFormatter, Utils;
// we use BasicLexer here just for convenient input

if (typeof require !== "undefined") {
	BasicLexer = require("../BasicLexer.js"); // eslint-disable-line global-require
	BasicParser = require("../BasicParser.js"); // eslint-disable-line global-require
	BasicFormatter = require("../BasicFormatter.js"); // eslint-disable-line global-require
	Utils = require("../Utils.js"); // eslint-disable-line global-require
}

QUnit.dump.maxDepth = 10;

QUnit.module("BasicFormatter:renumber: Tests", function () {
	var mAllTests = { // eslint-disable-line vars-on-top
		DELETE: {
			"1 DELETE": "10 DELETE",
			"1 DELETE 1": "10 DELETE 10",
			"1 DELETE 1-": "10 DELETE 10-",
			"1 DELETE 1-2\n2 REM": "10 DELETE 10-20\n20 REM"
		},
		EDIT: {
			"1 EDIT 1": "10 EDIT 10"
		},
		LIST: {
			"1 LIST": "10 LIST",
			"1 LIST 1": "10 LIST 10",
			"1 LIST 1-2\n2 REM": "10 LIST 10-20\n20 REM"
		},
		ON_ERROR_GOTO: {
			"1 on error goto 0": "10 on error goto 0", // do not rename "on error goto" line
			"1 on error goto 2\n2 rem": "10 on error goto 20\n20 rem"
		},
		PRG: {
			"1 goto 2\n2 gosub 21\n3 on i goto 4,21,23\n4 on i gosub 21,1,2,3\n6 on break gosub 21\n7 on error goto 23\n8 on sq(1) gosub 21\n12 data 5\n16 stop\n18 '\n19 '\n21 restore 6:return\n23 if err=5 then 24 else 25\n24 resume 8\n25 resume next\n29 '\n35 on error goto 0\n39 renum 100,5,3\n": "10 goto 20\n20 gosub 120\n30 on i goto 40,120,130\n40 on i gosub 120,10,20,30\n50 on break gosub 120\n60 on error goto 130\n70 on sq(1) gosub 120\n80 data 5\n90 stop\n100 '\n110 '\n120 restore 50:return\n130 if err=5 then 140 else 150\n140 resume 70\n150 resume next\n160 '\n170 on error goto 0\n180 renum 100,5,3\n"
		},
		errors: {
			"1 rem\n1 rem": "BasicFormatter: Duplicate line number in 1 at pos 6-7: 1",
			"2 rem\n1 rem": "BasicFormatter: Line number not increasing in 1 at pos 6-7: 1",
			"0 rem": "BasicFormatter: Line number overflow in 0 at pos 0-1: 0",
			"65536 rem": "BasicFormatter: Line number overflow in 65536 at pos 0-5: 65536",
			"1 goto 2": "BasicFormatter: Line does not exist in 1 at pos 7-8: 2"
		}
	};

	function runTestsFor(assert, oTests, aResults) {
		var oBasicFormatter = new BasicFormatter({
				lexer: new BasicLexer(),
				parser: new BasicParser({
					bQuiet: true
				})
			}),
			fnReplacer = function (sBin) {
				return "0x" + parseInt(sBin.substr(2), 2).toString(16).toLowerCase();
			},
			iNew = 10,
			iOld = 1,
			iStep = 10,
			iKeep = 65535,
			sKey, oOutput, sResult, sExpected;

		for (sKey in oTests) {
			if (oTests.hasOwnProperty(sKey)) {
				oOutput = oBasicFormatter.renumber(sKey, iNew, iOld, iStep, iKeep);
				sResult = oOutput.error ? String(oOutput.error) : oOutput.text;
				sExpected = oTests[sKey];

				if (!Utils.bSupportsBinaryLiterals) {
					sExpected = sExpected.replace(/(0b[01]+)/g, fnReplacer); // for old IE
				}
				if (aResults) {
					aResults.push('"' + sKey.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"') + '": "' + sResult.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"') + '"');
				}

				if (assert) {
					assert.strictEqual(sResult, sExpected, sKey);
				}
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

	function generateAllResults(oAllTests) {
		var sCategory,
			sResult = "",
			aResults, bContainsSpace, sMarker;

		for (sCategory in oAllTests) {
			if (oAllTests.hasOwnProperty(sCategory)) {
				aResults = [];
				bContainsSpace = sCategory.indexOf(" ") >= 0;
				sMarker = bContainsSpace ? '"' : "";

				sResult += sMarker + sCategory + sMarker + ": {\n";

				runTestsFor(undefined, oAllTests[sCategory], aResults);
				sResult += aResults.join(",\n");
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
