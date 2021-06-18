// ZipFile.qunit.js - QUnit tests for CPCBasic ZipFile
//
/* globals QUnit, ArrayBuffer, Uint8Array */

"use strict";

var bGenerateAllResults = false,
	Utils, ZipFile;

if (typeof require !== "undefined") {
	Utils = require("../Utils.js"); // eslint-disable-line global-require
	ZipFile = require("../ZipFile.js"); // eslint-disable-line global-require
}

QUnit.dump.maxDepth = 10;

QUnit.module("ZipFile: Tests", function () {
	var mAllTests = { // eslint-disable-line vars-on-top
		store: {
			"CPCBasic;B;0;404;;base64,UEsDBAoAAAAAAGyFJkYAAAAAAAAAAAAAAAAFAAAAZGlyMS9QSwMECgAAAAAAbIUmRgAAAAAAAAAAAAAAAAUAAABkaXIyL1BLAwQUAAgAAABshSZGAAAAAAAAAAAAAAAABQAAAGZpbGUxYWJjUEsHCMJBJDUDAAAAAwAAAFBLAwQUAAgAAABshSZGAAAAAAAAAAAAAAAABQAAAGZpbGUyeHl6UEsHCGe6jusDAAAAAwAAAFBLAQItAwoAAAAAAGyFJkYAAAAAAAAAAAAAAAAFAAAAAAAAAAAAEADtAQAAAABkaXIxL1BLAQItAwoAAAAAAGyFJkYAAAAAAAAAAAAAAAAFAAAAAAAAAAAAEADJASMAAABkaXIyL1BLAQItAxQACAAAAGyFJkbCQSQ1AwAAAAMAAAAFAAAAAAAAAAAAIADtgUYAAABmaWxlMVBLAQItAxQACAAAAGyFJkZnuo7rAwAAAAMAAAAFAAAAAAAAAAAAIADJgXwAAABmaWxlMlBLBQYAAAAABAAEAMwAAACyAAAAAAA=": "file1=abc,file2=xyz"
		},
		deflate: { // created by: Controller.exportAsBase64("deflate.zip.xxx")
			"CPCBasic;B;0;408;;base64,UEsDBAoAAAAAAGyFJkYAAAAAAAAAAAAAAAAFAAAAZGlyMS9QSwMECgAAAAAAbIUmRgAAAAAAAAAAAAAAAAUAAABkaXIyL1BLAwQUAAgACABshSZGAAAAAAAAAAAAAAAABQAAAGZpbGUxS0xKBgBQSwcIwkEkNQUAAAADAAAAUEsDBBQACAAIAGyFJkYAAAAAAAAAAAAAAAAFAAAAZmlsZTKrqKwCAFBLBwhnuo7rBQAAAAMAAABQSwECLQMKAAAAAABshSZGAAAAAAAAAAAAAAAABQAAAAAAAAAAABAA7QEAAAAAZGlyMS9QSwECLQMKAAAAAABshSZGAAAAAAAAAAAAAAAABQAAAAAAAAAAABAAyQEjAAAAZGlyMi9QSwECLQMUAAgACABshSZGwkEkNQUAAAADAAAABQAAAAAAAAAAACAA7YFGAAAAZmlsZTFQSwECLQMUAAgACABshSZGZ7qO6wUAAAADAAAABQAAAAAAAAAAACAAyYF+AAAAZmlsZTJQSwUGAAAAAAQABADMAAAAtgAAAAAA": "file1=abc,file2=xyz"
		}
	};

	function fnString2ArrayBuf(sData) {
		var aBuf = new ArrayBuffer(sData.length),
			aView = new Uint8Array(aBuf),
			i;

		for (i = 0; i < sData.length; i += 1) {
			aView[i] = sData.charCodeAt(i);
		}
		return aBuf;
	}

	function fnExtractZipFiles(oZip) {
		var aResult = [],
			oZipDirectory, aEntries, i, sName, sData;

		if (oZip) {
			oZipDirectory = oZip.getZipDirectory();
			aEntries = Object.keys(oZipDirectory);

			for (i = 0; i < aEntries.length; i += 1) {
				sName = aEntries[i];
				sData = oZip.readData(sName);

				if (sData) {
					aResult.push(sName + "=" + sData);
				}
			}
		}
		return aResult.join(",");
	}

	function runTestsFor(assert, oTests, aResults) {
		var sKey, aParts, sMeta, sData, oZip, sExpected, sResult;

		for (sKey in oTests) {
			if (oTests.hasOwnProperty(sKey)) {
				aParts = sKey.split(",", 2);
				sMeta = aParts[0];
				sData = Utils.atob(aParts[1]); // decode base64
				oZip = new ZipFile(new Uint8Array(fnString2ArrayBuf(sData)), "name");
				sExpected = oTests[sKey];

				try {
					sResult = fnExtractZipFiles(oZip);
				} catch (e) {
					sResult = String(e);
					if (sResult !== sExpected) { // output in console only if error not expected
						Utils.console.error(e);
					}
				}

				if (aResults) {
					aResults.push('"' + sKey + '": "' + sResult + '"');
				}

				if (assert) {
					assert.strictEqual(sResult, sExpected, sMeta);
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
