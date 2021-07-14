/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem circlewr - Circle Writer
3 rem https://cpcrulez.fr/coding_src-list-graphic-circle_writer__ACU.htm
4 rem
5 ' Comment by notevenodd on 28 Dec 2020: CIRCLE WRITER... by "COMTEC", found in an old CPC Magazine
6 ' and (very slightly modified). Very slow on a real CPC, but
7 ' now ultra fast with *CPC Basic* on a modern computer.  ;-D
8 for m=0 to 3:gosub 9:next:goto 8
9 if m=0 then text$="CPC BASIC is AWESOME" else text$="CPC BASIC is SUPER AWESOME"
10 MODE m:xd=2^(2-min(m,2)):yd=((m=3)+2):rows=50/((m=3)+2):xd2=xd/2:yd2=yd/2
15 mo=16:INK 0,0:INK 1,26:INK 2,6:INK 3,24:BORDER 0:PAPER 0:PEN 1: 'TEXT$="CIRCLE WRITEr by COMTEC"
20 le=120:he=120:th=64:x=320:y=200:col=1
30 length=LEN(text$)+1:steps=360/length:sti=steps/mo:thi=th/mo
40 LOCATE 1,rows:PRINT TEXT$;
50 FOR nu=0 TO length-1
60 FOR i=0 TO mo-1:FOR o=0 TO mo-1
70 IF TEST(xd2*(nu*mo+i),o*yd2)<>0 THEN 90
80 NEXT o,i,nu:WHILE INKEY$<>"":WEND:CALL &BB18:return: 'END
90 de=-(nu*steps)-sti*i-180:th=thi*o:DEG
100 PLOT x+(le+th)*COS(de),y+(he+th)*SIN(de),col:GOTO 80
*/ });
