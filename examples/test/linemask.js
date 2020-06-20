/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 rem linemask - Line Mask
20 rem
30 MODE 0:BORDER 4:INK 0,11:INK 1,18:INK 14,9:INK 15,15
40 DEFINT a-z
50 h=1:'1 for MASK or 2 for BASIC mask simulation
60 '
70 cls:t!=time
80 gosub 150
90 t!=time-t!
100 locate 1,25:?"h=";h;":";int(t!/300*1000);spc(3);
110 call &bb18
120 h=h+1:if h>3 then h=1
130 goto 70
140 '
150 c=1
160 y=398:d=640
170 k=&X10011001:x=0:GOSUB 270
180 FOR a=0 TO 1
190 k=&X10111101:x=0:y=y-2:GOSUB 270
200 NEXT a
210 y=y-2
220 k=&X10011001:x=0:GOSUB 270
230 y=y-4
240 IF y>0 THEN GOTO 170
250 return
260 '
270 c=(c MOD 15)+1
280 on h goto 300,330,450
290 '
300 MASK k:MOVE x,y:DRAW d,y,c
310 RETURN
320 '
330 l=0
340 WHILE l<d\32
350 p=1
360 while p<256
370 IF (k and p)=p then PLOT x,y,c
380 x=x+4
390 p=p*2
400 wend
410 l=l+1
420 WEND
430 RETURN
440 '
450 a$=bin$(k,8)
460 l=0
470 WHILE l<d\32
480   FOR p=1 TO LEN(a$)
490     IF MID$(a$,p,1)="1" THEN PLOT x,y,c
500     x=x+4
510   NEXT p
520   l=l+1
530 WEND
540 return
*/ });
