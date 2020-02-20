/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Drawing Labyrinth
110 MODE 1
111 defint a-z
114 randomize time: 'randomize 159253:'TEST
115 DIM t(5),sr(3),zr(3),p(4):zr(0)=-1:sr(1)=1:zr(2)=1:sr(3)=-1
120 FOR i=0 TO 3:p(i)=2^i:NEXT
122 ll=19:lb=10:'size: ll (1-63), lb (1-49)
130 randomize t!: 'randomize 159253:'TEST
150 rz=ll*lb:a=ll:ll=ll-1:lb=lb-1
151 '
153 t!=time
154 dim m(rz)
156 s=INT(RND*ll):z=INT(RND*lb):r=1
158 '
160 while r<rz
165 'locate 1,1:gosub 500:'status
170 q=0:adr=z*a+s
175 IF z>0 THEN IF m(adr-a)=0 THEN q=q+1:t(q)=0
180 IF s<ll THEN IF m(adr+1)=0 THEN q=q+1:t(q)=1
190 IF z<lb THEN IF m(adr+a)=0 THEN q=q+1:t(q)=2
200 IF s>0 THEN IF m(adr-1)=0 THEN q=q+1:t(q)=3
210 IF q=0 THEN 258
220 ri=t(INT(RND*q)+1):m(adr)=m(adr)+p(ri):s=s+sr(ri):z=z+zr(ri)
230 nr=ri-2:IF nr<0 THEN nr=nr+4
240 adr=z*a+s:m(adr)=m(adr)+p(nr)
242 r=r+1
243 wend
244 m(0)=m(0)+1:locate 1,1:GOSUB 500
245 locate 1,25:?round((time-t!)/300,3);"sec  ";
246 t!=time+150*6:while time<t! and inkey$="":wend
247 gosub 710
248 t!=time+250*6:while time<t! and inkey$="":wend
252 'll=ll+1:lb=lb+1
254 erase m
255 goto 153
256 '
258 z=z+1:IF z>lb THEN z=0:s=s+1:IF s>ll THEN s=0
260 IF m(z*a+s)=0 THEN 258 ELSE 160
270 '
500 FOR z2=0 TO lb:x1=1
505 FOR s2=0 TO ll
510 IF m(z2*a+s2) AND 1 THEN x2=0 ELSE x2=1
520 GOSUB 570
521 NEXT s2
522 x2=0:GOSUB 570
525 FOR s2=0 TO ll
530 IF m(z2*a+s2) AND 8 THEN x1=0 ELSE x1=1
540 GOSUB 570
541 NEXT s2
542 x1=1:GOSUB 570
545 NEXT z2
550 x1=1:x2=1:FOR s2=0 TO ll-1:GOSUB 570:NEXT s2:x2=0:GOSUB 570:GOSUB 570
555 return
568 '
570 if x1=0 then ?" "; else ?"#";
572 if x2=0 then ?" "; else ?"#";
573 return
700 '
710 xb=5:yb=4:'5*3 4*4
715 MOVE 0,399:FOR z2=0 TO lb:x1=1:FOR s2=0 TO ll
720 IF m(z2*a+s2) AND 1 THEN x2=0 ELSE x2=1
730 GOSUB 850:NEXT s2:x2=0:GOSUB 850:x2=0:MOVE 0,YPOS-yb:FOR s2=0 TO ll
740 IF m(z2*a+s2) AND 8 THEN x1=0 ELSE x1=1
750 GOSUB 850:NEXT s2:x1=1:GOSUB 850:MOVE 0,YPOS-yb:NEXT z2
760 x1=1:x2=1:FOR s2=0 TO ll-1:GOSUB 850:NEXT s2:x2=0:GOSUB 850:GOSUB 850
770 RETURN
800 '
850 x=XPOS:y=YPOS:FOR i=1 TO yb/2:DRAWR xb,0,x1:DRAWR xb,0,x2:MOVER -xb-xb,-2
860 NEXT:MOVE x+xb+xb,y
870 RETURN
880 '
*/ });
