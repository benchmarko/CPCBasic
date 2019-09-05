/* globals cpcBasic */

"use strict";

cpcBasic.addItem("",  String.raw`
100 REM Keys
110 mode 2
120 ?"Keyboard Test"
130 ?"Focus CPC Window and press some keys..."
140 every 50*2 gosub 800
150 for i=0 to 79
160 x=inkey(i)
170 if x <> -1 then print "key";i, x
180 next
190 x=joy(0)
200 if x<>0 then print "joy 0",x
210 x=joy(1)
220 if x<>0 then print "joy 1",x
230 t$=inkey$
240 if t$<>"" then print "char=";t$
250 frame
260 goto 150
270 '
800 ?"."
810 return
`);
