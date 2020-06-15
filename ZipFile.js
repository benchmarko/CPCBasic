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
// and Cpcemu: zip.cpp

function ZipFile(aData, sZipName) {
	this.init(aData, sZipName);
}

ZipFile.prototype = {
	init: function (aData, sZipName) {
		var i, n, iZipEnd, iEntryAmount, iOffset, aTmpdata, iLen, oEntry, iDostime;

		this.aData = aData;
		this.sZipName = sZipName;

		this.oEntryTable = {};

		i = aData.length - 21; // 22=END Header size, 1 offset to make loop functional
		n = Math.max(0, i - 0xFFFF); // 0xFFFF=max zip comment length
		while (i >= n) {
			i -= 1;
			if (this.readUInt(aData, i) === 0x06054B50) { // end of central signature: "PK\x05\x06"
				iZipEnd = i;
			}
		}
		if (!iZipEnd) {
			throw this.composeError(Error(), "Zip ended abruptly", "", (i >= 0) ? i : 0);
		}

		// read from header:
		iEntryAmount = this.readUShort(aData, iZipEnd + 10);

		// Process entries
		iOffset = this.readUInt(aData, iZipEnd + 0x10); // 0x10=Offset of first CEN header

		for (i = 0; i < iEntryAmount; i += 1) {
			aTmpdata = this.subArr(aData, iOffset, 0x2E);
			iOffset += 46; // VERIFY HEADER | 0x2E=Cen header size

			if (this.readUInt(aTmpdata, 0x0) !== 0x02014B50) { // central header signature: "PK\x01\x02" (0x02014B50)
				throw this.composeError(Error(), "Bad Zip CEN signature", "", i);
			}

			iLen = this.readUShort(aTmpdata, 0x1C); // NAME | 0x1C=Name size
			if (iLen === 0) {
				throw this.composeError(Error(), "Zip Entry name missing", "", i);
			}

			oEntry = new ZipFile.ZipEntry(this.readUTF(aData, iLen, iOffset));
			iOffset += iLen;
			oEntry.bIsDirectory = oEntry.sName.charAt(oEntry.sName.length - 1) === "/";

			iLen = this.readUShort(aTmpdata, 0x1E); // 0x1E=extra field size
			if (iLen > 0) {
				oEntry.extra = this.subArr(aData, iOffset, iLen);
				iOffset += iLen;
			}

			iLen = this.readUShort(aTmpdata, 0x20); // COMMENT | 0x20=Comment field size
			oEntry.sComment = this.readUTF(aData, iLen, iOffset);
			iOffset += iLen;
			oEntry.version = this.readUShort(aTmpdata, 0x06); // VERSION
			oEntry.flag = this.readUShort(aTmpdata, 0x08); // FLAG
			if ((oEntry.flag & 1) === 1) { // eslint-disable-line no-bitwise
				throw this.composeError(Error(), "Zip encrypted entries not supported", "", i);
			}

			oEntry.iMethod = this.readUShort(aTmpdata, 0x0A); // compression method

			iDostime = this.readUInt(aTmpdata, 0x0C);
			// year, month, day, hour, minute, second
			oEntry.oTimestamp = new Date(((iDostime >> 25) & 0x7F) + 1980, ((iDostime >> 21) & 0x0F) - 1, (iDostime >> 16) & 0x1F, (iDostime >> 11) & 0x1F, (iDostime >> 5) & 0x3F, (iDostime & 0x1F) << 1).getTime(); // eslint-disable-line no-bitwise

			oEntry.iCrc = this.readUInt(aTmpdata, 0x10);
			oEntry.iCompressedSize = this.readUInt(aTmpdata, 0x14);
			oEntry.iSize = this.readUInt(aTmpdata, 0x18); // uncompressed size
			oEntry.locOffset = this.readUInt(aTmpdata, 0x2A);
			oEntry.oZip = this;
			oEntry.aData = null;
			oEntry.dataUTF8 = null;
			oEntry.dataBase64 = null;

			// 30=End of LOC header, Bitshift=Read short
			oEntry.dataStart = oEntry.locOffset + 30 + oEntry.sName.length + ((this.aData[oEntry.locOffset + 29] << 8) | this.aData[oEntry.locOffset + 28]); // eslint-disable-line no-bitwise

			this.oEntryTable[oEntry.sName] = oEntry; /* Add to entry map */
		}
	},

	composeError: function () { // varargs
		var aArgs = Array.prototype.slice.call(arguments);

		aArgs[1] = this.sZipName + ": " + aArgs[1]; // put zipname in message
		aArgs.unshift("ZipFile");
		return Utils.composeError.apply(null, aArgs);
	},

	subArr: function (aData, iBegin, iEnd) {
		iEnd = typeof iEnd === "undefined" ? aData.length : iBegin + iEnd;
		return aData.slice ? aData.slice(iBegin, iEnd) : aData.subarray(iBegin, iEnd); // array.slice on Uint8Array not for IE11
	},

	readUTF: function (aData, iLen, iOffset) {
		var iCallSize = 25000, //TTT
			sOut, i, l;

		iOffset = iOffset || 0;
		aData = this.subArr(aData, iOffset, iLen);
		sOut = "";
		for (i = 0, l = aData.length; i < l; i += iCallSize) {
			sOut += String.fromCharCode.apply(null, this.subArr(aData, i, iCallSize));
		}
		return sOut;
	},

	readUInt: function (aData, i) {
		return (aData[i + 3] << 24) | (aData[i + 2] << 16) | (aData[i + 1] << 8) | aData[i]; // eslint-disable-line no-bitwise
	},

	readUShort: function (aData, i) {
		return ((aData[i + 1]) << 8) | aData[i]; // eslint-disable-line no-bitwise
	},

	inflate: function (aData, finalLen) { // eslint-disable-line complexity
		/* eslint-disable array-element-newline */
		var aLens = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258],
			aLExt = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0],
			aDists = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577],
			aDExt = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13],
			aDynamicTableOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
			/* eslint-enable array-element-newline */
			that = this,
			aInBuf = aData,
			iBufLen = aData.length, // the amount of bytes to read
			iInCnt = 0, // amount of bytes read
			iOutCnt = 0, // bytes written to outbuf
			iBitCnt = 0, // helper to keep track of where we are in #bits
			iBitBuf = 0,
			aOutBuf = new Uint8Array(finalLen),
			oDistCode, oLenCode, iSymbol, iNCode, iNDist, iDist, iLast, iType, lens, iNLen, iErr1, iErr2, iLen, i,

			fnBits = function (iNeed) {
				var iOut = iBitBuf;

				while (iBitCnt < iNeed) {
					if (iInCnt === iBufLen) {
						throw that.composeError(Error(), "Zip: inflate: Data overflow", that.sZipName, i);
					}
					iOut |= aInBuf[iInCnt] << iBitCnt; // eslint-disable-line no-bitwise
					iInCnt += 1;
					iBitCnt += 8;
				}
				iBitBuf = iOut >> iNeed; // eslint-disable-line no-bitwise
				iBitCnt -= iNeed;
				return iOut & ((1 << iNeed) - 1);	// eslint-disable-line no-bitwise
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
			fnConstruct = function (oCodes, lens, n) {
				var aOffs = [/* undefined */, 0],
					iLeft = 1,
					i;

				for (i = 0; i <= 0xF; i += 1) {
					oCodes.count[i] = 0;
				}

				for (i = 0; i < n; i += 1) {
					oCodes.count[lens[i]] += 1;
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
					if (lens[i] !== 0) {
						oCodes.symbol[aOffs[lens[i]]] = i;
						aOffs[lens[i]] += 1;
					}
				}
				return iLeft;
			};

		do { // The actual inflation
			iLast = fnBits(1);
			iType = fnBits(2);

			switch (iType) {
			case 0: // STORED
				iBitBuf = 0;
				iBitCnt = 0;
				if (iInCnt + 4 > iBufLen) {
					throw this.composeError(Error(), "Zip: inflate: Data overflow", "", iInCnt);
				}
				iLen = aInBuf[iInCnt];
				iInCnt += 1;
				iLen |= aInBuf[iInCnt] << 8; // eslint-disable-line no-bitwise
				iInCnt += 1;

				if (aInBuf[iInCnt] !== (~iLen & 0xFF) || aInBuf[iInCnt + 1] !== ((~iLen >> 8) & 0xFF)) { // eslint-disable-line no-bitwise
					throw this.composeError(Error(), "Zip: inflate: Bad length", "", iInCnt);
				}
				iInCnt += 2;

				if (iInCnt + iLen > iBufLen) {
					throw this.composeError(Error(), "Zip: inflate: Data overflow", "", iInCnt);
				}

				// Compatibility: Instead of: outbuf.push.apply(outbuf, outbuf.slice(incnt, incnt + len)); outcnt += len; incnt += len;
				while (iLen) {
					aOutBuf[iOutCnt] = aInBuf[iInCnt];
					iOutCnt += 1;
					iInCnt += 1;
					iLen -= 1;
				}
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
				lens = [];
				if (iType === 1) { // construct fixed huffman tables
					// UNTESTED ??
					for (iSymbol = 0; iSymbol < 0x90; iSymbol += 1) {
						lens[iSymbol] = 8;
					}
					for (; iSymbol < 0x100; iSymbol += 1) {
						lens[iSymbol] = 9;
					}
					for (; iSymbol < 0x118; iSymbol += 1) {
						lens[iSymbol] = 7;
					}
					for (; iSymbol < 0x120; iSymbol += 1) {
						lens[iSymbol] = 8;
					}
					fnConstruct(oLenCode, lens, 0x120);
					for (iSymbol = 0; iSymbol < 0x1E; iSymbol += 1) {
						lens[iSymbol] = 5;
					}
					fnConstruct(oDistCode, lens, 0x1E);
				} else { // construct dynamic huffman tables
					iNLen = fnBits(5) + 257;
					iNDist = fnBits(5) + 1;
					iNCode = fnBits(4) + 4;
					if (iNLen > 0x11E || iNDist > 0x1E) {
						throw this.composeError(Error(), "Zip: inflate: length/distance code overflow", "", 0);
					}
					for (i = 0; i < iNCode; i += 1) {
						lens[aDynamicTableOrder[i]] = fnBits(3);
					}
					for (; i < 19; i += 1) {
						lens[aDynamicTableOrder[i]] = 0;
					}
					if (fnConstruct(oLenCode, lens, 19) !== 0) {
						throw this.composeError(Error(), "Zip: inflate: length codes incomplete", "", 0);
					}

					for (i = 0; i < iNLen + iNDist;) {
						iSymbol = fnDecode(oLenCode);
						/* eslint-disable max-depth */
						if (iSymbol < 16) {
							lens[i] = iSymbol;
							i += 1;
						} else {
							iLen = 0;
							if (iSymbol === 16) {
								if (i === 0) {
									throw this.composeError(Error(), "Zip: inflate: repeat lengths with no first length", "", 0);
								}
								iLen = lens[i - 1];
								iSymbol = 3 + fnBits(2);
							} else if (iSymbol === 17) {
								iSymbol = 3 + fnBits(3);
							} else {
								iSymbol = 11 + fnBits(7);
							}

							if (i + iSymbol > iNLen + iNDist) {
								throw this.composeError(Error(), "Zip: inflate: more lengths than specified", "", 0);
							}
							while (iSymbol) {
								lens[i] = iLen;
								iSymbol -= 1;
								i += 1;
							}
						}
						/* eslint-enable max-depth */
					}
					iErr1 = fnConstruct(oLenCode, lens, iNLen);
					iErr2 = fnConstruct(oDistCode, lens.slice(iNLen), iNDist);
					if ((iErr1 < 0 || (iErr1 > 0 && iNLen - oLenCode.count[0] !== 1))
					|| (iErr2 < 0 || (iErr2 > 0 && iNDist - oDistCode.count[0] !== 1))) {
						throw this.composeError(Error(), "Zip: inflate: bad literal or length codes", "", 0);
					}
				}

				do { /* Decode deflated data */
					iSymbol = fnDecode(oLenCode);
					if (iSymbol < 256) {
						aOutBuf[iOutCnt] = iSymbol;
						iOutCnt += 1;
					}
					if (iSymbol > 256) {
						iSymbol -= 257;
						if (iSymbol > 28) {
							throw this.composeError(Error(), "Zip: inflate: Invalid length/distance", "", 0);
						}
						iLen = aLens[iSymbol] + fnBits(aLExt[iSymbol]);
						iSymbol = fnDecode(oDistCode);
						iDist = aDists[iSymbol] + fnBits(aDExt[iSymbol]);
						if (iDist > iOutCnt) {
							throw this.composeError(Error(), "Zip: inflate: distance out of range", "", 0);
						}
						// instead of outbuf.slice, we use...
						while (iLen) {
							aOutBuf[iOutCnt] = aOutBuf[iOutCnt - iDist];
							iLen -= 1;
							iOutCnt += 1;
						}
					}
				} while (iSymbol !== 256);
				break;
			default:
				throw this.composeError(Error(), "Zip: inflate: unsupported compression type" + iType, "", 0);
			}
		} while (!iLast);
		return aOutBuf;
	}
};


ZipFile.ZipEntry = function (sName) {
	this.sName = sName;
};

ZipFile.ZipEntry.prototype.read = function (sEncoding) {
	var fileData, b64, data;

	sEncoding = sEncoding || "";
	switch (sEncoding.toLowerCase()) {
	case "raw":
		if (this.aData) {
			return this.aData;
		}
		fileData = this.oZip.subArr(this.oZip.aData, this.dataStart, this.iCompressedSize);
		if (this.iMethod === 0) { // STORED
			this.aData = fileData;
			return fileData;
		} else if (this.iMethod === 8) { // DEFLATED
			return (this.aData = this.oZip.inflate(fileData, this.iSize));
		}
		throw this.oZip.composeError(Error(), "Zip: Invalid compression method", this.iMethod);

	case "base64":
		if (this.dataBase64) {
			return this.dataBase64;
		}
		b64 = Utils.btoa(this.read());
		return (this.dataBase64 = b64);

	case "utf8":
	default:
		if (this.dataUTF8) {
			return this.dataUTF8;
		}
		data = this.read("raw");
		return (this.dataUTF8 = this.oZip.readUTF(data, data.length));
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = ZipFile;
}
