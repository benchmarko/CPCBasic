// Polyfills.js - Some Polyfills for old browsers, e.g. IE9
//
/* globals Utils */

"use strict";

// Some polyfills for old browsers, e.g. IE 11 (which is not fully supported)
if (!Math.sign) {
	Math.sign = function (x) {
		return ((x > 0) - (x < 0)) || +x; // eslint-disable-line no-implicit-coercion
	};
}

if (!Object.assign) {
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

if (!Object.keys) { // old IE8
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

if (!String.prototype.includes) {
	String.prototype.includes = function (search, start) { // eslint-disable-line no-extend-native
		var bRet;

		if (start + search.length > this.length) {
			bRet = false;
		} else {
			bRet = this.indexOf(search, start) !== -1;
		}
		return bRet;
	};
}

if (!String.prototype.padStart) {
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

if (!String.prototype.repeat) {
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

if (!String.prototype.trim) { // old IE8
	String.prototype.trim = function () { // eslint-disable-line no-extend-native
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
	};
}

// Old IE 9: window.console is only available when Dev Tools are open
if (!Utils.console) {
	Utils.console = {
		log: function () { } // eslint-disable-line no-empty-function
	};
	Utils.console.info = Utils.console.log;
	Utils.console.warn = Utils.console.log;
	Utils.console.error = Utils.console.log;
	Utils.console.debug = Utils.console.log;
}

// Old IE 9 has no ArrayBuffer
if (!window.ArrayBuffer) {
	window.ArrayBuffer = Array;
}

// Older browsers, e.g. SliTaz tazweb browser, IE9
// https://wiki.selfhtml.org/wiki/JavaScript/Window/requestAnimationFrame
(function () {
	var lastTime = 0;

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function (callback /* , element */) {
			var currTime = new Date().getTime(),
				timeToCall = Math.max(0, 16 - (currTime - lastTime)),
				id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);

			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
	}
}());

// For IE and Edge it is only available if page is hosted on web server, so we simulate it (do not use property "length" or method names as keys!)
if (!Utils.localStorage) {
	(function () {
		var Storage = function () {
			this.clear();
		};

		Storage.prototype = {
			clear: function () {
				var item;

				for (item in this) {
					if (this.hasOwnProperty(item)) {
						delete this.item;
					}
				}
				this.length = 0;
			},
			key: function (index) {
				var i = 0,
					item;

				for (item in this) {
					if (this.hasOwnProperty(item)) {
						if (i === index) {
							return item;
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

// old IE8
if (!Array.prototype.map) {
	// based on: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/map
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

if (!Function.prototype.bind) {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
	// Does not work with `new funcA.bind(thisArg, args)`
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

// old IE8

if (!Event.prototype.preventDefault) {
	Event.prototype.preventDefault = function () {	}; // eslint-disable-line no-empty-function
}


if (!Event.prototype.stopPropagation) {
	Event.prototype.stopPropagation = function () {	}; // eslint-disable-line no-empty-function
}

if (!Element.prototype.addEventListener) {
	Element.prototype.addEventListener = function (e, callback) {
		e = "on" + e;
		return this.attachEvent(e, callback);
	};
}

if (!Element.prototype.removeEventListener) {
	Element.prototype.removeEventListener = function (e, callback) {
		e = "on" + e;
		return this.detachEvent(e, callback);
	};
}

if (!document.addEventListener) {
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
						eventListeners.push({ //TTT does this work?
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

// or check: https://gist.github.com/fuzzyfox/6762206

// IE8
if (!Date.now) {
	Date.now = function () {
		return new Date().getTime();
	};
}

// end
