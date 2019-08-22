// Canvas.js - ...
//
/* globals Utils */

"use strict";

function Canvas(options) {
	this.init(options);
}

Canvas.prototype = {
	init: function (options) {
		var sMapDivId, oView, mapDiv, bHidden, iWidth, iHeight, canvas, context;

		this.options = Object.assign({
			//markerStyle: "green",
			//textStyle: "black",
			//backgroundStyle: "#E6E6E6",
			//zoom: 0 // not used
		}, options);

		sMapDivId = this.options.mapDivId;
		oView = this.options.view;
		mapDiv = document.getElementById(sMapDivId);

		bHidden = oView.getHidden(sMapDivId);
		oView.setHidden(sMapDivId, false); // make sure canvas is not hidden (allows to get width, height)
		iWidth = mapDiv.clientWidth;
		iHeight = mapDiv.clientHeight;
		oView.setHidden(sMapDivId, bHidden); // restore hidden
		Utils.console.log("SimpleMap: width=" + iWidth + " height=" + iHeight + " created");

		this.oPixelMap = {
			width: iWidth,
			height: iHeight,
			scaleWidth: 8 / 10, //TTT
			scaleHeight: 8 / 10
			// will be extended by width, height; and latBottom, latTop, lngLeft, lngRight in fitBounds()
		};

		/*
		this.mElements = {
			path: [],
			marker: []
		};
		*/

		this.aPath = [];

		canvas = document.createElement("CANVAS");
		canvas.width = iWidth;
		canvas.height = iHeight;
		canvas.id = "simpleCanvas0";
		canvas.style.position = "absolute";
		canvas.style.backgroundColor = "blue";
		canvas.style.opacity = 1;
		mapDiv.appendChild(canvas);
		this.canvas = canvas;

		context = canvas.getContext("2d");
		context.strokeStyle = "yellow";
		context.lineWidth = 1;

		// get Cartesian coordinate system with the origin in the bottom left corner (moved by 1 pixel to the right)
		context.translate(1, iHeight);
		context.scale(1, -1);

		if (this.options.onload) {
			this.options.onload(this);
		}
		document.getElementById(sMapDivId).addEventListener("click", this.onSimpleCanvas2Click.bind(this), false);
		window.addEventListener("resize", this.fnDebounce(this.resize.bind(this), 200, false), false);
	},
	onSimpleCanvas2Click: function (event) {
		var oTarget = event.target,
			x = event.clientX - oTarget.offsetLeft + window.scrollX, // x,y are relative to the canvas
			y = event.clientY - oTarget.offsetTop + window.scrollY;

		Utils.console.log("onSimpleCanvas2Click: x=" + x + ", y=" + y);
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
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
		var sMapDivId = this.options.mapDivId,
			oView = this.options.view,
			bHidden = oView.getHidden(sMapDivId),
			mapDiv, iWidth, iHeight, i, canvas;

		if (bHidden) {
			return; // canvas is hidden
		}
		mapDiv = document.getElementById(sMapDivId); // mapCanvas-simple
		iWidth = mapDiv.clientWidth;
		iHeight = mapDiv.clientHeight;
		if (iWidth !== this.oPixelMap.width || iHeight !== this.oPixelMap.height) {
			Utils.console.log("Canvas.resize width=" + iWidth + " height=" + iHeight);
			for (i = 0; i < this.aCanvas.length; i += 1) {
				canvas = this.aCanvas[i];
				if (canvas.width !== iWidth) {
					this.oPixelMap.width = iWidth;
					canvas.width = iWidth;
				}
				if (canvas.height !== iHeight) {
					this.oPixelMap.height = iHeight;
					canvas.height = iHeight;
				}
			}
			for (i = 0; i < this.mElements.path.length; i += 1) {
				this.privDrawPath(this.mElements.path[i]);
			}
			/*
			for (i = 0; i < this.mElements.marker.length; i += 1) {
				this.privDrawMarker(this.mElements.marker[i]);
			}
			*/
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


	privDrawPath: function (path, bRemove) {
		var context, i, oPos,
			//xPos, yPos,
			canvas = this.canvas;

		if (path.length) {
			context = canvas.getContext("2d");

			/*
			context.fillStyle = "green"; //TTT
			context.fillRect(10, 10, 150, 100);
			*/

			if (!bRemove) {
				//context.save();
				//context.translate((canvas.width - this.oPixelMap.width * this.oPixelMap.scaleWidth) / 2, (canvas.height - this.oPixelMap.height * this.oPixelMap.scaleHeight) / 2);
				//context.strokeStyle = pathStyle.strokeColor;
				//context.lineWidth = pathStyle.strokeWidth;
				context.beginPath();
				for (i = 0; i < path.length; i += 1) {
					oPos = path[i];
					if (oPos.r) { // convert relative to absolute
						oPos.x += this.xPos;
						oPos.y += this.yPos;
						oPos.r = false;
					}

					if (oPos.t === "f") {
						context.fillStyle = oPos.c;
						context.fill();
					} else {
						this.xPos = oPos.x;
						this.yPos = oPos.y;
						if (oPos.t === "m") {
							context.moveTo(this.xPos, this.yPos);
						} else if (oPos.t === "l") {
							context.lineTo(this.xPos, this.yPos);
						} else { // "p"?
							context.moveTo(this.xPos, this.yPos); //TTT
						}
					}
				}
				context.stroke();
				//context.restore();
				//this.xPos = xPos;
				//this.yPos = yPos;
			} else {
				context.clearRect(0, 0, canvas.width, canvas.height); // we simply clear all
			}
		}
	},
	/*
	privDrawMarker: function (marker, bRemove) {
		var context, oPos,
			strokeStyle = this.options.markerStyle,
			fillStyle = this.options.textStyle,
			iRadius = 10,
			iLineWidth = 1,
			canvas = this.aCanvas[1];

		oPos = this.myConvertGeoToPixel(marker.getPosition(), this.oPixelMap);

		context = canvas.getContext("2d");
		context.save();
		context.translate((canvas.width - this.oPixelMap.width * this.oPixelMap.scaleWidth) / 2, (canvas.height - this.oPixelMap.height * this.oPixelMap.scaleHeight) / 2);
		if (!bRemove) {
			context.strokeStyle = strokeStyle;
			context.lineWidth = iLineWidth;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.font = "14px sans-serif";
			context.fillStyle = fillStyle;

			context.beginPath();
			context.arc(oPos.x, oPos.y, iRadius, 0, 2 * Math.PI);
			context.fillText(marker.getLabel(), oPos.x, oPos.y);
			context.stroke();
		} else {
			iRadius += Math.ceil(iLineWidth / 2);
			context.clearRect(oPos.x - iRadius, oPos.y - iRadius, iRadius * 2, iRadius * 2);
		}
		context.restore();
	}
	*/

	clearPath: function () {
		this.aPath.length = 0;
	},

	addPath: function (path) {
		this.aPath.push(path);

		if (path.t !== "m") {
			this.privDrawPath(this.aPath); //TTT
		}
	},

	cls: function () {
		var canvas = this.canvas,
			context = canvas.getContext("2d");

		this.clearPath();
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	/*
	addPath: function (path) {
		if (path && path.length) {
			this.mElements.path.push(path);
			this.privDrawPath(path); // new path
		}
	},
	removePath: function (path) {
		var idx;

		idx = this.mElements.path.indexOf(path);
		if (idx >= 0) {
			this.mElements.path.splice(idx, 1);
			this.privDrawPath(path, true); // old path: background (draw over old path)
		}
	},
	*/
};
