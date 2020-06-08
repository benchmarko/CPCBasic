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
		var i, n, iZipEnd, aHead, iEntryAmount, iOffset, aTmpdata, iLen, oEntry, iDostime;

		this.aData = aData;
		this.sZipName = sZipName;

		this.oEntryTable = {};

		i = aData.length - 21; /* 22=END Header size, 1 offset to make loop functional */
		n = Math.max(0, i - 0xFFFF); /* 0xFFFF=Max zip comment length */
		while (i >= n) {
			i -= 1;
			if (this.readUInt(aData, i) === 0x06054B50) { // end of central signature: "PK\x05\x06"
				iZipEnd = i;
			}
		}
		if (!iZipEnd) {
			throw this.composeError(Error(), "Zip ended abruptly", "", (i >= 0) ? i : 0);
		}

		aHead = this.subArr(aData, iZipEnd, 22);
		iEntryAmount = this.readUShort(aHead, 10);

		// Process entries
		iOffset = this.readUInt(aHead, 0x10); /* 0x10=Offset of first CEN header */

		for (i = 0; i < iEntryAmount; i += 1) {
			aTmpdata = this.subArr(aData, iOffset, 0x2E);
			iOffset += 46; /* VERIFY HEADER | 0x2E=Cen header size */

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

			oEntry.crc = this.readUInt(aTmpdata, 0x10);
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
			distcode, lencode, symbol, ncode, ndist, dist, last, type, lens, nlen, err1, err2, len, i,
			aInBuf = aData,
			iBufLen = aData.length, // the amount of bytes to read
			iInCnt = 0, // amount of bytes read
			iOutCnt = 0, // bytes written to outbuf
			iBitCnt = 0, // helper to keep track of where we are in #bits
			iBitBuf = 0,
			aOutBuf = new Uint8Array(finalLen),

			// helper functions
			fnBits = function (need) {
				var out = iBitBuf;

				while (iBitCnt < need) {
					if (iInCnt === iBufLen) {
						throw that.composeError(Error(), "Zip: inflate: Data overflow", that.sZipName, i);
					}
					out |= aInBuf[iInCnt] << iBitCnt; // eslint-disable-line no-bitwise
					iInCnt += 1;
					iBitCnt += 8;
				}
				iBitBuf = out >> need; // eslint-disable-line no-bitwise
				iBitCnt -= need;
				return out & ((1 << need) - 1);	// eslint-disable-line no-bitwise
			},
			fnDecode = function (codes) {
				var code = 0,
					first = 0,
					i = 0,
					count, j;

				for (j = 1; j <= 0xF; j += 1) {
					code |= fnBits(1); // eslint-disable-line no-bitwise
					count = codes.count[j];
					if (code < first + count) {
						return codes.symbol[i + (code - first)];
					}
					i += count;
					first += count;
					first <<= 1; // eslint-disable-line no-bitwise
					code <<= 1; // eslint-disable-line no-bitwise
				}
				return null;
			},
			fnConstruct = function (codes, lens, n) {
				var offs = [/* undefined */, 0],
					left = 1,
					i;

				for (i = 0; i <= 0xF; i += 1) {
					codes.count[i] = 0;
				}

				for (i = 0; i < n; i += 1) {
					codes.count[lens[i]] += 1;
				}

				if (codes.count[0] === n) {
					return 0;
				}

				for (i = 1; i <= 0xF; i += 1) {
					if ((left = (left << 1) - codes.count[i]) < 0) { // eslint-disable-line no-bitwise
						return left;
					}
				}

				for (i = 1; i < 0xF; i += 1) {
					offs[i + 1] = offs[i] + codes.count[i];
				}

				for (i = 0; i < n; i += 1) {
					if (lens[i] !== 0) {
						codes.symbol[offs[lens[i]]] = i;
						offs[lens[i]] += 1;
					}
				}
				return left;
			};

		do { // The actual inflation
			last = fnBits(1);
			type = fnBits(2);

			switch (type) {
			case 0: // STORED
				iBitBuf = 0;
				iBitCnt = 0;
				if (iInCnt + 4 > iBufLen) {
					throw this.composeError(Error(), "Zip: inflate: Data overflow", "", iInCnt);
				}
				len = aInBuf[iInCnt];
				iInCnt += 1;
				len |= aInBuf[iInCnt] << 8; // eslint-disable-line no-bitwise
				iInCnt += 1;

				if (aInBuf[iInCnt++] !== (~len & 0xFF) || aInBuf[iInCnt++] !== ((~len >> 8) & 0xFF)) { // eslint-disable-line no-bitwise
					throw this.composeError(Error(), "Zip: inflate: Bad length", "", iInCnt);
				}

				if (iInCnt + len > iBufLen) {
					throw this.composeError(Error(), "Zip: inflate: Data overflow", "", iInCnt);
				}

				// Compatibility: Instead of: outbuf.push.apply(outbuf, outbuf.slice(incnt, incnt + len)); outcnt += len; incnt += len;
				while (len) {
					aOutBuf[iOutCnt] = aInBuf[iInCnt];
					iOutCnt += 1;
					iInCnt += 1;
					len -= 1;
				}
				break;
			case 1:
			case 2: // FIXED or DYNAMIC HUFFMAN
				lencode = {
					count: [],
					symbol: []
				};
				distcode = {
					count: [],
					symbol: []
				};
				lens = [];
				if (type === 1) { // construct fixed huffman tables
					/* UNTESTED */
					for (symbol = 0; symbol < 0x90; symbol += 1) {
						lens[symbol] = 8;
					}
					for (; symbol < 0x100; symbol += 1) {
						lens[symbol] = 9;
					}
					for (; symbol < 0x118; symbol += 1) {
						lens[symbol] = 7;
					}
					for (; symbol < 0x120; symbol += 1) {
						lens[symbol] = 8;
					}
					fnConstruct(lencode, lens, 0x120);
					for (symbol = 0; symbol < 0x1E; symbol += 1) {
						lens[symbol] = 5;
					}
					fnConstruct(distcode, lens, 0x1E);
				} else { /* Construct dynamic huffman tables */
					nlen = fnBits(5) + 257;
					ndist = fnBits(5) + 1;
					ncode = fnBits(4) + 4;
					if (nlen > 0x11E || ndist > 0x1E) {
						throw this.composeError(Error(), "Zip: inflate: length/distance code overflow", "", 0);
					}
					for (i = 0; i < ncode; i += 1) {
						lens[aDynamicTableOrder[i]] = fnBits(3);
					}
					for (; i < 19; i += 1) {
						lens[aDynamicTableOrder[i]] = 0;
					}
					if (fnConstruct(lencode, lens, 19) !== 0) {
						throw this.composeError(Error(), "Zip: inflate: length codes incomplete", "", 0);
					}

					for (i = 0; i < nlen + ndist;) {
						symbol = fnDecode(lencode);
						/* eslint-disable max-depth */
						if (symbol < 16) {
							lens[i] = symbol;
							i += 1;
						} else {
							len = 0;
							if (symbol === 16) {
								if (i === 0) {
									throw this.composeError(Error(), "Zip: inflate: repeat lengths with no first length", "", 0);
								}
								len = lens[i - 1];
								symbol = 3 + fnBits(2);
							} else if (symbol === 17) {
								symbol = 3 + fnBits(3);
							} else {
								symbol = 11 + fnBits(7);
							}

							if (i + symbol > nlen + ndist) {
								throw this.composeError(Error(), "Zip: inflate: more lengths than specified", "", 0);
							}
							while (symbol) {
								lens[i] = len;
								symbol -= 1;
								i += 1;
							}
						}
						/* eslint-enable max-depth */
					}
					err1 = fnConstruct(lencode, lens, nlen);
					err2 = fnConstruct(distcode, lens.slice(nlen), ndist);
					if ((err1 < 0 || (err1 > 0 && nlen - lencode.count[0] !== 1))
					|| (err2 < 0 || (err2 > 0 && ndist - distcode.count[0] !== 1))) {
						throw this.composeError(Error(), "Zip: inflate: bad literal or length codes", "", 0);
					}
				}

				do { /* Decode deflated data */
					symbol = fnDecode(lencode);
					if (symbol < 256) {
						aOutBuf[iOutCnt] = symbol;
						iOutCnt += 1;
					}
					if (symbol > 256) {
						symbol -= 257;
						if (symbol > 28) {
							throw this.composeError(Error(), "Zip: inflate: Invalid length/distance", "", 0);
						}
						len = aLens[symbol] + fnBits(aLExt[symbol]);
						symbol = fnDecode(distcode);
						dist = aDists[symbol] + fnBits(aDExt[symbol]);
						if (dist > iOutCnt) {
							throw this.composeError(Error(), "Zip: inflate: distance out of range", "", 0);
						}
						// instead of outbuf.slice, we use...
						while (len) {
							aOutBuf[iOutCnt] = aOutBuf[iOutCnt - dist];
							len -= 1;
							iOutCnt += 1;
						}
					}
				} while (symbol !== 256);
				break;
			default:
				throw this.composeError(Error(), "Zip: inflate: unsupported compression type" + type, "", 0);
			}
		} while (!last);
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
		if (this.iMethod === 0) { /* STORED */
			this.aData = fileData;
			return fileData;
		} else if (this.iMethod === 8) { /* DEFLATED */
			return (this.aData = this.oZip.inflate(fileData, this.iSize));
		}
		throw "ZipFile.ZipEntry: Invalid compression method"; //TTT

	case "base64":
		if (this.dataBase64) {
			return this.dataBase64;
		}
		b64 = Utils.btoa(this.read());
		return (this.dataBase64 = b64);

	case "utf8":
	case "utf-8":
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
