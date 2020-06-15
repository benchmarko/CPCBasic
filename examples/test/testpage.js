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
1330 ?"DATA with empty parameters"
1340 b$="":restore 1440
1350 for i=1 to 16:read a$:b$=b$+a$:next
1360 if b$<>"1a11b1#" then error 33
1370 ?"DATA reading empty as numbers"
1380 b$="":restore 1440
1390 for i=1 to 16
1400 if i=8 or i=13 or i=16 then read a$ else read a:a$=str$(a)
1410 b$=b$+a$
1420 next
1430 if b$<>" 0 0 0 0 0 0 1a 0 1 1 0b 1 0#" then error 33
1440 DATA
1450 DATA ,
1460 DATA ,,
1470 DATA 1
1480 DATA a
1490 DATA ,1
1500 DATA 1,
1510 DATA   b   ,   1   ,
1520 DATA #
1530 '
1540 ?"DEC$(number,format)"
1550 a$=dec$(8.575,"##.##"):if a$<>" 8.58" then error 33
1560 a$=dec$(15.35,"#.##"):if a$<>"%15.35" then error 33
1570 '
1580 ?"DEF FN"
1590 def FNf1(x)=x*x
1600 a=FNf1(2.5):if a<>6.25 then error 33
1610 a=FN f1(2.5):if a<>6.25 then error 33
1620 def FN f1%(x)=x*x
1630 a%=FNf1%(2.5):if a%<>6 then error 33
1640 a%=FN f1%(2.5):if a%<>6 then error 33
1650 a=FNf1%(2.5):if a<>6 then error 33
1660 def FN f1!(x)=x*x
1670 a!=FNf1!(2.5):if a!<>6.25 then error 33
1680 a!=FN f1!(2.5):if a!<>6.25 then error 33
1690 a=FNf1!(2.5):if a<>6.25 then error 33
1700 def FN f1$(x$)=x$+x$
1710 a$=FNf1$("a"):if a$<>"aa" then error 33
1720 a$=FN f1$("a"):if a$<>"aa" then error 33
1730 def FNf2=2.5*2.5
1740 a=FNf2:if a<>6.25 then error 33
1750 def FN f2%=2.5*2.5
1760 a%=FN f2%:if a%<>6 then error 33
1770 '
1780 ?"ELSE"
1790 a=1 else a=2
1800 else a=3
1810 if a<>1 then error 33
1820 '
1830 ?"ERASE"
1840 erase a: 'a was used in previous tests
1850 dim a(4):for i=0 to 4:a(i)=i:next
1860 a=0:for i=0 to 4:a=a+a(i):next:if a<>10 then error 33
1870 erase a
1880 if a<>10 then error 33
1890 a=0:for i=0 to 4:a=a+a(i):next:if a<>0 then error 33
1900 gosub 9040
1910 '
1920 ?"FOR with integer constants"
1930 a$="":for i=+4 to 0 step -2:a$=a$+str$(i):next:if a$<>" 4 2 0" then error 33
1940 a=0:for i=++4 to 1 step ---2:a=a+i:next:if a<>6 then error 33: 'avoid ++ and -- in js!
1950 ?"FOR with integer variable and floating point ranges"
1960 a=0:for i%=1.2 to 9.7 step 3.2:a=a+i%:next:if a<>22 then error 33: '1+4+7+10
1970 ?"FOR with condition expressions"
1980 a=3:for i=a<>3 to a>=3 step a=3:?i;:next:print "#";
1990 gosub 9010:if a$<>" 0 -1 #" then error 33
2000 ?"FOR up to 2*PI"
2010 a=13/8*PI:for i=1 to 3:a=a+1/8*PI:next:if a>2*PI then ?"limit exceeded by";a-2*PI;"(TODO)" else ?"ok"
2020 'gosub 9040
2030 '
2040 ?"GOTO with leading zeros"
2050 goto 2060
2060 ?"ok"
2070 ?"INSTR"
2080 a=instr("Amstrad", "m"):if a<>2 then error 33
2090 a=instr("Amstrad", "sr"):if a<>0 then error 33
2100 '
2110 ?"ON n GOSUB"
2120 a=0:on 1 gosub 2190,2200:if a<>1 then error 33
2130 a=0:on 2 gosub 2190,2200:if a<>2 then error 33
2140 a=0:on 1.5 gosub 2190,2200:if a<>2 then error 33
2150 a=1.5:on a gosub 2190,2200:if a<>2 then error 33
2160 a=0:on 3 gosub 2190,2200:if a<>0 then error 33
2170 a=0:on 0 gosub 2190,2200:if a<>0 then error 33
2180 goto 2210
2190 a=1:return
2200 a=2:return
2210 ?"ON n GOTO"
2220 a=1.7:on a-0.2 goto 2240,2250
2230 goto 2260
2240 a=1:goto 2260
2250 a=2:goto 2260
2260 if a<>2 then error 33
2270 gosub 9040
2280 '
2290 ?"PRINT in FOR loop"
2300 for i=1 to 5:print i;:next i:print"#";
2310 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2320 ?"PRINT in GOTO loop"
2330 a=1
2340 print a;: a=a+1: if a <= 5 then goto 2340 else print "#";
2350 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2360 ?"PRINT in WHILE loop"
2370 a=1: while a<=5: print a;: a=a+1: wend: print "#";
2380 gosub 9010:if a$<>" 1  2  3  4  5 #" then error 33
2390 ?"PRINT concatenated string"
2400 a=1: s$="": while a<=5: s$=s$+str$(a)+":": a=a+1: b=0: while b<3: b=b+1: s$=s$+str$(b): wend: s$=s$+" ": wend: s$=s$+"#":print s$;
2410 gosub 9010:if a$<>" 1: 1 2 3  2: 1 2 3  3: 1 2 3  4: 1 2 3  5: 1 2 3 #" then error 33
2420 '
2430 ?"IF THEN ELSE: WEND in ELSE"
2440 a=0: while a<5: a=a+1: if a=3 or 3=a then print "a=";a;"(three) "; else print "a<>3:";a;"(not three) ";: wend : ?"after WEND": 'WEND in ELSE
2450 ?"#";
2460 gosub 9010:if a$<>"a<>3: 1 (not three) a<>3: 2 (not three) a= 3 (three) #" then error 33
2470 '
2480 gosub 9040
2490 ?"PRINT numbers separated by space"
2500 print 1 2 3;:?"#";
2510 gosub 9010: 'if a$<>" 1  2  3 #" then error 33: 'not ok! On real CPC one number: " 123 #"
2520 ?"PRINT numbers separated by ;"
2530 print 1;2;3;:?"#";
2540 gosub 9010:if a$<>" 1  2  3 #" then error 33
2550 ?"PRINT numbers separated by , (default ZONE 13)"
2560 print 1,2,3;:?"#";
2570 gosub 9010:if a$<>" 1            2            3 #" then error 33
2580 ?"PRINT numbers, computed"
2590 print -1 -2 -3;"#";
2600 gosub 9010:if a$<>"-6 #" then error 33
2610 print -1;-2;-3;"#";
2620 gosub 9010:if a$<>"-1 -2 -3 #" then error 33
2630 ?"PRINT strings separated by space"
2640 print "a" "b" "c" "#";
2650 gosub 9010:if a$<>"abc#" then error 33
2660 ?"PRINT strings separated by ;"
2670 print "a";"b";"c";"#";
2680 gosub 9010:if a$<>"abc#" then error 33
2690 ?"PRINT strings separated by ,"
2700 print "a","b","c";"#";: '[zone 13]
2710 gosub 9010:if a$<>"a            b            c#" then error 33
2720 zone 5
2730 print "a","b","c";"#";: '[zone 5]
2740 gosub 9010:if a$<>"a    b    c#" then error 33
2750 zone 13
2760 ?"PRINT strings separated by tab()"
2770 print "a"tab(2)"b"tab(3)"c"tab(4)"#";
2780 gosub 9010:if a$<>"abc#" then error 33
2790 print "a"tab(13)"b"tab(20)"c"tab(22)"#";
2800 gosub 9010:if a$<>"a           b      c #" then error 33
2810 print "a"tab(78)"bc#";
2820 if pos(#0)<>1 then error 33
2830 ?chr$(8);: 'back
2840 if pos(#0)<>80 then error 33
2850 gosub 9010:if a$<>"a                                                                            bc#" then error 33
2860 print "a"tab(79)"bc#";
2870 gosub 9010:if a$<>"bc#" then error 33
2880 ?"PRINT number without separator"
2890 ?&x102;"#";
2900 gosub 9010:if a$<>" 2  2 #" then error 33
2910 gosub 9040
2920 '
2930 ?"PRINT special exponential number expressions"
2940 print 1e++4;:?"#";
2950 gosub 9010:if a$<>" 1  4 #" then error 33
2960 print 1e+-4;:?"#";
2970 gosub 9010:if a$<>" 1 -4 #" then error 33
2980 print 5e4.5;:?"#";
2990 gosub 9010:if a$<>" 50000  0.5 #" then error 33
3000 print 1exp(0);:?"#";
3010 gosub 9010:if a$<>" 1  1 #" then error 33
3020 '
3030 ?"PRINT USING number format"
3040 print using "##.##";8.575;:?"#";
3050 gosub 9010:if a$<>" 8.58#" then error 33
3060 ?"PRINT USING number too long"
3070 print using "#.##";15.35;:?"#";
3080 gosub 9010:if a$<>"%15.35#" then error 33
3090 ?"PRINT USING string format"
3100 print using "\   \";"n1";"n2";" xx3";:?"#";
3110 gosub 9010:if a$<>"n1   n2    xx3 #" then error 33
3120 print using "!";"a1";"b2";:?"#";
3130 gosub 9010:if a$<>"ab#" then error 33
3140 print using "&";"a1";"b2";:?"#";
3150 gosub 9010:if a$<>"a1b2#" then error 33
3160 'gosub 9040
3170 '
3180 ?"ROUND"
3190 a=round(PI):if a<>3 then error 33
3200 a=round(PI,0):if a<>3 then error 33
3210 a=round(PI,0.4):if a<>3 then error 33
3220 a=round(PI,2):if a<>3.14 then error 33
3230 a=round(PI,2.4):if a<>3.14 then error 33
3240 a=round(1234.5678,-2):if a<>1200 then error 33
3250 a=round(8.575,2):if a<>8.58 then error 33
3260 '
3270 gosub 9040
3280 ?"DATA and RESTORE"
3290 restore 3300: read s$,t$: if s$+t$<>"1" then error 33
3300 data 1,
3310 '
3320 ?"OPENIN and LINE INPUT #9"
3330 ?"OPENIN testdat with characters 33..255"
3340 openin "testdat1"
3350 for i=33 to 255:line input #9,t$
3360 t=asc(t$):?t$;: if t<>i then ?"error:";i;"<>";t:error 33
3370 tag:move ((i-33) mod 80)*8, 90-((i-33)\80)*16:?t$;:tagoff
3380 next
3390 ?
3400 closein
3410 ?
3420 '
3430 ?"OPENOUT, OPENIN and LINE INPUT #9"
3440 openout "testdat2"
3450 for i=33 to 255:t$=chr$(i):print #9,t$
3460 next
3470 closeout
3480 openin "testdat2"
3490 for i=33 to 255:line input #9,t$:?t$;
3500 t=asc(t$):if t<>i then ?"error:";i;"<>";t:error 33
3510 next
3520 closein
3530 ?:?
3540 '
3550 ?"Numbers in files"
3560 openout "testdat2"
3570 for i=0 to 10:?#9,i:next :'separate lines
3580 closeout
3590 openin "testdat2"
3600 for i=0 to 10:input #9,t
3610 if i<>t then ?"error:";i;"<>";t:error 33
3620 next
3630 closein
3640 openin "testdat2"
3650 for i=0 to 10:input #9,t$
3660 a$=str$(i)+" ":a$=right$(a$,len(a$)-1):if a$<>t$ then ?"error:";a$;"<>";t$:error 33
3670 next
3680 closein
3690 '
3700 openout "testdat2"
3710 for i=0 to 10:?#9,i;:next :'one line
3720 closeout
3730 openin "testdat2"
3740 for i=0 to 10:input #9,t
3750 if i<>t then ?"error:";i;"<>";t:error 33
3760 next
3770 closein
3780 openin "testdat2"
3790 input #9,t$
3800 if t$<>"0  1  2  3  4  5  6  7  8  9  10 " then ?"error:";:error 33
3810 closein
3820 ?
3830 '
3840 ?"Mixed style"
3850 openout "testdat2"
3860 for i=0 to 10:?#9,i;"&a1";&a2:next
3870 closeout
3880 openin "testdat2"
3890 for i=0 to 10:input #9,t,t2
3900 if i<>t then ?"error:";i;"<>";t:error 33
3910 if t2<>&a1 then ?"error:";t2;"<>";&a1:error 33
3920 input #9,t2
3930 if t2<>&a2 then ?"error:";t2;"<>";&a2:error 33
3940 next
3950 closein
3960 '
3965 ?"|ERA to delete testdat2 (CPC: DISC only)"
3970 |ERA,"testdat2"
3980 '
3990 gosub 9040
4000 '
4010 ?"SYMBOL AFTER"
4020 a=240:h=himem+(256-a)*8
4030 a=256:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h:error 33
4040 a=0:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h:error 33
4050 a=240:symbol after a:if himem<>h-(256-a)*8 then ?"error:";himem;"<>";h:error 33
4060 memory himem-1
4070 on error goto 4080:symbol after 241:?"Error expected!":error 33: 'expect error 5
4080 if err<>5 then ?"err=";err;"erl=";erl:error 33 else resume 4090
4090 on error goto 0
4100 memory himem+1
4110 ?"UNT"
4120 a=unt(32767):if a<>32767 then error 33
4130 a=unt(32768):if a<>-32768 then error 33
4140 a=unt(65535):if a<>-1 then error 33
4150 ?"VAL"
4160 a=val(""):if a<>0 then error 33
4170 a=val("4r"):if a<>4 then error 33
4180 a=val("&ff"):if a<>&ff then error 33
4190 '
4200 gosub 9040
4210 '
4220 print "stairs"
4230 for i=1 to 24:print string$(i*2, "O"):next
4240 move 0,350
4250 for n=1 to 8
4260 drawr 50,0
4270 drawr 0,-50
4280 next
4290 move 348,0
4300 fill 1
4310 '
4320 print "test finished: ok"
4330 end
4340 '
9000 'get characters from screen; print crlf
9010 a$="":i=1:while i<=80 and right$(a$,1)<>"#":locate i,vpos(#0):a$=a$+copychr$(#0):i=i+1:wend:?:return
9020 '
9030 'wait some time or for key press
9040 t!=time+6*50:a$="":while time<t! and a$="":a$=inkey$:wend
9050 ?:?string$(10, "-"):?
9060 return
9070 '
*/ });
