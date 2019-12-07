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
		this.options = Object.assign({}, options);

		this.fnOnKeyDown = this.options.fnOnKeyDown;

		this.aKeyBuffer = []; // buffered pressed keys

		this.reset();
		this.bActive = false; // flag if keyboard is active/focused, set from outside

		window.addEventListener("keydown", this.onWindowKeydown.bind(this), false);
		window.addEventListener("keyup", this.onWindowKeyup.bind(this), false);
	},

	reset: function () {
		this.fnOnKeyDown = null;
		this.clearInput();
		this.oPressedKeys = {}; // currently pressed browser keys
		this.oKeyStates = null; // invalidate pressed cpc keys 
	},

	clearInput: function () {
		this.aKeyBuffer.length = 0;
	},

	setKeyDownHandler: function (fnOnKeyDown) {
		this.fnOnKeyDown = fnOnKeyDown;
	},

	setActive: function (bActive) {
		this.bActive = bActive;
	},

	removeCodeFromKeymap: function (sPressedKey) { // for certain browsers
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

	fnKeyboardKeydown: function (event) {
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
		this.oKeyStates = null; // invalidate
		if (Utils.debug > 1) {
			Utils.console.log("fnKeyboardKeydown: keyCode=" + iKeyCode + " pressedKey=" + sPressedKey + " key='" + sKey + "' " + sKey.charCodeAt(0) + " ", event);
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

		if (sKey === "Escape" && this.options.fnEscapeHandler) {
			this.options.fnEscapeHandler(sKey, sPressedKey);
		}

		if (this.fnOnKeyDown) { // special handler?
			this.fnOnKeyDown(this.aKeyBuffer);
		}
	},

	fnKeyboardKeyup: function (event) {
		var iKeyCode = event.which || event.keyCode,
			sPressedKey = iKeyCode;

		if (event.code) { // available for e.g. Chrome, Firefox
			sPressedKey += event.code;
		}

		if (Utils.debug > 1) {
			Utils.console.log("fnKeyboardKeyup: keyCode=" + iKeyCode + " pressedKey=" + sPressedKey + " key='" + event.key + "' " + event.key.charCodeAt(0) + " ", event);
		}
		delete this.oPressedKeys[sPressedKey];
		this.oKeyStates = null; // invalidate
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

	updateKeyStates: function () {
		var oCpcKey2Key = this.mCpcKey2Key,
			oKeyStates = {},
			iState = -1,
			iCpcKey, sMappedKeys, aMappedKeys, i, sKey;

		for (iCpcKey in oCpcKey2Key) {
			if (oCpcKey2Key.hasOwnProperty(iCpcKey)) {
				sMappedKeys = this.mCpcKey2Key[iCpcKey];
				aMappedKeys = sMappedKeys.split(","); // maybe more
				for (i = 0; i < aMappedKeys.length; i += 1) {
					sKey = aMappedKeys[i];
					if (sKey in this.oPressedKeys) {
						iState = this.oPressedKeys[sKey];
						oKeyStates[iCpcKey] = iState;
					}
				}
			}
		}

		if (Utils.debug > 2) {
			Utils.console.log("updateKeyStates: %o", oKeyStates);
		}
		return oKeyStates;
	},

	getKeyState: function (iCpcKey) {
		var iState;

		if (!this.oKeyStates) {
			this.oKeyStates = this.updateKeyStates();
		}

		iState = (iCpcKey in this.oKeyStates) ? this.oKeyStates[iCpcKey] : -1;
		return iState;
	},

	/*
	getKeyState: function (iCpcKey) {
		var iState = -1,
			sMappedKeys, aMappedKeys, i, sKey;

		if (Object.keys(this.oPressedKeys).length) {
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
		}
		return iState;
	},
	*/

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

	onWindowKeydown: function (event) {
		if (this.bActive) {
			this.fnKeyboardKeydown(event);
			event.preventDefault();
			return false;
		}
		return undefined;
	},

	onWindowKeyup: function (event) {
		if (this.bActive) {
			this.fnKeyboardKeyup(event);
			event.preventDefault();
			return false;
		}
		return undefined;
	}
};
