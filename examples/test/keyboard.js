/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Keyboard Test
110 REM Marco Vieth, 2019
120 mode 2:defint a-z
130 dim keys(79),joys(1)
140 for i=0 to 79: keys(i)=-1:next
150 window #0,1,40,3,25:window #1,41,80,3,25:window #2,1,80,1,2
160 ?#2,"Keyboard Test: Press some keys..."
170 for i=0 to 79
180 x=inkey(i)
190 if x<>-1 or x<>keys(i) then print "key";i, x:keys(i)=x
200 next
210 for i=0 to 1
220 x=joy(i)
230 if x<>0 or x<>joys(i) then print "joy";i,x:joys(i)=x
240 next
250 t$=inkey$
260 if t$<>"" then print #1,"char=";chr$(1);t$;" ";asc(t$); " &";hex$(asc(t$),2)
270 call &bd19
280 goto 170
*/ });
