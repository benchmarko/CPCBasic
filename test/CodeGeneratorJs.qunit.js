// CodeGeneratorJs.qunit.js - QUnit tests for CPCBasic CodeGeneratorJs
//
/* globals QUnit */

"use strict";

var bGenerateAllResults = false,
	Utils, BasicLexer, BasicParser, CodeGeneratorJs, Variables;

if (typeof require !== "undefined") {
	Utils = require("../Utils.js"); // eslint-disable-line global-require
	BasicLexer = require("../BasicLexer.js"); // eslint-disable-line global-require
	BasicParser = require("../BasicParser.js"); // eslint-disable-line global-require
	CodeGeneratorJs = require("../CodeGeneratorJs.js"); // eslint-disable-line global-require
	Variables = require("../Variables.js"); // eslint-disable-line global-require
}

QUnit.module("CodeGeneratorJs: Tests", function (/* hooks */) {
	var mAllTests = {
		numbers: {
			"a=1": " v.a = o.vmAssign(\"a\", 1);",
			"a=1.2": " v.a = o.vmAssign(\"a\", 1.2);",
			"a=-1.2": " v.a = o.vmAssign(\"a\", -1.2);",
			"a=+7.2": " v.a = o.vmAssign(\"a\", 7.2);",
			"a=&A7": " v.a = o.vmAssign(\"a\", 0xA7);",
			"a=-&A7": " v.a = o.vmAssign(\"a\", -(0xA7));",
			"a=&7FFF": " v.a = o.vmAssign(\"a\", 0x7FFF);",
			"a=&X10100111": " v.a = o.vmAssign(\"a\", 0b10100111);",
			"a=-&X111111111111111": " v.a = o.vmAssign(\"a\", -0b111111111111111);"
		},
		strings: {
			"a$=\"a12\"": " v.a$ = \"a12\";",
			"a$=+\"7.1\"": " v.a$ = \"7.1\";"
		},
		variables: {
			"a!=1.4": " v.aR = 1.4;",
			"a%=1.4": " v.aI = o.vmRound(1.4);",
			"a$=\"1.4\"": " v.a$ = \"1.4\";",
			"insert.line=2": " v.insert_line = o.vmAssign(\"i\", 2);",
			"a!(2)=1.4": " v.aRA[2] = 1.4;",
			"a%(2)=1.4": " v.aIA[2] = o.vmRound(1.4);",
			"a$(2)=\"1.4\"": " v.a$A[2] = \"1.4\";",
			"a$[2]=\"1.4\"": " v.a$A[2] = \"1.4\";",
			"a(9)=b(1,2)": " v.aA[9] = o.vmAssign(\"a\", v.bAA[1][2]);",
			"a[9]=b[1,2]": " v.aA[9] = o.vmAssign(\"a\", v.bAA[1][2]);",
			"a(10,10,10)=b(10,9)": " v.aAAA[10][10][10] = o.vmAssign(\"a\", v.bAA[10][9]);"
		},
		expressions: {
			"a=1+2+3": " v.a = o.vmAssign(\"a\", (1 + 2) + 3);",
			"a=3-2-1:": " v.a = o.vmAssign(\"a\", (3 - 2) - 1);",
			"a=&A7+&X10100111-(123-27)": " v.a = o.vmAssign(\"a\", (0xA7 + 0b10100111) - (123 - 27));",
			"a=(3+2)*(3-7)": " v.a = o.vmAssign(\"a\", (3 + 2) * (3 - 7));",
			"a=-(10-7)-(-6-2)": " v.a = o.vmAssign(\"a\", -(10 - 7) - (-6 - 2));",
			"a=20/2.5": " v.a = o.vmAssign(\"a\", 20 / 2.5);",
			"a=20\\3": " v.a = o.vmAssign(\"a\", (20 / 3) | 0);",
			"a=3^2:": " v.a = o.vmAssign(\"a\", Math.pow(3, 2));",
			"a=&X1001 AND &X1110": " v.a = o.vmAssign(\"a\", 0b1001 & 0b1110);",
			"a=&X1001 OR &X110": " v.a = o.vmAssign(\"a\", 0b1001 | 0b110);",
			"a=&X1001 XOR &X1010": " v.a = o.vmAssign(\"a\", 0b1001 ^ 0b1010);",
			"a=NOT &X1001": " v.a = o.vmAssign(\"a\", ~(0b1001));",
			"a=+++++++++---9": " v.a = o.vmAssign(\"a\", -9);",
			"a=(1=0)": " v.a = o.vmAssign(\"a\", 1 === 0 ? -1 : 0);",
			"a=(1>0)*(0<1)": " v.a = o.vmAssign(\"a\", (1 > 0 ? -1 : 0) * (0 < 1 ? -1 : 0));",
			"a=(b%>=c%)*(d<=e)": " v.a = o.vmAssign(\"a\", (v.bI >= v.cI ? -1 : 0) * (v.d <= v.e ? -1 : 0));"
		},
		special: {
			"a$=\"string with\nnewline\"": " v.a$ = \"string with\\x0anewline\";"
		},
		"abs, after gosub, and, asc, atn, auto": {
			"a=abs(2.3)": " v.a = o.vmAssign(\"a\", o.abs(2.3));",
			"10 after 2 gosub 10": " o.afterGosub(2, undefined, 10);",
			"10 after 3,1 gosub 10": " o.afterGosub(3, 1, 10);",
			"a=b and c": " v.a = o.vmAssign(\"a\", o.vmRound(v.b) & o.vmRound(v.c));",
			"a=asc(\"A\")": " v.a = o.vmAssign(\"a\", o.asc(\"A\"));",
			"a=atn(2.3)": " v.a = o.vmAssign(\"a\", o.atn(2.3));",
			"auto ": " o.auto();"
		},
		"bin$, border": {
			"a$=bin$(3)": " v.a$ = o.bin$(3);",
			"a$=bin$(3,8)": " v.a$ = o.bin$(3, 8);",
			"a$=bin$(&x1001)": " v.a$ = o.bin$(0b1001);",
			"border 5": " o.border(5);",
			"border 5,a": " o.border(5, v.a);"
		},
		"call, cat, chain, chain merge, chr$, cint, clg, closein, closeout, cls, cont, copychr$, cos, creal, cursor": {
			"call&a7bc": " o.call(0xa7bc); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"call 4711,1,2,3,4": " o.call(4711, 1, 2, 3, 4); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"cat ": " o.cat();",
			"chain\"f1\"": " o.chain(\"f1\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"chain\"f2\" , 10": " o.chain(\"f2\", 10); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"chain\"f3\" , 10+3": " o.chain(\"f3\", 10 + 3); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"chain merge \"f1\"": " o.chainMerge(\"f1\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"chain merge \"f2\" , 10": " o.chainMerge(\"f2\", 10); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"chain merge \"f3\" , 10+3": " o.chainMerge(\"f3\", 10 + 3); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"chain merge \"f4\" , 10+3, delete 100-200": " o.chainMerge(\"f4\", 10 + 3, 100, 200); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"chain merge \"f5\" , , delete 100-200": " o.chainMerge(\"f5\", undefined, 100, 200); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"a=chr$(65)": " v.a = o.vmAssign(\"a\", o.chr$(65));",
			"a=cint(2.3)": " v.a = o.vmAssign(\"a\", o.cint(2.3));",
			"clear ": " o.clear(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"clear input": " o.clearInput();",
			"clg ": " o.clg();",
			"clg 15-1": " o.clg(15 - 1);",
			"closein ": " o.closein();",
			"closeout ": " o.closeout(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"cls ": " o.cls(0);",
			"cls #5": " o.cls(5);",
			"cls #a+7-2*b": " o.cls((v.a + 7) - (2 * v.b));",
			"cont ": " o.cont(); break;",
			"a$=copychr$(#0)": " v.a$ = o.copychr$(0);",
			"a$=copychr$(#a+1)": " v.a$ = o.copychr$(v.a + 1);",
			"a=cos(2.3)": " v.a = o.vmAssign(\"a\", o.cos(2.3));",
			"a=creal(2.3+a)": " v.a = o.vmAssign(\"a\", o.creal(2.3 + v.a));",
			"cursor ": " o.cursor(0);",
			"cursor 0": " o.cursor(0, 0);",
			"cursor 1": " o.cursor(0, 1);",
			"cursor 1,1": " o.cursor(0, 1, 1);",
			"cursor ,1": " o.cursor(0, undefined, 1);",
			"cursor #2": " o.cursor(2);",
			"cursor #2,1": " o.cursor(2, 1);",
			"cursor #2,1,1": " o.cursor(2, 1, 1);",
			"cursor #2,,1": " o.cursor(2, undefined, 1);"
		},
		"data, dec$, def fn, defint, defreal, defstr, deg, delete, derr, di, dim, draw, drawr": {
			"data ": "o.data(NaN, \"\");\n /* data */;",
			"data ,": "o.data(NaN, undefined, undefined);\n /* data */;",
			"data 1,2,3": "o.data(NaN, \"1\", \"2\", \"3\");\n /* data */;",
			"data \"item1\",\" item2\",\"item3 \"": "o.data(NaN, \"item1\", \" item2\", \"item3 \");\n /* data */;",
			"data item1,item2,item3": "o.data(NaN, \"item1\", \"item2\", \"item3\");\n /* data */;",
			"data &a3,4,abc,": "o.data(NaN, \"&a3\", \"4\", \"abc\", undefined);\n /* data */;",
			"data \" \",!\"#$%&'()*+,\",\"": "o.data(NaN, \" \", \"!\\\"#$%&'()*+\", \",\");\n /* data */;",
			"a$=dec$(3,\"##.##\")": " v.a$ = o.dec$(3, \"##.##\");",
			"a$=dec$(a$,\"\\    \\\")": " v.a$ = o.dec$(v.a$, \"\\\\    \\\\\");",
			"def fnclk=10": " v.fnclk = function () { return o.vmAssign(\"f\", 10); };",
			"def fnclk(a)=a*10": " v.fnclk = function (a) { return o.vmAssign(\"f\", a * 10); };",
			"def fnclk(a,b)=a*10+b": " v.fnclk = function (a, b) { return o.vmAssign(\"f\", (a * 10) + b); };",
			"def fnclk$(a$,b$)=a$+b$": " v.fnclk$ = function (a$, b$) { return a$ + b$; };",
			"def fn clk=10": " v.fnclk = function () { return o.vmAssign(\"f\", 10); };",
			"def fn clk(a)=a*10": " v.fnclk = function (a) { return o.vmAssign(\"f\", a * 10); };",
			"def fn clk(a,b)=a*10+b": " v.fnclk = function (a, b) { return o.vmAssign(\"f\", (a * 10) + b); };",
			"def fn clk$(a$,b$)=a$+b$": " v.fnclk$ = function (a$, b$) { return a$ + b$; };",
			"defint a": " o.defint(\"a\");",
			"defint a-t": " o.defint(\"a - t\");",
			"defint a,b,c": " o.defint(\"a\"); o.defint(\"b\"); o.defint(\"c\");",
			"defint a,b-c,v,x-y": " o.defint(\"a\"); o.defint(\"b - c\"); o.defint(\"v\"); o.defint(\"x - y\");",
			"defreal a": " o.defreal(\"a\");",
			"defreal a-t": " o.defreal(\"a - t\");",
			"defreal a,b,c": " o.defreal(\"a\"); o.defreal(\"b\"); o.defreal(\"c\");",
			"defreal a,b-c,v,x-y": " o.defreal(\"a\"); o.defreal(\"b - c\"); o.defreal(\"v\"); o.defreal(\"x - y\");",
			"defstr a": " o.defstr(\"a\");",
			"defstr a-t": " o.defstr(\"a - t\");",
			"defstr a,b,c": " o.defstr(\"a\"); o.defstr(\"b\"); o.defstr(\"c\");",
			"defstr a,b-c,v,x-y": " o.defstr(\"a\"); o.defstr(\"b - c\"); o.defstr(\"v\"); o.defstr(\"x - y\");",
			"deg ": " o.deg();",
			"delete": " o.delete(1, 65535); break;",
			"delete 10": " o.delete(10); break;",
			"delete 1-": " o.delete(1, 65535); break;",
			"delete -1": " o.delete(undefined, 1); break;",
			"delete 1-2": " o.delete(1, 2); break;",
			"a=derr ": " v.a = o.vmAssign(\"a\", o.derr());",
			"di ": " o.di();",
			"dim a(1)": " /* v.aA[1] = */ o.dim(\"aA\", 1);",
			"dim a!(1)": " /* v.aRA[1] = */ o.dim(\"aRA\", 1);",
			"dim a%(1)": " /* v.aIA[1] = */ o.dim(\"aIA\", 1);",
			"dim a$(1)": " /* v.a$A[1] = */ o.dim(\"a$A\", 1);",
			"dim a(2,13)": " /* v.aAA[2][13] = */ o.dim(\"aAA\", 2, 13);",
			"dim a(2,13+7),b$[3],c![2*a,7]": " /* v.aAA[2][13 + 7] = */ o.dim(\"aAA\", 2, 13 + 7); /* v.b$A[3] = */ o.dim(\"b$A\", 3); /* v.cRAA[2 * v.a][7] = */ o.dim(\"cRAA\", 2 * v.a, 7);",
			"dim a[2,13)": " /* v.aAA[2][13] = */ o.dim(\"aAA\", 2, 13);",
			"draw 10,20": " o.draw(10, 20);",
			"draw -10,-20,7": " o.draw(-10, -20, 7);",
			"draw 10,20,7,3": " o.draw(10, 20, 7, 3);",
			"draw 10,20,,3": " o.draw(10, 20, undefined, 3);",
			"draw x,y,m,g1": " o.draw(v.x, v.y, v.m, v.g1);",
			"drawr 10,20": " o.drawr(10, 20);",
			"drawr -10,-20,7": " o.drawr(-10, -20, 7);",
			"drawr 10,20,7,3": " o.drawr(10, 20, 7, 3);",
			"drawr 10,20,,3": " o.drawr(10, 20, undefined, 3);",
			"drawr x,y,m,g1": " o.drawr(v.x, v.y, v.m, v.g1);"
		},
		"edit, ei, else, end, ent, env, eof, erase, erl, err, error, every gosub, exp": {
			"edit 20": " o.edit(20); break;",
			"ei ": " o.ei();",
			"else": " // else",
			"else 10": " // else 10",
			"else a=7": " // else a = 7",
			"end ": " o.end(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"ent 1": " o.ent(1);",
			"ent 1,2,a,4": " o.ent(1, 2, v.a, 4);",
			"ent num,steps,dist,ti,steps2,dist2,ti2": " o.ent(v.num, v.steps, v.dist, v.ti, v.steps2, v.dist2, v.ti2);",
			"ent num,=period,ti,=period2,ti2": " o.ent(v.num, undefined, v.period, v.ti, undefined, v.period2, v.ti2);",
			"env 1": " o.env(1);",
			"env 1,2,a,4": " o.env(1, 2, v.a, 4);",
			"env num,steps,dist,ti,steps2,dist2,ti2": " o.env(v.num, v.steps, v.dist, v.ti, v.steps2, v.dist2, v.ti2);",
			"env num,=reg,period,=reg2,period2": " o.env(v.num, undefined, v.reg, v.period, undefined, v.reg2, v.period2);",
			"a=eof": " v.a = o.vmAssign(\"a\", o.eof());",
			"erase a": " o.erase(\"a\");",
			"erase b$": " o.erase(\"b$\");",
			"erase a,b$,c!,d%": " o.erase(\"a\", \"b$\", \"cR\", \"dI\");",
			"a=erl": " v.a = o.vmAssign(\"a\", o.erl());",
			"a=err": " v.a = o.vmAssign(\"a\", o.err());",
			"error 7": " o.error(7); break;",
			"error 5+a": " o.error(5 + v.a); break;",
			"10 every 50 gosub 10": " o.everyGosub(50, undefined, 10);",
			"10 every 25.2,1 gosub 10": " o.everyGosub(25.2, 1, 10);",
			"10 every 10+a,b gosub 10": " o.everyGosub(10 + v.a, v.b, 10);",
			"a=exp(2.3)": " v.a = o.vmAssign(\"a\", o.exp(2.3));"
		},
		"fill, fix, fn, for, frame, fre": {
			"fill 7": " o.fill(7);",
			"a=fix(2.3)": " v.a = o.vmAssign(\"a\", o.fix(2.3));",
			"x=fnclk": " v.x = o.vmAssign(\"x\", v.fnclk());",
			"x=fnclk(a)": " v.x = o.vmAssign(\"x\", v.fnclk(v.a));",
			"x=fnclk(a,b)": " v.x = o.vmAssign(\"x\", v.fnclk(v.a, v.b));",
			"x$=fnclk$(a$,b$)": " v.x$ = v.fnclk$(v.a$, v.b$);",
			"x=fn clk": " v.x = o.vmAssign(\"x\", v.fnclk());",
			"x=fn clk(a)": " v.x = o.vmAssign(\"x\", v.fnclk(v.a));",
			"x=fn clk(a,b)": " v.x = o.vmAssign(\"x\", v.fnclk(v.a, v.b));",
			"x$=fn clk$(a$,b$)": " v.x$ = v.fnclk$(v.a$, v.b$);",
			"for a=1 to 10": " /* for() */ o.vmAssertNumberType(\"a\"); v.a = 1; o.goto(\"NaNf0b\"); break;\ncase \"NaNf0\": v.a += 1;\ncase \"NaNf0b\": if (v.a > 10) { o.goto(\"NaNf0e\"); break; }",
			"for a%=1.5 to 9.5": " /* for() */ v.aI = o.vmAssign(\"aI\", 1.5); v.aIEnd = o.vmAssign(\"aI\", 9.5); o.goto(\"NaNf0b\"); break;\ncase \"NaNf0\": v.aI += 1;\ncase \"NaNf0b\": if (v.aI > v.aIEnd) { o.goto(\"NaNf0e\"); break; }",
			"for a!=1.5 to 9.5": " /* for() */ o.vmAssertNumberType(\"aR\"); v.aR = o.vmAssign(\"aR\", 1.5); v.aREnd = o.vmAssign(\"aR\", 9.5); o.goto(\"NaNf0b\"); break;\ncase \"NaNf0\": v.aR += 1;\ncase \"NaNf0b\": if (v.aR > v.aREnd) { o.goto(\"NaNf0e\"); break; }",
			"for a=1 to 10 step 3": " /* for() */ o.vmAssertNumberType(\"a\"); v.a = 1; o.goto(\"NaNf0b\"); break;\ncase \"NaNf0\": v.a += 3;\ncase \"NaNf0b\": if (v.a > 10) { o.goto(\"NaNf0e\"); break; }",
			"for a=5+b to -4 step -2.3": " /* for() */ o.vmAssertNumberType(\"a\"); v.a = o.vmAssign(\"a\", 5 + v.b); v.aStep = o.vmAssign(\"a\", -2.3); o.goto(\"NaNf0b\"); break;\ncase \"NaNf0\": v.a += v.aStep;\ncase \"NaNf0b\": if (v.aStep > 0 && v.a > -4 || v.aStep < 0 && v.a < -4) { o.goto(\"NaNf0e\"); break; }",
			"for a=b to c step d": " /* for() */ o.vmAssertNumberType(\"a\"); v.a = o.vmAssign(\"a\", v.b); v.aEnd = o.vmAssign(\"a\", v.c); v.aStep = o.vmAssign(\"a\", v.d); o.goto(\"NaNf0b\"); break;\ncase \"NaNf0\": v.a += v.aStep;\ncase \"NaNf0b\": if (v.aStep > 0 && v.a > v.aEnd || v.aStep < 0 && v.a < v.aEnd) { o.goto(\"NaNf0e\"); break; }",
			"for a=b% to c%": " /* for() */ o.vmAssertNumberType(\"a\"); v.a = v.bI; v.aEnd = v.cI; o.goto(\"NaNf0b\"); break;\ncase \"NaNf0\": v.a += 1;\ncase \"NaNf0b\": if (v.a > v.aEnd) { o.goto(\"NaNf0e\"); break; }",
			"frame ": " o.frame(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"a=fre(0)": " v.a = o.vmAssign(\"a\", o.fre(0));",
			"a=fre(\"\")": " v.a = o.vmAssign(\"a\", o.fre(\"\"));",
			"a=fre(b-2)": " v.a = o.vmAssign(\"a\", o.fre(v.b - 2));",
			"a=fre(a$)": " v.a = o.vmAssign(\"a\", o.fre(v.a$));"
		},
		"gosub, goto, graphics paper, graphics pen": {
			"10 gosub 10": " o.gosub(\"10g0\", 10); break; \ncase \"10g0\":",
			"10 goto 10": " o.goto(10); break;",
			"graphics paper 5": " o.graphicsPaper(5);",
			"graphics paper 2.3*a": " o.graphicsPaper(2.3 * v.a);",
			"graphics pen 5": " o.graphicsPen(5);",
			"graphics pen 5,1": " o.graphicsPen(5, 1);",
			"graphics pen ,0": " o.graphicsPen(undefined, 0);",
			"graphics pen 2.3*a,1+b": " o.graphicsPen(2.3 * v.a, 1 + v.b);"
		},
		"hex$, himem": {
			"a$=hex$(16)": " v.a$ = o.hex$(16);",
			"a$=hex$(16,4)": " v.a$ = o.hex$(16, 4);",
			"a$=hex$(a,b)": " v.a$ = o.hex$(v.a, v.b);",
			"a=himem": " v.a = o.vmAssign(\"a\", o.himem());"
		},
		"if, ink, inkey, inkey$, inp, input, instr, int": {
			"10 if a=1 then goto 10": " if (v.a === 1 ? -1 : 0) { o.goto(\"10i0\"); break; } o.goto(\"10i0e\"); break;\ncase \"10i0\": o.goto(10); break;\ncase \"10i0e\": ;",
			"10 if a=1 then 10": " if (v.a === 1 ? -1 : 0) { o.goto(\"10i0\"); break; } o.goto(\"10i0e\"); break;\ncase \"10i0\": o.goto(10); break;\ncase \"10i0e\": ;",
			"10 if a=1 goto 10": " if (v.a === 1 ? -1 : 0) { o.goto(\"10i0\"); break; } o.goto(\"10i0e\"); break;\ncase \"10i0\": o.goto(10); break;\ncase \"10i0e\": ;",
			"10 if a=1 then a=a+1:goto 10": " if (v.a === 1 ? -1 : 0) { o.goto(\"10i0\"); break; } o.goto(\"10i0e\"); break;\ncase \"10i0\": v.a = o.vmAssign(\"a\", v.a + 1); o.goto(10); break;\ncase \"10i0e\": ;",
			"10 if a=1 then gosub 10": " if (v.a === 1 ? -1 : 0) { o.goto(\"10i0\"); break; } o.goto(\"10i0e\"); break;\ncase \"10i0\": o.gosub(\"10g0\", 10); break; \ncase \"10g0\":;\ncase \"10i0e\": ;",
			"10 if a=1 then 10:a=never1": " if (v.a === 1 ? -1 : 0) { o.goto(\"10i0\"); break; } o.goto(\"10i0e\"); break;\ncase \"10i0\": o.goto(10); break; v.a = o.vmAssign(\"a\", v.never1);\ncase \"10i0e\": ;",
			"10 if a=1 then 10 else 20\n20 rem": " if (v.a === 1 ? -1 : 0) { o.goto(\"10i0\"); break; } /* else */ o.goto(20); break; o.goto(\"10i0e\"); break;\ncase \"10i0\": o.goto(10); break;\ncase \"10i0e\": ;\n //",
			"10 if a=1 then 10 else goto 20\n20 rem": " if (v.a === 1 ? -1 : 0) { o.goto(\"10i0\"); break; } /* else */ o.goto(20); break; o.goto(\"10i0e\"); break;\ncase \"10i0\": o.goto(10); break;\ncase \"10i0e\": ;\n //",
			"10 if a=b+5*c then a=a+1: goto 10 else a=a-1:goto 20\n20 rem": " if (v.a === (v.b + (5 * v.c)) ? -1 : 0) { o.goto(\"10i0\"); break; } /* else */ v.a = o.vmAssign(\"a\", v.a - 1); o.goto(20); break; o.goto(\"10i0e\"); break;\ncase \"10i0\": v.a = o.vmAssign(\"a\", v.a + 1); o.goto(10); break;\ncase \"10i0e\": ;\n //",
			"10 if a%<>3 then 10": " if (v.aI !== 3 ? -1 : 0) { o.goto(\"10i0\"); break; } o.goto(\"10i0e\"); break;\ncase \"10i0\": o.goto(10); break;\ncase \"10i0e\": ;",
			"10 if a$<>\"3\" then 10": " if (v.a$ !== \"3\" ? -1 : 0) { o.goto(\"10i0\"); break; } o.goto(\"10i0e\"); break;\ncase \"10i0\": o.goto(10); break;\ncase \"10i0e\": ;",
			"ink 2,19": " o.ink(2, 19);",
			"ink 2,19,22": " o.ink(2, 19, 22);",
			"ink a*2,b-1,c": " o.ink(v.a * 2, v.b - 1, v.c);",
			"a=inkey(0)": " v.a = o.vmAssign(\"a\", o.inkey(0));",
			"a$=inkey$": " v.a$ = o.inkey$();",
			"a=inp(&ff77)": " v.a = o.vmAssign(\"a\", o.inp(0xff77));",
			"input a$": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.input(0, undefined, \"? \", \"a$\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput();",
			"input a$,b": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.input(0, undefined, \"? \", \"a$\", \"b\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput(); v.b = o.vmGetNextInput();",
			"input ;a$,b": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.input(0, \";\", \"? \", \"a$\", \"b\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput(); v.b = o.vmGetNextInput();",
			"input \"para\",a$,b": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.input(0, undefined, \"para\", \"a$\", \"b\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput(); v.b = o.vmGetNextInput();",
			"input \"para\";a$,b": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.input(0, undefined, \"para? \", \"a$\", \"b\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput(); v.b = o.vmGetNextInput();",
			"input ;\"para noCRLF\";a$,b": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.input(0, \";\", \"para noCRLF? \", \"a$\", \"b\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput(); v.b = o.vmGetNextInput();",
			"input#2,;\"para noCRLF\";a$,b": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.input(2, \";\", \"para noCRLF? \", \"a$\", \"b\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput(); v.b = o.vmGetNextInput();",
			"input#stream,;\"string\";a$,b": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.input(v.stream, \";\", \"string? \", \"a$\", \"b\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput(); v.b = o.vmGetNextInput();",
			"a=instr(\"key\",\"ey\")": " v.a = o.vmAssign(\"a\", o.instr(\"key\", \"ey\"));",
			"a=instr(s$,find$)": " v.a = o.vmAssign(\"a\", o.instr(v.s$, v.find$));",
			"a=instr(start,s$,find$)": " v.a = o.vmAssign(\"a\", o.instr(v.start, v.s$, v.find$));",
			"a=int(-2.3)": " v.a = o.vmAssign(\"a\", o.int(-2.3));",
			"a=int(b+2.3)": " v.a = o.vmAssign(\"a\", o.int(v.b + 2.3));"
		},
		joy: {
			"a=joy(0)": " v.a = o.vmAssign(\"a\", o.joy(0));",
			"a=joy(b+1)": " v.a = o.vmAssign(\"a\", o.joy(v.b + 1));"
		},
		"key, key def": {
			"key 11,\"border 13:paper 0\"": " o.key(11, \"border 13:paper 0\");",
			"key a,b$": " o.key(v.a, v.b$);",
			"key def 68,1": " o.keyDef(68, 1);",
			"key def 68,1,159": " o.keyDef(68, 1, 159);",
			"key def 68,1,159,160": " o.keyDef(68, 1, 159, 160);",
			"key def 68,1,159,160,161": " o.keyDef(68, 1, 159, 160, 161);",
			"key def num,fire,normal,shift,ctrl": " o.keyDef(v.num, v.fire, v.normal, v.shift, v.ctrl);"
		},
		"left$, len, let, line input, list, load, locate, log, log10, lower$": {
			"a$=left$(b$,n)": " v.a$ = o.left$(v.b$, v.n);",
			"a=len(a$)": " v.a = o.vmAssign(\"a\", o.len(v.a$));",
			"let a=a+1": " v.a = o.vmAssign(\"a\", v.a + 1);",
			"line input a$": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.lineInput(0, undefined, \"? \", \"a$\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput();",
			"line input ;a$": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.lineInput(0, \";\", \"? \", \"a$\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput();",
			"line input \"para\",a$": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.lineInput(0, undefined, \"para\", \"a$\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput();",
			"line input \"para\";a$": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.lineInput(0, undefined, \"para? \", \"a$\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput();",
			"line input ;\"para noCRLF\";a$": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.lineInput(0, \";\", \"para noCRLF? \", \"a$\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput();",
			"line input#2,;\"para noCRLF\";a$": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.lineInput(2, \";\", \"para noCRLF? \", \"a$\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput();",
			"line input#stream,;\"string\";a$": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.lineInput(v.stream, \";\", \"string? \", \"a$\"); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\":; v.a$ = o.vmGetNextInput();",
			"list ": " o.list(0); break;",
			"list 10": " o.list(0, 10); break;",
			"list 1-": " o.list(0, 1, 65535); break;",
			"list -1": " o.list(0, undefined, 1); break;",
			"list 1-2": " o.list(0, 1, 2); break;",
			"list #3": " o.list(3, undefined); break;",
			"list ,#3": " o.list(3, undefined); break;",
			"list 10,#3": " o.list(3, 10); break;",
			"list 1-,#3": " o.list(3, 1, 65535); break;",
			"list -1,#3": " o.list(3, undefined, 1); break;",
			"list 1-2,#3": " o.list(3, 1, 2); break;",
			"load \"file\"": " o.load(\"file\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"load \"file.scr\",&c000": " o.load(\"file.scr\", 0xc000); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"load f$,adr": " o.load(v.f$, v.adr); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"locate 10,20": " o.locate(0, 10, 20);",
			"locate#2,10,20": " o.locate(2, 10, 20);",
			"locate#stream,x,y": " o.locate(v.stream, v.x, v.y);",
			"a=log(10)": " v.a = o.vmAssign(\"a\", o.log(10));",
			"a=log10(10)": " v.a = o.vmAssign(\"a\", o.log10(10));",
			"a$=lower$(b$)": " v.a$ = o.lower$(v.b$);",
			"a$=lower$(\"String\")": " v.a$ = o.lower$(\"String\");"
		},
		"mask, max, memory, merge, mid$, min, mod, mode, move, mover": {
			"mask &x10101011": " o.mask(0b10101011);",
			"mask 2^(8-x),1": " o.mask(Math.pow(2, (8 - v.x)), 1);",
			"mask a,b": " o.mask(v.a, v.b);",
			"mask ,b": " o.mask(undefined, v.b);",
			"a=max(1)": " v.a = o.vmAssign(\"a\", o.max(1));",
			"a=max(1,5)": " v.a = o.vmAssign(\"a\", o.max(1, 5));",
			"a=max(b,c,d)": " v.a = o.vmAssign(\"a\", o.max(v.b, v.c, v.d));",
			"memory &3fff": " o.memory(0x3fff);",
			"memory adr": " o.memory(v.adr);",
			"merge \"file\"": " o.merge(\"file\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"merge f$": " o.merge(v.f$); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"a$=mid$(\"string\",3)": " v.a$ = o.mid$(\"string\", 3);",
			"a$=mid$(\"string\",3,2)": " v.a$ = o.mid$(\"string\", 3, 2);",
			"a$=mid$(b$,p)": " v.a$ = o.mid$(v.b$, v.p);",
			"a$=mid$(b$,p,lg)": " v.a$ = o.mid$(v.b$, v.p, v.lg);",
			"mid$(a$,2)=b$": " v.a$ = o.vmAssign(\"a$\", o.mid$Assign(v.a$, 2, undefined, v.b$));",
			"mid$(a$,2,2)=b$": " v.a$ = o.vmAssign(\"a$\", o.mid$Assign(v.a$, 2, 2, v.b$));",
			"mid$(a$,b%,c!)=\"string\"": " v.a$ = o.vmAssign(\"a$\", o.mid$Assign(v.a$, v.bI, v.cR, \"string\"));",
			"a=min(1)": " v.a = o.vmAssign(\"a\", o.min(1));",
			"a=min(1,5)": " v.a = o.vmAssign(\"a\", o.min(1, 5));",
			"a=min(b,c,d)": " v.a = o.vmAssign(\"a\", o.min(v.b, v.c, v.d));",
			"a=10 mod 3": " v.a = o.vmAssign(\"a\", 10 % 3);",
			"a=b mod -c": " v.a = o.vmAssign(\"a\", o.vmRound(v.b) % o.vmRound(-(v.c)));",
			"mode 0": " o.mode(0);",
			"mode n+1": " o.mode(v.n + 1);",
			"move 10,20": " o.move(10, 20);",
			"move -10,-20,7": " o.move(-10, -20, 7);",
			"move 10,20,7,3": " o.move(10, 20, 7, 3);",
			"move 10,20,,3": " o.move(10, 20, undefined, 3);",
			"move x,y,m,g1": " o.move(v.x, v.y, v.m, v.g1);",
			"mover 10,20": " o.mover(10, 20);",
			"mover -10,-20,7": " o.mover(-10, -20, 7);",
			"mover 10,20,7,3": " o.mover(10, 20, 7, 3);",
			"mover 10,20,,3": " o.mover(10, 20, undefined, 3);",
			"mover x,y,m,g1": " o.mover(v.x, v.y, v.m, v.g1);"
		},
		"new, next, not": {
			"new ": " o.new();",
			"for a=1 to 2: next ": " /* for() */ o.vmAssertNumberType(\"a\"); v.a = 1; o.goto(\"NaNf0b\"); break;\ncase \"NaNf0\": v.a += 1;\ncase \"NaNf0b\": if (v.a > 2) { o.goto(\"NaNf0e\"); break; } /* next(\"\") */ o.goto(\"NaNf0\"); break;\ncase \"NaNf0e\":",
			"for i=1 to 2: next i": " /* for() */ o.vmAssertNumberType(\"i\"); v.i = 1; o.goto(\"NaNf0b\"); break;\ncase \"NaNf0\": v.i += 1;\ncase \"NaNf0b\": if (v.i > 2) { o.goto(\"NaNf0e\"); break; } /* next(\"v.i\") */ o.goto(\"NaNf0\"); break;\ncase \"NaNf0e\":",
			"for j=1 to 2:for i=3 to 4: next i,j": " /* for() */ o.vmAssertNumberType(\"j\"); v.j = 1; o.goto(\"NaNf0b\"); break;\ncase \"NaNf0\": v.j += 1;\ncase \"NaNf0b\": if (v.j > 2) { o.goto(\"NaNf0e\"); break; } /* for() */ o.vmAssertNumberType(\"i\"); v.i = 3; o.goto(\"NaNf1b\"); break;\ncase \"NaNf1\": v.i += 1;\ncase \"NaNf1b\": if (v.i > 4) { o.goto(\"NaNf1e\"); break; } /* next(\"v.i\") */ o.goto(\"NaNf1\"); break;\ncase \"NaNf1e\":; /* next(\"v.j\") */ o.goto(\"NaNf0\"); break;\ncase \"NaNf0e\":",
			"a=not 2": " v.a = o.vmAssign(\"a\", ~(2));",
			"a=not -b": " v.a = o.vmAssign(\"a\", ~(o.vmRound(-(v.b))));"
		},
		"on break ..., on error goto, on gosub, on goto, on sq gosub, openin, openout, or, origin, out": {
			"on break cont": " o.onBreakCont();",
			"10 on break gosub 10": " o.onBreakGosub(10);",
			"on break stop": " o.onBreakStop();",
			"10 on error goto 10": " o.onErrorGoto(10);",
			"10 on 1 gosub 10": " o.onGosub(\"10g0\", 1, 10); break; \ncase \"10g0\":",
			"10 on x gosub 10,20\n20 rem": " o.onGosub(\"10g0\", v.x, 10, 20); break; \ncase \"10g0\":\n //",
			"10 on x+1 gosub 10,20,20\n20 rem": " o.onGosub(\"10g0\", v.x + 1, 10, 20, 20); break; \ncase \"10g0\":\n //",
			"10 on 1 goto 10": " o.onGoto(\"10s0\", 1, 10); break\ncase \"10s0\":",
			"10 on x goto 10,20\n20 rem": " o.onGoto(\"10s0\", v.x, 10, 20); break\ncase \"10s0\":\n //",
			"10 on x+1 goto 10,20,20\n20 rem": " o.onGoto(\"10s0\", v.x + 1, 10, 20, 20); break\ncase \"10s0\":\n //",
			"10 on sq(1) gosub 10": " o.onSqGosub(1, 10);",
			"10 on sq(channel) gosub 10": " o.onSqGosub(v.channel, 10);",
			"openin \"file\"": " o.openin(\"file\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"openin f$": " o.openin(v.f$); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"openout \"file\"": " o.openout(\"file\");",
			"openout f$": " o.openout(v.f$);",
			"a=1 or &1a0": " v.a = o.vmAssign(\"a\", 1 | 0x1a0);",
			"a=b or c": " v.a = o.vmAssign(\"a\", o.vmRound(v.b) | o.vmRound(v.c));",
			"origin 10,20": " o.origin(10, 20);",
			"origin 10,20,5,200,50,15": " o.origin(10, 20, 5, 200, 50, 15);",
			"origin x,y,left,right,top,bottom": " o.origin(v.x, v.y, v.left, v.right, v.top, v.bottom);",
			"out &bc12,&12": " o.out(0xbc12, 0x12);",
			"out adr,by": " o.out(v.adr, v.by);"
		},
		"paper, peek, pen, pi, plot, plotr, poke, pos, print": {
			"paper 2": " o.paper(0, 2);",
			"paper#stream,p": " o.paper(v.stream, v.p);",
			"a=peek(&c000)": " v.a = o.vmAssign(\"a\", o.peek(0xc000));",
			"a=peek(adr+5)": " v.a = o.vmAssign(\"a\", o.peek(v.adr + 5));",
			"pen 2": " o.pen(0, 2);",
			"pen 2,1": " o.pen(0, 2, 1);",
			"pen#3,2,1": " o.pen(3, 2, 1);",
			"pen#stream,p,trans": " o.pen(v.stream, v.p, v.trans);",
			"a=pi": " v.a = o.vmAssign(\"a\", o.pi());",
			"plot 10,20": " o.plot(10, 20);",
			"plot -10,-20,7": " o.plot(-10, -20, 7);",
			"plot 10,20,7,3": " o.plot(10, 20, 7, 3);",
			"plot 10,20,,3": " o.plot(10, 20, undefined, 3);",
			"plot x,y,m,g1": " o.plot(v.x, v.y, v.m, v.g1);",
			"plotr 10,20": " o.plotr(10, 20);",
			"plotr -10,-20,7": " o.plotr(-10, -20, 7);",
			"plotr 10,20,7,3": " o.plotr(10, 20, 7, 3);",
			"plotr 10,20,,3": " o.plotr(10, 20, undefined, 3);",
			"plotr x,y,m,g1": " o.plotr(v.x, v.y, v.m, v.g1);",
			"poke &c000,23": " o.poke(0xc000, 23);",
			"poke adr,by": " o.poke(v.adr, v.by);",
			"a=pos(#0)": " v.a = o.vmAssign(\"a\", o.pos(0));",
			"a=pos(#stream)": " v.a = o.vmAssign(\"a\", o.pos(v.stream));",
			"print ": " o.print(0, \"\\r\\n\");",
			"print \"string\"": " o.print(0, \"string\", \"\\r\\n\");",
			"print a$": " o.print(0, v.a$, \"\\r\\n\");",
			"print a$,b": " o.print(0, v.a$, {type: \"commaTab\", args: []}, v.b, \"\\r\\n\");",
			"print#2,a$,b": " o.print(2, v.a$, {type: \"commaTab\", args: []}, v.b, \"\\r\\n\");",
			"print using\"####\";ri;": " o.print(0, o.using(\"####\", v.ri));",
			"print using \"##.##\";-1.2": " o.print(0, o.using(\"##.##\", -1.2), \"\\r\\n\");",
			"print using\"### ########\";a,b": " o.print(0, o.using(\"### ########\", v.a, v.b), \"\\r\\n\");",
			"print using \"\\   \\\";\"n1\";\"n2\";\" xx3\";": " o.print(0, o.using(\"\\\\   \\\\\", \"n1\", \"n2\", \" xx3\"));",
			"print using \"!\";\"a1\";\"a2\";": " o.print(0, o.using(\"!\", \"a1\", \"a2\"));",
			"print using \"&\";\"a1\";\"a2\";": " o.print(0, o.using(\"&\", \"a1\", \"a2\"));",
			"print#9,tab(t);t$;i;\"h1\"": " o.print(9, {type: \"tab\", args: [v.t]}, v.t$, v.i, \"h1\", \"\\r\\n\");",
			"?": " o.print(0, \"\\r\\n\");",
			"?#2,ti-t0!;spc(5);": " o.print(2, v.ti - v.t0R, {type: \"spc\", args: [5]});"
		},
		"rad, randomize, read, release, rem, remain, renum, restore, resume, return, right$, rnd, round, run": {
			"rad ": " o.rad();",
			"randomize ": " o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":o.randomize(); o.goto(\"NaNs1\"); break;\ncase \"NaNs1\": o.randomize(o.vmGetNextInput());",
			"randomize 123.456": " o.randomize(123.456);",
			"read a$": " v.a$ = o.read(\"a$\");",
			"read b": " v.b = o.read(\"b\");",
			"read a$,b,c$": " v.a$ = o.read(\"a$\"); v.b = o.read(\"b\"); v.c$ = o.read(\"c$\");",
			"release 1": " o.release(1);",
			"release n+1": " o.release(v.n + 1);",
			"rem ": " //",
			"rem comment until EOL": " // comment until EOL",
			"'": " //",
			"'comment until EOL": " // comment until EOL",
			"a=1 'comment": " v.a = o.vmAssign(\"a\", 1); // comment",
			"a=remain(0)": " v.a = o.vmAssign(\"a\", o.remain(0));",
			"a=remain(ti)": " v.a = o.vmAssign(\"a\", o.remain(v.ti));",
			"renum ": " o.renum(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"renum 100": " o.renum(100); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"renum 100,50": " o.renum(100, 50); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"renum 100,50,2": " o.renum(100, 50, 2); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"restore ": " o.restore();",
			"10 restore 10": " o.restore(10);",
			"resume ": " o.resume(); break;",
			"10 resume 10": " o.resume(10); break;",
			"resume next": " o.resumeNext();",
			"return ": " o.return(); break;",
			"a$=right$(b$,n)": " v.a$ = o.right$(v.b$, v.n);",
			"a=rnd": " v.a = o.vmAssign(\"a\", o.rnd());",
			"a=rnd(0)": " v.a = o.vmAssign(\"a\", o.rnd(0));",
			"a=rnd(-1*b)": " v.a = o.vmAssign(\"a\", o.rnd(-1 * v.b));",
			"a=round(2.335)": " v.a = o.vmAssign(\"a\", o.round(2.335));",
			"a=round(2.335,2)": " v.a = o.vmAssign(\"a\", o.round(2.335, 2));",
			"run ": " o.run(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"10 run 10": " o.run(10); o.goto(\"10s0\"); break;\ncase \"10s0\":",
			"run \"file\"": " o.run(\"file\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"run f$": " o.run(v.f$); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":"
		},
		save: {
			"save \"file\"": " o.save(\"file\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"save \"file\",p": " o.save(\"file\", \"p\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"save \"file\",a": " o.save(\"file\", \"a\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"save \"file.scr\",b,&c000,&4000": " o.save(\"file.scr\", \"b\", 0xc000, 0x4000); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"save \"file.bin\",b,&8000,&100,&8010": " o.save(\"file.bin\", \"b\", 0x8000, 0x100, 0x8010); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"save f$,b,adr,lg,entry": " o.save(v.f$, \"b\", v.adr, v.lg, v.entry); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"a=sgn(5)": " v.a = o.vmAssign(\"a\", o.sgn(5));",
			"a=sgn(0)": " v.a = o.vmAssign(\"a\", o.sgn(0));",
			"a=sgn(-5)": " v.a = o.vmAssign(\"a\", o.sgn(-5));",
			"a=sin(2.3)": " v.a = o.vmAssign(\"a\", o.sin(2.3));",
			"sound 1,100": " o.sound(1, 100); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"sound 1,100,400": " o.sound(1, 100, 400); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"sound 1,100,400,15": " o.sound(1, 100, 400, 15); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"sound 1,100,400,15,1": " o.sound(1, 100, 400, 15, 1); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"sound 1,100,400,15,1,1": " o.sound(1, 100, 400, 15, 1, 1); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"sound 1,100,400,15,1,1,4": " o.sound(1, 100, 400, 15, 1, 1, 4); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"sound ch,period,duration,,,,noise": " o.sound(v.ch, v.period, v.duration, undefined, undefined, undefined, v.noise); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"sound ch,period,duration,vol,env1,ent1,noise": " o.sound(v.ch, v.period, v.duration, v.vol, v.env1, v.ent1, v.noise); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"a$=space$(9)": " v.a$ = o.space$(9);",
			"a$=space$(9+b)": " v.a$ = o.space$(9 + v.b);",
			"speed ink 10,5": " o.speedInk(10, 5);",
			"speed ink a,b": " o.speedInk(v.a, v.b);",
			"speed key 10,5": " o.speedKey(10, 5);",
			"speed key a,b": " o.speedKey(v.a, v.b);",
			"speed write 1": " o.speedWrite(1);",
			"speed write a-1": " o.speedWrite(v.a - 1);",
			"a=sq(1)": " v.a = o.vmAssign(\"a\", o.sq(1));",
			"a=sq(channel)": " v.a = o.vmAssign(\"a\", o.sq(v.channel));",
			"a=sqr(9)": " v.a = o.vmAssign(\"a\", o.sqr(9));",
			"stop ": " o.stop(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"a$=str$(123)": " v.a$ = o.str$(123);",
			"a$=str$(a+b)": " v.a$ = o.str$(v.a + v.b);",
			"a$=string$(40,\"*\")": " v.a$ = o.string$(40, \"*\");",
			"a$=string$(40,42)": " v.a$ = o.string$(40, 42);",
			"a$=string$(lg,char)": " v.a$ = o.string$(v.lg, v.char);",
			"symbol 255,1,2,3,4,5,6,7,&x10110011": " o.symbol(255, 1, 2, 3, 4, 5, 6, 7, 0b10110011);",
			"symbol 255,1": " o.symbol(255, 1);",
			"symbol after 255": " o.symbolAfter(255);"
		},
		"tag, tagoff, tan, test, testr, time, troff, tron": {
			"tag ": " o.tag(0);",
			"tag#2": " o.tag(2);",
			"tag#stream": " o.tag(v.stream);",
			"tagoff ": " o.tagoff(0);",
			"tagoff#2": " o.tagoff(2);",
			"tagoff#stream": " o.tagoff(v.stream);",
			"a=tan(45)": " v.a = o.vmAssign(\"a\", o.tan(45));",
			"a=test(10,20)": " v.a = o.vmAssign(\"a\", o.test(10, 20));",
			"a=test(x,y)": " v.a = o.vmAssign(\"a\", o.test(v.x, v.y));",
			"a=testr(10,-20)": " v.a = o.vmAssign(\"a\", o.testr(10, -20));",
			"a=testr(xm,ym)": " v.a = o.vmAssign(\"a\", o.testr(v.xm, v.ym));",
			"t!=time": " v.tR = o.time();",
			"troff ": " o.troff();",
			"tron ": " o.tron();"
		},
		"unt, upper$": {
			"a=unt(&ff66)": " v.a = o.vmAssign(\"a\", o.unt(0xff66));",
			"a$=upper$(\"String\")": " v.a$ = o.upper$(\"String\");",
			"a$=upper$(b$)": " v.a$ = o.upper$(v.b$);"
		},
		"val, vpos": {
			"a=val(\"-2.3\")": " v.a = o.vmAssign(\"a\", o.val(\"-2.3\"));",
			"a=val(b$)": " v.a = o.vmAssign(\"a\", o.val(v.b$));",
			"a=vpos(#0)": " v.a = o.vmAssign(\"a\", o.vpos(0));",
			"a=vpos(#stream)": " v.a = o.vmAssign(\"a\", o.vpos(v.stream));"
		},
		"wait, wend, while, width, window, window swap, write": {
			"wait &ff34,20": " o.wait(0xff34, 20);",
			"wait &ff34,20,25": " o.wait(0xff34, 20, 25);",
			"while a=10: wend ": " \ncase \"NaNw0\": if (!(v.a === 10 ? -1 : 0)) { o.goto(\"NaNw0e\"); break; } /* o.wend() */ o.goto(\"NaNw0\"); break;\ncase \"NaNw0e\":",
			"while a>0": " \ncase \"NaNw0\": if (!(v.a > 0 ? -1 : 0)) { o.goto(\"NaNw0e\"); break; }",
			"width 40": " o.width(40);",
			"window 10,30,5,20": " o.window(0, 10, 30, 5, 20);",
			"window#1,10,30,5,20": " o.window(1, 10, 30, 5, 20);",
			"window#stream,left,right,top,bottom": " o.window(v.stream, v.left, v.right, v.top, v.bottom);",
			"window swap 1": " o.windowSwap(1);",
			"window swap 1,0": " o.windowSwap(1, 0);",
			"write a$": " o.write(0, v.a$);",
			"write a$,b": " o.write(0, v.a$, v.b);",
			"write#9,a$,b": " o.write(9, v.a$, v.b);"
		},
		"xor, xpos": {
			"a=&x1001 xor &x0110": " v.a = o.vmAssign(\"a\", 0b1001 ^ 0b0110);",
			"a=b xor c": " v.a = o.vmAssign(\"a\", o.vmRound(v.b) ^ o.vmRound(v.c));",
			"a=xpos": " v.a = o.vmAssign(\"a\", o.xpos());"
		},
		ypos: {
			"a=ypos": " v.a = o.vmAssign(\"a\", o.ypos());"
		},
		zone: {
			"zone 13+n": " o.zone(13 + v.n);"
		},
		rsx: {
			"|a": " o.rsx.a(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|b": " o.rsx.b(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|basic": " o.rsx.basic(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|cpm": " o.rsx.cpm(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"a$=\"*.drw\":|dir,@a$": " v.a$ = \"*.drw\"; o.rsx.dir(o.addressOf(\"v.a$\")); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|disc": " o.rsx.disc(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|disc.in": " o.rsx.disc_in(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|disc.out": " o.rsx.disc_out(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|drive,0": " o.rsx.drive(0); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|era,\"file.bas\"": " o.rsx.era(\"file.bas\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|ren,\"file1.bas\",\"file2.bas\"": " o.rsx.ren(\"file1.bas\", \"file2.bas\"); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|tape": " o.rsx.tape(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|tape.in": " o.rsx.tape_in(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|tape.out": " o.rsx.tape_out(); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|user,1": " o.rsx.user(1); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|mode,3": " o.rsx.mode(3); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":",
			"|renum,1,2,3,4": " o.rsx.renum(1, 2, 3, 4); o.goto(\"NaNs0\"); break;\ncase \"NaNs0\":"
		}
	};


	function fnReplacer(sBin) {
		return "0x" + parseInt(sBin.substr(2), 2).toString(16).toLowerCase();
	}

	function runTestsFor(assert, oTests, aResults) {
		var bAllowDirect = true,
			oOptions = {
				bQuiet: true
			},
			oCodeGeneratorJs = new CodeGeneratorJs({
				lexer: new BasicLexer(oOptions),
				parser: new BasicParser(oOptions),
				tron: false,
				rsx: {
					rsxIsAvailable: function (sRsx) { // not needed to suppress warnings when using bQuiet
						return (/^a|b|basic|cpm|dir|disc|disc\.in|disc\.out|drive|era|ren|tape|tape\.in|tape\.out|user|mode|renum$/).test(sRsx);
					}
				},
				bNoCodeFrame: true
			}),
			sKey, oVariables, sExpected, oOutput, sResult;

		for (sKey in oTests) {
			if (oTests.hasOwnProperty(sKey)) {
				oVariables = new Variables();
				oOutput = oCodeGeneratorJs.generate(sKey, oVariables, bAllowDirect);
				sResult = oOutput.error ? String(oOutput.error) : oOutput.text;
				sExpected = oTests[sKey];

				if (!Utils.bSupportsBinaryLiterals) {
					sExpected = sExpected.replace(/(0b[01]+)/g, fnReplacer); // for old IE
				}
				if (aResults) {
					aResults.push('"' + sKey.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"') + '": "' + sResult.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"') + '"');
				}

				if (assert) {
					assert.strictEqual(sResult, sExpected, sKey);
				}
			}
		}
	}

	function generateTests(oAllTests) {
		var sCategory;

		for (sCategory in oAllTests) {
			if (oAllTests.hasOwnProperty(sCategory)) {
				(function (sCat) {
					QUnit.test(sCat, function (assert) {
						runTestsFor(assert, oAllTests[sCat]);
					});
				}(sCategory));
			}
		}
	}

	generateTests(mAllTests);

	// generate result list (not used during the test, just for debugging)

	function generateAllResults(oAllTests) {
		var sResult = "",
			sCategory, aResults, bContainsSpace, sMarker;

		for (sCategory in oAllTests) {
			if (oAllTests.hasOwnProperty(sCategory)) {
				aResults = [];
				bContainsSpace = sCategory.indexOf(" ") >= 0;
				sMarker = bContainsSpace ? '"' : "";

				sResult += sMarker + sCategory + sMarker + ": {\n";

				runTestsFor(undefined, oAllTests[sCategory], aResults);
				sResult += aResults.join(",\n");
				sResult += "\n},\n";
			}
		}
		Utils.console.log(sResult);
		return sResult;
	}

	if (bGenerateAllResults) {
		generateAllResults(mAllTests);
	}
});

// end
