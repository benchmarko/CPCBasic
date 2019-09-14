/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Keyboard Test
110 mode 2
115 window #0,1,40,1,25:window #1,41,80,1,25
120 ?"Keyboard Test: Focus window and press some keys..."
140 'every 50*2 gosub 800
150 for i=0 to 79
160 x=inkey(i)
170 if x <> -1 then print "key";i, x
180 next
190 x=joy(0)
200 if x<>0 then print "joy 0",x
210 x=joy(1)
220 if x<>0 then print "joy 1",x
230 t$=inkey$
240 if t$<>"" then print #1,"char=";t$;" ";asc(t$)
250 frame
260 goto 150
270 '
800 '?"."
810 'return
*/ });
