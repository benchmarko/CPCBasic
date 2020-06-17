// ZipFile.js - ZIP file handling
// (c) Marco Vieth, 2019
// https://benchmarko.github.io/CPCBasic/
//
/* globals Uint8Array */

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

// Idea based on: https://github.com/frash23/jzsip/blob/master/jzsip.js
// (and Cpcemu: zip.cpp)
// https://en.wikipedia.org/wiki/Zip_(file_format)

function ZipFile(aData, sZipName) {
	this.init(aData, sZipName);
}

ZipFile.prototype = {
	init: function (aData, sZipName) {
		this.aData = aData;
		this.sZipName = sZipName; // for error messages
		this.oEntryTable = this.readZipDirectory();
	},

	composeError: function () { // varargs
		var aArgs = Array.prototype.slice.call(arguments);

		aArgs[1] = this.sZipName + ": " + aArgs[1]; // put zipname in message
		aArgs.unshift("ZipFile");
		return Utils.composeError.apply(null, aArgs);
	},

	subArr: function (iBegin, iLength) {
		//iEnd = typeof iLength === "undefined" ? aData.length : iBegin + iLength;
		var aData = this.aData,
			iEnd = iBegin + iLength;

		return aData.slice ? aData.slice(iBegin, iEnd) : aData.subarray(iBegin, iEnd); // array.slice on Uint8Array not for IE11
	},

	/*
	readUTF_window: function (aData, iOffset, iLen) {
		var iCallSize = 25000, //TTT
			sOut, i, l;

		iOffset = iOffset || 0;
		aData = this.subArr(iOffset, iLen);
		sOut = "";
		for (i = 0, l = aData.length; i < l; i += iCallSize) {
			sOut += String.fromCharCode.apply(null, this.subArr(i, iCallSize));
		}
		return sOut;
	},
	*/

	/*
	readUTFsingle: function (aData, iOffset, iLen) {
		var iEnd = iOffset + iLen,
			sOut = "",
			i;

		for (i = iOffset; i < iEnd; i += 1) {
			sOut += String.fromCharCode(aData[i]);
		}
		return sOut;
	},
	*/

	readUTF: function (iOffset, iLen) {
		var iCallSize = 25000, // use call window to avoid "maximum call stack error" for e.g. size 336461
			sOut = "",
			iChunkLen;

		while (iLen) {
			iChunkLen = Math.min(iLen, iCallSize);
			sOut += String.fromCharCode.apply(null, this.subArr(iOffset, iChunkLen)); // on Chrome this is faster than single character processing
			iOffset += iChunkLen;
			iLen -= iChunkLen;
		}
		return sOut;
	},

	readUInt: function (i) {
		var aData = this.aData;

		return (aData[i + 3] << 24) | (aData[i + 2] << 16) | (aData[i + 1] << 8) | aData[i]; // eslint-disable-line no-bitwise
	},

	readUShort: function (i) {
		var aData = this.aData;

		return ((aData[i + 1]) << 8) | aData[i]; // eslint-disable-line no-bitwise
	},

	readEocd: function (iEocdPos) { // read End of central directory
		var oEocd = {
			iSignature: this.readUInt(iEocdPos),
			iEntries: this.readUShort(iEocdPos + 10), // total number of central directory records
			iCdfhOffset: this.readUInt(iEocdPos + 16), // offset of start of central directory, relative to start of archive
			iCdSize: this.readUInt(iEocdPos + 20) // size of central directory (just for information)
		};

		return oEocd;
	},

	readCdfh: function (iPos) { // read Central directory file header
		var oCdfh = {
			iSignature: this.readUInt(iPos),
			iVersion: this.readUShort(iPos + 6), // version needed to extract (minimum)
			iFlag: this.readUShort(iPos + 8), // General purpose bit flag
			iCompressionMethod: this.readUShort(iPos + 10), // compression method
			iModificationTime: this.readUShort(iPos + 12), // File last modification time (DOS time)
			iCrc: this.readUInt(iPos + 16), // CRC-32 of uncompressed data
			iCompressedSize: this.readUInt(iPos + 20), // compressed size
			iSize: this.readUInt(iPos + 24), // Uncompressed size
			iFileNameLength: this.readUShort(iPos + 28), // file name length
			iExtraFieldLength: this.readUShort(iPos + 30), // extra field length
			iFileCommentLength: this.readUShort(iPos + 32), // file comment length
			iLocalOffset: this.readUInt(iPos + 42) // relative offset of local file header
		};

		return oCdfh;
	},

	readZipDirectory: function () {
		var iEocdLen = 22, // End of central directory (EOCD)
			iMaxEocdCommentLen = 0xffff,
			iEocdSignature = 0x06054B50, // EOCD signature: "PK\x05\x06"
			iCdfhSignature = 0x02014B50, // Central directory file header signature: PK\x01\x02"
			iCdfhLen = 46, // Central directory file header length
			iLfhSignature = 0x04034b50, // Local file header signature
			iLfhLen = 30, // Local file header length
			aData = this.aData,
			oEntryTable = {},
			i, n, oEocd, iEntries, iOffset, oCdfh, iDostime, iLfhExtrafieldLength;

		// find End of central directory (EOCD) record
		i = aData.length - iEocdLen + 1; // +1 because of loop
		n = Math.max(0, i - iMaxEocdCommentLen);
		while (i >= n) {
			i -= 1;
			if (this.readUInt(i) === iEocdSignature) {
				oEocd = this.readEocd(i);
				if (this.readUInt(oEocd.iCdfhOffset) === iCdfhSignature) {
					break; // looks good, so we assume that we have found the EOCD
				}
			}
		}
		if (!oEocd) {
			throw this.composeError(Error(), "Zip: File ended abruptly: EOCD not found", "", (i >= 0) ? i : 0);
		}

		iEntries = oEocd.iEntries;
		iOffset = oEocd.iCdfhOffset;

		for (i = 0; i < iEntries; i += 1) {
			oCdfh = this.readCdfh(iOffset);
			if (oCdfh.iSignature !== iCdfhSignature) {
				throw this.composeError(Error(), "Zip: Bad CDFH signature", "", iOffset);
			}
			if (!oCdfh.iFileNameLength) {
				throw this.composeError(Error(), "Zip Entry name missing", "", iOffset);
			}
			iOffset += iCdfhLen;

			oCdfh.sName = this.readUTF(iOffset, oCdfh.iFileNameLength);
			iOffset += oCdfh.iFileNameLength;
			oCdfh.bIsDirectory = oCdfh.sName.charAt(oCdfh.sName.length - 1) === "/";

			oCdfh.aExtra = this.subArr(iOffset, oCdfh.iExtraFieldLength);
			iOffset += oCdfh.iExtraFieldLength;

			oCdfh.sComment = this.readUTF(iOffset, oCdfh.iFileCommentLength);
			iOffset += oCdfh.iFileCommentLength;

			if ((oCdfh.iFlag & 1) === 1) { // eslint-disable-line no-bitwise
				throw this.composeError(Error(), "Zip encrypted entries not supported", "", i);
			}

			iDostime = oCdfh.iModificationTime;
			// year, month, day, hour, minute, second
			oCdfh.iTimestamp = new Date(((iDostime >> 25) & 0x7F) + 1980, ((iDostime >> 21) & 0x0F) - 1, (iDostime >> 16) & 0x1F, (iDostime >> 11) & 0x1F, (iDostime >> 5) & 0x3F, (iDostime & 0x1F) << 1).getTime(); // eslint-disable-line no-bitwise

			// local file header... much more info
			if (this.readUInt(oCdfh.iLocalOffset) !== iLfhSignature) {
				Utils.console.error("Zip: readZipDirectory: LFH signature not found at offset", oCdfh.iLocalOffset); // not throw?
			}

			iLfhExtrafieldLength = this.readUShort(oCdfh.iLocalOffset + 28); // extra field length
			oCdfh.iDataStart = oCdfh.iLocalOffset + iLfhLen + oCdfh.sName.length + iLfhExtrafieldLength;

			oEntryTable[oCdfh.sName] = oCdfh;
		}
		return oEntryTable;
	},

	inflate: function (iOffset, iCompressedSize, iFinalSize) {
		/* eslint-disable array-element-newline */
		var aStartLens = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258],
			aLExt = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0],
			aDists = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577],
			aDExt = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13],
			aDynamicTableOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
			/* eslint-enable array-element-newline */
			that = this,
			aData = this.aData,
			iBufEnd = iOffset + iCompressedSize, //???  + 1, // aData.length, // the amount of bytes to read
			iInCnt = iOffset, // read position
			iOutCnt = 0, // bytes written to outbuf
			iBitCnt = 0, // helper to keep track of where we are in #bits
			iBitBuf = 0,
			aOutBuf = new Uint8Array(iFinalSize),
			oDistCode, oLenCode, iLast, iType, aLens,

			fnBits = function (iNeed) {
				var iOut = iBitBuf;

				while (iBitCnt < iNeed) {
					if (iInCnt === iBufEnd) {
						throw that.composeError(Error(), "Zip: inflate: Data overflow", that.sZipName);
					}
					iOut |= aData[iInCnt] << iBitCnt; // eslint-disable-line no-bitwise
					iInCnt += 1;
					iBitCnt += 8;
				}
				iBitBuf = iOut >> iNeed; // eslint-disable-line no-bitwise
				iBitCnt -= iNeed;
				return iOut & ((1 << iNeed) - 1); // eslint-disable-line no-bitwise
			},

			fnDecode = function (oCodes) {
				var code = 0,
					first = 0,
					i = 0,
					count, j;

				for (j = 1; j <= 0xF; j += 1) {
					code |= fnBits(1); // eslint-disable-line no-bitwise
					count = oCodes.count[j];
					if (code < first + count) {
						return oCodes.symbol[i + (code - first)];
					}
					i += count;
					first += count;
					first <<= 1; // eslint-disable-line no-bitwise
					code <<= 1; // eslint-disable-line no-bitwise
				}
				return null;
			},

			fnConstruct = function (oCodes, aLens2, n) {
				var aOffs = [/* undefined */, 0],
					iLeft = 1,
					i;

				for (i = 0; i <= 0xF; i += 1) {
					oCodes.count[i] = 0;
				}

				for (i = 0; i < n; i += 1) {
					oCodes.count[aLens2[i]] += 1;
				}

				if (oCodes.count[0] === n) {
					return 0;
				}

				for (i = 1; i <= 0xF; i += 1) {
					if ((iLeft = (iLeft << 1) - oCodes.count[i]) < 0) { // eslint-disable-line no-bitwise
						return iLeft;
					}
				}

				for (i = 1; i < 0xF; i += 1) {
					aOffs[i + 1] = aOffs[i] + oCodes.count[i];
				}

				for (i = 0; i < n; i += 1) {
					if (aLens2[i] !== 0) {
						oCodes.symbol[aOffs[aLens2[i]]] = i;
						aOffs[aLens2[i]] += 1;
					}
				}
				return iLeft;
			},

			fnInflateStored = function () {
				var iLen;

				iBitBuf = 0;
				iBitCnt = 0;
				if (iInCnt + 4 > iBufEnd) {
					throw that.composeError(Error(), "Zip: inflate: Data overflow", "", iInCnt);
				}

				iLen = that.readUShort(iInCnt);
				iInCnt += 2;

				if (aData[iInCnt] !== (~iLen & 0xFF) || aData[iInCnt + 1] !== ((~iLen >> 8) & 0xFF)) { // eslint-disable-line no-bitwise
					throw that.composeError(Error(), "Zip: inflate: Bad length", "", iInCnt);
				}
				iInCnt += 2;

				if (iInCnt + iLen > iBufEnd) {
					throw that.composeError(Error(), "Zip: inflate: Data overflow", "", iInCnt);
				}

				// Compatibility: Instead of: outbuf.push.apply(outbuf, outbuf.slice(incnt, incnt + len)); outcnt += len; incnt += len;
				while (iLen) {
					aOutBuf[iOutCnt] = aData[iInCnt];
					iOutCnt += 1;
					iInCnt += 1;
					iLen -= 1;
				}
			},

			fnConstructFixedHuffman = function () { //TTT untested?
				var iSymbol;

				for (iSymbol = 0; iSymbol < 0x90; iSymbol += 1) {
					aLens[iSymbol] = 8;
				}
				for (; iSymbol < 0x100; iSymbol += 1) {
					aLens[iSymbol] = 9;
				}
				for (; iSymbol < 0x118; iSymbol += 1) {
					aLens[iSymbol] = 7;
				}
				for (; iSymbol < 0x120; iSymbol += 1) {
					aLens[iSymbol] = 8;
				}
				fnConstruct(oLenCode, aLens, 0x120);
				for (iSymbol = 0; iSymbol < 0x1E; iSymbol += 1) {
					aLens[iSymbol] = 5;
				}
				fnConstruct(oDistCode, aLens, 0x1E);
			},

			fnConstructDynamicHuffman = function () {
				var iNLen, iNDist, iNCode,
					i, iSymbol, iLen, iErr1, iErr2;

				iNLen = fnBits(5) + 257;
				iNDist = fnBits(5) + 1;
				iNCode = fnBits(4) + 4;
				if (iNLen > 0x11E || iNDist > 0x1E) {
					throw that.composeError(Error(), "Zip: inflate: length/distance code overflow", "", 0);
				}
				for (i = 0; i < iNCode; i += 1) {
					aLens[aDynamicTableOrder[i]] = fnBits(3);
				}
				for (; i < 19; i += 1) {
					aLens[aDynamicTableOrder[i]] = 0;
				}
				if (fnConstruct(oLenCode, aLens, 19) !== 0) {
					throw that.composeError(Error(), "Zip: inflate: length codes incomplete", "", 0);
				}

				for (i = 0; i < iNLen + iNDist;) {
					iSymbol = fnDecode(oLenCode);
					/* eslint-disable max-depth */
					if (iSymbol < 16) {
						aLens[i] = iSymbol;
						i += 1;
					} else {
						iLen = 0;
						if (iSymbol === 16) {
							if (i === 0) {
								throw that.composeError(Error(), "Zip: inflate: repeat lengths with no first length", "", 0);
							}
							iLen = aLens[i - 1];
							iSymbol = 3 + fnBits(2);
						} else if (iSymbol === 17) {
							iSymbol = 3 + fnBits(3);
						} else {
							iSymbol = 11 + fnBits(7);
						}

						if (i + iSymbol > iNLen + iNDist) {
							throw that.composeError(Error(), "Zip: inflate: more lengths than specified", "", 0);
						}
						while (iSymbol) {
							aLens[i] = iLen;
							iSymbol -= 1;
							i += 1;
						}
					}
					/* eslint-enable max-depth */
				}
				iErr1 = fnConstruct(oLenCode, aLens, iNLen);
				iErr2 = fnConstruct(oDistCode, aLens.slice(iNLen), iNDist);
				if ((iErr1 < 0 || (iErr1 > 0 && iNLen - oLenCode.count[0] !== 1))
				|| (iErr2 < 0 || (iErr2 > 0 && iNDist - oDistCode.count[0] !== 1))) {
					throw that.composeError(Error(), "Zip: inflate: bad literal or length codes", "", 0);
				}
			},

			fnInflateHuffmann = function () {
				var iSymbol, iLen, iDist;

				do { // decode deflated data
					iSymbol = fnDecode(oLenCode);
					if (iSymbol < 256) {
						aOutBuf[iOutCnt] = iSymbol;
						iOutCnt += 1;
					}
					if (iSymbol > 256) {
						iSymbol -= 257;
						if (iSymbol > 28) {
							throw that.composeError(Error(), "Zip: inflate: Invalid length/distance", "", 0);
						}
						iLen = aStartLens[iSymbol] + fnBits(aLExt[iSymbol]);
						iSymbol = fnDecode(oDistCode);
						iDist = aDists[iSymbol] + fnBits(aDExt[iSymbol]);
						if (iDist > iOutCnt) {
							throw that.composeError(Error(), "Zip: inflate: distance out of range", "", 0);
						}
						// instead of outbuf.slice, we use...
						while (iLen) {
							aOutBuf[iOutCnt] = aOutBuf[iOutCnt - iDist];
							iLen -= 1;
							iOutCnt += 1;
						}
					}
				} while (iSymbol !== 256);
			};

		do { // The actual inflation
			iLast = fnBits(1);
			iType = fnBits(2);

			switch (iType) {
			case 0: // STORED
				fnInflateStored();
				break;
			case 1:
			case 2: // fixed (=1) or dynamic (=2) huffman
				oLenCode = {
					count: [],
					symbol: []
				};
				oDistCode = {
					count: [],
					symbol: []
				};
				aLens = [];
				if (iType === 1) { // construct fixed huffman tables
					fnConstructFixedHuffman();
				} else { // construct dynamic huffman tables
					fnConstructDynamicHuffman();
				}

				fnInflateHuffmann();

				break;
			default:
				throw this.composeError(Error(), "Zip: inflate: unsupported compression type" + iType, "", 0);
			}
		} while (!iLast);
		return aOutBuf;
	},

	readData: function (sName) {
		var sDataUTF8 = "",
			oCdfh, aFileData, aSavedData;

		oCdfh = this.oEntryTable[sName];
		if (!oCdfh) {
			throw this.composeError(Error(), "Zip: readData: file does not exist:" + sName, "", 0);
		}

		if (oCdfh.iCompressionMethod === 0) { // stored
			sDataUTF8 = this.readUTF(oCdfh.iDataStart, oCdfh.iSize);
		} else if (oCdfh.iCompressionMethod === 8) { // deflated
			aFileData = this.inflate(oCdfh.iDataStart, oCdfh.iCompressedSize, oCdfh.iSize);
			aSavedData = this.aData;
			this.aData = aFileData; // we need to switch this.aData
			sDataUTF8 = this.readUTF(0, aFileData.length);
			this.aData = aSavedData; // restore

			if (sDataUTF8.length !== oCdfh.iSize || sDataUTF8.length !== aFileData.length) { //TTT assert
				Utils.console.error("Zip: readData: different length 1!");
			}
		} else {
			throw this.composeError(Error(), "Zip: readData: compression method not supported:" + oCdfh.iCompressionMethod, "", 0);
		}
		if (sDataUTF8.length !== oCdfh.iSize) { //TTT assert
			Utils.console.error("Zip: readData: different length 2!");
		}
		return sDataUTF8;
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = ZipFile;
}
