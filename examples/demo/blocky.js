/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM blocky - Blocky CPC Demo
20 REM Known from CPC CP/M Disk
25 rem TODO 6270 +0.0000000001
30 randomize time: '12:'TEST
35 RAD
40 c.c=1:gosub 9010:'initCpcLib
50 c.c=4:gosub 9020:'checkMode
100 for m=0 to c.m%
110 gosub 6060
120 'c.c=3:c.iv%=200:gosub 9020:'waitOrKey
130 next
140 goto 100
150 '
6060 MODE m
6070 FOR i=0 TO 13:INK i,i*2:NEXT
6080 FOR point=1 TO 4
6090 CLS
6100 FOR big=260 TO 70 STEP-10
6110 xo=INT(RND*640):yo=INT(RND*400):oi=i:i=INT(RND*13)+1
6112 'locate 1,24:?xo;yo;i
6113 ORIGIN xo,yo
6120 IF TEST(0,0)=i OR oi=i THEN 6110
6130 ON point GOSUB 6260,6330,6310,6500
6133 't!=time+6*300:WHILE TIME<t! and inkey$="":WEND
6135 MOVE 0,0
6136 FILL i
6138 t!=time+6*25:WHILE TIME<t! and inkey$="":WEND
6140 NEXT big
6150 'IF point<>4 THEN CALL mcentry,point+257
6160 NEXT point
6170 '
6180 t!=TIME+200:WHILE time<t! and inkey$="":WEND
6190 FOR s=4 TO 2 STEP-1
6192 FOR i=0 TO 13:INK i,0:NEXT:FRAME:'CALL mcentry,s
6194 FOR i=0 TO 13:INK i,i*2:NEXT
6200 't!=TIME+400:WHILE time<t! and inkey$="":WEND
6210 NEXT s
6220 t!=TIME+400:WHILE time<t! and inkey$="":WEND
6230 RETURN
6240 '
6260 MOVE 0,big\2,i
6270 FOR n=0 TO 2*PI  +  0.0000000001 STEP PI/8:DRAW SIN(n)*big\2,COS(n)*big\2:NEXT n
6300 RETURN
6310 MOVE big\2,big\2,i:DRAWR 0,-big:DRAWR-big,0:DRAWR 0,big:DRAWR big,0
6320 RETURN
6330 MOVE 0,big\3,i:DRAW big\2,-big\2:DRAW-big\2,-big\2:DRAW 0,big\3
6340 RETURN
6500 MOVE 0,big\2:ip=0
6510 FOR n=-4*PI TO 4*PI STEP PI/1.25
6520 px(ip)=SIN(n)*big\2:py(ip)=COS(n)*big\2
6530 DRAW px(ip),py(ip),i:IF py(ip)<0 THEN PLOTR-4*SGN(px(ip)),6:MOVE px(ip),py(ip)
6540 ip=ip+1
6550 NEXT
6560 FOR n=0 TO 4
6570 MOVE 0,0:DRAW px(n)\3,py(n)\3,-(i=0)
6580 MOVE 4,0:DRAW px(n)\3+4,py(n)\3,-(i=0)
6590 MOVE-4,0:DRAW px(n)\3-4,py(n)\3,-(i=0)
6600 NEXT:MOVE 0,0:GRAPHICS PEN i
6620 RETURN
6630 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
