// BasicTokenizer.js - Tokenize BASIC programs
// (c) Marco Vieth, 2020
// https://benchmarko.github.io/CPCBasic/
//

"use strict";

function BasicTokenizer(options) {
	this.init(options);
}

BasicTokenizer.prototype = {
	init: function (/* options */) {
	},

	reset: function () {
		this.sData = "";
		this.iPos = 0;
	},

	decode: function (sProgram) { // decode tokenized BASIC to ASCII
		// based on lbas2ascii.pl, 28.06.2006
		var that = this,

			fnNum8Dec = function () {
				var iNum = that.sInput.charCodeAt(that.iPos);

				that.iPos += 1;
				return iNum;
			},

			fnNum16Dec = function () {
				return fnNum8Dec() + fnNum8Dec() * 256;
			},

			fnNum16Hex = function () {
				return "&" + fnNum16Dec().toString(16).toUpperCase();
			},

			fnNum16Bin = function () {
				return "&X" + fnNum16Dec().toString(2);
			},

			fnNum32Dec = function () { // used for FLoating Point
				return fnNum16Dec() + fnNum16Dec() * 65536;
			},

			// floating point numbers (little endian byte order)
			// byte 0: mantissa (bits 7-0)
			// byte 1: mantissa (bits 15-8)
			// byte 2: mantissa (bits 23-16)
			// byte 3: sign, mantissa (bits 30-24)
			// byte 4: exponent
			//
			//
			// examples:
			// 0xa2,0xda,0x0f,0x49,0x82 (PI)
			// 0x00,0x00,0x00,0x00,0x81 (1)
			//
			// 0x00,0x00,0x00,0x00,0x84      ; 10 (10^1)
			// 0x00,0x00,0x00,0x48,0x87      ; 100 (10^2)
			// 0x00,0x00,0x00,0x7A,0x8A      ; 1000 (10^3)
			// 0x00,0x00,0x40,0x1c,0x8e      ; 10000 (10^4) (1E+4)
			// 0x00,0x00,0x50,0x43,0x91      ; 100000 (10^5) (1E+5)
			// 0x00,0x00,0x24,0x74,0x94      ; 1000000 (10^6) (1E+6)
			// 0x00,0x80,0x96,0x18,0x98      ; 10000000 (10^7) (1E+7)
			// 0x00,0x20,0xbc,0x3e,0x9b      ; 100000000 (10^8) (1E+8)
			// 0x00,0x28,0x6b,0x6e,0x9e      ; 1000000000 (10^9) (1E+9)
			// 0x00,0xf9,0x02,0x15,0xa2      ; 10000000000 (10^10) (1E+10)
			// 0x40,0xb7,0x43,0x3a,0xa5      ; 100000000000 (10^11) (1E+11)
			// 0x10,0xa5,0xd4,0x68,0xa8      ; 1000000000000 (10^12) (1E+12)
			// 0x2a,0xe7,0x84,0x11,0xac      ; 10000000000000 (10^13) (1E+13)

			// Check also: https://mfukar.github.io/2015/10/29/amstrad-fp.html
			// Example PI: b=[0xa2,0xda,0x0f,0x49,0x82]; e=b[4]-128; m=(b[3] >= 128 ? -1 : +1) * (0x80000000 + ((b[3] & 0x7f) <<24) + (b[2] << 16) + (b[1] <<8) + b[0]); z=m*Math.pow(2,e-32);console.log(m,e,z)

			fnNumFp = function () {
				var value = fnNum32Dec(), // signed integer
					exponent = fnNum8Dec(),
					mantissa, sOut;

				if (!exponent) { // exponent zero? => 0
					sOut = "0";
				} else { // beware: JavaScript has no unsigned int except for ">>> 0"
					mantissa = value >= 0 ? value + 0x80000000 : value;
					exponent -= 0x81; // 2-complement: 2^-127 .. 2^128
					sOut = mantissa * Math.pow(2, exponent - 31);

					sOut = sOut.toPrecision(9); // some rounding, formatting
					if (sOut.indexOf("e") >= 0) {
						sOut = sOut.replace(/\.?0*e/, "E"); // exponential uppercase, no zeros
						sOut = sOut.replace(/(E[+-])(\d)$/, "$10$2"); // exponent 1 digit to 2 digits
					} else {
						sOut = sOut.replace(/\.?0*$/, ""); // remove trailing 0
					}
				}
				return sOut;
			},

			fnGetBit7TerminatedString = function () {
				var sData = that.sInput,
					iPos = that.iPos,
					sOut;

				while (sData.charCodeAt(iPos) <= 0x7f) { // last character b7=1 (>= 0x80)
					iPos += 1;
				}
				sOut = sData.substring(that.iPos, iPos) + String.fromCharCode(sData.charCodeAt(iPos) & 0x7f); // eslint-disable-line no-bitwise
				that.iPos = iPos + 1;
				return sOut;
			},

			fnVar = function () {
				var sOut;

				fnNum16Dec(); // ignore offset
				sOut = fnGetBit7TerminatedString();
				return sOut;
			},

			fnRsx = function () {
				var sOut = "";

				fnNum8Dec(); // ignore length
				sOut = fnGetBit7TerminatedString();
				return "|" + sOut;
			},

			fnStringUntilEol = function () {
				var sOut = that.sInput.substring(that.iPos, that.iLineEnd); // take remaining line

				that.iPos = that.iLineEnd;
				return sOut;
			},

			fnQuotedString = function () {
				var sOut = "",
					iClosingQuotes;

				iClosingQuotes = that.sInput.indexOf('"', that.iPos);
				if (iClosingQuotes < 0 || iClosingQuotes >= that.iLineEnd) { // unclosed quoted string (quotes not found or not in this line)
					sOut = fnStringUntilEol(); // take remaining line
				} else {
					sOut = that.sInput.substring(that.iPos, iClosingQuotes + 1);
					that.iPos = iClosingQuotes + 1; // after quotes
				}
				return '"' + sOut;
			},

			mTokens = {
				0x00: "", // marker for "end of tokenised line"
				0x01: ":", // ":" statement seperator
				0x02: function () { // integer variable definition (defined with "%" suffix)
					return fnVar() + "%";
				},
				0x03: function () { // string variable definition (defined with "$" suffix)
					return fnVar() + "$";
				},
				0x04: function () { // floating point variable definition (defined with "!" suffix)
					return fnVar() + "!";
				},
				0x05: "var?",
				0x06: "var?",
				0x07: "var?", // ??
				0x08: "var?", // ??
				0x09: "var?", // ??
				0x0a: "var?", // ??
				0x0b: fnVar, // integer variable definition (no suffix)
				0x0c: fnVar, // string variable definition (no suffix)
				0x0d: fnVar, // floating point or no type (no suffix)
				0x0e: "0", // number constant "0"
				0x0f: "1", // number constant "1"
				0x10: "2", // number constant "2"
				0x11: "3", // number constant "3"
				0x12: "4", // number constant "4"
				0x13: "5", // number constant "5"
				0x14: "6", // number constant "6"
				0x15: "7", // number constant "7"
				0x16: "8", // number constant "8"
				0x17: "9", // number constant "9"
				0x18: "10", // number constant "10"
				0x19: fnNum8Dec, // 8-bit integer decimal value
				0x1a: fnNum16Dec, // 16-bit integer decimal value
				0x1b: fnNum16Bin, // 16-bit integer binary value (with "&X" prefix)
				0x1c: fnNum16Hex, // 16-bit integer hexadecimal value (with "&H" or "&" prefix)
				0x1d: fnNum16Dec, // 16-bit BASIC program line memory address pointer (should not occur)
				0x1e: fnNum16Dec, // 16-bit integer BASIC line number
				0x1f: fnNumFp, // floating point value
				// 0x20-0x21 ASCII printable symbols
				0x22: fnQuotedString, // '"' quoted string value
				// 0x23-0x7b ASCII printable symbols
				0x7c: fnRsx, // "|" symbol; prefix for RSX commands
				0x80: "AFTER",
				0x81: "AUTO",
				0x82: "BORDER",
				0x83: "CALL",
				0x84: "CAT",
				0x85: "CHAIN",
				0x86: "CLEAR",
				0x87: "CLG",
				0x88: "CLOSEIN",
				0x89: "CLOSEOUT",
				0x8a: "CLS",
				0x8b: "CONT",
				0x8c: "DATA",
				0x8d: "DEF",
				0x8e: "DEFINT",
				0x8f: "DEFREAL",
				0x90: "DEFSTR",
				0x91: "DEG",
				0x92: "DELETE",
				0x93: "DIM",
				0x94: "DRAW",
				0x95: "DRAWR",
				0x96: "EDIT",
				0x97: "ELSE",
				0x98: "END",
				0x99: "ENT",
				0x9a: "ENV",
				0x9b: "ERASE",
				0x9c: "ERROR",
				0x9d: "EVERY",
				0x9e: "FOR",
				0x9f: "GOSUB",
				0xa0: "GOTO",
				0xa1: "IF",
				0xa2: "INK",
				0xa3: "INPUT",
				0xa4: "KEY",
				0xa5: "LET",
				0xa6: "LINE",
				0xa7: "LIST",
				0xa8: "LOAD",
				0xa9: "LOCATE",
				0xaa: "MEMORY",
				0xab: "MERGE",
				0xac: "MID$",
				0xad: "MODE",
				0xae: "MOVE",
				0xaf: "MOVER",
				0xb0: "NEXT",
				0xb1: "NEW",
				0xb2: "ON",
				0xb3: "ON BREAK",
				0xb4: "ON ERROR GOTO 0", // (on error goto n > 0 is decoded with separate tokens)
				0xb5: "ON SQ",
				0xb6: "OPENIN",
				0xb7: "OPENOUT",
				0xb8: "ORIGIN",
				0xb9: "OUT",
				0xba: "PAPER",
				0xbb: "PEN",
				0xbc: "PLOT",
				0xbd: "PLOTR",
				0xbe: "POKE",
				0xbf: "PRINT",
				0xc0: function () { // "'" symbol (same function as REM keyword)
					return "'" + fnStringUntilEol();
				},
				0xc1: "RAD",
				0xc2: "RANDOMIZE",
				0xc3: "READ",
				0xc4: "RELEASE",
				0xc5: function () { // REM
					return "REM" + fnStringUntilEol();
				},
				0xc6: "RENUM",
				0xc7: "RESTORE",
				0xc8: "RESUME",
				0xc9: "RETURN",
				0xca: "RUN",
				0xcb: "SAVE",
				0xcc: "SOUND",
				0xcd: "SPEED",
				0xce: "STOP",
				0xcf: "SYMBOL",
				0xd0: "TAG",
				0xd1: "TAGOFF",
				0xd2: "TROFF",
				0xd3: "TRON",
				0xd4: "WAIT",
				0xd5: "WEND",
				0xd6: "WHILE",
				0xd7: "WIDTH",
				0xd8: "WINDOW",
				0xd9: "WRITE",
				0xda: "ZONE",
				0xdb: "DI",
				0xdc: "EI",
				0xdd: "FILL", // (v1.1)
				0xde: "GRAPHICS", // (v1.1)
				0xdf: "MASK", // (v1.1)
				0xe0: "FRAME", // (v1.1)
				0xe1: "CURSOR", // (v1.1)
				0xe2: "<unused>",
				0xe3: "ERL",
				0xe4: "FN",
				0xe5: "SPC",
				0xe6: "STEP",
				0xe7: "SWAP",
				0xe8: "<unused>",
				0xe9: "<unused>",
				0xea: "TAB",
				0xeb: "THEN",
				0xec: "TO",
				0xed: "USING",
				0xee: ">", // (greater than)
				0xef: "=", // (equal)
				0xf0: ">=", // (greater or equal)
				0xf1: "<", // (less than)
				0xf2: "<>", // (not equal)
				0xf3: "<=", // =<, <=, < = (less than or equal)
				0xf4: "+", // (addition)
				0xf5: "-", // (subtraction or unary minus)
				0xf6: "*", // (multiplication)
				0xf7: "/", // (division)
				0xf8: "^", // (x to the power of y)
				0xf9: "\\", // (integer division)
				0xfa: "AND",
				0xfb: "MOD",
				0xfc: "OR",
				0xfd: "XOR",
				0xfe: "NOT"
				// 0xff: (prefix for additional keywords)
			},

			mTokensFF = {
				// Functions with one argument
				0x00: "ABS",
				0x01: "ASC",
				0x02: "ATN",
				0x03: "CHR$",
				0x04: "CINT",
				0x05: "COS",
				0x06: "CREAL",
				0x07: "EXP",
				0x08: "FIX",
				0x09: "FRE",
				0x0a: "INKEY",
				0x0b: "INP",
				0x0c: "INT",
				0x0d: "JOY",
				0x0e: "LEN",
				0x0f: "LOG",
				0x10: "LOG10",
				0x11: "LOWER$",
				0x12: "PEEK",
				0x13: "REMAIN",
				0x14: "SGN",
				0x15: "SIN",
				0x16: "SPACE$",
				0x17: "SQ",
				0x18: "SQR",
				0x19: "STR$",
				0x1a: "TAN",
				0x1b: "UNT",
				0x1c: "UPPER$",
				0x1d: "VAL",

				// Functions without arguments
				0x40: "EOF",
				0x41: "ERR",
				0x42: "HIMEM",
				0x43: "INKEY$",
				0x44: "PI",
				0x45: "RND",
				0x46: "TIME",
				0x47: "XPOS",
				0x48: "YPOS",
				0x49: "DERR", // (v1.1)

				// Functions with more arguments
				0x71: "BIN$",
				0x72: "DEC$", // (v1.1)
				0x73: "HEX$",
				0x74: "INSTR",
				0x75: "LEFT$",
				0x76: "MAX",
				0x77: "MIN",
				0x78: "POS",
				0x79: "RIGHT$",
				0x7a: "ROUND",
				0x7b: "STRING$",
				0x7c: "TEST",
				0x7d: "TESTR",
				0x7e: "COPYCHR$", // (v1.1)
				0x7f: "VPOS"
			},

			fnParseNextLine = function () {
				var sInput = that.sInput,
					sOut = "",
					bSpace = false,
					iLineLength, iLineNum, iToken, iNextToken, bOldSpace, tstr;

				iLineLength = fnNum16Dec();
				if (!iLineLength) {
					return null; // nothing more
				}
				that.iLineEnd = that.iPos + iLineLength - 2;
				iLineNum = fnNum16Dec();

				while (that.iPos < that.iLineEnd) {
					bOldSpace = bSpace;
					iToken = fnNum8Dec();

					if (iToken === 0x01) { // statement seperator ":"?
						if (that.iPos < sInput.length) {
							iNextToken = sInput.charCodeAt(that.iPos); // test next token
							if (iNextToken === 0x97 || iNextToken === 0xc0) { // ELSE or rem '?
								iToken = iNextToken; // ignore ':'
								that.iPos += 1;
							}
						}
					}

					bSpace = ((iToken >= 0x02 && iToken <= 0x1f) || (iToken === 0x7c)); // constant 0..9; variable, or RSX?

					if (iToken === 0xff) { // extended token?
						iToken = fnNum8Dec(); // get it
						tstr = mTokensFF[iToken];
					} else {
						tstr = mTokens[iToken];
					}

					if (tstr !== undefined) {
						if (typeof tstr === "function") {
							tstr = tstr();
						}

						if ((/[a-zA-Z0-9.]$/).test(tstr)) { // last character char, number, dot?
							bSpace = true; // maybe need space next time...
						}

						if (bOldSpace) {
							if ((/^[a-zA-Z$%!]+$/).test(tstr) || (iToken >= 0x02 && iToken <= 0x1f)) {
								tstr = " " + tstr;
							}
						}
						sOut += tstr;
					} else { // normal ASCII
						sOut += String.fromCharCode(iToken);
					}
				}
				return iLineNum + " " + sOut;
			},


			fnParseProgram = function () {
				var sOut = "",
					sLine;

				that.iPos = 0;
				while ((sLine = fnParseNextLine()) !== null) {
					sOut += sLine + "\n";
				}
				return sOut;
			};

		this.sInput = sProgram;
		return fnParseProgram();
	}
};
