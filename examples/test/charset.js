/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Character set
105 rem Marco Vieth
106 defint a-z
107 c.c=1:gosub 9010:'initCpcLib
108 c.c=4:gosub 9020:'checkMode
109 '
110 for m=0 to c.m%
112 gosub 120
113 c.c=3:c.iv%=150:gosub 9020:'waitOrKey
114 next
116 goto 110
118 '
120 mode m
130 PRINT "Character set mode";str$(m):PRINT
200 FOR i=0 to 255
210 if i<32 then ch$=chr$(1)+chr$(i) else ch$=chr$(i)
220 PRINT ch$;
230 NEXT
250 return
260 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
