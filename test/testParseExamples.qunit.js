// test1.js - ...
//
/* globals globalThis */

// qunit testParseExamples.qunit.js
// node  testParseExamples.qunit.js
// npm test...

"use strict";

var Utils, Polyfills, BasicLexer, BasicParser, BasicTokenizer, CodeGeneratorJs, Model, Variables, DiskImage, cpcconfig, https, fs, path, cpcBasic, oGlobalThis, bNodeJsAvail;

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
	DiskImage = require("../DiskImage.js");
	cpcconfig = require("../cpcconfig");
	fs = require("fs");
	path = require("path");
	/* eslint-enable global-require */
}

// eslint-disable-next-line no-new-func
oGlobalThis = (typeof globalThis !== "undefined") ? globalThis : Function("return this")(); // for old IE
bNodeJsAvail = (function () {
	var bNodeJs = false;

	// https://www.npmjs.com/package/detect-node
	// Only Node.JS has a process variable that is of [[Class]] process
	try {
		if (Object.prototype.toString.call(oGlobalThis.process) === "[object process]") {
			bNodeJs = true;
		}
	} catch (e) {
		// empty
	}
	return bNodeJs;
}());

function isUrl(s) {
	return s.startsWith("http"); // http or https
}

function fnEval(sCode) {
	return eval(sCode); // eslint-disable-line no-eval
}

function nodeReadUrl(sUrl, fnDataLoaded) {
	if (!https) {
		fnEval('https = require("https");'); // to trick TypeScript
	}
	https.get(sUrl, function (resp) {
		var sData = "";

		// A chunk of data has been received.
		resp.on("data", function (sChunk) {
			sData += sChunk;
		});

		// The whole response has been received. Print out the result.
		resp.on("end", function () {
			fnDataLoaded(undefined, sData);
		});
	}).on("error", function (err) {
		Utils.console.log("Error: " + err.message);
		fnDataLoaded(err);
	});
}

function nodeReadFile(sName, fnDataLoaded) {
	if (!fs) {
		fnEval('fs = require("fs");'); // to trick TypeScript
	}
	fs.readFile(sName, "utf8", fnDataLoaded);
}

function nodeGetAbsolutePath(sName) {
	var sAbsolutePath;

	if (!path) {
		fnEval('path = require("path");'); // to trick TypeScript
	}
	sAbsolutePath = path.resolve(__dirname, sName);

	return sAbsolutePath;
}


function createModel() {
	var oStartConfig = {},
		oInitialConfig, oModel;

	Object.assign(oStartConfig, cpcconfig || {}); // merge external config from cpcconfig.js
	oInitialConfig = Object.assign({}, oStartConfig); // save config
	oModel = new Model(oStartConfig, oInitialConfig);

	return oModel;
}

cpcBasic = {
	iTotalExamples: 0,

	sBaseDir: "../", // base test directory (relative to dist)
	sDataBaseDirOrUrl: "",
	model: createModel(),

	aDatabaseNames: [],
	iDatabaseIndex: 0,

	aTestExamples: [],
	iTestIndex: 0,

	oCodeGeneratorJs: new CodeGeneratorJs({
		lexer: new BasicLexer({
			bQuiet: true
		}),
		parser: new BasicParser({
			bQuiet: true
		}),
		tron: false,
		rsx: {
			rsxIsAvailable: function (sRsx) { // not needed to suppress warnings when using bQuiet
				return (/^a|b|basic|cpm|dir|disc|disc\.in|disc\.out|drive|era|ren|tape|tape\.in|tape\.out|user|mode|renum$/).test(sRsx);
			}
		}
	}),
	oBasicTokenizer: new BasicTokenizer(), // for loading tokenized examples

	initDatabases: function () {
		var oModel = this.model,
			oDatabases = {},
			aDatabaseNames = [],
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
			aDatabaseNames.push(sName);
		}
		this.model.addDatabases(oDatabases);
		return aDatabaseNames;
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
	addItem2: function (sKey, sInput) { // optional sKey
		var oExample;

		if (!sKey) {
			sKey = this.model.getProperty("example");
		}

		sInput = sInput.replace(/^\n/, "").replace(/\n$/, ""); // remove preceding and trailing newlines
		// beware of data files ending with newlines! (do not use trimEnd)

		oExample = this.model.getExample(sKey);
		oExample.key = sKey; // maybe changed
		oExample.script = sInput;
		oExample.loaded = true;
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

function asmGena3Convert(sInput) {
	throw new Error("asmGena3Convert: not implemented for test: " + sInput);
	//return sInput;
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
		sInput = DiskImage.prototype.unOrProtectData(sInput); // TODO
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
		sInput = testCheckMeta(sScript),
		oOutput;

	if (oExample.meta !== "D") { // skip data files
		oOutput = oCodeGeneratorJs.generate(sInput, oVariables, true);
	} else {
		oOutput = {
			text: "UNPARSED DATA FILE: " + oExample.key
		};
	}

	if (Utils.debug > 0) {
		Utils.console.debug("testParseExample:", oExample.key, "inputLen:", sInput.length, "outputLen:", oOutput.text.length);
	}

	if (cpcBasic.assert) {
		cpcBasic.assert.ok(!oOutput.error, oExample.key);
	}

	return oOutput;
}

function fnExampleLoaded(oError, sCode) {
	var sKey, oExample, oOutput;

	if (oError) {
		throw oError;
	}
	cpcBasic.fnExampleDone1();

	if (sCode) {
		fnEval(sCode); // load example
	}

	sKey = cpcBasic.model.getProperty("example");
	oExample = cpcBasic.model.getExample(sKey);
	oOutput = testParseExample(oExample);

	if (!oOutput.error) {
		//if (cpcBasic.iTestIndex < cpcBasic.aTestExamples.length) {
		testNextExample(); // eslint-disable-line no-use-before-define
		//}
	}
}

function fnExampleLoadedUtils(/* sUrl */) {
	return fnExampleLoaded(undefined, "");
}

function fnExampleErrorUtils(sUrl) {
	return fnExampleLoaded(new Error("fnExampleErrorUtils: " + sUrl), null);
}

function testLoadExample(oExample) {
	var sExample = oExample.key,
		//sUrl = cpcBasic.sRelativeDir + oExample.dir + "/" + sExample + ".js";
		sFileOrUrl = cpcBasic.sDataBaseDirOrUrl + "/" + sExample + ".js";

	if (cpcBasic.assert) {
		cpcBasic.fnExampleDone1 = cpcBasic.assert.async();
	}

	/*
	if (fs) {
		sUrl = path.resolve(__dirname, sUrl); // to get it working also for "npm test" and not only for node ...
		fs.readFile(sUrl, "utf8", fnExampleLoaded);
	} else {
		Utils.loadScript(sUrl, fnExampleLoadedUtils, fnExampleErrorUtils);
	}
	*/
	if (bNodeJsAvail) {
		if (isUrl(sFileOrUrl)) {
			nodeReadUrl(sFileOrUrl, fnExampleLoaded);
		} else {
			nodeReadFile(sFileOrUrl, fnExampleLoaded);
		}
	} else {
		Utils.loadScript(sFileOrUrl, fnExampleLoadedUtils, fnExampleErrorUtils, sExample);
	}
}

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
	} else { // another database?
		testNextIndex(); // eslint-disable-line no-use-before-define
	}
}


function fnIndexLoaded(oError, sCode) {
	var oAllExamples;

	if (oError) {
		throw oError;
	}

	cpcBasic.fnIndexDone1();

	if (sCode) {
		fnEval(sCode); // load index (for nodeJs)
	}

	oAllExamples = cpcBasic.model.getAllExamples();

	cpcBasic.aTestExamples = Object.keys(oAllExamples);
	cpcBasic.iTestIndex = 0;

	cpcBasic.iTotalExamples += cpcBasic.aTestExamples.length;
	if (cpcBasic.assert) {
		cpcBasic.assert.expect(cpcBasic.iTotalExamples);
	}

	testNextExample();
}

function fnIndexLoadedUtils(/* sUrl */) {
	return fnIndexLoaded(undefined, "");
}

function fnIndexErrorUtils(sUrl) {
	return fnIndexLoaded(new Error("fnIndexErrorUtils: " + sUrl));
}

function testLoadIndex(oExampeDb) {
	var sDir = oExampeDb.src,
		sFileOrUrl;

	if (!isUrl(sDir)) {
		sDir = cpcBasic.sBaseDir + sDir;
	}

	if (cpcBasic.assert) {
		cpcBasic.fnIndexDone1 = cpcBasic.assert.async();
	}

	if (bNodeJsAvail) {
		if (!isUrl(sDir)) {
			if (Utils.debug > 0) {
				Utils.console.debug("testParseExamples: __dirname=", __dirname, " sDir=", sDir);
			}
			sDir = nodeGetAbsolutePath(sDir); // convert to absolute path to get it working also for "npm test" and not only for node
		}
	}
	cpcBasic.sDataBaseDirOrUrl = sDir;

	sFileOrUrl = cpcBasic.sDataBaseDirOrUrl + "/0index.js"; // "./examples/0index.js";

	Utils.console.log("testParseExamples: Using Database index:", sFileOrUrl);

	if (bNodeJsAvail) {
		if (isUrl(sDir)) {
			nodeReadUrl(sFileOrUrl, fnIndexLoaded);
		} else {
			nodeReadFile(sFileOrUrl, fnIndexLoaded);
		}
	} else {
		Utils.loadScript(sFileOrUrl, fnIndexLoadedUtils, fnIndexErrorUtils, oExampeDb.text);
	}

	/*
	var sUrl = cpcBasic.sRelativeDir + "./examples/0index.js";

	Utils.console.log("testLoadIndex: bNodeJs:", bNodeJsAvail);

	cpcBasic.model.setProperty("databaseDirs", "examples");
	cpcBasic.model.setProperty("database", "examples");
	cpcBasic.initDatabases();

	if (fs) {
		sUrl = path.resolve(__dirname, sUrl); // to get it working also for "npm test" and not only for node ...
		fs.readFile(sUrl, "utf8", fnIndexLoaded);
	} else {
		Utils.loadScript(sUrl, fnIndexLoadedUtils, fnIndexErrorUtils);
	}
	*/
}

function testNextIndex() {
	var aDatabaseNames = cpcBasic.aDatabaseNames,
		iDatabaseIndex = cpcBasic.iDatabaseIndex,
		bNextIndex = false,
		sKey, oExampeDb;

	if (iDatabaseIndex < aDatabaseNames.length) {
		sKey = aDatabaseNames[iDatabaseIndex]; // e.g. "examples";

		if (sKey !== "storage") { // ignore "storage"
			cpcBasic.iDatabaseIndex += 1;
			cpcBasic.model.setProperty("database", sKey);
			oExampeDb = cpcBasic.model.getDatabase();

			bNextIndex = true;
			testLoadIndex(oExampeDb);
		}
	}

	if (!bNextIndex) {
		Utils.console.log("testParseExamples: Total examples:", cpcBasic.iTotalExamples);
	}
}

function testStart() {
	Utils.console.log("testParseExamples: bNodeJs:", bNodeJsAvail, " Polyfills.iCount=", Polyfills.iCount);

	cpcBasic.iTotalExamples = 0;
	cpcBasic.aDatabaseNames = cpcBasic.initDatabases();
	cpcBasic.iDatabaseIndex = 0;
	testNextIndex();
}

function fnParseArgs(aArgs) {
	var oSettings = {
			debug: 0
		},
		i = 0,
		sName;

	while (i < aArgs.length) {
		sName = aArgs[i];

		i += 1;
		if (sName in oSettings) {
			oSettings[sName] = parseInt(aArgs[i], 10);
			i += 1;
		}
	}
	return oSettings;
}

// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/process.d.ts

if (typeof process !== "undefined") { // nodeJs
	(function () {
		var oSettings = fnParseArgs(process.argv.slice(2));

		if (oSettings.debug) {
			Utils.debug = oSettings.debug;
		}
	}());
}

if (typeof oGlobalThis.QUnit !== "undefined") {
	// eslint-disable-next-line vars-on-top
	var QUnit = oGlobalThis.QUnit; // eslint-disable-line one-var

	Utils.console.log("Using QUnit");

	QUnit.config.testTimeout = 5 * 1000;
	QUnit.module("testParseExamples: Tests", function (/* hooks */) {
		QUnit.test("testParseExamples", function (assert) {
			cpcBasic.assert = assert;

			/*
			cpcBasic.fnIndexDone1 = assert.async();
			assert.expect(1);
			*/
			testStart();
		});
	});
} else {
	cpcBasic.fnIndexDone1 = function () {
		// empty
	};
	cpcBasic.fnExampleDone1 = function () {
		// empty
	};

	testStart();
}

/*
if (typeof QUnit !== "undefined") {
	QUnit.config.testTimeout = 5 * 1000;
	QUnit.module("testParseExamples: Tests", function (/ * hooks * /) {
		QUnit.test("testParseExamples", function (assert) {
			cpcBasic.assert = assert;

			cpcBasic.fnIndexDone1 = assert.async();
			assert.expect(1);
			testLoadIndex();
		});
	});
} else {
	cpcBasic.fnIndexDone1 = function () {
		// empty
	};
	cpcBasic.fnExampleDone1 = function () {
		// empty
	};
	testLoadIndex();
}
*/

// end
