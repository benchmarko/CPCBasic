/* globals cpcBasic */

"use strict";

cpcBasic.addItem("",  String.raw`
10 REM Keys
50 every 50*2 gosub 200
100 cls
110 for i=0 to 79
120 x=inkey(i)
130 if x <> -1 then print "key";i, x
140 next
146 x=joy(0)
147 if x<>0 then print "joy 0",x
146 x=joy(1)
147 if x<>0 then print "joy 1",x
150 frame
160 goto 110
190 '
200 ?"."
210 return

`);
