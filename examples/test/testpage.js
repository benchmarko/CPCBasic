/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM Test Page
20 REM Marco Vieth, 2019
30 '
40 '
50 '|renum,100,100,10,9000:stop
60 '
100 '
110 mode 2:'comment
120 ?"numbers"
130 ?"hex number: &, &h"
140 a=&a7:if a<>167 then error 33
150 a=&hffff:if a<>65535 then error 33
160 ?"bin number: &x"
170 a=&x10100111:if a<>167 then error 33
180 a=&x1111111111111111:if a<>65535 then error 33
190 '
200 ?"expressions, operators +-*..."
210 a=+++++++++-9:if a<>-9 then error 33
220 '
230 ?"ABS(positive number)"
240 a=abs(+67.98):if a<>67.98 then error 33
250 ?"ABS(negative number)"
260 a=abs(-67.98):if a<>67.98 then error 33
270 ?"ABS(0)"
280 a=abs(0):if a<>0 then error 33
290 '
300 ?"@ (address of)": 'CPCBasic: just return internal variable index
310 clear
320 a=7:?@a;@a^2;@a+1*2
330 b=8:?@b;@a(0)
340 '
350 ?"AND (and OR)"
360 a=4 or 7 and 2:if a<>6 then error 33
370 '
380 ?"ASC"
390 a=asc("a"):if a<>97 then error 33
400 a=asc("ab"):if a<>97 then error 33
410 on error goto 420:a=asc(""):?"Error expected!":error 33: 'expect error 5
420 if err<>5 then ?"err=";err;"erl=";erl:error 33 else resume 430
430 on error goto 0
440 on error goto 450:a=asc(0):?"Error expected!":error 33: 'expect error 13
450 if err<>13 then ?"err=";err;"erl=";erl:error 33 else resume 460
460 on error goto 0
470 '
480 'cls#0: a=2: cls #(a*3)
490 '
500 ?"DATA with spaces between arguments"
510 b$="":restore 530
520 read a$:b$=b$+a$:if a$<>"-1" then goto 520
530 data ",", "abc"  , xy, -1
540 if b$<>",abcxy-1" then error 33
550 ?"DATA with special characters"
560 b$="":restore 570
570 DATA " ",!"#$%&'()*+,","
580 for i=1 to 3:read a$:b$=b$+a$:next
590 if b$<>" !"+chr$(34)+"#$%&'()*+," then error 33
600 '
610 ?"DEC$(number,format)"
620 a$=dec$(8.575,"##.##"):if a$<>" 8.58" then error 33
630 '
640 ?"ELSE"
650 a=1 else a=2
660 else a=3
670 if a<>1 then error 33
680 '
690 ?"FOR with integer constants"
700 a$="":for i=+4 to 0 step -2:a$=a$+str$(i):next:if a$<>" 4 2 0" then error 33
710 a=0:for i=++4 to 1 step ---2:a=a+i:next:if a<>6 then error 33 'avoid ++ and -- in js!
720 ?"FOR with floating point variable"
730 a=0:for i%=1.2 to 9.7 step 3.2:a=a+i%:next:if a<>22 then error 33: '1+4+7+10
740 gosub 9040:cls
750 '
760 ?"ON n GOSUB"
770 a=0:on 1 gosub 840,850:if a<>1 then error 33
780 a=0:on 2 gosub 840,850:if a<>2 then error 33
790 a=0:on 1.5 gosub 840,850:if a<>2 then error 33
800 a=1.5:on a gosub 840,850:if a<>2 then error 33
810 a=0:on 3 gosub 840,850:if a<>0 then error 33
820 a=0:on 0 gosub 840,850:if a<>0 then error 33
830 goto 860
840 a=1:return
850 a=2:return
860 ?"ON n GOTO"
870 a=1.7:on a-0.2 goto 890,900
880 goto 910
890 a=1:goto 910
900 a=2:goto 910
910 if a<>2 then error 33
920 gosub 9040:cls
930 '
940 ?"PRINT in FOR loop"
950 for i=1 to 5:print i;:next i:print"#";
960 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
970 ?"PRINT in GOTO loop"
980 a=1
990 print a;: a=a+1: if a <= 5 then goto 990 else print "#";
1000 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
1010 ?"PRINT in WHILE loop"
1020 a=1: while a<=5: print a;: a=a+1: wend: print "#";
1030 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
1040 ?"PRINT concatenated string"
1050 a=1: s$="": while a<=5: s$=s$+str$(a)+":": a=a+1: b=0: while b<3: b=b+1: s$=s$+str$(b): wend: s$=s$+" ": wend: s$=s$+"#":print s$;
1060 gosub 9010:if a$<>" 1: 1 2 3  2: 1 2 3  3: 1 2 3  4: 1 2 3  5: 1 2 3 #" then error 33
1070 '
1080 ?"IF THEN ELSE: WEND in ELSE"
1090 a=0: while a<5: a=a+1: if a=3 or 3=a then print "a=";a;"(three) "; else print "a<>3:";a;"(not three) ";: wend : ?"after WEND": 'WEND in ELSE
1100 ?"#";
1110 gosub 9010:if a$<>"a<>3: 1 (not three) a<>3: 2 (not three) a= 3 (three) #" then error 33
1120 '
1130 gosub 9040:cls
1140 ?"PRINT numbers separated by space"
1150 print 1 2 3;:?"#";
1160 gosub 9010:if a$<>" 1  2  3 #" then error 33: 'not ok! On real CPC one number: " 123 #"
1170 ?"PRINT numbers separated by ;"
1180 print 1;2;3;:?"#";
1190 gosub 9010:if a$<>" 1  2  3 #" then error 33
1200 ?"PRINT numbers separated by , (default ZONE 13)"
1210 print 1,2,3;:?"#";
1220 gosub 9010:if a$<>" 1            2            3 #" then error 33
1230 ?"PRINT numbers, computed"
1240 print -1 -2 -3;"#";
1250 gosub 9010:if a$<>"-6 #" then error 33
1260 print -1;-2;-3;"#";
1270 gosub 9010:if a$<>"-1 -2 -3 #" then error 33
1280 ?"PRINT strings separated by space"
1290 print "a" "b" "c": 'abc
1300 ?"PRINT strings separated by ;"
1310 print "a";"b";"c": 'abc
1320 ?"PRINT strings separated by ,"
1330 print "a","b","c": 'a        b           c   [zone 13]
1340 '
1350 ?"PRINT USING number format"
1360 print using "##.##";8.575;:?"#";
1370 gosub 9010:if a$<>" 8.58#" then error 33
1380 '
1390 gosub 9040:cls
1400 ?"ROUND"
1410 a=round(PI):if a<>3 then error 33
1420 a=round(PI,0):if a<>3 then error 33
1430 a=round(PI,0.4):if a<>3 then error 33
1440 a=round(PI,2):if a<>3.14 then error 33
1450 a=round(PI,2.4):if a<>3.14 then error 33
1460 a=round(1234.5678,-2):if a<>1200 then error 33
1470 a=round(8.575,2):if a<>8.58 then error 33
1480 '
1490 gosub 9040:cls
1500 ?"DATA and RESTORE"
1510 restore 1520: read s$,t$: if s$+t$<>"1" then error 33
1520 data 1,
1530 '
1540 ?"OPENIN and INPUT #9"
1550 ?"OPENIN testdat with characters 33..255"
1560 openin "testdat1"
1570 for i=33 to 255:input #9,t$
1580 t=asc(t$):?t$;: if t<>i then ?"Warning: ";i;"<>";t
1590 tag:move ((i-33) mod 80)*8, 90-((i-33)\80)*16:?t$;:tagoff
1600 next
1610 ?
1620 closein
1630 '
1640 gosub 9040
1650 mode 1:border 2
1660 print "stairs"
1670 move 0,350
1680 for n=1 to 8
1690 drawr 50,0
1700 drawr 0,-50
1710 next
1720 move 348,0
1730 fill 3
1740 '
1750 print "test finished: ok"
1760 end
1770 '
9000 'get characters from screen; print crlf
9010 a$="":i=1:while i<80 and right$(a$,1)<>"#":locate i,vpos(#0):a$=a$+copychr$(#0):i=i+1:wend:?:return
9020 '
9030 'wait some time or for key press
9040 t!=time+6*50:a$="":while time<t! and a$="":a$=inkey$:wend:return
9050 '
*/ });
