/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM Character set
15 for m=0 to 3
16 mode m
20 PRINT "Character set mode";m:PRINT
30 FOR i=0 to 31
40 PRINT CHR$(1) CHR$(i);
50 NEXT
55 print
60 FOR i=32 TO 255
70 PRINT CHR$(i);
80 NEXT
90 PRINT
95 t=time+900
97 if inkey$="" and t>time then call &bd19:goto 97
100 next m
110 goto 15
*/ });
