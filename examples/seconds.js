/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 rem seconds test
110 cls:defint a-z
120 ?"Timing 1 (call &bd19):"
125 for cnt=1 to 5
130 t1!=time
140 for i=1 to 50:call &bd19:next
150 t1!=time-t1!
160 ?int(1000*t1!/300)/1000
170 next
190 '
200 ?"Timing 2 (check time):"
210 for cnt=1 to 5
220 t1!=time
230 c.iv%=50:c.t!=time+c.iv%*6:while time<c.t!:call &bd19:wend
240 t1!=time-t1!
250 ?int(1000*t1!/300)/1000
260 next
270 '
300 ?"Timing 3 (after):"
310 for cnt=1 to 5
315 flg=0:after 50 gosub 390
320 t1!=time
330 while flg=0:call &bd19:wend
340 t1!=time-t1!
350 ?int(1000*t1!/300)/1000
360 next
370 goto 120
380 '
390 flg=remain(0)+1:return
*/ });
