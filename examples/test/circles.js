/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Drawing circles
105 rem
106 clear:DEG
110 c.c=1:gosub 9010:'initCpcLib
112 c.c=4:gosub 9020:'checkMode
113 '
114 for m=0 to c.m%
116 gosub 124
117 c.c=3:c.iv%=200:gosub 9020:'waitOrKey
118 next
119 goto 114
123 '
124 mode m
125 ?"Mode";m
130 for r=100 to 200 step 10
390 'draw circle
410 FOR i=0 TO 359
420 px=sin(i)*r+320
430 py=cos(i)*r+200
440 PLOT px,py
450 NEXT i
455 next r
460 return
470 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
