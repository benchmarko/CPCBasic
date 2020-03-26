// BasicLexer.js - BASIC Lexer
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
// BASIC lexer for Locomotive BASIC 1.1 for Amstrad CPC 6128
//

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

// based on an idea of:
// https://www.codeproject.com/Articles/345888/How-to-write-a-simple-interpreter-in-JavaScript
//

function BasicLexer(options) {
	this.init(options);
}

BasicLexer.prototype = {
	init: function (options) {
		this.options = options || {};
		this.reset();
	},

	reset: function () {
	},

	lex: function (input) { // eslint-disable-line complexity
		var isComment = function (c) { // isApostrophe
				return (/[']/).test(c);
			},
			isOperator = function (c) {
				return (/[+\-*/^=()[\],;:?\\]/).test(c);
			},
			isComparison = function (c) {
				return (/[<>]/).test(c);
			},
			isComparison2 = function (c) {
				return (/[<>=]/).test(c);
			},
			isDigit = function (c) {
				return (/[0-9]/).test(c);
			},
			/*
			isDigitOrSpace = function (c) {
				return (/[0-9 ]/).test(c);
			},
			*/
			isDot = function (c) {
				return (/[.]/).test(c);
			},
			isSign = function (c) {
				return (/[+-]/).test(c);
			},
			isHexOrBin = function (c) { // bin: &X, hex: & or &H
				return (/[&]/).test(c);
			},
			isBin2 = function (c) {
				return (/[01]/).test(c);
			},
			isHex2 = function (c) {
				return (/[0-9A-Fa-f]/).test(c);
			},
			isWhiteSpace = function (c) {
				return (/[ \r]/).test(c);
			},
			isNewLine = function (c) {
				return (/[\n]/).test(c);
			},
			isQuotes = function (c) {
				return (/["]/).test(c);
			},
			isNotQuotes = function (c) {
				return c !== "" && !isQuotes(c) && !isNewLine(c); // quoted string must be in one line!
			},
			isIdentifierStart = function (c) {
				return c !== "" && (/[A-Za-z]/).test(c); // cannot use complete [A-Za-z]+[\w]*[$%!]?
			},
			isIdentifierMiddle = function (c) {
				return c !== "" && (/[A-Za-z0-9.]/).test(c);
			},
			isIdentifierEnd = function (c) {
				return c !== "" && (/[$%!]/).test(c);
			},
			isStream = function (c) {
				return (/[#]/).test(c);
			},
			isAddress = function (c) {
				return (/[@]/).test(c);
			},
			isRsx = function (c) {
				return (/[|]/).test(c);
			},
			isNotNewLine = function (c) {
				return c !== "" && c !== "\n";
			},
			isUnquotedData = function (c) {
				return c !== "" && (/[^:,\r\n]/).test(c);
			},
			aTokens = [],
			iIndex = 0,
			sToken, sChar, iStartPos, iNumber,

			advance = function () {
				iIndex += 1;
				return input.charAt(iIndex);
			},
			advanceWhile = function (fn) {
				var sToken2 = "";

				do {
					sToken2 += sChar;
					sChar = advance();
				} while (fn(sChar));
				return sToken2;
			},
			addToken = function (type, value, iPos, sOrig) { // optional original value
				var oNode = {
					type: type,
					value: value,
					pos: iPos
				};

				if (sOrig !== undefined) {
					if (sOrig !== String(value)) {
						oNode.orig = sOrig;
					}
				}
				aTokens.push(oNode);
			},
			/*
			fnParseNumber = function () {
				sToken = advanceWhile(isDigit); // TODO: isDigitOrSpace: numbers may contain spaces! (how to differentiate e5 and e.g. err?)
				if (sChar === ".") {
					sToken += advanceWhile(isDigit); // TODO: isDigitOrSpace
				}
				if (sChar === "e" || sChar === "E") { // TODO: how to check? [eE][+-]?\d+
					sToken += advanceWhile(isSign); // TODO: allow at most one sign!
					if (isDigit(sChar)) { // TODO: isDigitOrSpace
						sToken += advanceWhile(isDigit); // TODO: isDigitOrSpace
					}
				}
				sToken = sToken.trim(); // remove trailing spaces
				iNumber = parseFloat(sToken);
				if (!isFinite(sToken)) {
					throw new BasicLexer.ErrorObject("Number is too large or too small", iNumber, iStartPos); // for a 64-bit double
				}
				addToken("number", iNumber, iStartPos, sToken);
			},
			*/
			hexEscape = function (str) {
				return str.replace(/[\x00-\x1f]/g, function (sChar2) { // eslint-disable-line no-control-regex
					return "\\x" + ("00" + sChar2.charCodeAt().toString(16)).slice(-2);
				});
			},
			fnParseCompleteLineForRem = function () { // special handling for line comment
				if (sChar === " ") {
					sChar = advance();
				}
				if (isNotNewLine(sChar)) {
					sToken = advanceWhile(isNotNewLine);
					addToken("string", sToken, iStartPos + 1);
				}
			},
			fnParseCompleteLineForData = function () { // special handling because strings in data lines need not be quoted
				while (isNotNewLine(sChar)) {
					if (isWhiteSpace(sChar)) {
						advanceWhile(isWhiteSpace);
					}
					if (isQuotes(sChar)) {
						sChar = "";
						sToken = advanceWhile(isNotQuotes);
						if (!isQuotes(sChar)) {
							Utils.console.warn("Unterminated string", sToken, "at position", iStartPos + 1);
						}
						sToken = sToken.replace(/\\/g, "\\\\"); // escape backslashes
						sToken = hexEscape(sToken);
						addToken("string", sToken, iStartPos + 1);
						if (sChar === '"') { // not for newline
							sChar = advance();
						}
					} else if (sChar === ",") { // empty argument?
						sToken = "";
						addToken("string", sToken, iStartPos);
					} else {
						sToken = advanceWhile(isUnquotedData);
						sToken = sToken.replace(/\\/g, "\\\\"); // escape backslashes
						sToken = sToken.replace(/"/g, "\\\""); // escape "
						addToken("string", sToken, iStartPos);
					}

					if (isWhiteSpace(sChar)) {
						advanceWhile(isWhiteSpace);
					}

					if (sChar !== ",") {
						break;
					}
					addToken(sChar, sChar, iStartPos); // ","
					sChar = advance();
					if (isNewLine(sChar)) { // data ending with "," (empty argument) => append dummy token
						sToken = "";
						addToken("string", sToken, iStartPos);
					}
				}
			};

		while (iIndex < input.length) {
			iStartPos = iIndex;
			sChar = input.charAt(iIndex);
			if (isWhiteSpace(sChar)) {
				sChar = advance();
			} else if (isNewLine(sChar)) {
				addToken("(eol)", 0, iStartPos);
				sChar = advance();
			} else if (isComment(sChar)) {
				addToken(sChar, sChar, iStartPos);
				sChar = advance();
				if (isNotNewLine(sChar)) {
					sToken = advanceWhile(isNotNewLine);
					addToken("string", sToken, iStartPos);
				}
			} else if (isOperator(sChar)) {
				addToken(sChar, sChar, iStartPos);
				sChar = advance();
			} else if (isDigit(sChar)) {
				sToken = advanceWhile(isDigit); // TODO: isDigitOrSpace: numbers may contain spaces! (how to differentiate e5 and e.g. err?)
				if (sChar === ".") {
					sToken += advanceWhile(isDigit); // TODO: isDigitOrSpace
				}
				if (sChar === "e" || sChar === "E") { // TODO: how to check? [eE][+-]?\d+
					sToken += advanceWhile(isSign); // TODO: allow at most one sign!
					if (isDigit(sChar)) { // TODO: isDigitOrSpace
						sToken += advanceWhile(isDigit); // TODO: isDigitOrSpace
					}
				}
				sToken = sToken.trim(); // remove trailing spaces
				iNumber = parseFloat(sToken);
				if (!isFinite(sToken)) {
					throw new BasicLexer.ErrorObject("Number is too large or too small", iNumber, iStartPos); // for a 64-bit double
				}
				addToken("number", iNumber, iStartPos, sToken);
			} else if (isDot(sChar)) { // number starting with dot (similar code to normal number) // TODO: .( *\d+)+[eE] *[+-]? *\d[\d ]*
				sToken = sChar;
				sChar = advance();
				sToken += advanceWhile(isDigit);
				if (sChar === "e" || sChar === "E") {
					sToken += advanceWhile(isSign);
					if (isDigit(sChar)) {
						sToken += advanceWhile(isDigit);
					}
				}
				iNumber = parseFloat(sToken);
				if (!isFinite(iNumber)) {
					throw new BasicLexer.ErrorObject("Number is too large or too small", iNumber, iStartPos); // for a 64-bit double
				}
				addToken("number", iNumber, iStartPos, sToken);
			} else if (isHexOrBin(sChar)) {
				sToken = sChar;
				sChar = advance();
				if (sChar.toLowerCase() === "x") { // binary?
					sToken += advanceWhile(isBin2);
					addToken("binnumber", sToken, iStartPos);
				} else { // hex
					if (sChar.toLowerCase() === "h") { // optional h
						sChar = advance();
					}
					if (isHex2(sChar)) {
						sToken += advanceWhile(isHex2);
						addToken("hexnumber", sToken, iStartPos);
					} else {
						throw new BasicLexer.ErrorObject("Number expected", sToken, iStartPos);
					}
				}
			} else if (isQuotes(sChar)) {
				sChar = "";
				sToken = advanceWhile(isNotQuotes);
				if (!isQuotes(sChar)) {
					Utils.console.warn("Unterminated string", sToken, "at position", iStartPos + 1);
				}
				sToken = sToken.replace(/\\/g, "\\\\"); // escape backslashes
				sToken = hexEscape(sToken);
				addToken("string", sToken, iStartPos + 1);
				if (sChar === '"') { // not for newline
					sChar = advance();
				}
			} else if (isIdentifierStart(sChar)) {
				sToken = sChar;
				sChar = advance();
				if (isIdentifierMiddle(sChar)) {
					sToken += advanceWhile(isIdentifierMiddle);
				}
				if (isIdentifierEnd(sChar)) {
					sToken += sChar;
					sChar = advance();
				}
				addToken("identifier", sToken, iStartPos);
				sToken = sToken.toLowerCase();
				if (sToken === "rem") { // special handling for line comment
					fnParseCompleteLineForRem();
				} else if (sToken === "data") { // special handling because strings in data lines need not be quoted
					fnParseCompleteLineForData();
				}
			} else if (isAddress(sChar)) {
				addToken(sChar, sChar, iStartPos);
				sChar = advance();
			} else if (isRsx(sChar)) {
				sChar = advance();
				sToken = "";
				if (isIdentifierMiddle(sChar)) {
					sToken = advanceWhile(isIdentifierMiddle);
					addToken("|", sToken, iStartPos);
				}
			} else if (isStream(sChar)) { // stream can be an expression
				addToken(sChar, sChar, iStartPos);
				sChar = advance();
			} else if (isComparison(sChar)) {
				sToken = advanceWhile(isComparison2);
				addToken(sToken, sToken, iStartPos); // like operator
			} else {
				throw new BasicLexer.ErrorObject("Unrecognized token", sChar, iStartPos);
			}
		}
		addToken("(end)", 0, iIndex);
		return aTokens;
	}
};


BasicLexer.ErrorObject = function (message, value, pos) {
	this.message = message;
	this.value = value;
	this.pos = pos;
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = BasicLexer;
}
