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

	/*
	aDefaultInks: [ // mode 0,1,2: pen 0-15
		[1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, "1,24", "16,11"], // eslint-disable-line array-element-newline
		[1, 24, 20, 6, 1, 24, 20, 6, 1, 24, 20, 6, 1, 24, 20, 6], // eslint-disable-line array-element-newline
		[1, 24, 1, 24, 1, 24, 1, 24, 1, 24, 1, 24, 1, 24, 1, 24] // eslint-disable-line array-element-newline
	],
	*/

	// mode 0: pen 0-15
	//aDefaultInks: [1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, "1,24", "16,11"], // eslint-disable-line array-element-newline
	aDefaultInks: [1, 24, 20, 6, 26, 0, 2, 8, 10, 12, 14, 16, 18, 22, 1, 16], // eslint-disable-line array-element-newline

	// limit inks (pens)
	aInksPerModeLimit: [
		16,
		4,
		2
	],

	/*
	mCpcKey2KeyCode: {
		0: 38, // cursor up
		1: 39, // cursor right
		2: 40, // cursor down
		3: 105, // numpad f9
		4: 102, // numpad f6
		5: 99, // numpad f3
		6: 0, // numpad enter
		7: 0, // numpad .
		8: 37, // cursor left
		47: 32 // space
	},
	*/

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
		44: "72KeyH", //TTT check!
		45: "74KeyJ", //TTT check!
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

	aJoyKeyCodes: [
		[72, 73, 74, 75, 76, 77], // eslint-disable-line array-element-newline
		[48, 49, 50, 51, 52, 53] // eslint-disable-line array-element-newline
	],

	/*
	mKey2CpcKey: {
		"38ArrowUp": 0, // cursor up
		"39ArrowRight": 1, // cursor right
		"40ArrowDown": 2, // cursor down
		"105Numpad9": 3, // numpad f9
		"102Numpad6": 4, // numpad f6
		"99Numpad3": 5, // numpad f3
	...	},
	*/

	init: function (options) {
		var iBorder = 2,
			iWidth, iHeight, canvas, ctx;

		this.options = Object.assign({}, options);

		this.oPressedKeys = {};
		this.aKeyBuffer = [];

		this.aPath = [];
		this.iPath = 0;

		this.iMode = 1;

		this.aCurrentInks = this.aDefaultInks.slice();

		//this.iFgInk = 24;
		//this.iBgInk = 1;

		this.xPos = 0;
		this.yPos = 0;
		this.xOrig = 0;
		this.yOrig = 0;

		this.iGPen = 1;
		this.iGPaper = 0;

		this.iMask = 0;

		this.bClipped = false;

		canvas = document.getElementById("cpcCanvas");

		// make sure canvas is not hidden (allows to get width, height, set style)
		iWidth = canvas.width;
		iHeight = canvas.height;
		canvas.style.borderWidth = iBorder + "px";
		canvas.style.borderColor = "#888888"; //TTT inactive border
		canvas.style.borderStyle = "solid";
		canvas.style.backgroundColor = this.aColors[this.aCurrentInks[this.iGPaper]];
		this.canvas = canvas;

		this.iWidth = iWidth;
		this.iHeight = iHeight;

		ctx = canvas.getContext("2d");
		ctx.strokeStyle = this.aColors[this.aCurrentInks[this.iGPen]];
		//ctx.lineWidth = 1;

		// get Cartesian coordinate system with the origin in the bottom left corner (moved by 1 pixel to the right)
		ctx.translate(1 + this.xOrig, iHeight + this.yOrig);
		ctx.scale(1, -1);

		if (this.options.onload) {
			this.options.onload(this);
		}
		canvas.addEventListener("click", this.onCpcCanvasClick.bind(this), false);
		window.addEventListener("keydown", this.onWindowKeydown.bind(this), false);
		window.addEventListener("keyup", this.onWindowKeyup.bind(this), false);
		window.addEventListener("resize", this.fnDebounce(this.resize.bind(this), 200, false), false);
		window.addEventListener("click", this.onWindowClick.bind(this), false);

		//this.testCanvas1();
	},


	testCanvas1: function () {
		var ctx = this.canvas.getContext("2d"),
			img;

		img = new Image();
		img.onload = function () {
    		ctx.drawImage(img, 0, 0);
		};
		img.src = "img/md2x.png";

		//test
		/*
		ctx.fillStyle = "white";
		ctx.font = "8px Monospace";
		for (var y = 0; y < 400; y += 8) {
			for (var x = 0; x < 640; x += 8) {
				ctx.fillText("W", x, y);
			}
		}
		ctx.fillText("World!", 10, 50);
		*/
	},

	setDefaultInks: function () {
		this.aCurrentInks = this.aDefaultInks.slice();
		this.setGPen(this.iGPen); // set stroke color
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
		if (this.bHasFocus) {
			this.bHasFocus = false;
			this.canvas.style.borderColor = "#888888"; //TTT
		}
	},

	fnCanvasKeydown: function (event) {
		var mSpecialChars = {
				37: 75, // left
				38: 72, // up
				39: 77, // right
				40: 80 // down
			},
			iKeyCode = event.which || event.keyCode,
			sPressedKey = iKeyCode + event.code;

		this.oPressedKeys[sPressedKey] = 0 + (event.shiftKey ? 32 : 0) + (event.ctrlKey ? 128 : 0);
		if (Utils.debug > 1) {
			// https://www.w3schools.com/jsref/obj_keyboardevent.asp
			Utils.console.log("fnCanvasKeydown: keyCode=" + iKeyCode + " pressedKey=" + sPressedKey, event);
		}


		if (iKeyCode in mSpecialChars) {
			this.aKeyBuffer.push(0);
			this.aKeyBuffer.push(mSpecialChars[iKeyCode]);
		} else {
			this.aKeyBuffer.push(iKeyCode);
		}

		if (this.options.fnOnKeyDown) { // special handler?
			this.options.fnOnKeyDown(this.aKeyBuffer);
		}
	},

	fnCanvasKeyup: function (event) {
		var iKeyCode = event.which || event.keyCode,
			sPressedKey = iKeyCode + event.code;

		if (Utils.debug > 1) {
			// https://www.w3schools.com/jsref/obj_keyboardevent.asp
			Utils.console.log("fnCanvasKeyup: keyCode=" + iKeyCode + " pressedKey=" + sPressedKey, event);
		}
		delete this.oPressedKeys[sPressedKey];
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

	/*
	getKeyState: function (iCpcKey) {
		var iState = -1;

		if (iCpcKey in this.oPressedKeys) {
			iState = this.oPressedKeys[iCpcKey];
		}
		return iState;
	},
	*/

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

	resize: function () { // not used, yet
		var sCpcDivId = this.options.cpcDivId,
			oView = this.options.view,
			bHidden = oView.getHidden(sCpcDivId),
			cpcDiv, iWidth, iHeight, canvas;

		if (bHidden) {
			return; // canvas is hidden
		}
		cpcDiv = document.getElementById(sCpcDivId);
		iWidth = cpcDiv.clientWidth;
		iHeight = cpcDiv.clientHeight;
		if (iWidth !== this.iWidth || iHeight !== this.iHeight) {
			Utils.console.log("Canvas.resize width=" + iWidth + " height=" + iHeight);
			/*
			canvas = this.canvas;
			if (canvas.width !== iWidth) {
				//this.iWidth = iWidth;
				//canvas.width = iWidth;
			}
			if (canvas.height !== iHeight) {
				//this.iHeight = iHeight;
				//canvas.height = iHeight;
			}
			*/
		}
	},

	getXpos: function () {
		return this.xPos;
	},

	getYpos: function () {
		return this.yPos;
	},


	privDrawPath: function (path, iStart) {
		var ctx, i, oPos,
			canvas = this.canvas;

		if (path.length) { //TTT
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
					ctx.moveTo(this.xPos, this.yPos); // current position
					this.xPos = oPos.x;
					this.yPos = oPos.y;
					if (oPos.t === "m" || oPos.t === "t") {
						ctx.moveTo(this.xPos + 0.5, this.yPos + 0.5); // we use +0.5 to get full opacity and better colors
					} else if (oPos.t === "l") {
						ctx.lineTo(this.xPos + 0.5, this.yPos + 0.5);
					} else { // "p"?
						ctx.moveTo(this.xPos - 1 + 0.5, this.yPos - 1 + 0.5);
						ctx.lineTo(this.xPos + 0.5, this.yPos + 0.5);
					}
				}
			}
			ctx.stroke();
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

		if (path.t !== "m") {
			this.privDrawPath(this.aPath, this.iPath); // draw new element
			this.iPath = this.aPath.length;
			if (path.t === "t") {
				iColor = this.testPixel(this.xPos, this.yPos);
				sColor = "#" + Number(iColor).toString(16).toUpperCase();
				iInk = this.aColors.indexOf(sColor);
				if (iInk >= 0) {
					iGPen = this.aCurrentInks.indexOf(iInk);
				}
			}
		}
		return iGPen;
	},

	setInk: function (iPen, iInk1, iInk2) {
		this.aCurrentInks[iPen] = iInk1; //TODO iInk2
		if (iPen === this.iGPen) {
			this.setGPen(iPen); // set stroke color
		}
	},

	setGPen: function (iGPen) {
		var ctx = this.canvas.getContext("2d");

		iGPen %= this.aInksPerModeLimit[this.iMode]; // limit pens
		this.iGPen = iGPen;
		ctx.strokeStyle = this.aColors[this.aCurrentInks[iGPen]];
	},

	setGPaper: function (iGPaper) {
		this.iGPaper = iGPaper;
		///TTT
	},

	setOrigin: function (xOrig, yOrig) {
		var ctx = this.canvas.getContext("2d");

		ctx.translate(-this.xOrig, -this.yOrig); // restore

		this.xOrig = xOrig;
		this.yOrig = yOrig;
		//ctx.translate(1 + xOrig, this.iHeight + yOrig);
		ctx.translate(xOrig, yOrig);
	},

	removeClipping: function () {
		var ctx = this.canvas.getContext("2d");

		if (this.bClipped) {
			ctx.restore();
			this.bClipped = false;
		}
	},

	setClipping: function (x, y, iWidth, iHeight) { ///TODO restore?...
		var ctx = this.canvas.getContext("2d");

		this.removeClipping();
		this.bClipped = true;
		ctx.save();
		ctx.rect(x, y, iWidth, iHeight);
		ctx.stroke();
		ctx.clip();
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

	cls: function () { // TODO: should clear current window only
		var canvas = this.canvas,
			ctx = canvas.getContext("2d");

		this.clearPath(); //TTT
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	},

	mode: function (iMode) {
		var ctx = this.canvas.getContext("2d"),
			mLineWidth = [
				4,
				2,
				1
			];

		this.removeClipping();

		this.iMode = iMode;
		this.cls();
		//inks are kept! this.aCurrentInks = this.aDefaultInks[iMode].slice();
		this.xPos = 0;
		this.yPos = 0;
		//this.xOrig = 0;
		//this.yOrig = 0;
		this.setOrigin(0, 0);
		this.setMask(0);
		//this.iGPen = 1;
		this.setGPen(1);
		this.iGPaper = 0;

		ctx.lineWidth = mLineWidth[iMode];
	}
};
