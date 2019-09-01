/* globals cpcBasic */

"use strict";

cpcBasic.addItem("",  String.raw`
10 REM Stars
20 DIM x(24),y(24),s(24)
30 MODE 2:INK 0,0:INK 1,26:BORDER 0:PAPER 0:PEN 1:CLS
35 DEF FNrnd=RND*65536
40 RANDOMIZE TIME:FOR i=0 TO 24
50 x(i)=FNrnd MOD 640:y(i)=FNrnd MOD 400:s(i)=FNrnd MOD 8+1
60 PLOT x(i),y(i),1,1
70 NEXT
80 FOR i=0 TO 24
90 PLOT x(i),y(i)
100 y(i)=y(i)+s(i):IF y(i)>=400 THEN y(i)=0
110 PLOT x(i),y(i)
120 NEXT
125 frame
126 cls: 'test since xor does not work yet
130 GOTO 80
`);
