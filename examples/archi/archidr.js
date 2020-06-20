/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM archidr - Little Architect Draw (BASIC)
20 REM (c) Marco Vieth
30 REM BASIC only version, based on archidr2.bas (3/1991)
40 REM Examples: archi, archi2
50 '
60 CLEAR:DEFINT a-z
70 dt=5:'delay
80 buf=&4800:if himem>buf-1 then memory buf-1
90 m=3:on error goto 110:'detect mode 3
100 mode m:goto 120
110 m=2:resume 120
120 on error goto 0
130 mx=m:m=1
140 '
150 t$="archi1":gosub 520:'load a drawing set
160 '
170 MODE m
180 PRINT"ArchiDraw - Little ";: ?"Architect Drawing"
190 PRINT"(c) Marco Vieth"
200 PRINT
210 PRINT"Drawing set: ";d$
220 PRINT"Drawings:";dcnt
230 PRINT
240 PRINT"Menu"
250 PRINT
260 PRINT"1) Load drawing set"
270 PRINT"2) Show all drawings"
280 PRINT"3) Show drawing"
290 PRINT"4) Screen mode";m
300 PRINT"5) Animation";dt;"sec"
310 PRINT"6) Quit"
320 PRINT
330 PRINT"Please select: ";
340 r=0:if dt>=2 then after dt*50*2 gosub 440:'autostart
350 t$=INKEY$:IF t$="" and r=0 THEN 350
360 if r>0 then t$="2"
370 t=VAL(t$):IF t<1 OR t>6 THEN 350
380 r=remain(0):r=1
390 PRINT t$
400 ON t GOSUB 480,760,820,610,650,700
410 GOTO 170
420 '
430 REM After timeout => autostart
440 r=remain(0):r=1
450 return
460 '
470 REM load drawing set
480 PRINT
490 |DIR,"*.BIL"
500 PRINT"File name (without.BIL): ";
510 INPUT t$
520 IF t$="" THEN RETURN
530 LOAD t$+".BIL",buf
540 d$=t$
550 dcnt=peek(buf)
560 dpos=buf+1
570 didx=1
580 return
590 '
600 REM toogle screen mode
610 m=m+1:if m>mx then m=0
620 return
630 '
640 REM animation delay
650 ?:?"Animation delay:";
660 input dt
670 return
680 '
690 REM end
700 mode 2
710 ?"Bye"
720 stop
730 return
740 '
750 REM show all drawings
760 for didx=1 to dcnt
770 gosub 830
780 next
790 return
800 '
810 REM show single drawing
820 PRINT"Number (1 to";dcnt;"): ";:INPUT didx
830 gosub 880
840 gosub 980
850 return
860 '
870 REM select drawing
880 cnt=1
890 ad=buf+1: 'first pic
900 for i=1 to didx-1
910 len1=peek(ad)+peek(ad+1)*256
920 ad=ad+len1
930 next i
940 dpos=ad
950 return
960 '
970 REM draw
980 CLS
990 move 0,399
1000 ad=dpos
1010 len1=peek(ad)+peek(ad+1)*256
1020 end1=ad+len1
1030 ad=ad+2
1040 while ad<end1
1050 xl=peek(ad)
1060 xh=peek(ad+1)
1070 y=399-peek(ad+2)*2
1080 ad=ad+3
1090 art=xh\4
1100 xh=xh and 3
1110 x=xl+xh*256
1120 if art=0 then move x,y
1130 if art=1 then plot x,y
1140 if art=2 then draw x,y
1150 if art=3 then x0=xpos:y0=ypos:draw x,y:move x0,y0:'draw but keep pos
1160 if art=4 then x0=xpos:y0=ypos:draw x,y0:draw x,y:draw x0,y:draw x0,y0:move x,y:'rectangle
1170 if art=5 then x00=xpos:y00=ypos:gosub 1250:move x00,y00:'circle
1180 wend
1190 if dt<=0 then call &bb18:return
1200 t!=time+dt*6*50:while time<t! and inkey$="":wend
1210 return
1220 '
1230 REM draw circle
1240 rem https://de.wikipedia.org/wiki/Bresenham-Algorithmus
1250 radius=x
1260 x0=xpos:y0=ypos:'or use: origin 320,200
1270 f=1-radius
1280 ddFx=0
1290 ddFy=-2*radius
1300 x=0
1310 y=radius
1320 plot x0,y0+radius
1330 plot x0,y0-radius
1340 plot x0+radius,y0
1350 plot x0-radius,y0
1360 while x<y
1370 if f>=0 then y=y-1: ddFy=ddFy+2: f=f+ddFy
1380 x=x+1
1390 ddFx=ddFx+2
1400 f=f+ddFx+1
1410 plot x0+x,y0+y
1420 plot x0+y,y0+x
1430 plot x0+y,y0-x
1440 plot x0+x,y0-y
1450 plot x0-x,y0-y
1460 plot x0-y,y0-x
1470 plot x0-y,y0+x
1480 plot x0-x,y0+y
1490 wend
1500 return
1510 '
*/ });
