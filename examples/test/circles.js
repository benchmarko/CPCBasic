/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM Drawing circles
20 rem
30 clear
40 c.c=1:gosub 9010:'initCpcLib
50 c.c=4:gosub 9020:'checkMode
60 '
70 for m=0 to c.m%
80 gosub 130
90 c.c=3:c.iv%=200:gosub 9020:'waitOrKey
100 next
110 goto 70
120 '
130 mode m
140 ?"Mode";m
141 '
142 'Circles 1
150 deg
160 for r=100 to 200 step 10
170 'draw circles
180 FOR i=0 TO 359
190 px=sin(i)*r+320
200 py=cos(i)*r+200
210 PLOT px,py
220 NEXT i
230 next r
240 '
250 'Circle 2
310 rad
320 origin 320,200
335 for r=60 to 80 step 10
340 MOVE 0,r
350 FOR n=0 TO 2*PI STEP PI/16
360 '?n
370 draw SIN(n)*r,COS(n)*r
380 NEXT n
390 next r
430 '
440 return
450 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
