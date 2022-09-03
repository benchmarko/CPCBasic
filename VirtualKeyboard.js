// VirtualKeyboard.js - VirtualKeyboard
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasicTS/
//

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

function VirtualKeyboard(options) {
	this.init(options);
}

VirtualKeyboard.prototype = {

	aCpcKey2Key: [
		{
			keys: "38ArrowUp", // 0: cursor up
			key: "ArrowUp",
			text: "\u2191",
			title: "Cursor up"
		},
		{
			keys: "39ArrowRight", // 1: cursor right
			key: "ArrowRight",
			text: "\u2192",
			title: "Cursor right",
			style: 1
		},
		{
			keys: "40ArrowDown", // 2: cursor down
			key: "ArrowDown",
			text: "\u2193",
			title: "Cursor down"
		},
		{
			keys: "105Numpad9,120F9", // 3: numpad f9
			key: "9",
			text: "f9",
			style: 1,
			numLockCpcKey: 81 // joy 0 up+right
		},
		{
			keys: "102Numpad6,117F6", // 4: numpad f6
			key: "6",
			text: "f6",
			style: 1,
			numLockCpcKey: 75 // joy 0 right
		},
		{
			keys: "99Numpad3,114F3", // 5: numpad f3
			key: "3",
			text: "f3",
			style: 1,
			numLockCpcKey: 83 // joy 0 down+right
		},
		{
			keys: "13NumpadEnter", // 6: numpad enter
			key: "Enter",
			style: 4
		},
		{
			keys: "110NumpadDecimal", // 7: numpad .
			key: ".",
			numLockCpcKey: 77 // joy 0 fire 1
		},
		{
			keys: "37ArrowLeft", // 8: cursor left
			key: "ArrowLeft",
			text: "\u2190",
			title: "Cursor left",
			style: 1
		},
		{
			keys: "18AltLeft", // 9: copy
			key: "Alt",
			text: "Copy",
			style: 2
		},
		{
			keys: "103Numpad7,118F7", // 10: numpad f7
			key: "7",
			text: "f7",
			style: 1,
			numLockCpcKey: 80 // joy 0 up+left
		},
		{
			keys: "104Numpad8,119F8", // 11: numpad f8
			key: "8",
			text: "f8",
			style: 1,
			numLockCpcKey: 72 // joy 0 up
		},
		{
			keys: "101Numpad5,116F5", // 12: numpad f5
			key: "5",
			text: "f5",
			style: 1,
			numLockCpcKey: 76 // joy 0 fire 2
		},
		{
			keys: "97Numpad1,112F1", // 13: numpad f1
			key: "1",
			text: "f1",
			style: 1,
			numLockCpcKey: 82 // joy 0 down+left
		},
		{
			keys: "98Numpad2,113F2", // 14: numpad f2
			key: "2",
			text: "f2",
			style: 1,
			numLockCpcKey: 73 // joy 0 down
		},
		{
			keys: "96Numpad0,121F10", // 15: numpad f0
			key: "0",
			text: "f0",
			style: 1
			//numLockCpcKey: 90 // Num lock
		},
		{
			keys: "46Delete", // 16: clr
			key: "Delete",
			text: "Clr",
			title: "Clear",
			style: 1
		},
		{
			keys: "187BracketRight,171BracketRight,221BracketRight", // 17: [ { (Chrome: 187; FF: 171); EN: 221BracketRight
			key: "[",
			keyShift: "{"
		},
		{
			keys: "13Enter", // 18: return
			key: "Enter",
			text: "Ret",
			title: "Return",
			style: 2
		},
		{
			keys: "191Backslash,163Backslash,220Backslash", // 19: ] } => # ' (Chrome: 191; FF: 163); EN: 220Backslash
			key: "]",
			keyShift: "}"
		},
		{
			keys: "100Numpad4,115F4", // 20: numpad f4
			key: "4",
			text: "f4",
			style: 1,
			numLockCpcKey: 74 // joy 0 left
		},
		{
			keys: "16ShiftLeft,16ShiftRight", // 21: shift left, shift right (2 keys!)
			key: "Shift",
			style: 4
		},
		{
			keys: "220Backquote,160Backquote,192Backquote", // 22: \ ` (different location, key!; Chrome: 220; FF: 160); EN: 192Backquote, 226IntlBackslash?
			key: "\\",
			keyShift: "`"
		},
		{
			keys: "17ControlLeft,17ControlRight", // 23: Note: alt-gr also triggers ctrl-left and alt-gr!
			key: "Control",
			text: "Ctrl",
			title: "Control",
			style: 4
		},
		{
			keys: "221Equal,192Equal,187Equal", // 24: ^ £ (pound: \u00A3) (Chrome: 221; FF: 192); EN: 187Equal
			key: "^",
			keyShift: "£"
		},
		{
			keys: "219Minus,63Minus,189Minus", // 25: - = (Chrome: 219; FF: 63); EN: 189Minus
			key: "-",
			keyShift: "="
		},
		{
			keys: "186BracketLeft,59BracketLeft,219BracketLeft", // 26: @ | (Chrome: 168; FF: 59); EN: 219BracketLeft
			key: "@",
			keyShift: "|",
			style: 1
		},
		{
			keys: "80KeyP", // 27: P
			key: "p",
			keyShift: "P"
		},
		{
			keys: "222Quote,192Quote", // 28: ; + (same on Chrome, FF); Android Bluetooth EN: 192Quote
			key: ";",
			keyShift: "+"
		},
		{
			keys: "192Semicolon,186Semicolon", // 29: : * (same on Chrome, FF); EN: 186Semicolon
			key: ":",
			keyShift: "*"
		},
		{
			keys: "189Slash,173Slash,191Slash", // 30: / ? (Chrome: 189; FF: 173); EN: 191Slash
			key: "/",
			keyShift: "?"
		},
		{
			keys: "190Period", // 31: . <
			key: ".",
			keyShift: "<"
		},
		{
			keys: "48Digit0", // 32: 0 _
			key: "0",
			keyShift: "_"
		},
		{
			keys: "57Digit9", // 33: 9 )
			key: "9",
			keyShift: ")"
		},
		{
			keys: "79KeyO", // 34:
			key: "o",
			keyShift: "O"
		},
		{
			keys: "73KeyI", // 35:
			key: "i",
			keyShift: "I"
		},
		{
			keys: "76KeyL", // 36:
			key: "l",
			keyShift: "L"
		},
		{
			keys:
			"75KeyK", // 37:
			key: "k",
			keyShift: "K"
		},
		{
			keys:
			"77KeyM", // 38:
			key: "m",
			keyShift: "M"
		},
		{
			keys:
			"188Comma", // 39: , >
			key: ",",
			keyShift: ">"
		},
		{
			keys:
			"56Digit8", // 40: 8 (
			key: "8",
			keyShift: "("
		},
		{
			keys:
			"55Digit7", // 41: 7 '
			key: "7",
			keyShift: "'"
		},
		{
			keys: "85KeyU", // 42:
			key: "u",
			keyShift: "U"
		},
		{
			keys: "90KeyY,89KeyY", // 43:
			key: "y",
			keyShift: "Y"
		},
		{
			keys: "72KeyH", // 44:
			key: "h",
			keyShift: "H"
		},
		{
			keys: "74KeyJ", // 45:
			key: "j",
			keyShift: "J"
		},
		{
			keys: "78KeyN", // 46:
			key: "n",
			keyShift: "N"
		},
		{
			keys: "32Space", // 47: space
			key: " ",
			text: "Space",
			style: 5
		},
		{
			keys: "54Digit6", // 48: 6 &
			key: "6",
			keyShift: "("
		},
		{
			keys: "53Digit5", // 49: 5 %
			key: "5",
			keyShift: "%"
		},
		{
			keys: "82KeyR", // 50:
			key: "r",
			keyShift: "R"
		},
		{
			keys: "84KeyT", // 51:
			key: "t",
			keyShift: "T"
		},
		{
			keys: "71KeyG", // 52:
			key: "g",
			keyShift: "G"
		},
		{
			keys: "70KeyF", // 53:
			key: "f",
			keyShift: "F"
		},
		{
			keys: "66KeyB", // 54:
			key: "b",
			keyShift: "B"
		},
		{
			keys: "86KeyV", // 55:
			key: "v",
			keyShift: "V"
		},
		{
			keys: "52Digit4", // 56: 4 $
			key: "4",
			keyShift: "$"
		},
		{
			keys: "51Digit3", // 57: 3 #
			key: "3",
			keyShift: "#"
		},
		{
			keys: "69KeyE", // 58:
			key: "e",
			keyShift: "E"
		},
		{
			keys: "87KeyW", // 59:
			key: "w",
			keyShift: "W"
		},
		{
			keys: "83KeyS", // 60:
			key: "s",
			keyShift: "S"
		},
		{
			keys: "68KeyD", // 61:
			key: "d",
			keyShift: "D"
		},
		{
			keys: "67KeyC", // 62:
			key: "c",
			keyShift: "C"
		},
		{
			keys: "88KeyX", // 63:
			key: "x",
			keyShift: "X"
		},
		{
			keys: "49Digit1", // 64: 1 !
			key: "1",
			keyShift: "!"
		},
		{
			keys: "50Digit2", // 65: 2 "
			key: "2",
			keyShift: "\""
		},
		{
			keys: "27Escape", // 66: esc
			key: "Escape",
			text: "Esc",
			title: "Escape",
			style: 1
		},
		{
			keys: "81KeyQ", // 67:
			key: "q",
			keyShift: "Q"
		},
		{
			keys: "9Tab", // 68:
			key: "Tab",
			style: 2
		},
		{
			keys: "65KeyA", // 69:
			key: "a",
			keyShift: "A"
		},
		{
			keys: "20CapsLock", // 70: caps lock
			key: "CapsLock",
			text: "Caps",
			title: "Caps Lock",
			style: 3
		},
		{
			keys: "89KeyZ,90KeyZ", // 71: DE,EN
			key: "z",
			keyShift: "Z"
		},
		{
			keys: "38Numpad8", // 72: joy 0 up (arrow up)
			key: "JoyUp",
			text: "\u21D1",
			title: "Joy up"
		},
		{
			keys: "40Numpad2", // 73: joy 0 down
			key: "JoyDown",
			text: "\u21D3",
			title: "Joy down"
		},
		{
			keys: "37Numpad4", // 74: joy 0 left
			key: "JoyLeft",
			text: "\u21D0",
			title: "Joy left"
		},
		{
			keys: "39Numpad6", // 75: joy 0 right
			key: "JoyRight",
			text: "\u21D2",
			title: "Joy right"
		},
		{
			keys: "12Numpad5,45Numpad0", // 76: joy 0 fire 2 (clear,...)
			key: "X",
			text: "\u29BF",
			title: "Joy fire"
		},
		{
			keys: "46NumpadDecimal", // 77: joy 0 fire 1
			key: "Z",
			text: "\u25E6",
			title: "Joy fire 1"
		},
		{
			keys: null // 78: ""? (joy 0 fire 3?)
		},
		{
			keys: "8Backspace", // 79: del
			key: "Backspace", // 79: del
			text: "Del",
			title: "Delete",
			style: 1
		},
		// starting with 80, not on CPC
		// not on CPC:
		{
			keys: "36Numpad7", // 80: joy 0 up+left
			key: "",
			text: "\u21D6",
			title: "Joy up+left"
		},
		{
			keys: "33Numpad9", // 81: joy 0 up+right
			key: "",
			text: "\u21D7",
			title: "Joy up+right"
		},
		{
			keys: "35Numpad1", // 82: joy 0 down+left
			key: "",
			text: "\u21D9",
			title: "Joy down+leftt"
		},
		{
			keys: "34Numpad3", // 83: joy 0 down+right
			key: "",
			text: "\u21D8",
			title: "Joy down+right"
		},
		{
			keys: null // 84:
		},
		{
			keys: "226IntlBackslash,60IntlBackslash,220IntlBackslash" // 85: < > | // key not on CPC! (Chrome: 226, FF: 60);  Android Bluetooth EN: 220IntlBackslash
		},
		{
			keys: "111NumpadDivide" // 86:
		},
		{
			keys: "106NumpadMultiply" // 87:
		},
		{
			keys: "109NumpadSubtract" // 88:
		},
		{
			keys: "107NumpadAdd" // 89:
		},
		{
			keys: "",
			key: "", // 90: special num lock key to switch between joystick and numpad
			text: "Num",
			title: "Num / Joy",
			style: 1
		}
		// only on PC:
		// "226IntlBackslash", "122F11", "123F12", "44PrintScreen", "145ScrollLock", "19Pause", "45Insert", "36Home", "33PageUp", "35End", "34PageDown", "111NumpadDivide", "106NumpadMultiply", "109NumpadSubtract", "107NumpadAdd"
	],

	/* eslint-disable array-element-newline */
	aVirtualKeyboardAlpha: [
		[66, 64, 65, 57, 56, 49, 48, 41, 40, 33, 32, 25, 24, 16, 79],
		[68, 67, 59, 58, 50, 51, 43, 42, 35, 34, 27, 26, 17, 18],
		[70, 69, 60, 61, 53, 52, 44, 45, 37, 36, 29, 28, 19, 90], // 90=virtual numpad button
		[
			21, 71, 63, 62, 55, 54, 46, 38, 39, 31, 30, 22,
			{
				key: 21, // right shift has same code and style
				style: 2
			}
		],
		[23, 9, 47, 6]
	],
	aVirtualKeyboardNum: [ // numpad
		[10, 11, 3],
		[20, 12, 4],
		[13, 14, 5],
		[15, 0, 7],
		[8, 2, 1]
	],
	/* eslint-enable array-element-newline */

	init: function (options) {
		var oEventNames;

		this.fnPressCpcKey = options.fnPressCpcKey;
		this.fnReleaseCpcKey = options.fnReleaseCpcKey;

		this.bShiftLock = false;
		this.bNumLock = false;

		oEventNames = this.fnAttachPointerEvents("kbdArea", this.onVirtualKeyboardKeydown.bind(this), null, this.onVirtualKeyboardKeyup.bind(this));
		if (oEventNames.out) {
			this.sPointerOutEvent = oEventNames.out;
			this.fnVirtualKeyout = this.onVirtualKeyboardKeyout.bind(this);
		}

		this.dragInit("pageBody", "kbdAreaBox");

		this.virtualKeyboardCreate();
	},

	oDrag: {
		dragItem: undefined,
		active: false,
		xOffset: 0,
		yOffset: 0,
		initialX: 0,
		initialY: 0,
		currentX: 0,
		currentY: 0
	},

	fnAttachPointerEvents: function (sId, fnDown, fnMove, fnUp) {
		var area = document.getElementById(sId),
			oPointerEventNames = {
				down: "pointerdown",
				move: "pointermove",
				up: "pointerup",
				cancel: "pointercancel",
				out: "pointerout",
				type: "pointer"
			},
			oTouchEventNames = {
				down: "touchstart",
				move: "touchmove",
				up: "touchend",
				cancel: "touchcancel",
				out: null,
				type: "touch"
			},
			oMouseEventNames = {
				down: "mousedown",
				move: "mousemove",
				up: "mouseup",
				cancel: null,
				out: "mouseout",
				type: "mouse"
			},
			oEventNames;


		if (window.PointerEvent) {
			oEventNames = oPointerEventNames;
		} else if ("ontouchstart" in window || navigator.maxTouchPoints) {
			oEventNames = oTouchEventNames;
		} else {
			oEventNames = oMouseEventNames;
		}

		if (Utils.debug > 0) {
			Utils.console.log("fnAttachPointerEvents: Using", oEventNames.type, "events");
		}

		if (fnDown) {
			area.addEventListener(oEventNames.down, fnDown, false); // +clicked for pointer, touch?
		}
		if (fnMove) {
			area.addEventListener(oEventNames.move, fnMove, false);
		}
		if (fnUp) {
			area.addEventListener(oEventNames.up, fnUp, false);
			if (oEventNames.cancel) {
				area.addEventListener(oEventNames.cancel, fnUp, false);
			}
		}
		return oEventNames;
	},

	reset: function () {
		this.virtualKeyboardAdaptKeys();
	},

	mapNumLockCpcKey: function (iCpcKey) {
		var oKey = this.aCpcKey2Key[iCpcKey];

		if (oKey.numLockCpcKey) {
			iCpcKey = oKey.numLockCpcKey;
		}
		return iCpcKey;
	},

	fnVirtualGetAscii: function (iCpcKey, bShiftKey, bNumLock) {
		var oKey = this.aCpcKey2Key[iCpcKey],
			sKey, sText, sTitle, oAscii;

		if (bNumLock && oKey.keyNumLock) {
			sKey = oKey.keyNumLock;
			sText = oKey.textNumLock || sKey;
			sTitle = oKey.titleNumLock || sText;
		} else if (bShiftKey && oKey.keyShift) {
			sKey = oKey.keyShift;
			sText = oKey.textShift || sKey;
			sTitle = oKey.titleShift || sText;
		} else {
			sKey = oKey.key;
			sText = oKey.text || sKey;
			sTitle = oKey.title || sText;
		}

		oAscii = {
			key: sKey,
			text: sText,
			title: sTitle
		};

		return oAscii;
	},

	createButtonRow: function (sId, aOptions) {
		var place = document.getElementById(sId),
			buttonList, i, oItem, button, sHtml;

		if (place.insertAdjacentElement) {
			buttonList = document.createElement("div");
			buttonList.className = "displayFlex";
			for (i = 0; i < aOptions.length; i += 1) {
				oItem = aOptions[i];
				button = document.createElement("button");
				button.innerText = oItem.text;
				button.setAttribute("title", oItem.title);
				button.className = oItem.className;
				button.setAttribute("data-key", oItem.key);
				buttonList.insertAdjacentElement("beforeend", button);
			}
			place.insertAdjacentElement("beforeend", buttonList);
		} else { // Polyfill for old browsers
			sHtml = "<div class=displayFlex>\n";
			for (i = 0; i < aOptions.length; i += 1) {
				oItem = aOptions[i];
				sHtml += '<button title="' + oItem.title + '" class="' + oItem.className + '" data-key="' + oItem.key + '">' + oItem.text + "</button>\n";
			}
			sHtml += "</div>";
			place.innerHTML += sHtml;
		}
		return this;
	},

	virtualKeyboardCreatePart: function (id, aVirtualKeyboard) {
		var bShiftLock = this.bShiftLock,
			bNumLock = this.bNumLock,
			aCpcKey2Key = this.aCpcKey2Key,
			oKeyArea = document.getElementById(id),
			aButtons = oKeyArea.getElementsByTagName("button"),
			aOptions, iRow, iCol, aRow, oCpcKey, iCpcKey, oKey, sClassName, oOptions, oAscii;

		if (!aButtons.length) { // not yet created?
			for (iRow = 0; iRow < aVirtualKeyboard.length; iRow += 1) {
				aRow = aVirtualKeyboard[iRow];
				aOptions = [];
				for (iCol = 0; iCol < aRow.length; iCol += 1) {
					if (typeof aRow[iCol] === "number") {
						oCpcKey = {
							key: aRow[iCol]
						};
					} else { // object
						oCpcKey = aRow[iCol];
					}
					iCpcKey = oCpcKey.key;
					if (bNumLock) {
						iCpcKey = this.mapNumLockCpcKey(iCpcKey);
					}

					oKey = aCpcKey2Key[oCpcKey.key];
					oAscii = this.fnVirtualGetAscii(iCpcKey, bShiftLock, bNumLock);

					sClassName = "kbdButton" + (oCpcKey.style || oKey.style || "");
					if (iCol === aRow.length - 1) { // last column
						sClassName += " kbdNoRightMargin";
					}

					oOptions = {
						key: iCpcKey,
						text: oAscii.text,
						title: oAscii.title,
						className: sClassName
					};
					aOptions.push(oOptions);
				}
				this.createButtonRow(id, aOptions);
			}
		}
	},

	virtualKeyboardCreate: function () {
		this.virtualKeyboardCreatePart("kbdAlpha", this.aVirtualKeyboardAlpha);
		this.virtualKeyboardCreatePart("kbdNum", this.aVirtualKeyboardNum);
	},

	virtualKeyboardAdaptKeys: function (bShiftLock, bNumLock) {
		var oKeyArea = document.getElementById("kbdArea"),
			aButtons = oKeyArea.getElementsByTagName("button"), // or: oKeyArea.childNodes and filter
			i, oButton, iCpcKey, oAscii;

		for (i = 0; i < aButtons.length; i += 1) {
			oButton = aButtons[i];
			iCpcKey = Number(oButton.getAttribute("data-key"));
			if (bNumLock) {
				iCpcKey = this.mapNumLockCpcKey(iCpcKey);
			}

			oAscii = this.fnVirtualGetAscii(iCpcKey, bShiftLock, bNumLock);
			if (oAscii.key !== oButton.innerText) {
				oButton.innerText = oAscii.text;
				oButton.title = oAscii.title;
			}
		}
	},

	fnVirtualGetPressedKey: function (iCpcKey) {
		var sPressedKey = "",
			oKey = this.aCpcKey2Key[iCpcKey];

		if (oKey) {
			sPressedKey = oKey.keys;
			if (sPressedKey.indexOf(",") >= 0) { // maybe more
				sPressedKey = sPressedKey.substring(0, sPressedKey.indexOf(",")); // take the first
			}
		}
		return sPressedKey;
	},

	fnGetEventTarget: function (event) { // eslint-disable-line class-methods-use-this
		var node = event.target || event.srcElement; // target, not currentTarget

		if (!node) {
			throw new Error("VirtualKeyboard: Undefined event target: " + node);
		}
		return node;
	},

	onVirtualKeyboardKeydown: function (event) {
		var node = this.fnGetEventTarget(event),
			sCpcKey = node.getAttribute("data-key"),
			iCpcKey, sPressedKey, oAscii;

		if (Utils.debug > 1) {
			Utils.console.debug("onVirtualKeyboardKeydown: event", String(event), "type:", event.type, "title:", node.title, "cpcKey:", sCpcKey);
		}

		if (sCpcKey !== null) {
			iCpcKey = Number(sCpcKey);
			if (this.bNumLock) {
				iCpcKey = this.mapNumLockCpcKey(iCpcKey);
			}
			sPressedKey = this.fnVirtualGetPressedKey(iCpcKey);
			oAscii = this.fnVirtualGetAscii(iCpcKey, this.bShiftLock || event.shiftKey, this.bNumLock);

			this.fnPressCpcKey(iCpcKey, sPressedKey, oAscii.key, event.shiftKey, event.ctrlKey);
		}

		if (this.sPointerOutEvent) {
			node.addEventListener(this.sPointerOutEvent, this.fnVirtualKeyout, false);
		}
		event.preventDefault();
		return false;
	},

	fnVirtualKeyboardKeyupOrKeyout: function (event) {
		var node = this.fnGetEventTarget(event),
			sCpcKey = node.getAttribute("data-key"),
			iCpcKey, sPressedKey, oAscii;

		if (sCpcKey !== null) {
			iCpcKey = Number(sCpcKey);
			if (this.bNumLock) {
				iCpcKey = this.mapNumLockCpcKey(iCpcKey);
			}
			sPressedKey = this.fnVirtualGetPressedKey(iCpcKey);
			oAscii = this.fnVirtualGetAscii(iCpcKey, this.bShiftLock || event.shiftKey, this.bNumLock);

			this.fnReleaseCpcKey(iCpcKey, sPressedKey, oAscii.key, event.shiftKey, event.ctrlKey);

			if (iCpcKey === 70) { // Caps Lock?
				this.bShiftLock = !this.bShiftLock;
				this.virtualKeyboardAdaptKeys(this.bShiftLock, this.bNumLock);
			} else if (iCpcKey === 90) { // Num lock
				this.bNumLock = !this.bNumLock;
				this.virtualKeyboardAdaptKeys(this.bShiftLock, this.bNumLock);
			}
		}
	},

	onVirtualKeyboardKeyup: function (event) {
		var node = this.fnGetEventTarget(event);

		if (Utils.debug > 1) {
			Utils.console.debug("onVirtualKeyboardKeyup: event", String(event), "type:", event.type, "title:", node.title, "cpcKey:", node.getAttribute("data-key"));
		}

		this.fnVirtualKeyboardKeyupOrKeyout(event);

		if (this.sPointerOutEvent && this.fnVirtualKeyout) {
			node.removeEventListener(this.sPointerOutEvent, this.fnVirtualKeyout); // do not need out event any more
		}
		event.preventDefault();
		return false;
	},

	onVirtualKeyboardKeyout: function (event) {
		var node = this.fnGetEventTarget(event);

		if (Utils.debug > 1) {
			Utils.console.debug("onVirtualKeyboardKeyout: event=", event);
		}
		this.fnVirtualKeyboardKeyupOrKeyout(event);
		if (this.sPointerOutEvent && this.fnVirtualKeyout) {
			node.removeEventListener(this.sPointerOutEvent, this.fnVirtualKeyout);
		}
		event.preventDefault();
		return false;
	},


	// based on https://www.kirupa.com/html5/drag.htm
	dragInit: function (sContainerId, sItemId) {
		var oDrag = this.oDrag;

		oDrag.dragItem = document.getElementById(sItemId);
		oDrag.active = false;
		oDrag.xOffset = 0;
		oDrag.yOffset = 0;

		this.fnAttachPointerEvents(sContainerId, this.dragStart.bind(this), this.drag.bind(this), this.dragEnd.bind(this));
	},

	dragStart: function (event) {
		var node = event.target || event.srcElement,
			parent2 = node.parentElement ? node.parentElement.parentElement : null,
			oDrag = this.oDrag;

		if (node === oDrag.dragItem || parent2 === oDrag.dragItem) {
			if (event.type === "touchstart") {
				oDrag.initialX = event.touches[0].clientX - oDrag.xOffset;
				oDrag.initialY = event.touches[0].clientY - oDrag.yOffset;
			} else {
				oDrag.initialX = event.clientX - oDrag.xOffset;
				oDrag.initialY = event.clientY - oDrag.yOffset;
			}
			oDrag.active = true;
		}
	},

	dragEnd: function (/* event */) {
		var oDrag = this.oDrag;

		oDrag.initialX = oDrag.currentX;
		oDrag.initialY = oDrag.currentY;

		oDrag.active = false;
	},

	setTranslate: function (xPos, yPos, el) {
		el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
	},

	drag: function (event) {
		var oDrag = this.oDrag;

		if (oDrag.active) {
			event.preventDefault();

			if (event.type === "touchmove") {
				oDrag.currentX = event.touches[0].clientX - oDrag.initialX;
				oDrag.currentY = event.touches[0].clientY - oDrag.initialY;
			} else {
				oDrag.currentX = event.clientX - oDrag.initialX;
				oDrag.currentY = event.clientY - oDrag.initialY;
			}

			oDrag.xOffset = oDrag.currentX;
			oDrag.yOffset = oDrag.currentY;

			this.setTranslate(oDrag.currentX, oDrag.currentY, oDrag.dragItem);
		}
	}
};
