// Model.qunit.js - QUnit tests for CPCBasic Model
//
/* globals QUnit */

"use strict";

var Model;

if (typeof require !== "undefined") {
	Model = require("../Model.js"); // eslint-disable-line global-require
}

QUnit.module("Model: Properties", function (hooks) {
	hooks.beforeEach(function (/* assert */) {
		var that = this, // eslint-disable-line no-invalid-this
			oInitialConfig = {
				p1: "v1"
			},
			oConfig = {
				p1: "v1",
				p2: "v2"
			};

		that.model = new Model(oConfig, oInitialConfig);
	});

	QUnit.test("init without options", function (assert) {
		var oModel = new Model();

		assert.ok(oModel, "defined");
	});

	QUnit.test("properties", function (assert) {
		var oModel = this.model, // eslint-disable-line no-invalid-this
			oAllProperties;

		oAllProperties = oModel.getAllInitialProperties();
		assert.strictEqual(Object.keys(oAllProperties).join(" "), "p1", "all initial properties: p1");

		assert.strictEqual(oModel.getProperty("p1"), "v1", "p1=v1");
		assert.strictEqual(oModel.getProperty("p2"), "v2", "p2=v2");
		assert.strictEqual(oModel.getProperty(""), undefined, "<empty>=undefiend");

		oAllProperties = oModel.getAllProperties();
		assert.strictEqual(Object.keys(oAllProperties).join(" "), "p1 p2", "all properties: p1 p2");
		assert.strictEqual(oAllProperties.p1, "v1", "p1=v1");
		assert.strictEqual(oAllProperties.p2, "v2", "p2=v2");

		oModel.setProperty("p1", "v1.2");
		assert.strictEqual(oModel.getProperty("p1"), "v1.2", "p1=v1.2");

		oModel.setProperty("p3", "v3");
		assert.strictEqual(oModel.getProperty("p3"), "v3", "p3=v3");

		oAllProperties = oModel.getAllProperties();
		assert.strictEqual(Object.keys(oAllProperties).join(" "), "p1 p2 p3", "all properties: p1 p2 p3");

		oAllProperties = oModel.getAllInitialProperties();
		assert.strictEqual(Object.keys(oAllProperties).join(" "), "p1", "all initial properties: p1");
	});
});


QUnit.module("Model: Databases", function (hooks) {
	hooks.beforeEach(function (/* assert */) {
		// var that = this, // eslint-disable-line no-invalid-this
	});

	QUnit.test("databases", function (assert) {
		var oModel = new Model(),
			mDatabases = {
				db1: {
					text: "text1",
					title: "title1",
					src: "src1"
				},
				db2: {
					text: "text1",
					title: "title2",
					src: ""
				}
			},
			oDatabases;

		oDatabases = oModel.getAllDatabases();
		assert.strictEqual(Object.keys(oDatabases).length, 0, "no databases");

		oModel.addDatabases(mDatabases);

		assert.strictEqual(Object.keys(oDatabases).join(" "), "db1 db2", "two databases: db1, db2");

		oModel.setProperty("database", "db1");

		assert.strictEqual(oModel.getDatabase(), mDatabases.db1, "databases db1");

		oModel.setProperty("database", "db2");

		assert.strictEqual(oModel.getDatabase(), mDatabases.db2, "databases db2");

		oModel.setProperty("database", "");

		assert.strictEqual(oModel.getDatabase(), undefined, "databases undefined");
	});
});


QUnit.module("Model: Examples", function (hooks) {
	hooks.beforeEach(function (/* assert */) {
		var that = this, // eslint-disable-line no-invalid-this
			mDatabases = {
				db1: {
					text: "db1Text",
					title: "db1Title",
					src: "db1Src"
				},
				db2: {
					text: "db2text"
				}
			},
			mExample1 = {
				key: "ex1"
			},
			mExample2 = {
				key: "ex2"
			},
			oModel;

		oModel = new Model();
		oModel.addDatabases(mDatabases);
		oModel.setProperty("database", "db1");
		oModel.setExample(mExample1);
		oModel.setExample(mExample2);
		that.model = oModel;
	});

	QUnit.test("examples", function (assert) {
		var oModel = this.model; // eslint-disable-line no-invalid-this

		assert.strictEqual(oModel.getExample("ex1").key, "ex1", "ex1");
		assert.strictEqual(oModel.getExample("ex2").key, "ex2", "ex2");

		assert.strictEqual(Object.keys(oModel.getAllExamples()).join(), "ex1,ex2", "two examples: ex1,ex2");
	});
});
// end
