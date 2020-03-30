/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM Test Page
20 REM Marco Vieth, 2019-2020
30 '
40 '
50 '|renum,100,100,10,9000:stop
60 '
100 '
110 mode 2:'comment
120 ?"Numbers"
130 ?"hex number: &, &h"
140 a=&a7:if a<>167 then error 33
150 a=&h7fff:if a<>32767 then error 33
160 ?"bin number: &x"
170 a=&x10100111:if a<>167 then error 33
180 a=&x0111111111111111:if a<>32767 then error 33
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
600 ?"DATA is interpeted depending on variable type"
610 data 001.6,001.6, 001.6
620 read a1%,a1!,a1$
630 if a1%<>2 then error 33
640 if a1!<>1.6 then error 33
650 if a1$<>"001.6" then error 33
660 data &a7, &ha7, &x10100111
670 read a1%:if a1%<>&a7 then error 33
680 read a1%:if a1%<>&a7 then error 33
690 read a1%:if a1%<>&a7 then error 33
700 '
710 ?"DEC$(number,format)"
720 a$=dec$(8.575,"##.##"):if a$<>" 8.58" then error 33
730 a$=dec$(15.35,"#.##"):if a$<>"%15.35" then error 33
740 '
750 ?"DEF FN"
760 def FNf1(x)=x*x
770 a1=FNf1(2.5):if a1<>6.25 then error 33
780 a1=FN f1(2.5):if a1<>6.25 then error 33
790 def FN f1%(x)=x*x
800 a1%=FNf1%(2.5):if a1%<>6 then error 33
810 a1%=FN f1%(2.5):if a1%<>6 then error 33
820 a1=FNf1%(2.5):if a1<>6 then error 33
830 def FN f1!(x)=x*x
840 a1!=FNf1!(2.5):if a1!<>6.25 then error 33
850 a1!=FN f1!(2.5):if a1!<>6.25 then error 33
860 a1=FNf1!(2.5):if a1<>6.25 then error 33
870 def FN f1$(x$)=x$+x$
880 a1$=FNf1$("a"):if a1$<>"aa" then error 33
890 a1$=FN f1$("a"):if a1$<>"aa" then error 33
900 def FNf2=2.5*2.5
910 a1=FNf2:if a1<>6.25 then error 33
920 def FN f2%=2.5*2.5
930 a1%=FN f2%:if a1%<>6 then error 33
940 '
950 ?"ELSE"
960 a=1 else a=2
970 else a=3
980 if a<>1 then error 33
990 '
1000 ?"FOR with integer constants"
1010 a$="":for i=+4 to 0 step -2:a$=a$+str$(i):next:if a$<>" 4 2 0" then error 33
1020 a=0:for i=++4 to 1 step ---2:a=a+i:next:if a<>6 then error 33: 'avoid ++ and -- in js!
1030 ?"FOR with integer variable and floating point ranges"
1040 a=0:for i%=1.2 to 9.7 step 3.2:a=a+i%:next:if a<>22 then error 33: '1+4+7+10
1050 ?"FOR with condition expressions"
1060 a=3:for i=a<>3 to a>=3 step a=3:?i;:next:print "#";
1070 gosub 9010:if a$<>" 0 -1 #" then error 33
1080 ?"FOR up to 2*PI"
1090 a=13/8*PI:for i=1 to 3:a=a+1/8*PI:next:if a>2*PI then ?"limit exceeded by";a-2*PI;"(TODO)" else ?"ok"
1100 gosub 9040:cls
1110 '
1120 ?"GOTO with leading zeros"
1130 goto 1140
1140 ?"ok"
1150 '
1160 ?"ON n GOSUB"
1170 a=0:on 1 gosub 1240,1250:if a<>1 then error 33
1180 a=0:on 2 gosub 1240,1250:if a<>2 then error 33
1190 a=0:on 1.5 gosub 1240,1250:if a<>2 then error 33
1200 a=1.5:on a gosub 1240,1250:if a<>2 then error 33
1210 a=0:on 3 gosub 1240,1250:if a<>0 then error 33
1220 a=0:on 0 gosub 1240,1250:if a<>0 then error 33
1230 goto 1260
1240 a=1:return
1250 a=2:return
1260 ?"ON n GOTO"
1270 a=1.7:on a-0.2 goto 1290,1300
1280 goto 1310
1290 a=1:goto 1310
1300 a=2:goto 1310
1310 if a<>2 then error 33
1320 gosub 9040:cls
1330 '
1340 ?"PRINT in FOR loop"
1350 for i=1 to 5:print i;:next i:print"#";
1360 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
1370 ?"PRINT in GOTO loop"
1380 a=1
1390 print a;: a=a+1: if a <= 5 then goto 1390 else print "#";
1400 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
1410 ?"PRINT in WHILE loop"
1420 a=1: while a<=5: print a;: a=a+1: wend: print "#";
1430 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
1440 ?"PRINT concatenated string"
1450 a=1: s$="": while a<=5: s$=s$+str$(a)+":": a=a+1: b=0: while b<3: b=b+1: s$=s$+str$(b): wend: s$=s$+" ": wend: s$=s$+"#":print s$;
1460 gosub 9010:if a$<>" 1: 1 2 3  2: 1 2 3  3: 1 2 3  4: 1 2 3  5: 1 2 3 #" then error 33
1470 '
1480 ?"IF THEN ELSE: WEND in ELSE"
1490 a=0: while a<5: a=a+1: if a=3 or 3=a then print "a=";a;"(three) "; else print "a<>3:";a;"(not three) ";: wend : ?"after WEND": 'WEND in ELSE
1500 ?"#";
1510 gosub 9010:if a$<>"a<>3: 1 (not three) a<>3: 2 (not three) a= 3 (three) #" then error 33
1520 '
1530 gosub 9040:cls
1540 ?"PRINT numbers separated by space"
1550 print 1 2 3;:?"#";
1560 gosub 9010: 'if a$<>" 1  2  3 #" then error 33: 'not ok! On real CPC one number: " 123 #"
1570 ?"PRINT numbers separated by ;"
1580 print 1;2;3;:?"#";
1590 gosub 9010:if a$<>" 1  2  3 #" then error 33
1600 ?"PRINT numbers separated by , (default ZONE 13)"
1610 print 1,2,3;:?"#";
1620 gosub 9010:if a$<>" 1            2            3 #" then error 33
1630 ?"PRINT numbers, computed"
1640 print -1 -2 -3;"#";
1650 gosub 9010:if a$<>"-6 #" then error 33
1660 print -1;-2;-3;"#";
1670 gosub 9010:if a$<>"-1 -2 -3 #" then error 33
1680 ?"PRINT strings separated by space"
1690 print "a" "b" "c": 'abc
1700 ?"PRINT strings separated by ;"
1710 print "a";"b";"c": 'abc
1720 ?"PRINT strings separated by ,"
1730 print "a","b","c": 'a        b           c   [zone 13]
1740 '
1750 ?"PRINT USING number format"
1760 print using "##.##";8.575;:?"#";
1770 gosub 9010:if a$<>" 8.58#" then error 33
1780 ?"PRINT USING number too long"
1790 print using "#.##";15.35;:?"#";
1800 gosub 9010:if a$<>"%15.35#" then error 33
1810 '
1820 gosub 9040:cls
1830 ?"ROUND"
1840 a=round(PI):if a<>3 then error 33
1850 a=round(PI,0):if a<>3 then error 33
1860 a=round(PI,0.4):if a<>3 then error 33
1870 a=round(PI,2):if a<>3.14 then error 33
1880 a=round(PI,2.4):if a<>3.14 then error 33
1890 a=round(1234.5678,-2):if a<>1200 then error 33
1900 a=round(8.575,2):if a<>8.58 then error 33
1910 '
1920 gosub 9040:cls
1930 ?"DATA and RESTORE"
1940 restore 1950: read s$,t$: if s$+t$<>"1" then error 33
1950 data 1,
1960 '
1970 ?"OPENIN and INPUT #9"
1980 ?"OPENIN testdat with characters 33..255"
1990 openin "testdat1"
2000 for i=33 to 255:input #9,t$
2010 t=asc(t$):?t$;: if t<>i then ?"Warning: ";i;"<>";t
2020 tag:move ((i-33) mod 80)*8, 90-((i-33)\80)*16:?t$;:tagoff
2030 next
2040 ?:closein:?
2050 '
2060 ?"SYMBOL AFTER"
2070 a=240:h=himem+(256-a)*8
2080 a=256:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h
2090 a=0:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h
2100 a=240:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h
2110 memory himem-1
2120 on error goto 2130:symbol after 241:?"Error expected!":error 33: 'expect error 5
2130 if err<>5 then ?"err=";err;"erl=";erl:error 33 else resume 2140
2140 on error goto 0
2150 memory himem+1
2160 '
2170 gosub 9040
2180 mode 1:border 2
2190 print "stairs"
2200 move 0,350
2210 for n=1 to 8
2220 drawr 50,0
2230 drawr 0,-50
2240 next
2250 move 348,0
2260 fill 3
2270 '
2280 print "test finished: ok"
2290 end
2300 '
9000 'get characters from screen; print crlf
9010 a$="":i=1:while i<80 and right$(a$,1)<>"#":locate i,vpos(#0):a$=a$+copychr$(#0):i=i+1:wend:?:return
9020 '
9030 'wait some time or for key press
9040 t!=time+6*50:a$="":while time<t! and a$="":a$=inkey$:wend:return
9050 '
*/ });
