/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM Drawing Labyrinth
30 clear:defint a-z
40 c.c=1:gosub 9010:'initCpcLib
50 c.c=4:gosub 9020:'checkMode
60 def fnRoundSec$(x!)=str$(round(x!/300,3))
70 randomize time: '159253:'TEST
80 DIM t(5),sr(3),zr(3),p(4):zr(0)=-1:sr(1)=1:zr(2)=1:sr(3)=-1
90 FOR i=0 TO 3:p(i)=2^i:NEXT
100 ll=19:lb=12:'size: ll (1-63), lb (1-49)
110 rz=ll*lb:w=ll:ll=ll-1:lb=lb-1
120 '
140 mode 1
142 ?"Computing maze...";(ll+1);"x";(lb+1);"..."
145 dim m(rz)
150 t!=time
160 s=INT(RND*ll):z=INT(RND*lb):r=1
170 '
180 while r<rz
190 'locate 1,1:gosub 500:'status
200 q=0:adr=z*w+s
210 IF z>0 THEN IF m(adr-w)=0 THEN q=q+1:t(q)=0
220 IF s<ll THEN IF m(adr+1)=0 THEN q=q+1:t(q)=1
230 IF z<lb THEN IF m(adr+w)=0 THEN q=q+1:t(q)=2
240 IF s>0 THEN IF m(adr-1)=0 THEN q=q+1:t(q)=3
250 IF q=0 THEN 565
260 ri=t(INT(RND*q)+1):m(adr)=m(adr)+p(ri):s=s+sr(ri):z=z+zr(ri)
270 nr=ri-2:IF nr<0 THEN nr=nr+4
280 adr=z*w+s:m(adr)=m(adr)+p(nr)
290 r=r+1
295 'call &bd19
300 wend
310 m(0)=m(0)+1
320 t1!=time-t!
321 locate 1,2:?int(r*100/rz);"%"
322 ?"Done."
325 locate 1,25:paper 2:?fnRoundSec$(t1!);" sec";:paper 0
326 t!=time+100*6:while time<t! and inkey$="":wend
330 '
335 'output maze
340 for m0=0 to c.m%
345 m=(m+1) mod (c.m%+1)
350 gosub 400
360 'c.c=3:c.iv%=200:gosub 9020:'waitOrKey
370 next
375 erase m
380 goto 140
390 '
400 mode m
410 xd=2^(2-min(m,2)):yd=((m=3)+2)
420 if m=0 then 470:'textual maze not for mode 0
430 locate 1,1:t!=time:GOSUB 610
440 t2!=time-t!
450 t!=time+150*6:while time<t! and inkey$="":wend
460 '
470 window #2,1,15,1,10:cls#2
480 t!=time
490 gosub 780
500 t3!=time-t!: t!=time+50*6:while time<t! and inkey$="":wend
510 locate 1,25:paper 2:if m>0 then ?fnRoundSec$(t2!);"/";
520 ?fnRoundSec$(t3!);" sec";:paper 0
540 t!=time+150*6:while time<t! and inkey$="":wend
550 return
560 '
565 locate 1,2:?int(r*100/rz);"%"
570 z=z+1:IF z>lb THEN z=0:s=s+1:IF s>ll THEN s=0
580 IF m(z*w+s)=0 THEN 570 ELSE 180
590 '
600 'print textual maze
610 FOR z2=0 TO lb
620 a$="":adr=z2*w
630 FOR s2=adr TO adr+ll
640 IF m(s2) AND 1 THEN a$=a$+"# " ELSE a$=a$+"##"
650 NEXT
660 a$=a$+"#":?a$;:if pos(#0)>1 then ?
670 a$=""
680 FOR s2=adr TO adr+ll
690 IF m(s2) AND 8 THEN a$=a$+"  " ELSE a$=a$+"# "
700 NEXT s2
710 a$=a$+"#":?a$;:if pos(#0)>1 then ?
720 NEXT z2
730 a$="":FOR s2=0 TO ll-1:a$=a$+"##":NEXT s2
740 a$=a$+"# #":?a$;
750 return
760 '
770 'draw graphical maze
780 xb=2*xd:yb=3*yd
785 xh1=xb+xd:xh2=xh1*2:yh1=yb\yd
790 MOVE 0,399
800 FOR z2=0 TO lb
810 x1=1:adr=z2*w
820 FOR s2=adr TO adr+ll
830 IF m(s2) AND 1 THEN x2=0 ELSE x2=1
840 GOSUB 960
850 NEXT s2
860 x2=0:GOSUB 960:x2=0:MOVE 0,YPOS-yb
870 FOR s2=adr TO adr+ll
880 IF m(s2) AND 8 THEN x1=0 ELSE x1=1
890 GOSUB 960
900 NEXT s2
910 x1=1:GOSUB 960:MOVE 0,YPOS-yb:NEXT z2
920 x1=1:x2=1:FOR s2=0 TO ll-1:GOSUB 960:NEXT s2
930 x2=0:GOSUB 960:GOSUB 960
940 RETURN
950 '
960 FOR i=1 TO yh1
970 if x1>0 then mover xd,0:drawr xb,0,x1 else mover xh1,0
980 if x2>0 then mover xd,0:drawr xb,0,x2 else mover xh1,0
990 MOVER -xh2,-yd
1000 NEXT
1010 mover xh2,yb
1020 RETURN
1030 '
9000 'cpclib will be merged...
9010 chain merge "cpclib"
9020 return
*/ });
