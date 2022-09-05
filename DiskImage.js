// DiskImage.js - DiskImage
// (c) Marco Vieth, 2020
// https://benchmarko.github.io/CPCBasic/

"use strict";

var Utils;

if (typeof require !== "undefined") {
	Utils = require("./Utils.js"); // eslint-disable-line global-require
}

// Extended DSK image definition
// https://www.cpcwiki.eu/index.php/Format:DSK_disk_image_file_format
// http://www.cpctech.org.uk/docs/extdsk.html

function DiskImage(oConfig) {
	this.init(oConfig);
}

DiskImage.prototype = {
	init: function (oConfig) {
		this.oConfig = oConfig || {};

		this.sData = oConfig.sData;
		this.bQuiet = oConfig.bQuiet || false;
		this.reset();
	},

	reset: function () {
		this.iPos = 0;

		this.oDiskInfo = {
			oTrackInfo: {
				aSectorInfo: []
			}
		};

		this.oFormat = {};
		return this;
	},

	composeError: function (oError, message, value, pos) {
		return Utils.composeError("DiskImage", oError, this.oConfig.sDiskName + ": " + message, value, pos || 0);
	},

	testDiskIdent: function (sIdent) {
		var iDiskType = 0;

		if (sIdent === "MV - CPC") {
			iDiskType = 1;
		} else if (sIdent === "EXTENDED") {
			iDiskType = 2;
		}
		return iDiskType;
	},

	readUtf: function (iPos, iLen) {
		var sOut = this.sData.substr(iPos, iLen);

		if (sOut.length !== iLen) {
			throw this.composeError(new Error(), "End of File", "", iPos);
		}

		return sOut;
	},

	readUInt8: function (iPos) {
		var iNum = this.sData.charCodeAt(iPos);

		if (isNaN(iNum)) {
			throw this.composeError(new Error(), "End of File", String(iNum), iPos);
		}

		return iNum;
	},

	readUInt16: function (iPos) {
		return this.readUInt8(iPos) + this.readUInt8(iPos + 1) * 256;
	},

	readDiskInfo: function (iPos) {
		var iDiskInfoSize = 0x100,
			oDiskInfo = this.oDiskInfo,
			sIdent, iDiskType, i, iTrackSizeCount, iTrackSize, aTrackSizes, aTrackPos, iTrackPos;

		sIdent = this.readUtf(iPos, 8); // check first 8 characters as characteristic
		iDiskType = this.testDiskIdent(sIdent);

		if (!iDiskType) {
			throw this.composeError(Error(), "Ident not found", sIdent, iPos);
		}
		oDiskInfo.bExtended = (iDiskType === 2);

		oDiskInfo.sIdent = sIdent + this.readUtf(iPos + 8, 34 - 8); // read remaining ident

		if (oDiskInfo.sIdent.substr(34 - 11, 9) !== "Disk-Info") { // some tools use "Disk-Info  " instead of "Disk-Info\r\n", so compare without "\r\n"
			// "Disk-Info" string is optional
			if (!this.bQuiet) {
				Utils.console.warn(this.composeError({}, "Disk ident not found", oDiskInfo.sIdent.substr(34 - 11, 9), iPos + 34 - 11).message);
			}
		}

		oDiskInfo.sCreator = this.readUtf(iPos + 34, 14);
		oDiskInfo.iTracks = this.readUInt8(iPos + 48);
		oDiskInfo.iHeads = this.readUInt8(iPos + 49);
		oDiskInfo.iTrackSize = this.readUInt16(iPos + 50);

		iTrackPos = iDiskInfoSize;
		aTrackSizes = [];
		aTrackPos = [];

		iPos += 52; // track sizes high bytes start at offset 52 (0x35)
		iTrackSizeCount = oDiskInfo.iTracks * oDiskInfo.iHeads; // number of track sizes
		for (i = 0; i < iTrackSizeCount; i += 1) {
			aTrackPos.push(iTrackPos);
			iTrackSize = oDiskInfo.iTrackSize || (this.readUInt8(iPos + i) * 256); // take common track size or read individual track size (extended)
			aTrackSizes.push(iTrackSize);
			iTrackPos += iTrackSize;
		}
		oDiskInfo.aTrackSizes = aTrackSizes;
		oDiskInfo.aTrackPos = aTrackPos;
	},

	readTrackInfo: function (iPos) {
		var	iTrackInfoSize = 0x100,
			oTrackInfo = this.oDiskInfo.oTrackInfo,
			aSectorInfo = oTrackInfo.aSectorInfo,
			i, oSectorInfo, iSectorSize, oSectorNum2Index, iSectorPos;

		oTrackInfo.iDataPos = iPos + iTrackInfoSize;

		oTrackInfo.sIdent = this.readUtf(iPos, 12);
		if (oTrackInfo.sIdent.substr(0, 10) !== "Track-Info") { // some tools use ""Track-Info  " instead of ""Track-Info\r\n", so compare without "\r\n"
			// "Track-Info" string is optional
			if (!this.bQuiet) {
				Utils.console.warn(this.composeError({}, "Track ident not found", oTrackInfo.sIdent.substr(0, 10), iPos).message);
			}
		}
		// 4 unused bytes
		oTrackInfo.iTrack = this.readUInt8(iPos + 16);
		oTrackInfo.iHead = this.readUInt8(iPos + 17);
		oTrackInfo.iDataRate = this.readUInt8(iPos + 18);
		oTrackInfo.iRecMode = this.readUInt8(iPos + 19);
		oTrackInfo.iBps = this.readUInt8(iPos + 20);
		oTrackInfo.iSpt = this.readUInt8(iPos + 21);
		oTrackInfo.iGap3 = this.readUInt8(iPos + 22);
		oTrackInfo.iFill = this.readUInt8(iPos + 23);

		aSectorInfo.length = oTrackInfo.iSpt;

		oSectorNum2Index = {};
		oTrackInfo.oSectorNum2Index = oSectorNum2Index;

		iPos += 24; // start sector info

		iSectorPos = oTrackInfo.iDataPos;
		for (i = 0; i < oTrackInfo.iSpt; i += 1) {
			oSectorInfo = aSectorInfo[i] || {}; // resue if possible
			aSectorInfo[i] = oSectorInfo;

			oSectorInfo.iDataPos = iSectorPos;

			oSectorInfo.iTrack = this.readUInt8(iPos);
			oSectorInfo.iHead = this.readUInt8(iPos + 1);
			oSectorInfo.iSector = this.readUInt8(iPos + 2);
			oSectorInfo.iBps = this.readUInt8(iPos + 3);
			oSectorInfo.iState1 = this.readUInt8(iPos + 4);
			oSectorInfo.iState2 = this.readUInt8(iPos + 5);

			iSectorSize = this.readUInt16(iPos + 6) || (0x0080 << oTrackInfo.iBps); // eslint-disable-line no-bitwise
			oSectorInfo.iSectorSize = iSectorSize;
			iSectorPos += iSectorSize;

			oSectorNum2Index[oSectorInfo.iSector] = i;
			iPos += 8;
		}
	},

	seekTrack: function (iTrack, iHead) {
		var oDiskInfo = this.oDiskInfo,
			oTrackInfo = oDiskInfo.oTrackInfo,
			iTrackInfoPos;

		if (oTrackInfo.iTrack === iTrack && oTrackInfo.iHead === iHead) { // already positionend?
			return;
		}

		if (!oDiskInfo.sIdent) {
			this.readDiskInfo(0);
		}

		iTrackInfoPos = oDiskInfo.aTrackPos[iTrack * oDiskInfo.iHeads + iHead];
		this.readTrackInfo(iTrackInfoPos);
	},

	sectorNum2Index: function (iSector) {
		var oTrackInfo = this.oDiskInfo.oTrackInfo,
			iSectorIndex = oTrackInfo.oSectorNum2Index[iSector];

		return iSectorIndex;
	},

	seekSector: function (iSectorIndex) {
		var aSectorInfo = this.oDiskInfo.oTrackInfo.aSectorInfo,
			oSectorInfo = aSectorInfo[iSectorIndex];

		return oSectorInfo;
	},

	readSector: function (iSector) {
		var oTrackInfo = this.oDiskInfo.oTrackInfo,
			iSectorIndex = this.sectorNum2Index(iSector),
			oSectorInfo, sOut;

		if (iSectorIndex === undefined) {
			throw this.composeError(Error(), "Track " + oTrackInfo.iTrack + ": Sector not found", String(iSector), 0);
		}
		oSectorInfo = this.seekSector(iSectorIndex);
		sOut = this.readUtf(oSectorInfo.iDataPos, oSectorInfo.iSectorSize);
		return sOut;
	},

	// ...

	mFormatDescriptors: {
		data: {
			iTracks: 40, // number of tracks (1-85)
			iHeads: 1, // number of heads/sides (1-2)
			// head: 0, // head number?
			iBps: 2, // Bytes per Sector (1-5)
			iSpt: 9, // Sectors per Track (1-18)
			iGap3: 0x4e, // gap between ID and data
			iFill: 0xe5, // filler byte
			iFirstSector: 0xc1, // first sector number

			iBls: 1024, // BLS: data block allocaton size (1024, 2048, 4096, 8192, 16384)
			// bsh: 3, // log2 BLS - 7
			// blm: 7, // BLS / 128 - 1
			iAl0: 0xc0, // bit significant representation of reserved directory blocks 0..7 (0x80=0, 0xc00=0 and 1,,...)
			iAl1: 0x00, // bit significant representation of reserved directory blocks 8..15 (0x80=8,...)
			iOff: 0 // number of reserved tracks (also the track where the directory starts)
		},

		// double sided data
		data2: {
			sParentRef: "data",
			iHeads: 2
		},

		system: {
			sParentRef: "data",
			iFirstSector: 0x41,
			iOff: 2
		},

		// double sided system
		system2: {
			sParentRef: "system",
			iHeads: 2
		},

		vortex: {
			sParentRef: "data",
			iTracks: 80,
			iHeads: 2,
			iFirstSector: 0x01
		},

		"3dos": {
			sParentRef: "data",
			iFirstSector: 0x00
		},

		big780k: {
			sParentRef: "data",
			iAl0: 0x80, // block 0 reserved
			iTracks: 80,
			iOff: 1,
			iFirstSector: 0x01
		},

		big780k2: {
			sParentRef: "big780k",
			iHeads: 2
		}
	},

	getFormatDescriptor: function (sFormat) {
		var oFormat = this.mFormatDescriptors[sFormat],
			oParentFormat;

		if (!oFormat) {
			throw this.composeError(Error(), "Unknown format", sFormat);
		}

		if (oFormat.sParentRef) {
			oParentFormat = this.getFormatDescriptor(oFormat.sParentRef); // recursive
			oFormat = Object.assign({}, oParentFormat, oFormat);
		} else {
			oFormat = Object.assign({}, oFormat);
		}
		oFormat.sFormat = sFormat;
		return oFormat;
	},

	determineFormat: function () {
		var oDiskInfo = this.oDiskInfo,
			oTrackInfo,
			iTrack = 0,
			iHead = 0,
			iFirstSector = 0xff,
			sFormat = "",
			i, iSector;

		this.seekTrack(iTrack, iHead);
		oTrackInfo = oDiskInfo.oTrackInfo;

		for (i = 0; i < oTrackInfo.iSpt; i += 1) {
			iSector = oTrackInfo.aSectorInfo[i].iSector;
			if (iSector < iFirstSector) {
				iFirstSector = iSector;
			}
		}

		if (iFirstSector === 0xc1) {
			sFormat = "data";
		} else if (iFirstSector === 0x41) {
			sFormat = "system";
		} else if ((iFirstSector === 0x01) && (oDiskInfo.iTracks === 80)) { // big780k
			sFormat = "big780k";
		} else {
			throw this.composeError(Error(), "Unknown format with sector", String(iFirstSector));
		}

		if (oDiskInfo.iHeads > 1) { // maybe 2
			sFormat += String(oDiskInfo.iHeads); // e.g. "data": "data2"
		}

		return this.getFormatDescriptor(sFormat);
	},

	readDirectoryExtents: function (aExtents, iPos, iEndPos) {
		var oExtent, iChar, i, aBlocks, iBlock,

			fnRemoveHighBit7 = function (sStr) {
				var sOut = "";

				for (i = 0; i < sStr.length; i += 1) {
					iChar = sStr.charCodeAt(i);
					sOut += String.fromCharCode(iChar & 0x7f); // eslint-disable-line no-bitwise
				}
				return sOut;
			},

			fnUnpackFtypeFlags = function (sExt) {
				var aFTypes = [
						"bReadOnly",
						"bSystem",
						"bBackup" // not known
					],
					sFType;

				for (i = 0; i < aFTypes.length; i += 1) {
					sFType = aFTypes[i];
					iChar = sExt.charCodeAt(i);
					oExtent[sFType] = Boolean(iChar & 0x80); // eslint-disable-line no-bitwise
				}
			};

		while (iPos < iEndPos) {
			oExtent = {
				iUser: this.readUInt8(iPos),
				sName: this.readUtf(iPos + 1, 8),
				sExt: this.readUtf(iPos + 9, 3), // extension with high bits set for special flags
				iExtent: this.readUInt8(iPos + 12),
				iLastRecBytes: this.readUInt8(iPos + 13),
				iExtentHi: this.readUInt8(iPos + 14), // used for what?
				iRecords: this.readUInt8(iPos + 15),
				aBlocks: []
			};
			iPos += 16;

			oExtent.sName = fnRemoveHighBit7(oExtent.sName);
			fnUnpackFtypeFlags(oExtent.sExt);
			oExtent.sExt = fnRemoveHighBit7(oExtent.sExt);

			aBlocks = oExtent.aBlocks;
			for (i = 0; i < 16; i += 1) {
				iBlock = this.readUInt8(iPos + i);
				if (iBlock) {
					aBlocks.push(iBlock);
				} else { // last block
					break;
				}
			}
			iPos += 16;
			aExtents.push(oExtent);
		}
		return aExtents;
	},

	// do not know if we need to sort the extents per file, but...
	sortFileExtents: function (oDir) {
		var fnSortByExtentNumber = function (a, b) {
				return a.iExtent - b.iExtent;
			},
			sName, aFileExtents;

		for (sName in oDir) {
			if (oDir.hasOwnProperty(sName)) {
				aFileExtents = oDir[sName];
				aFileExtents.sort(fnSortByExtentNumber);
			}
		}
	},

	prepareDirectoryList: function (aExtents, iFill, reFilePattern) {
		var oDir = {},
			i, oExtent, sName;

		for (i = 0; i < aExtents.length; i += 1) {
			oExtent = aExtents[i];
			if (iFill === null || oExtent.iUser !== iFill) {
				sName = oExtent.sName + "." + oExtent.sExt; // and oExtent.iUser?
				// (do not convert filename here (to display messages in filenames))
				if (!reFilePattern || reFilePattern.test(sName)) {
					if (!(sName in oDir)) {
						oDir[sName] = [];
					}
					oDir[sName].push(oExtent);
				}
			}
		}
		this.sortFileExtents(oDir);
		return oDir;
	},

	convertBlock2Sector: function (iBlock) {
		var oFormat = this.oFormat,
			iSpt = oFormat.iSpt,
			iBlockSectors = 2,
			iLogSec = iBlock * iBlockSectors, // directory is in block 0-1
			oPos;

		oPos = {
			iTrack: Math.floor(iLogSec / iSpt) + oFormat.iOff,
			iHead: 0, // currently always 0
			iSector: (iLogSec % iSpt) + oFormat.iFirstSector
		};
		return oPos;
	},

	readDirectory: function (/* sFilePattern */) {
		var iDirectorySectors = 4,
			oSectorInfo, i,
			oFormat, iOff, iFirstSector, iSectorIndex,
			aExtents = [],
			oDir;

		oFormat = this.determineFormat();
		this.oFormat = oFormat;
		iOff = oFormat.iOff;

		this.seekTrack(iOff, 0);
		iFirstSector = oFormat.iFirstSector;

		for (i = 0; i < iDirectorySectors; i += 1) {
			iSectorIndex = this.sectorNum2Index(iFirstSector + i);
			if (iSectorIndex === undefined) {
				throw this.composeError(Error(), "Cannot read directory at track " + iOff + " sector", String(iFirstSector));
			}
			oSectorInfo = this.seekSector(iSectorIndex);
			this.readDirectoryExtents(aExtents, oSectorInfo.iDataPos, oSectorInfo.iDataPos + oSectorInfo.iSectorSize);
		}

		oDir = this.prepareDirectoryList(aExtents, oFormat.iFill, null);
		return oDir;
	},

	nextSector: function (oPos) {
		var oFormat = this.oFormat;

		oPos.iSector += 1;
		if (oPos.iSector >= oFormat.iFirstSector + oFormat.iSpt) {
			oPos.iTrack += 1;
			oPos.iSector = oFormat.iFirstSector;
		}
	},

	readBlock: function (iBlock) {
		var iBlockSectors = 2,
			oPos = this.convertBlock2Sector(iBlock),
			sOut = "",
			i;

		for (i = 0; i < iBlockSectors; i += 1) {
			this.seekTrack(oPos.iTrack, oPos.iHead);
			sOut += this.readSector(oPos.iSector);
			this.nextSector(oPos);
		}
		return sOut;
	},

	readFile: function (aFileExtents) {
		var sOut = "",
			iRealLen = null,
			iRecPerBlock = 8,
			iAmsdosHeaderLength = 0x80,
			i, iBlock, oExtent, iRecords, aBlocks, sBlock, oHeader, iFileLen, iLastRecPos, iIndex;

		for (i = 0; i < aFileExtents.length; i += 1) {
			oExtent = aFileExtents[i];
			iRecords = oExtent.iRecords;
			aBlocks = oExtent.aBlocks;
			for (iBlock = 0; iBlock < aBlocks.length; iBlock += 1) {
				sBlock = this.readBlock(aBlocks[iBlock]);
				if (iRecords < iRecPerBlock) { // block with some remaining data
					sBlock = sBlock.substr(0, 0x80 * iRecords);
				}

				sOut += sBlock;
				iRecords -= iRecPerBlock;
				if (iRecords <= 0) {
					break;
				}
			}
		}

		oHeader = this.parseAmsdosHeader(sOut);
		if (oHeader) {
			iRealLen = oHeader.iLength + iAmsdosHeaderLength;
		}

		iFileLen = sOut.length;
		if (iRealLen === null) { // no real length: ASCII: find EOF (0x1a) in last record
			iLastRecPos = iFileLen > 0x80 ? (iFileLen - 0x80) : 0;
			iIndex = sOut.indexOf(String.fromCharCode(0x1a), iLastRecPos);
			if (iIndex >= 0) {
				iRealLen = iIndex;
				if (Utils.debug > 0) {
					Utils.console.debug("readFile: ASCII file length " + iFileLen + " truncated to " + iRealLen);
				}
			}
		}

		if (iRealLen !== null) { // now real length (from header or ASCII)?
			sOut = sOut.substr(0, iRealLen);
		}
		return sOut;
	},

	// ...

	// see AMSDOS ROM, &D252
	unOrProtectData: function (sData) {
		var sOut = "",
			/* eslint-disable array-element-newline */
			aTable1 = [0xe2, 0x9d, 0xdb, 0x1a, 0x42, 0x29, 0x39, 0xc6, 0xb3, 0xc6, 0x90, 0x45, 0x8a], // 13 bytes
			aTable2 = [0x49, 0xb1, 0x36, 0xf0, 0x2e, 0x1e, 0x06, 0x2a, 0x28, 0x19, 0xea], // 11 bytes
			/* eslint-enable array-element-newline */
			i, iByte;

		for (i = 0; i < sData.length; i += 1) {
			iByte = sData.charCodeAt(i);
			iByte ^= aTable1[(i & 0x7f) % aTable1.length] ^ aTable2[(i & 0x7f) % aTable2.length]; // eslint-disable-line no-bitwise
			sOut += String.fromCharCode(iByte);
		}
		return sOut;
	},

	// ...

	computeChecksum: function (sData) {
		var iSum = 0,
			i;

		for (i = 0; i < sData.length; i += 1) {
			iSum += sData.charCodeAt(i);
		}
		return iSum;
	},

	parseAmsdosHeader: function (sData) {
		var mTypeMap = {
				0: "T", // tokenized BASIC (T=not official)
				1: "P", // protected BASIC
				2: "B", // Binary
				8: "G", // GENA3 Assember (G=not official)
				0x16: "A" // ASCII
			},
			oHeader = null,
			iComputed, iSum;

		// http://www.benchmarko.de/cpcemu/cpcdoc/chapter/cpcdoc7_e.html#I_AMSDOS_HD
		// http://www.cpcwiki.eu/index.php/AMSDOS_Header
		if (sData.length >= 0x80) {
			iComputed = this.computeChecksum(sData.substr(0, 66));
			iSum = sData.charCodeAt(67) + sData.charCodeAt(68) * 256;
			if (iComputed === iSum) {
				oHeader = {
					iUser: sData.charCodeAt(0),
					sName: sData.substr(1, 8),
					sExt: sData.substr(9, 3),
					iType: sData.charCodeAt(18),
					iStart: sData.charCodeAt(21) + sData.charCodeAt(22) * 256,
					iPseudoLen: sData.charCodeAt(24) + sData.charCodeAt(25) * 256,
					iEntry: sData.charCodeAt(26) + sData.charCodeAt(27) * 256,
					iLength: sData.charCodeAt(64) + sData.charCodeAt(65) * 256 + sData.charCodeAt(66) * 65536
				};

				oHeader.sType = mTypeMap[oHeader.iType] || mTypeMap[16]; // default: ASCII
			}
		}
		return oHeader;
	}
};


if (typeof module !== "undefined" && module.exports) {
	module.exports = DiskImage;
}
