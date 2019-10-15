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
		this.context = null;
		this.oMergerNode = null;
		this.aGainNodes = [];
		this.aOscillators = []; // 3 oscillators left, right, middle
		this.aQueues = []; // node queues for the three channels
		this.aNextNoteTimes = []; // = audioContext.currentTime;
		this.fScheduleAheadTime = 0.1;
	},

	reset: function () {
		var aOscillators = this.aOscillators,
			i;

		this.resetQueue();

		for (i = 0; i < 3; i += 1) {
			if (aOscillators[i]) {
				this.stopOscillator(i);
			}
		}
	},

	stopOscillator: function (n) {
		var aOscillators = this.aOscillators;

		if (aOscillators[n]) {
			aOscillators[n].frequency.value = 0;
			aOscillators[n].stop();
			aOscillators[n].disconnect(); //TTT use it or not?
			aOscillators[n] = null;
		}
	},

	resetQueue: function () {
		var aQueues = this.aQueues,
			aNextNoteTimes = this.aNextNoteTimes,
			i;

		for (i = 0; i < aQueues.length; i += 1) {
			aQueues[i].length = 0;
		}

		for (i = 0; i < aNextNoteTimes.length; i += 1) {
			aNextNoteTimes[i] = 0;
		}
	},

	createSoundContext: function () {
		var context = new (window.AudioContext || window.webkitAudioContext)(),
			oMergerNode, oGainNode, i;

		this.context = context;

		oMergerNode = context.createChannelMerger(6); // create mergerNode with 6 inputs; we are using the first 3 for left, right, center
		this.oMergerNode = oMergerNode;

		for (i = 0; i < 3; i += 1) {
			oGainNode = context.createGain();
			oGainNode.connect(this.oMergerNode, 0, i); // connect output #0 of gainNode i to input #i of the mergerNode
			this.aGainNodes[i] = oGainNode;
		}

		for (i = 0; i < 3; i += 1) {
			this.aQueues[i] = [];
		}
	},

	/*
	soundInit1Unused: function () {
		var context = this.context,
			aQueues = this.aQueues,
			oMergerNode, i;

		oMergerNode = context.createChannelMerger(3); // create mergerNode with 3 inputs
		this.oMergerNode = oMergerNode;

		for (i = 0; i < 3; i += 1) {
			aQueues[i] = [];
		}

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
	*/

	scheduleNote: function (iOscillator, fTime, oQueue) {
		var ctx = this.context,
			oOscillator;

		oOscillator = ctx.createOscillator();
		oOscillator.type = "square";
		oOscillator.frequency.value = oQueue.iFrequency;
		//oOscillator.connect(this.oMergerNode, 0, iOscillator); //connect output #0 of the oscillator to input #i of the mergerNode
		oOscillator.connect(this.aGainNodes[iOscillator]);
		if (fTime < ctx.currentTime) {
			Utils.console.log("TTT: scheduleNote: " + fTime + " < " + ctx.currentTime);
		}
		this.aGainNodes[iOscillator].gain.setValueAtTime(oQueue.fVolume, fTime);
		oOscillator.start(fTime);
		//this.iStopTime = ctx.currentTime + fDuration;
		oOscillator.stop(fTime + oQueue.fDuration);
		this.aOscillators[iOscillator] = oOscillator;
	},

	sound: function (iState, iPeriod, iDuration, iVolume, iVolMod, iToneMod, iNoisePeriod) {
		var aQueues = this.aQueues,
			iFrequency, fDuration, fVolume, i;

		if (!this.bIsSoundOn) {
			return;
		}
		iFrequency = (iPeriod > 0) ? 62500 / iPeriod : 0;

		if (iDuration === undefined) {
			iDuration = 20;
		}
		fDuration = iDuration / 100; // duration unit: 1/100 sec=10 ms, convert to sec

		fVolume = iVolume / 15; // iVolume: 0..15

		for (i = 0; i < 3; i += 1) {
			if ((iState >> i) & 0x01) { // eslint-disable-line no-bitwise
				if (iState & 0x80) { // eslint-disable-line no-bitwise
					aQueues[i].length = 0;
					this.aNextNoteTimes[i] = 0;
					this.stopOscillator(i);
				}
				aQueues[i].push({
					iFrequency: iFrequency,
					fDuration: fDuration,
					fVolume: fVolume
				});
			}
		}
	},

	scheduler: function () {
		var i, aQueue, oQueue,
			aNextNoteTimes = this.aNextNoteTimes,
			fNextNodeTime;

		if (!this.bIsSoundOn) {
			return;
		}
		for (i = 0; i < 3; i += 1) {
			aQueue = this.aQueues[i];
			//fNextNodeTime = aNextNoteTimes[i];
			/*
			if (!aNextNoteTimes[i]) {
				aNextNoteTimes[i] = this.context.currentTime;
			}
			*/
			if (aNextNoteTimes[i] < this.context.currentTime) {
				aNextNoteTimes[i] = this.context.currentTime;
			}
			while (aQueue.length && aNextNoteTimes[i] < this.context.currentTime + this.fScheduleAheadTime) {
				oQueue = aQueue.shift();
				this.scheduleNote(i, aNextNoteTimes[i], oQueue);
				aNextNoteTimes[i] += oQueue.fDuration;
				//this.scheduleNote(this.current16thNote, this.aNextNoteTimes[i]);
				//this.nextNote(); //TTT
			}
			/*
			if (!aQueue.length) {
				aNextNoteTimes[i] = 0;
			}
			*/
		}
	},

	sq: function (n) {
		var aQueue = this.aQueues[n],
			iSq;

		iSq = 4 - (aQueue ? aQueue.length : 0);
		if (iSq < 0) {
			iSq = 0;
		}
		if (this.aOscillators[n] && this.aNextNoteTimes[n] > this.context.currentTime) { // note still playing?
			iSq += 0x80;
		}
		return iSq;
	},

	/*
	// https://www.html5rocks.com/en/tutorials/audio/scheduling/
	// https://github.com/cwilso/metronome/blob/master/js/metronome.js
	nextNote: function () {
		var tempo = 1, //TTT
			secondsPerBeat = 60.0 / tempo;

		this.nextNoteTime += 0.25 * secondsPerBeat;
		this.current16thNote += 1;
		if (this.current16thNote === 16) {
			this.current16thNote = 0;
		}
	},

	scheduleNote: function (beatNumber, time) {
		var noteLength = 1, //TTT
			osc;

		this.notesInQueue.push({
			note: beatNumber,
			time: time
		});

		osc = this.context.createOscillator();
		osc.connect(this.context.destination);
		osc.start(time);
		osc.stop(time + noteLength);
	},

	scheduler: function () {
		while (this.nextNoteTime < this.context.currentTime + this.scheduleAheadTime) {
			this.scheduleNote(this.current16thNote, this.nextNoteTime);
			this.nextNote(); //TTT
		}
	},
	*/

	isSoundOn: function () {
		return this.bIsSoundOn;
	},

	/*
	//not relevant any more?
	// https://blog.szynalski.com/2014/04/web-audio-api/
	test1: function () {
		var context = this.context,
			oscillatorL, oscillatorR, mergerNode, currentTime;

		oscillatorL = context.createOscillator();
		oscillatorL.frequency.value = 440;
		oscillatorR = context.createOscillator();
		oscillatorR.frequency.value = 2400;
		mergerNode = context.createChannelMerger(2); //create mergerNode with 2 inputs
		mergerNode.connect(context.destination);

		oscillatorL.connect(mergerNode, 0, 0);
		//connect output #0 of the oscillator to input #0 of the mergerNode
		oscillatorR.connect(mergerNode, 0, 1);
		//connect output #0 of the oscillator to input #1 of the mergerNode
		currentTime = context.currentTime;
		oscillatorL.start(currentTime);
		oscillatorL.stop(currentTime + 2); //stop "left" tone after 2 s
		oscillatorR.start(currentTime);
		oscillatorR.stop(currentTime + 4); //stop "right" tone after 4 s
	},
	*/

	soundOn: function () {
		var i;

		if (!this.bIsSoundOn) {
			if (!this.context) {
				this.createSoundContext();

				/*
				if (!this.oMergerNode) {
					this.soundInit1();
				}
				*/
			}
			this.oMergerNode.connect(this.context.destination);
			/*
			for (i = 0; i < 3; i += 1) {
				this.aOscillators[i].connect(this.context.destination);
			}
			*/
			this.bIsSoundOn = true;
			for (i = 0; i < 3; i += 1) {
				this.aNextNoteTimes[i] = 0; // this.context.currentTime;
			}
			Utils.console.log("Test sound: on");
			//this.test1();
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
