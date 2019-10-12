/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Functional Spectrum (Funktions-Spektrum)
110 MODE 1:PRINT TAB(10)"Funktions-Spektrum"
120 INPUT"Kennzahl (1-16):";k
130 IF k<1 OR k>16 THEN 120
140 MODE 0:INK 14,26:INK 15,20
150 qu=143
160 FOR z=1 TO 25:FOR s=1 TO 20:x=s-10:y=z-13
170 ON k+1 GOSUB 490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650
180 PEN INT(p)-16*INT(p/16)
190 PRINT CHR$(qu);:NEXT s,z
200 PEN 1:CALL &BB18:IF UPPER$(INKEY$)<>"E" THEN RUN
210 END
500 p=15*(EXP(x)+EXP(-x))/2+LOG(y+SQR(y*y+1)):RETURN
510 p=15*EXP(-(x*z+y*s)/200):RETURN
520 p=15*EXP(-(SIN(x)+COS(y))/150):RETURN
530 p=15*EXP(-(x*x+COS(y*2))/100):RETURN
540 p=15*EXP(-(COS(x*x+y*y))/150):RETURN
550 p=15*EXP(-(x*x+y*y)/150):RETURN
560 p=3*(ATN(x)+ATN(y)):RETURN
570 p=15*3*((x*x+y*y)>18)*ATN(x/2+y/2):RETURN
580 p=3*((x*x+y*y)>18)*ATN(x/2+y/2):RETURN
590 p=3*(x*x*x-y*y)*SIN((x+y)/20)/(x*x+y*y+0.300000000046566):RETURN
600 p=(SIN(x)-SIN(y))^3:RETURN
610 p=SIN(x-y)+SQR(ABS(x*y)):RETURN
620 p=7*(SIN(x/5)+COS(y)):RETURN
630 p=(COS(2*x)+1)*(COS(2*y)+1):RETURN
640 p=3*x^2+5*x+y:RETURN
650 p=15*SQR(ABS(y))*COS(x):RETURN
*/ });
