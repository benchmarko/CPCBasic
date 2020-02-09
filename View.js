// View.js - View Module to access HTML DOM
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
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
		//return document.getElementById(sId).hidden;
		return document.getElementById(sId).style.display === "none";
	},
	setHidden: function (sId, bHidden, sDisplay) { // optional sDisplay: block or flex
		var element = document.getElementById(sId);

		//element.hidden = bHidden;
		element.style.display = (bHidden) ? "none" : (sDisplay || "block");
		return this;
	},
	toogleHidden: function (sId, sDisplay) {
		return this.setHidden(sId, !this.getHidden(sId), sDisplay);
	},

	setDisabled: function (sId, bDisabled) {
		var element = document.getElementById(sId);

		element.disabled = bDisabled;
		return this;
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

	setSelectOptions: function (sId, aOptions) {
		var select, i, oItem, option;

		select = document.getElementById(sId);
		for (i = 0; i < aOptions.length; i += 1) {
			oItem = aOptions[i];
			if (i >= select.length) {
				option = document.createElement("option");
				option.value = oItem.value;
				option.text = oItem.text;
				option.title = oItem.title;
				select.add(option);
			} else {
				option = select.options[i];
				if (option.value !== oItem.value) {
					option.value = oItem.value;
				}
				if (option.text !== oItem.text) {
					if (Utils.debug > 3) {
						Utils.console.debug("setSelectOptions: " + sId + ": text changed for index " + i + ": " + oItem.text);
					}
					option.text = oItem.text;
					option.title = oItem.title;
				}
			}
			if (oItem.selected) { // multi-select
				option.selected = oItem.selected;
			}
		}
		// remove additional select options
		select.options.length = aOptions.length;
		return this;
	},
	getSelectValue: function (sId) {
		var select = document.getElementById(sId);

		return select.value;
	},
	setSelectValue: function (sId, sValue) {
		var select = document.getElementById(sId);

		if (sValue) {
			select.value = sValue;
		}
		return this;
	},
	setSelectTitleFromSelectedOption: function (sId) {
		var select = document.getElementById(sId),
			iSelectedIndex = select.selectedIndex,
			sTitle;

		sTitle = (iSelectedIndex >= 0) ? select.options[iSelectedIndex].title : "";
		select.title = sTitle;
		return this;
	},

	setAreaScrollTop: function (sId, scrollTop) {
		var area = document.getElementById(sId);

		if (scrollTop === undefined) {
			scrollTop = area.scrollHeight;
		}
		area.scrollTop = scrollTop;
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

	attachEventHandler: function (sType, fnEventHandler) {
		if (Utils.debug) {
			Utils.console.debug("attachEventHandler: type=" + sType + ", fnEventHandler=" + (fnEventHandler ? "[function]" : null));
		}
		document.addEventListener(sType, fnEventHandler, false);
		return this;
	}
};
