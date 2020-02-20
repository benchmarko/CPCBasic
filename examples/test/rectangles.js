/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Rectangles Test
110 REM Marco Vieth, 2019
113 clear:defint a-z
115 c.c=1:gosub 9010:'initCpcLib
120 c.c=4:gosub 9020:'checkMode
125 '
130 for m=0 to c.m%
140 gosub 290
145 ?"Press a key,":?"or wait..."
146 c.c=3:c.iv%=200:gosub 9020:'waitOrKey
150 next
160 goto 130
280 '
290 'draw rectangle
300 MODE m
303 xd=2^(2-min(m,2)):yd=((m=3)+2)
305 cols=80/xd:rows=50/yd
306 window 12/80*cols,cols-12/80*cols+1,rows/4,rows-rows/4
308 pens=4^(2-m mod 3)+abs(m=2)
310 ?"Mode: ";m
312 ?"Cols:";cols
314 ?"Rows:";rows
318 ?"Res.:";cols*8;"x";str$(rows*8)
320 ?"Pens:";pens
327 ?
328 for i=0 to 48 step 2
330 graphics pen ((i + 1) / 2) mod 16
340 move 0+i,0+i
350 draw 639-i,0+i
360 draw 639-i,399-i
370 draw 0+i,399-i
380 draw 0+i,0+i
400 next i
440 return
450 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
