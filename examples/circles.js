/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM Drawing circles
12 MODE 2
13 DEG
15 r=100
16 gosub 40
17 r=r+10
18 if r<=200 then 16
28 stop
30 'draw
40 n=0:x=1:y=2:radio=3:despx=4:despy=5
60 FOR i=0 TO 359
80 px=sin(i)*r+320
90 py=cos(i)*r+200
100 PLOT px,py
110 NEXT
120 return
*/ });
