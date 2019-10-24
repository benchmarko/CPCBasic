/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Functional Spectrum (Funktions-Spektrum)
110 REM (extended by Marco Vieth)
112 defint a-o,q-z
114 m=0
116 xd=2^(2-min(m,2)):yd=((m=3)+2)
118 cols=80/xd:rows=50/yd
120 MODE m:INK 14,26:INK 15,20:PRINT "Functional Spectrum"
121 locate 1,24:?"(Use Cursor/Joystick on next screen)"
122 k=1:gosub 300
124 locate 1,3:INPUT"Number (1-16):";k
130 IF k<1 OR k>16 THEN 120
140 cls
150 gosub 400
200 PEN 1:CALL &BB18:IF UPPER$(INKEY$)<>"E" THEN RUN
210 END
220 '
300 origin 70,-60
304 for k=0 to 15
306 s0=((k) mod 4)*25*5:z0=(k\4)*20*3
310 FOR z=1 TO rows:FOR s=1 TO cols:x=s-cols\2:y=z-(rows\2+1)
320 ON k+1 GOSUB 500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650
330 plot s0+s*xd,367-(z0+z*yd),INT(p)-16*INT(p/16)
340 NEXT s,z
345 next k
350 return
390 '
400 qu=143:xoff=0:yoff=0
405 locate 1,1
410 FOR z=1 TO rows:FOR s=1 TO cols:x=s-cols\2+xoff:y=z-(rows\2+1)+yoff
420 ON k GOSUB 500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650
430 PEN INT(p)-16*INT(p/16)
440 PRINT CHR$(qu);
450 NEXT s,z
460 PEN 1
462 call &bd19:j=joy(0):t$=inkey$:if j=0 and t$="" then 462
463 if (j and 1) or t$=chr$(240) then yoff=yoff-1:goto 405
464 if (j and 2) or t$=chr$(241) then yoff=yoff+1:goto 405
465 if (j and 4) or t$=chr$(242) then xoff=xoff-1:goto 405
466 if (j and 8) or t$=chr$(243) then xoff=xoff+1:goto 405
467 'CALL &BB18:IF UPPER$(INKEY$)<>"E" THEN RUN
470 return
490 '
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
660 '
*/ });
