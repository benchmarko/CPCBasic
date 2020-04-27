// Canvas.js - Graphics output to HTML canvas
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
/* globals Utils */
/* globals ArrayBuffer Uint8Array */

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
			iLineWidth: 4, // pixel width
			iLineHeight: 2, // pixel height
			iCharWidth: 8 * 4, // width of a char (pixel width * 8)
			iCharHeight: 16 // height of a char (pixel height * 8)
		},
		{ // mode 1
			iPens: 4,
			iLineWidth: 2,
			iLineHeight: 2,
			iCharWidth: 8 * 2, //  * 2, //TTT TEST
			iCharHeight: 16
		},
		{ // mode 2
			iPens: 2,
			iLineWidth: 1,
			iLineHeight: 2,
			iCharWidth: 8,
			iCharHeight: 16
		},
		{ // mode 3
			iPens: 16, // mode 3 not available on a real CPC
			iLineWidth: 1,
			iLineHeight: 1,
			iCharWidth: 8,
			iCharHeight: 8
		}
	],

	init: function (options) {
		var iBorderWidth = 4,
			iWidth, iHeight, canvas, ctx, dataset;

		this.options = Object.assign({}, options);

		this.fnUpdateCancasHandler = this.updateCanvas.bind(this);

		this.cpcAreaBox = document.getElementById("cpcAreaBox");

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
		canvas.style.borderWidth = iBorderWidth + "px";
		canvas.style.borderStyle = "solid";

		dataset = new ArrayBuffer(iWidth * iHeight);
		if (typeof Uint8Array !== "undefined") { // in modern browsers we have it
			this.dataset8 = new Uint8Array(dataset); // array with pen values
		} else {
			Utils.console.warn("Canvas:init: Uint8Array not available. Using fallback.");
			this.dataset8 = dataset; // fallback
		}

		this.bNeedUpdate = false;
		this.oUpdateRect = {};
		this.initUpdateRect();

		this.aColorValues = this.extractAllColorValues(this.aColors);

		this.aCurrentInks = [];
		this.aSpeedInk = [];
		this.reset();

		this.animationTimeout = null;
		this.animationFrame = null;

		if (this.canvas.getContext) {
			ctx = this.canvas.getContext("2d");
			this.imageData = ctx.getImageData(0, 0, iWidth, iHeight);
		} else {
			Utils.console.error("Error: canvas.getContext is not supported.");
			this.imageData = null;
		}
	},

	reset: function () {
		this.iMode = 1;
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
		var iFps = 15,
			that = this;

		this.animationTimeout = setTimeout(function () {
			that.animationFrame = requestAnimationFrame(that.fnUpdateCancasHandler);
			if (that.bNeedUpdate) { // could be improved: update only updateRect
				that.bNeedUpdate = false;
				that.initUpdateRect();
				that.copy2Canvas8bit(); // full update
			}
		}, 1000 / iFps);
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
			iWidth = this.iWidth,
			iHeight = this.iHeight,
			buf8 = this.imageData.data, // use Uint8ClampedArray from canvas
			aCurrentInksInSet = this.aCurrentInks[this.iInkSet],
			aColorValues = this.aColorValues,
			dataset8 = this.dataset8,
			x, y, i, aColor;

		for (y = 0; y < iHeight; y += 1) {
			for (x = 0; x < iWidth; x += 1) {
				i = y * iWidth + x;
				aColor = aColorValues[aCurrentInksInSet[dataset8[i]]];
				i *= 4;
				buf8[i] = aColor[0]; // r
				buf8[i + 1] = aColor[1]; // g
				buf8[i + 2] = aColor[2]; // b
				buf8[i + 3] = 255; // a
			}
		}
		ctx.putImageData(this.imageData, 0, 0);
	},

	updateSpeedInk: function () {
		var iPens = this.aModeData[this.iMode].iPens,
			iCurrentInkSet, iNewInkSet, i;

		this.iSpeedInkCount -= 1;
		if (this.iSpeedInkCount <= 0) {
			iCurrentInkSet = this.iInkSet;
			iNewInkSet = iCurrentInkSet ^ 1; // eslint-disable-line no-bitwise
			this.iInkSet = iNewInkSet;
			this.iSpeedInkCount = this.aSpeedInk[iNewInkSet];

			if (!this.bNeedUpdate) { // update not needed, yet => check for blinking inks which pens are visible in the current mode
				for (i = 0; i < iPens; i += 1) {
					if (this.aCurrentInks[iNewInkSet][i] !== this.aCurrentInks[iCurrentInkSet][i]) {
						this.bNeedUpdate = true;
						break;
					}
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
		this.setGPen(this.iGPen);
	},

	setFocusOnCanvas: function () {
		this.cpcAreaBox.style.background = "#463c3c";
		this.canvas.focus();
		this.bHasFocus = true;
	},

	onCpcCanvasClick: function (event) {
		this.setFocusOnCanvas();
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

	invertChar: function (x, y, iPen, iPaper) {
		var iCharWidth = this.aModeData[this.iMode].iCharWidth,
			iCharHeight = this.aModeData[this.iMode].iCharHeight,
			iScaleWidth = iCharWidth / 8,
			iScaleHeight = iCharHeight / 8,
			iPenXorPaper = iPen ^ iPaper, // eslint-disable-line no-bitwise
			iGColMode = 0,
			row, col, iTestPen;

		for (row = 0; row < 8; row += 1) {
			for (col = 0; col < 8; col += 1) {
				iTestPen = this.testSubPixel(x + col * iScaleWidth, y + row * iScaleHeight);
				iTestPen ^= iPenXorPaper; // eslint-disable-line no-bitwise
				this.setSubPixels(x + col * iScaleWidth, y + row * iScaleHeight, iTestPen, iGColMode);
			}
		}
	},

	setChar: function (iChar, x, y, iPen, iPaper, bTransparent, iGColMode, bTextAtGraphics) {
		var aCharData = this.oCustomCharset[iChar] || this.aCharset[iChar],
			iCharWidth = this.aModeData[this.iMode].iCharWidth,
			iCharHeight = this.aModeData[this.iMode].iCharHeight,
			iScaleWidth = iCharWidth / 8,
			iScaleHeight = iCharHeight / 8,
			iBit, iPenOrPaper,
			iCharData, row, col;

		for (row = 0; row < 8; row += 1) {
			for (col = 0; col < 8; col += 1) {
				iCharData = aCharData[row];
				iBit = iCharData & (0x80 >> col); // eslint-disable-line no-bitwise
				if (!(bTransparent && !iBit)) { // do not set background pixel in transparent mode
					iPenOrPaper = (iBit) ? iPen : iPaper;
					if (bTextAtGraphics) {
						this.setPixel(x + col * iScaleWidth, y - row * iScaleHeight, iPenOrPaper, iGColMode);
					} else { // text mode
						this.setSubPixels(x + col * iScaleWidth, y + row * iScaleHeight, iPenOrPaper, iGColMode); // iColMode always 0 in text mode
					}
				}
			}
		}
	},

	readCharData: function (x, y, iExpectedPen) {
		var aCharData = [],
			iCharWidth = this.aModeData[this.iMode].iCharWidth,
			iCharHeight = this.aModeData[this.iMode].iCharHeight,
			iScaleWidth = iCharWidth / 8,
			iScaleHeight = iCharHeight / 8,
			iPen, iCharData, row, col;

		for (row = 0; row < 8; row += 1) {
			iCharData = 0;
			for (col = 0; col < 8; col += 1) {
				iPen = this.testSubPixel(x + col * iScaleWidth, y + row * iScaleHeight);
				if (iPen === iExpectedPen) {
					iCharData |= (0x80 >> col); // eslint-disable-line no-bitwise
				}
			}
			aCharData[row] = iCharData;
		}
		return aCharData;
	},

	setSubPixels: function (x, y, iGPen, iGColMode) {
		var iLineWidth = this.aModeData[this.iMode].iLineWidth,
			iLineHeight = this.aModeData[this.iMode].iLineHeight,
			iWidth = this.iWidth,
			row, col, i;

		/* eslint-disable no-bitwise */
		x &= ~(iLineWidth - 1); // match CPC pixel
		y &= ~(iLineHeight - 1);

		for (row = 0; row < iLineHeight; row += 1) {
			i = x + iWidth * (y + row);
			for (col = 0; col < iLineWidth; col += 1) {
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
		var //iLineWidth = this.aModeData[this.iMode].iLineWidth,
			//iLineHeight = this.aModeData[this.iMode].iLineHeight,
			i, iPen;

		x += this.xOrig;
		y = this.iHeight - 1 - (y + this.yOrig);
		if (x < this.xLeft || x > this.xRight || y < (this.iHeight - 1 - this.yTop) || y > (this.iHeight - 1 - this.yBottom)) {
			return this.iGPaper; // not in graphics window => return graphics paper
		}

		//TTT: we can use it or not
		/* eslint-disable no-bitwise */
		//x &= ~(iLineWidth - 1); // match CPC pixel
		//y &= ~(iLineHeight - 1);
		/* eslint-enable no-bitwise */

		i = x + this.iWidth * y;
		iPen = this.dataset8[i];

		return iPen;
	},

	getByte: function (iAddr) {
		var iMode = this.iMode,
			iLineWidth = this.aModeData[this.iMode].iLineWidth,
			iLineHeight = this.aModeData[this.iMode].iLineHeight,
			iByte = null, // null=cannot read
			x, y, iGPen, i;

		/* eslint-disable no-bitwise */

		x = ((iAddr & 0x7ff) % 80) * 8;
		y = (((iAddr & 0x3800) / 0x800) + (((iAddr & 0x7ff) / 80) | 0) * 8) * iLineHeight;

		if (y < this.iHeight) { // only if in visible range
			if (iMode === 0) {
				iGPen = this.dataset8[x + this.iWidth * y];
				iByte = ((iGPen >> 2) & 0x02) | ((iGPen << 3) & 0x20) | ((iGPen << 2) & 0x08) | ((iGPen << 7) & 0x80); // b1,b5,b3,b7 (left pixel)

				iGPen = this.dataset8[x + iLineWidth + this.iWidth * y];
				iByte |= ((iGPen >> 3) & 0x01) | ((iGPen << 2) & 0x10) | ((iGPen << 1) & 0x04) | ((iGPen << 6) & 0x40); // b0,b4,b2,b6 (right pixel)
			} else if (iMode === 1) {
				iByte = 0;
				iGPen = this.dataset8[x + this.iWidth * y];
				iByte |= ((iGPen & 0x02) << 2) | ((iGPen & 0x01) << 7); // b3,b7 (left pixel 1)
				iGPen = this.dataset8[x + iLineWidth + this.iWidth * y];
				iByte |= ((iGPen & 0x02) << 1) | ((iGPen & 0x01) << 6); // b2,b6 (pixel 2)
				iGPen = this.dataset8[x + iLineWidth * 2 + this.iWidth * y];
				iByte |= ((iGPen & 0x02) << 0) | ((iGPen & 0x01) << 5); // b1,b5 (pixel 3)
				iGPen = this.dataset8[x + iLineWidth * 3 + this.iWidth * y];
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
			iLineWidth = this.aModeData[this.iMode].iLineWidth,
			iLineHeight = this.aModeData[this.iMode].iLineHeight,
			iGColMode = 0, // always 0
			x, y, iGPen, i;

		/* eslint-disable no-bitwise */
		x = ((iAddr & 0x7ff) % 80) * 8;
		y = (((iAddr & 0x3800) / 0x800) + (((iAddr & 0x7ff) / 80) | 0) * 8) * iLineHeight;

		if (y < this.iHeight) { // only if in visible range
			if (iMode === 0) {
				iGPen = ((iByte << 2) & 0x08) | ((iByte >> 3) & 0x04) | ((iByte >> 2) & 0x02) | ((iByte >> 7) & 0x01); // b1,b5,b3,b7 (left pixel)
				this.setSubPixels(x, y, iGPen, iGColMode);
				iGPen = ((iByte << 3) & 0x08) | ((iByte >> 2) & 0x04) | ((iByte >> 1) & 0x02) | ((iByte >> 6) & 0x01); // b0,b4,b2,b6 (right pixel)
				// (TTT: or shift byte left and do as for left pixel?)
				this.setSubPixels(x + iLineWidth, y, iGPen, iGColMode);
				this.setNeedUpdate(x, y, x + iLineWidth, y);
			} else if (iMode === 1) {
				iGPen = ((iByte >> 2) & 0x02) | ((iByte >> 7) & 0x01); // b3,b7 (left pixel 1)
				this.setSubPixels(x, y, iGPen, iGColMode);
				iGPen = ((iByte >> 1) & 0x02) | ((iByte >> 6) & 0x01); // b2,b6 (pixel 2)
				this.setSubPixels(x + iLineWidth, y, iGPen, iGColMode);
				iGPen = ((iByte >> 0) & 0x02) | ((iByte >> 5) & 0x01); // b1,b5 (pixel 3)
				this.setSubPixels(x + iLineWidth * 2, y, iGPen, iGColMode);
				iGPen = ((iByte << 1) & 0x02) | ((iByte >> 4) & 0x01); // b0,b4 (right pixel 4)
				this.setSubPixels(x + iLineWidth * 3, y, iGPen, iGColMode);
				this.setNeedUpdate(x, y, x + iLineWidth * 3, y);
			} else if (iMode === 2) {
				for (i = 0; i <= 7; i += 1) {
					iGPen = (iByte >> (7 - i)) & 0x01;
					this.setSubPixels(x + i * iLineWidth, y, iGPen, iGColMode);
				}
				this.setNeedUpdate(x, y, x + iLineWidth * 7, y);
			} else { // iMode === 3
			}
		}
		/* eslint-enable no-bitwise */
	},

	// https://de.wikipedia.org/wiki/Bresenham-Algorithmus
	drawBresenhamLine: function (xstart, ystart, xend, yend) {
		var iLineWidth = this.aModeData[this.iMode].iLineWidth,
			iLineHeight = this.aModeData[this.iMode].iLineHeight,
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
			xend |= (iLineWidth - 1); // match CPC pixel
		} else { // line from right to left
			xstart |= (iLineWidth - 1);
		}

		if (yend >= ystart) { // line from bottom to top
			yend |= (iLineHeight - 1);
		} else { // line from top to bottom
			ystart |= (iLineHeight - 1);
		}

		dx = ((xend - xstart) / iLineWidth) | 0;
		dy = ((yend - ystart) / iLineHeight) | 0;
		/* eslint-enable no-bitwise */

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
		this.setNeedUpdate(xStart, yStart, this.xPos, this.yPos);
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
		this.setPixel(this.xPos, this.yPos, this.iGPen, this.iGColMode); // use rounded values from move
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
			this.setNeedUpdate(0, 0, this.iHeight, this.iWidth); // we need to notify that an update is needed
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
		iGPen %= this.aModeData[this.iMode].iPens; // limit pens
		this.iGPen = iGPen;
	},

	setGPaper: function (iGPaper) {
		iGPaper %= this.aModeData[this.iMode].iPens; // limit pens
		this.iGPaper = iGPaper;
	},

	setGTransparentMode: function (bTransparent) {
		this.bGTransparent = bTransparent;
	},

	printGChar: function (iChar) {
		if (iChar >= this.aCharset.length) {
			Utils.console.warn("printGChar: Ignoring char with code", iChar);
			return;
		}

		this.setChar(iChar, this.xPos, this.yPos, this.iGPen, this.iGPaper, this.bGTransparent, this.iGColMode, true);
		this.xPos += this.aModeData[this.iMode].iCharWidth;
		this.setNeedUpdate(this.xPos, this.yPos, this.xPos + this.aModeData[this.iMode].iCharWidth, this.yPos + this.aModeData[this.iMode].iCharHeight);
	},

	printChar: function (iChar, x, y, iPen, iPaper, bTransparent) {
		var oModeData = this.aModeData[this.iMode];

		if (iChar >= this.aCharset.length) {
			Utils.console.warn("printChar: Ignoring char with code", iChar);
			return;
		}

		iPen %= oModeData.iPens;
		iPaper %= oModeData.iPens; // also pens

		x *= oModeData.iCharWidth;
		y *= oModeData.iCharHeight;

		this.setChar(iChar, x, y, iPen, iPaper, bTransparent, 0, false);
		this.setNeedUpdate(x, this.iHeight - 1 - y, x + oModeData.iCharWidth, this.iHeight - 1 - (y + oModeData.iCharHeight));
	},

	drawCursor: function (x, y, iPen, iPaper) {
		var oModeData = this.aModeData[this.iMode];

		iPen %= oModeData.iPens;
		iPaper %= oModeData.iPens; // also pens

		x *= oModeData.iCharWidth;
		y *= oModeData.iCharHeight;
		this.invertChar(x, y, iPen, iPaper);
		this.setNeedUpdate(x, this.iHeight - 1 - y, x + oModeData.iCharWidth, this.iHeight - 1 - (y + oModeData.iCharHeight));
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
		var oModeData = this.aModeData[this.iMode],
			iChar, iChar2, aCharData, i;

		iPen %= oModeData.iPens;
		iPaper %= oModeData.iPens; // also pens

		x *= oModeData.iCharWidth;
		y *= oModeData.iCharHeight;

		aCharData = this.readCharData(x, y, iPen);
		iChar = this.findMatchingChar(aCharData);
		if (iChar < 0 || iChar === 32) { // no match? => check inverse with paper TTT =32?
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
			iLineWidth = this.aModeData[this.iMode].iLineWidth,
			iLineHeight = this.aModeData[this.iMode].iLineHeight,
			aPixels = [],
			oPixel, x1, y1, bSpanLeft, bSpanRight, p1, p2, p3,
			fnIsStopPen = function (p) {
				return p === iFill || p === iGPen;
			},
			fnIsNotInWindow = function (x, y) {
				return (x < that.xLeft || x > that.xRight || y < (that.iHeight - 1 - that.yTop) || y > (that.iHeight - 1 - that.yBottom));
			};

		iFill %= this.aModeData[this.iMode].iPens; // limit pens

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
				y1 -= iLineHeight;
				p1 = this.testSubPixel(oPixel.x, y1);
			}
			y1 += iLineHeight;

			bSpanLeft = false;
			bSpanRight = false;
			p1 = this.testSubPixel(oPixel.x, y1);
			while (y1 <= (that.iHeight - 1 - that.yBottom) && !fnIsStopPen(p1)) {
				this.setSubPixels(oPixel.x, y1, iFill, 0);

				x1 = oPixel.x - iLineWidth;
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

				x1 = oPixel.x + iLineWidth;
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
				y1 += iLineHeight;
				p1 = this.testSubPixel(oPixel.x, y1);
			}
		}
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
		var iLineWidth = this.aModeData[this.iMode].iLineWidth,
			iLineHeight = this.aModeData[this.iMode].iLineHeight;

		//TTT
		/* eslint-disable no-bitwise */
		xOrig &= ~(iLineWidth - 1);
		// no? yOrig |= (iLineHeight - 1);
		/* eslint-enable no-bitwise */

		this.xOrig = xOrig; // must be integer
		this.yOrig = yOrig;
		this.move(0, 0);
	},

	setGWindow: function (xLeft, xRight, yTop, yBottom) {
		var iLineWidth = 8, // force byte boundaries: always 8 x/byte
			iLineHeight = this.aModeData[this.iMode].iLineHeight, // usually 2, anly for mode 3 we have 1
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
		//xLeft -= xLeft % 8; // and F8 => "begin of CPC screen byte"
		//xRight -= xRight % 8 - 7; // or 07 => "end of CPC screen byte"

		/* eslint-disable no-bitwise */
		xLeft &= ~(iLineWidth - 1);
		xRight |= (iLineWidth - 1);

		yTop |= (iLineHeight - 1); // we know: top is larger than bottom
		yBottom &= ~(iLineHeight - 1);
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
	},

	clearGraphicsWindow: function () { // clear graphics window with graphics paper
		this.fillMyRect(this.xLeft, this.iHeight - 1 - this.yTop, this.xRight + 1 - this.xLeft, this.yTop + 1 - this.yBottom, this.iGPaper); // +1 or not?
		this.move(0, 0);
		this.setNeedUpdate(this.xLeft, this.yBottom, this.xRight - this.xLeft, this.yTop - this.yBottom);
	},

	clearFullWindow: function () { // clear full window with paper 0 (SCR MODE CLEAR)
		var iPaper = 0;

		this.fillMyRect(0, 0, this.iWidth, this.iHeight, iPaper);
		this.setNeedUpdate(0, 0, this.iWidth, this.iHeight);
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

	setSpeedInk: function (iTime1, iTime2) { // default: 10,10
		this.aSpeedInk[0] = iTime1;
		this.aSpeedInk[1] = iTime2;
	},

	changeMode: function (iMode) {
		this.iMode = iMode;
	},

	setMode: function (iMode) { // set mode without clear screen
		this.iMode = iMode;
		this.setOrigin(0, 0);
		this.setGWindow(0, this.iWidth - 1, this.iHeight - 1, 0);
		this.setGColMode(0);
		this.setGPen(this.iGPen); // keep, but maybe different for other mode
		this.setGPaper(this.iGPaper); // keep, maybe different for other mode
		this.setGTransparentMode(false);
	}
};
