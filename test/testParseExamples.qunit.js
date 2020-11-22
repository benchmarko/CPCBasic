// test1.js - ...
//
/* globals QUnit */

// qunit testParseExamples.qunit.js
// node  testParseExamples.qunit.js
// npm test...

"use strict";

var Utils, Polyfills, BasicLexer, BasicParser, BasicTokenizer, CodeGeneratorJs, Model, Variables, fs, path, cpcBasic;

if (typeof require !== "undefined") {
	/* eslint-disable global-require */
	Utils = require("../Utils.js");
	Polyfills = require("../Polyfills.js"); // for atob()
	BasicLexer = require("../BasicLexer.js");
	BasicParser = require("../BasicParser.js");
	BasicTokenizer = require("../BasicTokenizer.js");
	CodeGeneratorJs = require("../CodeGeneratorJs.js");
	Model = require("../Model.js");
	Variables = require("../Variables.js");
	fs = require("fs");
	path = require("path");
	/* eslint-enable global-require */
}

cpcBasic = {
	sRelativeDir: "../",
	model: new Model(),
	oCodeGeneratorJs: new CodeGeneratorJs({
		lexer: new BasicLexer({
			bQuiet: true
		}),
		parser: new BasicParser({
			bQuiet: true
		}),
		rsx: {
			rsxIsAvailable: function (sRsx) { // not needed to suppress warnings when using bQuiet
				return (/^dir|disc|era|tape$/).test(sRsx);
			}
		}
	}),
	oBasicTokenizer: new BasicTokenizer(), // for loading tokenized examples

	initDatabases: function () {
		var oModel = this.model,
			oDatabases = {},
			aDatabaseDirs, i, sDatabaseDir, aParts, sName;

		aDatabaseDirs = oModel.getProperty("databaseDirs").split(",");
		for (i = 0; i < aDatabaseDirs.length; i += 1) {
			sDatabaseDir = aDatabaseDirs[i];
			aParts = sDatabaseDir.split("/");
			sName = aParts[aParts.length - 1];
			oDatabases[sName] = {
				text: sName,
				title: sDatabaseDir,
				src: sDatabaseDir
			};
		}
		this.model.addDatabases(oDatabases);

		//this.setDatabaseSelectOptions();
		//this.commonEventHandler.onDatabaseSelectChange();
	},

	addIndex2: function (sDir, input) { // optional sDir
		var sInput, aIndex, i;

		sInput = input.trim();
		aIndex = JSON.parse(sInput);
		for (i = 0; i < aIndex.length; i += 1) {
			aIndex[i].dir = sDir;
			this.model.setExample(aIndex[i]);
		}
	},

	// Also called from example files xxxxx.js
	addItem2: function (sKey, input) { // optional sKey
		var sInput, oExample;

		sInput = input.replace(/^\n/, ""); // remove preceding newline
		sInput = sInput.replace(/\n$/, ""); // remove trailing newline
		if (!sKey) {
			sKey = this.model.getProperty("example");
		}
		oExample = this.model.getExample(sKey);
		oExample.key = sKey; // maybe changed
		oExample.script = sInput;
		oExample.loaded = true;
		//Utils.console.debug("addItem:", sKey);
		return sKey;
	},

	fnHereDoc: function (fn) {
		return String(fn).
			replace(/^[^/]+\/\*\S*/, "").
			replace(/\*\/[^/]+$/, "");
	},

	addIndex: function (sDir, input) {
		if (typeof input !== "string") {
			input = this.fnHereDoc(input);
		}
		return this.addIndex2(sDir, input);
	},

	addItem: function (sKey, input) {
		if (typeof input !== "string") {
			input = this.fnHereDoc(input);
		}
		return this.addItem2(sKey, input);
	}
};


// taken from Controller.js
function splitMeta(sInput) {
	var sMetaIdent = "CPCBasic",
		oMeta, iIndex, sMeta, aMeta;

	if (sInput.indexOf(sMetaIdent) === 0) { // starts with metaIdent?
		iIndex = sInput.indexOf(","); // metadata separator
		if (iIndex >= 0) {
			sMeta = sInput.substr(0, iIndex);
			sInput = sInput.substr(iIndex + 1);
			aMeta = sMeta.split(";");

			oMeta = {
				sType: aMeta[1],
				iStart: aMeta[2],
				iLength: aMeta[3],
				iEntry: aMeta[4],
				sEncoding: aMeta[5]
			};
		}
	}

	return {
		oMeta: oMeta || {},
		sData: sInput
	};
}

function asmGena3Convert(/* sInput */) {
	throw new Error("asmGena3Convert: not implemented for test");
}

// taken from Controller.js
function testCheckMeta(sInput) {
	var oData = splitMeta(sInput),
		sType;

	sInput = oData.sData; // maybe changed

	if (oData.oMeta.sEncoding === "base64") {
		sInput = Utils.atob(sInput); // decode base64
	}

	sType = oData.oMeta.sType;
	if (sType === "T") { // tokenized basic?
		sInput = cpcBasic.oBasicTokenizer.decode(sInput);
	} else if (sType === "P") { // protected BASIC?
		sInput = DiskImage.prototype.unOrProtectData(sInput); //TODO
		sInput = cpcBasic.oBasicTokenizer.decode(sInput);
	} else if (sType === "B") { // binary?
	} else if (sType === "A") { // ASCII?
		// remove EOF character(s) (0x1a) from the end of file
		sInput = sInput.replace(/\x1a+$/, ""); // eslint-disable-line no-control-regex
	} else if (sType === "G") { // Hisoft Devpac GENA3 Z80 Assember
		sInput = asmGena3Convert(sInput); // TODO
	}
	return sInput;
}

function testParseExample(oExample) {
	var oCodeGeneratorJs = cpcBasic.oCodeGeneratorJs,
		sScript = oExample.script,
		oVariables = new Variables(),
		sInput, oOutput;

	//Utils.console.debug("testParseExample: length=", sScript.length);
	sInput = testCheckMeta(sScript);
	if (oExample.meta !== "D") { // skip data files
		oCodeGeneratorJs.reset();
		oOutput = oCodeGeneratorJs.generate(sInput, oVariables, true);
	} else {
		oOutput = {
			text: "UNPARSED DATA FILE: " + oExample.key
		};
	}
	//sResult = oOutput.error ? oOutput.error : oOutput.text;
	//Utils.console.debug("testParseExample: result.length=", sResult.length);
	if (cpcBasic.assert) {
		cpcBasic.assert.ok(!oOutput.error, oExample.key);
	}

	return oOutput;
}

function fnEval(sCode) {
	return eval(sCode);
}

function fnExampleLoaded(err, sCode) {
	var sKey, oExample, oOutput;

	if (err) {
		throw err;
	}
	cpcBasic.fnExampleDone1(); //TTT

	//Utils.console.debug("fnExampleLoaded: sCode.length=", sCode.length);
	fnEval(sCode); // load example

	sKey = cpcBasic.model.getProperty("example");
	oExample = cpcBasic.model.getExample(sKey);
	oOutput = testParseExample(oExample);

	if (!oOutput.error) { //TTT
		if (cpcBasic.iTestIndex < cpcBasic.aTestExamples.length) {
			testNextExample();
		} else {
			//cpcBasic.fnTestDone1();
		}
	}
}

function fnExampleLoadedUtils(/* sUrl */) {
	return fnExampleLoaded(null, "");
}

function fnExampleErrorUtils(sUrl) {
	return fnExampleLoaded(new Error("fnExampleErrorUtils: " + sUrl), null);
}

function testLoadExample(oExample) {
	var sExample = oExample.key,
		sUrl = cpcBasic.sRelativeDir + oExample.dir + "/" + sExample + ".js"; //TTT

	//Utils.console.debug("testLoadExample: key=", oExample.key);
	//var sFileContent = fs.readFileSync(sName, "utf8");

	if (cpcBasic.assert) {
		cpcBasic.fnExampleDone1 = cpcBasic.assert.async();
		//cpcBasic.assert.expect(1);
	}

	if (fs) {
		sUrl = path.resolve(__dirname, sUrl); // to get it working also for "npm test" and not only for node ...
		fs.readFile(sUrl, "utf8", fnExampleLoaded);
	} else {
		Utils.loadScript(sUrl, fnExampleLoadedUtils, fnExampleErrorUtils);
	}

	//cpcBasic.model.setProperty("example", sExample);
	//testEval(sFileContent); // calls addItem()
}

/*
function testAllExamples() {
	var oAllExamples = cpcBasic.model.getAllExamples(),
		sKey, oExample;

	for (sKey in oAllExamples) {
		if (oAllExamples.hasOwnProperty(sKey)) {
			oExample = oAllExamples[sKey];

			Utils.console.debug("testAllExamples:", oExample.key);
			testLoadExample(oExample);
			/ *
			if (oExample.meta !== "D") { // skip data files
				testParseExample(oExample);
			}
			* /
		}
	}
}
*/

function testNextExample() {
	var aTestExamples = cpcBasic.aTestExamples,
		iTestIndex = cpcBasic.iTestIndex,
		sKey, oExample;

	if (iTestIndex < aTestExamples.length) {
		sKey = aTestExamples[iTestIndex];
		cpcBasic.iTestIndex += 1;
		cpcBasic.model.setProperty("example", sKey);
		oExample = cpcBasic.model.getExample(sKey);
		testLoadExample(oExample);
	}
}


function fnIndexLoaded(err, sCode) {
	var oAllExamples;

	cpcBasic.fnIndexDone1(); //TTT
	//cpcBasic.assert.true(true, "ok1");
	if (err) {
		throw err;
	}

	//Utils.console.debug("fnIndexLoaded: sCode.length=", sCode.length);

	fnEval(sCode); // load index

	oAllExamples = cpcBasic.model.getAllExamples();

	cpcBasic.aTestExamples = Object.keys(oAllExamples);
	cpcBasic.iTestIndex = 0;

	if (cpcBasic.assert) {
		cpcBasic.assert.expect(cpcBasic.aTestExamples.length);
	}

	testNextExample();
}

function fnIndexLoadedUtils(/* sUrl */) {
	return fnIndexLoaded(null, "");
}

function fnIndexErrorUtils(sUrl) {
	return fnIndexLoaded(new Error("fnIndexErrorUtils: " + sUrl), null);
}

function testLoadIndex() {
	var sUrl = cpcBasic.sRelativeDir + "./examples/0index.js";

	cpcBasic.model.setProperty("databaseDirs", "examples");
	cpcBasic.model.setProperty("database", "examples");
	cpcBasic.initDatabases();

	//return new Promise();//TTT
	//cpcBasic.fnTestDone1(); //TTT

	if (fs) {
		//Utils.console.debug("testLoadIndex: __dirname=", __dirname); //TTT
		//Utils.console.debug("testLoadIndex: reading", sUrl);
		sUrl = path.resolve(__dirname, sUrl); // to get it working also for "npm test" and not only for node ...

		//Utils.console.debug("testLoadIndex: s1=", s1);
		//fs.readFile(sUrl, "utf8", fnIndexLoaded);
		fs.readFile(sUrl, "utf8", fnIndexLoaded);
	} else {
		Utils.loadScript(sUrl, fnIndexLoadedUtils, fnIndexErrorUtils);
	}

	//TTT Utils.loadScript(sUrl, fnExampleLoaded, fnExampleError);
	//testEval(sFileContent); // calls addIndex()
}


/*
function test1() {
	//Utils.console.debug("TTT: test1");
	testLoadIndex();
	//testAllExamples();
}
*/

//test1();

if (typeof QUnit !== "undefined") {
	QUnit.config.testTimeout = 5 * 1000; //TTT
	QUnit.module("testParseExamples: Tests", function (/* hooks */) {
		QUnit.test("testParseExamples", function (assert) {
			//var fnTestDone1 = assert.async();

			cpcBasic.assert = assert; //TTT

			cpcBasic.fnIndexDone1 = assert.async();
			assert.expect(1); //TTT
			testLoadIndex();

			/*
			setTimeout(function () { //TTT
				assert.true(true, "third call done.");
				fnTestDone1();
			}, 500);
			*/
		});

		/*
		QUnit.test("testParseExamples: finish", function (assert) {
			var fnCompleted = assert.async();

			assert.expect(1); //TTT
			assert.ok(true, "finished");
			fnCompleted();
		});
		*/
	});
} else {
	cpcBasic.fnIndexDone1 = function () {
		//Utils.console.debug("fnIndexDone1: called");
	};
	cpcBasic.fnExampleDone1 = function () {
		//Utils.console.debug("fnExampleDone1: called");
	};
	testLoadIndex();
}

// end
