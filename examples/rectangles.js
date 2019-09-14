/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 'rectangles
110 for m=2 to 0 step -1
120 gosub 300
130 if m > 0 then ?"Press a key":call &bb18:'wait for key
140 next
160 ?"Press a key to start again":call &bb18
170 goto 110
280 '
290 'draw rectangle
300 MODE m
310 ?"Mode";m
320 for i = 0 to 48 step 2
330 graphics pen ((i + 1) / 2) mod 16
340 move 0+i,0+i
350 draw 639-i,0+i
360 draw 639-i,399-i
370 draw 0+i,399-i
380 draw 0+i,0+i
390 frame
400 next
410 return
*/ });
