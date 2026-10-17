// Random.qunit.js - QUnit tests for CPCBasic random number generators
//
/* globals QUnit */

"use strict";

var Random;

if (typeof require !== "undefined") {
	Random = require("../Random.js"); // eslint-disable-line global-require
}

QUnit.module("Random: Tests", function () {
	QUnit.test("CPC random generator", function (assert) {
		var random = new Random();

		assert.strictEqual(random.random(), 0.27194065786898136, "CPC default sequence");
		random.init(123.456);
		assert.strictEqual(random.random(), 0.2588521388825029, "CPC sequence with floating-point seed");
		random.init(0);
		assert.strictEqual(random.random(), 0.27194065786898136, "zero seed restores the default state");
	});

	QUnit.test("Park-Miller random generator", function (assert) {
		var random = new Random(false);

		random.init(1);
		assert.strictEqual(random.random(), 0.1392758708164449, "seeded Park-Miller sequence");
	});
});
