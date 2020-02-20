/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM stars - Stars Test 1 and 2
12 rem Stars1: ...
13 rem Stars2: http://www.cpcwiki.eu/forum/programming/silly-programming-ideas-turning-text-into-graphics/75/
14 rem Stars2: all stars have the same speed
15 '
16 clear:defint a-z
17 c.c=1:gosub 9010:'initCpcLib
18 c.c=4:gosub 9020:'checkMode
20 DIM x(24),y(24),s(24)
22 DEF FNr1(n)=n*RND
23 RANDOMIZE TIME
25 INK 0,0:INK 1,26:BORDER 0
28 '
30 for m=0 to c.m%
33 gosub 40
34 next
35 goto 30
37 '
40 MODE m
41 pens=4^(2-m mod 3)+abs(m=2)
42 locate 1,1:pen 3:?"Mode";m:pen 1
43 after 100 gosub 800
44 move 0,0,1,1
45 FOR i=0 TO 24
50 x(i)=FNr1(640):y(i)=FNr1(400):s(i)=FNr1(8)+1
60 PLOT x(i),y(i)
70 NEXT
74 t!=time+300*5
77 while inkey$="" and time<t!
78 call &bd19
80 FOR i=0 TO 24
90 PLOT x(i),y(i)
100 y(i)=y(i)+s(i):IF y(i)>=400 THEN y(i)=0
110 PLOT x(i),y(i)
120 NEXT
130 wend
450 '
460 gosub 800
480 '
490 rem Stars2
510 'MODE 0:INK 0,0:INK 1,26:INK 2,13
525 t!=time+300*5
530 WHILE INKEY$="" and time<t!
540 PLOT (RND*638),398,(RND*(pens-2))+1
550  LOCATE 1,1:PRINT CHR$(11)
560 t2!=time+18:while time<t2!:CALL &BD19:wend
570 WEND
600 return
710 '
800 r=remain(0):LOCATE 1,1:?space$(7);:return
810 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
