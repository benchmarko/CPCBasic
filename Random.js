// Random.js - Random
//
/* globals */

"use strict";

/*
var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}
*/

function Random(nSeed) {
	this.init(nSeed);
}

Random.prototype = {
	init: function (nSeed) {
		this.x = nSeed || 1; // do not use 0
	},
	random: function () {
		var m = 2147483647, // prime number 2^31-1; modulus, do not change!
			a = 16807, // 7^5, one primitive root; multiplier
			q = 127773, // m div a
			r = 2836, // m mod a
			x = this.x; // last random value

		x = a * (x % q) - r * ((x / q) | 0); // eslint-disable-line no-bitwise
		// (x / q) | 0 is x div q
		if (x <= 0) {
			x += m; // x is new random number
		}
		this.x = x;
		return x / m;
	}
};
