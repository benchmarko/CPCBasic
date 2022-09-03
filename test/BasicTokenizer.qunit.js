// BasicTokenizer.qunit.js - QUnit tests for CPCBasic BasicTokenizer
//
/* globals QUnit */

"use strict";

var bGenerateAllResults = (typeof window !== "undefined") && window.location.search.indexOf("generateAll=true") > 0,
	BasicTokenizer, Utils;

if (typeof require !== "undefined") {
	BasicTokenizer = require("../BasicTokenizer.js"); // eslint-disable-line global-require
	Utils = require("../Utils.js"); // eslint-disable-line global-require
}

QUnit.dump.maxDepth = 10;

QUnit.module("BasicTokenizer:decode: Tests", function () {
	var mAllTests = { // eslint-disable-line vars-on-top
		PRG: {
			"EgBkAAHARGFzIFJhZXRzZWwAHQBuAAHAMjEuNS4xOTg4IEtvcGYgdW0gS29wZgBGAHgAAcBhYipjPWRlICBkZStmZz1oaSAgIFtkYWJlaSBzaW5kIGEtaSB2ZXJzY2hpZWRlbmUgWmlmZmVybiAxLTkhIV0AMQCCAK0gDwG/IlBsZWFzZSB3YWl0IC4uLiAgKCBjYS4gMSBtaW4gMzQgc2VjICkiAAwAjACGAY4gYS15AAcAlgABwAAMAJsADQAA+u//RgBFAKAAniALAADh7w8g7CAXAZ4gCwAA4u8PIOwgFwGeIAsAAOPvDyDsIBcBniALAADm7w8g7CAXAZ4gCwAA5+8PIOwgFwAvAKoACwAAZOXvKAsAAOH2GQr0CwAA4in2CwAA4wGhIAsAAGTl7hljIOsgHkABADAAtAALAABo6e8LAABk5fQoCwAA5vYZCvQLAADnKQGhIAsAAGjp7hljIOsgHkABAEgAvgALAADk7/8MKAsAAGTl9xkKKQELAADl7wsAAGTlIPsgGQoBCwAA6O//DCgLAABo6fcZCikBCwAA6e8LAABo6SD7IBkKAGoAyAChIAsAAOHvCwAA4iD8IAsAAOHvCwAA4yD8IAsAAOHvCwAA5CD8IAsAAOHvCwAA5SD8IAsAAOHvCwAA5iD8IAsAAOHvCwAA5yD8IAsAAOHvCwAA6CD8IAsAAOHvCwAA6SDrIB5AAQBeANIAoSALAADi7wsAAOMg/CALAADi7wsAAOQg/CALAADi7wsAAOUg/CALAADi7wsAAOYg/CALAADi7wsAAOcg/CALAADi7wsAAOgg/CALAADi7wsAAOkg6yAeQAEAUgDcAKEgCwAA4+8LAADkIPwgCwAA4+8LAADlIPwgCwAA4+8LAADmIPwgCwAA4+8LAADnIPwgCwAA4+8LAADoIPwgCwAA4+8LAADpIOsgHkABAEYA5gChIAsAAOTvCwAA5SD8IAsAAOTvCwAA5iD8IAsAAOTvCwAA5yD8IAsAAOTvCwAA6CD8IAsAAOTvCwAA6SDrIB5AAQA6APAAoSALAADl7wsAAOYg/CALAADl7wsAAOcg/CALAADl7wsAAOgg/CALAADl7wsAAOkg6yAeQAEALgD6AKEgCwAA5u8LAADnIPwgCwAA5u8LAADoIPwgCwAA5u8LAADpIOsgHkABACIABAGhIAsAAOfvCwAA6CD8IAsAAOfvCwAA6SDrIB5AAQAWAA4BoSALAADo7wsAAOkg6yAeQAEAEwAYAaEgCwAA6e8OIOsgHkABABEAHQENAAD67/9G9Q0AAPoAGAAiAYoBvyJEaWUgTG9lc3VuZzoiAb8AQwAsAb8gCwAA4fYZCvQLAADiIioiCwAA4yI9IgsAAGTlIiAvICILAABk5SIrIgsAAOb2GQr0CwAA5yI9IgsAAGjpABUANgG/DQAA+iwNAAD69xosAQHOAB8AQAGwIAsAAOcsCwAA5iwLAADjLAsAAOIsCwAA4QAAAA==": "100 'Das Raetsel\n110 '21.5.1988 Kopf um Kopf\n120 'ab*c=de  de+fg=hi   [dabei sind a-i verschiedene Ziffern 1-9!!]\n130 MODE 1:PRINT\"Please wait ...  ( ca. 1 min 34 sec )\"\n140 CLEAR:DEFINT a-y\n150 '\n155 z=TIME\n160 FOR a=1 TO 9:FOR b=1 TO 9:FOR c=1 TO 9:FOR f=1 TO 9:FOR g=1 TO 9\n170 de=(a*10+b)*c:IF de>99 THEN 320\n180 hi=de+(f*10+g):IF hi>99 THEN 320\n190 d=INT(de/10):e=de MOD 10:h=INT(hi/10):i=hi MOD 10\n200 IF a=b OR a=c OR a=d OR a=e OR a=f OR a=g OR a=h OR a=i THEN 320\n210 IF b=c OR b=d OR b=e OR b=f OR b=g OR b=h OR b=i THEN 320\n220 IF c=d OR c=e OR c=f OR c=g OR c=h OR c=i THEN 320\n230 IF d=e OR d=f OR d=g OR d=h OR d=i THEN 320\n240 IF e=f OR e=g OR e=h OR e=i THEN 320\n250 IF f=g OR f=h OR f=i THEN 320\n260 IF g=h OR g=i THEN 320\n270 IF h=i THEN 320\n280 IF i=0 THEN 320\n285 z=TIME-z\n290 CLS:PRINT\"Die Loesung:\":PRINT\n300 PRINT a*10+b\"*\"c\"=\"de\" / \"de\"+\"f*10+g\"=\"hi\n310 PRINT z,z/300:STOP\n320 NEXT g,f,c,b,a\n"
		}
	};

	function runTestsFor(assert, oTests, aResults) {
		var oBasicTokenizer = new BasicTokenizer(),
			sKey, sInput, sResult, sExpected, sFirstLine;

		for (sKey in oTests) {
			if (oTests.hasOwnProperty(sKey)) {
				sInput = Utils.atob(sKey); // decode base64
				sResult = oBasicTokenizer.decode(sInput);
				sExpected = oTests[sKey];
				sFirstLine = sExpected.substr(0, sExpected.indexOf("\n"));

				if (aResults) {
					aResults.push('"' + sKey.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"') + '": "' + sResult.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"') + '"');
				}

				if (assert) {
					assert.strictEqual(sResult, sExpected, sFirstLine);
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
