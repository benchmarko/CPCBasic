/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Rectangles
110 for m=0 to 3
120 gosub 300
125 if m<3 then gosub 410 else gosub 415
140 next
170 goto 110
280 '
290 'draw rectangle
300 MODE m
302 cols=80/2^(2-min(m,2))
303 rows=50/((m=3)+2)
306 window 12/80*cols, cols-12/80*cols,rows/4,rows-rows/4
307 'paper 1:cls
310 ?"Mode: ";m
312 ?"Cols:";cols
314 ?"Rows:";rows
318 ?"Res.:";cols*8;" x";rows*8
328 for i = 0 to 48 step 2
330 graphics pen ((i + 1) / 2) mod 16
340 move 0+i,0+i
350 draw 639-i,0+i
360 draw 639-i,399-i
370 draw 0+i,399-i
380 draw 0+i,0+i
390 'call &bd19
400 next
405 return
410 ?"Press a key"
412 goto 420
414 '
415 ?"(Mode 3 not available on a real CPC!)"
416 ?"Press a key to start again"
420 t=time+900
430 if inkey$="" and t>time then call &bd19:goto 430
440 return
*/ });
