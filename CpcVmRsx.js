// CpcVmRsx.js - CPC Virtual Machine: RSX
// (c) Marco Vieth, 2020
// https://benchmarko.github.io/CPCBasic/
//

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

function CpcVmRsx(oVm) {
	this.rsxInit(oVm);
}

CpcVmRsx.prototype = {
	rsxInit: function (oVm) {
		this.oVm = oVm;
	},

	rsxIsAvailable: function (sName) {
		return sName in this;
	},

	a: function () {
		this.oVm.vmNotImplemented("|A");
	},

	b: function () {
		this.oVm.vmNotImplemented("|B");
	},

	basic: function () { // not an AMSDOS command
		Utils.console.log("basic: |BASIC");
		this.oVm.vmStop("reset", 90);
	},

	cpm: function () {
		this.oVm.vmNotImplemented("|CPM");
	},

	fnGetVariableByAddress: function (iIndex) {
		var v = this.oVm.v,
			aV = Object.keys(v),
			sKey = aV[iIndex];

		return sKey ? v[sKey] : "";
	},

	dir: function (sFileMask) { // optional; string or addressOf number
		var iStream = 0;

		if (typeof sFileMask === "number") { // assuming addressOf
			sFileMask = this.fnGetVariableByAddress(sFileMask);
		} else if (typeof sFileMask !== "string") {
			sFileMask = ""; // default
		}
		if (sFileMask) {
			sFileMask = this.oVm.vmAdaptFilename(sFileMask, "|DIR");
		}

		this.oVm.vmStop("fileDir", 45, false, {
			iStream: iStream,
			sCommand: "|dir",
			sFileMask: sFileMask
		});

		/*
		aDir = oVm.vmGetDirectoryEntries(sFileMask);

		oVm.print(iStream, "\r\n");
		for (i = 0; i < aDir.length; i += 1) {
			sKey = aDir[i];
			sKey = sKey.padStart(12, " ") + "   ";
			oVm.print(iStream, sKey);
		}
		oVm.print(iStream, "\r\n");
		*/
	},

	disc: function () {
		this.oVm.vmNotImplemented("|DISC");
	},

	disc_in: function () { // eslint-disable-line camelcase
		this.oVm.vmNotImplemented("|DISC.IN");
	},

	disc_out: function () { // eslint-disable-line camelcase
		this.oVm.vmNotImplemented("|DISC.OUT");
	},

	drive: function () {
		this.oVm.vmNotImplemented("|DRIVE");
	},

	era: function (sFileMask) {
		var iStream = 0;

		if (typeof sFileMask === "number") { // assuming addressOf
			sFileMask = this.fnGetVariableByAddress(sFileMask);
		}

		sFileMask = this.oVm.vmAdaptFilename(sFileMask, "|ERA");

		this.oVm.vmStop("fileEra", 45, false, {
			iStream: iStream,
			sCommand: "|era",
			sFileMask: sFileMask
		});

		/*
		sFileMask = this.oVm.vmAdaptFilename(sFileMask, "|ERA");
		this.oVm.vmStop("eraseFile", 90, false, {
			sName: sFileMask
		});
		*/
	},

	ren: function (sNew, sOld) {
		var iStream = 0;

		if (typeof sNew === "number") { // assuming addressOf
			sNew = this.fnGetVariableByAddress(sNew);
		}
		if (typeof sOld === "number") { // assuming addressOf
			sOld = this.fnGetVariableByAddress(sOld);
		}

		sNew = this.oVm.vmAdaptFilename(sNew, "|REN");
		sOld = this.oVm.vmAdaptFilename(sOld, "|REN");

		this.oVm.vmStop("fileRen", 45, false, {
			iStream: iStream,
			sCommand: "|ren",
			sNew: sNew,
			sOld: sOld
		});
		//this.oVm.vmNotImplemented("|REN");
	},

	tape: function () {
		this.oVm.vmNotImplemented("|TAPE");
	},

	tape_in: function () { // eslint-disable-line camelcase
		this.oVm.vmNotImplemented("|TAPE.IN");
	},

	tape_out: function () { // eslint-disable-line camelcase
		this.oVm.vmNotImplemented("|TAPE.OUT");
	},

	user: function () {
		this.oVm.vmNotImplemented("|USER");
	},

	mode: function (iMode, s) {
		var oWinData, i, oWin;

		iMode = this.oVm.vmInRangeRound(iMode, 0, 3, "|MODE");
		this.oVm.iMode = iMode;
		oWinData = this.oVm.mWinData[this.oVm.iMode];
		Utils.console.log("rsxMode: (test)", iMode, s);

		for (i = 0; i < this.oVm.iStreamCount - 2; i += 1) { // for window streams
			oWin = this.oVm.aWindow[i];
			Object.assign(oWin, oWinData);
		}
		this.oVm.oCanvas.changeMode(iMode); // or setMode?
	},

	renum: function () { // optional args: new number, old number, step, keep line (only for |renum)
		this.oVm.renum.apply(this.oVm, arguments);
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = CpcVmRsx;
}
