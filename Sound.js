// 'Sound'.js - ...
//
/* globals Utils */

"use strict";

function Sound(options) {
	this.init(options);
}

Sound.prototype = {
	init: function (options) {
		//var i;

		this.bIsSoundOn = false;
		this.context = null;
		this.oMergerNode = null;
		this.aGainNodes = [];
		this.aOscillators = []; // 3 oscillators left, right, middle
		this.aQueues = []; // node queues for the three channels
		this.aNextNoteTimes = []; // = audioContext.currentTime;
		/*
		this.aQueueInfo = [];
		for (i = 0; i < 3; i += 1) {
			this.aQueueInfo[i] = {};
		}
		*/
		this.fScheduleAheadTime = 0.1;
		this.aVolEnv = [];
		this.aToneEnv = [];
		this.iReleaseMask = 0;
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

		this.aVolEnv.length = 0;
		this.aToneEnv.length = 0;
		this.iReleaseMask = 0;
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

	scheduleNote: function (iOscillator, fTime, oSoundData) {
		var ctx = this.context,
			oOscillator, oGain, iDuration, aVolData, iPart, iTime, iVolume, iVolSteps, iVolDiff, iVolTime, i, fDuration;

		oOscillator = ctx.createOscillator();
		oOscillator.type = "square";

		//fFrequency = (oSoundData.iPeriod >= 3) ? 62500 / oSoundData.iPeriod : 0;
		//fDuration = ((oSoundData.iDuration !== undefined) ? oSoundData.iDuration : 20) / 100; // duration unit: 1/100 sec=10 ms, convert to sec
		//iVolume = oSoundData.iVolume % 16; /// 15; // iVolume: 0..15

		oOscillator.frequency.value = (oSoundData.iPeriod >= 3) ? 62500 / oSoundData.iPeriod : 0;

		//oOscillator.connect(this.oMergerNode, 0, iOscillator); //connect output #0 of the oscillator to input #i of the mergerNode
		oOscillator.connect(this.aGainNodes[iOscillator]);
		if (fTime < ctx.currentTime) {
			Utils.console.log("TTT: scheduleNote: " + fTime + " < " + ctx.currentTime);
		}

		iDuration = oSoundData.iDuration;
		iVolume = oSoundData.iVolume;

		oGain = this.aGainNodes[iOscillator].gain;

		oGain.setValueAtTime(iVolume / 15, fTime); // start volume

		if (oSoundData.iVolEnv && this.aVolEnv[oSoundData.iVolEnv]) { // some volume envelope?
			aVolData = this.aVolEnv[oSoundData.iVolEnv];
			iTime = 0;
			for (iPart = 0; iPart < aVolData.length; iPart += 3) {
				// number of steps, size(volume) of step, time per step
				iVolSteps = aVolData[iPart];
				iVolDiff = aVolData[iPart + 1];
				iVolTime = aVolData[iPart + 2];
				for (i = 0; i < iVolSteps; i += 1) {
					iVolume = (iVolume + iVolDiff) % 16;
					oGain.setValueAtTime(iVolume / 15, fTime + iTime / 100);
					iTime += iVolTime;
					if (iDuration && iTime >= iDuration) { // stop early if longer than specified duration
						break;
					}
				}
			}
			if (iDuration === 0) {
				iDuration = iTime;
			}
		}

		oOscillator.start(fTime);
		fDuration = iDuration / 100;
		oOscillator.stop(fTime + fDuration); // duration unit: 1/100 sec=10 ms, convert to sec
		this.aOscillators[iOscillator] = oOscillator;
		return fDuration;
	},

	testCanQueue: function (iState) {
		var aQueues = this.aQueues,
			bCanQueue = true;

		// 0x80: flush
		if (aQueues.length && !(iState & 0x80)) { // eslint-disable-line no-bitwise
			if ((iState & 0x01 && aQueues[0].length >= 4) // eslint-disable-line no-bitwise
				|| (iState & 0x02 && aQueues[1].length >= 4) // eslint-disable-line no-bitwise
				|| (iState & 0x04 && aQueues[2].length >= 4)) { // eslint-disable-line no-bitwise
				bCanQueue = false;
			}
		}

		return bCanQueue;
	},

	testCanPlay: function (i) {
		var aQueues = this.aQueues,
			bCanPlay = true,
			iState;

		iState = aQueues[i][0].iState;
		// 0x40: hold
		if (iState & 0x40) { // eslint-disable-line no-bitwise
			bCanPlay = false;
		}
		return bCanPlay;
	},

	sound: function (oSoundData) {
		var aQueues = this.aQueues,
			i, iState;

		/*
		oSoundData = {
			iState: iState,
			iPeriod: iPeriod,
			iDuration: iDuration,
			iVolume: iVolume,
			iVolEnv: iVolEnv,
			iToneEnv: iToneEnv,
			iNoise: iNoise
		};
		*/

		if (!this.bIsSoundOn) {
			return;
		}

		/*
		fFrequency = (oSoundData.iPeriod >= 3) ? 62500 / oSoundData.iPeriod : 0;
		fDuration = ((oSoundData.iDuration !== undefined) ? oSoundData.iDuration : 20) / 100; // duration unit: 1/100 sec=10 ms, convert to sec
		iVolume = oSoundData.iVolume % 16; /// 15; // iVolume: 0..15
		*/

		iState = oSoundData.iState;

		for (i = 0; i < 3; i += 1) {
			if ((iState >> i) & 0x01) { // eslint-disable-line no-bitwise
				if (iState & 0x80) { // eslint-disable-line no-bitwise
					aQueues[i].length = 0; // flush queue
					//this.aQueueInfo[i].fNextNoteTime = 0;
					this.aNextNoteTimes[i] = 0;
					this.stopOscillator(i);
				}
				/*
				aQueues[i].push({
					iState: iState & 0x78, // eslint-disable-line no-bitwise
					// iState: keep bits 3-5 (rendevous) and 6 (hold)
					iPeriod: iPeriod,
					fDuration: fDuration,
					iVolume: iVolume,
					iVolEnv: oSoundData.iVolEnv,
					iToneEnv: oSoundData.iToneEnv,
					iNoise: oSoundData.iNoise
				});
				*/
				aQueues[i].push(oSoundData); // just a reference
			}
		}
	},

	setVolEnv(iVolEnv, aVolEnvData) {
		this.aVolEnv[iVolEnv] = aVolEnvData;
	},

	setToneEnv(iToneEnv, aToneEnvData) {
		this.aToneEnv[iToneEnv] = aToneEnvData;
	},

	scheduler: function () {
		var i, aQueue, oQueue,
			aNextNoteTimes = this.aNextNoteTimes,
			fDuration;

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
			while (aQueue.length && aNextNoteTimes[i] < this.context.currentTime + this.fScheduleAheadTime && this.testCanPlay(i)) {
				oQueue = aQueue.shift();
				fDuration = this.scheduleNote(i, aNextNoteTimes[i], oQueue);
				aNextNoteTimes[i] += fDuration;
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

	release: function (iReleaseMask) {
		var aQueues = this.aQueues,
			i;

		if (!aQueues.length) {
			return;
		}

		for (i = 0; i < 3; i += 1) {
			if (((iReleaseMask >> i) & 0x01) && aQueues[i].length && (aQueues[i][0].iState & 0x40)) { // eslint-disable-line no-bitwise
				aQueues[i][0].iState &= ~0x40; // eslint-disable-line no-bitwise
			}
		}
		//this.iReleaseMask = iReleaseMask;
	},

	sq: function (n) {
		var aQueue = this.aQueues[n],
			iSq;

		iSq = 4 - (aQueue ? aQueue.length : 0);
		if (iSq < 0) {
			iSq = 0;
		}
		if (aQueue && aQueue.length && (aQueue[0].iState & 0x40)) {
			iSq += 0x40;
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
