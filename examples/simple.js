/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
50 rem Simple Labyrinth
60 rem Idea from: https://scruss.com/blog/tag/amstrad/
70 m=0
80 f=0
100 mode m
102 after 50*8 gosub 300
105 cols=80/2^(2-min(m,2))
110 t=time+30
120 a$=""
130 while len(a$)<cols
140 a$=a$+CHR$(199+2*RND)
150 wend
160 print a$;
170 if t>time then call &bd19:goto 170
175 if f=50 or inkey$<>"" then 400
180 goto 110
190 '
300 r=remain(0):f=50:return
390 '
400 for i=1 to f:call &bd19:next
410 m=m+1:if m>3 then m=0
420 goto 80
*/ });
