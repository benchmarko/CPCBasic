/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 ad=&4000:REM 2.Labyrinth
105 rem use e.g. 63, 49
110 MODE 1:DIM t%(5),sr(3),zr(3),p%(4):zr(0)=-1:sr(1)=1:zr(2)=1:sr(3)=-1
120 FOR i=0 TO 3:p%(i)=2^i:NEXT:INPUT "Laenge: ";ll:INPUT "Breite: ";lb
125 if ll=0 then ll=63
126 if lb=0 then lb=49
130 FOR i=ad TO ad+ll*lb:POKE i,0:NEXT
140 IF ll*lb>16 THEN PRINT"Bitte etwas Geduld!":PRINT"  Ich baue ..."
150 rz=ll*lb:a=ll:ll=ll-1:lb=lb-1:s=INT(RND*ll):z=INT(RND*lb):r=1
160 IF r=rz THEN POKE ad,PEEK(ad)+1:GOTO 500
170 q=0:adr=ad+z*a+s:IF z>0 THEN IF PEEK(adr-a)=0 THEN q=q+1:t%(q)=0
180 IF s<ll THEN IF PEEK(adr+1)=0 THEN q=q+1:t%(q)=1
190 IF z<lb THEN IF PEEK(adr+a)=0 THEN q=q+1:t%(q)=2
200 IF s>0 THEN IF PEEK(adr-1)=0 THEN q=q+1:t%(q)=3
210 IF q=0 THEN 250
220 ri=t%(INT(RND*q)+1):POKE adr,PEEK(adr)+p%(ri):s=s+sr(ri):z=z+zr(ri)
230 nr=ri-2:IF nr<0 THEN nr=nr+4
240 adr=ad+z*a+s:POKE adr,PEEK(adr)+p%(nr):r=r+1:GOTO 160
250 z=z+1:IF z>lb THEN z=0:s=s+1:IF s>ll THEN s=0
260 IF PEEK(ad+z*a+s)=0 THEN 250 ELSE 160
270 '
500 MODE 1:xb=5:yb=4:MOVE 0,399:FOR z=0 TO lb:x1=1:FOR s=0 TO ll
510 IF PEEK(ad+z*a+s) AND 1 THEN x2=0 ELSE x2=1
520 GOSUB 570:NEXT s:x2=0:GOSUB 570:x2=0:MOVE 0,YPOS-yb:FOR s=0 TO ll
530 IF PEEK(ad+z*a+s) AND 8 THEN x1=0 ELSE x1=1
540 GOSUB 570:NEXT s:x1=1:GOSUB 570:MOVE 0,YPOS-yb:NEXT z
550 x1=1:x2=1:FOR s=0 TO ll-1:GOSUB 570:NEXT s:x2=0:GOSUB 570:GOSUB 570
560 CALL &BB18
565 run
570 x=XPOS:y=YPOS:FOR i=1 TO yb/2:DRAWR xb,0,x1:DRAWR xb,0,x2:MOVER -xb-xb,-2
580 NEXT:MOVE x+xb+xb,y:RETURN
*/ });
