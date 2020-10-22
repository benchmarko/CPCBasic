/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem energysa - Energy Savers
2 rem (c) Marco Vieth, 1985
3 rem
400 REM ENERGIESPARER
500 MODE 1:LOCATE 5,10:PRINT"SCHWIERIGKEITSGRAD (VON 1-9):"
510 FOR ZA=1 TO 1000:S$=INKEY$:IF S$<>"" THEN 540
520 NEXT ZA
530 S$="2"
540 S=VAL(S$):IF S>9 OR S<1 THEN S=2
1004 MODE 1
1005 DIM ver(40,24)
1010 x=1:y=1
1020 INK 3,12,19
1030 FOR za=1 TO 120
1040 a=INT(40*RND(1)+1)
1050 b=INT(24*RND(1)+1)
1060 ver(a,b)=1
1070 LOCATE a,b:PRINT CHR$(252);
1080 NEXT za
1090 PEN 3
1100 LOCATE 40,1:PRINT CHR$(228);
1110 LOCATE 1,24:PRINT CHR$(230);
1120 LOCATE 40,24:PRINT CHR$(127);
1130 LOCATE 20,12::PRINT CHR$(229);
1140 VER(20,12)=200:VER(40,1)=200:VER(1,24)=200:VER(40,24)=200
1150 VER(40,2)=100:VER(2,24)=100:VER(39,24)=100
1160 PEN 1
1165 PU=5000
1170 LOCATE 5,25:PRINT"ENERGIE :           ";PU
1200 EVERY 70-(S*4),3 GOSUB 3000
1500 IF INKEY(0)=0 THEN y=y-1:GOSUB 1800 :GOTO 1500
1510 IF INKEY(1)=0 THEN x=x+1:GOSUB 2000 :GOTO 1510
1520 IF INKEY(2)=0 THEN y=y+1:GOSUB 1600 :GOTO 1520
1530 IF INKEY(8)=0 THEN x=x-1: GOSUB 2200 :GOTO 1530
1535 IF INKEY(9)=0 THEN GOSUB 4000
1540 GOTO 1500
1600 REM
1610 GOSUB 2400
1620 IF ver(x,y)=1 THEN y=y-1:SOUND 2,600,10:PU=PU-5
1625 IF y-1<1 OR ver(x,y-1)=1 THEN 1640
1630 LOCATE x,y-1:PRINT" ";
1640 LOCATE x,y:PRINT CHR$(241);
1650 RETURN
1800 REM
1810 GOSUB 2400
1820 IF ver(x,y)=1 THEN y=y+1:SOUND 2,400,10:PU=PU-5
1825 IF y+1>40 THEN 1840
1830 LOCATE x,y+1:PRINT" ";
1840 LOCATE x,y:PRINT CHR$(240);
1850 RETURN
1885 O=120
2000 REM
2010 GOSUB 2400
2020 IF ver(x,y)=1 THEN x=x-1:SOUND 2,500,10:PU=PU-5
2025 IF x-1<1 OR ver(x-1,y)=1 THEN 2040
2030 LOCATE x-1,y:PRINT" ";
2040 LOCATE x,y:PRINT CHR$(243);
2050 RETURN
2200 REM
2210 GOSUB 2400
2220 IF ver(x,y)=1 THEN x=x+1:SOUND 2,700,10:PU=PU-5
2225 IF x+1<1 THEN 2240
2230 LOCATE x+1,y:PRINT" ";
2240 LOCATE x,y:PRINT CHR$(242);
2250 RETURN
2400 REM
2410 IF y>=24 THEN y=24
2420 IF x>40 THEN x=40
2430 IF y<1 THEN y=1
2440 IF x<1 THEN x=1
2445 IF VER(X,Y)=200 THEN PU=PU*2:ZIEL=ZIEL+1:VER(X,Y)=0:GOSUB 4500
2446 IF ZIEL=4 THEN ZIEL=0:GOTO 4100
2450 SOUND 1,x*20,5,4
2460 SOUND 4,y*20,5,4
2470 RETURN
3000 ah=POS(#0):bh=VPOS(#0):FOR za=1 TO 6
3010 a=INT(40*RND(1)+1):b=INT(24*RND(1)+1)
3015 IF VER(A,B)=100 OR VER(A,B)=200 THEN 3010
3020 IF VER(A,B)=1 THEN 3010 ELSE VER(A,B)=1
3025 O=O+1:IF O=600 THEN MODE 0:PRINT"VERLOREN":STOP
3030 LOCATE a,b:PRINT CHR$(252);:NEXT ZA:LOCATE ah,bh
3040 RETURN
4000 IF X>2 THEN LOCATE X-1,Y:PRINT" ";:VER(X-1,Y)=0
4010 IF X<39 THEN LOCATE X+1,Y:PRINT" ";:VER(X+1,Y)=0
4020 IF Y>2 THEN LOCATE X,Y-1:PRINT" ";:VER(X,Y-1)=0
4030 IF Y<23 THEN LOCATE X,Y+1:PRINT" ";:VER(X,Y+1)=0
4040 PU=PU-100
4045 IF PU<0 THEN LOCATE 25,25:PRINT"ENERGIELOS":LOCATE 1,1:STOP
4050 LOCATE 25,25:PRINT PU;
4070 RETURN
4100 nichts=REMAIN(3)
4105 MODE 0:PEN 1:PAPER 0:INK 1,1,0:INK 0,12,19:BORDER 19,12
4110 LOCATE 5,12:PRINT"SIE HABEN GEWONNEN"
4115 LOCATE 3,15:PRINT"DENN SIE HABEN"
4116 LOCATE 3,20:PRINT PU;" PUNKTE"
4117 IF PU=80000 THEN SOUND 1,200,100,4:SOUND 2,100,100,4:SOUND 4,50,100,4
4120 WINDOW #1,5,5,24,24:INPUT #1,T$
4130 MODE 2:INK 1,24:INK 0,1:BORDER 0:STOP
4500 LOCATE 1,1:nichts=REMAIN(3)
4510 FOR B=200 TO 20 STEP -1
4520 SOUND 1,B,2,4
4530 SOUND 4,B-10,2,4
4540 BORDER 4,23
4550 NEXT B
4555 BORDER 1
4556 LOCATE 25,25:PRINT PU
4560 EVERY 70-(S*4),3 GOSUB 3000:RETURN
*/ });
