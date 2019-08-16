// CpcVm.js - CPC Virtual Machine
//
/* globals */

"use strict";

var Random, Utils;

if (typeof require !== "undefined") {
	Random = require("./Random.js"); // eslint-disable-line global-require
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

function CpcVm(options) {
	this.iStartTime = Date.now();
	this.oRandom = new Random();
	this.lastRnd = 0.1; // TODO this.oRandom.random();
	this.vmInit(options);
}

CpcVm.prototype = {
	vmInit: function (options) {
		this.options = options || {};
		this.iLine = 0;
		this.bStop = false;
		this.sOut = "";
		// this.iStartTime = Date.now();
		this.v = {};
		this.iZone = 13;
	},

	vmDefault: function () {
		this.sOut += "Line not found: " + this.iLine;
		this.bStop = true;
	},

	call: function (n) {
		Utils.console.log("call: " + n);
		if (n === 0xbd19) {
			this.bStop = true; // TODO HOWTO?
		}
		Utils.console.log("call end: " + n);
	},

	cls: function (n) {
		Utils.console.log("cls: " + n);
		this.sOut = "";
	},
	end: function () {
		this.bStop = true;
	},
	"goto": function (n) {
		this.iLine = n;
	},
	inkey$: function () {
		Utils.console.log("inkey$: TODO");
		return ""; //TODO
	},
	input: function (sMsg, sVar) {
		var sInput;

		Utils.console.log("input:");
		// a simple input via prompt
		sInput = window.prompt(sMsg + " " + sVar); // eslint-disable-line no-alert
		if (sInput === null) {
			sInput = "";
		}
		return sInput;
	},
	locate: function (n, x, y) {
		Utils.console.log("locate: ", n, x, y, "(not implemented)");
	},
	mode: function (n) {
		Utils.console.log("mode: " + n);
		this.sOut = "";
	},
	print: function () {
		var s = "",
			i;

		for (i = 0; i < arguments.length; i += 1) {
			s += arguments[i];
		}
		this.sOut += s;
	},
	randomize: function (n) {
		var sInput;

		if (n === undefined) {
			// a simple input via prompt
			sInput = window.prompt("Random number seed?"); // eslint-disable-line no-alert
			if (!sInput) {
				sInput = 1;
			}
			n = Number(sInput);
		}
		Utils.console.log("randomize: " + n);
		this.oRandom.init(n);
	},
	rnd: function (n) {
		var x;

		Utils.console.log("rnd");
		if (n < 0) { // TODO
			x = this.lastRnd;
		} else if (n === 0) {
			x = this.lastRnd;
		} else { // >0 or undefined
			x = this.oRandom.random();
			this.lastRnd = x;
		}
		return x;
	},
	stop: function () {
		this.bStop = true;
	},
	tab: function () {
		return "   "; //TODO
	},
	time: function () {
		return Math.floor((Date.now() - this.iStartTime) * 300 / 1000);
	},
	wait: function (iPort /* , iMask, iInv */) {
		if (iPort === 0) {
			debugger;
		}
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = CpcVm;
}
