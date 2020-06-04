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
240 a=.2:if a<>0.2 then error 33
250 a=2.:if a<>2 then error 33
260 a=1.e+4:if a<>10000 then error 33
270 a=1e-4:if a<>0.0001 then error 33
280 ?"hex number: &, &h"
290 a=&a7:if a<>167 then error 33
300 a%=&a7:if a%<>167 then error 33
310 a%=-&a7:if a%<>-167 then error 33
320 a%=&h7fff:if a%<>32767 then error 33
330 ?"bin number: &x"
340 a=&x10100111:if a<>167 then error 33
350 a%=&x10100111:if a%<>167 then error 33
360 a%=&x0111111111111111:if a%<>32767 then error 33
370 a%=-&x0111111111111111:if a%<>-32767 then error 33
380 ?"Strings"
390 a$="a12":if a$<>"a12" then error 33
400 a$=+"7.1":if a$<>"7.1" then error 33
410 '
420 ?"Variable types"
430 a!=1.4:if a!<>1.4 then error 33
440 a!=1.5:if a!<>1.5 then error 33
450 a%=1.4:if a%<>1 then error 33
460 a%=1.5:if a%<>2 then error 33
470 a$="1.4":if a$<>"1.4" then error 33
480 insert.line=2:if insert.line<>2 then error 33
490 '
500 ?"Array Variables"
510 a!(2)=1.4:if a!(2)<>1.4 then error 33
520 a!(2)=1.5:if a!(2)<>1.5 then error 33
530 a%(2)=1.4:if a%(2)<>1 then error 33
540 a%(2)=1.5:if a%(2)<>2 then error 33
550 a$(2)="1.4":if a$(2)<>"1.4" then error 33
560 '
570 ?"expressions, operators +-*..."
580 a%=1+2+3:if a%<>6 then error 33
590 a%=3-2-1:if a%<>0 then error 33
600 a%=&a7+&x10100111-(123-27):if a%<>238 then error 33
610 a%=3+2*3-7:if a%<>2 then error 33
620 a%=(3+2)*(3-7):if a%<>-20 then error 33
630 a=20/2.5:if a<>8 then error 33
640 a=20\3:if a<>6 then error 33
650 a=3^2:if a<>9 then error 33
660 a=&x1001 and &x1110:if a<>&x1000 then error 33
670 a=&x1001 or &x0110:if a<>&x1111 then error 33
680 a=&x1001 xor &x1010:if a<>&x0011 then error 33
690 a=+++++++++---9:if a<>-9 then error 33
700 a=(1=0):if a<>0 then error 33
710 a=(1>0)*(0<1):if a<>1 then error 33
720 gosub 9040
730 '
740 ?"ABS(positive number)"
750 a=abs(+67.98):if a<>67.98 then error 33
760 a!=abs(+67.98):if a!<>67.98 then error 33
770 ?"ABS(negative number)"
780 a=abs(-67.98):if a<>67.98 then error 33
790 ?"ABS(0)"
800 a=abs(0):if a<>0 then error 33
810 '
820 ?"@ (address of)": 'CPCBasic: just return internal variable index
830 clear
840 a=7:?@a;@a^2;@a+1*2
850 b=8:?@b;@a(0)
860 '
870 ?"AND (and OR)"
880 a=4 or 7 and 2:if a<>6 then error 33
890 a%=4 or 7 and 2:if a%<>6 then error 33
900 '
910 ?"ASC"
920 a=asc("a"):if a<>97 then error 33
930 a=asc("ab"):if a<>97 then error 33
940 on error goto 950:a=asc(""):?"Error expected!":error 33: 'expect error 5
950 if err<>5 then ?"err=";err;"erl=";erl:error 33 else resume 960
960 on error goto 0
970 on error goto 980:a=asc(0):?"Error expected!":error 33: 'expect error 13
980 if err<>13 then ?"err=";err;"erl=";erl:error 33 else resume 990
990 on error goto 0
1000 '
1010 'cls#0: a=2: cls #(a*3)
1020 ?"COPYCHR$"
1030 ?"Detect char 143 with matching pen"
1040 ?chr$(143);"#";:paper 1
1050 gosub 9010:paper 0:if a$<>chr$(143)+"#" then ?"Check: Different on real CPC!":if a$<>" #" then error 33
1060 ?"Detect char 130 with matching paper as char 141"
1070 pen 0:paper 1:?chr$(130);"#";:pen 1
1080 gosub 9010:paper 0:if a$<>chr$(141)+"#" then ?"Check: Different on real CPC!":if a$<>chr$(130)+"#" then error 33
1090 ?"Detect char 143 with matching paper as char 32"
1100 pen 0:paper 1:?chr$(143);"#";:pen 1
1110 gosub 9010:paper 0:if a$<>" #" then error 33
1120 '
1130 ?"DATA with spaces between arguments"
1140 b$="":restore 1160
1150 read a$:b$=b$+a$:if a$<>"-1" then goto 1150
1160 data ",", "abc"  , xy, -1
1170 if b$<>",abcxy-1" then error 33
1180 ?"DATA with special characters"
1190 b$="":restore 1200
1200 DATA " ",!"#$%&'()*+,","
1210 for i=1 to 3:read a$:b$=b$+a$:next
1220 if b$<>" !"+chr$(34)+"#$%&'()*+," then error 33
1230 ?"DATA is interpeted depending on variable type"
1240 data 001.6,001.6, 001.6
1250 read a%,a!,a$
1260 if a%<>2 then error 33
1270 if a!<>1.6 then error 33
1280 if a$<>"001.6" then error 33
1290 data &a7, &ha7, &x10100111
1300 read a%:if a%<>&a7 then error 33
1310 read a%:if a%<>&a7 then error 33
1320 read a%:if a%<>&a7 then error 33
1330 '
1340 ?"DEC$(number,format)"
1350 a$=dec$(8.575,"##.##"):if a$<>" 8.58" then error 33
1360 a$=dec$(15.35,"#.##"):if a$<>"%15.35" then error 33
1370 '
1380 ?"DEF FN"
1390 def FNf1(x)=x*x
1400 a=FNf1(2.5):if a<>6.25 then error 33
1410 a=FN f1(2.5):if a<>6.25 then error 33
1420 def FN f1%(x)=x*x
1430 a%=FNf1%(2.5):if a%<>6 then error 33
1440 a%=FN f1%(2.5):if a%<>6 then error 33
1450 a=FNf1%(2.5):if a<>6 then error 33
1460 def FN f1!(x)=x*x
1470 a!=FNf1!(2.5):if a!<>6.25 then error 33
1480 a!=FN f1!(2.5):if a!<>6.25 then error 33
1490 a=FNf1!(2.5):if a<>6.25 then error 33
1500 def FN f1$(x$)=x$+x$
1510 a$=FNf1$("a"):if a$<>"aa" then error 33
1520 a$=FN f1$("a"):if a$<>"aa" then error 33
1530 def FNf2=2.5*2.5
1540 a=FNf2:if a<>6.25 then error 33
1550 def FN f2%=2.5*2.5
1560 a%=FN f2%:if a%<>6 then error 33
1570 '
1580 ?"ELSE"
1590 a=1 else a=2
1600 else a=3
1610 if a<>1 then error 33
1620 '
1630 ?"ERASE"
1640 erase a: 'a was used in previous tests
1650 dim a(4):for i=0 to 4:a(i)=i:next
1660 a=0:for i=0 to 4:a=a+a(i):next:if a<>10 then error 33
1670 erase a
1680 if a<>10 then error 33
1690 a=0:for i=0 to 4:a=a+a(i):next:if a<>0 then error 33
1700 gosub 9040
1710 '
1720 ?"FOR with integer constants"
1730 a$="":for i=+4 to 0 step -2:a$=a$+str$(i):next:if a$<>" 4 2 0" then error 33
1740 a=0:for i=++4 to 1 step ---2:a=a+i:next:if a<>6 then error 33: 'avoid ++ and -- in js!
1750 ?"FOR with integer variable and floating point ranges"
1760 a=0:for i%=1.2 to 9.7 step 3.2:a=a+i%:next:if a<>22 then error 33: '1+4+7+10
1770 ?"FOR with condition expressions"
1780 a=3:for i=a<>3 to a>=3 step a=3:?i;:next:print "#";
1790 gosub 9010:if a$<>" 0 -1 #" then error 33
1800 ?"FOR up to 2*PI"
1810 a=13/8*PI:for i=1 to 3:a=a+1/8*PI:next:if a>2*PI then ?"limit exceeded by";a-2*PI;"(TODO)" else ?"ok"
1820 'gosub 9040
1830 '
1840 ?"GOTO with leading zeros"
1850 goto 1860
1860 ?"ok"
1870 ?"INSTR"
1880 a=instr("Amstrad", "m"):if a<>2 then error 33
1890 a=instr("Amstrad", "sr"):if a<>0 then error 33
1900 '
1910 ?"ON n GOSUB"
1920 a=0:on 1 gosub 1990,2000:if a<>1 then error 33
1930 a=0:on 2 gosub 1990,2000:if a<>2 then error 33
1940 a=0:on 1.5 gosub 1990,2000:if a<>2 then error 33
1950 a=1.5:on a gosub 1990,2000:if a<>2 then error 33
1960 a=0:on 3 gosub 1990,2000:if a<>0 then error 33
1970 a=0:on 0 gosub 1990,2000:if a<>0 then error 33
1980 goto 2010
1990 a=1:return
2000 a=2:return
2010 ?"ON n GOTO"
2020 a=1.7:on a-0.2 goto 2040,2050
2030 goto 2060
2040 a=1:goto 2060
2050 a=2:goto 2060
2060 if a<>2 then error 33
2070 gosub 9040
2080 '
2090 ?"PRINT in FOR loop"
2100 for i=1 to 5:print i;:next i:print"#";
2110 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2120 ?"PRINT in GOTO loop"
2130 a=1
2140 print a;: a=a+1: if a <= 5 then goto 2140 else print "#";
2150 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2160 ?"PRINT in WHILE loop"
2170 a=1: while a<=5: print a;: a=a+1: wend: print "#";
2180 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2190 ?"PRINT concatenated string"
2200 a=1: s$="": while a<=5: s$=s$+str$(a)+":": a=a+1: b=0: while b<3: b=b+1: s$=s$+str$(b): wend: s$=s$+" ": wend: s$=s$+"#":print s$;
2210 gosub 9010:if a$<>" 1: 1 2 3  2: 1 2 3  3: 1 2 3  4: 1 2 3  5: 1 2 3 #" then error 33
2220 '
2230 ?"IF THEN ELSE: WEND in ELSE"
2240 a=0: while a<5: a=a+1: if a=3 or 3=a then print "a=";a;"(three) "; else print "a<>3:";a;"(not three) ";: wend : ?"after WEND": 'WEND in ELSE
2250 ?"#";
2260 gosub 9010:if a$<>"a<>3: 1 (not three) a<>3: 2 (not three) a= 3 (three) #" then error 33
2270 '
2280 gosub 9040
2290 ?"PRINT numbers separated by space"
2300 print 1 2 3;:?"#";
2310 gosub 9010: 'if a$<>" 1  2  3 #" then error 33: 'not ok! On real CPC one number: " 123 #"
2320 ?"PRINT numbers separated by ;"
2330 print 1;2;3;:?"#";
2340 gosub 9010:if a$<>" 1  2  3 #" then error 33
2350 ?"PRINT numbers separated by , (default ZONE 13)"
2360 print 1,2,3;:?"#";
2370 gosub 9010:if a$<>" 1            2            3 #" then error 33
2380 ?"PRINT numbers, computed"
2390 print -1 -2 -3;"#";
2400 gosub 9010:if a$<>"-6 #" then error 33
2410 print -1;-2;-3;"#";
2420 gosub 9010:if a$<>"-1 -2 -3 #" then error 33
2430 ?"PRINT strings separated by space"
2440 print "a" "b" "c" "#";
2450 gosub 9010:if a$<>"abc#" then error 33
2460 ?"PRINT strings separated by ;"
2470 print "a";"b";"c";"#";
2480 gosub 9010:if a$<>"abc#" then error 33
2490 ?"PRINT strings separated by ,"
2500 print "a","b","c";"#";: '[zone 13]
2510 gosub 9010:if a$<>"a            b            c#" then error 33
2520 zone 5
2530 print "a","b","c";"#";: '[zone 5]
2540 gosub 9010:if a$<>"a    b    c#" then error 33
2550 zone 13
2560 ?"PRINT strings separated by tab()"
2570 print "a"tab(2)"b"tab(3)"c"tab(4)"#";
2580 gosub 9010:if a$<>"abc#" then error 33
2590 print "a"tab(13)"b"tab(20)"c"tab(22)"#";
2600 gosub 9010:if a$<>"a           b      c #" then error 33
2610 print "a"tab(78)"bc#";
2620 if pos(#0)<>1 then error 33
2630 ?chr$(8);: 'back
2640 if pos(#0)<>80 then error 33
2650 gosub 9010:if a$<>"a                                                                            bc#" then error 33
2660 print "a"tab(79)"bc#";
2670 gosub 9010:if a$<>"bc#" then error 33
2680 ?"PRINT number without separator"
2690 ?&x102;"#";
2700 gosub 9010:if a$<>" 2  2 #" then error 33
2710 gosub 9040
2720 '
2730 ?"PRINT special exponential number expressions"
2740 print 1e++4;:?"#";
2750 gosub 9010:if a$<>" 1  4 #" then error 33
2760 print 1e+-4;:?"#";
2770 gosub 9010:if a$<>" 1 -4 #" then error 33
2780 print 5e4.5;:?"#";
2790 gosub 9010:if a$<>" 50000  0.5 #" then error 33
2791 print 1exp(0);:?"#";
2792 gosub 9010:if a$<>" 1  1 #" then error 33
2800 '
2810 ?"PRINT USING number format"
2820 print using "##.##";8.575;:?"#";
2830 gosub 9010:if a$<>" 8.58#" then error 33
2840 ?"PRINT USING number too long"
2850 print using "#.##";15.35;:?"#";
2860 gosub 9010:if a$<>"%15.35#" then error 33
2870 ?"PRINT USING string format"
2880 print using "\   \";"n1";"n2";" xx3";:?"#";
2890 gosub 9010:if a$<>"n1   n2    xx3 #" then error 33
2900 print using "!";"a1";"b2";:?"#";
2910 gosub 9010:if a$<>"ab#" then error 33
2920 print using "&";"a1";"b2";:?"#";
2930 gosub 9010:if a$<>"a1b2#" then error 33
2940 'gosub 9040
2950 '
2960 ?"ROUND"
2970 a=round(PI):if a<>3 then error 33
2980 a=round(PI,0):if a<>3 then error 33
2990 a=round(PI,0.4):if a<>3 then error 33
3000 a=round(PI,2):if a<>3.14 then error 33
3010 a=round(PI,2.4):if a<>3.14 then error 33
3020 a=round(1234.5678,-2):if a<>1200 then error 33
3030 a=round(8.575,2):if a<>8.58 then error 33
3040 '
3050 gosub 9040
3060 ?"DATA and RESTORE"
3070 restore 3080: read s$,t$: if s$+t$<>"1" then error 33
3080 data 1,
3090 '
3100 ?"OPENIN and LINE INPUT #9"
3110 ?"OPENIN testdat with characters 33..255"
3120 openin "testdat1"
3130 for i=33 to 255:line input #9,t$
3140 t=asc(t$):?t$;: if t<>i then ?"error:";i;"<>";t:error 33
3150 tag:move ((i-33) mod 80)*8, 90-((i-33)\80)*16:?t$;:tagoff
3160 next
3170 ?
3180 closein
3190 ?
3200 '
3210 ?"OPENOUT, OPENIN and LINE INPUT #9"
3220 openout "testdat2"
3230 for i=33 to 255:t$=chr$(i):print #9,t$
3240 next
3250 closeout
3260 openin "testdat2"
3270 for i=33 to 255:line input #9,t$:?t$;
3280 t=asc(t$):if t<>i then ?"error:";i;"<>";t:error 33
3290 next
3300 closein
3310 ?:?
3320 '
3330 ?"Numbers in files"
3340 openout "testdat2"
3350 for i=0 to 10:?#9,i:next :'separate lines
3360 closeout
3370 openin "testdat2"
3380 for i=0 to 10:input #9,t
3390 if i<>t then ?"error:";i;"<>";t:error 33
3400 next
3410 closein
3420 openin "testdat2"
3430 for i=0 to 10:input #9,t$
3440 a$=str$(i)+" ":a$=right$(a$,len(a$)-1):if a$<>t$ then ?"error:";a$;"<>";t$:error 33
3450 next
3460 closein
3470 '
3480 openout "testdat2"
3490 for i=0 to 10:?#9,i;:next :'one line
3500 closeout
3510 openin "testdat2"
3520 for i=0 to 10:input #9,t
3530 if i<>t then ?"error:";i;"<>";t:error 33
3540 next
3550 closein
3560 openin "testdat2"
3570 input #9,t$
3580 if t$<>"0  1  2  3  4  5  6  7  8  9  10 " then ?"error:";:error 33
3590 closein
3600 ?
3610 '
3620 ?"Mixed style"
3630 openout "testdat2"
3640 for i=0 to 10:?#9,i;"&a1";&a2:next
3650 closeout
3660 openin "testdat2"
3670 for i=0 to 10:input #9,t,t2
3680 if i<>t then ?"error:";i;"<>";t:error 33
3690 if t2<>&a1 then ?"error:";t2;"<>";&a1:error 33
3700 input #9,t2
3710 if t2<>&a2 then ?"error:";t2;"<>";&a2:error 33
3720 next
3730 closein
3740 '
3750 |ERA,"testdat2"
3760 '
3770 gosub 9040
3780 '
3790 ?"SYMBOL AFTER"
3800 a=240:h=himem+(256-a)*8
3810 a=256:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h:error 33
3820 a=0:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h:error 33
3830 a=240:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h:error 33
3840 memory himem-1
3850 on error goto 3860:symbol after 241:?"Error expected!":error 33: 'expect error 5
3860 if err<>5 then ?"err=";err;"erl=";erl:error 33 else resume 3870
3870 on error goto 0
3880 memory himem+1
3890 ?"UNT"
3900 a=unt(32767):if a<>32767 then error 33
3910 a=unt(32768):if a<>-32768 then error 33
3920 a=unt(65535):if a<>-1 then error 33
3930 ?"VAL"
3940 a=val(""):if a<>0 then error 33
3950 a=val("4r"):if a<>4 then error 33
3960 a=val("&ff"):if a<>&ff then error 33
3970 '
3980 gosub 9040
3990 '
4000 print "stairs"
4010 for i=1 to 24:print string$(i*2, "O"):next
4020 move 0,350
4030 for n=1 to 8
4040 drawr 50,0
4050 drawr 0,-50
4060 next
4070 move 348,0
4080 fill 1
4090 '
4100 print "test finished: ok"
4110 end
4120 '
9000 'get characters from screen; print crlf
9010 a$="":i=1:while i<=80 and right$(a$,1)<>"#":locate i,vpos(#0):a$=a$+copychr$(#0):i=i+1:wend:?:return
9020 '
9030 'wait some time or for key press
9040 t!=time+6*50:a$="":while time<t! and a$="":a$=inkey$:wend
9050 ?:?string$(10, "-"):?
9060 return
9070 '
*/ });
