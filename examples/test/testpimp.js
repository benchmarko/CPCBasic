/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", {
	defaultImplementation: "extended",
	implementations: [
		{
			id: "extended",
			title: "Extended",
			source: function () { /*
REM testpimp - Test Program Implementations
REM Extended implementation
MODE 1
PRINT "testpimp: Extended"
*/ }
		},
		{
			id: "compact",
			title: "10-line",
			source: function () { /*
REM testpimp - Test Program Implementations
REM Compact implementation
MODE 1
PRINT "testpimp: Compact"
*/ }
		}
	]
});
