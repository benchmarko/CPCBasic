// Cpc.js - ...
//
/* globals */

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}
function Cpc(options) {
	this.init0(options);
}

Cpc.prototype = {
	init0: function (options) {
		this.options = options || {};
	},

	mode: function (i) {
		Utils.console.log("mode " + i);
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = Cpc;
}
