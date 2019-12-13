/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Drawing circles
105 rem
107 c.c=1:gosub 9010:'initCpcLib
110 DEG
112 c.c=4:c.m%=3:gosub 9020:'checkMode
114 for m=0 to 3
116 if m<>3 or c.m%=3 then gosub 124
118 next
119 goto 114
123 '
124 mode m
125 ?"Mode";m
130 for r=100 to 200 step 10
140 gosub 410
150 next r
155 c.c=3:c.iv%=200:gosub 9020:'waitOrKey
170 return
180 '
390 'draw circle
410 FOR i=0 TO 359
420 px=sin(i)*r+320
430 py=cos(i)*r+200
440 PLOT px,py
450 NEXT
460 return
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
