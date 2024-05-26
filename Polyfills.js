// Polyfills.js - Some Polyfills for old browsers, e.g. IE8
//

/* globals globalThis */

"use strict";

var Utils, Polyfills;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

Polyfills = { // eslint-disable-line no-unused-vars
	iCount: 0
	// empty
};

// IE: window.console is only available when Dev Tools are open
if (!Utils.console) {
	Utils.console = {
		cpcBasicLog: "LOG:\n",
		log: function () { // varargs
			if (Utils.console.cpcBasicLog) {
				Utils.console.cpcBasicLog += Array.prototype.slice.call(arguments).join(" ") + "\n";
			}
		}
	};
	Utils.console.info = Utils.console.log;
	Utils.console.warn = Utils.console.log;
	Utils.console.error = Utils.console.log;
	Utils.console.debug = Utils.console.log;
}

if (!Utils.console.debug) { // IE8 has no console.debug
	Utils.console.debug = Utils.console.log;
	Utils.console.debug("Polyfill: window.console.debug");
}

if ((typeof globalThis !== "undefined") && !globalThis.window) { // nodeJS
	Utils.console.debug("Polyfill: window");
	globalThis.window = {};
}

if (!Array.prototype.filter) { // IE8
	Array.prototype.filter = function (callbackFn) { // eslint-disable-line no-extend-native
		var arr = [],
			i;

		for (i = 0; i < this.length; i += 1) {
			if (callbackFn.call(this, this[i], i, this)) {
				arr.push(this[i]);
			}
		}
		return arr;
	};
}

if (!Array.prototype.indexOf) { // IE8
	Array.prototype.indexOf = function (element, iFrom) { // eslint-disable-line no-extend-native
		var iLen = this.length >>> 0; // eslint-disable-line no-bitwise

		iFrom = Number(iFrom) || 0;
		iFrom = (iFrom < 0) ? Math.ceil(iFrom) : Math.floor(iFrom);
		if (iFrom < 0) {
			iFrom += iLen;
		}

		for (; iFrom < iLen; iFrom += 1) {
			if (iFrom in this && this[iFrom] === element) {
				return iFrom;
			}
		}
		return -1;
	};
}

if (!Array.prototype.map) { // IE8
	// based on: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/map
	Utils.console.debug("Polyfill: Array.prototype.map");
	Array.prototype.map = function (callback, thisArg) { // eslint-disable-line no-extend-native,func-names
		var aValues = [],
			oObject = Object(this),
			len = oObject.length,
			T, i, kValue, mappedValue;

		if (arguments.length > 1) {
			T = thisArg;
		}

		for (i = 0; i < len; i += 1) {
			if (i in oObject) {
				kValue = oObject[i];
				mappedValue = callback.call(T, kValue, i, oObject);
				aValues[i] = mappedValue;
			}
		}
		return aValues;
	};
}

if (window.Element) {
	if (!Element.prototype.addEventListener) { // IE8
		Utils.console.debug("Polyfill: Element.prototype.addEventListener");
		Element.prototype.addEventListener = function (e, callback) {
			e = "on" + e;
			return this.attachEvent(e, callback);
		};
	}

	if (!Element.prototype.removeEventListener) { // IE8
		Utils.console.debug("Polyfill: Element.prototype.removeEventListener");
		Element.prototype.removeEventListener = function (e, callback) {
			e = "on" + e;
			return this.detachEvent(e, callback);
		};
	}
}

if (window.Event) {
	// https://stackoverflow.com/questions/17102300/prototype-event-stoppropagation-for-ie-8
	if (!Event.prototype.preventDefault) { // IE8
		Utils.console.debug("Polyfill: Event.prototype.preventDefault");
		Event.prototype.preventDefault = function () {
			this.returnValue = false;
		};
	}

	if (!Event.prototype.stopPropagation) { // IE8
		Utils.console.debug("Polyfill: Event.prototype.stopPropagation");
		Event.prototype.stopPropagation = function () {
			this.cancelBubble = true;
		};
	}
}

if (!Date.now) { // IE8
	Utils.console.debug("Polyfill: Date.now");
	Date.now = function () {
		return new Date().getTime();
	};
}


if (window.document) {
	if (!document.addEventListener) {
		// or check: https://gist.github.com/fuzzyfox/6762206
		Utils.console.debug("Polyfill: document.addEventListener, removeEventListener");
		if (document.attachEvent) {
			(function () {
				var eventListeners = [];

				document.addEventListener = function (sEvent, fnHandler) {
					var fnFindCaret = function (event) {
							var oRange, oRange2;

							if (document.selection) {
								event.target.focus();
								oRange = document.selection.createRange();
								oRange2 = oRange.duplicate();
								if (oRange2.moveToElementTxt) { // not on IE8
									oRange2.moveToElementTxt(event.target);
								}
								oRange2.setEndPoint("EndToEnd", oRange);
								event.target.selectionStart = oRange2.text.length - oRange.text.length;
								event.target.selectionEnd = event.target.selectionStart + oRange.text.length;
							}
						},
						fnOnEvent = function (event) {
							event = event || window.event;
							event.target = event.target || event.srcElement;
							if (event.type === "click" && event.target && event.target.tagName === "TEXTAREA") {
								fnFindCaret(event);
							}
							fnHandler(event);
							return false;
						},
						aElements, i;

					// The change event is not bubbled and fired on document for old IE8. So attach it to every select tag
					if (sEvent === "change") {
						aElements = document.getElementsByTagName("select");
						for (i = 0; i < aElements.length; i += 1) {
							aElements[i].attachEvent("on" + sEvent, fnOnEvent);
							eventListeners.push({ // TODO: does this work?
								object: this,
								sEvent: sEvent,
								fnHandler: fnHandler,
								fnOnEvent: fnOnEvent
							});
						}
					} else { // e.g. "Click"
						document.attachEvent("on" + sEvent, fnOnEvent);
						eventListeners.push({
							object: this,
							sEvent: sEvent,
							fnHandler: fnHandler,
							fnOnEvent: fnOnEvent
						});
					}
				};

				document.removeEventListener = function (sEvent, fnHandler) {
					var counter = 0,
						eventListener;

					while (counter < eventListeners.length) {
						eventListener = eventListeners[counter];
						if (eventListener.object === this && eventListener.sEvent === sEvent && eventListener.fnHandler === fnHandler) {
							this.detachEvent("on" + sEvent, eventListener.fnOnEvent);
							eventListeners.splice(counter, 1);
							break;
						}
						counter += 1;
					}
				};
			}());
		} else {
			Utils.console.log("No document.attachEvent found."); // will be ignored
			// debug: trying to fix
			if (document.__proto__.addEventListener) { // eslint-disable-line no-proto
				document.addEventListener = document.__proto__.addEventListener; // eslint-disable-line no-proto
			}
		}
	}
}

if (!Function.prototype.bind) { // IE8
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
	// Does not work with `new funcA.bind(thisArg, args)`
	Utils.console.debug("Polyfill: Function.prototype.bind");
	(function () {
		var ArrayPrototypeSlice = Array.prototype.slice; // since IE6

		Function.prototype.bind = function (/* otherThis */) { // eslint-disable-line no-extend-native
			var that = this,
				thatArg = arguments[0],
				args = ArrayPrototypeSlice.call(arguments, 1),
				argLen = args.length;

			if (typeof that !== "function") {
				// closest thing possible to the ECMAScript 5 internal IsCallable function
				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}
			return function () {
				args.length = argLen;
				args.push.apply(args, arguments);
				return that.apply(thatArg, args);
			};
		};
	}());
}

if (!Math.log10) { // IE11
	Utils.console.debug("Polyfill: Math.log10");
	Math.log10 = function (x) {
		return Math.log(x) * Math.LOG10E;
	};
}

if (!Math.sign) { // IE11
	Utils.console.debug("Polyfill: Math.sign");
	Math.sign = function (x) {
		return (Number(x > 0) - Number(x < 0)) || Number(x);
	};
}

if (!Math.trunc) { // IE11
	Utils.console.debug("Polyfill: Math.trunc");
	Math.trunc = function (v) {
		return v < 0 ? Math.ceil(v) : Math.floor(v);
	};
}

if (!Object.assign) { // IE11
	Utils.console.debug("Polyfill: Object.assign");
	Object.assign = function (oTarget) { // varargs // Object.assign is ES6, not in IE
		var oTo = oTarget,
			i,
			oNextSource,
			sNextKey;

		for (i = 1; i < arguments.length; i += 1) {
			oNextSource = arguments[i];
			for (sNextKey in oNextSource) {
				if (oNextSource.hasOwnProperty(sNextKey)) {
					oTo[sNextKey] = oNextSource[sNextKey];
				}
			}
		}
		return oTo;
	};
}

if (!Object.create) { // IE8
	Utils.console.debug("Polyfill: Object.create");
	Object.create = function (proto) { // props are not supported
		function Ctor() {
			// empty
		}
		Ctor.prototype = proto;
		return new Ctor();
	};
}

if (!Object.keys) { // IE8
	Utils.console.debug("Polyfill: Object.keys");
	// https://tokenposts.blogspot.com/2012/04/javascript-objectkeys-browser.html
	Object.keys = function (o) {
		var k = [],
			p;

		if (o !== Object(o)) {
			throw new TypeError("Object.keys called on a non-object");
		}
		for (p in o) {
			if (Object.prototype.hasOwnProperty.call(o, p)) {
				k.push(p);
			}
		}
		return k;
	};
}

if (!String.prototype.endsWith) {
	Utils.console.debug("Polyfill: String.prototype.endsWith");
	String.prototype.endsWith = function (sSearch, iPosition) { // eslint-disable-line no-extend-native
		var iLastIndex;

		if (iPosition === undefined) {
			iPosition = this.length;
		}
		iPosition -= sSearch.length;
		iLastIndex = this.indexOf(sSearch, iPosition);
		return iLastIndex !== -1 && iLastIndex === iPosition;
	};
}

if (!String.prototype.includes) { // IE11
	Utils.console.debug("Polyfill: String.prototype.includes");
	String.prototype.includes = function (sSearch, iStart) { // eslint-disable-line no-extend-native
		var bRet;

		if (iStart + sSearch.length > this.length) {
			bRet = false;
		} else {
			bRet = this.indexOf(sSearch, iStart) !== -1;
		}
		return bRet;
	};
}

if (!String.prototype.padStart) { // IE11
	Utils.console.debug("Polyfill: String.prototype.padStart");
	String.prototype.padStart = function (iTargetLength, sPad) { // eslint-disable-line no-extend-native
		var sRet = String(this);

		iTargetLength >>= 0; // eslint-disable-line no-bitwise
		if (this.length < iTargetLength) {
			sPad = String(typeof sPad !== "undefined" ? sPad : " ");
			iTargetLength -= this.length;
			if (iTargetLength > sPad.length) {
				sPad += sPad.repeat(iTargetLength / sPad.length);
			}
			sRet = sPad.slice(0, iTargetLength) + sRet;
		}
		return sRet;
	};
}

if (!String.prototype.padEnd) { // IE11
	// based on: https://github.com/behnammodi/polyfill/blob/master/string.polyfill.js
	Utils.console.debug("Polyfill: String.prototype.padEnd");
	String.prototype.padEnd = function (iTargetLength, sPad) { // eslint-disable-line no-extend-native
		var sRet = String(this);

		iTargetLength >>= 0; // eslint-disable-line no-bitwise
		if (this.length < iTargetLength) {
			sPad = String(typeof sPad !== "undefined" ? sPad : " ");
			iTargetLength -= this.length;
			if (iTargetLength > sPad.length) {
				sPad += sPad.repeat(iTargetLength / sPad.length);
			}
			sRet += sPad.slice(0, iTargetLength); // this line differs from padStart
		}
		return sRet;
	};
}

if (!String.prototype.repeat) { // IE11
	Utils.console.debug("Polyfill: String.prototype.repeat");
	String.prototype.repeat = function (iCount) { // eslint-disable-line no-extend-native
		var sStr = String(this),
			sOut = "",
			i;

		for (i = 0; i < iCount; i += 1) {
			sOut += sStr;
		}
		return sOut;
	};
}

if (!String.prototype.startsWith) {
	Utils.console.debug("Polyfill: String.prototype.startsWith");
	String.prototype.startsWith = function (sSearch, iPosition) { // eslint-disable-line no-extend-native
		iPosition = iPosition || 0;
		return this.indexOf(sSearch, iPosition) === iPosition;
	};
}

if (!String.prototype.trim) { // IE8
	Utils.console.debug("Polyfill: String.prototype.trim");
	String.prototype.trim = function () { // eslint-disable-line no-extend-native
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
	};
}

if (!String.prototype.trimEnd) {
	Utils.console.debug("Polyfill: String.prototype.trimEnd");
	String.prototype.trimEnd = function () { // eslint-disable-line no-extend-native
		return this.replace(/[\s\uFEFF\xA0]+$/, "");
	};
}

// based on: https://github.com/mathiasbynens/base64/blob/master/base64.js
// https://mths.be/base64 v0.1.0 by @mathias | MIT license
if (!Utils.atob) { // IE9 (and node.js?)
	Utils.console.debug("Polyfill: window.atob, btoa");
	(function () {
		var TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
			REGEX_SPACE_CHARACTERS = /[\t\n\f\r ]/g; // http://whatwg.org/html/common-microsyntaxes.html#space-character

		/* eslint-disable no-bitwise */
		Utils.atob = function (input) { // decode
			var bitCounter = 0,
				output = "",
				position = 0,
				bitStorage, buffer, length;

			input = String(input).replace(REGEX_SPACE_CHARACTERS, "");
			length = input.length;
			if (length % 4 === 0) {
				input = input.replace(/[=]=?$/, ""); // additional brackets to maks eslint happy
				length = input.length;
			}
			if (length % 4 === 1 || (/[^+a-zA-Z0-9/]/).test(input)) { // http://whatwg.org/C#alphanumeric-ascii-characters
				throw new TypeError("Polyfills:atob: Invalid character: the string to be decoded is not correctly encoded.");
			}

			while (position < length) {
				buffer = TABLE.indexOf(input.charAt(position));
				bitStorage = bitCounter % 4 ? bitStorage * 64 + buffer : buffer;

				bitCounter += 1;
				if ((bitCounter - 1) % 4) { // Unless this is the first of a group of 4 characters...
					output += String.fromCharCode(0xFF & bitStorage >> (-2 * bitCounter & 6)); // ...convert the first 8 bits to a single ASCII character
				}
				position += 1;
			}
			return output;
		};

		Utils.btoa = function (input) { // encode
			var output = "",
				position = 0,
				padding, length, a, b, c, buffer;

			input = String(input);
			if ((/[^\0-\xFF]/).test(input)) {
				throw new TypeError("Polyfills:btoa: The string to be encoded contains characters outside of the Latin1 range.");
			}
			padding = input.length % 3;
			length = input.length - padding; // Make sure any padding is handled outside of the loop

			while (position < length) {
				// Read three bytes, i.e. 24 bits.
				a = input.charCodeAt(position) << 16;
				position += 1;
				b = input.charCodeAt(position) << 8;
				position += 1;
				c = input.charCodeAt(position);
				position += 1;
				buffer = a + b + c;
				// Turn the 24 bits into four chunks of 6 bits each, and append the matching character for each of them to the output
				output += TABLE.charAt(buffer >> 18 & 0x3F) + TABLE.charAt(buffer >> 12 & 0x3F) + TABLE.charAt(buffer >> 6 & 0x3F) + TABLE.charAt(buffer & 0x3F);
			}

			if (padding === 2) {
				a = input.charCodeAt(position) << 8;
				position += 1;
				b = input.charCodeAt(position);
				buffer = a + b;
				output += TABLE.charAt(buffer >> 10) + TABLE.charAt((buffer >> 4) & 0x3F) + TABLE.charAt((buffer << 2) & 0x3F) + "=";
			} else if (padding === 1) {
				buffer = input.charCodeAt(position);
				output += TABLE.charAt(buffer >> 2) + TABLE.charAt((buffer << 4) & 0x3F) + "==";
			}
			return output;
		};
		/* eslint-enable no-bitwise */
	}());
}

// For IE and Edge, localStorage is only available if page is hosted on web server, so we simulate it (do not use property "length" or method names as keys!)
if (!Utils.localStorage) {
	Utils.console.debug("Polyfill: window.localStorage");
	(function () {
		var Storage = function () {
			this.clear();
		};

		Storage.prototype = {
			clear: function () {
				var key;

				for (key in this) {
					if (this.hasOwnProperty(key)) {
						delete this[key];
					}
				}
				this.length = 0;
			},
			key: function (index) {
				var i = 0,
					key;

				for (key in this) {
					if (this.hasOwnProperty(key) && key !== "length") {
						if (i === index) {
							return key;
						}
						i += 1;
					}
				}
				return null;
			},
			getItem: function (key) {
				return this.hasOwnProperty(key) ? this[key] : null;
			},
			setItem: function (key, value) {
				if (this.getItem(key) === null) {
					this.length += 1;
				}
				this[key] = String(value);
			},
			removeItem: function (key) {
				if (this.getItem(key) !== null) {
					delete this[key];
					this.length -= 1;
				}
			}
		};
		Utils.localStorage = new Storage();
	}());
}

if (!window.ArrayBuffer) { // IE9
	Utils.console.debug("Polyfill: window.ArrayBuffer");
	window.ArrayBuffer = Array;
}

if (!window.AudioContext) { // ? not for IE
	window.AudioContext = window.webkitAudioContext || window.mozAudioContext;
	if (window.AudioContext) {
		Utils.console.debug("Polyfill: window.AudioContext");
	} else {
		Utils.console.warn("Polyfill: window.AudioContext: not ok!");
	}
}

if (!window.JSON) { // simple polyfill for JSON.parse only
	// for a better implementation, see https://github.com/douglascrockford/JSON-js/blob/master/json2.js
	Utils.console.debug("Polyfill: window.JSON.parse");
	window.JSON = {
		parse: function (sText) {
			var oJson = eval("(" + sText + ")"); // eslint-disable-line no-eval

			return oJson;
		},
		stringify: function (o) {
			Utils.console.error("Not implemented: window.JSON.stringify");
			return String(o);
		}
	};
}

if (!window.requestAnimationFrame) { // IE9, SliTaz tazweb browser
	// https://wiki.selfhtml.org/wiki/JavaScript/Window/requestAnimationFrame
	window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.cancelAnimationFrame = window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
	if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
		(function () {
			var lastTime = 0;

			Utils.console.debug("Polyfill: window.requestAnimationFrame, cancelAnimationFrame");
			window.requestAnimationFrame = function (callback /* , element */) {
				var currTime = new Date().getTime(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime)),
					id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);

				lastTime = currTime + timeToCall;
				return id;
			};
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
		}());
	} else {
		Utils.console.debug("Polyfill: window.requestAnimationFrame, cancelAnimationFrame: Using vendor specific method.");
	}
}

if (!window.Uint8Array) { // IE9
	Utils.console.debug("Polyfill: Uint8Array (fallback only)");
	window.Uint8Array = function (oArrayBuffer) {
		return oArrayBuffer; // we just return the ArrayBuffer as fallback; enough for our needs
	};
	// A more complex solution would be: https://github.com/inexorabletash/polyfill/blob/master/typedarray.js
}

Utils.console.debug("Polyfill: end of Polyfills");

// end
