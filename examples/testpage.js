/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Test Page
110 REM Marco Vieth, 2019
115 'wait 0,0
120 'clear
130 mode 2:'comment
135 cls: cls#0: a=2: cls #(a*3)
140 for i=1 to 5:print i;: next i: print
150 a=1
160 print a;: a=a+1: if a < 5 then goto 160 else print
180 a=1: while a<=5: print a;: a=a+1: wend: print
185 'a=0: while a<5: a=a+1: if a=3 or 3=a then print "three" else print "not three:";a;: wend : ?"after wend": 'wend in else currently does not work
187 a=0: s$="": while a<5: s$=s$+str$(a)+":": a=a+1: b=0: while b<3: b=b+1: s$=s$+str$(b): wend: s$=s$+" ": wend: print s$
190 rem xx
200 a=4 or 7 and 2: print a:if a<>6 then print "error200": stop
300 'print
310 print 1 2 3: ' 123
320 print 1;2;3: ' 1  2  3
330 print 1,2,3: ' 1             2             3   [zone 13]
331 print -1 -2 -3: '-6
332 print -1;-2;-3: '-1 -2 -3
340 print "a" "b" "c": 'abc
350 print "a";"b";"c": 'abc
360 print "a","b","c": 'a        b           c   [zone 13]
990 rem
1000 'cls
1010 print "stairs"
1020 move 0,350:for n=1 to 8
1030 drawr 50,0
1040 drawr 0,-50
1050 next:move 348,0:fill 3
1190 '
1200 openin "testdat1"
1210 for i=33 to 255:input #9,t$
1220 t=asc(t$):?t$;: if t<>i then ?"Warning: ";i;"<>";t
1225 tag:move ((i-33) mod 80)*8, 90-((i-33)\80)*16:?t$;:tagoff
1230 next
1240 ?
1250 closein
9000 print "ok"
*/ });
