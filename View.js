// View.js - View
//
/* globals Utils */

"use strict";


function View(options) {
	this.init(options);
}

View.fnEventHandler = null;

View.prototype = {
	init: function (/* options */) {
		this.bDirty = false;
	},

	getHidden: function (sId) {
		return document.getElementById(sId).hidden;
	},
	setHidden: function (sId, bHidden) {
		var element = document.getElementById(sId);

		element.hidden = bHidden;
		element.style.display = (bHidden) ? "none" : "block"; // for old browsers
		return this;
	},
	toogleHidden: function (sId) {
		return this.setHidden(sId, !this.getHidden(sId));
	},

	getAreaValue: function (sId) {
		var area = document.getElementById(sId);

		return area.value;
	},
	setAreaValue: function (sId, sValue) {
		var area = document.getElementById(sId);

		area.value = sValue;
		return this;
	},

	fnSetSelectionRange: function (textarea, selectionStart, selectionEnd) {
		var fullText, scrollHeight, scrollTop, textareaHeight;

		// First scroll selection region to view
		fullText = textarea.value;
		textarea.value = fullText.substring(0, selectionEnd);
		// For some unknown reason, you must store the scollHeight to a variable before setting the textarea value. Otherwise it won't work for long strings
		scrollHeight = textarea.scrollHeight;
		textarea.value = fullText;
		scrollTop = scrollHeight;
		textareaHeight = textarea.clientHeight;
		if (scrollTop > textareaHeight) {
			// scroll selection to center of textarea
			scrollTop -= textareaHeight / 2;
		} else {
			scrollTop = 0;
		}
		textarea.scrollTop = scrollTop;

		// Continue to set selection range
		textarea.setSelectionRange(selectionStart, selectionEnd);
	},
	setAreaSelection: function (sId, iPos, iEndPos) {
		var area = document.getElementById(sId);

		if (area.selectionStart !== undefined) {
			if (area.setSelectionRange) {
				area.focus(); // not needed for scrolling but we want to see the selected text
				this.fnSetSelectionRange(area, iPos, iEndPos);
			} else {
				area.focus();
				area.selectionStart = iPos;
				area.selectionEnd = iEndPos;
			}
		}
		return this;
	},

	attachEventHandler: function (fnEventHandler) {
		if (Utils.debug) {
			Utils.console.debug("attachEventHandler: fnEventHandler=" + fnEventHandler);
		}
		document.addEventListener("click", fnEventHandler, false);
		document.addEventListener("change", fnEventHandler, false);
		return this;
	}
};
