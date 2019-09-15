/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Rectangles
110 for m=0 to 3
120 gosub 300
140 next
155 ?:?"(Mode 3 with 16 colors not available on CPC!)"
160 ?"Press a key to start again"
165 call &bb18
170 goto 110
280 '
290 'draw rectangle
300 MODE m
302 cols=80/2^(2-min(m,2))
304 window 12/80*cols, cols-12/80*cols,5,20
310 ?"Mode";m: ?"Columns:" cols:?
320 for i = 0 to 48 step 2
330 graphics pen ((i + 1) / 2) mod 16
340 move 0+i,0+i
350 draw 639-i,0+i
360 draw 639-i,399-i
370 draw 0+i,399-i
380 draw 0+i,0+i
390 frame
400 next
410 ?"Press a key":call &bb18:'wait for key
420 return
*/ });
