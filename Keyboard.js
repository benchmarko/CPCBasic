// Keyboard.js - Keyboard handling
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
/* globals Utils */

"use strict";

function Keyboard(options) {
	this.init(options);
}

Keyboard.prototype = {

	mCpcKey2Key: {
		0: "38ArrowUp", // cursor up
		1: "39ArrowRight", // cursor right
		2: "40ArrowDown", // cursor down
		3: "105Numpad9,120F9", // numpad f9
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
		17: "187BracketRight,171BracketRight", // [ { (Chrome: 187; FF: 171)
		18: "13Enter", // return
		19: "191Backslash,163Backslash", // ] } => # ' (Chrome: 191; FF: 163)
		20: "100Numpad4,115F4", // numpad f4
		21: "16ShiftLeft,16ShiftRight", // shift left, shift right (2 keys!)
		22: "220Backquote,160Backquote", // \ ` (different location, key!; Chrome: 220; FF: 160)
		23: "17ControlLeft,17ControlRight", // Note: alt-gr also triggers ctrl-left and alt-gr!
		24: "221Equal,192Equal", // ^ pound (Chrome: 221; FF: 192)
		25: "219Minus,63Minus", // - = (Chrome: 219; FF: 63)
		26: "186BracketLeft,59BracketLeft", // @ | (Chrome: 168; FF: 59)
		27: "80KeyP", // P
		28: "222Quote", // ; + (same on Chrome, FF)
		29: "192Semicolon", // : * (same on Chrome, FF)
		30: "189Slash,173Slash", // / ? (Chrome: 189; FF: 173)
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
		85: "226IntlBackslash,60IntlBackslash", // < > | // key not on CPC! (Chrome: 226, FF: 60)
		86: "111NumpadDivide",
		87: "106NumpadMultiply",
		88: "109NumpadSubtract",
		89: "107NumpadAdd",
		90: "36Numpad7", // joy 0 up+left
		91: "33Numpad9", // joy 0 up+right
		92: "35Numpad1", // joy 0 down+left
		93: "34Numpad3" // joy 0 down+right

		// only on PC:
		// "226IntlBackslash", "122F11", "123F12", "44PrintScreen", "145ScrollLock", "19Pause", "45Insert", "36Home", "33PageUp", "35End", "34PageDown", "111NumpadDivide", "106NumpadMultiply", "109NumpadSubtract", "107NumpadAdd"
	},

	mSpecialKeys: {
		Alt: String.fromCharCode(224), // Copy
		ArrowUp: String.fromCharCode(240),
		ArrowDown: String.fromCharCode(241),
		ArrowLeft: String.fromCharCode(242),
		ArrowRight: String.fromCharCode(243),
		Backspace: String.fromCharCode(127),
		Delete: String.fromCharCode(16),
		Enter: "\r",
		Spacebar: " ", // for IE
		Tab: String.fromCharCode(9),
		ä: ";",
		Ä: "+",
		ö: ":",
		Ö: "*",
		ü: "@",
		Ü: "|",
		ß: "-",
		DeadBackquote: "^",
		"°": "£",
		DeadEqual: String.fromCharCode(161), // tick
		"´": String.fromCharCode(161), // IE: tick
		DeadEqualShift: "`" // backtick
	},

	/* eslint-disable array-element-newline */
	aJoyKeyCodes: [
		[72, 73, 74, 75, 76, 77],
		[48, 49, 50, 51, 52, 53]
	],


	/* eslint-enable array-element-newline */

	// key map for virtual keyboard
	mCpcKey2Ascii: {
		0: {
			key: "ArrowUp",
			text: "\u2191",
			title: "Cursor up"
		},
		1: {
			key: "ArrowRight",
			text: "\u2192",
			title: "Cursor right",
			style: 1
		},
		2: {
			key: "ArrowDown",
			text: "\u2193",
			title: "Cursor down"
		},
		3: {
			key: "9", // numpad f9
			text: "f9",
			style: 1
		},
		4: {
			key: "6", // numpad f6
			text: "f6",
			style: 1
		},
		5: {
			key: "3", // numpad f3
			text: "f3",
			style: 1
		},
		6: {
			key: "Enter", // numpad enter
			style: 4
		},
		7: {
			key: "." // numpad .
		},
		8: {
			key: "ArrowLeft",
			text: "\u2190",
			title: "Cursor left",
			style: 1
		},
		9: {
			key: "Alt", // copy
			text: "Copy",
			style: 2
		},
		10: {
			key: "7", // numpad f7
			text: "f7",
			style: 1
		},
		11: {
			key: "8", // numpad f8
			text: "f8",
			style: 1
		},
		12: {
			key: "5", // numpad f5
			text: "f5",
			style: 1
		},
		13: {
			key: "1", // numpad f1
			text: "f1",
			style: 1
		},
		14: {
			key: "2", // numpad f2
			text: "f2",
			style: 1
		},
		15: {
			key: "0", // numpad f0
			text: "f0",
			style: 1
		},
		16: {
			key: "Delete", // clr
			text: "Clr",
			title: "Clear",
			style: 1
		},
		17: {
			key: "[~{" // [ {
		},
		18: {
			key: "Enter", // return
			text: "Ret",
			title: "Return",
			style: 2
		},
		19: {
			key: "]~}" // ] }
		},
		20: {
			key: "4", // numpad f4
			text: "f4",
			style: 1
		},
		21: {
			key: "Shift", // shift left, shift right will be mapped (2 keys!)
			style: 4
		},
		22: {
			key: "\\~`" // \ ` (different location, key!)
		},
		23: {
			key: "Control", // Note: alt-gr also triggers ctrl-left and alt-gr!
			text: "Ctrl",
			title: "Control",
			style: 4
		},
		24: {
			key: "^~£" // ^ £ (pound: \u00A3)
		},
		25: {
			key: "-~=" // - =
		},
		26: {
			key: "@~|", // @ |
			style: 1
		},
		27: {
			key: "p~P" // P
		},
		28: {
			key: ";~+" // ; +
		},
		29: {
			key: ":~*" // : *
		},
		30: {
			key: "/~?" // / ?
		},
		31: {
			key: ".~<" // . <
		},
		32: {
			key: "0~_" // 0 _
		},
		33: {
			key: "9~)" // 9 )
		},
		34: {
			key: "o~O"
		},
		35: {
			key: "i~I"
		},
		36: {
			key: "l~L"
		},
		37: {
			key: "k~K"
		},
		38: {
			key: "m~M"
		},
		39: {
			key: ",~>" // , >
		},
		40: {
			key: "8~("
		},
		41: {
			key: "7~'"
		},
		42: {
			key: "u~U"
		},
		43: {
			key: "y~Y"
		},
		44: {
			key: "h~H"
		},
		45: {
			key: "j~J"
		},
		46: {
			key: "n~N"
		},
		47: {
			key: " ", // space
			text: "Space",
			style: 5
		},
		48: {
			key: "6~&"
		},
		49: {
			key: "5~%"
		},
		50: {
			key: "r~R"
		},
		51: {
			key: "t~T"
		},
		52: {
			key: "g~G"
		},
		53: {
			key: "f~F"
		},
		54: {
			key: "b~B"
		},
		55: {
			key: "v~V"
		},
		56: {
			key: "4~$"
		},
		57: {
			key: "3~#"
		},
		58: {
			key: "e~E"
		},
		59: {
			key: "w~W"
		},
		60: {
			key: "s~S"
		},
		61: {
			key: "d~D"
		},
		62: {
			key: "c~C"
		},
		63: {
			key: "x~X"
		},
		64: {
			key: "1~!"
		},
		65: {
			key: "2~\""
		},
		66: {
			key: "Escape", // esc
			text: "Esc",
			title: "Escape",
			style: 1
		},
		67: {
			key: "q~Q"
		},
		68: {
			key: "Tab",
			style: 2
		},
		69: {
			key: "a~A"
		},
		70: {
			key: "CapsLock", // caps lock
			text: "Caps",
			title: "Caps Lock",
			style: 3
		},
		71: {
			key: "z~Z"
		},
		// joystick currently not used on virtual keyboard:
		72: {
			key: "8" // joy 0 up (arrow up)
		},
		73: {
			key: "2" // joy 0 down
		},
		74: {
			key: "4" // joy 0 left
		},
		75: {
			key: "6" // joy 0 right
		},
		76: {
			key: "5" // joy 0 fire 2 (clear,...)
		},
		77: {
			key: "." // joy 0 fire 1
		},
		// 78: ""? (joy 0 fire 3?)
		79: {
			key: "Backspace", // del
			text: "Del",
			title: "Delete",
			style: 1
		},

		// not on CPC:`
		/*
		90: {
			key: "7" // joy 0 up+left
		},
		91: {
			key: "9" // joy 0 up+right
		},
		92: {
			key: "1" // joy 0 down+left
		},
		93: {
			key: "3" // joy 0 down+right
		},
		*/

		95: {
			key: "Shift", // shift right (special value to avoid duplicate key)
			style: 2
		},
		96: {
			key: "", // dummy key
			text: "Num",
			title: "Num lock (no function)",
			style: 1
		}
	},

	/* eslint-disable array-element-newline */
	aVirtualKeyboard: [
		[66, 64, 65, 57, 56, 49, 48, 41, 40, 33, 32, 25, 24, 16, 79, 10, 11, 3],
		[68, 67, 59, 58, 50, 51, 43, 42, 35, 34, 27, 26, 17, 18, 20, 12, 4],
		[70, 69, 60, 61, 53, 52, 44, 45, 37, 36, 29, 28, 19, 96, 13, 14, 5],
		[21, 71, 63, 62, 55, 54, 46, 38, 39, 31, 30, 22, 95, 15, 0, 7],
		[23, 9, 47, 6, 8, 2, 1]
	],
	/* eslint-enable array-element-newline */

	init: function (options) {
		var cpcArea, keyboardArea;

		this.options = Object.assign({}, options);

		this.fnOnKeyDown = this.options.fnOnKeyDown;

		this.aKeyBuffer = []; // buffered pressed keys

		this.aExpansionTokens = []; // expansion tokens 0..31 (in reality: 128..159)
		this.oCpcKeyExpansions = {}; // cpc keys to expansion tokens for normal, shift, ctrl; also repeat

		this.reset();
		this.bActive = false; // flag if keyboard is active/focused, set from outside

		this.oKey2CpcKey = this.initKey2CpcKeyMap();
		this.bCodeStringsRemoved = false;

		cpcArea = document.getElementById("cpcArea"); //TTT
		cpcArea.addEventListener("keydown", this.onCpcAreaKeydown.bind(this), false);
		cpcArea.addEventListener("keyup", this.oncpcAreaKeyup.bind(this), false);

		keyboardArea = document.getElementById("keyboardArea"); //TTT
		this.fnVirtualKeydown = this.onVirtualKeyboardKeydown.bind(this);
		this.fnVirtualKeyUp = this.onVirtualKeyboardKeyup.bind(this);
		if (window.PointerEvent) {
			keyboardArea.addEventListener("pointerdown", this.fnVirtualKeydown, false); // +clicked?
			keyboardArea.addEventListener("pointerup", this.fnVirtualKeyUp, false);
			keyboardArea.addEventListener("pointercancel", this.fnVirtualKeyUp, false);
			//oKeyArea.addEventListener("pointerout", this.fnVirtualKeyUp, false); //TTT use it? caps?
			if (Utils.debug > 0) {
				Utils.console.log("Keyboard:init: Using pointerEvents");
			}
		} else if ("ontouchstart" in window || navigator.maxTouchPoints) {
			keyboardArea.addEventListener("touchstart", this.fnVirtualKeydown, false); // +clicked?
			keyboardArea.addEventListener("touchend", this.fnVirtualKeyUp, false);
			keyboardArea.addEventListener("touchcancel", this.fnVirtualKeyUp, false);
			if (Utils.debug > 0) {
				Utils.console.log("Keyboard:init: Using touch events");
			}
		} else {
			keyboardArea.addEventListener("mousedown", this.fnVirtualKeydown, false);
			keyboardArea.addEventListener("mouseup", this.fnVirtualKeyUp, false);
			if (Utils.debug > 0) {
				Utils.console.log("Keyboard:init: Using mouse events");
			}
		}

		// TTT also for key navigation on virtual keyboard
		//keyboardArea.addEventListener("keydown", this.fnVirtualKeydown, false);
		//keyboardArea.addEventListener("keyup", this.fnVirtualKeyUp, false);
	},

	initKey2CpcKeyMap: function () {
		var mCpcKey2Key = this.mCpcKey2Key,
			oKey2CpcKey = {},
			iCpcKey, sMappedKeys, aMappedKeys, i, sKey;

		for (iCpcKey in mCpcKey2Key) {
			if (mCpcKey2Key.hasOwnProperty(iCpcKey)) {
				sMappedKeys = mCpcKey2Key[iCpcKey];
				aMappedKeys = sMappedKeys.split(","); // maybe more
				for (i = 0; i < aMappedKeys.length; i += 1) {
					sKey = aMappedKeys[i];
					oKey2CpcKey[sKey] = iCpcKey; // actually iCpcKey is a string
				}
			}
		}
		return oKey2CpcKey;
	},

	reset: function () {
		this.fnOnKeyDown = null;
		this.clearInput();
		this.oPressedKeys = {}; // currently pressed browser keys
		this.bShiftLock = false; // for virtual keyboard
		this.virtualKeyboardAdaptKeys();
		this.resetExpansionTokens();
		this.resetCpcKeysExpansions();
	},

	clearInput: function () {
		this.aKeyBuffer.length = 0;
	},

	resetExpansionTokens: function () {
		var aExpansionTokens = this.aExpansionTokens,
			i;

		for (i = 0; i <= 9; i += 1) {
			aExpansionTokens[i] = String(i);
		}
		aExpansionTokens[10] = ".";
		aExpansionTokens[11] = "\r";
		aExpansionTokens[12] = 'RUN"\r';
		for (i = 13; i <= 31; i += 1) {
			aExpansionTokens[i] = 0;
		}
	},

	resetCpcKeysExpansions: function () {
		var oCpcKeyExpansions = this.oCpcKeyExpansions;

		oCpcKeyExpansions.normal = { // cpcKey => ExpansionToken (128-159)
			15: 0 + 128, // F0
			13: 1 + 128, // F1
			14: 2 + 128, // F2
			5: 3 + 128, // F3
			20: 4 + 128, // F4
			12: 5 + 128, // F5
			4: 6 + 128, // F6
			10: 7 + 128, // F7
			11: 8 + 128, // F8
			3: 9 + 128, // F9
			7: 10 + 128, // F.
			6: 11 + 128 // Enter
		};

		oCpcKeyExpansions.shift = {};

		oCpcKeyExpansions.ctrl = {
			6: 12 + 128 // ctrl+Enter
		};

		oCpcKeyExpansions.repeat = {};
	},

	setKeyDownHandler: function (fnOnKeyDown) {
		this.fnOnKeyDown = fnOnKeyDown;
	},

	setActive: function (bActive) {
		this.bActive = bActive;
	},

	removeCodeStringsFromKeymap: function () { // for certain browsers (IE, Edge) we get only codes but no code strings from the keyboard, so remove the code strings
		var oKey2CpcKey = this.oKey2CpcKey,
			oNewMap = {},
			sKey, iKey;

		if (Utils.debug > 1) {
			Utils.console.log("removeCodeStringsFromKeymap: Unfortunately not all keys can be used.");
		}
		for (sKey in oKey2CpcKey) {
			if (oKey2CpcKey.hasOwnProperty(sKey)) {
				iKey = parseInt(sKey, 10); // get just the number
				oNewMap[iKey] = oKey2CpcKey[sKey];
			}
		}
		this.oKey2CpcKey = oNewMap;
	},

	fnPressCpcKey: function (iCpcKey, sPressedKey, sKey, bShiftKey, bCtrlKey) {
		var oPressedKeys = this.oPressedKeys,
			oCpcKeyExpansions = this.oCpcKeyExpansions,
			mSpecialKeys = this.mSpecialKeys,
			bKeyAlreadyPressed, oCpcKey, oExpansions, iExpKey, i;

		oCpcKey = oPressedKeys[iCpcKey];
		if (!oCpcKey) {
			oPressedKeys[iCpcKey] = {
				oKeys: {}
			};
			oCpcKey = oPressedKeys[iCpcKey];
		}
		bKeyAlreadyPressed = oCpcKey.oKeys[sPressedKey];
		oCpcKey.oKeys[sPressedKey] = true;
		oCpcKey.shift = bShiftKey;
		oCpcKey.ctrl = bCtrlKey;
		if (Utils.debug > 1) {
			Utils.console.log("fnPressCpcKey: sPressedKey=" + sPressedKey + ", affected cpc key=" + iCpcKey);
		}

		oExpansions = oCpcKeyExpansions.repeat;
		if (bKeyAlreadyPressed && ((iCpcKey in oExpansions) && !oExpansions[iCpcKey])) {
			sKey = ""; // repeat off => ignore key
		} else {
			if (bCtrlKey) {
				oExpansions = oCpcKeyExpansions.ctrl;
			} else if (bShiftKey) {
				oExpansions = oCpcKeyExpansions.shift;
			} else {
				oExpansions = oCpcKeyExpansions.normal;
			}

			if (iCpcKey in oExpansions) {
				iExpKey = oExpansions[iCpcKey];
				if (iExpKey >= 128 && iExpKey <= 159) {
					sKey = this.aExpansionTokens[iExpKey - 128];
					for (i = 0; i < sKey.length; i += 1) {
						this.putKeyInBuffer(sKey.charAt(i));
					}
				} else { // ascii code
					sKey = String.fromCharCode(iExpKey);
					this.putKeyInBuffer(sKey.charAt(i));
				}
				sKey = ""; // already done, ignore sKey form keyboard
			}
		}

		if (sKey in mSpecialKeys) {
			sKey = mSpecialKeys[sKey];
		} else if (bCtrlKey) {
			if (sKey >= "a" && sKey <= "z") { // map keys with ctrl to control codes (problem: some control codes are browser functions, e.g. w: close window)
				sKey = String.fromCharCode(sKey.charCodeAt(0) - 96); // ctrl+a => \x01
			}
		}
		if (sKey.length === 1) { // put normal keys in buffer, ignore special keys with more than 1 character
			this.putKeyInBuffer(sKey);
		}

		if (sKey === "Escape" && this.options.fnEscapeHandler) {
			this.options.fnEscapeHandler(sKey, sPressedKey);
		}

		if (this.fnOnKeyDown) { // special handler?
			this.fnOnKeyDown(this.aKeyBuffer);
		}
	},

	fnKeyboardKeydown: function (event) {
		var iKeyCode = event.which || event.keyCode,
			sPressedKey = iKeyCode,
			sKey = event.key,
			iCpcKey;

		if (event.code) { // available for e.g. Chrome, Firefox
			sPressedKey += event.code;
		} else if (!this.bCodeStringsRemoved) { // event.code not available on e.g. IE, Edge
			this.removeCodeStringsFromKeymap(); // Remove code information from the mapping. Not all keys can be detected any more
			this.bCodeStringsRemoved = true;
		}

		if (Utils.debug > 1) {
			Utils.console.log("fnKeyboardKeydown: keyCode=" + iKeyCode + " pressedKey=" + sPressedKey + " key='" + sKey + "' " + sKey.charCodeAt(0) + " ", event);
		}

		if (sPressedKey in this.oKey2CpcKey) {
			iCpcKey = this.oKey2CpcKey[sPressedKey];
			if (sKey === "Dead") { // Chrome, FF
				sKey += event.code + (event.shiftKey ? "Shift" : ""); // special handling => "DeadBackquote" or "DeadEqual"; and "Shift"
			} else if (sKey === "Unidentified") { // IE, Edge
				if (iKeyCode === 220) {
					sKey = event.shiftKey ? "°" : "DeadBackquote";
				} else if (iKeyCode === 221) {
					sKey = "DeadEqual" + (event.shiftKey ? "Shift" : "");
				}
			} else if (sKey.length === 2) {
				if (sKey.charAt(0) === "^" || sKey.charAt(0) === "´" || sKey.charAt(0) === "`") { // IE, Edge? prefix key
					sKey = sKey.substr(1); // remove prefix
				}
			}
			this.fnPressCpcKey(iCpcKey, sPressedKey, sKey, event.shiftKey, event.ctrlKey);
		} else {
			Utils.console.log("fnKeyboardKeydown: Unhandled key", sPressedKey);
		}
	},

	fnKeyboardKeyup: function (event) {
		var oPressedKeys = this.oPressedKeys,
			iKeyCode = event.which || event.keyCode,
			sPressedKey = iKeyCode,
			iCpcKey, oCpcKey;

		if (event.code) { // available for e.g. Chrome, Firefox
			sPressedKey += event.code;
		}

		if (Utils.debug > 1) {
			Utils.console.log("fnKeyboardKeyup: keyCode=" + iKeyCode + " pressedKey=" + sPressedKey + " key='" + event.key + "' " + event.key.charCodeAt(0) + " ", event);
		}

		if (sPressedKey in this.oKey2CpcKey) {
			iCpcKey = this.oKey2CpcKey[sPressedKey];
			oCpcKey = oPressedKeys[iCpcKey];
			if (!oCpcKey) {
				Utils.console.warn("fnKeyboardKeydown: Key was not pressed:", sPressedKey);
			} else {
				delete oCpcKey.oKeys[sPressedKey];
				if (!Object.keys(oCpcKey.oKeys).length) {
					delete oPressedKeys[iCpcKey];
				} else {
					oCpcKey.shift = event.shiftKey;
					oCpcKey.ctrl = event.ctrlKey;
				}
			}
			if (Utils.debug > 1) {
				Utils.console.log("fnKeyboardKeyup: sPressedKey=" + sPressedKey + ", affected cpc key=" + iCpcKey + ", oKeys:", (oCpcKey ? oCpcKey.oKeys : "undef."));
			}
		} else {
			Utils.console.log("fnKeyboardKeyup: Unhandled key", sPressedKey);
		}
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
		var oPressedKeys = this.oPressedKeys,
			iState = -1,
			oCpcKey;

		if (iCpcKey in oPressedKeys) {
			oCpcKey = oPressedKeys[iCpcKey];
			iState = 0 + (oCpcKey.shift ? 32 : 0) + (oCpcKey.ctrl ? 128 : 0);
		}
		return iState;
	},

	getJoyState: function (iJoy) {
		var iValue = 0,
			aJoy, i;

		aJoy = this.aJoyKeyCodes[iJoy];

		/* eslint-disable no-bitwise */
		for (i = 0; i < aJoy.length; i += 1) {
			if (this.getKeyState(aJoy[i]) !== -1) {
				iValue |= (1 << i);
			}
		}

		// check additional special codes for joy 0 (not available on CPC)
		if (iJoy === 0) {
			if (this.getKeyState(90) !== -1) { // up left
				iValue |= 1 + 4;
			}
			if (this.getKeyState(91) !== -1) { // up right
				iValue |= 1 + 8;
			}
			if (this.getKeyState(92) !== -1) { // down left
				iValue |= 2 + 4;
			}
			if (this.getKeyState(93) !== -1) { // down right
				iValue |= 2 + 8;
			}
		}
		/* eslint-enable no-bitwise */

		return iValue;
	},

	setExpansionToken: function (iToken, sString) {
		this.aExpansionTokens[iToken] = sString;
	},

	setCpcKeyExpansion: function (oOptions) {
		var oCpcKeyExpansions = this.oCpcKeyExpansions,
			iCpcKey = oOptions.iCpcKey;

		oCpcKeyExpansions.repeat[iCpcKey] = oOptions.iRepeat;

		if ("iNormal" in oOptions) {
			oCpcKeyExpansions.normal[iCpcKey] = oOptions.iNormal;
		}
		if ("iShift" in oOptions) {
			oCpcKeyExpansions.shift[iCpcKey] = oOptions.iShift;
		}
		if ("iCtrl" in oOptions) {
			oCpcKeyExpansions.ctrl[iCpcKey] = oOptions.iCtrl;
		}
	},

	onCpcAreaKeydown: function (event) {
		if (this.bActive) {
			this.fnKeyboardKeydown(event);
			event.preventDefault();
			return false;
		}
		return undefined;
	},

	oncpcAreaKeyup: function (event) {
		if (this.bActive) {
			this.fnKeyboardKeyup(event);
			event.preventDefault();
			return false;
		}
		return undefined;
	},


	setButtons: function (sId, aOptions) {
		var place = document.getElementById(sId),
			buttonList, i, oItem, option;

		buttonList = document.createElement("div");
		for (i = 0; i < aOptions.length; i += 1) {
			oItem = aOptions[i];
			option = document.createElement("button");
			option.id = oItem.id;
			option.innerText = oItem.text;
			option.setAttribute("title", oItem.title);
			option.className = oItem.className;
			buttonList.insertAdjacentElement("beforeEnd", option);
		}
		place.insertAdjacentElement("beforeEnd", buttonList);
		return this;
	},

	virtualKeyboardCreate: function () {
		var bShiftLock = this.bShiftLock,
			mCpcKey2Ascii = this.mCpcKey2Ascii,
			oKeyArea = document.getElementById("keyboardArea"),
			aButtons = oKeyArea.getElementsByTagName("button"),
			aOptions, iRow, iCol, aRow, iCpcKey, oKey, sKey, aKey, sClassName, oOptions;

		if (!aButtons.length) {
			for (iRow = 0; iRow < this.aVirtualKeyboard.length; iRow += 1) {
				aRow = this.aVirtualKeyboard[iRow];
				aOptions = [];
				for (iCol = 0; iCol < aRow.length; iCol += 1) {
					iCpcKey = aRow[iCol];
					oKey = mCpcKey2Ascii[iCpcKey];
					sKey = (oKey.text !== undefined) ? oKey.text : oKey.key;
					if (sKey.indexOf("~") >= 0) {
						aKey = sKey.split("~");
						sKey = bShiftLock ? aKey[1] : aKey[0];
					}

					sClassName = "kbdButton" + (oKey.style || "");
					if (iCol === aRow.length - 1) { // last column
						sClassName += " kbdNoRightMargin";
					}
					oOptions = {
						id: ("0" + String(iCpcKey)).slice(-2) + "Key",
						text: sKey,
						title: oKey.title || sKey,
						className: sClassName
					};
					aOptions.push(oOptions);
				}
				this.setButtons("keyboardArea", aOptions);
			}
		}
	},

	virtualKeyboardAdaptKeys: function (bShiftLock) {
		var oKeyArea = document.getElementById("keyboardArea"), //TTT TODO
			aButtons = oKeyArea.getElementsByTagName("button"), // or: oKeyArea.childNodes and filter
			i, oButton, sId, iCpcKey, oKey, sKey, aKey;

		for (i = 0; i < aButtons.length; i += 1) {
			oButton = aButtons[i];
			sId = oButton.id;
			iCpcKey = parseInt(sId, 10);

			if (iCpcKey in this.mCpcKey2Ascii) {
				oKey = this.mCpcKey2Ascii[iCpcKey];
				sKey = oKey.key;
				if (sKey.indexOf("~") >= 0) {
					aKey = sKey.split("~");
					sKey = bShiftLock ? aKey[1] : aKey[0];
					oButton.innerText = sKey;
					oButton.title = sKey;
				}
			}
		}
	},

	onVirtualKeyboardKeydown: function (event) {
		var sId = event.target.id,
			sPressedKey = "",
			sKey = "",
			iCpcKey, oKey, aKey;

		if (Utils.debug > 1) {
			Utils.console.log("DEBUG: onVirtualKeyboardKeydown: event=", event);
		}

		if (Utils.stringEndsWith(sId, "Key")) {
			iCpcKey = parseInt(sId, 10);
			if (iCpcKey === 95) { // map pseudo key right shift to left shift
				iCpcKey = 21;
			}
			if (iCpcKey in this.mCpcKey2Key) {
				sPressedKey = this.mCpcKey2Key[iCpcKey];
				if (sPressedKey.indexOf(",") >= 0) { // TTT maybe more
					sPressedKey = sPressedKey.substring(0, sPressedKey.indexOf(",")); // take the first
				}
			}

			if (iCpcKey in this.mCpcKey2Ascii) {
				oKey = this.mCpcKey2Ascii[iCpcKey];
				sKey = oKey.key;
				if (sKey.indexOf("~") >= 0) {
					aKey = sKey.split("~");
					sKey = (this.bShiftLock || event.shiftKey) ? aKey[1] : aKey[0];
				}
			}

			this.fnPressCpcKey(iCpcKey, sPressedKey, sKey, event.shiftKey, event.ctrlKey);
		}
		event.preventDefault();
		return false;
	},

	onVirtualKeyboardKeyup: function (event) {
		var sId = event.target.id,
			oPressedKeys = this.oPressedKeys,
			iCpcKey, oCpcKey;

		if (Utils.debug > 1) {
			Utils.console.log("DEBUG: onVirtualKeyboardKeyup: event=", event);
		}

		if (Utils.stringEndsWith(sId, "Key")) {
			iCpcKey = parseInt(sId, 10);
			if (iCpcKey === 95) { // map pseudo key right shift to left shift
				iCpcKey = 21;
			}
			oCpcKey = oPressedKeys[iCpcKey];
			if (!oCpcKey) {
				Utils.console.warn("fnKeyboardKeydown: cpcKey was not pressed:", iCpcKey);
			} else {
				delete oPressedKeys[iCpcKey];
			}

			if (iCpcKey === 70) { // Caps Lock?
				this.bShiftLock = !this.bShiftLock;
				this.virtualKeyboardAdaptKeys(this.bShiftLock);
			}
		}

		event.preventDefault();
		return false;
	}
};
