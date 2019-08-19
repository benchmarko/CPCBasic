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
		return "[Not implemented yet: after]";
	},

	// and

	asc: function (s) {
		return String(s).charCodeAt(0);
	},

	atn: function (n) {
		return Math.atan((this.bDeg) ? Utils.toRadians(n) : n);
	},

	auto: function () {
		return "[Not implemented yet: auto]";
	},

	bin$: function (n, iPad) {
		return (n >>> 0).toString(2).padStart(iPad || 16, 0); // eslint-disable-line no-bitwise
	},

	border: function () {
		return "[Not implemented yet: border]";
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
		return "[Not implemented yet: cat]";
	},

	chain: function () {
		return "[Not implemented yet: chain, chain merge]";
	},

	chr$: function (n) {
		return String.fromCharCode(n);
	},

	cint: function (n) {
		return Math.round(n);
	},

	clear: function () {
		return "[Not implemented yet: clear]";
	},

	clearInput: function () {
		return "[Not implemented yet: clearInput]";
	},

	clg: function () {
		return "[Not implemented yet: clg]";
	},

	closein: function () {
		return "[Not implemented yet: closein]";
	},

	closeout: function () {
		return "[Not implemented yet: closeout]";
	},

	cls: function (n) {
		n = n || 0;
		Utils.console.log("cls: " + n);
		this.sOut = "";
	},

	cont: function () {
		return "[Not implemented yet: cont]";
	},

	copychr$: function () {
		return "[Not implemented yet: copychr$]";
	},

	cos: function (n) {
		return Math.cos((this.bDeg) ? Utils.toRadians(n) : n);
	},

	creal: function (n) {
		return n; // TODO
	},

	cursor: function () {
		return "[Not implemented yet: cursor]";
	},

	data: function () {
		return "[Not implemented yet: data]";
	},

	dec$: function () {
		return "[Not implemented yet: dec$]";
	},

	// def fn

	defint: function () {
		return "[Not implemented yet: defint]";
	},

	defreal: function () {
		return "[Not implemented yet: defreal]";
	},

	defstr: function () {
		return "[Not implemented yet: defstr]";
	},

	deg: function () {
		this.bDeg = true;
	},

	"delete": function () {
		return "[Not implemented yet: delete]";
	},

	derr: function () {
		return 0; // "[Not implemented yet: derr]"
	},

	di: function () {
		return "[Not implemented yet: di]";
	},

	dim: function () {
		return "[Not implemented yet: dim]";
	},

	draw: function () {
		return "[Not implemented yet: draw]";
	},

	drawr: function () {
		return "[Not implemented yet: drawr]";
	},

	edit: function () {
		return "[Not implemented yet: edit]";
	},

	ei: function () {
		return "[Not implemented yet: ei]";
	},

	// else

	end: function () {
		this.bStop = true;
	},

	ent: function () {
		return "[Not implemented yet: ent]";
	},

	env: function () {
		return "[Not implemented yet: env]";
	},

	eof: function () {
		return "[Not implemented yet: eof]";
	},

	erase: function () {
		return "[Not implemented yet: erase]";
	},

	erl: function () {
		return "[Not implemented yet: erl]";
	},

	err: function () {
		return "[Not implemented yet: err]";
	},

	error: function () {
		return "[Not implemented yet: error]";
	},

	every: function () {
		return "[Not implemented yet: every]";
	},

	exp: function (n) {
		return Math.exp(n);
	},

	fill: function () {
		return "[Not implemented yet: fill]";
	},

	fix: function (n) {
		return Math.trunc(n); // (ES6: Math.trunc)
	},

	// fn

	// for

	frame: function () {
		return "[Not implemented yet: frame]";
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
		return "[Not implemented yet: graphicsPaper]";
	},

	graphicsPen: function () {
		return "[Not implemented yet: graphicsPen]";
	},

	hex$: function (n, iPad) {
		return (n >>> 0).toString(16).padStart(iPad || 16, 0); // eslint-disable-line no-bitwise
	},

	himem: function () {
		return this.iHimem;
	},

	// if

	ink: function () {
		return "[Not implemented yet: ink]";
	},

	inkey: function () {
		return "[Not implemented yet: inkey]";
	},

	inkey$: function () {
		return "[Not implemented yet: inkey$]";
	},

	inp: function () {
		return "[Not implemented yet: inp]";
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
		return "[Not implemented yet: joy]";
	},

	key: function () {
		return "[Not implemented yet: key]";
	},

	keyDef: function () {
		return "[Not implemented yet: keyDef]";
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
		return "[Not implemented yet: let]";
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
		return "[Not implemented yet: list]";
	},

	load: function () {
		return "[Not implemented yet: load]";
	},

	locate: function () {
		return "[Not implemented yet: locate]";
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
		return "[Not implemented yet: mask]";
	},

	max: function () { // varargs
		return Math.max.apply(null, arguments);
	},

	memory: function (n) {
		this.iHimem = n;
	},

	merge: function () {
		return "[Not implemented yet: merge]";
	},

	mid$: function (s, iStart, iLen) { // as function
		return s.substr(iStart - 1, iLen);
	},

	mid$Cmd: function () {
		return "[Not implemented yet: mid$ as cmd]";
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
		return "[Not implemented yet: move]";
	},

	mover: function () {
		return "[Not implemented yet: mover]";
	},

	"new": function () {
		return "[Not implemented yet: new]";
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
		return "[Not implemented yet: openin]";
	},

	openout: function () {
		return "[Not implemented yet: openout]";
	},

	// or

	origin: function () {
		return "[Not implemented yet: origin]";
	},

	out: function () {
		return "[Not implemented yet: out]";
	},

	paper: function () {
		return "[Not implemented yet: paper]";
	},

	peek: function () {
		return "[Not implemented yet: peek]";
	},

	pen: function () {
		return "[Not implemented yet: pen]";
	},

	pi: function () {
		return Math.PI; // or: 3.14159265
	},

	plot: function () {
		return "[Not implemented yet: plot]";
	},

	plotr: function () {
		return "[Not implemented yet: plotr]";
	},

	poke: function () {
		return "[Not implemented yet: poke]";
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
		return "[Not implemented yet: read]";
	},

	release: function () {
		return "[Not implemented yet: release]";
	},

	// rem

	remain: function () {
		return "[Not implemented yet: remain]";
	},

	renum: function () {
		return "[Not implemented yet: renum]";
	},

	restore: function () {
		return "[Not implemented yet: restore]";
	},

	resume: function () { // resume, resume n, resume next
		return "[Not implemented yet: resume]";
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
		return "[Not implemented yet: run]";
	},

	save: function () {
		return "[Not implemented yet: save]";
	},

	sgn: function (n) {
		return Math.sign(n);
	},

	sin: function (n) {
		return Math.sin((this.bDeg) ? Utils.toRadians(n) : n);
	},

	sound: function () {
		return "[Not implemented yet: sound]";
	},

	space$: function (n) {
		return " ".repeat(n);
	},

	spc: function (n) {
		return " ".repeat(n);
	},

	speed: function () { // speed ink, speed key, speed write
		return "[Not implemented yet: speed]";
	},

	sq: function () {
		return "[Not implemented yet: sq]";
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
		return "[Not implemented yet: symbol]";
	},

	symbolAfter: function () {
		return "[Not implemented yet: symbolAfter]";
	},

	tab: function (n) {
		if (n === undefined) { // simulated tab in print for ","
			n = this.iZone;
		}
		return " ".repeat(n); // TODO: adapt spaces for next tab position
	},

	tag: function () {
		return "[Not implemented yet: tag]";
	},

	tagoff: function () {
		return "[Not implemented yet: tagoff]";
	},

	tan: function (n) {
		return Math.tan((this.bDeg) ? Utils.toRadians(n) : n);
	},

	test: function () {
		return "[Not implemented yet: test]";
	},

	testr: function () {
		return "[Not implemented yet: testr]";
	},

	// then

	time: function () {
		return Math.floor((Date.now() - this.iStartTime) * 300 / 1000);
	},

	// to

	troff: function () {
		return "[Not implemented yet: troff]";
	},

	tron: function () {
		return "[Not implemented yet: tron]";
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
		return "[Not implemented yet: vpos]";
	},

	wait: function (iPort /* , iMask, iInv */) {
		if (iPort === 0) {
			debugger;
		}
	},

	// wend

	// while

	width: function () {
		return "[Not implemented yet: width]";
	},

	window: function () {
		return "[Not implemented yet: window]";
	},

	windowSwap: function () {
		return "[Not implemented yet: windowSwap]";
	},

	write: function () {
		return "[Not implemented yet: write]";
	},

	// xor

	xpos: function () {
		return "[Not implemented yet: xpos]";
	},

	ypos: function () {
		return "[Not implemented yet: ypos]";
	},

	zone: function (n) {
		this.iZone = n;
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = CpcVm;
}
