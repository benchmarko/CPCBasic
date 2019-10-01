/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Character set
110 for m=0 to 3
120 mode m
130 PRINT "Character set mode";str$(m):PRINT
140 gosub 200
150 t=time+900
160 if inkey$="" and t>time then call &bd19:goto 160
170 next m
180 goto 110
190 '
200 FOR i=0 to 255
210 if i<32 then ch$=chr$(1)+chr$(i) else ch$=chr$(i)
210 PRINT ch$;
220 NEXT
280 return
*/ });
