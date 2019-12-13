/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 rem scrtest - Screen Memory Test
20 rem Marco Vieth, 2019
30 rem
40 defint a-z
50 c.c=1:gosub 9010:'initCpcLib
60 border 5:ink 14,1:ink 15,16
70 check=0
80 for m=0 to 2
100 mode m
108 t!=time
110 a=&c000
115 if check=1 then 130
119 'without check
120 t!=time:for i=0 to &3fff:a2=a+i:poke a+i,i and 255:next:t!=time-t!
125 goto 420
128 '
129 'with check
130 t!=time:for i=0 to &3fff:a2=a+i:b=i and 255:poke a+i,b
135 if b<>peek(a+i) then ?"error:";hex$(a+i);b;"<>";peek(a+i):stop
150 next i:t!=time-t!
400 '
410 'result
420 c.c=3:c.iv%=50:gosub 9020:'waitOrKey
430 ?"Mode";m
440 ?"Draw time:";
442 if check=1 then ?:?"With check:";
445 ?round(t!/300*1000,2);"ms"
450 c.c=3:c.iv%=200:gosub 9020:'waitOrKey
460 next m
470 if check=1 then check=0 else check=1
480 goto 80
490 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
