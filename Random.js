// Random.js - Random Number Generator
// (c) Marco Vieth, 2019-2026
// https://benchmarko.github.io/CPCBasic/

"use strict";

// Custom random number generator used in the CPC
// Converted (and optimized) from Z80 ASM code in:
// https://github.com/Bread80/CPC6128-Firmware-Source/blob/main/FPMaths.asm (starting line 399)
// and: C6_last_random_number, last_random_number
// https://github.com/Bread80/CPC6128-Firmware-Source/blob/main/Includes/MemoryFirmware.asm

/* eslint-disable no-bitwise */

var randomCpcInitState = 0x6c078965;

// Custom random number generator used in the CPC
// Converted from Z80 ASM code in:
// https://github.com/Bread80/CPC6128-Firmware-Source/blob/main/FPMaths.asm
function RandomCpc(seed) {
	this.init(seed);
}

RandomCpc.prototype = {
	init: function (seed) {
		this.state = randomCpcInitState;
		seed = seed || 0;
		if (seed !== 0) {
			this.randomizeMantissa(RandomCpc.encodeCpcMantissa(seed));
		}
	},
	randomizeMantissa: function (bytes) {
		var xorMask = (((((bytes[1] << 8) | bytes[0]) << 16) | ((bytes[3] << 8) | bytes[2])) >>> 0);

		this.state = (this.state ^ xorMask) >>> 0;
	},
	random: function () {
		var high = this.state >>> 16,
			low = this.state & 0xffff,
			initLow = 0x8965, // randomCpcInitState & 0xffff
			initHigh = 0x6c07, // randomCpcInitState >>> 16
			mulLow = 0xf56c, // (initLow + initHigh) & 0xffff
			highAcc = (high * initLow) + initLow, // carry item for low part in upper 16 bit
			newHigh = highAcc & 0xffff, // high_{n+1} = (high_n * 0x8965 + 0x8965) mod 2^16
			newLow = ((low * mulLow) + initHigh + (highAcc >>> 16)) & 0xffff; // low_{n+1} = (low_n * 0xF56C + 0x6C07 + carry(highAcc)) mod 2^16

		this.state = ((newHigh << 16) | newLow) >>> 0;
		high = this.state >>> 16;
		low = this.state & 0xffff;
		return (((low << 16) | high) >>> 0) / 0x100000000;
	}
};

RandomCpc.encodeCpcMantissa = function (value) {
	var mantissa = 0,
		exponent = 0,
		sign = 0,
		signMantissa,
		result;

	if (typeof value !== "number" || !isFinite(value)) {
		throw new Error("Seed must be a finite number");
	}
	if (value !== 0) {
		if (value < 0) {
			sign = 0x80000000;
			value = -value;
		}
		exponent = Math.ceil(Math.log(value) / Math.log(2));
		mantissa = Math.round(value / Math.pow(2, exponent - 32)) & ~0x80000000;
	}

	signMantissa = sign + mantissa;
	result = [
		signMantissa & 0xff,
		(signMantissa >> 8) & 0xff,
		(signMantissa >> 16) & 0xff,
		(signMantissa >> 24) & 0xff
	];
	return result;
};
/* eslint-enable no-bitwise */


//
// Implementation: Random number generator taken from:
// Raj Jain: The Art of Computer Systems Performance Analysis, John Wiley & Sons, 1991, page 442-444
// https://en.wikipedia.org/wiki/Lehmer_random_number_generator
// Park-Miller "minimal standard" LCG (MINSTD) using Schrage method
//
function RandomMinStd(seed) {
	this.init(seed);
}

// https://en.wikipedia.org/wiki/Jenkins_hash_function
RandomMinStd.vmHashCode = function (s) {
	var hash = 0,
		i;

	/* eslint-disable no-bitwise */
	for (i = 0; i < s.length; i += 1) {
		hash += s.charCodeAt(i);
		hash += hash << 10;
		hash ^= hash >> 6;
	}
	hash += hash << 3;
	hash ^= hash >> 11;
	hash += hash << 15;
	/* eslint-enable no-bitwise */
	return hash;
};

RandomMinStd.prototype = {
	init: function (seed) {
		seed = RandomMinStd.vmHashCode(String(seed)); // to avoid simple seeds
		this.x = seed || 0x89656c07; // an arbitrary 32 bit number <> 0 (the CPC default)
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

function Random(useCpcRandom) {
	if (useCpcRandom === undefined || useCpcRandom) {
		this.rndGen = new RandomCpc();
	} else {
		this.rndGen = new RandomMinStd();
	}
}

Random.prototype = {
	init: function (seed) {
		this.rndGen.init(seed);
	},
	random: function () {
		return this.rndGen.random();
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = Random;
}
