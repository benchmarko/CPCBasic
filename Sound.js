// 'Sound'.js - ...
//
/* globals Utils */

"use strict";

function Sound(options) {
	this.init(options);
}

Sound.prototype = {
	init: function (options) {
		this.bIsSoundOn = false;
		this.contect = null;
	},

	reset: function () {
		var i;

		if (this.aOscillators) {
			for (i = 0; i < 3; i += 1) {
				this.aOscillators[i].frequency.value = 0;
			}
		}
	},

	createSoundContext: function () {
		var context = new (window.AudioContext || window.webkitAudioContext)();

		if (!context.createGain) {
			context.createGain = context.createGainNode;
		}
		if (!context.createDelay) {
			context.createDelay = context.createDelayNode;
		}
		if (!context.createScriptProcessor) {
			context.createScriptProcessor = context.createJavaScriptNode;
		}
		this.context = context;
	},

	soundInit1: function () {
		var context = this.context,
			aOscillators = [], // 3 oscillators left, right, middle
			oMergerNode, i, oOscillator;

		oMergerNode = context.createChannelMerger(3); // create mergerNode with 3 inputs
		this.oMergerNode = oMergerNode;
		for (i = 0; i < 3; i += 1) {
			oOscillator = context.createOscillator();
			oOscillator.type = "square"; // "sine", "square", "sawtooth"m "triangle"
			oOscillator.frequency.value = 440 * (i + 1); //TTT

			oOscillator.connect(oMergerNode, 0, i); //connect output #0 of the oscillator to input #i of the mergerNode
			oOscillator.start();
			aOscillators.push(oOscillator);
		}
		this.aOscillators = aOscillators;
		//this.analyser = context.createAnalyser();
		//this.oscillator.connect(context.destination);
		//this.oscillator.connect(this.analyser);
		//this.analyser.connect(context.destination);
		//this.oscillator.type = "square"; // "sine", "square", "sawtooth"m "triangle"
		//this.oscillator.frequency.value = 500; // 0-1000
		//this.oscillator.detune.value = 0; // -100 .. 100
		//this.oscillator[this.oscillator.start ? "start" : "noteOn"](0);
	},

	playNote: function (iOscillator, iFrequency, iDuration) {
		var ctx = this.context,
			osc = this.aOscillators[iOscillator];

		osc.frequency.value = iFrequency;
		//osc.noteOn(ctx.currentTime);
		//osc.noteOff(ctx.currentTime + iDuration);
	},

	sound: function (iState, iPeriod, iDuration, iVolume, iVolMod, iToneMod, iNoisePeriod) {
		var iFrequency, i;

		if (!this.bIsSoundOn) {
			return;
		}
		iFrequency = (iPeriod > 0) ? 62500 / iPeriod : 0;
		if (iDuration === undefined) {
			iDuration = 20;
		}
		for (i = 0; i < 3; i += 1) {
			if ((iState >> i) & 0x01) { // eslint-disable-line no-bitwise
				this.playNote(i, iFrequency, iDuration * 100 / 1000);
			}
		}
	},

	isSoundOn: function () {
		return this.bIsSoundOn;
	},

	soundOn: function () {
		if (!this.bIsSoundOn) {
			if (!this.context) {
				this.createSoundContext();
				if (!this.aOscillator) {
					this.soundInit1();
				}
			}
			this.oMergerNode.connect(this.context.destination);
			/*
			for (i = 0; i < 3; i += 1) {
				this.aOscillators[i].connect(this.context.destination);
			}
			*/
			this.bIsSoundOn = true;
			Utils.console.log("Test sound: on");
		}
	},

	soundOff: function () {
		if (this.bIsSoundOn) {
			//this.oscillator.stop();
			//this.oscillator.disconnect(this.context.destination);
			this.oMergerNode.disconnect(this.context.destination);
			/*
			for (i = 0; i < 3; i += 1) {
				this.aOscillators[i].disconnect(this.context.destination);
			}
			*/
			this.bIsSoundOn = false;
			Utils.console.log("Test sound: off");
		}
	}

};
