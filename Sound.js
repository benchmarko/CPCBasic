// Sound.js - Sound output via WebAudio
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
/* globals Utils */

"use strict";

function Sound(options) {
	this.init(options);
}

Sound.prototype = {
	init: function (/* options */) {
		var i;

		this.bIsSoundOn = false;
		this.bIsActivatedByUser = false;
		this.context = null;
		this.oMergerNode = null;
		this.aGainNodes = [];
		this.aOscillators = []; // 3 oscillators left, middle, right
		this.aQueues = []; // node queues and info for the three channels
		for (i = 0; i < 3; i += 1) {
			this.aQueues[i] = {
				aSoundData: [],
				fNextNoteTime: 0,
				bOnHold: false,
				iRendevousMask: 0
			};
		}

		this.fScheduleAheadTime = 0.1; // 100 ms
		this.aVolEnv = [];
		this.aToneEnv = [];
		this.iReleaseMask = 0;
		if (Utils.debug > 1) {
			this.aDebugLog = []; // access: cpcBasic.controller.oSound.aDebugLog
		}
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

		if (Utils.debug > 1) {
			this.aDebugLog.length = 0;
		}
	},

	stopOscillator: function (n) {
		var aOscillators = this.aOscillators;

		if (aOscillators[n]) {
			aOscillators[n].frequency.value = 0;
			aOscillators[n].stop();
			aOscillators[n].disconnect();
			aOscillators[n] = null;
		}
	},

	debugLog: function (sMsg) {
		this.aDebugLog.push([
			this.context ? this.context.currentTime : 0,
			sMsg
		]);
	},

	resetQueue: function () {
		var aQueues = this.aQueues,
			oQueue, i;

		for (i = 0; i < aQueues.length; i += 1) {
			oQueue = aQueues[i];
			oQueue.aSoundData.length = 0;
			oQueue.fNextNoteTime = 0;
			oQueue.bOnHold = false;
			oQueue.iRendevousMask = 0;
		}
	},

	createSoundContext: function () {
		var context = new (window.AudioContext || window.webkitAudioContext)(),
			aChannelMap2Cpc = [ // channel map for CPC: left, middle (center), right; so swap middle and right
				0,
				2,
				1
			],
			oMergerNode, oGainNode, i;

		this.context = context;

		oMergerNode = context.createChannelMerger(6); // create mergerNode with 6 inputs; we are using the first 3 for left, right, center
		this.oMergerNode = oMergerNode;

		for (i = 0; i < 3; i += 1) {
			oGainNode = context.createGain();
			oGainNode.connect(this.oMergerNode, 0, aChannelMap2Cpc[i]); // connect output #0 of gainNode i to input #j of the mergerNode
			this.aGainNodes[i] = oGainNode;
		}
	},

	playNoise: function (iOscillator, fTime, fDuration, iNoise) { //TTT
		var ctx = this.context,
			bandHz, //q,
			bufferSize = ctx.sampleRate * fDuration, // set the time of the note
			buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate), // create an empty buffer
			data = buffer.getChannelData(0), // get data
			i, noise, bandpass;

		// fill the buffer with noise
		for (i = 0; i < bufferSize; i += 1) {
			data[i] = Math.random() * 2 - 1;
		}

		// create a buffer source for our created data
		noise = ctx.createBufferSource();
		noise.buffer = buffer;

		if (iNoise > 1) {
			bandHz = 20000 / iNoise; //TTT
			//q = 20000 / iNoise;
			bandpass = ctx.createBiquadFilter();
			bandpass.type = "bandpass";
			bandpass.frequency.value = bandHz;
			//bandpass.Q.value = q;
			noise.connect(bandpass).connect(this.aGainNodes[iOscillator]);
		} else {
			noise.connect(this.aGainNodes[iOscillator]);
		}
		noise.start(fTime);
		noise.stop(fTime + fDuration);
	},

	applyVolEnv: function (aVolData, oGain, fTime, iVolume, iDuration, iVolEnvRepeat) {
		var iMaxVolume = 15,
			i100ms2sec = 100, // time duration unit: 1/100 sec=10 ms, convert to sec
			iLoop, iPart, iTime, oGroup, fVolume, iVolSteps, iVolDiff, iVolTime, i, iRegister, iPeriod;

		iTime = 0;
		for (iLoop = 0; iLoop < iVolEnvRepeat; iLoop += 1) {
			for (iPart = 0; iPart < aVolData.length; iPart += 1) {
				oGroup = aVolData[iPart];
				if (oGroup.steps !== undefined) {
					iVolSteps = oGroup.steps;
					iVolDiff = oGroup.diff;
					iVolTime = oGroup.time;
					if (!iVolSteps) { // steps=0
						iVolSteps = 1;
						iVolume = 0; // we will set iVolDiff as absolute volume
					}
					for (i = 0; i < iVolSteps; i += 1) {
						iVolume = (iVolume + iVolDiff) % (iMaxVolume + 1);
						fVolume = iVolume / iMaxVolume;
						oGain.setValueAtTime(fVolume * fVolume, fTime + iTime / i100ms2sec);
						iTime += iVolTime;
						if (iDuration && iTime >= iDuration) { // stop early if longer than specified duration
							iLoop = iVolEnvRepeat;
							iPart = aVolData.length;
							break;
						}
					}
				} else { // register
					iRegister = oGroup.register;
					iPeriod = oGroup.period;
					//TTT TODO
					if (iRegister === 0) {
						iVolume = 15;
						fVolume = iVolume / iMaxVolume;
						oGain.setValueAtTime(fVolume * fVolume, fTime + iTime / i100ms2sec);
						iVolTime = iPeriod; //TTT ??
						iTime += iVolTime;
						fVolume = 0;
						oGain.linearRampToValueAtTime(fVolume, fTime + iTime / i100ms2sec); // or: exponentialRampToValueAtTime?
					}
				}
			}
		}
		if (iDuration === 0) {
			iDuration = iTime;
		}
		return iDuration;
	},

	applyToneEnv: function (aToneData, oFrequency, fTime, iPeriod, iDuration) { //TTT TODO
		var iToneEnvRepeat = 1,
			i100ms2sec = 100, // time duration unit: 1/100 sec=10 ms, convert to sec
			bRepeat, iLoop, iPart, iTime, oGroup, iToneSteps, iToneDiff, iToneTime, i, fFrequency;

		bRepeat = aToneData[0];
		if (bRepeat) {
			iToneEnvRepeat = 5; // we use at most 5 //TTT
		}

		iTime = 0;
		for (iLoop = 0; iLoop < iToneEnvRepeat; iLoop += 1) {
			for (iPart = 0; iPart < aToneData.length; iPart += 1) {
				oGroup = aToneData[iPart];
				if (oGroup.steps !== undefined) {
					iToneSteps = oGroup.steps;
					iToneDiff = oGroup.diff;
					iToneTime = oGroup.time;
					if (!iToneSteps) { // steps=0
						iToneSteps = 1;
					}
					for (i = 0; i < iToneSteps; i += 1) {
						fFrequency = (iPeriod >= 3) ? 62500 / iPeriod : 0;
						oFrequency.setValueAtTime(fFrequency, fTime + iTime / i100ms2sec);
						iPeriod += iToneDiff;
						iTime += iToneTime;
						if (iDuration && iTime >= iDuration) { // stop early if longer than specified duration
							iLoop = iToneEnvRepeat;
							iPart = aToneData.length;
							break;
						}
					}
				} else { // absolute period
					iPeriod = oGroup.period;
					iToneTime = oGroup.time;
					fFrequency = (iPeriod >= 3) ? 62500 / iPeriod : 0;
					oFrequency.setValueAtTime(fFrequency, fTime + iTime / i100ms2sec);
					//TTT TODO
					iTime += iToneTime;
					//oFrequency.linearRampToValueAtTime(fXXX, fTime + iTime / i100ms2sec); // or: exponentialRampToValueAtTime?
				}
			}
		}
	},

	scheduleNote: function (iOscillator, fTime, oSoundData) {
		var iMaxVolume = 15,
			i100ms2sec = 100, // time duration unit: 1/100 sec=10 ms, convert to sec
			ctx = this.context,
			iVolEnv = oSoundData.iVolEnv,
			iToneEnv = oSoundData.iToneEnv,
			iVolEnvRepeat = 1,
			oOscillator, oGain, iDuration, iVolume, fDuration, fVolume;

		if (Utils.debug > 1) {
			this.debugLog("scheduleNote: " + iOscillator + " " + fTime);
		}
		oOscillator = ctx.createOscillator();
		oOscillator.type = "square";

		oOscillator.frequency.value = (oSoundData.iPeriod >= 3) ? 62500 / oSoundData.iPeriod : 0;

		oOscillator.connect(this.aGainNodes[iOscillator]);
		if (fTime < ctx.currentTime) {
			Utils.console.log("TTT: scheduleNote: " + fTime + " < " + ctx.currentTime);
		}

		iDuration = oSoundData.iDuration;
		iVolume = oSoundData.iVolume;

		oGain = this.aGainNodes[iOscillator].gain;

		fVolume = iVolume / iMaxVolume;
		oGain.setValueAtTime(fVolume * fVolume, fTime); // start volume

		if (iDuration < 0) { // <0: repeat volume envelope?
			iVolEnvRepeat = Math.min(5, -iDuration); // we limit repeat to 5 times sice we precompute duration
			iDuration = 0;
		}

		if (iVolEnv && this.aVolEnv[iVolEnv]) { // some volume envelope?
			iDuration = this.applyVolEnv(this.aVolEnv[iVolEnv], oGain, fTime, iVolume, iDuration, iVolEnvRepeat);
		}

		if (iToneEnv && this.aToneEnv[iToneEnv]) { // some tone envelope?
			this.applyToneEnv(this.aToneEnv[iToneEnv], oOscillator.frequency, fTime, oSoundData.iPeriod, iDuration);
		}

		fDuration = iDuration / i100ms2sec;
		oOscillator.start(fTime);
		oOscillator.stop(fTime + fDuration);
		this.aOscillators[iOscillator] = oOscillator;

		if (oSoundData.iNoise) {
			this.playNoise(iOscillator, fTime, fDuration, oSoundData.iNoise); //TTT
		}
		return fDuration;
	},

	testCanQueue: function (iState) {
		var aQueues = this.aQueues,
			bCanQueue = true;

		if (this.bIsSoundOn && !this.bIsActivatedByUser) { // sound on but not yet activated? -> say cannot queue
			bCanQueue = false;
		/* eslint-disable no-bitwise */
		} else if (!(iState & 0x80)) { // 0x80: flush
			if ((iState & 0x01 && aQueues[0].aSoundData.length >= 4)
				|| (iState & 0x02 && aQueues[1].aSoundData.length >= 4)
				|| (iState & 0x04 && aQueues[2].aSoundData.length >= 4)) {
				bCanQueue = false;
			}
		}
		/* eslint-enable no-bitwise */

		return bCanQueue;
	},

	sound: function (oSoundData) {
		var aQueues = this.aQueues,
			i, oQueue, iState;

		if (!this.bIsSoundOn) {
			return;
		}

		iState = oSoundData.iState;
		for (i = 0; i < 3; i += 1) {
			oQueue = aQueues[i];
			if ((iState >> i) & 0x01) { // eslint-disable-line no-bitwise
				if (iState & 0x80) { // eslint-disable-line no-bitwise
					oQueue.aSoundData.length = 0; // flush queue
					oQueue.fNextNoteTime = 0;
					this.stopOscillator(i);
				}
				oQueue.aSoundData.push(oSoundData); // just a reference
				if (Utils.debug > 1) {
					this.debugLog("sound: " + i + " " + iState + ":" + oQueue.aSoundData.length);
				}
				this.updateQueueStatus(i, oQueue);
			}
		}
		this.scheduler(); // schedule early to allow SQ busy check immiediately (can channels go out of sync by this?)
	},

	setVolEnv: function (iVolEnv, aVolEnvData) {
		this.aVolEnv[iVolEnv] = aVolEnvData;
	},

	setToneEnv: function (iToneEnv, aToneEnvData) {
		this.aToneEnv[iToneEnv] = aToneEnvData;
	},

	updateQueueStatus: function (i, oQueue) {
		var aSoundData = oQueue.aSoundData;

		if (aSoundData.length) {
			/* eslint-disable no-bitwise */
			oQueue.bOnHold = Boolean(aSoundData[0].iState & 0x40); // check if next note on hold
			oQueue.iRendevousMask = (aSoundData[0].iState & 0x07); // get channel bits
			oQueue.iRendevousMask &= ~(1 << i); // mask out our channel
			oQueue.iRendevousMask |= (aSoundData[0].iState >> 3) & 0x07; // and combine rendevous
			/* eslint-enable no-bitwise */
		} else {
			oQueue.bOnHold = false;
			oQueue.iRendevousMask = 0;
		}
	},

	// idea from: https://www.html5rocks.com/en/tutorials/audio/scheduling/
	scheduler: function () {
		var iCanPlayMask = 0,
			fCurrentTime, aQueues, oQueue, i, oSoundData;

		if (!this.bIsSoundOn) {
			return;
		}
		fCurrentTime = this.context.currentTime;

		aQueues = this.aQueues;
		for (i = 0; i < 3; i += 1) {
			oQueue = aQueues[i];
			while (oQueue.aSoundData.length && !oQueue.bOnHold && oQueue.fNextNoteTime < fCurrentTime + this.fScheduleAheadTime) { // something to schedule and not on hold and time reached
				if (!oQueue.iRendevousMask) { // no rendevous needed, schedule now
					oSoundData = oQueue.aSoundData.shift();
					if (oQueue.fNextNoteTime < fCurrentTime) {
						oQueue.fNextNoteTime = fCurrentTime;
					}
					oQueue.fNextNoteTime += this.scheduleNote(i, oQueue.fNextNoteTime, oSoundData);
					this.updateQueueStatus(i, oQueue); // check if next note on hold
				} else { // need rendevous
					iCanPlayMask |= (1 << i); // eslint-disable-line no-bitwise
					break;
				}
			}
		}

		if (!iCanPlayMask) { // no channel can play
			return;
		}

		for (i = 0; i < 3; i += 1) {
			oQueue = aQueues[i];
			// we can play, if in rendevous
			if ((iCanPlayMask >> i) & 0x01 && ((oQueue.iRendevousMask & iCanPlayMask) === oQueue.iRendevousMask)) { // eslint-disable-line no-bitwise
				oSoundData = oQueue.aSoundData.shift();
				if (oQueue.fNextNoteTime < fCurrentTime) {
					oQueue.fNextNoteTime = fCurrentTime;
				}
				oQueue.fNextNoteTime += this.scheduleNote(i, oQueue.fNextNoteTime, oSoundData);
				this.updateQueueStatus(i, oQueue); // check if next note on hold
			}
		}
	},

	release: function (iReleaseMask) {
		var aQueues = this.aQueues,
			i, oQueue, aSoundData;

		if (!aQueues.length) {
			return;
		}

		if (Utils.debug > 1) {
			this.debugLog("release: " + iReleaseMask);
		}
		for (i = 0; i < 3; i += 1) {
			oQueue = aQueues[i];
			aSoundData = oQueue.aSoundData;
			if (((iReleaseMask >> i) & 0x01) && aSoundData.length && oQueue.bOnHold) { // eslint-disable-line no-bitwise
				oQueue.bOnHold = false; // release
			}
		}
		this.scheduler(); // extra schedule now so that following sound instructions are not releases early
	},

	sq: function (n) {
		var aQueues = this.aQueues,
			oQueue = aQueues[n],
			aSoundData = oQueue.aSoundData,
			iSq;

		iSq = 4 - aSoundData.length;
		if (iSq < 0) {
			iSq = 0;
		}
		/* eslint-disable no-bitwise */
		iSq |= (oQueue.iRendevousMask << 3);
		if (this.aOscillators[n] && aQueues[n].fNextNoteTime > this.context.currentTime) { // note still playing?
			iSq |= 0x80; // eslint-disable-line no-bitwise
		} else if (aSoundData.length && (aSoundData[0].iState & 0x40)) {
			iSq |= 0x40;
		}

		/* eslint-enable no-bitwise */
		return iSq;
	},

	isSoundOn: function () {
		return this.bIsSoundOn;
	},

	setActivatedByUser: function () {
		this.bIsActivatedByUser = true;
	},

	isActivatedByUser: function () {
		return this.bIsActivatedByUser;
	},

	soundOn: function () {
		if (!this.bIsSoundOn) {
			if (!this.context) {
				this.createSoundContext();
			}
			this.oMergerNode.connect(this.context.destination);
			this.bIsSoundOn = true;
			Utils.console.log("Test sound: on");
		}
	},

	soundOff: function () {
		if (this.bIsSoundOn) {
			this.oMergerNode.disconnect(this.context.destination);
			this.bIsSoundOn = false;
			Utils.console.log("Test sound: off");
		}
	}
};
