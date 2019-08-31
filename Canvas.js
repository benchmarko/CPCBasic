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

	aDefaultInks: [ // mode 0,1,2: ink 0-15
		[1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, "1,24", "16,11"], // eslint-disable-line array-element-newline
		[1, 24, 20, 6, 1, 24, 20, 6, 1, 24, 20, 6, 1, 24, 20, 6], // eslint-disable-line array-element-newline
		[1, 24, 1, 24, 1, 24, 1, 24, 1, 24, 1, 24, 1, 24, 1, 24] // eslint-disable-line array-element-newline
	],

	aCurrentInks: [],

	init: function (options) {
		var iBorder = 2,
			iWidth, iHeight, canvas, ctx;

		this.options = Object.assign({
			//markerStyle: "green",
			//textStyle: "black",
			//backgroundStyle: "#E6E6E6",
			//zoom: 0 // not used
		}, options);

		/*
		this.oPixelMap = {
			width: iWidth,
			height: iHeight
		};
		*/

		this.aKeyBuffer = [];

		this.aPath = [];
		this.iPath = 0;

		this.xPos = 0;
		this.yPos = 0;

		this.iMode = 1;

		this.iFgColor = 24;
		this.iBgColor = 1;

		canvas = document.getElementById("cpcCanvas");
		//iWidth = 640; // canvas.width;
		//iHeight = 400; // canvas.height;

		//sCpcDivId = this.options.cpcDivId;
		//oView = this.options.view;
		//cpcDiv = document.getElementById(sCpcDivId);

		//bHidden = oView.getHidden(sCpcDivId);
		//oView.setHidden(sCpcDivId, false);

		// make sure canvas is not hidden (allows to get width, height, set style)
		iWidth = canvas.width; // cpcDiv.clientWidth;
		iHeight = canvas.height; // cpcDiv.clientHeight;
		canvas.style.borderWidth = iBorder + "px";
		canvas.style.borderColor = "#888888"; //TTT
		canvas.style.borderStyle = "solid";

		//oView.setHidden(sCpcDivId, bHidden); // restore hidden
		//Utils.console.log("CpcCanvas: width=" + iWidth + " height=" + iHeight + " created");

		/*
		if (!canvas) {
			sCpcDivId = this.options.cpcDivId;
			oView = this.options.view;
			cpcDiv = document.getElementById(sCpcDivId);

			bHidden = oView.getHidden(sCpcDivId);
			oView.setHidden(sCpcDivId, false); // make sure canvas is not hidden (allows to get width, height)
			iWidth = cpcDiv.clientWidth;
			iHeight = cpcDiv.clientHeight;
			oView.setHidden(sCpcDivId, bHidden); // restore hidden
			Utils.console.log("CpcCanvas: width=" + iWidth + " height=" + iHeight + " created");

			canvas = document.createElement("CANVAS");
			canvas.style.borderWidth = iBorder + "px";
			canvas.style.borderColor = "#888888"; //TTT
			canvas.style.borderStyle = "solid";
			canvas.width = iWidth - iBorder * 2;
			canvas.height = iHeight - iBorder * 2;
			canvas.id = "cpcCanvas1";
			canvas.style.position = "absolute";
			canvas.style.opacity = 1;
			cpcDiv.appendChild(canvas);
		} else {
			iWidth = canvas.width;
			iHeight = canvas.height;
		}
		*/

		this.canvas = canvas;
		canvas.style.backgroundColor = this.aColors[this.iBgColor];

		this.iWidth = iWidth;
		this.iHeight = iHeight;

		ctx = canvas.getContext("2d");
		ctx.strokeStyle = this.aColors[this.iFgColor];
		//ctx.lineWidth = 1;

		// get Cartesian coordinate system with the origin in the bottom left corner (moved by 1 pixel to the right)
		ctx.translate(1, iHeight);
		ctx.scale(1, -1);

		/*
		// test
		o = 0.5;
		ctx.beginPath();
		ctx.moveTo(o, o);
		ctx.lineTo(iWidth - o, o);
		ctx.lineTo(iWidth - o, iHeight - o);
		ctx.lineTo(o, iHeight - o);
		ctx.lineTo(o, o);
		ctx.stroke();
		*/

		if (this.options.onload) {
			this.options.onload(this);
		}
		canvas.addEventListener("click", this.onCpcCanvasClick.bind(this), false);
		window.addEventListener("keydown", this.onWindowKeydown.bind(this), false);
		window.addEventListener("resize", this.fnDebounce(this.resize.bind(this), 200, false), false);
		window.addEventListener("click", this.onWindowClick.bind(this), false);
	},

	onCpcCanvasClick: function (event) {
		var oTarget = event.target,
			canvas = oTarget;

		canvas.style.borderColor = "#008800"; //TTT
		canvas.focus();
		this.bHasFocus = true;
		event.stopPropagation();
	},

	onWindowClick: function (event) {
		this.bHasFocus = false;
		this.canvas.style.borderColor = "#888888"; //TTT
	},

	fnCanvasKeydown: function (event) {
		var mSpecialChars = {
			37: 75, // left
			38: 72, // up
			39: 77, // right
			40: 80 // down
		};

		if (Utils.debug > 0) {
			// https://www.w3schools.com/jsref/obj_keyboardevent.asp
			Utils.console.log("fnCanvasKeydown: keyCode=" + event.keyCode, event);
		}

		if (event.keyCode in mSpecialChars) {
			this.aKeyBuffer.push(0);
			this.aKeyBuffer.push(mSpecialChars[event.keyCode]);
		} else {
			this.aKeyBuffer.push(event.keyCode);
		}
		if (this.options.fnOnKeyDown) {
			this.options.fnOnKeyDown(this.aKeyBuffer);
		}
	},

	getKeyFromBuffer: function () {
		var iKeyCode;

		if (this.aKeyBuffer.length) {
			iKeyCode = this.aKeyBuffer.shift();
		} else {
			iKeyCode = -1;
		}
		return iKeyCode;
	},

	clearInput: function () {
		this.aKeyBuffer.length = 0;
	},

	onWindowKeydown: function (event) {
		if (this.bHasFocus) {
			//Utils.console.log("onWindowKeydown: event=", event);
			this.fnCanvasKeydown(event);
			event.preventDefault();
			return false;
		}
		return undefined;
	},
	fnDebounce: function (func, wait, immediate) {
		var timeout,
			that = this;

		return function () {
			var args = arguments,
				later = function () {
					timeout = null;
					if (!immediate) {
						func.apply(that, args);
					}
				},
				callNow = immediate && !timeout;

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) {
				func.apply(that, args);
			}
		};
	},
	resize: function () {
		var sCpcDivId = this.options.cpcDivId,
			oView = this.options.view,
			bHidden = oView.getHidden(sCpcDivId),
			cpcDiv, iWidth, iHeight, i, canvas;

		if (bHidden) {
			return; // canvas is hidden
		}
		cpcDiv = document.getElementById(sCpcDivId);
		iWidth = cpcDiv.clientWidth;
		iHeight = cpcDiv.clientHeight;
		if (iWidth !== this.iWidth || iHeight !== this.iHeight) {
			Utils.console.log("Canvas.resize width=" + iWidth + " height=" + iHeight);
			canvas = this.canvas;
			if (canvas.width !== iWidth) { //TTT
				//this.iWidth = iWidth;
				//canvas.width = iWidth;
			}
			if (canvas.height !== iHeight) {
				//this.iHeight = iHeight;
				//canvas.height = iHeight;
			}
		}
	},
	setZoom: function (zoom) {
		this.zoom = zoom;
	},
	setCenter: function (/* position */) {
		// currently empty
	},

	getXpos: function () {
		return this.xPos;
	},

	getYpos: function () {
		return this.yPos;
	},


	privDrawPath: function (path, iStart, bRemove) {
		var ctx, i, oPos,
			canvas = this.canvas;

		if (path.length) {
			ctx = canvas.getContext("2d");

			if (!bRemove) {
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
						ctx.moveTo(this.xPos, this.yPos); // current position
						this.xPos = oPos.x;
						this.yPos = oPos.y;
						if (oPos.t === "m" || oPos.t === "t") {
							ctx.moveTo(this.xPos + 0.5, this.yPos + 0.5);
						} else if (oPos.t === "l") {
							ctx.lineTo(this.xPos + 0.5, this.yPos + 0.5);
						} else { // "p"?
							ctx.moveTo(this.xPos - 1 + 0.5, this.yPos - 1 + 0.5); //TTT
							ctx.lineTo(this.xPos + 0.5, this.yPos + 0.5);
						}
					}
				}
				ctx.stroke();
			} else {
				ctx.clearRect(0, 0, canvas.width, canvas.height); // we simply clear all
			}
		}
	},

	testPixel: function (xPos, yPos) {
		var ctx = this.canvas.getContext("2d"),
			imageData, pixelData, iRed, iGreen, iBlue, iColor;

		imageData = ctx.getImageData(xPos + 0.5, this.iHeight - (yPos + 0.5), 1, 1);
		pixelData = imageData.data;
		iRed = pixelData[0];
		iGreen = pixelData[1];
		iBlue = pixelData[2];
		iColor = iRed * 65536 + iGreen * 256 + iBlue;
		//sColor = "#" + Number(iColor).toString(16);
		return iColor;
	},

	clearPath: function () {
		this.aPath.length = 0;
		this.iPath = 0;
	},

	addPath: function (path) {
		var iColor, iTmp,
			sColor = 0;

		this.aPath.push(path);

		if (path.t !== "m") {
			this.privDrawPath(this.aPath, this.iPath); // draw new element
			this.iPath = this.aPath.length;
			if (path.t === "t") {
				iColor = this.testPixel(this.xPos, this.yPos);
				sColor = "#" + Number(iColor).toString(16).toUpperCase(); //TTT
				iTmp = this.aColors.indexOf(sColor);
				if (iTmp >= 0) {
					iColor = this.aCurrentInks.indexOf(iTmp);
				}
			}
		}
		return iColor; // should return pen
	},

	cls: function () {
		var canvas = this.canvas,
			ctx = canvas.getContext("2d");

		this.clearPath();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	},

	mode: function (iMode) {
		var ctx = this.canvas.getContext("2d"),
			mLineWidth = [
				4,
				2,
				1
			];

		this.cls();
		this.iMode = iMode;
		this.aCurrentInks = this.aDefaultInks[iMode].slice();
		this.xPos = 0;
		this.yPos = 0;

		ctx.lineWidth = mLineWidth[iMode];
	}
};
