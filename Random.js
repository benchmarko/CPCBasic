// Random.js - Random Number Generator
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/

"use strict";

//
// Random number generator taken from:
// Raj Jain: The Art of Computer Systems Performance Analysis, John Wiley & Sons, 1991, page 442-444
//
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
		// we use "| 0" to get an integer div result
		if (x <= 0) {
			x += m; // x is new random number
		}
		this.x = x;
		return x / m;
	}
};
