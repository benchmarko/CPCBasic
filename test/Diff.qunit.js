// Diff.qunit.js - QUnit tests for CPCBasic Diff
//
/* globals QUnit */

"use strict";

var bGenerateAllResults = false,
	Diff, Utils;

if (typeof require !== "undefined") {
	Diff = require("../Diff.js"); // eslint-disable-line global-require
	Utils = require("../Utils.js"); // eslint-disable-line global-require
}

QUnit.dump.maxDepth = 10;

QUnit.module("Diff: Tests", function () {
	var mAllTests = { // eslint-disable-line vars-on-top
		test: {
			"This part of the\ndocument has stayed the\nsame from version to\nversion.  It shouldn't\nbe shown if it doesn't\nchange.  Otherwise, that\nwould not be helping to\ncompress the size of the\nchanges.\n\nThis paragraph contains\ntext that is outdated.\nIt will be deleted in the\nnear future.\n\nIt is important to spell\ncheck this dokument. On\nthe other hand, a\nmisspelled word isn't\nthe end of the world.\nNothing in the rest of\nthis paragraph needs to\nbe changed. Things can\nbe added after it.#This is an important\nnotice! It should\ntherefore be located at\nthe beginning of this\ndocument!\n\nThis part of the\ndocument has stayed the\nsame from version to\nversion.  It shouldn't\nbe shown if it doesn't\nchange.  Otherwise, that\nwould not be helping to\ncompress anything.\n\nIt is important to spell\ncheck this document. On\nthe other hand, a\nmisspelled word isn't\nthe end of the world.\nNothing in the rest of\nthis paragraph needs to\nbe changed. Things can\nbe added after it.\n\nThis paragraph contains\nimportant new additions\nto this document.":
			"+ This is an important\n+ notice! It should\n+ therefore be located at\n+ the beginning of this\n+ document!\n+ \n- compress the size of the\n- changes.\n+ compress anything.\n- This paragraph contains\n- text that is outdated.\n- It will be deleted in the\n- near future.\n- \n- check this dokument. On\n+ check this document. On\n+ \n+ This paragraph contains\n+ important new additions\n+ to this document."
		}
	};

	function runTestsFor(assert, oTests, aResults) {
		var sKey, aParts, sText1, sText2, sResult, sExpected;

		for (sKey in oTests) {
			if (oTests.hasOwnProperty(sKey)) {
				aParts = sKey.split("#", 2);
				sText1 = aParts[0];
				sText2 = aParts[1];
				sExpected = oTests[sKey];

				try {
					sResult = Diff.testDiff(sText1, sText2);
				} catch (e) {
					Utils.console.error(e);
					sResult = String(e);
				}

				if (aResults) {
					aResults.push('"' + sKey + '": "' + sResult + '"');
				}

				if (assert) {
					assert.strictEqual(sResult, sExpected, "test1");
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
