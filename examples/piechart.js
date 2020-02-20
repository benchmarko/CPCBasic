/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM Pie Chart (Kreisdiagramm)
20 rem ugly code, improved by MV
30 '
50 clear:deg
52 c.c=1:gosub 9010:'initCpcLib
53 c.c=4:gosub 9020:'checkMode
55 'PEN 1:PAPER 0
101 T$="J":'with description
102 g=8*20:'size 8
104 read w:'number of values
105 dim ws(w),w$(w)
106 u=0
107 for n=1 to w
108 read ws(n),w$(n)
109 u=u+ws(n)
110 next
120 goto 310
128 '
130 MODE 1
160 INPUT"WIEVIELE ZU VERGLEICHENDE WERTE (MAX 10) :";W
170 IF W<1 OR W >10 OR W<>INT(W) THEN CLS:GOTO 160
180 INPUT"WIE GROSS SOLL DAS KREISDIAGRAMM SEIN (1-10) :";G
190 IF G<1 OR G >10 OR G<>INT(G) THEN CLS:GOTO 180
195 g=g*20
230 INPUT "  MIT BESCHRIFTUNG (J/ODER N) : ";T$:
235 t$=upper$(t$):
237 IF T$<>"N" AND T$<>"J" THEN 230
242 '
245 DIM WS(W)
246 IF T$<>"N" then DIM W$(W)
250 FOR N=1 TO W
255 cls
260 INPUT"   PROZENTSATZ : ";WS(N)
270 U=U+WS(N)
280 IF T$<>"N" THEN INPUT"   BESCHRIFTUNG : ";W$(N)
300 NEXT N
305 '
310 IF U>100 OR U<90 THEN PRINT"FALSCHE EINGABE":STOP
312 '
313 for m=0 to c.m%
314 gosub 320
315 next
316 goto 313
319 '
320 MODE m
321 pens=4^(2-m mod 3)+abs(m=2)
322 ORIGIN 425,200
340 FARB=1:P1=1
345 '
350 FOR N=1 TO W
360 P2=P1+360*WS(N)/100
390 FOR A=P1 TO P2
410 move 0,0:x=G*COS(A):y=G*SIN(A)
425 IF FARB=0 THEN PLOT x,y,1 else draw x,y,FARB
440 NEXT A
442 P1=P2
447 IF T$<>"N" THEN TAG:PRINT right$(str$(N),1);:TAGOFF
448 FARB=(FARB+1) mod pens
460 NEXT N
475 '
580 IF T$="N" THEN 630
590 WINDOW #1,1,8,1,25
600 FOR N=1 TO W
610 PRINT #1,right$(str$(N),1);": ";W$(N):PRINT #1
612 'PRINT #1,right$(str$(N),1);":";W$(N);" ";right$(str$(WS(N)),2);"%";:PRINT #1
620 NEXT N
630 move 0,0:DRAW G*COS(1),G*SIN(1),0
640 c.c=3:c.iv%=250:gosub 9020:'waitOrKey
650 return
790 '
795 'example data
800 data 4
810 data 23,"A"
820 data 34,"B"
830 data 15,"C"
840 data 28,"D"
990 '
9000 'cpclib will be merged...
9010 chain merge "cpclib"
9020 return
*/ });
