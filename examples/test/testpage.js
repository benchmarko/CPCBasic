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
120 '
130 ?"Numbers"
140 a=1:if a<>1 then error 33
150 a%=1:if a%<>1 then error 33
160 a=1.2:if a<>1.2 then error 33
170 a!=1.2:if a!<>1.2 then error 33
180 a!=-1.2:if a!<>-1.2 then error 33
190 a=1.2e3:if a<>1200 then error 33
200 a%=1.2e3:if a%<>1200 then error 33
210 a=-7.2:if a<>-7.2 then error 33
220 a%=-7.2:if a%<>-7 then error 33
230 a=+7.2:if a<>7.2 then error 33
240 ?"hex number: &, &h"
250 a=&a7:if a<>167 then error 33
260 a%=&a7:if a%<>167 then error 33
270 a%=-&a7:if a%<>-167 then error 33
280 a%=&h7fff:if a%<>32767 then error 33
290 ?"bin number: &x"
300 a=&x10100111:if a<>167 then error 33
310 a%=&x10100111:if a%<>167 then error 33
320 a%=&x0111111111111111:if a%<>32767 then error 33
330 a%=-&x0111111111111111:if a%<>-32767 then error 33
340 ?"Strings"
350 a$="a12":if a$<>"a12" then error 33
360 a$=+"7.1":if a$<>"7.1" then error 33
370 '
380 ?"Variable types"
390 a!=1.4:if a!<>1.4 then error 33
400 a!=1.5:if a!<>1.5 then error 33
410 a%=1.4:if a%<>1 then error 33
420 a%=1.5:if a%<>2 then error 33
430 a$="1.4":if a$<>"1.4" then error 33
432 insert.line=2:if insert.line<>2 then error 33
440 '
450 ?"Array Variables"
460 a!(2)=1.4:if a!(2)<>1.4 then error 33
470 a!(2)=1.5:if a!(2)<>1.5 then error 33
480 a%(2)=1.4:if a%(2)<>1 then error 33
490 a%(2)=1.5:if a%(2)<>2 then error 33
500 a$(2)="1.4":if a$(2)<>"1.4" then error 33
510 '
520 ?"expressions, operators +-*..."
530 a%=1+2+3:if a%<>6 then error 33
540 a%=3-2-1:if a%<>0 then error 33
550 a%=&a7+&x10100111-(123-27):if a%<>238 then error 33
560 a%=3+2*3-7:if a%<>2 then error 33
570 a%=(3+2)*(3-7):if a%<>-20 then error 33
580 a=20/2.5:if a<>8 then error 33
590 a=20\3:if a<>6 then error 33
600 a=3^2:if a<>9 then error 33
610 a=&x1001 and &x1110:if a<>&x1000 then error 33
620 a=&x1001 or &x0110:if a<>&x1111 then error 33
630 a=&x1001 xor &x1010:if a<>&x0011 then error 33
640 a=+++++++++---9:if a<>-9 then error 33
642 a=(1=0):if a<>0 then error 33
643 a=(1>0)*(0<1):if a<>1 then error 33
650 gosub 9040:cls
660 '
670 ?"ABS(positive number)"
680 a=abs(+67.98):if a<>67.98 then error 33
690 a!=abs(+67.98):if a!<>67.98 then error 33
700 ?"ABS(negative number)"
710 a=abs(-67.98):if a<>67.98 then error 33
720 ?"ABS(0)"
730 a=abs(0):if a<>0 then error 33
740 '
750 ?"@ (address of)": 'CPCBasic: just return internal variable index
760 clear
770 a=7:?@a;@a^2;@a+1*2
780 b=8:?@b;@a(0)
790 '
800 ?"AND (and OR)"
810 a=4 or 7 and 2:if a<>6 then error 33
820 a%=4 or 7 and 2:if a%<>6 then error 33
830 '
840 ?"ASC"
850 a=asc("a"):if a<>97 then error 33
860 a=asc("ab"):if a<>97 then error 33
870 on error goto 880:a=asc(""):?"Error expected!":error 33: 'expect error 5
880 if err<>5 then ?"err=";err;"erl=";erl:error 33 else resume 890
890 on error goto 0
900 on error goto 910:a=asc(0):?"Error expected!":error 33: 'expect error 13
910 if err<>13 then ?"err=";err;"erl=";erl:error 33 else resume 920
920 on error goto 0
930 '
940 'cls#0: a=2: cls #(a*3)
950 ?"COPYCHR$"
960 ?"Detect char 143 with matching pen"
970 ?chr$(143);"#";:paper 1:gosub 9010
980 paper 0:if a$<>chr$(143)+"#" then error 33
990 ?"Detect char 143 with matching paper as char 32"
1000 pen 0:paper 1:?chr$(143);"#";:pen 1:gosub 9010
1010 pen 1:paper 0:if a$<>" #" then error 33
1020 '
1030 ?"DATA with spaces between arguments"
1040 b$="":restore 1060
1050 read a$:b$=b$+a$:if a$<>"-1" then goto 1050
1060 data ",", "abc"  , xy, -1
1070 if b$<>",abcxy-1" then error 33
1080 ?"DATA with special characters"
1090 b$="":restore 1100
1100 DATA " ",!"#$%&'()*+,","
1110 for i=1 to 3:read a$:b$=b$+a$:next
1120 if b$<>" !"+chr$(34)+"#$%&'()*+," then error 33
1130 ?"DATA is interpeted depending on variable type"
1140 data 001.6,001.6, 001.6
1150 read a%,a!,a$
1160 if a%<>2 then error 33
1170 if a!<>1.6 then error 33
1180 if a$<>"001.6" then error 33
1190 data &a7, &ha7, &x10100111
1200 read a%:if a%<>&a7 then error 33
1210 read a%:if a%<>&a7 then error 33
1220 read a%:if a%<>&a7 then error 33
1230 '
1240 ?"DEC$(number,format)"
1250 a$=dec$(8.575,"##.##"):if a$<>" 8.58" then error 33
1260 a$=dec$(15.35,"#.##"):if a$<>"%15.35" then error 33
1270 '
1280 ?"DEF FN"
1290 def FNf1(x)=x*x
1300 a=FNf1(2.5):if a<>6.25 then error 33
1310 a=FN f1(2.5):if a<>6.25 then error 33
1320 def FN f1%(x)=x*x
1330 a%=FNf1%(2.5):if a%<>6 then error 33
1340 a%=FN f1%(2.5):if a%<>6 then error 33
1350 a=FNf1%(2.5):if a<>6 then error 33
1360 def FN f1!(x)=x*x
1370 a!=FNf1!(2.5):if a!<>6.25 then error 33
1380 a!=FN f1!(2.5):if a!<>6.25 then error 33
1390 a=FNf1!(2.5):if a<>6.25 then error 33
1400 def FN f1$(x$)=x$+x$
1410 a$=FNf1$("a"):if a$<>"aa" then error 33
1420 a$=FN f1$("a"):if a$<>"aa" then error 33
1430 def FNf2=2.5*2.5
1440 a=FNf2:if a<>6.25 then error 33
1450 def FN f2%=2.5*2.5
1460 a%=FN f2%:if a%<>6 then error 33
1470 '
1480 ?"ELSE"
1490 a=1 else a=2
1500 else a=3
1510 if a<>1 then error 33
1520 '
1530 ?"ERASE"
1540 dim a(4):for i=0 to 4:a(i)=i:next
1550 a=0:for i=0 to 4:a=a+a(i):next:if a<>10 then error 33
1560 erase a
1570 if a<>10 then error 33
1580 a=0:for i=0 to 4:a=a+a(i):next:if a<>0 then error 33
1590 gosub 9040:cls
1600 '
1610 ?"FOR with integer constants"
1620 a$="":for i=+4 to 0 step -2:a$=a$+str$(i):next:if a$<>" 4 2 0" then error 33
1630 a=0:for i=++4 to 1 step ---2:a=a+i:next:if a<>6 then error 33: 'avoid ++ and -- in js!
1640 ?"FOR with integer variable and floating point ranges"
1650 a=0:for i%=1.2 to 9.7 step 3.2:a=a+i%:next:if a<>22 then error 33: '1+4+7+10
1660 ?"FOR with condition expressions"
1670 a=3:for i=a<>3 to a>=3 step a=3:?i;:next:print "#";
1680 gosub 9010:if a$<>" 0 -1 #" then error 33
1690 ?"FOR up to 2*PI"
1700 a=13/8*PI:for i=1 to 3:a=a+1/8*PI:next:if a>2*PI then ?"limit exceeded by";a-2*PI;"(TODO)" else ?"ok"
1710 'gosub 9040:cls
1720 '
1730 ?"GOTO with leading zeros"
1740 goto 1750
1750 ?"ok"
1760 ?"INSTR"
1770 a=instr("Amstrad", "m"):if a<>2 then error 33
1780 a=instr("Amstrad", "sr"):if a<>0 then error 33
1790 '
1800 ?"ON n GOSUB"
1810 a=0:on 1 gosub 1880,1890:if a<>1 then error 33
1820 a=0:on 2 gosub 1880,1890:if a<>2 then error 33
1830 a=0:on 1.5 gosub 1880,1890:if a<>2 then error 33
1840 a=1.5:on a gosub 1880,1890:if a<>2 then error 33
1850 a=0:on 3 gosub 1880,1890:if a<>0 then error 33
1860 a=0:on 0 gosub 1880,1890:if a<>0 then error 33
1870 goto 1900
1880 a=1:return
1890 a=2:return
1900 ?"ON n GOTO"
1910 a=1.7:on a-0.2 goto 1930,1940
1920 goto 1950
1930 a=1:goto 1950
1940 a=2:goto 1950
1950 if a<>2 then error 33
1960 gosub 9040:cls
1970 '
1980 ?"PRINT in FOR loop"
1990 for i=1 to 5:print i;:next i:print"#";
2000 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2010 ?"PRINT in GOTO loop"
2020 a=1
2030 print a;: a=a+1: if a <= 5 then goto 2030 else print "#";
2040 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2050 ?"PRINT in WHILE loop"
2060 a=1: while a<=5: print a;: a=a+1: wend: print "#";
2070 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2080 ?"PRINT concatenated string"
2090 a=1: s$="": while a<=5: s$=s$+str$(a)+":": a=a+1: b=0: while b<3: b=b+1: s$=s$+str$(b): wend: s$=s$+" ": wend: s$=s$+"#":print s$;
2100 gosub 9010:if a$<>" 1: 1 2 3  2: 1 2 3  3: 1 2 3  4: 1 2 3  5: 1 2 3 #" then error 33
2110 '
2120 ?"IF THEN ELSE: WEND in ELSE"
2130 a=0: while a<5: a=a+1: if a=3 or 3=a then print "a=";a;"(three) "; else print "a<>3:";a;"(not three) ";: wend : ?"after WEND": 'WEND in ELSE
2140 ?"#";
2150 gosub 9010:if a$<>"a<>3: 1 (not three) a<>3: 2 (not three) a= 3 (three) #" then error 33
2160 '
2170 gosub 9040:cls
2180 ?"PRINT numbers separated by space"
2190 print 1 2 3;:?"#";
2200 gosub 9010: 'if a$<>" 1  2  3 #" then error 33: 'not ok! On real CPC one number: " 123 #"
2210 ?"PRINT numbers separated by ;"
2220 print 1;2;3;:?"#";
2230 gosub 9010:if a$<>" 1  2  3 #" then error 33
2240 ?"PRINT numbers separated by , (default ZONE 13)"
2250 print 1,2,3;:?"#";
2260 gosub 9010:if a$<>" 1            2            3 #" then error 33
2270 ?"PRINT numbers, computed"
2280 print -1 -2 -3;"#";
2290 gosub 9010:if a$<>"-6 #" then error 33
2300 print -1;-2;-3;"#";
2310 gosub 9010:if a$<>"-1 -2 -3 #" then error 33
2320 ?"PRINT strings separated by space"
2330 print "a" "b" "c": 'abc
2340 ?"PRINT strings separated by ;"
2350 print "a";"b";"c": 'abc
2360 ?"PRINT strings separated by ,"
2370 print "a","b","c": 'a        b           c   [zone 13]
2380 ?"PRINT number without separator"
2390 ?&x102;"#";
2400 gosub 9010:if a$<>" 2  2 #" then error 33
2410 gosub 9040:cls
2420 '
2430 ?"PRINT USING number format"
2440 print using "##.##";8.575;:?"#";
2450 gosub 9010:if a$<>" 8.58#" then error 33
2460 ?"PRINT USING number too long"
2470 print using "#.##";15.35;:?"#";
2480 gosub 9010:if a$<>"%15.35#" then error 33
2490 ?"PRINT USING string format"
2500 print using "\   \";"n1";"n2";" xx3";:?"#";
2510 gosub 9010:if a$<>"n1   n2    xx3 #" then error 33
2520 print using "!";"a1";"b2";:?"#";
2530 gosub 9010:if a$<>"ab#" then error 33
2540 print using "&";"a1";"b2";:?"#";
2550 gosub 9010:if a$<>"a1b2#" then error 33
2560 'gosub 9040:cls
2570 '
2580 ?"ROUND"
2590 a=round(PI):if a<>3 then error 33
2600 a=round(PI,0):if a<>3 then error 33
2610 a=round(PI,0.4):if a<>3 then error 33
2620 a=round(PI,2):if a<>3.14 then error 33
2630 a=round(PI,2.4):if a<>3.14 then error 33
2640 a=round(1234.5678,-2):if a<>1200 then error 33
2650 a=round(8.575,2):if a<>8.58 then error 33
2660 '
2670 gosub 9040:cls
2680 ?"DATA and RESTORE"
2690 restore 2700: read s$,t$: if s$+t$<>"1" then error 33
2700 data 1,
2710 '
2720 ?"OPENIN and INPUT #9"
2730 ?"OPENIN testdat with characters 33..255"
2740 openin "testdat1"
2750 for i=33 to 255:line input #9,t$
2760 t=asc(t$):?t$;: if t<>i then ?"Warning: ";i;"<>";t
2770 tag:move ((i-33) mod 80)*8, 90-((i-33)\80)*16:?t$;:tagoff
2780 next
2790 ?:closein:?
2800 '
2810 ?"SYMBOL AFTER"
2820 a=240:h=himem+(256-a)*8
2830 a=256:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h
2840 a=0:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h
2850 a=240:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h
2860 memory himem-1
2870 on error goto 2880:symbol after 241:?"Error expected!":error 33: 'expect error 5
2880 if err<>5 then ?"err=";err;"erl=";erl:error 33 else resume 2890
2890 on error goto 0
2900 memory himem+1
2910 ?"UNT"
2920 a=unt(32767):if a<>32767 then error 33
2930 a=unt(32768):if a<>-32768 then error 33
2940 a=unt(65535):if a<>-1 then error 33
2942 ?"VAL"
2943 a=val(""):if a<>0 then error 33
2944 a=val("4r"):if a<>4 then error 33
2945 a=val("&ff"):if a<>&ff then error 33
2950 '
2960 gosub 9040
2970 mode 1:border 2
2980 print "stairs"
2990 move 0,350
3000 for n=1 to 8
3010 drawr 50,0
3020 drawr 0,-50
3030 next
3040 move 348,0
3050 fill 3
3060 '
3070 print "test finished: ok"
3080 end
3090 '
9000 'get characters from screen; print crlf
9010 a$="":i=1:while i<80 and right$(a$,1)<>"#":locate i,vpos(#0):a$=a$+copychr$(#0):i=i+1:wend:?:return
9020 '
9030 'wait some time or for key press
9040 t!=time+6*50:a$="":while time<t! and a$="":a$=inkey$:wend:return
9050 '
*/ });
