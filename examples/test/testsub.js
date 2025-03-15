/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
REM testsub - Test Subroutines TS
REM only required line numbers; no GOTO
CLS
PRINT "start"
GOSUB 350
PRINT "end"
END
'
100 PRINT "sub100"
RETURN
'
200 PRINT "sub200"
  PRINT "inside sub200"
  GOSUB 100
RETURN
'
GOSUB 200
PRINT "in between"
'
300 PRINT "sub300"
  PRINT "inside sub300"
RETURN
'
350 'main
GOSUB 100
GOSUB 200
GOSUB 300
a=1
ON a GOSUB 200, 300
RETURN
'
*/ });
