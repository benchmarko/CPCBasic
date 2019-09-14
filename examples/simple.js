/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
50 rem Simple Labyrinth
60 rem Idea from: https://scruss.com/blog/tag/amstrad/
100 mode 1
110 t=time+30
120 a$=""
130 while len(a$)<40
140 a$=a$+CHR$(199+2*RND)
150 wend
160 print a$;
170 if t>time then frame:goto 170
180 goto 110
*/ });
