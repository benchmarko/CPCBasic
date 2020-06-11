// Canvas.js - Graphics output to HTML canvas
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
/* globals ArrayBuffer, Uint8Array, Uint32Array */

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

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
		"#FFFFFF", // 26 Bright White
		"#808080", // 27 White (same as 13)
		"#FF00FF", // 28 Bright Magenta (same as 8)
		"#FFFF80", // 29 Pastel Yellow (same as 25)
		"#000080", // 30 Blue (same as 1)
		"#00FF80" //  31 Sea Green (same as 19)
	],

	// mode 0: pen 0-15,16=border; inks for pen 14,15 are alternating: "1,24", "16,11"
	aDefaultInks: [
		[1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 1, 16, 1], // eslint-disable-line array-element-newline
		[1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 24, 11, 1] // eslint-disable-line array-element-newline
	],

	aModeData: [
		{ // mode 0
			iPens: 16, // number of pens
			iPixelWidth: 4, // pixel width
			iPixelHeight: 2 // pixel height
		},
		{ // mode 1
			iPens: 4,
			iPixelWidth: 2,
			iPixelHeight: 2
		},
		{ // mode 2
			iPens: 2,
			iPixelWidth: 1,
			iPixelHeight: 2
		},
		{ // mode 3
			iPens: 16, // mode 3 not available on a real CPC
			iPixelWidth: 1,
			iPixelHeight: 1
		}
	],

	// CPC Unicode map for text mode (https://www.unicode.org/L2/L2019/19025-terminals-prop.pdf AMSCPC.TXT) incomplete
	sCpc2Unicode:
		"................................ !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]\u2195_`abcdefghijklmnopqrstuvwxyz{|}~\u2591"
		+ "\u00A0\u2598\u259D\u2580\u2596\u258C\u259E\u259B\u2597\u259A\u2590\u259C\u2584\u2599\u259F\u2588\u00B7\u2575\u2576\u2514\u2577\u2502\u250C"
		+ "\u251C\u2574\u2518\u2500\u2534\u2510\u2524\u252C\u253C\u005E\u00B4\u00A8\u00A3\u00A9\u00B6\u00A7\u2018\u00BC\u00BD\u00BE\u00B1\u00F7\u00AC"
		+ "\u00BF\u00A1\u03B1\u03B2\u03B3\u03B4\u03B5\u03B8\u03BB\u03BC\u03C0\u03C3\u03C6\u03C8\u03C7\u03C9\u03A3\u03A9\u1FBA0\u1FBA1\u1FBA3\u1FBA2\u1FBA7"
		+ "\u1FBA5\u1FBA6\u1FBA4\u1FBA8\u1FBA9\u1FBAE\u2573\u2571\u2572\u1FB95\u2592\u23BA\u23B9\u23BD\u23B8\u25E4\u25E5\u25E2\u25E3\u1FB8E\u1FB8D\u1FB8F"
		+ "\u1FB8C\u1FB9C\u1FB9D\u1FB9E\u1FB9F\u263A\u2639\u2663\u2666\u2665\u2660\u25CB\u25CF\u25A1\u25A0\u2642\u2640\u2669\u266A\u263C\uFFBDB\u2B61\u2B63"
		+ "\u2B60\u2B62\u25B2\u25BC\u25B6\u25C0\u1FBC6\u1FBC5\u1FBC7\u1FBC8\uFFBDC\uFFBDD\u2B65\u2B64",

	init: function (options) {
		var iBorderWidth = 4,
			iWidth, iHeight, canvas, ctx;

		this.options = Object.assign({}, options);

		this.fnUpdateCanvasHandler = this.updateCanvas.bind(this);
		this.fnUpdateCanvas2Handler = this.updateCanvas2.bind(this);

		this.iFps = 15; // FPS for canvas update
		this.iTextFpsCounter = 0;

		this.cpcAreaBox = document.getElementById("cpcAreaBox"); //TTT move to view

		//cpcBasic.controller.view.setAreaValue("textText", sOut); //TTT currently fast hack
		this.textText = document.getElementById("textText"); //TTT currently fast hack

		this.aCharset = this.options.aCharset;

		this.iGColMode = 0; // 0=normal, 1=xor, 2=and, 3=or
		this.bClipped = false;

		canvas = document.getElementById("cpcCanvas");
		this.canvas = canvas;

		// make sure canvas is not hidden (allows to get width, height, set style)
		if (canvas.offsetParent === null) {
			Utils.console.error("Error: canvas is not visible!");
		}

		iWidth = canvas.width;
		iHeight = canvas.height;
		this.iWidth = iWidth;
		this.iHeight = iHeight;
		this.iBorderWidth = iBorderWidth;
		canvas.style.borderWidth = iBorderWidth + "px";
		canvas.style.borderStyle = "solid";

		this.dataset8 = new Uint8Array(new ArrayBuffer(iWidth * iHeight)); // array with pen values

		this.bNeedUpdate = false;
		this.bNeedTextUpdate = false;

		this.aColorValues = this.extractAllColorValues(this.aColors);

		this.aCurrentInks = [];
		this.aSpeedInk = [];
		this.aPen2ColorMap = [];

		this.animationTimeout = null;
		this.animationFrame = null;

		if (this.canvas.getContext) {
			ctx = this.canvas.getContext("2d");
			this.imageData = ctx.getImageData(0, 0, iWidth, iHeight);

			if (typeof Uint32Array !== "undefined" && this.imageData.data.buffer) {	// imageData.data.buffer not available on IE10
				this.fnCopy2Canvas = this.copy2Canvas32bit;
				this.bLittleEndian = this.isLittleEndian();
				this.aPen2Color32 = new Uint32Array(new ArrayBuffer(this.aModeData[3].iPens * 4));
				this.aData32 = new Uint32Array(this.imageData.data.buffer);
				Utils.console.log("Canvas: using optimized copy2Canvas32bit, littleEndian:", this.bLittleEndian);
			} else {
				this.fnCopy2Canvas = this.copy2Canvas8bit;
				this.setAlpha(255);
				Utils.console.log("Canvas: using copy2Canvas8bit");
			}
		} else {
			Utils.console.warn("Error: canvas.getContext is not supported.");
			this.imageData = null;
		}
		this.reset();
	},

	reset: function () {
		this.resetTextBuffer();
		this.setNeedTextUpdate();

		this.changeMode(1);
		this.iGPen = null; // force update
		this.iGPaper = null;
		this.iInkSet = 0;
		this.setDefaultInks();

		this.aSpeedInk[0] = 10;
		this.aSpeedInk[1] = 10;
		this.iSpeedInkCount = this.aSpeedInk[this.iInkSet];
		this.canvas.style.borderColor = this.aColors[this.aCurrentInks[this.iInkSet][16]];

		this.setGPen(1);
		this.setGPaper(0);
		this.resetCustomChars();
		this.setMode(1);
		this.clearGraphicsWindow();
	},

	resetCustomChars: function () {
		this.oCustomCharset = {}; // symbol
	},

	resetTextBuffer: function () {
		this.aTextBuffer = []; //TTT
	},

	isLittleEndian: function () {
		var b = new Uint8Array([255, 0, 0, 0]); // eslint-disable-line array-element-newline

		return ((new Uint32Array(b, b.buffer))[0] === 255);
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

	setAlpha: function (iAlpha) {
		var buf8 = this.imageData.data,
			iLength = this.dataset8.length, // or: this.iWidth * this.iHeight
			i;

		for (i = 0; i < iLength; i += 1) {
			buf8[i * 4 + 3] = iAlpha; // alpha
		}
	},

	setNeedUpdate: function () {
		this.bNeedUpdate = true;
	},

	setNeedTextUpdate: function () {
		this.bNeedTextUpdate = true;
	},

	updateCanvas2: function () {
		this.animationFrame = requestAnimationFrame(this.fnUpdateCanvasHandler);
		if (this.bNeedUpdate) { // could be improved: update only updateRect
			this.bNeedUpdate = false;
			// we always do a full updateCanvas...
			this.fnCopy2Canvas();
		}

		if (this.textText.offsetParent) { //TTT text area visible?
			if (this.bNeedTextUpdate) { //TTT
				this.bNeedTextUpdate = false;
				this.updateTextWindow();
			}
		}

		/*
		this.iTextFpsCounter += 1;
		if (this.iTextFpsCounter >= this.iFps) {
			this.iTextFpsCounter = 0;
			if (this.bNeedTextUpdate) { //TTT
				this.bNeedTextUpdate = false;
				this.updateTextWindow();
			}
		}
		*/
	},

	// http://creativejs.com/resources/requestanimationframe/  (set frame rate)
	// https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
	updateCanvas: function () {
		this.animationTimeout = setTimeout(this.fnUpdateCanvas2Handler, 1000 / this.iFps);
	},

	startUpdateCanvas: function () {
		if (this.animationFrame === null && this.canvas.offsetParent !== null && this.imageData) { // animation off and canvas visible in DOM?
			this.updateCanvas();
		}
	},

	stopUpdateCanvas: function () {
		if (this.animationFrame !== null) {
			cancelAnimationFrame(this.animationFrame);
			clearTimeout(this.animationTimeout);
			this.animationFrame = null;
			this.animationTimeout = null;
		}
	},

	copy2Canvas8bit: function () {
		var ctx = this.canvas.getContext("2d"),
			buf8 = this.imageData.data, // use Uint8ClampedArray from canvas
			dataset8 = this.dataset8,
			iLength = dataset8.length, // or: this.iWidth * this.iHeight
			aPen2ColorMap = this.aPen2ColorMap,
			i, j, aColor;

		for (i = 0; i < iLength; i += 1) {
			aColor = aPen2ColorMap[dataset8[i]];
			j = i * 4;
			buf8[j] = aColor[0]; // r
			buf8[j + 1] = aColor[1]; // g
			buf8[j + 2] = aColor[2]; // b
			// alpha already set to 255
		}
		ctx.putImageData(this.imageData, 0, 0);
	},

	copy2Canvas32bit: function () {
		var ctx = this.canvas.getContext("2d"),
			dataset8 = this.dataset8,
			aData32 = this.aData32,
			aPen2Color32 = this.aPen2Color32,
			i;

		for (i = 0; i < aData32.length; i += 1) {
			aData32[i] = aPen2Color32[dataset8[i]];
		}

		ctx.putImageData(this.imageData, 0, 0);
	},

	updateTextWindow: function () { //TTT
		var aTextBuffer = this.aTextBuffer,
			sOut = "",
			x, y, aTextBufferRow;

		for (y = 0; y < aTextBuffer.length; y += 1) {
			aTextBufferRow = aTextBuffer[y];
			if (aTextBufferRow) {
				for (x = 0; x < aTextBufferRow.length; x += 1) {
					//sOut += String.fromCharCode(aTextBufferRow[x] || 32);
					sOut += this.sCpc2Unicode[aTextBufferRow[x] || 32];
				}
			}
			sOut += "\n";
		}
		//cpcBasic.controller.view.setAreaValue("textText", sOut); //TTT currently fast hack
		this.textText.value = sOut; //TTT fast hack
	},

	updateColorMap: function () {
		var aColorValues = this.aColorValues,
			aCurrentInksInSet = this.aCurrentInks[this.iInkSet],
			aPen2ColorMap = this.aPen2ColorMap,
			aPen2Color32 = this.aPen2Color32,
			aColor, i;

		for (i = 0; i < 16; i += 1) {
			aPen2ColorMap[i] = aColorValues[aCurrentInksInSet[i]];
		}

		if (aPen2Color32) {
			for (i = 0; i < 16; i += 1) {
				aColor = aPen2ColorMap[i];
				if (this.bLittleEndian) {
					aPen2Color32[i] = aColor[0] + aColor[1] * 256 + aColor[2] * 65536 + 255 * 65536 * 256;
				} else {
					aPen2Color32[i] = aColor[2] + aColor[1] * 256 + aColor[0] * 65536 + 255 * 65536 * 256; // TODO: do we need this?
				}
			}
		}
	},

	updateSpeedInk: function () {
		var iPens = this.oModeData.iPens,
			iCurrentInkSet, iNewInkSet, i;

		this.iSpeedInkCount -= 1;
		if (this.iSpeedInkCount <= 0) {
			iCurrentInkSet = this.iInkSet;
			iNewInkSet = iCurrentInkSet ^ 1; // eslint-disable-line no-bitwise
			this.iInkSet = iNewInkSet;
			this.iSpeedInkCount = this.aSpeedInk[iNewInkSet];

			// check for blinking inks which pens are visible in the current mode
			for (i = 0; i < iPens; i += 1) {
				if (this.aCurrentInks[iNewInkSet][i] !== this.aCurrentInks[iCurrentInkSet][i]) {
					this.updateColorMap(); // need ink update
					this.bNeedUpdate = true; // we also need update
					break;
				}
			}

			// check border ink
			if (this.aCurrentInks[iNewInkSet][16] !== this.aCurrentInks[iCurrentInkSet][16]) {
				this.canvas.style.borderColor = this.aColors[this.aCurrentInks[iNewInkSet][16]];
			}
		}
	},

	setCustomChar: function (iChar, aCharData) {
		this.oCustomCharset[iChar] = aCharData;
	},

	getCharData: function (iChar) {
		var aCharData = this.oCustomCharset[iChar] || this.aCharset[iChar];

		return aCharData;
	},

	setDefaultInks: function () {
		this.aCurrentInks[0] = this.aDefaultInks[0].slice(); // copy ink set 0 array
		this.aCurrentInks[1] = this.aDefaultInks[1].slice(); // copy ink set 1 array
		this.updateColorMap();
		this.setGPen(this.iGPen);
	},

	setFocusOnCanvas: function () {
		this.cpcAreaBox.style.background = "#463c3c";
		if (this.canvas) {
			this.canvas.focus();
		}
		this.bHasFocus = true;
	},

	getMousePos: function (event) {
		var oRect = this.canvas.getBoundingClientRect(),
			oPos = {
				x: event.clientX - this.iBorderWidth - oRect.left,
				y: event.clientY - this.iBorderWidth - oRect.top
			};

		return oPos;
	},

	canvasClickAction2: function (event) {
		var oPos = this.getMousePos(event),
			x = oPos.x,
			y = oPos.y,
			iCharWidth = this.oModeData.iPixelWidth * 8,
			iCharHeight = this.oModeData.iPixelHeight * 8,
			xTxt, yTxt, iChar;

		/* eslint-disable no-bitwise */
		x |= 0; // force integer
		y |= 0;

		xTxt = (x / iCharWidth) | 0;
		yTxt = (y / iCharHeight) | 0;
		/* eslint-enable no-bitwise */

		iChar = this.getCharFromTextBuffer(xTxt, yTxt);

		if (iChar !== undefined && this.options.onClickKey) {
			this.options.onClickKey(String.fromCharCode(iChar));
		}

		// for graphics coordinates, adapt origin
		x -= this.xOrig;
		y = this.iHeight - 1 - (y + this.yOrig);

		if (this.xPos === 1000 && this.yPos === 1000) { // only activate move if pos is 1000, 1000
			this.move(x, y);
			//this.plot(x, y); // does also move
			//this.setPixel(x, y, this.iGPen, 1); this.setNeedUpdate(); // 1=XOR mode; plot does alos move
		}
		if (Utils.debug > 0) {
			Utils.console.debug("onCpcCanvasClick: x-xOrig", x, "y-yOrig", y, "iChar", iChar, "char", String.fromCharCode(iChar));
		}
	},

	onCpcCanvasClick: function (event) {
		if (!this.bHasFocus) {
			this.setFocusOnCanvas();
		} else {
			this.canvasClickAction2(event);
		}
		event.stopPropagation();
	},

	onWindowClick: function () {
		if (this.bHasFocus) {
			this.bHasFocus = false;
			this.cpcAreaBox.style.background = "";
		}
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
		var iCharWidth = this.oModeData.iPixelWidth * 8,
			iCharHeight = this.oModeData.iPixelHeight * 8;

		this.fillMyRect(iLeft * iCharWidth, iTop * iCharHeight, iWidth * iCharWidth, iHeight * iCharHeight, iPen);
		this.clearTextBufferBox(iLeft, iTop, iWidth, iHeight);
		this.setNeedUpdate();
	},

	moveMyRectUp: function (x, y, iWidth, iHeight, x2, y2) { // for scrolling up (overlap)
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

	moveMyRectDown: function (x, y, iWidth, iHeight, x2, y2) { // for scrolling down (overlap)
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

	invertChar: function (x, y, iPen, iPaper) {
		var iPixelWidth = this.oModeData.iPixelWidth,
			iPixelHeight = this.oModeData.iPixelHeight,
			iPenXorPaper = iPen ^ iPaper, // eslint-disable-line no-bitwise
			iGColMode = 0,
			row, col, iTestPen;

		for (row = 0; row < 8; row += 1) {
			for (col = 0; col < 8; col += 1) {
				iTestPen = this.testSubPixel(x + col * iPixelWidth, y + row * iPixelHeight);
				iTestPen ^= iPenXorPaper; // eslint-disable-line no-bitwise
				this.setSubPixels(x + col * iPixelWidth, y + row * iPixelHeight, iTestPen, iGColMode);
			}
		}
	},

	setChar: function (iChar, x, y, iPen, iPaper, bTransparent, iGColMode, bTextAtGraphics) {
		var aCharData = this.oCustomCharset[iChar] || this.aCharset[iChar],
			iPixelWidth = this.oModeData.iPixelWidth,
			iPixelHeight = this.oModeData.iPixelHeight,
			iBit, iPenOrPaper,
			iCharData, row, col;

		for (row = 0; row < 8; row += 1) {
			for (col = 0; col < 8; col += 1) {
				iCharData = aCharData[row];
				iBit = iCharData & (0x80 >> col); // eslint-disable-line no-bitwise
				if (!(bTransparent && !iBit)) { // do not set background pixel in transparent mode
					iPenOrPaper = (iBit) ? iPen : iPaper;
					if (bTextAtGraphics) {
						this.setPixel(x + col * iPixelWidth, y - row * iPixelHeight, iPenOrPaper, iGColMode);
					} else { // text mode
						this.setSubPixels(x + col * iPixelWidth, y + row * iPixelHeight, iPenOrPaper, iGColMode); // iColMode always 0 in text mode
					}
				}
			}
		}
	},

	readCharData: function (x, y, iExpectedPen) {
		var aCharData = [],
			iPixelWidth = this.oModeData.iPixelWidth,
			iPixelHeight = this.oModeData.iPixelHeight,
			iPen, iCharData, row, col;

		for (row = 0; row < 8; row += 1) {
			iCharData = 0;
			for (col = 0; col < 8; col += 1) {
				iPen = this.testSubPixel(x + col * iPixelWidth, y + row * iPixelHeight);
				if (iPen === iExpectedPen) {
					iCharData |= (0x80 >> col); // eslint-disable-line no-bitwise
				}
			}
			aCharData[row] = iCharData;
		}
		return aCharData;
	},

	setSubPixels: function (x, y, iGPen, iGColMode) {
		var iPixelWidth = this.oModeData.iPixelWidth,
			iPixelHeight = this.oModeData.iPixelHeight,
			iWidth = this.iWidth,
			row, col, i;

		/* eslint-disable no-bitwise */
		x &= ~(iPixelWidth - 1); // match CPC pixel
		y &= ~(iPixelHeight - 1);

		for (row = 0; row < iPixelHeight; row += 1) {
			i = x + iWidth * (y + row);
			for (col = 0; col < iPixelWidth; col += 1) {
				switch (iGColMode) {
				case 0: // normal
					this.dataset8[i] = iGPen;
					break;
				case 1: // xor
					this.dataset8[i] ^= iGPen;
					break;
				case 2: // and
					this.dataset8[i] &= iGPen;
					break;
				case 3: // or
					this.dataset8[i] |= iGPen;
					break;
				default:
					Utils.console.warn("setSubPixels: Unknown colMode:", iGColMode);
					break;
				}
				i += 1;
			}
		}
		/* eslint-enable no-bitwise */
	},

	setPixel: function (x, y, iGPen, iGColMode) {
		x += this.xOrig;
		y = this.iHeight - 1 - (y + this.yOrig);
		if (x < this.xLeft || x > this.xRight || y < (this.iHeight - 1 - this.yTop) || y > (this.iHeight - 1 - this.yBottom)) {
			return; // not in graphics window
		}
		this.setSubPixels(x, y, iGPen, iGColMode);
	},

	setPixelOriginIncluded: function (x, y, iGPen, iGColMode) {
		if (x < this.xLeft || x > this.xRight || y < (this.iHeight - 1 - this.yTop) || y > (this.iHeight - 1 - this.yBottom)) {
			return; // not in graphics window
		}
		this.setSubPixels(x, y, iGPen, iGColMode);
	},

	testSubPixel: function (x, y) {
		var i, iPen;

		i = x + this.iWidth * y;
		iPen = this.dataset8[i];
		return iPen;
	},

	testPixel: function (x, y) {
		var i, iPen;

		x += this.xOrig;
		y = this.iHeight - 1 - (y + this.yOrig);
		if (x < this.xLeft || x > this.xRight || y < (this.iHeight - 1 - this.yTop) || y > (this.iHeight - 1 - this.yBottom)) {
			return this.iGPaper; // not in graphics window => return graphics paper
		}

		i = x + this.iWidth * y;
		iPen = this.dataset8[i];

		return iPen;
	},

	getByte: function (iAddr) {
		var iMode = this.iMode,
			iPixelWidth = this.oModeData.iPixelWidth,
			iPixelHeight = this.oModeData.iPixelHeight,
			iByte = null, // null=cannot read
			x, y, iGPen, i;

		/* eslint-disable no-bitwise */
		x = ((iAddr & 0x7ff) % 80) * 8;
		y = (((iAddr & 0x3800) / 0x800) + (((iAddr & 0x7ff) / 80) | 0) * 8) * iPixelHeight;

		if (y < this.iHeight) { // only if in visible range
			if (iMode === 0) {
				iGPen = this.dataset8[x + this.iWidth * y];
				iByte = ((iGPen >> 2) & 0x02) | ((iGPen << 3) & 0x20) | ((iGPen << 2) & 0x08) | ((iGPen << 7) & 0x80); // b1,b5,b3,b7 (left pixel)

				iGPen = this.dataset8[x + iPixelWidth + this.iWidth * y];
				iByte |= ((iGPen >> 3) & 0x01) | ((iGPen << 2) & 0x10) | ((iGPen << 1) & 0x04) | ((iGPen << 6) & 0x40); // b0,b4,b2,b6 (right pixel)
			} else if (iMode === 1) {
				iByte = 0;
				iGPen = this.dataset8[x + this.iWidth * y];
				iByte |= ((iGPen & 0x02) << 2) | ((iGPen & 0x01) << 7); // b3,b7 (left pixel 1)
				iGPen = this.dataset8[x + iPixelWidth + this.iWidth * y];
				iByte |= ((iGPen & 0x02) << 1) | ((iGPen & 0x01) << 6); // b2,b6 (pixel 2)
				iGPen = this.dataset8[x + iPixelWidth * 2 + this.iWidth * y];
				iByte |= ((iGPen & 0x02) << 0) | ((iGPen & 0x01) << 5); // b1,b5 (pixel 3)
				iGPen = this.dataset8[x + iPixelWidth * 3 + this.iWidth * y];
				iByte |= ((iGPen & 0x02) >> 1) | ((iGPen & 0x01) << 4); // b0,b4 (right pixel 4)
			} else if (iMode === 2) {
				iByte = 0;
				for (i = 0; i <= 7; i += 1) {
					iGPen = this.dataset8[x + i + this.iWidth * y];
					iByte |= (iGPen & 0x01) << (7 - i);
				}
			} else { // iMode === 3
			}
		}
		/* eslint-enable no-bitwise */

		return iByte;
	},

	setByte: function (iAddr, iByte) {
		var iMode = this.iMode,
			iPixelWidth = this.oModeData.iPixelWidth,
			iPixelHeight = this.oModeData.iPixelHeight,
			iGColMode = 0, // always 0
			x, y, iGPen, i;

		/* eslint-disable no-bitwise */
		x = ((iAddr & 0x7ff) % 80) * 8;
		y = (((iAddr & 0x3800) / 0x800) + (((iAddr & 0x7ff) / 80) | 0) * 8) * iPixelHeight;

		if (y < this.iHeight) { // only if in visible range
			if (iMode === 0) {
				iGPen = ((iByte << 2) & 0x08) | ((iByte >> 3) & 0x04) | ((iByte >> 2) & 0x02) | ((iByte >> 7) & 0x01); // b1,b5,b3,b7 (left pixel)
				this.setSubPixels(x, y, iGPen, iGColMode);
				iGPen = ((iByte << 3) & 0x08) | ((iByte >> 2) & 0x04) | ((iByte >> 1) & 0x02) | ((iByte >> 6) & 0x01); // b0,b4,b2,b6 (right pixel)
				this.setSubPixels(x + iPixelWidth, y, iGPen, iGColMode);
				this.setNeedUpdate();
			} else if (iMode === 1) {
				iGPen = ((iByte >> 2) & 0x02) | ((iByte >> 7) & 0x01); // b3,b7 (left pixel 1)
				this.setSubPixels(x, y, iGPen, iGColMode);
				iGPen = ((iByte >> 1) & 0x02) | ((iByte >> 6) & 0x01); // b2,b6 (pixel 2)
				this.setSubPixels(x + iPixelWidth, y, iGPen, iGColMode);
				iGPen = ((iByte >> 0) & 0x02) | ((iByte >> 5) & 0x01); // b1,b5 (pixel 3)
				this.setSubPixels(x + iPixelWidth * 2, y, iGPen, iGColMode);
				iGPen = ((iByte << 1) & 0x02) | ((iByte >> 4) & 0x01); // b0,b4 (right pixel 4)
				this.setSubPixels(x + iPixelWidth * 3, y, iGPen, iGColMode);
				this.setNeedUpdate();
			} else if (iMode === 2) {
				for (i = 0; i <= 7; i += 1) {
					iGPen = (iByte >> (7 - i)) & 0x01;
					this.setSubPixels(x + i * iPixelWidth, y, iGPen, iGColMode);
				}
				this.setNeedUpdate();
			} else { // iMode === 3 (not supported)
			}
		}
		/* eslint-enable no-bitwise */
	},

	// https://de.wikipedia.org/wiki/Bresenham-Algorithmus
	drawBresenhamLine: function (xstart, ystart, xend, yend) {
		var iPixelWidth = this.oModeData.iPixelWidth,
			iPixelHeight = this.oModeData.iPixelHeight,
			iGPen = this.iGPen,
			iGColMode = this.iGColMode,
			x, y, t, dx, dy, incx, incy, pdx, pdy, ddx, ddy, deltaslowdirection, deltafastdirection, err;


		// we have to add origin before modifying coordinates to match CPC pixel
		xstart += this.xOrig;
		ystart = this.iHeight - 1 - (ystart + this.yOrig);
		xend += this.xOrig;
		yend = this.iHeight - 1 - (yend + this.yOrig);

		/* eslint-disable no-bitwise */
		if (xend >= xstart) { // line from left to right
			xend |= (iPixelWidth - 1); // match CPC pixel
		} else { // line from right to left
			xstart |= (iPixelWidth - 1);
		}

		if (yend >= ystart) { // line from bottom to top
			yend |= (iPixelHeight - 1);
		} else { // line from top to bottom
			ystart |= (iPixelHeight - 1);
		}

		dx = ((xend - xstart) / iPixelWidth) | 0;
		dy = ((yend - ystart) / iPixelHeight) | 0;
		/* eslint-enable no-bitwise */

		incx = Math.sign(dx) * iPixelWidth;
		incy = Math.sign(dy) * iPixelHeight;
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
		err = deltafastdirection >> 1; // eslint-disable-line no-bitwise
		this.setPixelOriginIncluded(x, y, iGPen, iGColMode); // we expect integers

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
			this.setPixelOriginIncluded(x, y, iGPen, iGColMode); // we expect integers
		}
	},

	draw: function (x, y) {
		var xStart = this.xPos,
			yStart = this.yPos;

		this.move(x, y); // destination, round values
		this.drawBresenhamLine(xStart, yStart, this.xPos, this.yPos);
		this.setNeedUpdate();
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
		this.setPixel(x, y, this.iGPen, this.iGColMode); // must be integer
		this.setNeedUpdate();
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

	setInk: function (iPen, iInk1, iInk2) {
		var bNeedInkUpdate = false;

		if (this.aCurrentInks[0][iPen] !== iInk1) {
			this.aCurrentInks[0][iPen] = iInk1;
			bNeedInkUpdate = true;
		}
		if (this.aCurrentInks[1][iPen] !== iInk2) {
			this.aCurrentInks[1][iPen] = iInk2;
			bNeedInkUpdate = true;
		}
		if (bNeedInkUpdate) {
			this.updateColorMap();
			this.setNeedUpdate(); // we need to notify that an update is needed
		}
		return bNeedInkUpdate;
	},

	setBorder: function (iInk1, iInk2) {
		var bNeedInkUpdate = this.setInk(16, iInk1, iInk2);

		if (bNeedInkUpdate) {
			this.canvas.style.borderColor = this.aColors[this.aCurrentInks[this.iInkSet][16]];
		}
	},

	setGPen: function (iGPen) {
		iGPen %= this.oModeData.iPens; // limit pens
		this.iGPen = iGPen;
	},

	setGPaper: function (iGPaper) {
		iGPaper %= this.oModeData.iPens; // limit pens
		this.iGPaper = iGPaper;
	},

	setGTransparentMode: function (bTransparent) {
		this.bGTransparent = bTransparent;
	},

	printGChar: function (iChar) {
		var iCharWidth = this.oModeData.iPixelWidth * 8;

		if (iChar >= this.aCharset.length) {
			Utils.console.warn("printGChar: Ignoring char with code", iChar);
			return;
		}

		this.setChar(iChar, this.xPos, this.yPos, this.iGPen, this.iGPaper, this.bGTransparent, this.iGColMode, true);
		this.xPos += iCharWidth;
		this.setNeedUpdate();
	},

	clearTextBufferBox: function (iLeft, iTop, iWidth, iHeight) {
		var aTextBuffer = this.aTextBuffer,
			x, y, aTextBufferRow;

		for (y = iTop; y < iTop + iHeight; y += 1) {
			aTextBufferRow = aTextBuffer[y];
			if (aTextBufferRow) {
				for (x = iLeft; x < iLeft + iWidth; x += 1) {
					delete aTextBufferRow[x];
				}
			}
		}
		this.setNeedTextUpdate();
	},

	copyTextBufferBoxUp: function (iLeft, iTop, iWidth, iHeight, iLeft2, iTop2) {
		var aTextBuffer = this.aTextBuffer,
			y, x, aTextBufferRow1, aTextBufferRow2;

		for (y = 0; y < iHeight; y += 1) {
			aTextBufferRow1 = aTextBuffer[iTop + y];
			if (aTextBufferRow1) {
				aTextBufferRow2 = aTextBuffer[iTop2 + y];
				if (!aTextBufferRow2) {
					aTextBufferRow2 = [];
					aTextBuffer[iTop2 + y] = aTextBufferRow2;
				}
				for (x = 0; x < iWidth; x += 1) {
					aTextBufferRow2[iLeft2 + x] = aTextBufferRow1[iLeft + x];
				}
			}
		}
		this.setNeedTextUpdate();
	},

	copyTextBufferBoxDown: function (iLeft, iTop, iWidth, iHeight, iLeft2, iTop2) {
		var aTextBuffer = this.aTextBuffer,
			y, x, aTextBufferRow1, aTextBufferRow2;

		for (y = iHeight - 1; y >= 0; y -= 1) {
			aTextBufferRow1 = aTextBuffer[iTop + y];
			if (aTextBufferRow1) {
				aTextBufferRow2 = aTextBuffer[iTop2 + y];
				if (!aTextBufferRow2) {
					aTextBufferRow2 = [];
					aTextBuffer[iTop2 + y] = aTextBufferRow2;
				}
				for (x = 0; x < iWidth; x += 1) {
					aTextBufferRow2[iLeft2 + x] = aTextBufferRow1[iLeft + x];
				}
			}
		}
		this.setNeedTextUpdate();
	},

	putCharInTextBuffer: function (iChar, x, y) {
		var aTextBuffer = this.aTextBuffer;

		if (!aTextBuffer[y]) {
			aTextBuffer[y] = [];
		}
		this.aTextBuffer[y][x] = iChar;
		this.setNeedTextUpdate();
	},

	getCharFromTextBuffer: function (x, y) {
		var aTextBuffer = this.aTextBuffer,
			iChar;

		if (aTextBuffer[y]) {
			iChar = this.aTextBuffer[y][x]; // can be undefined, if not set
		}
		return iChar;
	},

	printChar: function (iChar, x, y, iPen, iPaper, bTransparent) {
		var iCharWidth = this.oModeData.iPixelWidth * 8,
			iCharHeight = this.oModeData.iPixelHeight * 8,
			iPens = this.oModeData.iPens;

		this.putCharInTextBuffer(iChar, x, y); //TTT testing text buffer

		if (iChar >= this.aCharset.length) {
			Utils.console.warn("printChar: Ignoring char with code", iChar);
			return;
		}

		iPen %= iPens;
		iPaper %= iPens; // also pens

		this.setChar(iChar, x * iCharWidth, y * iCharHeight, iPen, iPaper, bTransparent, 0, false);
		this.setNeedUpdate();
	},

	drawCursor: function (x, y, iPen, iPaper) {
		var iCharWidth = this.oModeData.iPixelWidth * 8,
			iCharHeight = this.oModeData.iPixelHeight * 8,
			iPens = this.oModeData.iPens;

		iPen %= iPens;
		iPaper %= iPens; // also pens

		this.invertChar(x * iCharWidth, y * iCharHeight, iPen, iPaper);
		this.setNeedUpdate();
	},

	findMatchingChar: function (aCharData) {
		var aCharset = this.aCharset,
			iChar = -1, // not detected
			i, j, bMatch, aCharData2;

		for (i = 0; i < aCharset.length; i += 1) {
			aCharData2 = this.oCustomCharset[i] || aCharset[i];
			bMatch = true;
			for (j = 0; j < 8; j += 1) {
				if (aCharData[j] !== aCharData2[j]) {
					bMatch = false;
					break;
				}
			}
			if (bMatch) {
				iChar = i;
				break;
			}
		}
		return iChar;
	},

	readChar: function (x, y, iPen, iPaper) {
		var iCharWidth = this.oModeData.iPixelWidth * 8,
			iCharHeight = this.oModeData.iPixelHeight * 8,
			iPens = this.oModeData.iPens,
			iChar, iChar2, aCharData, i;

		iPen %= iPens;
		iPaper %= iPens; // also pens

		x *= iCharWidth;
		y *= iCharHeight;

		aCharData = this.readCharData(x, y, iPen);
		iChar = this.findMatchingChar(aCharData);
		if (iChar < 0 || iChar === 32) { // no match? => check inverse with paper, char=32?
			aCharData = this.readCharData(x, y, iPaper);
			for (i = 0; i < aCharData.length; i += 1) {
				aCharData[i] ^= 0xff; // eslint-disable-line no-bitwise
			}
			iChar2 = this.findMatchingChar(aCharData);
			if (iChar2 >= 0) {
				if (iChar2 === 143) { // invers of space?
					iChar2 = 32; // use space
				}
				iChar = iChar2;
			}
		}
		return iChar;
	},


	// idea from: https://simpledevcode.wordpress.com/2015/12/29/flood-fill-algorithm-using-c-net/
	fill: function (iFill) {
		var that = this,
			xPos = this.xPos,
			yPos = this.yPos,
			iGPen = this.iGPen,
			iPixelWidth = this.oModeData.iPixelWidth,
			iPixelHeight = this.oModeData.iPixelHeight,
			aPixels = [],
			oPixel, x1, y1, bSpanLeft, bSpanRight, p1, p2, p3,
			fnIsStopPen = function (p) {
				return p === iFill || p === iGPen;
			},
			fnIsNotInWindow = function (x, y) {
				return (x < that.xLeft || x > that.xRight || y < (that.iHeight - 1 - that.yTop) || y > (that.iHeight - 1 - that.yBottom));
			};

		iFill %= this.oModeData.iPens; // limit pens

		// apply origin
		xPos += this.xOrig;
		yPos = this.iHeight - 1 - (yPos + this.yOrig);

		if (fnIsNotInWindow(xPos, yPos)) {
			return;
		}

		aPixels.push({
			x: xPos,
			y: yPos
		});

		while (aPixels.length) {
			oPixel = aPixels.pop();
			y1 = oPixel.y;
			p1 = this.testSubPixel(oPixel.x, y1);
			while (y1 >= (that.iHeight - 1 - that.yTop) && !fnIsStopPen(p1)) {
				y1 -= iPixelHeight;
				p1 = this.testSubPixel(oPixel.x, y1);
			}
			y1 += iPixelHeight;

			bSpanLeft = false;
			bSpanRight = false;
			p1 = this.testSubPixel(oPixel.x, y1);
			while (y1 <= (that.iHeight - 1 - that.yBottom) && !fnIsStopPen(p1)) {
				this.setSubPixels(oPixel.x, y1, iFill, 0);

				x1 = oPixel.x - iPixelWidth;
				p2 = this.testSubPixel(x1, y1);
				if (!bSpanLeft && x1 >= this.xLeft && !fnIsStopPen(p2)) {
					aPixels.push({
						x: x1,
						y: y1
					});
					bSpanLeft = true;
				} else if (bSpanLeft && ((x1 < this.xLeft) || fnIsStopPen(p2))) {
					bSpanLeft = false;
				}

				x1 = oPixel.x + iPixelWidth;
				p3 = this.testSubPixel(x1, y1);
				if (!bSpanRight && x1 <= this.xRight && !fnIsStopPen(p3)) {
					aPixels.push({
						x: x1,
						y: y1
					});
					bSpanRight = true;
				} else if (bSpanRight && ((x1 > this.xRight) || fnIsStopPen(p3))) {
					bSpanRight = false;
				}
				y1 += iPixelHeight;
				p1 = this.testSubPixel(oPixel.x, y1);
			}
		}
		this.setNeedUpdate();
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
		var iPixelWidth = this.oModeData.iPixelWidth;

		/* eslint-disable no-bitwise */
		xOrig &= ~(iPixelWidth - 1);
		/* eslint-enable no-bitwise */

		this.xOrig = xOrig; // must be integer
		this.yOrig = yOrig;
		this.move(0, 0);
	},

	setGWindow: function (xLeft, xRight, yTop, yBottom) {
		var iPixelWidth = 8, // force byte boundaries: always 8 x/byte
			iPixelHeight = this.oModeData.iPixelHeight, // usually 2, anly for mode 3 we have 1
			tmp;

		xLeft = this.fnPutInRange(xLeft, 0, this.iWidth - 1);
		xRight = this.fnPutInRange(xRight, 0, this.iWidth - 1);
		yTop = this.fnPutInRange(yTop, 0, this.iHeight - 1);
		yBottom = this.fnPutInRange(yBottom, 0, this.iHeight - 1);

		// exchange coordinates, if needed (left>right or top<bottom)
		if (xRight < xLeft) {
			tmp = xRight;
			xRight = xLeft;
			xLeft = tmp;
		}
		if (yTop < yBottom) {
			tmp = yTop;
			yTop = yBottom;
			yBottom = tmp;
		}

		// On the CPC this is set to byte positions (CPC Systembuch, p. 346)
		// ORIGIN 0,0,13,563,399,0 gets origin 0,0,8,567,399 mod2+1,mod2

		/* eslint-disable no-bitwise */
		xLeft &= ~(iPixelWidth - 1);
		xRight |= (iPixelWidth - 1);

		yTop |= (iPixelHeight - 1); // we know: top is larger than bottom
		yBottom &= ~(iPixelHeight - 1);
		/* eslint-enable no-bitwise */

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

	clearTextWindow: function (iLeft, iRight, iTop, iBottom, iPaper) { // clear current text window
		var iWidth = iRight + 1 - iLeft,
			iHeight = iBottom + 1 - iTop;

		this.fillTextBox(iLeft, iTop, iWidth, iHeight, iPaper);
		//this.clearTextBufferBox(iLeft, iTop, iWidth, iHeight);
	},

	clearGraphicsWindow: function () { // clear graphics window with graphics paper
		this.fillMyRect(this.xLeft, this.iHeight - 1 - this.yTop, this.xRight + 1 - this.xLeft, this.yTop + 1 - this.yBottom, this.iGPaper); // +1 or not?
		this.move(0, 0);
		this.setNeedUpdate();
	},

	clearFullWindow: function () { // clear full window with paper 0 (SCR MODE CLEAR)
		var iPaper = 0;

		this.fillMyRect(0, 0, this.iWidth, this.iHeight, iPaper);

		this.resetTextBuffer();
		this.setNeedTextUpdate();

		this.setNeedUpdate();
	},

	windowScrollUp: function (iLeft, iRight, iTop, iBottom, iPen) {
		var iCharWidth = this.oModeData.iPixelWidth * 8,
			iCharHeight = this.oModeData.iPixelHeight * 8,
			iWidth = iRight + 1 - iLeft,
			iHeight = iBottom + 1 - iTop;

		if (iHeight > 1) { // scroll part
			this.moveMyRectUp(iLeft * iCharWidth, (iTop + 1) * iCharHeight, iWidth * iCharWidth, (iHeight - 1) * iCharHeight, iLeft * iCharWidth, iTop * iCharHeight);

			// adapt also text buffer
			this.copyTextBufferBoxUp(iLeft, iTop + 1, iWidth, iHeight - 1, iLeft, iTop);
		}
		this.fillTextBox(iLeft, iBottom, iWidth, 1, iPen);
		this.setNeedUpdate();
	},

	windowScrollDown: function (iLeft, iRight, iTop, iBottom, iPen) {
		var iCharWidth = this.oModeData.iPixelWidth * 8,
			iCharHeight = this.oModeData.iPixelHeight * 8,
			iWidth = iRight + 1 - iLeft,
			iHeight = iBottom + 1 - iTop;

		if (iHeight > 1) { // scroll part
			this.moveMyRectDown(iLeft * iCharWidth, iTop * iCharHeight, iWidth * iCharWidth, (iHeight - 1) * iCharHeight, iLeft * iCharWidth, (iTop + 1) * iCharHeight);

			// adapt also text buffer
			this.copyTextBufferBoxDown(iLeft, iTop, iWidth, iHeight - 1, iLeft, iTop + 1);
		}
		this.fillTextBox(iLeft, iTop, iWidth, 1, iPen);
		this.setNeedUpdate();
	},

	setSpeedInk: function (iTime1, iTime2) { // default: 10,10
		this.aSpeedInk[0] = iTime1;
		this.aSpeedInk[1] = iTime2;
	},

	changeMode: function (iMode) {
		var oModeData = this.aModeData[iMode];

		this.iMode = iMode;
		this.oModeData = oModeData;
	},

	setMode: function (iMode) { // set mode without clear screen
		this.changeMode(iMode);
		this.setOrigin(0, 0);
		this.setGWindow(0, this.iWidth - 1, this.iHeight - 1, 0);
		this.setGColMode(0);
		this.setGPen(this.iGPen); // keep, but maybe different for other mode
		this.setGPaper(this.iGPaper); // keep, maybe different for other mode
		this.setGTransparentMode(false);
	}
};
