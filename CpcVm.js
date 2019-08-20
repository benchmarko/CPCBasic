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
		this.v = {}; // TODO
		this.oGosubStack = [];
		this.bDeg = false;
		this.iHimem = 42619; // example
		this.iPos = 1; // current text position in line
		this.iZone = 13;
	},

	vmDefault: function () {
		this.sOut += "Line not found: " + this.iLine;
		this.bStop = true;
	},

	vmNotImplemented: function (sName) {
		Utils.console.warn("Not implemented: " + sName);
	},
	/*
	zformat: function (s, length) {
		var i;

		s = String(s);
		for (i = s.length; i < length; i += 1) {
			s = "0" + s;
		}
		return s;
	},
	*/

	// TEST:
	// e: iPrecision ? parseFloat(arg).toExponential(iPrecision) : parseFloat(arg).toExponential()
	// f: iPrecision ? parseFloat(arg).toFixed(iPrecision) : parseFloat(arg)
	// g: iPrecision ? String(Number(arg.toPrecision(iPrecision))) : parseFloat(arg)
	vmUsingFormat1: function (sFormat, arg) { // TODO
		var sPadChar = " ",
			iPadLen, sPad, aFormat,
			sStr;

		if (typeof arg === "string") {
			if (sFormat === "&") {
				sStr = arg;
			} else if (sFormat === "!") {
				sStr = arg.charAt(0);
			} else {
				sStr = arg.substr(0, sFormat.length); // assuming "\...\"
				iPadLen = sFormat.length - arg.length;
				sPad = (iPadLen > 0) ? sPadChar.repeat(iPadLen) : "";
				sStr = sPad + arg;
			}
		} else { // number
			if (sFormat.indexOf(".") < 0) { // no decimal point?
				arg = Number(arg).toFixed(0);
			} else { // assume ###.##
				aFormat = sFormat.split(".", 2);
				arg = Number(arg).toFixed(aFormat[1].length);
			}
			iPadLen = sFormat.length - arg.length; //ph.width - (sign + arg).length;
			sPad = (iPadLen > 0) ? sPadChar.repeat(iPadLen) : "";
			sStr = sPad + arg;
			if (sStr.length > sFormat.length) {
				sStr = "%" + sStr; // mark too long
			}
		}
		return sStr;
	},

	abs: function (n) {
		return Math.abs(n);
	},

	after: function () {
		this.vmNotImplemented("after");
	},

	// and

	asc: function (s) {
		return String(s).charCodeAt(0);
	},

	atn: function (n) {
		return Math.atan((this.bDeg) ? Utils.toRadians(n) : n);
	},

	auto: function () {
		this.vmNotImplemented("auto");
	},

	bin$: function (n, iPad) {
		return (n >>> 0).toString(2).padStart(iPad || 16, 0); // eslint-disable-line no-bitwise
	},

	border: function () {
		this.vmNotImplemented("border");
	},

	// break

	call: function (n) { // TODO adr + parameters
		Utils.console.log("call: " + n);
		if (n === 0xbd19) {
			this.bStop = true; // TODO HOWTO?
		}
		Utils.console.log("call end: " + n);
	},

	cat: function () {
		this.vmNotImplemented("cat");
	},

	chain: function () {
		this.vmNotImplemented("chain, chain merge");
	},

	chr$: function (n) {
		return String.fromCharCode(n);
	},

	cint: function (n) {
		return Math.round(n);
	},

	clear: function () {
		this.vmNotImplemented("clear");
	},

	clearInput: function () {
		this.vmNotImplemented("clearInput");
	},

	clg: function () {
		this.vmNotImplemented("clg");
	},

	closein: function () {
		this.vmNotImplemented("closein");
	},

	closeout: function () {
		this.vmNotImplemented("closeout");
	},

	cls: function (n) {
		n = n || 0;
		Utils.console.log("cls: " + n);
		this.sOut = "";
	},

	cont: function () {
		this.vmNotImplemented("cont");
	},

	copychr$: function () {
		this.vmNotImplemented("copychr$");
	},

	cos: function (n) {
		return Math.cos((this.bDeg) ? Utils.toRadians(n) : n);
	},

	creal: function (n) {
		return n; // TODO
	},

	cursor: function () {
		this.vmNotImplemented("cursor");
	},

	data: function () {
		this.vmNotImplemented("data");
	},

	dec$: function () {
		this.vmNotImplemented("dec$");
	},

	// def fn

	defint: function () {
		this.vmNotImplemented("defint");
	},

	defreal: function () {
		this.vmNotImplemented("defreal");
	},

	defstr: function () {
		this.vmNotImplemented("defstr");
	},

	deg: function () {
		this.bDeg = true;
	},

	"delete": function () {
		this.vmNotImplemented("delete");
	},

	derr: function () {
		return 0; // "[Not implemented yet: derr]"
	},

	di: function () {
		this.vmNotImplemented("di");
	},

	dim: function () {
		this.vmNotImplemented("dim");
	},

	draw: function () {
		this.vmNotImplemented("draw");
	},

	drawr: function () {
		this.vmNotImplemented("drawr");
	},

	edit: function () {
		this.vmNotImplemented("edit");
	},

	ei: function () {
		this.vmNotImplemented("ei");
	},

	// else

	end: function () {
		this.bStop = true;
	},

	ent: function () {
		this.vmNotImplemented("ent");
	},

	env: function () {
		this.vmNotImplemented("env");
	},

	eof: function () {
		this.vmNotImplemented("eof");
	},

	erase: function () {
		this.vmNotImplemented("erase");
	},

	erl: function () {
		this.vmNotImplemented("erl");
	},

	err: function () {
		this.vmNotImplemented("err");
	},

	error: function () {
		this.vmNotImplemented("error");
	},

	every: function () {
		this.vmNotImplemented("every");
	},

	exp: function (n) {
		return Math.exp(n);
	},

	fill: function () {
		this.vmNotImplemented("fill");
	},

	fix: function (n) {
		return Math.trunc(n); // (ES6: Math.trunc)
	},

	// fn

	// for

	frame: function () {
		this.vmNotImplemented("frame");
	},

	fre: function (/* n */) {
		return 42245; // TTT
	},

	gosub: function (retLabel, n) {
		this.iLine = n;
		this.oGosubStack.push(retLabel);
	},

	"goto": function (n) {
		this.iLine = n;
	},

	graphicsPaper: function () {
		this.vmNotImplemented("graphicsPaper");
	},

	graphicsPen: function () {
		this.vmNotImplemented("graphicsPen");
	},

	hex$: function (n, iPad) {
		return (n >>> 0).toString(16).padStart(iPad || 16, 0); // eslint-disable-line no-bitwise
	},

	himem: function () {
		return this.iHimem;
	},

	// if

	ink: function () {
		this.vmNotImplemented("ink");
	},

	inkey: function () {
		this.vmNotImplemented("inkey");
	},

	inkey$: function () {
		this.vmNotImplemented("inkey$");
	},

	inp: function () {
		this.vmNotImplemented("inp");
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

	instr: function (p1, p2, p3) { // optional startpos as first parameter
		if (typeof p1 === "string") {
			return p1.indexOf(p2) + 1;
		}
		return p2.indexOf(p3, p1) + 1;
	},

	"int": function (n) {
		return Math.floor(n);
	},

	joy: function () {
		this.vmNotImplemented("joy");
	},

	key: function () {
		this.vmNotImplemented("key");
	},

	keyDef: function () {
		this.vmNotImplemented("keyDef");
	},

	left$: function (s, iLen) {
		/*
		if (s.length < iLen) {
			s = s.repeat(Math.ceil(iLen / s.length || 1));
		}
		*/
		return s.substr(0, iLen);
	},

	len: function (s) {
		return s.length;
	},

	let: function () {
		this.vmNotImplemented("let");
	},

	lineInput: function (sMsg, sVar) { // sVar must be string variable
		var sInput;

		Utils.console.log("lineInput:");
		// a simple input via prompt
		sInput = window.prompt(sMsg + " " + sVar); // eslint-disable-line no-alert
		if (sInput === null) {
			sInput = "";
		}
		return sInput;
	},

	list: function () {
		this.vmNotImplemented("list");
	},

	load: function () {
		this.vmNotImplemented("load");
	},

	locate: function () {
		this.vmNotImplemented("locate");
		//Utils.console.log("locate: ", n, x, y, "(not implemented)");
	},

	log: function (n) {
		return Math.log(n);
	},

	log10: function (n) {
		return Math.log10(n);
	},

	lower$: function (s) {
		return s.toLowerCase();
	},

	mask: function () {
		this.vmNotImplemented("mask");
	},

	max: function () { // varargs
		return Math.max.apply(null, arguments);
	},

	memory: function (n) {
		this.iHimem = n;
	},

	merge: function () {
		this.vmNotImplemented("merge");
	},

	mid$: function (s, iStart, iLen) { // as function
		return s.substr(iStart - 1, iLen);
	},

	mid$Cmd: function () {
		this.vmNotImplemented("mid$ as cmd");
	},

	min: function () { // varargs
		return Math.min.apply(null, arguments);
	},

	// mod

	mode: function (n) {
		Utils.console.log("mode: " + n);
		this.sOut = "";
	},

	move: function () {
		this.vmNotImplemented("move");
	},

	mover: function () {
		this.vmNotImplemented("mover");
	},

	"new": function () {
		this.vmNotImplemented("new");
	},

	// next

	// not

	// on break cont

	// on break gosub

	// on break stop

	// on error goto

	onGosub: function (retLabel, n) { // varargs
		this.iLine = arguments[n + 1]; // n=1...; start with argument 2
		this.oGosubStack.push(retLabel);
	},

	onGoto: function (n) { // varargs
		this.iLine = arguments[n];
	},

	// on sq gosub

	openin: function () {
		this.vmNotImplemented("openin");
	},

	openout: function () {
		this.vmNotImplemented("openout");
	},

	// or

	origin: function () {
		this.vmNotImplemented("origin");
	},

	out: function () {
		this.vmNotImplemented("out");
	},

	paper: function () {
		this.vmNotImplemented("paper");
	},

	peek: function () {
		this.vmNotImplemented("peek");
	},

	pen: function () {
		this.vmNotImplemented("pen");
	},

	pi: function () {
		return Math.PI; // or: 3.14159265
	},

	plot: function () {
		this.vmNotImplemented("plot");
	},

	plotr: function () {
		this.vmNotImplemented("plotr");
	},

	poke: function () {
		this.vmNotImplemented("poke");
	},

	pos: function (/* iStream */) {
		return this.iPos; // TODO
	},

	print: function () {
		var sStr,
			i, iLf;

		for (i = 0; i < arguments.length; i += 1) {
			sStr = String(arguments[i]);
			this.sOut += sStr;

			iLf = sStr.indexOf("\n");
			if (iLf >= 0) {
				this.iPos = sStr.length - iLf; // TODO: tab in same print is already called, should depend on what is already printed
			} else {
				this.iPos += sStr.length;
			}
		}
		//this.sOut += s;
	},

	rad: function () {
		this.bDeg = false;
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

	read: function () {
		this.vmNotImplemented("read");
	},

	release: function () {
		this.vmNotImplemented("release");
	},

	// rem

	remain: function () {
		this.vmNotImplemented("remain");
	},

	renum: function () {
		this.vmNotImplemented("renum");
	},

	restore: function () {
		this.vmNotImplemented("restore");
	},

	resume: function () { // resume, resume n, resume next
		this.vmNotImplemented("resume");
	},

	"return": function () {
		var retLabel = this.oGosubStack.pop();

		this.iLine = retLabel;
	},

	right$: function (s, iLen) {
		return s.slice(-iLen);
	},

	rnd: function (n) {
		var x;

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

	round: function (n, iDecimals) {
		var iFact;

		iDecimals = iDecimals || 0;
		if (iDecimals >= 0) {
			iFact = Math.pow(10, iDecimals);
		} else {
			iFact = 1 / Math.pow(10, -iDecimals);
		}
		return Math.round(n * iFact) / iFact;
		// TEST: or to avoid rounding errors: return Number(Math.round(value + "e" + iDecimals) + "e-" + iDecimals); // https://www.jacklmoore.com/notes/rounding-in-javascript/
	},

	run: function () {
		this.vmNotImplemented("run");
	},

	save: function () {
		this.vmNotImplemented("save");
	},

	sgn: function (n) {
		return Math.sign(n);
	},

	sin: function (n) {
		return Math.sin((this.bDeg) ? Utils.toRadians(n) : n);
	},

	sound: function () {
		this.vmNotImplemented("sound");
	},

	space$: function (n) {
		return " ".repeat(n);
	},

	spc: function (n) {
		return " ".repeat(n);
	},

	speed: function () { // speed ink, speed key, speed write
		this.vmNotImplemented("speed");
	},

	sq: function () {
		this.vmNotImplemented("sq");
	},

	sqr: function (n) {
		return Math.sqrt(n);
	},

	// step

	stop: function () {
		this.bStop = true;
	},

	str$: function (n) {
		return String(n);
	},

	string$: function (iLen, chr) {
		if (typeof chr === "number") {
			chr = String.fromCharCode(chr); // chr$
		}
		return chr.repeat(iLen);
	},

	// swap (window swap)

	symbol: function () {
		this.vmNotImplemented("symbol");
	},

	symbolAfter: function () {
		this.vmNotImplemented("symbolAfter");
	},

	tab: function (n) {
		if (n === undefined) { // simulated tab in print for ","
			n = this.iZone;
		}
		return " ".repeat(n); // TODO: adapt spaces for next tab position
	},

	tag: function () {
		this.vmNotImplemented("tag");
	},

	tagoff: function () {
		this.vmNotImplemented("tagoff");
	},

	tan: function (n) {
		return Math.tan((this.bDeg) ? Utils.toRadians(n) : n);
	},

	test: function () {
		this.vmNotImplemented("test");
	},

	testr: function () {
		this.vmNotImplemented("testr");
	},

	// then

	time: function () {
		return Math.floor((Date.now() - this.iStartTime) * 300 / 1000);
	},

	// to

	troff: function () {
		this.vmNotImplemented("troff");
	},

	tron: function () {
		this.vmNotImplemented("tron");
	},

	unt: function (n) {
		if (n > 32767) {
			n -= 65536;
		}
		return n;
	},

	upper$: function (s) {
		return s.toUpperCase();
	},

	using: function (sFormat) { // varargs
		var reFormat = /(!|&|\\ *\\|#+\.?#*[+-]?)/,
			s = "",
			aFormat, i;

		/*
		if (sFormat.charAt(0) === "\\") { // string format with spaces?
			aFormat = [sFormat]; // or: t.value.split()
		} else {
			aFormat = sFormat.split(" ");
		}
		*/
		aFormat = sFormat.split(reFormat);
		i = 1;
		while (aFormat.length) {
			s += aFormat.shift();
			if (aFormat.length) {
				s += this.vmUsingFormat1(aFormat.shift(), arguments[i]);
			}
			i += 1;
		}
		/*
		for (i = 0; i < arguments.length - 1; i += 1) {
			s += aFormat[i * 2] + this.vmUsingFormat1(aFormat[i * 2 + 1], arguments[i + 1]);
		}
		*/
		return s;
	},

	val: function (s) {
		return parseFloat(s); //TODO
	},

	vpos: function () {
		this.vmNotImplemented("vpos");
	},

	wait: function (iPort /* , iMask, iInv */) {
		if (iPort === 0) {
			debugger;
		}
	},

	// wend

	// while

	width: function () {
		this.vmNotImplemented("width");
	},

	window: function () {
		this.vmNotImplemented("window");
	},

	windowSwap: function () {
		this.vmNotImplemented("windowSwap");
	},

	write: function () {
		this.vmNotImplemented("write");
	},

	// xor

	xpos: function () {
		this.vmNotImplemented("xpos");
	},

	ypos: function () {
		this.vmNotImplemented("ypos");
	},

	zone: function (n) {
		this.iZone = n;
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = CpcVm;
}
