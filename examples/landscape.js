/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Landscape (Landschaft)
110 CLEAR
120 GOSUB 200
130 GOSUB 300
135 RANDOMIZE TIME
140 GOSUB 400
150 GOSUB 900
160 GOSUB 500
165 GOSUB 1000
170 cont1=0
171 after 250 gosub 180
172 t$=inkey$:call &bd19:if t$="" and cont1=0 then 172
173 r=remain(0)
174 run
180 cont1=1:return
200 RANDOMIZE TIME:DEF FNr(n)=INT(RND(1)*n)+1
210 DIM x(64),y(64),x1(64),y1(64),w(64),w1(64)
220 MODE 1:INK 0,1:BORDER 1:INK 1,24:INK 2,18:INK 3,12:anz=3
225 PRINT CHR$(23)+CHR$(0);
230 RETURN
300 s1=0:z1=50+FNr(40):PLOT s1,z1,2
305 r=FNr(5)-3
310 FOR i=1 TO 7:s2=s1+5+FNr(5):IF s2>639 THEN s2=639
320 z2=z1+r+FNr(5)-3:IF z2>399 THEN z2=399 ELSE IF z2<0 THEN z2=0
330 DRAW s2,z2:IF s2=639 THEN RETURN
340 s1=s2:z1=z2:NEXT i:GOTO 305
400 s1=0:z1=180+FNr(60):PLOT s1,z1,3
410 dz=FNr(50)-25
415 s2=s1+10+FNr(60)
420 IF s2>639 THEN s2=639
430 IF z2+dz<100 THEN dz=ABS(dz) ELSE IF z2+dz>350 THEN dz=-dz
440 z2=z1+dz
450 DRAW s2,z2:IF s2=639 THEN RETURN
460 s1=s2:z1=z2:dz=-SGN(dz)*FNr(70)
470 GOTO 415
500 RAD:FOR ba=anz TO 1 STEP -1
505 la=FNr(10)+15*(5-ba):w(1)=PI/2:f=1:c=0:x=FNr(20)+14
510 c(ba)=x:x1=190*ba-45:y1=2+ba*10:x2=x1:y2=la
520 PLOT x1,y1,ba AND 3:DRAW x2,y2:x(1)=x2:y(1)=y2
530 FOR et=1 TO 6:c=f:f=0:FOR n=1 TO c
540 w=(FNr(45)+5)*PI/180:f=f+1:w=w(n)-w
550 x2=COS(w)*la+x(n):y2=SIN(w)*la+y(n)
560 MOVE x(n),y(n):DRAW x2,y2
570 w1(f)=w:x1(f)=x2:y1(f)=y2:w=(FNr(45)+5)*PI/180:f=f+1:w=w(n)+w
580 x2=COS(w)*la+x(n):y2=SIN(w)*la+y(n)
590 MOVE x(n),y(n):DRAW x2,y2:w1(f)=w:x1(f)=x2:y1(f)=y2:NEXT
600 FOR n=1 TO f:w(n)=w1(n):x(n)=x1(n):y(n)=y1(n):NEXT n
610 la=0.699999999953434*la:NEXT et,ba:RETURN
900 x1=FNr(30)+50:dz=FNr(35)+15:y1=0
910 st=60:WHILE x1<580:r=FNr(11)+5:f=RND*2+1
915 IF y1+dz>99 THEN dz=-dz ELSE IF y1+dz<r*2 THEN dz=ABS(dz)
919 y1=y1+dz:MOVE x1+r,y1:GOSUB 950:x1=x1+70+FNr(30)
920 dz=-SGN(dz)*FNr(20):WEND:RETURN
950 DEG:MOVE SIN(0)*r+x1,COS(0)*r+y1
951 FOR i=0 TO 360 STEP st
952 DRAW SIN(i)*r+x1+RND*st/4,COS(i)*r+y1,f
960 NEXT
970 RETURN
999 'noch etwas:
1000 x1=RND*540+50:y1=RND*70+280:r=RND*30+20:st=10:f=RND*3+1
1010 GOSUB 950:MOVE x1,y1:FILL f
1090 RETURN
*/ });
