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
			iPens: 16,
			iLineWidth: 4,
			iLineHeight: 2,
			iCharWidth: 8 * 4,
			iCharHeight: 16
		},
		{
			iPens: 4,
			iLineWidth: 2,
			iLineHeight: 2,
			iCharWidth: 8 * 2,
			iCharHeight: 16
		},
		{
			iPens: 2,
			iLineWidth: 1,
			iLineHeight: 2,
			iCharWidth: 8,
			iCharHeight: 16
		},
		{
			iPens: 16, // mode 3 not available on CPC
			iLineWidth: 1,
			iLineHeight: 1,
			iCharWidth: 8,
			iCharHeight: 8 //TTT 8 or 16
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
			iWidth, iHeight, canvas, ctx;

		this.options = Object.assign({}, options);

		this.cpcAreaBox = document.getElementById("cpcAreaBox");

		this.aCharset = this.options.aCharset;

		this.oPressedKeys = {};
		this.aKeyBuffer = [];

		this.iGColMode = 0; // 0=normal, 1=xor, 2=and, 3=or
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

		ctx = this.canvas.getContext("2d");
		this.imageData = ctx.getImageData(0, 0, iWidth, iHeight);
		this.buf = new ArrayBuffer(this.imageData.data.length);
		this.buf8 = new Uint8ClampedArray(this.buf);
		this.data = new Uint32Array(this.buf);

		this.dataset = new ArrayBuffer(iWidth * iHeight);
		this.dataset8 = new Uint8Array(this.dataset); // array with pen values

		this.bNeedUpdate = false;
		this.oUpdateRect = {};
		this.initUpdateRect();

		this.aColorValues = this.extractAllColorValues(this.aColors);

		this.reset();

		if (this.options.onload) {
			this.options.onload(this);
		}
		canvas.addEventListener("click", this.onCpcCanvasClick.bind(this), false);
		window.addEventListener("keydown", this.onWindowKeydown.bind(this), false);
		window.addEventListener("keyup", this.onWindowKeyup.bind(this), false);
		window.addEventListener("click", this.onWindowClick.bind(this), false);

		this.updateCanvas();
	},

	reset: function () {
		var iPaper = 0;

		this.iMode = 1;
		this.aCurrentInks = this.aDefaultInks.slice();
		this.iGPen = null; // force update
		this.iGPaper = null;
		//this.iPen = null;
		//this.iPaper = null;
		this.oCustomCharset = {}; // symbol
		this.setGPen(1);
		this.setGPaper(0);
		//this.setPen(1);
		//this.setPaper(0);
		this.setBorder(this.aDefaultInks[iPaper]);
		this.setMode(1);
		this.clearGraphics(iPaper);
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

	initUpdateRect: function () {
		var oUpdateRect = this.oUpdateRect;

		oUpdateRect.xLeft = 0;
		oUpdateRect.yTop = 0;
		oUpdateRect.xRight = -1;
		oUpdateRect.yBottom = -1;
	},

	setNeedUpdate: function (xLeft, yTop, xRight, yBottom) { // oUpdateRect not used yet
		var oUpdateRect = this.oUpdateRect;

		if (xLeft < oUpdateRect.xLeft) {
			oUpdateRect.xLeft = xLeft;
		}
		if (yTop < oUpdateRect.yTop) {
			oUpdateRect.yTop = yTop;
		}
		if (xRight > oUpdateRect.xRight) {
			oUpdateRect.xRight = xRight;
		}
		if (yBottom > oUpdateRect.yBottom) {
			oUpdateRect.yBottom = yBottom;
		}
		this.bNeedUpdate = true;
	},

	// http://creativejs.com/resources/requestanimationframe/  (set frame rate)
	updateCanvas: function () {
		var iFps = 15, //TTT
			that = this,
			fnCanvasUpdateHandler = this.updateCanvas.bind(this);

		setTimeout(function () {
			requestAnimationFrame(fnCanvasUpdateHandler);
			if (that.bNeedUpdate) { //TTT could be done: update only updateRect
				that.bNeedUpdate = false;
				that.initUpdateRect();
				that.copy2Canvas8bit(); // full update
			}
		}, 1000 / iFps);
	},

	copy2Canvas8bit: function () {
		var ctx = this.canvas.getContext("2d"),
			iWidth = this.iWidth,
			iHeight = this.iHeight,
			buf8 = this.buf8,
			aCurrentInks = this.aCurrentInks,
			aColorValues = this.aColorValues,
			dataset8 = this.dataset8,
			x, y, i, aColor;

		for (y = 0; y < iHeight; y += 1) {
			for (x = 0; x < iWidth; x += 1) {
				i = y * iWidth + x;
				aColor = aColorValues[aCurrentInks[dataset8[i]]];
				i *= 4;
				buf8[i] = aColor[0]; // r
				buf8[i + 1] = aColor[1]; // g
				buf8[i + 2] = aColor[2]; // b
				buf8[i + 3] = 255; // a
			}
		}
		this.imageData.data.set(buf8);
		ctx.putImageData(this.imageData, 0, 0);
	},

	setCustomChar: function (iChar, aCharData) {
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
				Backspace: String.fromCharCode(127),
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
		} else if (event.ctrlKey) {
			if (sKey >= "a" && sKey <= "z") { // map keys with ctrl to control codes (problem: some control codes are browser functions, e.g. w: close window)
				sKey = String.fromCharCode(sKey.charCodeAt(0) - 96); // ctrl+a => \x01
			}
		}
		if (sKey.length === 1) { // ignore special keys with more than 1 character
			this.putKeyInBuffer(sKey);
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
		var sKey;

		if (this.aKeyBuffer.length) {
			sKey = this.aKeyBuffer.shift();
		} else {
			sKey = "";
		}
		return sKey;
	},

	putKeyInBuffer: function (sKey) {
		this.aKeyBuffer.push(sKey);
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

	fillMyRect: function (x, y, iWidth, iHeight, iPen) {
		var iCanvasWidth = this.iWidth,
			dataset8 = this.dataset8,
			col, row, idx;

		for (row = 0; row < iHeight; row += 1) {
			for (col = 0; col < iWidth; col += 1) {
				idx = (x + col) + (y + row) * iCanvasWidth;
				dataset8[idx] = iPen;
			}
		}
	},

	fillTextBox: function (iLeft, iTop, iWidth, iHeight, iPen) {
		var iCharWidth = this.aModeData[this.iMode].iCharWidth,
			iCharHeight = this.aModeData[this.iMode].iCharHeight;

		this.fillMyRect(iLeft * iCharWidth, iTop * iCharHeight, iWidth * iCharWidth, iHeight * iCharHeight, iPen);
		this.setNeedUpdate(iLeft * iCharWidth, iTop * iCharHeight, (iLeft + iWidth) * iCharWidth, (iTop + iHeight) * iCharHeight);
	},

	moveMyRectDown: function (x, y, iWidth, iHeight, x2, y2) { // for scrolling up (overlap)
		var iCanvasWidth = this.iWidth,
			dataset8 = this.dataset8,
			col, row, idx1, idx2;

		for (row = 0; row < iHeight; row += 1) {
			idx1 = x + (y + row) * iCanvasWidth;
			idx2 = x2 + (y2 + row) * iCanvasWidth;
			for (col = 0; col < iWidth; col += 1) {
				dataset8[idx2 + col] = dataset8[idx1 + col];
			}
		}
	},

	moveMyRectUp: function (x, y, iWidth, iHeight, x2, y2) { // for scrolling down (overlap)
		var iCanvasWidth = this.iWidth,
			dataset8 = this.dataset8,
			col, row, idx1, idx2;

		for (row = iHeight - 1; row >= 0; row -= 1) {
			idx1 = x + (y + row) * iCanvasWidth;
			idx2 = x2 + (y2 + row) * iCanvasWidth;
			for (col = 0; col < iWidth; col += 1) {
				dataset8[idx2 + col] = dataset8[idx1 + col];
			}
		}
	},

	setChar: function (iChar, x, y, iPen, iPaper, iGColMode) {
		var aCharData = this.oCustomCharset[iChar] || this.aCharset[iChar],
			iCharWidth = this.aModeData[this.iMode].iCharWidth,
			iCharHeight = this.aModeData[this.iMode].iCharHeight,
			iWidth = this.iWidth,
			iScaleWidth = iCharWidth / 8,
			iScaleHeight = iCharHeight / 8,
			iTransparent = this.iTransparent,
			iBit, iPenOrPaper,
			iCharData, row, col, idx, iCh, iCw;

		for (row = 0; row < 8; row += 1) {
			for (col = 0; col < 8; col += 1) {
				iCharData = aCharData[row];
				iBit = iCharData & (0x80 >> col); // eslint-disable-line no-bitwise
				if (!(iTransparent && !iBit)) { // do not set background pixel in transparent mode
					iPenOrPaper = (iBit) ? iPen : iPaper;
					idx = (x + col * iScaleWidth) + iWidth * (y + row * iScaleHeight);
					for (iCh = 0; iCh < iScaleHeight; iCh += 1) {
						for (iCw = 0; iCw < iScaleWidth; iCw += 1) {
							this.setSubPixel(idx + iCw + iCh * iWidth, iPenOrPaper, iGColMode);
						}
					}
				}
			}
		}
	},

	setSubPixel: function (i, iGPen, iGColMode) {
		switch (iGColMode) {
		case 0: // normal
			this.dataset8[i] = iGPen;
			break;
		case 1: // xor
			this.dataset8[i] ^= iGPen; // eslint-disable-line no-bitwise
			break;
		case 2: // and
			this.dataset8[i] &= iGPen; // eslint-disable-line no-bitwise
			break;
		case 3: // or
			this.dataset8[i] |= iGPen; // eslint-disable-line no-bitwise
			break;
		default:
			Utils.console.warn("setSubPixel: Unknown colMode: " + iGColMode);
			break;
		}
	},

	setPixel: function (x, y) {
		var iGPen, iGColMode, iLineWidth, iLineHeight, i, col, row;

		x += this.xOrig;
		y = this.iHeight - 1 - (y + this.yOrig);
		if (x < this.xLeft || x > this.xRight || y < (this.iHeight - 1 - this.yTop) || y > (this.iHeight - 1 - this.yBottom)) {
			return; // not in graphics window
		}
		iGPen = this.iGPen;
		iGColMode = this.iGColMode;
		iLineWidth = this.aModeData[this.iMode].iLineWidth;
		iLineHeight = this.aModeData[this.iMode].iLineHeight;

		x &= ~(iLineWidth - 1); // eslint-disable-line no-bitwise
		y &= ~(iLineHeight - 1); // eslint-disable-line no-bitwise

		for (row = 0; row < iLineHeight; row += 1) {
			i = x + this.iWidth * (y + row);
			for (col = 0; col < iLineWidth; col += 1) {
				this.setSubPixel(i + col, iGPen, iGColMode);
			}
		}
	},

	testPixel: function (x, y) {
		var i, iPen;

		x += this.xOrig;
		y = this.iHeight - 1 - (y + this.yOrig);

		i = x + this.iWidth * y;
		iPen = this.dataset8[i];
		return iPen;
	},

	// https://de.wikipedia.org/wiki/Bresenham-Algorithmus
	drawBresenhamLine: function (xstart, ystart, xend, yend) {
		var iLineWidth = this.aModeData[this.iMode].iLineWidth,
			iLineHeight = this.aModeData[this.iMode].iLineHeight,
			x, y, t, dx, dy, incx, incy, pdx, pdy, ddx, ddy, deltaslowdirection, deltafastdirection, err;

		dx = (xend - xstart) / iLineWidth;
		dy = (yend - ystart) / iLineHeight;

		incx = Math.sign(dx) * iLineWidth;
		incy = Math.sign(dy) * iLineHeight;
		if (dx < 0) {
			dx = -dx;
		}
		if (dy < 0) {
			dy = -dy;
		}

		if (dx > dy) {
			pdx = incx;
			pdy = 0;
			ddx = incx;
			ddy = incy;
			deltaslowdirection = dy;
			deltafastdirection = dx;
		} else {
			pdx = 0;
			pdy = incy;
			ddx = incx;
			ddy = incy;
			deltaslowdirection = dx;
			deltafastdirection = dy;
		}

		x = xstart;
		y = ystart;
		err = deltafastdirection / 2;
		this.setPixel(x, y); // we expect integers

		for (t = 0; t < deltafastdirection; t += 1) {
			err -= deltaslowdirection;
			if (err < 0) {
				err += deltafastdirection;
				x += ddx;
				y += ddy;
			} else {
				x += pdx;
				y += pdy;
			}
			this.setPixel(x, y); // we expect integers
		}
	},

	draw: function (x, y) {
		var xStart = this.xPos,
			yStart = this.yPos;

		this.move(x, y); // destination, round values
		this.drawBresenhamLine(xStart, yStart, this.xPos, this.yPos);
		this.setNeedUpdate(xStart, yStart, this.xPos, this.yPos); //TTT
	},

	drawr: function (x, y) {
		x += this.xPos;
		y += this.yPos;
		this.draw(x, y);
	},

	move: function (x, y) {
		this.xPos = x; // must be integer
		this.yPos = y;
	},

	mover: function (x, y) {
		x += this.xPos;
		y += this.yPos;
		this.move(x, y);
	},

	plot: function (x, y) {
		this.move(x, y);
		this.setPixel(this.xPos, this.yPos); // use rounded values from move
		this.setNeedUpdate(this.xPos, this.yPos, this.xPos, this.yPos);
	},

	plotr: function (x, y) {
		x += this.xPos;
		y += this.yPos;
		this.plot(x, y);
	},

	test: function (x, y) {
		this.move(x, y);
		return this.testPixel(this.xPos, this.yPos); // use rounded values
	},

	testr: function (x, y) {
		x += this.xPos;
		y += this.yPos;
		return this.test(x, y);
	},

	setInk: function (iPen, iInk1 /* , iInk2 */) {
		if (this.aCurrentInks[iPen] !== iInk1) {
			this.aCurrentInks[iPen] = iInk1;
			this.setNeedUpdate(0, 0, this.iHeight, this.iWidth);
		}
	},

	setBorder: function (iInk1 /* , iInk2 */) {
		this.iBorderColor = iInk1;
		this.canvas.style.borderColor = this.aColors[iInk1];
	},

	setGPen: function (iGPen) {
		iGPen %= this.aModeData[this.iMode].iPens; // limit pens
		this.iGPen = iGPen;
	},

	setGPaper: function (iGPaper) {
		this.iGPaper = iGPaper;
		// TODO
	},

	/*
	setPen: function (iPen) {
		iPen %= this.aModeData[this.iMode].iPens; // limit pens
		if (iPen !== this.iPen) {
			this.iPen = iPen;
		}
	},

	setPaper: function (iPaper) {
		iPaper %= this.aModeData[this.iMode].iPens; // limit papers
		if (iPaper !== this.iPaper) {
			this.iPaper = iPaper;
		}
	},
	*/

	setTranspartentMode: function (iTransparent) {
		this.iTransparent = iTransparent;
	},

	printGChar: function (iChar) {
		var x = this.xPos + this.xOrig,
			y = this.iHeight - 1 - (this.yPos + this.yOrig);

		this.setChar(iChar, x, y, this.iGPen, this.iGPaper, this.iGColMode);
		this.xPos += this.aModeData[this.iMode].iCharWidth;
		this.setNeedUpdate(this.xPos, this.yPos, this.xPos + this.aModeData[this.iMode].iCharWidth, this.yPos + this.aModeData[this.iMode].iCharHeight);
	},

	printChar: function (iChar, x, y, iPen, iPaper) {
		var oModeData = this.aModeData[this.iMode];

		if (iChar >= this.aCharset.length) {
			Utils.console.warn("printChar: Ignoring char with code " + iChar);
			return;
		}

		iPen %= oModeData.iPens;
		iPaper %= oModeData.iPens; // also pens

		x *= oModeData.iCharWidth;
		y *= oModeData.iCharHeight;
		this.setChar(iChar, x, y, iPen, iPaper, 0);
		this.setNeedUpdate(x, this.iHeight - 1 - y, x + oModeData.iCharWidth, this.iHeight - 1 - (y + oModeData.iCharHeight));
	},

	fnPutInRange: function (n, min, max) {
		if (n < min) {
			n = min;
		} else if (n > max) {
			n = max;
		}
		return n;
	},

	setOrigin: function (xOrig, yOrig) {
		this.xOrig = xOrig; // must be integer
		this.yOrig = yOrig;
		this.move(0, 0);
	},

	setGWindow: function (xLeft, xRight, yTop, yBottom) {
		xLeft = this.fnPutInRange(xLeft, 0, this.iWidth - 1);
		xRight = this.fnPutInRange(xRight, 0, this.iWidth - 1);
		yTop = this.fnPutInRange(yTop, 0, this.iHeight - 1);
		yBottom = this.fnPutInRange(yBottom, 0, this.iHeight - 1);

		// On the CPC this is set to byte positions (CPC Systembuch, p. 346)
		// ORIGIN 0,0,13,563,399,0 gets origin 0,0,8,567,399 mod2+1,mod2
		xLeft -= xLeft % 8; // and F8 => "begin of CPC screen byte"
		xRight -= xRight % 8 - 7; // or 07 => "end of CPC screen byte"
		//yTop -= yTop % 2 - 1; //???
		//yBottom -= yBottom % 2;

		this.xLeft = xLeft;
		this.xRight = xRight;
		this.yTop = yTop;
		this.yBottom = yBottom;
	},

	setGColMode: function (iGColMode) {
		if (iGColMode !== this.iGColMode) {
			this.iGColMode = iGColMode;
		}
	},

	clearWindow: function (iLeft, iRight, iTop, iBottom, iPaper) { // clear current window
		var iWidth = iRight + 1 - iLeft,
			iHeight = iBottom + 1 - iTop;

		this.fillTextBox(iLeft, iTop, iWidth, iHeight, iPaper);
	},

	clearGraphics: function (iClgPen) {
		this.fillMyRect(this.xLeft, this.iHeight - 1 - this.yTop, this.xRight + 1 - this.xLeft, this.yTop + 1 - this.yBottom, iClgPen); //TTT +1? TTT
		this.move(0, 0);
		this.setNeedUpdate(this.xLeft, this.yBottom, this.xRight - this.xLeft, this.yTop - this.yBottom);
	},

	windowScrollUp: function (iLeft, iRight, iTop, iBottom, iPen) {
		var iCharWidth = this.aModeData[this.iMode].iCharWidth,
			iCharHeight = this.aModeData[this.iMode].iCharHeight,
			iWidth = iRight + 1 - iLeft,
			iHeight = iBottom + 1 - iTop;

		if (iHeight > 1) { // scroll part
			this.moveMyRectDown(iLeft * iCharWidth, (iTop + 1) * iCharHeight, iWidth * iCharWidth, (iHeight - 1) * iCharHeight, iLeft * iCharWidth, iTop * iCharHeight);
		}
		this.fillTextBox(iLeft, iBottom, iWidth, 1, iPen);
		this.setNeedUpdate(iLeft * iCharWidth, iTop * iCharHeight, iRight * iCharWidth, iBottom * iCharHeight);
	},

	windowScrollDown: function (iLeft, iRight, iTop, iBottom, iPen) {
		var iCharWidth = this.aModeData[this.iMode].iCharWidth,
			iCharHeight = this.aModeData[this.iMode].iCharHeight,
			iWidth = iRight + 1 - iLeft,
			iHeight = iBottom + 1 - iTop;

		if (iHeight > 1) { // scroll part
			this.moveMyRectUp(iLeft * iCharWidth, iTop * iCharHeight, iWidth * iCharWidth, (iHeight - 1) * iCharHeight, iLeft * iCharWidth, (iTop + 1) * iCharHeight);
		}
		this.fillTextBox(iLeft, iTop, iWidth, 1, iPen);
		this.setNeedUpdate(iLeft * iCharWidth, iTop * iCharHeight, iRight * iCharWidth, iBottom * iCharHeight);
	},

	changeMode: function (iMode) {
		this.iMode = iMode;
	},

	setMode: function (iMode) {
		this.iMode = iMode;
		this.setOrigin(0, 0);
		this.setGWindow(0, this.iWidth - 1, this.iHeight - 1, 0);
		//this.move(0, 0);
		this.setGColMode(0);

		this.setGPen(this.iGPen); // maybe different for other mode
		this.setGPaper(this.iGPaper); // maybe different for other mode
		//this.setPen(this.iPen);
		//this.setPaper(this.iPaper);
		this.iTransparent = 0;
		//this.clearGraphics(this.iPaper); //TTT
	}
};
