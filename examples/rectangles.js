/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Rectangles
110 rem Marco Vieth
115 defint a-z
120 c.m%=3:gosub 5060:'check mode
130 for m=0 to 3
140 if m<>3 or c.m%=3 then gosub 290
150 next
160 goto 130
280 '
290 'draw rectangle
300 MODE m
303 xd=2^(2-min(m,2)):yd=((m=3)+2)
305 cols=80/xd:rows=50/yd
306 window 12/80*cols,cols-12/80*cols+1,rows/4,rows-rows/4
310 ?"Mode: ";m
312 ?"Cols:";cols
314 ?"Rows:";rows
318 ?"Res.:";cols*8;"x";str$(rows*8)
319 ?
328 for i=0 to 48 step 2
330 graphics pen ((i + 1) / 2) mod 16
340 move 0+i,0+i
350 draw 639-i,0+i
360 draw 639-i,399-i
370 draw 0+i,399-i
380 draw 0+i,0+i
400 next i
410 ?"Press a key,":?"or wait..."
420 c.iv%=200:gosub 5040:'wait
440 return
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
