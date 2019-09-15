/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 rem seconds test
50 cls
100 a1=time
120 for i=1 to 50:frame:next
125 a2=time-a1
126 ?int(1000*a2/300)/1000
130 goto 100
*/ });
