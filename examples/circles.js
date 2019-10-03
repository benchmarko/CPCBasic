/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Drawing circles
110 DEG
115 for m=0 to 3
120 mode m
125 ?"Mode";m
130 for r=100 to 200 step 10
140 gosub 410
150 next r
155 call &bb18
160 next m
170 goto 115
180 '
390 'draw
410 FOR i=0 TO 359
420 px=sin(i)*r+320
430 py=cos(i)*r+200
440 PLOT px,py
450 NEXT
460 return
*/ });
