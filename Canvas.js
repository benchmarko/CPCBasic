// Canvas.js - ...
//
/* globals Utils */

"use strict";

function Canvas(options) {
	this.init(options);
}

Canvas.prototype = {

	// http://www.cpcwiki.eu/index.php/CPC_Palette
	aColors: [
		"#000000", //  0 Black
		"#000080", //  1 Blue
		"#0000FF", //  2 Bright Blue
		"#800000", //  3 Red
		"#800080", //  4 Magenta
		"#8000FF", //  5 Mauve
		"#FF0000", //  6 Bright Red
		"#FF0080", //  7 Purple
		"#FF00FF", //  8 Bright Magenta
		"#008000", //  9 Green
		"#008080", // 10 Cyan
		"#0080FF", // 11 Sky Blue
		"#808000", // 12 Yellow
		"#808080", // 13 White
		"#8080FF", // 14 Pastel Blue
		"#FF8000", // 15 Orange
		"#FF8080", // 16 Pink
		"#FF80FF", // 17 Pastel Magenta
		"#00FF00", // 18 Bright Green
		"#00FF80", // 19 Sea Green
		"#00FFFF", // 20 Bright Cyan
		"#80FF00", // 21 Lime
		"#80FF80", // 22 Pastel Green
		"#80FFFF", // 23 Pastel Cyan
		"#FFFF00", // 24 Bright Yellow
		"#FFFF80", // 25 Pastel Yellow
		"#FFFFFF" //  26 Bright White
	],

	// mode 0: pen 0-15
	// TODO: inks for pen 15,15 are alternating: "1,24", "16,11"
	aDefaultInks: [1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 1, 16], // eslint-disable-line array-element-newline

	aModeData: [
		{
			iInks: 16,
			iLineWidth: 4,
			iCharWidth: 8 * 4,
			iCharHeight: 16
		},
		{
			iInks: 4,
			iLineWidth: 2,
			iCharWidth: 8 * 2,
			iCharHeight: 16
		},
		{
			iInks: 2,
			iLineWidth: 1,
			iCharWidth: 8,
			iCharHeight: 16
		},
		{
			iInks: 16, // mode 3 not available on CPC
			iLineWidth: 1,
			iCharWidth: 8,
			iCharHeight: 16
		}
	],


	mCpcKey2Key: {
		0: "38ArrowUp", // cursor up
		1: "39ArrowRight", // cursor right
		2: "40ArrowDown", // cursor down
		3: "105Numpad9", // numpad f9
		4: "102Numpad6,117F6", // numpad f6
		5: "99Numpad3,114F3", // numpad f3
		6: "13NumpadEnter", // numpad enter
		7: "110NumpadDecimal", // numpad .
		8: "37ArrowLeft", // cursor left
		9: "18AltLeft", // copy
		10: "103Numpad7,118F7", // numpad f7
		11: "104Numpad8,119F8", // numpad f8
		12: "101Numpad5,116F5", // numpad f5
		13: "97Numpad1,112F1", // numpad f1
		14: "98Numpad2,113F2", // numpad f2
		15: "96Numpad0,121F10", // numpad f0
		16: "46Delete", // clr
		17: "187BracketRight", // [ {
		18: "13Enter", // return
		19: "191Backslash", // ] }
		20: "100Numpad4,115F4", // numpad f4
		21: "16ShiftLeft,16ShiftRight", // shift left, shift right (2 keys!)
		22: "220Backquote", // \ ` (different location, key!)
		23: "17ControlLeft,17ControlRight", // Note: alt-gr also triggers ctrl-left and alt-gr!
		24: "221Equal", // ^ pound
		25: "219Minus", // - =
		26: "186BracketLeft", // @ |
		27: "80KeyP", // P
		28: "222Quote", // ; +
		29: "192Semicolon", // : *
		30: "189Slash", // / ?
		31: "190Period", // . <
		32: "48Digit0", // 0 _
		33: "57Digit9", // 9 )
		34: "79KeyO",
		35: "73KeyI",
		36: "76KeyL",
		37: "75KeyK",
		38: "77KeyM",
		39: "188Comma", // , >
		40: "56Digit8",
		41: "55Digit7",
		42: "85KeyU",
		43: "90KeyY",
		44: "72KeyH",
		45: "74KeyJ",
		46: "78KeyN",
		47: "32Space", // space
		48: "54Digit6",
		49: "53Digit5",
		50: "82KeyR",
		51: "84KeyT",
		52: "71KeyG",
		53: "70KeyF",
		54: "66KeyB",
		55: "86KeyV",
		56: "52Digit4",
		57: "51Digit3",
		58: "69KeyE",
		59: "87KeyW",
		60: "83KeyS",
		61: "68KeyD",
		62: "67KeyC",
		63: "88KeyX",
		64: "49Digit1",
		65: "50Digit2",
		66: "27Escape", // esc
		67: "81KeyQ",
		68: "9Tab",
		69: "65KeyA",
		70: "20CapsLock", // caps lock
		71: "89KeyZ",
		72: "38Numpad8", // joy 0 up (arrow up)
		73: "40Numpad2", // joy 0 down
		74: "37Numpad4", // joy 0 left
		75: "39Numpad6", // joy 0 right
		76: "12Numpad5,45Numpad0", // joy 0 fire 2 (clear,...)
		77: "46NumpadDecimal", // joy 0 fire 1
		// 78: ""? (joy 0 fire 3?)
		79: "8Backspace", // del

		// not on CPC:
		90: "36Numpad7", // joy 0 up+left
		91: "33Numpad9", // joy 0 up+right
		92: "35Numpad1", // joy 0 down+left
		93: "34Numpad3" // joy 0 down+right

		// only on PC:
		// "226IntlBackslash", "122F11", "123F12", "44PrintScreen", "145ScrollLock", "19Pause", "45Insert", "36Home", "33PageUp", "35End", "34PageDown", "111NumpadDivide", "106NumpadMultiply", "109NumpadSubtract", "107NumpadAdd"
	},

	bCpcKey2KeyModified: false,

	aJoyKeyCodes: [
		[72, 73, 74, 75, 76, 77], // eslint-disable-line array-element-newline
		[48, 49, 50, 51, 52, 53] // eslint-disable-line array-element-newline
	],

	init: function (options) {
		var iBorderWidth = 4,
			iWidth, iHeight, canvas;

		this.options = Object.assign({}, options);

		this.cpcAreaBox = document.getElementById("cpcAreaBox");

		this.aCharset = this.options.aCharset;

		this.oPressedKeys = {};
		this.aKeyBuffer = [];

		this.aPath = [];
		this.iPath = 0;

		this.oChars = {}; // cache for pixeldata chars (invalidated when paper or pen changes, or symbol redefined)

		this.iMask = 0;
		this.bClipped = false;

		canvas = document.getElementById("cpcCanvas");
		this.canvas = canvas;

		// make sure canvas is not hidden (allows to get width, height, set style)
		iWidth = canvas.width;
		iHeight = canvas.height;
		this.iWidth = iWidth;
		this.iHeight = iHeight;
		canvas.style.borderWidth = iBorderWidth + "px";
		canvas.style.borderStyle = "solid";

		this.aColorValues = this.extractAllColorValues(this.aColors);

		this.reset();

		if (this.options.onload) {
			this.options.onload(this);
		}
		canvas.addEventListener("click", this.onCpcCanvasClick.bind(this), false);
		window.addEventListener("keydown", this.onWindowKeydown.bind(this), false);
		window.addEventListener("keyup", this.onWindowKeyup.bind(this), false);
		window.addEventListener("click", this.onWindowClick.bind(this), false);
	},

	reset: function () {
		this.iMode = 1;
		this.aCurrentInks = this.aDefaultInks.slice();
		this.iGPen = null; // force update
		this.iGPaper = null;
		this.iPen = null;
		this.iPaper = null;
		this.oCustomCharset = {}; // symbol
		this.setGPen(1);
		this.setGPaper(0);
		this.setPen(1);
		this.setPaper(0);
		this.setBorder(this.aDefaultInks[this.iPaper]);
		this.setMode(1);
		this.clearInput();
		this.oPressedKeys = {};
	},

	extractColorValues: function (sColor) { // from "#rrggbb"
		return [
			parseInt(sColor.substring(1, 3), 16),
			parseInt(sColor.substring(3, 5), 16),
			parseInt(sColor.substring(5, 7), 16)
		];
	},

	extractAllColorValues: function (aColors) {
		var aColorValues = [],
			i;

		for (i = 0; i < aColors.length; i += 1) {
			aColorValues[i] = this.extractColorValues(aColors[i]);
		}

		return aColorValues;
	},

	create1CharData: function (aCharData) {
		var ctx = this.canvas.getContext("2d"),
			iWidth = this.aModeData[this.iMode].iCharWidth,
			iHeight = this.aModeData[this.iMode].iCharHeight,
			iScaleX = iWidth / 8,
			iScaleY = iHeight / 8, // we assume alwas 2 here
			aFgColor, aBgColor,	aColor,	iCharData, oImageData, aPixel, row, col, i;

		aFgColor = this.aColorValues[this.aCurrentInks[this.iPen]];
		aBgColor = this.aColorValues[this.aCurrentInks[this.iPaper]];

		oImageData = ctx.createImageData(iWidth, iHeight);
		aPixel = oImageData.data;
		for (row = 0; row < iHeight; row += iScaleY) {
			iCharData = aCharData[row / iScaleY];
			for (col = 0; col < iWidth; col += 1) {
				aColor = (iCharData & (0x80 >> (col / iScaleX))) ? aFgColor : aBgColor; // eslint-disable-line no-bitwise
				i = (col * 4) + (row * iWidth * 4);
				aPixel[i] = aColor[0]; // r
				aPixel[i + 1] = aColor[1]; // g
				aPixel[i + 2] = aColor[2]; // b
				aPixel[i + 3] = 255; // a

				i += iWidth * 4; // duplicate to next row
				aPixel[i] = aColor[0]; // r
				aPixel[i + 1] = aColor[1]; // g
				aPixel[i + 2] = aColor[2]; // b
				aPixel[i + 3] = 255; // a
			}
		}
		return oImageData;
	},

	setCustomChar: function (iChar, aCharData) {
		if (this.oCustomCharset[iChar]) { // already set?
			delete this.oChars[iChar]; // delete pixeldata for this char
		}
		this.oCustomCharset[iChar] = aCharData;
	},

	setDefaultInks: function () {
		this.aCurrentInks = this.aDefaultInks.slice();
		this.setGPen(this.iGPen); // set stroke color
	},

	onCpcCanvasClick: function (event) {
		var oTarget = event.target,
			canvas = oTarget;

		this.cpcAreaBox.style.background = "#463c3c";
		canvas.focus();
		this.bHasFocus = true;
		event.stopPropagation();
	},

	onWindowClick: function (/* event */) {
		if (this.bHasFocus) {
			this.bHasFocus = false;
			this.cpcAreaBox.style.background = "";
		}
	},

	removeCodeFromKeymap: function (sPressedKey) {
		var oCpcKey2Key = this.mCpcKey2Key,
			iCpcKey, sMappedKeys, aMappedKeys, i, sKey, iKey;

		if (Utils.debug > 1) {
			Utils.console.log("removeCodeFromKeymap: Unfortunately not all keys can be used. Pressed:" + sPressedKey);
		}
		for (iCpcKey in oCpcKey2Key) {
			if (oCpcKey2Key.hasOwnProperty(iCpcKey)) {
				sMappedKeys = this.mCpcKey2Key[iCpcKey];
				aMappedKeys = sMappedKeys.split(","); // maybe more
				for (i = 0; i < aMappedKeys.length; i += 1) {
					sKey = aMappedKeys[i];
					iKey = parseInt(sKey, 10); // get just the number
					aMappedKeys[i] = iKey;
				}
				sMappedKeys = aMappedKeys.join(",");
				this.mCpcKey2Key[iCpcKey] = sMappedKeys;
			}
		}
	},

	fnCanvasKeydown: function (event) {
		var mSpecialKeys = {
				Alt: String.fromCharCode(224), // Copy
				ArrowUp: String.fromCharCode(240),
				ArrowDown: String.fromCharCode(241),
				ArrowLeft: String.fromCharCode(242),
				ArrowRight: String.fromCharCode(243),
				Backspace: "\x08", //TTT or 127?
				Delete: String.fromCharCode(16),
				Enter: "\r",
				Spacebar: " ", // for IE
				Tab: String.fromCharCode(9)
			},
			iKeyCode = event.which || event.keyCode,
			sPressedKey = iKeyCode,
			sKey = event.key;

		if (event.code) { // available for e.g. Chrome, Firefox
			sPressedKey += event.code;
		} else if (!this.bCpcKey2KeyModified) { // event.code not available on e.g. Edge
			this.removeCodeFromKeymap(sPressedKey); // Remove code information from the mapping. Not all keys can be detected then.
			this.bCpcKey2KeyModified = true;
		}
		this.oPressedKeys[sPressedKey] = 0 + (event.shiftKey ? 32 : 0) + (event.ctrlKey ? 128 : 0);
		if (Utils.debug > 1) {
			Utils.console.log("fnCanvasKeydown: keyCode=" + iKeyCode + " pressedKey=" + sPressedKey + " key='" + sKey + "' " + sKey.charCodeAt(0) + " ", event);
		}

		if (sKey in mSpecialKeys) {
			sKey = mSpecialKeys[sKey];
		}
		if (sKey.length === 1) { // ignore special keys with more than 1 character
			this.aKeyBuffer.push(sKey);
		}

		if (this.options.fnOnKeyDown) { // special handler?
			this.options.fnOnKeyDown(this.aKeyBuffer);
		}
	},

	fnCanvasKeyup: function (event) {
		var iKeyCode = event.which || event.keyCode,
			sPressedKey = iKeyCode;

		if (event.code) { // available for e.g. Chrome, Firefox
			sPressedKey += event.code;
		}

		if (Utils.debug > 1) {
			Utils.console.log("fnCanvasKeyup: keyCode=" + iKeyCode + " pressedKey=" + sPressedKey + " key='" + event.key + "' " + event.key.charCodeAt(0) + " ", event);
		}
		delete this.oPressedKeys[sPressedKey];
	},

	getKeyFromBuffer: function () {
		var sKeyCode;

		if (this.aKeyBuffer.length) {
			sKeyCode = this.aKeyBuffer.shift();
		} else {
			sKeyCode = ""; // -1;
		}
		return sKeyCode;
	},

	getKeyState: function (iCpcKey) {
		var iState = -1,
			sMappedKeys, aMappedKeys, i, sKey;

		if (iCpcKey in this.mCpcKey2Key) {
			sMappedKeys = this.mCpcKey2Key[iCpcKey];
			aMappedKeys = sMappedKeys.split(","); // maybe more
			for (i = 0; i < aMappedKeys.length; i += 1) {
				sKey = aMappedKeys[i];
				if (sKey in this.oPressedKeys) {
					iState = this.oPressedKeys[sKey];
					break; // one pressed key found
				}
			}
		}
		return iState;
	},

	getJoyState: function (iJoy) {
		var iValue = 0,
			aJoy, i;

		aJoy = this.aJoyKeyCodes[iJoy];
		for (i = 0; i < aJoy.length; i += 1) {
			if (this.getKeyState(aJoy[i]) !== -1) {
				iValue |= (1 << i); // eslint-disable-line no-bitwise
			}
		}

		// check additional special codes for joy 0 (not available on CPC)
		if (iJoy === 0) {
			if (this.getKeyState(90) !== -1) { // up left
				iValue |= 1 + 4; // eslint-disable-line no-bitwise
			}
			if (this.getKeyState(91) !== -1) { // up right
				iValue |= 1 + 8; // eslint-disable-line no-bitwise
			}
			if (this.getKeyState(92) !== -1) { // down left
				iValue |= 2 + 4; // eslint-disable-line no-bitwise
			}
			if (this.getKeyState(93) !== -1) { // down right
				iValue |= 2 + 8; // eslint-disable-line no-bitwise
			}
		}

		return iValue;
	},

	clearInput: function () {
		this.aKeyBuffer.length = 0;
	},

	onWindowKeydown: function (event) {
		if (this.bHasFocus) {
			this.fnCanvasKeydown(event);
			event.preventDefault();
			return false;
		}
		return undefined;
	},

	onWindowKeyup: function (event) {
		if (this.bHasFocus) {
			this.fnCanvasKeyup(event);
			event.preventDefault();
			return false;
		}
		return undefined;
	},

	getXpos: function () {
		return this.xPos;
	},

	getYpos: function () {
		return this.yPos;
	},

	privDrawPath: function (path, iStart) {
		var ctx, i, oPos,
			canvas = this.canvas,
			iHeight = this.iHeight;

		if (path.length) {
			ctx = canvas.getContext("2d");

			ctx.beginPath();
			for (i = iStart; i < path.length; i += 1) {
				oPos = path[i];
				if (oPos.r) { // convert relative to absolute
					oPos.x += this.xPos;
					oPos.y += this.yPos;
					oPos.r = false;
				}

				if (oPos.t === "f") {
					ctx.fillStyle = oPos.c;
					ctx.fill();
				} else {
					ctx.moveTo(this.xPos + this.xOrig + 0.5, iHeight - (this.yPos + this.yOrig + 0.5)); // current position
					this.xPos = oPos.x;
					this.yPos = oPos.y;
					if (oPos.t === "m" || oPos.t === "t") {
						ctx.moveTo(this.xPos + this.xOrig + 0.5, iHeight - (this.yPos + this.yOrig + 0.5)); // we use +0.5 to get full opacity and better colors
					} else if (oPos.t === "l") {
						ctx.lineTo(this.xPos + this.xOrig + 0.5, iHeight - (this.yPos + this.yOrig + 0.5));
					} else { // "p"?
						ctx.moveTo(this.xPos - 1 + this.xOrig + 0.5, iHeight - (this.yPos + this.yOrig - 1 + 0.5));
						ctx.lineTo(this.xPos + this.xOrig + 0.5, iHeight - (this.yPos + this.yOrig + 0.5));
					}
				}
			}
			ctx.stroke();
		}
	},

	testPixel: function (xPos, yPos) {
		var ctx = this.canvas.getContext("2d"),
			imageData, pixelData, iRed, iGreen, iBlue, iColor;

		imageData = ctx.getImageData(xPos + this.xOrig + 0.5, this.iHeight - (yPos + this.yOrig + 0.5), 1, 1);
		pixelData = imageData.data;
		iRed = pixelData[0];
		iGreen = pixelData[1];
		iBlue = pixelData[2];
		iColor = iRed * 65536 + iGreen * 256 + iBlue;
		return iColor;
	},

	clearPath: function () {
		this.aPath.length = 0;
		this.iPath = 0;
	},

	addPath: function (path) {
		var iGPen = 0,
			iColor, sColor, iInk;

		this.aPath.push(path);

		this.privDrawPath(this.aPath, this.iPath); // draw new element
		this.iPath = this.aPath.length;
		if (path.t === "t") {
			iColor = this.testPixel(this.xPos, this.yPos);
			sColor = "#" + Number(iColor).toString(16).padStart(6, "0").toUpperCase();
			iInk = this.aColors.indexOf(sColor);
			if (iInk >= 0) {
				iGPen = this.aCurrentInks.indexOf(iInk);
			}
		}
		return iGPen;
	},

	setInk: function (iPen, iInk1 /* , iInk2 */) {
		this.aCurrentInks[iPen] = iInk1;
		if (iPen === this.iGPen) {
			this.setGPen(iPen); // set stroke color
		}
		if (iPen === this.iPaper) {
			this.canvas.style.backgroundColor = this.aColors[this.aCurrentInks[this.iPaper]];
		}
	},

	setBorder: function (iInk1 /* , iInk2 */) {
		this.iBorderColor = iInk1;
		this.canvas.style.borderColor = this.aColors[iInk1];
	},

	setGPen: function (iGPen) {
		var ctx = this.canvas.getContext("2d");

		iGPen %= this.aModeData[this.iMode].iInks; // limit pens
		this.iGPen = iGPen;
		ctx.strokeStyle = this.aColors[this.aCurrentInks[iGPen]];
	},

	setGPaper: function (iGPaper) {
		this.iGPaper = iGPaper;
		// TODO
	},

	setPen: function (iPen) {
		iPen %= this.aModeData[this.iMode].iInks; // limit pens
		if (iPen !== this.iPen) {
			this.iPen = iPen;
			this.oChars = {}; //TTT invalidate chars (TODO but it depends on colors!)
		}
	},

	setPaper: function (iPaper) {
		iPaper %= this.aModeData[this.iMode].iInks; // limit papers
		if (iPaper !== this.iPaper) {
			this.iPaper = iPaper;
			this.oChars = {}; //TTT invalidate chars (TODO but it depends on colors!)
		}
	},

	printGChar: function (iChar) {
		var ctx = this.canvas.getContext("2d"),
			x = this.xPos + this.xOrig,
			y = this.iHeight - (this.yPos + this.yOrig);

		if (!this.oChars[iChar]) { // pixeldata not available?
			this.oChars[iChar] = this.create1CharData(this.oCustomCharset[iChar] || this.aCharset[iChar]);
		}
		ctx.putImageData(this.oChars[iChar], x, y);
		this.xPos += this.aModeData[this.iMode].iCharWidth;
	},

	printChar: function (iChar, x, y) {
		var ctx = this.canvas.getContext("2d");

		if (iChar >= this.aCharset.length) {
			Utils.console.warn("printChar: Ignoring char with code " + iChar);
			return;
		}

		if (!this.oChars[iChar]) { // pixeldata not available?
			this.oChars[iChar] = this.create1CharData(this.oCustomCharset[iChar] || this.aCharset[iChar]);
		}
		ctx.putImageData(this.oChars[iChar], x * this.aModeData[this.iMode].iCharWidth, y * this.aModeData[this.iMode].iCharHeight);
	},

	setOrigin: function (xOrig, yOrig) {
		this.xOrig = xOrig;
		this.yOrig = yOrig;
		this.xPos = 0;
		this.yPos = 0;
	},

	removeClipping: function () {
		//var ctx = this.canvas.getContext("2d");

		if (this.bClipped) {
			/* TODO
			ctx.restore();
			*/
			this.bClipped = false;
		}
	},

	setClipping: function (x, y, iWidth, iHeight) {
		var ctx = this.canvas.getContext("2d");

		this.removeClipping();
		this.bClipped = true;
		/* TODO
		ctx.save();
		ctx.rect(x, y, iWidth, iHeight);
		ctx.stroke();
		ctx.clip();
		*/
	},

	setMask: function (iMask) {
		var ctx = this.canvas.getContext("2d"),
			sMask;

		if (iMask !== this.iMask) {
			this.iMask = iMask;
			if (iMask === 1) {
				sMask = "xor"; // does this work?
			} else {
				sMask = "source-over"; // default
			}
			ctx.globalCompositeOperation = sMask;
		}
	},

	clearWindow: function (iLeft, iRight, iTop, iBottom) { // clear current window
		var ctx = this.canvas.getContext("2d"),
			iCharWidth = this.aModeData[this.iMode].iCharWidth,
			iCharHeight = this.aModeData[this.iMode].iCharHeight,
			iWidth = iRight + 1 - iLeft,
			iHeight = iBottom + 1 - iTop;

		this.canvas.style.backgroundColor = this.aColors[this.aCurrentInks[this.iPaper]];
		ctx.clearRect(iLeft * iCharWidth, iTop * iCharHeight, iWidth * iCharWidth, iHeight * iCharHeight);
	},

	clearGraphics: function (iPen) {
		var ctx = this.canvas.getContext("2d");

		ctx.fillStyle = this.aColors[this.aCurrentInks[iPen]];
		ctx.fillRect(0, 0, this.iWidth, this.iHeight);

		this.xPos = 0;
		this.yPos = 0;
	},

	windowScroolDown: function (iLeft, iRight, iTop, iBottom) { // clear current window
		var ctx = this.canvas.getContext("2d"),
			iCharWidth = this.aModeData[this.iMode].iCharWidth,
			iCharHeight = this.aModeData[this.iMode].iCharHeight,
			iWidth = iRight + 1 - iLeft,
			iHeight = iBottom + 1 - iTop,
			imageData;

		if (iHeight > 1) { // scroll part
			imageData = ctx.getImageData(iLeft * iCharWidth, (iTop + 1) * iCharHeight, iWidth * iCharWidth, (iHeight - 1) * iCharHeight);
			ctx.putImageData(imageData, iLeft * iCharWidth, iTop * iCharHeight);
		}
		ctx.clearRect(iLeft * iCharWidth, (iBottom - 0) * iCharHeight, iWidth * iCharWidth, iCharHeight); // clear line
	},

	setMode: function (iMode) {
		var ctx = this.canvas.getContext("2d");

		this.removeClipping();
		this.iMode = iMode;
		this.oChars = {}; //TTT invalidate chars (TODO but it depends on colors!)

		this.xPos = 0;
		this.yPos = 0;
		this.setOrigin(0, 0);
		this.setMask(0);

		this.setGPen(this.iGPen); // maybe different for other mode
		this.setGPaper(this.iGPaper); // maybe different for other mode
		this.setPen(this.iPen);
		this.setPaper(this.iPaper);

		ctx.lineWidth = this.aModeData[iMode].iLineWidth;

		this.clearPath();
		this.canvas.style.backgroundColor = this.aColors[this.aCurrentInks[this.iPaper]];
		ctx.clearRect(0, 0, this.iWidth, this.iHeight); // cls (for clearWindow we have no dimensions here)
	}
};
