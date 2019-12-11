// Canvas.js - Graphics output to HTML canvas
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
/* globals Utils */
/* globals ArrayBuffer Uint8ClampedArray Uint32Array Uint8Array */

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
			iCharWidth: 8 * 2, //  * 2, //TTT TEST
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
			iCharHeight: 8
		}
	],

	init: function (options) {
		var iBorderWidth = 4,
			iWidth, iHeight, canvas, ctx;

		this.options = Object.assign({}, options);

		this.cpcAreaBox = document.getElementById("cpcAreaBox");

		this.aCharset = this.options.aCharset;

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

		this.updateCanvas();
	},

	reset: function () {
		var iPaper = 0;

		this.iMode = 1;
		this.aCurrentInks = this.aDefaultInks.slice();
		this.iGPen = null; // force update
		this.iGPaper = null;
		this.oCustomCharset = {}; // symbol
		this.setGPen(1);
		this.setGPaper(0);
		this.setBorder(this.aDefaultInks[iPaper]);
		this.setMode(1);
		this.clearGraphics(iPaper);
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
			that = this,
			fnCanvasUpdateHandler = this.updateCanvas.bind(this);

		setTimeout(function () {
			requestAnimationFrame(fnCanvasUpdateHandler);
			if (that.bNeedUpdate) { // could be improved: update only updateRect
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
		this.setGPen(this.iGPen);
	},

	setFocusOnCanvas: function () {
		this.cpcAreaBox.style.background = "#463c3c";
		this.canvas.focus();
		this.bHasFocus = true;
	},

	onCpcCanvasClick: function () {
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

	setChar: function (iChar, x, y, iPen, iPaper, iGColMode, bTextAtGraphics) {
		var aCharData = this.oCustomCharset[iChar] || this.aCharset[iChar],
			iCharWidth = this.aModeData[this.iMode].iCharWidth,
			iCharHeight = this.aModeData[this.iMode].iCharHeight,
			iScaleWidth = iCharWidth / 8,
			iScaleHeight = iCharHeight / 8,
			iTransparent = this.iTransparent,
			iBit, iPenOrPaper,
			iCharData, row, col;

		for (row = 0; row < 8; row += 1) {
			for (col = 0; col < 8; col += 1) {
				iCharData = aCharData[row];
				iBit = iCharData & (0x80 >> col); // eslint-disable-line no-bitwise
				if (!(iTransparent && !iBit)) { // do not set background pixel in transparent mode
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

	setSubPixels: function (x, y, iGPen, iGColMode) {
		var iLineWidth = this.aModeData[this.iMode].iLineWidth,
			iLineHeight = this.aModeData[this.iMode].iLineHeight,
			iWidth = this.iWidth,
			row, col, i;

		/* eslint-disable no-bitwise */
		x &= ~(iLineWidth - 1);
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
					Utils.console.warn("setSubPixels: Unknown colMode: " + iGColMode);
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
			iGPen = this.iGPen,
			iGColMode = this.iGColMode,
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
		this.setPixel(x, y, iGPen, iGColMode); // we expect integers

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
			this.setPixel(x, y, iGPen, iGColMode); // we expect integers
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

	setTranspartentMode: function (iTransparent) {
		this.iTransparent = iTransparent;
	},

	printGChar: function (iChar) {
		if (iChar >= this.aCharset.length) {
			Utils.console.warn("printGChar: Ignoring char with code " + iChar);
			return;
		}

		this.setChar(iChar, this.xPos, this.yPos, this.iGPen, this.iGPaper, this.iGColMode, true);
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

		this.setChar(iChar, x, y, iPen, iPaper, 0, false);
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
		this.fillMyRect(this.xLeft, this.iHeight - 1 - this.yTop, this.xRight + 1 - this.xLeft, this.yTop + 1 - this.yBottom, iClgPen); // +1 or not?
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

	setMode: function (iMode) { // cet mode without clear screen
		this.iMode = iMode;
		this.setOrigin(0, 0);
		this.setGWindow(0, this.iWidth - 1, this.iHeight - 1, 0);
		this.setGColMode(0);
		this.setGPen(this.iGPen); // keep, but maybe different for other mode
		this.setGPaper(this.iGPaper); // keep, maybe different for other mode
		this.iTransparent = 0;
	}
};
