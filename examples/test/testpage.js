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
630 a$=dec$(15.35,"#.##"):if a$<>"%15.35" then error 33
640 '
650 ?"ELSE"
660 a=1 else a=2
670 else a=3
680 if a<>1 then error 33
690 '
700 ?"FOR with integer constants"
710 a$="":for i=+4 to 0 step -2:a$=a$+str$(i):next:if a$<>" 4 2 0" then error 33
720 a=0:for i=++4 to 1 step ---2:a=a+i:next:if a<>6 then error 33: 'avoid ++ and -- in js!
730 ?"FOR with integer variable and floating point ranges"
740 a=0:for i%=1.2 to 9.7 step 3.2:a=a+i%:next:if a<>22 then error 33: '1+4+7+10
750 ?"FOR with condition expressions"
760 a=3:for i=a<>3 to a>=3 step a=3:?i;:next:print "#";
770 gosub 9010:if a$<>" 0 -1 #" then error 33
780 ?"FOR up to 2*PI"
790 a=13/8*PI:for i=1 to 3:a=a+1/8*PI:next:if a>2*PI then ?"limit exceeded by";a-2*PI;"(TODO)" else ?"ok"
800 gosub 9040:cls
810 '
820 ?"GOTO with leading zeros"
830 goto 840
840 ?"ok"
850 '
860 ?"ON n GOSUB"
870 a=0:on 1 gosub 940,950:if a<>1 then error 33
880 a=0:on 2 gosub 940,950:if a<>2 then error 33
890 a=0:on 1.5 gosub 940,950:if a<>2 then error 33
900 a=1.5:on a gosub 940,950:if a<>2 then error 33
910 a=0:on 3 gosub 940,950:if a<>0 then error 33
920 a=0:on 0 gosub 940,950:if a<>0 then error 33
930 goto 960
940 a=1:return
950 a=2:return
960 ?"ON n GOTO"
970 a=1.7:on a-0.2 goto 990,1000
980 goto 1010
990 a=1:goto 1010
1000 a=2:goto 1010
1010 if a<>2 then error 33
1020 gosub 9040:cls
1030 '
1040 ?"PRINT in FOR loop"
1050 for i=1 to 5:print i;:next i:print"#";
1060 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
1070 ?"PRINT in GOTO loop"
1080 a=1
1090 print a;: a=a+1: if a <= 5 then goto 1090 else print "#";
1100 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
1110 ?"PRINT in WHILE loop"
1120 a=1: while a<=5: print a;: a=a+1: wend: print "#";
1130 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
1140 ?"PRINT concatenated string"
1150 a=1: s$="": while a<=5: s$=s$+str$(a)+":": a=a+1: b=0: while b<3: b=b+1: s$=s$+str$(b): wend: s$=s$+" ": wend: s$=s$+"#":print s$;
1160 gosub 9010:if a$<>" 1: 1 2 3  2: 1 2 3  3: 1 2 3  4: 1 2 3  5: 1 2 3 #" then error 33
1170 '
1180 ?"IF THEN ELSE: WEND in ELSE"
1190 a=0: while a<5: a=a+1: if a=3 or 3=a then print "a=";a;"(three) "; else print "a<>3:";a;"(not three) ";: wend : ?"after WEND": 'WEND in ELSE
1200 ?"#";
1210 gosub 9010:if a$<>"a<>3: 1 (not three) a<>3: 2 (not three) a= 3 (three) #" then error 33
1220 '
1230 gosub 9040:cls
1240 ?"PRINT numbers separated by space"
1250 print 1 2 3;:?"#";
1260 gosub 9010:if a$<>" 1  2  3 #" then error 33: 'not ok! On real CPC one number: " 123 #"
1270 ?"PRINT numbers separated by ;"
1280 print 1;2;3;:?"#";
1290 gosub 9010:if a$<>" 1  2  3 #" then error 33
1300 ?"PRINT numbers separated by , (default ZONE 13)"
1310 print 1,2,3;:?"#";
1320 gosub 9010:if a$<>" 1            2            3 #" then error 33
1330 ?"PRINT numbers, computed"
1340 print -1 -2 -3;"#";
1350 gosub 9010:if a$<>"-6 #" then error 33
1360 print -1;-2;-3;"#";
1370 gosub 9010:if a$<>"-1 -2 -3 #" then error 33
1380 ?"PRINT strings separated by space"
1390 print "a" "b" "c": 'abc
1400 ?"PRINT strings separated by ;"
1410 print "a";"b";"c": 'abc
1420 ?"PRINT strings separated by ,"
1430 print "a","b","c": 'a        b           c   [zone 13]
1440 '
1450 ?"PRINT USING number format"
1460 print using "##.##";8.575;:?"#";
1470 gosub 9010:if a$<>" 8.58#" then error 33
1480 ?"PRINT USING number too long"
1490 print using "#.##";15.35;:?"#";
1500 gosub 9010:if a$<>"%15.35#" then error 33
1510 '
1520 gosub 9040:cls
1530 ?"ROUND"
1540 a=round(PI):if a<>3 then error 33
1550 a=round(PI,0):if a<>3 then error 33
1560 a=round(PI,0.4):if a<>3 then error 33
1570 a=round(PI,2):if a<>3.14 then error 33
1580 a=round(PI,2.4):if a<>3.14 then error 33
1590 a=round(1234.5678,-2):if a<>1200 then error 33
1600 a=round(8.575,2):if a<>8.58 then error 33
1610 '
1620 gosub 9040:cls
1630 ?"DATA and RESTORE"
1640 restore 1650: read s$,t$: if s$+t$<>"1" then error 33
1650 data 1,
1660 '
1670 ?"OPENIN and INPUT #9"
1680 ?"OPENIN testdat with characters 33..255"
1690 openin "testdat1"
1700 for i=33 to 255:input #9,t$
1710 t=asc(t$):?t$;: if t<>i then ?"Warning: ";i;"<>";t
1720 tag:move ((i-33) mod 80)*8, 90-((i-33)\80)*16:?t$;:tagoff
1730 next
1740 ?:closein:?
1750 '
1760 ?"SYMBOL AFTER"
1770 a=240:h=himem+(256-a)*8
1780 a=256:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h
1790 a=0:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h
1800 a=240:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h
1810 memory himem-1
1820 on error goto 1830:symbol after 241:?"Error expected!":error 33: 'expect error 5
1830 if err<>5 then ?"err=";err;"erl=";erl:error 33 else resume 1840
1840 on error goto 0
1850 memory himem+1
1860 '
1870 gosub 9040
1880 mode 1:border 2
1890 print "stairs"
1900 move 0,350
1910 for n=1 to 8
1920 drawr 50,0
1930 drawr 0,-50
1940 next
1950 move 348,0
1960 fill 3
1970 '
1980 print "test finished: ok"
1990 end
2000 '
9000 'get characters from screen; print crlf
9010 a$="":i=1:while i<80 and right$(a$,1)<>"#":locate i,vpos(#0):a$=a$+copychr$(#0):i=i+1:wend:?:return
9020 '
9030 'wait some time or for key press
9040 t!=time+6*50:a$="":while time<t! and a$="":a$=inkey$:wend:return
9050 '
*/ });
