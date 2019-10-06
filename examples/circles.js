/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Drawing circles
110 DEG
112 c.m%=3:gosub 5060:'check mode
114 for m=0 to 3
116 if m<>3 or c.m%=3 then gosub 124
118 next
119 goto 114
123 '
124 mode m
125 ?"Mode";m
130 for r=100 to 200 step 10
140 gosub 410
150 next r
155 c.iv%=200:gosub 5040:'wait
170 return
180 '
390 'draw circle
410 FOR i=0 TO 359
420 px=sin(i)*r+320
430 py=cos(i)*r+200
440 PLOT px,py
450 NEXT
460 return
4990'
5000 'CPCBasic lib v0.1
5010 '1. wait c.iv 1/50 sec
5020 c.t!=time+c.iv%*6:while time<c.t!:call &bd19:wend:return
5030 '2. wait c.iv% 1/50 sec, or until keypress (return c.t$)
5040 c.t$="":c.t!=time+c.iv%*6:while time<c.t! and c.t$="":call &bd19:c.t$=inkey$:wend:return
5050 '3. set mode c.m% (return c.m%; if not avvailable, c.m%=-1)
5060 on error goto 5070:mode c.m%:on error goto 0:return
5070 if err=5 then c.m%=-1:resume next else error err
5080 '
*/ });
