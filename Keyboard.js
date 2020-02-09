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

	aCpcKey2Key: [
		"38ArrowUp", // 0: cursor up
		"39ArrowRight", // 1: cursor right
		"40ArrowDown", // 2: cursor down
		"105Numpad9,120F9", // 3: numpad f9
		"102Numpad6,117F6", // 4: numpad f6
		"99Numpad3,114F3", // 5: numpad f3
		"13NumpadEnter", // 6: numpad enter
		"110NumpadDecimal", // 7: numpad .
		"37ArrowLeft", // 8: cursor left
		"18AltLeft", // 9: copy
		"103Numpad7,118F7", // 10: numpad f7
		"104Numpad8,119F8", // 11: numpad f8
		"101Numpad5,116F5", // 12: numpad f5
		"97Numpad1,112F1", // 13: numpad f1
		"98Numpad2,113F2", // 14: numpad f2
		"96Numpad0,121F10", // 15: numpad f0
		"46Delete", // 16: clr
		"187BracketRight,171BracketRight,221BracketRight", // 17: [ { (Chrome: 187; FF: 171); EN: 221BracketRight
		"13Enter", // 18: return
		"191Backslash,163Backslash,220Backslash", // 19: ] } => # ' (Chrome: 191; FF: 163); EN: 220Backslash
		"100Numpad4,115F4", // 20: numpad f4
		"16ShiftLeft,16ShiftRight", // 21: shift left, shift right (2 keys!)
		"220Backquote,160Backquote,192Backquote", // 22: \ ` (different location, key!; Chrome: 220; FF: 160); EN: 192Backquote, 226IntlBackslash?
		"17ControlLeft,17ControlRight", // 23: Note: alt-gr also triggers ctrl-left and alt-gr!
		"221Equal,192Equal,187Equal", // 24: ^ pound (Chrome: 221; FF: 192); EN: 187Equal
		"219Minus,63Minus,189Minus", // 25: - = (Chrome: 219; FF: 63); EN: 189Minus
		"186BracketLeft,59BracketLeft,219BracketLeft", // 26: @ | (Chrome: 168; FF: 59); EN: 219BracketLeft
		"80KeyP", // 27: P
		"222Quote,192Quote", // ; + (same on Chrome, FF); Android Bluetooth EN: 192Quote
		"192Semicolon,186Semicolon", // 29: : * (same on Chrome, FF); EN: 186Semicolon
		"189Slash,173Slash,191Slash", // 30: / ? (Chrome: 189; FF: 173); EN: 191Slash
		"190Period", // 31: . <
		"48Digit0", // 32: 0 _
		"57Digit9", // 33: 9 )
		"79KeyO", // 34:
		"73KeyI", // 35:
		"76KeyL", // 36:
		"75KeyK", // 37:
		"77KeyM", // 38:
		"188Comma", // 39: , >
		"56Digit8", // 40:
		"55Digit7", // 41:
		"85KeyU", // 42:
		"90KeyY,89KeyY", // 43:
		"72KeyH", // 44:
		"74KeyJ", // 45:
		"78KeyN", // 46:
		"32Space", // 47: space
		"54Digit6", // 48:
		"53Digit5", // 49:
		"82KeyR", // 50:
		"84KeyT", // 51:
		"71KeyG", // 52:
		"70KeyF", // 53:
		"66KeyB", // 54:
		"86KeyV", // 55:
		"52Digit4", // 56:
		"51Digit3", // 57:
		"69KeyE", // 58:
		"87KeyW", // 59:
		"83KeyS", // 60:
		"68KeyD", // 61:
		"67KeyC", // 62:
		"88KeyX", // 63:
		"49Digit1", // 64:
		"50Digit2", // 65:
		"27Escape", // 66: esc
		"81KeyQ", // 67:
		"9Tab", // 68:
		"65KeyA", // 69:
		"20CapsLock", // 70: caps lock
		"89KeyZ,90KeyZ", // 71: DE,EN
		"38Numpad8", // 72: joy 0 up (arrow up)
		"40Numpad2", // 73: joy 0 down
		"37Numpad4", // 74: joy 0 left
		"39Numpad6", // 75: joy 0 right
		"12Numpad5,45Numpad0", // 76: joy 0 fire 2 (clear,...)
		"46NumpadDecimal", // 77: joy 0 fire 1
		null, // 78: ""? (joy 0 fire 3?)
		"8Backspace", // 79: del
		null, // 80:
		null, // 81:
		null, // 82:
		null, // 83:
		null, // 84:
		// not on CPC:
		"226IntlBackslash,60IntlBackslash,220IntlBackslash", // 85: < > | // key not on CPC! (Chrome: 226, FF: 60);  Android Bluetooth EN: 220IntlBackslash
		"111NumpadDivide", // 86:
		"106NumpadMultiply", // 87:
		"109NumpadSubtract", // 88:
		"107NumpadAdd", // 89:
		"36Numpad7", // 90: joy 0 up+left
		"33Numpad9", // 91: joy 0 up+right
		"35Numpad1", // 92: joy 0 down+left
		"34Numpad3" // 93: joy 0 down+right

		// only on PC:
		// "226IntlBackslash", "122F11", "123F12", "44PrintScreen", "145ScrollLock", "19Pause", "45Insert", "36Home", "33PageUp", "35End", "34PageDown", "111NumpadDivide", "106NumpadMultiply", "109NumpadSubtract", "107NumpadAdd"
	],

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
	aCpcKey2Ascii: [
		{
			key: "ArrowUp", // 0:
			text: "\u2191",
			title: "Cursor up"
		},
		{
			key: "ArrowRight", // 1:
			text: "\u2192",
			title: "Cursor right",
			style: 1
		},
		{
			key: "ArrowDown", // 2:
			text: "\u2193",
			title: "Cursor down"
		},
		{
			key: "9", // 3: numpad f9
			text: "f9",
			style: 1
		},
		{
			key: "6", // 4: numpad f6
			text: "f6",
			style: 1
		},
		{
			key: "3", // 5: numpad f3
			text: "f3",
			style: 1
		},
		{
			key: "Enter", // 6: numpad enter
			style: 4
		},
		{
			key: "." // 7: numpad .
		},
		{
			key: "ArrowLeft", // 8:
			text: "\u2190",
			title: "Cursor left",
			style: 1
		},
		{
			key: "Alt", // 9: copy
			text: "Copy",
			style: 2
		},
		{
			key: "7", // 10: numpad f7
			text: "f7",
			style: 1
		},
		{
			key: "8", // 11: numpad f8
			text: "f8",
			style: 1
		},
		{
			key: "5", // 12: numpad f5
			text: "f5",
			style: 1
		},
		{
			key: "1", // 13: numpad f1
			text: "f1",
			style: 1
		},
		{
			key: "2", // 14: numpad f2
			text: "f2",
			style: 1
		},
		{
			key: "0", // 15: numpad f0
			text: "f0",
			style: 1
		},
		{
			key: "Delete", // 16: clr
			text: "Clr",
			title: "Clear",
			style: 1
		},
		{
			key: "[~{" // 17: [ {
		},
		{
			key: "Enter", // 18: return
			text: "Ret",
			title: "Return",
			style: 2
		},
		{
			key: "]~}" // 19: ] }
		},
		{
			key: "4", // 20: numpad f4
			text: "f4",
			style: 1
		},
		{
			key: "Shift", // 21: shift left, shift right will be mapped (2 keys!)
			style: 4
		},
		{
			key: "\\~`" // 22: \ ` (different location, key!)
		},
		{
			key: "Control", // 23: Note: alt-gr also triggers ctrl-left and alt-gr!
			text: "Ctrl",
			title: "Control",
			style: 4
		},
		{
			key: "^~£" // 24: ^ £ (pound: \u00A3)
		},
		{
			key: "-~=" // 25: - =
		},
		{
			key: "@~|", // 26: @ |
			style: 1
		},
		{
			key: "p~P" // 27: P
		},
		{
			key: ";~+" // 28: ; +
		},
		{
			key: ":~*" // 29: : *
		},
		{
			key: "/~?" // 30: / ?
		},
		{
			key: ".~<" // 31: . <
		},
		{
			key: "0~_" // 32: 0 _
		},
		{
			key: "9~)" // 33: 9 )
		},
		{
			key: "o~O" // 34:
		},
		{
			key: "i~I" // 35:
		},
		{
			key: "l~L" // 36:
		},
		{
			key: "k~K" // 37:
		},
		{
			key: "m~M" // 38:
		},
		{
			key: ",~>" // 39: , >
		},
		{
			key: "8~(" // 40:
		},
		{
			key: "7~'" // 41:
		},
		{
			key: "u~U" // 42:
		},
		{
			key: "y~Y" // 43:
		},
		{
			key: "h~H" // 44:
		},
		{
			key: "j~J" // 45:
		},
		{
			key: "n~N" // 46:
		},
		{
			key: " ", // 47: space
			text: "Space",
			style: 5
		},
		{
			key: "6~&" // 48:
		},
		{
			key: "5~%" // 49:
		},
		{
			key: "r~R" // 50:
		},
		{
			key: "t~T" // 51:
		},
		{
			key: "g~G" // 52:
		},
		{
			key: "f~F" // 53:
		},
		{
			key: "b~B" // 54:
		},
		{
			key: "v~V" // 55:
		},
		{
			key: "4~$" // 56:
		},
		{
			key: "3~#" // 57:
		},
		{
			key: "e~E" // 58:
		},
		{
			key: "w~W" // 59:
		},
		{
			key: "s~S" // 60:
		},
		{
			key: "d~D" // 61:
		},
		{
			key: "c~C" // 62:
		},
		{
			key: "x~X" // 63:
		},
		{
			key: "1~!" // 64:
		},
		{
			key: "2~\"" // 65:
		},
		{
			key: "Escape", // 66: esc
			text: "Esc",
			title: "Escape",
			style: 1
		},
		{
			key: "q~Q" // 67:
		},
		{
			key: "Tab", // 68:
			style: 2
		},
		{
			key: "a~A" // 69:
		},
		{
			key: "CapsLock", // 70: caps lock
			text: "Caps",
			title: "Caps Lock",
			style: 3
		},
		{
			key: "z~Z" // 71:
		},
		// joystick currently not used on virtual keyboard:
		{
			key: "8" // 72: joy 0 up (arrow up)
		},
		{
			key: "2" // 73: joy 0 down
		},
		{
			key: "4" // 74: joy 0 left
		},
		{
			key: "6" // 75: joy 0 right
		},
		{
			key: "5" // 76: joy 0 fire 2 (clear,...)
		},
		{
			key: "." // 77: joy 0 fire 1
		},
		null, // 78: ""? (joy 0 fire 3?)
		{
			key: "Backspace", // 79: del
			text: "Del",
			title: "Delete",
			style: 1
		},
		null, // 80: unused...
		null, // 81:
		null, // 82:
		null, // 83:
		null, // 84:
		null, // 85:
		null, // 86:
		null, // 87:
		null, // 88:
		null, // 89:
		// not on CPC:
		{
			key: "7" // 90: joy 0 up+left
		},
		{
			key: "9" // 91: joy 0 up+right
		},
		{
			key: "1" // 92: joy 0 down+left
		},
		{
			key: "3" // 93: joy 0 down+right
		},
		null, // 94: unused
		{
			key: "Shift", // 95: shift right (special value to avoid duplicate key)
			style: 2
		},
		{
			key: "", // 96: dummy key
			text: "Num",
			title: "Num lock (no function)",
			style: 1
		}
	],


	/* eslint-disable array-element-newline */
	/*
	aVirtualKeyboard: [
		[66, 64, 65, 57, 56, 49, 48, 41, 40, 33, 32, 25, 24, 16, 79, 10, 11, 3],
		[68, 67, 59, 58, 50, 51, 43, 42, 35, 34, 27, 26, 17, 18, 20, 12, 4],
		[70, 69, 60, 61, 53, 52, 44, 45, 37, 36, 29, 28, 19, 96, 13, 14, 5],
		[21, 71, 63, 62, 55, 54, 46, 38, 39, 31, 30, 22, 95, 15, 0, 7],
		[23, 9, 47, 6, 8, 2, 1]
	],
	*/
	aVirtualKeyboardAlpha: [
		[66, 64, 65, 57, 56, 49, 48, 41, 40, 33, 32, 25, 24, 16, 79],
		[68, 67, 59, 58, 50, 51, 43, 42, 35, 34, 27, 26, 17, 18],
		[70, 69, 60, 61, 53, 52, 44, 45, 37, 36, 29, 28, 19, 96],
		[21, 71, 63, 62, 55, 54, 46, 38, 39, 31, 30, 22, 95],
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
		this.fnVirtualKeyout = this.onVirtualKeyboardKeyout.bind(this);
		if (window.PointerEvent) {
			keyboardArea.addEventListener("pointerdown", this.fnVirtualKeydown, false); // +clicked?
			keyboardArea.addEventListener("pointerup", this.fnVirtualKeyUp, false);
			keyboardArea.addEventListener("pointercancel", this.fnVirtualKeyUp, false);
			//keyboardArea.addEventListener("pointerout", this.onVirtualKeyboardKeyout.bind(this), false); //TTT use it? caps?
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
		var aCpcKey2Key = this.aCpcKey2Key,
			oKey2CpcKey = {},
			iCpcKey, sMappedKeys, aMappedKeys, i, sKey;

		for (iCpcKey = 0; iCpcKey < aCpcKey2Key.length; iCpcKey += 1) {
			sMappedKeys = aCpcKey2Key[iCpcKey];
			if (sMappedKeys) {
				aMappedKeys = sMappedKeys.split(","); // maybe more
				for (i = 0; i < aMappedKeys.length; i += 1) {
					sKey = aMappedKeys[i];
					oKey2CpcKey[sKey] = iCpcKey; //TTT String(iCpcKey);
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
			sCpcKey = String(iCpcKey),
			bKeyAlreadyPressed, oCpcKey, oExpansions, iExpKey, i;

		oCpcKey = oPressedKeys[sCpcKey];
		if (!oCpcKey) {
			oPressedKeys[sCpcKey] = {
				oKeys: {}
			};
			oCpcKey = oPressedKeys[sCpcKey];
		}
		bKeyAlreadyPressed = oCpcKey.oKeys[sPressedKey];
		oCpcKey.oKeys[sPressedKey] = true;
		oCpcKey.shift = bShiftKey;
		oCpcKey.ctrl = bCtrlKey;
		if (Utils.debug > 1) {
			Utils.console.log("fnPressCpcKey: sPressedKey=" + sPressedKey + ", sKey=" + sKey + ", affected cpc key=" + sCpcKey);
		}

		oExpansions = oCpcKeyExpansions.repeat;
		if (bKeyAlreadyPressed && ((sCpcKey in oExpansions) && !oExpansions[sCpcKey])) {
			sKey = ""; // repeat off => ignore key
		} else {
			if (bCtrlKey) {
				oExpansions = oCpcKeyExpansions.ctrl;
			} else if (bShiftKey) {
				oExpansions = oCpcKeyExpansions.shift;
			} else {
				oExpansions = oCpcKeyExpansions.normal;
			}

			if (sCpcKey in oExpansions) {
				iExpKey = oExpansions[sCpcKey];
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

	fnReleaseCpcKey: function (iCpcKey, sPressedKey, sKey, bShiftKey, bCtrlKey) {
		var oPressedKeys = this.oPressedKeys,
			oCpcKey;

		oCpcKey = oPressedKeys[iCpcKey];
		if (Utils.debug > 1) {
			Utils.console.log("fnReleaseCpcKey: sPressedKey=" + sPressedKey + ", sKey=" + sKey + ", affected cpc key=" + iCpcKey + ", oKeys:", (oCpcKey ? oCpcKey.oKeys : "undef."));
		}
		if (!oCpcKey) {
			Utils.console.warn("fnReleaseCpcKey: cpcKey was not pressed:", iCpcKey);
		} else {
			delete oCpcKey.oKeys[sPressedKey];
			if (!Object.keys(oCpcKey.oKeys).length) {
				delete oPressedKeys[iCpcKey];
			} else {
				oCpcKey.shift = bShiftKey;
				oCpcKey.ctrl = bCtrlKey;
			}
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
			if (iCpcKey === 85) { // map virtual cpc key 85 to 22 (english keyboard)
				iCpcKey = 22;
			}
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
		} else if (sKey.length === 1) { // put normal keys in buffer, ignore special keys with more than 1 character
			this.putKeyInBuffer(sKey);
			Utils.console.log("fnKeyboardKeydown: Partly unhandled key", sPressedKey + ":", sKey);
		} else {
			Utils.console.log("fnKeyboardKeydown: Unhandled key", sPressedKey + ":", sKey);
		}
	},

	fnKeyboardKeyup: function (event) {
		var iKeyCode = event.which || event.keyCode,
			sPressedKey = iKeyCode,
			sKey = event.key,
			iCpcKey;

		if (event.code) { // available for e.g. Chrome, Firefox
			sPressedKey += event.code;
		}

		if (Utils.debug > 1) {
			Utils.console.log("fnKeyboardKeyup: keyCode=" + iKeyCode + " pressedKey=" + sPressedKey + " key='" + event.key + "' " + event.key.charCodeAt(0) + " ", event);
		}

		if (sPressedKey in this.oKey2CpcKey) {
			iCpcKey = this.oKey2CpcKey[sPressedKey];
			if (iCpcKey === 85) { // map virtual cpc key 85 to 22 (english keyboard)
				iCpcKey = 22;
			}
			/*
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
			*/
			this.fnReleaseCpcKey(iCpcKey, sPressedKey, sKey, event.shiftKey, event.ctrlKey);

			/*
			if (Utils.debug > 1) {
				Utils.console.log("fnKeyboardKeyup: sPressedKey=" + sPressedKey + ", affected cpc key=" + iCpcKey + ", oKeys:", (oCpcKey ? oCpcKey.oKeys : "undef."));
			}
			*/
		} else {
			Utils.console.log("fnKeyboardKeyup: Unhandled key", sPressedKey + ":", sKey);
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


	/*
	setButtons: function (sId, aOptions) {
		var place, //= document.getElementById(sId),
			buttonList, i, oItem, option;

		//buttonList = document.getElementById("keyboardAlpha");
		buttonList = document.createElement("div");
		buttonList.className = "kbdAlpha";
		for (i = 0; i < aOptions.length - 3; i += 1) {
			oItem = aOptions[i];
			option = document.createElement("button");
			option.id = oItem.id;
			option.innerText = oItem.text;
			option.setAttribute("title", oItem.title);
			option.className = oItem.className;
			buttonList.insertAdjacentElement("beforeEnd", option);
		}

		place = document.getElementById("keyboardAlpha");
		place.insertAdjacentElement("beforeEnd", buttonList);

		buttonList = document.createElement("div");
		buttonList.className = "kbdNumpad";
		for (i = aOptions.length - 3; i < aOptions.length; i += 1) {
			oItem = aOptions[i];
			option = document.createElement("button");
			option.id = oItem.id;
			option.innerText = oItem.text;
			option.setAttribute("title", oItem.title);
			option.className = oItem.className;
			buttonList.insertAdjacentElement("beforeEnd", option);
		}
		place = document.getElementById("keyboardNum");
		place.insertAdjacentElement("beforeEnd", buttonList);
		return this;
	},
	*/

	/*
	virtualKeyboardCreate: function () {
		var bShiftLock = this.bShiftLock,
			aCpcKey2Ascii = this.aCpcKey2Ascii,
			oKeyArea = document.getElementById("keyboardArea"),
			aButtons = oKeyArea.getElementsByTagName("button"),
			aOptions, iRow, iCol, aRow, iCpcKey, oKey, sKey, aKey, sClassName, oOptions;

		if (!aButtons.length) {
			for (iRow = 0; iRow < this.aVirtualKeyboard.length; iRow += 1) {
				aRow = this.aVirtualKeyboard[iRow];
				aOptions = [];
				for (iCol = 0; iCol < aRow.length; iCol += 1) {
					iCpcKey = aRow[iCol];
					oKey = aCpcKey2Ascii[iCpcKey];
					sKey = (oKey.text !== undefined) ? oKey.text : oKey.key;
					if (sKey.indexOf("~") >= 0) {
						aKey = sKey.split("~");
						sKey = bShiftLock ? aKey[1] : aKey[0];
					}

					sClassName = "kbdButton" + (oKey.style || "");
					if (iCol === aRow.length - 1 || iCol === aRow.length - 3) { // last column //TTT
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
	*/

	setButtons: function (sId, aOptions) {
		var place = document.getElementById(sId),
			buttonList, i, oItem, option;

		//buttonList = document.getElementById("keyboardAlpha");
		buttonList = document.createElement("div");
		buttonList.className = "kbdFlex";
		for (i = 0; i < aOptions.length; i += 1) {
			oItem = aOptions[i];
			option = document.createElement("button");
			option.id = oItem.id;
			option.innerText = oItem.text;
			option.setAttribute("title", oItem.title);
			option.className = oItem.className;
			buttonList.insertAdjacentElement("beforeEnd", option);
		}

		//place = document.getElementById("keyboardAlpha");
		place.insertAdjacentElement("beforeEnd", buttonList);

		/*
		buttonList = document.createElement("div");
		buttonList.className = "kbdNumpad";
		for (i = aOptions.length - 3; i < aOptions.length; i += 1) {
			oItem = aOptions[i];
			option = document.createElement("button");
			option.id = oItem.id;
			option.innerText = oItem.text;
			option.setAttribute("title", oItem.title);
			option.className = oItem.className;
			buttonList.insertAdjacentElement("beforeEnd", option);
		}
		place = document.getElementById("keyboardNum");
		place.insertAdjacentElement("beforeEnd", buttonList);
		*/
		return this;
	},

	virtualKeyboardCreatePart: function (id, aVirtualKeyboard) {
		var bShiftLock = this.bShiftLock,
			aCpcKey2Ascii = this.aCpcKey2Ascii,
			oKeyArea = document.getElementById(id),
			aButtons = oKeyArea.getElementsByTagName("button"),
			aOptions, iRow, iCol, aRow, iCpcKey, oKey, sKey, aKey, sClassName, oOptions;

		if (!aButtons.length) { // not yet created?
			for (iRow = 0; iRow < aVirtualKeyboard.length; iRow += 1) {
				aRow = aVirtualKeyboard[iRow];
				aOptions = [];
				for (iCol = 0; iCol < aRow.length; iCol += 1) {
					iCpcKey = aRow[iCol];
					oKey = aCpcKey2Ascii[iCpcKey];
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
				this.setButtons(id, aOptions);
			}
		}
	},

	virtualKeyboardCreate: function () {
		this.virtualKeyboardCreatePart("keyboardAlpha", this.aVirtualKeyboardAlpha);
		this.virtualKeyboardCreatePart("keyboardNum", this.aVirtualKeyboardNum);
	},

	virtualKeyboardAdaptKeys: function (bShiftLock) {
		var oKeyArea = document.getElementById("keyboardArea"),
			aButtons = oKeyArea.getElementsByTagName("button"), // or: oKeyArea.childNodes and filter
			i, oButton, sId, iCpcKey, oKey, sKey, aKey;

		for (i = 0; i < aButtons.length; i += 1) {
			oButton = aButtons[i];
			sId = oButton.id;
			iCpcKey = parseInt(sId, 10);

			oKey = this.aCpcKey2Ascii[iCpcKey];
			if (oKey) {
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

	fnVirtualGetPressedKey: function (iCpcKey) {
		var sPressedKey = "";

		if (this.aCpcKey2Key[iCpcKey]) {
			sPressedKey = this.aCpcKey2Key[iCpcKey];
			if (sPressedKey.indexOf(",") >= 0) { // TTT maybe more
				sPressedKey = sPressedKey.substring(0, sPressedKey.indexOf(",")); // take the first
			}
		}
		return sPressedKey;
	},

	fnVirtualGetPressedAscii: function (iCpcKey, bShiftKey) {
		var oKey = this.aCpcKey2Ascii[iCpcKey],
			sKey = "",
			aKey;

		if (oKey) {
			sKey = oKey.key;
			if (sKey.indexOf("~") >= 0) {
				aKey = sKey.split("~");
				sKey = (this.bShiftLock || bShiftKey) ? aKey[1] : aKey[0];
			}
		}
		return sKey;
	},

	onVirtualKeyboardKeydown: function (event) {
		var sId = event.target.id,
			iCpcKey, sPressedKey, sKey;

		if (Utils.debug > 1) {
			Utils.console.log("DEBUG: onVirtualKeyboardKeydown: event=", event);
		}

		if (Utils.stringEndsWith(sId, "Key")) {
			iCpcKey = parseInt(sId, 10);
			if (iCpcKey === 95) { // map pseudo key right shift to left shift
				iCpcKey = 21;
			}
			sPressedKey = this.fnVirtualGetPressedKey(iCpcKey);
			sKey = this.fnVirtualGetPressedAscii(iCpcKey, event.shiftKey);

			this.fnPressCpcKey(iCpcKey, sPressedKey, sKey, event.shiftKey, event.ctrlKey);
		}

		if (event.type === "pointerdown") {
			event.target.addEventListener("pointerout", this.fnVirtualKeyout, false);
		}
		event.preventDefault();
		return false;
	},

	fnVirtualKeyboardKeyupOrKeyout: function (event) {
		var sId = event.target.id,
			iCpcKey, sPressedKey, sKey;

		if (Utils.stringEndsWith(sId, "Key")) {
			iCpcKey = parseInt(sId, 10);
			if (iCpcKey === 95) { // map pseudo key right shift to left shift
				iCpcKey = 21;
			}
			/*
			oCpcKey = oPressedKeys[iCpcKey];
			if (!oCpcKey) {
				Utils.console.warn("fnKeyboardKeyup: cpcKey was not pressed:", iCpcKey);
			} else {
				delete oPressedKeys[iCpcKey];
			}
			*/

			sPressedKey = this.fnVirtualGetPressedKey(iCpcKey);
			sKey = this.fnVirtualGetPressedAscii(iCpcKey, event.shiftKey);

			this.fnReleaseCpcKey(iCpcKey, sPressedKey, sKey, event.shiftKey, event.ctrlKey);

			if (iCpcKey === 70) { // Caps Lock?
				this.bShiftLock = !this.bShiftLock;
				this.virtualKeyboardAdaptKeys(this.bShiftLock);
			}
		}
	},

	onVirtualKeyboardKeyup: function (event) {
		if (Utils.debug > 1) {
			Utils.console.log("DEBUG: onVirtualKeyboardKeyup: event=", event);
		}

		this.fnVirtualKeyboardKeyupOrKeyout(event);

		if (event.type === "pointerup") {
			event.target.removeEventListener("pointerout", this.fnVirtualKeyout); //TTT
		}
		event.preventDefault();
		return false;
	},

	onVirtualKeyboardKeyout: function (event) {
		if (Utils.debug > 1) {
			Utils.console.log("DEBUG: onVirtualKeyboardKeyout: event=", event);
		}
		this.fnVirtualKeyboardKeyupOrKeyout(event);
		if (event.type === "pointerout") {
			event.target.removeEventListener("pointerout", this.fnVirtualKeyout);
		}
		event.preventDefault();
		return false;
	}
};
