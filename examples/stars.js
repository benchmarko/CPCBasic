/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM Stars1 and Stars2
15 defint a-z
20 DIM x(24),y(24),s(24)
22 DEF FNr1(n)=n*RND
23 RANDOMIZE TIME
25 INK 0,0:INK 1,26:BORDER 0
30 MODE 1
32 move 0,0,1,1
45 FOR i=0 TO 24
50 x(i)=FNr1(640):y(i)=FNr1(400):s(i)=FNr1(8)+1
60 PLOT x(i),y(i)
70 NEXT
77 while inkey$=""
78 call &bd19
80 FOR i=0 TO 24
90 PLOT x(i),y(i)
100 y(i)=y(i)+s(i):IF y(i)>=400 THEN y(i)=0
110 PLOT x(i),y(i)
120 NEXT
130 wend
490 rem Stars2
500 rem http://www.cpcwiki.eu/forum/programming/silly-programming-ideas-turning-text-into-graphics/75/
505 rem all stars have the same speed
510 'MODE 0:INK 0,0:INK 1,26:INK 2,13
520 'SPEED KEY 1,1
530 WHILE INKEY$=""
540 PLOT (RND*638),398,(RND*2)
550  LOCATE 1,1:PRINT CHR$(11)
560 t!=time+18:while time<t!:CALL &BD19:wend
570 WEND
580 'MODE 2:CALL &BC02
590 'SPEED KEY 30,2
600 run
*/ });
