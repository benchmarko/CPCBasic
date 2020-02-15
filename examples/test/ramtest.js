/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem ramtest - RAM Test
2 rem mv
10 mode 2
30 ?"Standard RAM bank:":?hex$(&7fc0)
40 mem=64
50 ?"Additional RAM banks found:"
60 wrt=1:gosub 200
65 out &7fc0,&c0:poke &4000,&c0:poke &4001,&7f
70 wrt=0:gosub 200
80 ?:?"Total:";str$(mem);" KB RAM found"
90 goto 300
100 '
200 for hi=&78 to &7f
210 for lo=&c4 to &ff
220 if (lo and 4)=0 then 250
225 out hi*256+lo,lo
230 if wrt then poke &4000,lo:poke &4001,hi:goto 245
240 if peek(&4000)=lo and peek(&4001)=hi then mem=mem+16:?hex$(hi*256+lo);" ";
245 out hi*256+&c0,&c0
250 next lo,hi
270 return
280 '
300 IF INP(&FB7E)<>255 then WHILE (INP(&FB7E) AND &F0)<>&80:i=INP(&FB7F):WEND:' throw away FDC bytes
310 end
*/ });
