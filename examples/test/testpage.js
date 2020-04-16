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
440 insert.line=2:if insert.line<>2 then error 33
450 '
460 ?"Array Variables"
470 a!(2)=1.4:if a!(2)<>1.4 then error 33
480 a!(2)=1.5:if a!(2)<>1.5 then error 33
490 a%(2)=1.4:if a%(2)<>1 then error 33
500 a%(2)=1.5:if a%(2)<>2 then error 33
510 a$(2)="1.4":if a$(2)<>"1.4" then error 33
520 '
530 ?"expressions, operators +-*..."
540 a%=1+2+3:if a%<>6 then error 33
550 a%=3-2-1:if a%<>0 then error 33
560 a%=&a7+&x10100111-(123-27):if a%<>238 then error 33
570 a%=3+2*3-7:if a%<>2 then error 33
580 a%=(3+2)*(3-7):if a%<>-20 then error 33
590 a=20/2.5:if a<>8 then error 33
600 a=20\3:if a<>6 then error 33
610 a=3^2:if a<>9 then error 33
620 a=&x1001 and &x1110:if a<>&x1000 then error 33
630 a=&x1001 or &x0110:if a<>&x1111 then error 33
640 a=&x1001 xor &x1010:if a<>&x0011 then error 33
650 a=+++++++++---9:if a<>-9 then error 33
660 a=(1=0):if a<>0 then error 33
670 a=(1>0)*(0<1):if a<>1 then error 33
680 gosub 9040:cls
690 '
700 ?"ABS(positive number)"
710 a=abs(+67.98):if a<>67.98 then error 33
720 a!=abs(+67.98):if a!<>67.98 then error 33
730 ?"ABS(negative number)"
740 a=abs(-67.98):if a<>67.98 then error 33
750 ?"ABS(0)"
760 a=abs(0):if a<>0 then error 33
770 '
780 ?"@ (address of)": 'CPCBasic: just return internal variable index
790 clear
800 a=7:?@a;@a^2;@a+1*2
810 b=8:?@b;@a(0)
820 '
830 ?"AND (and OR)"
840 a=4 or 7 and 2:if a<>6 then error 33
850 a%=4 or 7 and 2:if a%<>6 then error 33
860 '
870 ?"ASC"
880 a=asc("a"):if a<>97 then error 33
890 a=asc("ab"):if a<>97 then error 33
900 on error goto 910:a=asc(""):?"Error expected!":error 33: 'expect error 5
910 if err<>5 then ?"err=";err;"erl=";erl:error 33 else resume 920
920 on error goto 0
930 on error goto 940:a=asc(0):?"Error expected!":error 33: 'expect error 13
940 if err<>13 then ?"err=";err;"erl=";erl:error 33 else resume 950
950 on error goto 0
960 '
970 'cls#0: a=2: cls #(a*3)
980 ?"COPYCHR$"
990 ?"Detect char 143 with matching pen"
1000 ?chr$(143);"#";:paper 1
1010 gosub 9010:paper 0:if a$<>chr$(143)+"#" then ?"Check: Different on real CPC!":if a$<>" #" then error 33
1020 ?"Detect char 130 with matching paper as char 141"
1030 pen 0:paper 1:?chr$(130);"#";:pen 1
1040 gosub 9010:paper 0:if a$<>chr$(141)+"#" then ?"Check: Different on real CPC!":if a$<>chr$(130)+"#" then error 33
1050 ?"Detect char 143 with matching paper as char 32"
1060 pen 0:paper 1:?chr$(143);"#";:pen 1
1070 gosub 9010:paper 0:if a$<>" #" then error 33
1080 '
1090 ?"DATA with spaces between arguments"
1100 b$="":restore 1120
1110 read a$:b$=b$+a$:if a$<>"-1" then goto 1110
1120 data ",", "abc"  , xy, -1
1130 if b$<>",abcxy-1" then error 33
1140 ?"DATA with special characters"
1150 b$="":restore 1160
1160 DATA " ",!"#$%&'()*+,","
1170 for i=1 to 3:read a$:b$=b$+a$:next
1180 if b$<>" !"+chr$(34)+"#$%&'()*+," then error 33
1190 ?"DATA is interpeted depending on variable type"
1200 data 001.6,001.6, 001.6
1210 read a%,a!,a$
1220 if a%<>2 then error 33
1230 if a!<>1.6 then error 33
1240 if a$<>"001.6" then error 33
1250 data &a7, &ha7, &x10100111
1260 read a%:if a%<>&a7 then error 33
1270 read a%:if a%<>&a7 then error 33
1280 read a%:if a%<>&a7 then error 33
1290 '
1300 ?"DEC$(number,format)"
1310 a$=dec$(8.575,"##.##"):if a$<>" 8.58" then error 33
1320 a$=dec$(15.35,"#.##"):if a$<>"%15.35" then error 33
1330 '
1340 ?"DEF FN"
1350 def FNf1(x)=x*x
1360 a=FNf1(2.5):if a<>6.25 then error 33
1370 a=FN f1(2.5):if a<>6.25 then error 33
1380 def FN f1%(x)=x*x
1390 a%=FNf1%(2.5):if a%<>6 then error 33
1400 a%=FN f1%(2.5):if a%<>6 then error 33
1410 a=FNf1%(2.5):if a<>6 then error 33
1420 def FN f1!(x)=x*x
1430 a!=FNf1!(2.5):if a!<>6.25 then error 33
1440 a!=FN f1!(2.5):if a!<>6.25 then error 33
1450 a=FNf1!(2.5):if a<>6.25 then error 33
1460 def FN f1$(x$)=x$+x$
1470 a$=FNf1$("a"):if a$<>"aa" then error 33
1480 a$=FN f1$("a"):if a$<>"aa" then error 33
1490 def FNf2=2.5*2.5
1500 a=FNf2:if a<>6.25 then error 33
1510 def FN f2%=2.5*2.5
1520 a%=FN f2%:if a%<>6 then error 33
1530 '
1540 ?"ELSE"
1550 a=1 else a=2
1560 else a=3
1570 if a<>1 then error 33
1580 '
1590 ?"ERASE"
1600 erase a: 'a was used in previous tests
1610 dim a(4):for i=0 to 4:a(i)=i:next
1620 a=0:for i=0 to 4:a=a+a(i):next:if a<>10 then error 33
1630 erase a
1640 if a<>10 then error 33
1650 a=0:for i=0 to 4:a=a+a(i):next:if a<>0 then error 33
1660 gosub 9040:cls
1670 '
1680 ?"FOR with integer constants"
1690 a$="":for i=+4 to 0 step -2:a$=a$+str$(i):next:if a$<>" 4 2 0" then error 33
1700 a=0:for i=++4 to 1 step ---2:a=a+i:next:if a<>6 then error 33: 'avoid ++ and -- in js!
1710 ?"FOR with integer variable and floating point ranges"
1720 a=0:for i%=1.2 to 9.7 step 3.2:a=a+i%:next:if a<>22 then error 33: '1+4+7+10
1730 ?"FOR with condition expressions"
1740 a=3:for i=a<>3 to a>=3 step a=3:?i;:next:print "#";
1750 gosub 9010:if a$<>" 0 -1 #" then error 33
1760 ?"FOR up to 2*PI"
1770 a=13/8*PI:for i=1 to 3:a=a+1/8*PI:next:if a>2*PI then ?"limit exceeded by";a-2*PI;"(TODO)" else ?"ok"
1780 'gosub 9040:cls
1790 '
1800 ?"GOTO with leading zeros"
1810 goto 1820
1820 ?"ok"
1830 ?"INSTR"
1840 a=instr("Amstrad", "m"):if a<>2 then error 33
1850 a=instr("Amstrad", "sr"):if a<>0 then error 33
1860 '
1870 ?"ON n GOSUB"
1880 a=0:on 1 gosub 1950,1960:if a<>1 then error 33
1890 a=0:on 2 gosub 1950,1960:if a<>2 then error 33
1900 a=0:on 1.5 gosub 1950,1960:if a<>2 then error 33
1910 a=1.5:on a gosub 1950,1960:if a<>2 then error 33
1920 a=0:on 3 gosub 1950,1960:if a<>0 then error 33
1930 a=0:on 0 gosub 1950,1960:if a<>0 then error 33
1940 goto 1970
1950 a=1:return
1960 a=2:return
1970 ?"ON n GOTO"
1980 a=1.7:on a-0.2 goto 2000,2010
1990 goto 2020
2000 a=1:goto 2020
2010 a=2:goto 2020
2020 if a<>2 then error 33
2030 gosub 9040:cls
2040 '
2050 ?"PRINT in FOR loop"
2060 for i=1 to 5:print i;:next i:print"#";
2070 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2080 ?"PRINT in GOTO loop"
2090 a=1
2100 print a;: a=a+1: if a <= 5 then goto 2100 else print "#";
2110 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2120 ?"PRINT in WHILE loop"
2130 a=1: while a<=5: print a;: a=a+1: wend: print "#";
2140 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2150 ?"PRINT concatenated string"
2160 a=1: s$="": while a<=5: s$=s$+str$(a)+":": a=a+1: b=0: while b<3: b=b+1: s$=s$+str$(b): wend: s$=s$+" ": wend: s$=s$+"#":print s$;
2170 gosub 9010:if a$<>" 1: 1 2 3  2: 1 2 3  3: 1 2 3  4: 1 2 3  5: 1 2 3 #" then error 33
2180 '
2190 ?"IF THEN ELSE: WEND in ELSE"
2200 a=0: while a<5: a=a+1: if a=3 or 3=a then print "a=";a;"(three) "; else print "a<>3:";a;"(not three) ";: wend : ?"after WEND": 'WEND in ELSE
2210 ?"#";
2220 gosub 9010:if a$<>"a<>3: 1 (not three) a<>3: 2 (not three) a= 3 (three) #" then error 33
2230 '
2240 gosub 9040:cls
2250 ?"PRINT numbers separated by space"
2260 print 1 2 3;:?"#";
2270 gosub 9010: 'if a$<>" 1  2  3 #" then error 33: 'not ok! On real CPC one number: " 123 #"
2280 ?"PRINT numbers separated by ;"
2290 print 1;2;3;:?"#";
2300 gosub 9010:if a$<>" 1  2  3 #" then error 33
2310 ?"PRINT numbers separated by , (default ZONE 13)"
2320 print 1,2,3;:?"#";
2330 gosub 9010:if a$<>" 1            2            3 #" then error 33
2340 ?"PRINT numbers, computed"
2350 print -1 -2 -3;"#";
2360 gosub 9010:if a$<>"-6 #" then error 33
2370 print -1;-2;-3;"#";
2380 gosub 9010:if a$<>"-1 -2 -3 #" then error 33
2390 ?"PRINT strings separated by space"
2400 print "a" "b" "c" "#";
2410 gosub 9010:if a$<>"abc#" then error 33
2420 ?"PRINT strings separated by ;"
2430 print "a";"b";"c";"#";
2440 gosub 9010:if a$<>"abc#" then error 33
2450 ?"PRINT strings separated by ,"
2460 print "a","b","c";"#";: '[zone 13]
2470 gosub 9010:if a$<>"a            b            c#" then error 33
2480 zone 5
2490 print "a","b","c";"#";: '[zone 5]
2500 gosub 9010:if a$<>"a    b    c#" then error 33
2510 zone 13
2520 ?"PRINT strings separated by tab()"
2530 print "a"tab(2)"b"tab(3)"c"tab(4)"#";
2540 gosub 9010:if a$<>"abc#" then error 33
2550 print "a"tab(13)"b"tab(20)"c"tab(22)"#";
2560 gosub 9010:if a$<>"a           b      c #" then error 33
2570 print "a"tab(78)"bc#";
2580 if pos(#0)<>1 then error 33
2590 ?chr$(8);: 'back
2600 if pos(#0)<>80 then error 33
2610 gosub 9010:if a$<>"a                                                                            bc#" then error 33
2620 print "a"tab(79)"bc#";
2630 gosub 9010:if a$<>"bc#" then error 33
2640 ?"PRINT number without separator"
2650 ?&x102;"#";
2660 gosub 9010:if a$<>" 2  2 #" then error 33
2670 gosub 9040:cls
2680 '
2690 ?"PRINT USING number format"
2700 print using "##.##";8.575;:?"#";
2710 gosub 9010:if a$<>" 8.58#" then error 33
2720 ?"PRINT USING number too long"
2730 print using "#.##";15.35;:?"#";
2740 gosub 9010:if a$<>"%15.35#" then error 33
2750 ?"PRINT USING string format"
2760 print using "\   \";"n1";"n2";" xx3";:?"#";
2770 gosub 9010:if a$<>"n1   n2    xx3 #" then error 33
2780 print using "!";"a1";"b2";:?"#";
2790 gosub 9010:if a$<>"ab#" then error 33
2800 print using "&";"a1";"b2";:?"#";
2810 gosub 9010:if a$<>"a1b2#" then error 33
2820 'gosub 9040:cls
2830 '
2840 ?"ROUND"
2850 a=round(PI):if a<>3 then error 33
2860 a=round(PI,0):if a<>3 then error 33
2870 a=round(PI,0.4):if a<>3 then error 33
2880 a=round(PI,2):if a<>3.14 then error 33
2890 a=round(PI,2.4):if a<>3.14 then error 33
2900 a=round(1234.5678,-2):if a<>1200 then error 33
2910 a=round(8.575,2):if a<>8.58 then error 33
2920 '
2930 gosub 9040:cls
2940 ?"DATA and RESTORE"
2950 restore 2960: read s$,t$: if s$+t$<>"1" then error 33
2960 data 1,
2970 '
2980 ?"OPENIN and LINE INPUT #9"
2990 ?"OPENIN testdat with characters 33..255"
3000 openin "testdat1"
3010 for i=33 to 255:line input #9,t$
3020 t=asc(t$):?t$;: if t<>i then ?"error:";i;"<>";t:error 33
3030 tag:move ((i-33) mod 80)*8, 90-((i-33)\80)*16:?t$;:tagoff
3040 next
3050 ?
3060 closein
3070 ?
3080 '
3090 ?"OPENOUT, OPENIN and LINE INPUT #9"
3100 openout "testdat2"
3110 for i=33 to 255:t$=chr$(i):print #9,t$
3120 next
3130 closeout
3140 openin "testdat2"
3150 for i=33 to 255:line input #9,t$:?t$;
3160 t=asc(t$):if t<>i then ?"error:";i;"<>";t:error 33
3170 next
3180 closein
3190 ?:?
3200 '
3210 ?"Numbers in files"
3220 openout "testdat2"
3230 for i=0 to 10:?#9,i:next :'separate lines
3240 closeout
3250 openin "testdat2"
3260 for i=0 to 10:input #9,t
3270 if i<>t then ?"error:";i;"<>";t:error 33
3280 next
3290 closein
3300 openin "testdat2"
3310 for i=0 to 10:input #9,t$
3320 a$=str$(i)+" ":a$=right$(a$,len(a$)-1):if a$<>t$ then ?"error:";a$;"<>";t$:error 33
3330 next
3340 closein
3350 '
3360 openout "testdat2"
3370 for i=0 to 10:?#9,i;:next :'one line
3380 closeout
3390 openin "testdat2"
3400 for i=0 to 10:input #9,t
3410 if i<>t then ?"error:";i;"<>";t:error 33
3420 next
3430 closein
3440 openin "testdat2"
3450 input #9,t$
3460 if t$<>"0  1  2  3  4  5  6  7  8  9  10 " then ?"error:";:error 33
3470 closein
3480 ?
3490 '
3500 ?"Mixed style"
3510 openout "testdat2"
3520 for i=0 to 10:?#9,i;"&a1";&a2:next
3530 closeout
3540 openin "testdat2"
3550 for i=0 to 10:input #9,t,t2
3560 if i<>t then ?"error:";i;"<>";t:error 33
3570 if t2<>&a1 then ?"error:";t2;"<>";&a1:error 33
3580 input #9,t2
3590 if t2<>&a2 then ?"error:";t2;"<>";&a2:error 33
3600 next
3610 closein
3620 '
3630 |ERA,"testdat2"
3640 '
3650 gosub 9040:cls
3660 '
3670 ?"SYMBOL AFTER"
3680 a=240:h=himem+(256-a)*8
3690 a=256:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h:error 33
3700 a=0:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h:error 33
3710 a=240:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h:error 33
3720 memory himem-1
3730 on error goto 3740:symbol after 241:?"Error expected!":error 33: 'expect error 5
3740 if err<>5 then ?"err=";err;"erl=";erl:error 33 else resume 3750
3750 on error goto 0
3760 memory himem+1
3770 ?"UNT"
3780 a=unt(32767):if a<>32767 then error 33
3790 a=unt(32768):if a<>-32768 then error 33
3800 a=unt(65535):if a<>-1 then error 33
3810 ?"VAL"
3820 a=val(""):if a<>0 then error 33
3830 a=val("4r"):if a<>4 then error 33
3840 a=val("&ff"):if a<>&ff then error 33
3850 '
3860 gosub 9040
3870 mode 1:border 2
3880 print "stairs"
3890 move 0,350
3900 for n=1 to 8
3910 drawr 50,0
3920 drawr 0,-50
3930 next
3940 move 348,0
3950 fill 3
3960 '
3970 print "test finished: ok"
3980 end
3990 '
9000 'get characters from screen; print crlf
9010 a$="":i=1:while i<=80 and right$(a$,1)<>"#":locate i,vpos(#0):a$=a$+copychr$(#0):i=i+1:wend:?:return
9020 '
9030 'wait some time or for key press
9040 t!=time+6*50:a$="":while time<t! and a$="":a$=inkey$:wend:return
9050 '
*/ });
