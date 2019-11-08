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
121 locate 1,24:?"(Use Cursor/Joystick also next screen)"
122 k=1:gosub 222:gosub 300
124 locate 1,3
125 ?"Your choice ";
126 x=pos(#0):y=vpos(#0)
127 p=0:gosub 280:every 50*2 gosub 280
128 call &bd19:t$=inkey$:if t$="" then 128
129 if t$=chr$(13) or t$=" " then t=p else t=val(t$)
130 if t<1 or t>16 then 128
131 r=remain(0)
132 ?str$(t);
133 k=t
140 cls
150 gosub 400
200 PEN 1:goto 120
210 END
220 '
222 xoff=0:yoff=0
223 for k=1 to 16
224 origin ((k-1) mod 4)*25*5+70,-(((k-1)\4)*20*3+60)
226 move 0,368-yd:drawr (cols+1)*xd,0:drawr 0,-(rows+1)*yd:drawr -(cols+1)*xd,0:drawr 0,(rows+1)*yd
228 next k
229 return
232 '
279 '
280 p=(p+1) mod 17:if p=0 then p=1
285 locate x,y:?"[";p;"]: ";:return
299 '
300 xoff=0:yoff=0
304 for k=1 to 16
308 origin ((k-1) mod 4)*25*5+70,-(((k-1)\4)*20*3+60)
310 FOR z=1 TO rows
320 gosub 470
340 NEXT z
345 next k
350 return
390 '
400 qu=143:xoff=0:yoff=0
405 locate 1,1
410 FOR z=1 TO rows
420 gosub 480
450 NEXT z
460 PEN 1
462 call &bd19:j=joy(0):t$=inkey$:if j=0 and t$="" then 462
463 if (j and 1) or t$=chr$(240) then locate 1,1:PRINT CHR$(11);CHR$(11);:yoff=yoff-1:locate 1,1:z=1:gosub 480:goto 462
464 if (j and 2) or t$=chr$(241) then LOCATE 1,25:?:?:yoff=yoff+1:LOCATE 1,25:z=25:gosub 480:goto 462
465 if (j and 4) or t$=chr$(242) then xoff=xoff-1:goto 405
466 if (j and 8) or t$=chr$(243) then xoff=xoff+1:goto 405
468 return
469 '
470 FOR s=1 TO cols
471 x=s-cols\2+xoff:y=z-(rows\2+1)+yoff
472 gosub 490:plot s*xd,367-(z*yd),INT(p)-16*INT(p/16)
473 next
474 return
479 '
480 FOR s=1 TO cols
481 x=s-cols\2+xoff:y=z-(rows\2+1)+yoff
482 gosub 490:PEN INT(p)-16*INT(p/16):PRINT CHR$(qu);
486 next
488 return
489 '
490 ON k GOTO 500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650
492 stop
499 '
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
