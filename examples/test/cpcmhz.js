/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 rem CPC MHz: Time measurement
110 rem Marco Vieth
120 mode 2:?"Measurement started.":call &bd19
130 clear:dim r%(5)
140 ms%=100:mxcpc%=90
150 for i%=0 to 4
160 c%=0:t1!=time
170 t!=time:if t!=t1! then c%=c%+1:goto 170
180 c%=0:t1!=t!+ms%
190 t!=time:if t!<t1! then c%=c%+1:goto 190
200 r%(i%)=c%
210 next
220 ?"In";ms%;"ms we can count to:";
230 mx%=0
240 for i%=0 to 4
250 ?str$(r%(i%));
270 mx%=max(mx%,r%(i%))
280 next
290 mhz!=mx%/mxcpc%*4
300 ?:?"=> max:";str$(mx%);", CPC";mhz!;"MHz"
310 goto 150
*/ });
