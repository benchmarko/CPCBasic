/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Test Page
110 REM Marco Vieth, 2019
115 'wait 0,0
120 'clear
125 '
130 mode 2:'comment
138 '
139 ?"PRINT in FOR loop"
140 for i=1 to 5:print i;:next i:print"#";
141 gosub 8700:if a$<>" 1  2  3  4  5 #" then error 33
143 ?:?"PRINT in GOTO loop"
150 a=1
160 print a;: a=a+1: if a <= 5 then goto 160 else print "#";
165 gosub 8700:if a$<>" 1  2  3  4  5 #" then error 33
167 ?:?"PRINT in WHILE loop"
180 a=1: while a<=5: print a;: a=a+1: wend: print "#";
182 gosub 8700:if a$<>" 1  2  3  4  5 #" then error 33
190 ?:?"PRINT concatenated string"
200 a=1: s$="": while a<=5: s$=s$+str$(a)+":": a=a+1: b=0: while b<3: b=b+1: s$=s$+str$(b): wend: s$=s$+" ": wend: s$=s$+"#":print s$;
210 gosub 8700:if a$<>" 1: 1 2 3  2: 1 2 3  3: 1 2 3  4: 1 2 3  5: 1 2 3 #" then error 33
230 '
235 ?:?"IF THEN ELSE: WEND in ELSE"
240 a=0: while a<5: a=a+1: if a=3 or 3=a then print "a=";a;"(three) "; else print "a<>3:";a;"(not three) ";: wend : ?"after WEND": 'WEND in ELSE
242 ?"#";
250 gosub 8700:if a$<>"a<>3: 1 (not three) a<>3: 2 (not three) a= 3 (three) #" then error 33
260 rem xx
270 a=4 or 7 and 2: print a:if a<>6 then print "error200": stop
280 '
285 gosub 9000
286 cls
292 ?"ABS"
293 a=abs(+67.98):if a<>67.98 then error 33
294 a=abs(-67.98):if a<>67.98 then error 33
297 '
300 'print
305 ?"PRINT numbers separated by space"
310 print 1 2 3;:?"#"; ' 123
312 gosub 8700:if a$<>" 1  2  3 #" then error 33
315 ?:?"PRINT numbers separated by ;"
320 print 1;2;3;:?"#";: ' 1  2  3
322 gosub 8700:if a$<>" 1  2  3 #" then error 33
325 ?:?"PRINT numbers separated by , (default ZONE 13)"
330 print 1,2,3;:?"#";: ' 1             2             3   [zone 13]
331 gosub 8700:if a$<>" 1            2            3 #" then error 33
332 ?
333 print -1 -2 -3: '-6
335 print -1;-2;-3: '-1 -2 -3
337 ?"PRINT strings separated by space"
340 print "a" "b" "c": 'abc
347 ?"PRINT strings separated by ;"
350 print "a";"b";"c": 'abc
357 ?"PRINT strings separated by ,"
360 print "a","b","c": 'a        b           c   [zone 13]
390 '
400 a=round(PI):if a<>3 then error 33
410 a=round(PI,0):if a<>3 then error 33
420 a=round(PI,0.4):if a<>3 then error 33
430 a=round(PI,2):if a<>3.14 then error 33
440 a=round(PI,2.4):if a<>3.14 then error 33
450 a=round(1234.5678,-2):if a<>1200 then error 33
490 '
500 restore 510: read s$,t$: if s$+t$<>"1" then error 33
510 data 1,
790 gosub 9000
800 '
805 cls: cls#0: a=2: cls #(a*3)
807 ?"OPENIN testdat with characters 33..255"
810 openin "testdat1"
820 for i=33 to 255:input #9,t$
830 t=asc(t$):?t$;: if t<>i then ?"Warning: ";i;"<>";t
840 tag:move ((i-33) mod 80)*8, 90-((i-33)\80)*16:?t$;:tagoff
850 next
860 ?
870 closein
980 '
990 gosub 9000
1000 mode 1:border 2
1010 print "stairs"
1020 move 0,350
1025 for n=1 to 8
1030 drawr 50,0
1040 drawr 0,-50
1050 next
1055 move 348,0
1060 fill 3
1190 '
8500 print "ok"
8510 end
8620 '
8630 'get characters from screen
8700 a$="":i=1:while i<80 and right$(a$,1)<>"#":locate i,vpos(#0):a$=a$+copychr$(#0):i=i+1:wend:return
8710 '
8990 'wait some time
9000 t!=time+6*50:while time<t!:call &bd19:wend:return
9010 '

*/ });
