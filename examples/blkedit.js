/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 rem blkedit - Block Editor
20 rem written by AMSDOS
25 rem taken from http://www.cpcwiki.eu/forum/programming/silly-programming-ideas-turning-text-into-graphics/msg100582/#msg100582
26 rem and sample from http://www.cpcwiki.eu/forum/programming/silly-programming-ideas-turning-text-into-graphics/msg33246/#msg33246
27 '
30 GOSUB 110
35 gosub 2000:x%=x%+5:locate 1,25:?"Use Cursor,Space,I";:ch$=""
40 WHILE ch$<>chr$(13):'INKEY(18)=-1
50 GOSUB 310
60 GOSUB 410
70 WEND:MODE 2:PEN 1:CALL &BC02:gosub 1800:call &bb18:END
100 ' Initialise Variables
110 MODE 0
120 GOSUB 1210
130 DIM grid%(25,20)
140 x%=10:y%=10
150 oldx%=x%:oldy%=y%
160 c%=1
170 RESTORE 230
180 FOR p%=0 TO 14
190  READ cl%
200  grid%(0,p%)=cl%
210  INK p%,grid%(0,p%)
220 NEXT p%
230 data 0,26,20,6,3,0,1,2,4,16,14,16,18,22,9
231 'data 0,26,1,'DATA 1,24,20,6,26,0,2,8,10,12,14,16,18,22,9
240 RETURN
300 ' Print Cursor
310 PRINT CHR$(22)+CHR$(1);
320 LOCATE x%,y%
330 PEN 15
340 PRINT"X";
350 oldx%=x%:oldy%=y%
360 RETURN
400 ' Check for Keypress
410 ch$="":WHILE ch$=""
420 ch$=UPPER$(INKEY$)
430 IF ch$=CHR$(240) AND (y%<>1) THEN y%=y%-1 : pr%=1
440 IF ch$=CHR$(241) AND (y%<>25) THEN y%=y%+1 : pr%=1
450 IF ch$=CHR$(242) AND (x%<>1) THEN x%=x%-1 : pr%=1
460 IF ch$=CHR$(243) AND (x%<>20) THEN x%=x%+1 : pr%=1
470 IF pr%=1 THEN pr%=0 : GOSUB 610
480 IF ch$=" " THEN GOSUB 710
490 IF ch$="I" THEN sx%=x% : sy%=y% : GOSUB 1310
500 IF ch$="S" THEN sx%=x% : sy%=y% : GOSUB 810 : MODE 0 : GOSUB 1110
510 IF ch$="L" THEN sx%=x% : sy%=y% : GOSUB 910 : MODE 0 : GOSUB 1110
520 call &bd19:WEND
530 'ch$=""
540 RETURN
600 ' Preserve Block
610 PEN grid%(oldy%,oldx%)
620 PRINT CHR$(22)+CHR$(0);
630 LOCATE oldx%,oldy%
640 PRINT CHR$(143);
650 PRINT CHR$(22)+CHR$(1);
660 RETURN
700 ' Print Block
710 LOCATE x%,y%
720 grid%(y%,x%)=c%
730 PEN grid%(y%,x%)
740 PRINT CHR$(143);
750 RETURN
800 ' Save File
810 MODE 1:PEN 1
820 INPUT"Enter Filename:";fl$
830 OPENOUT "!"+fl$
840  FOR y%=0 TO 25
850  FOR x%=0 TO 20
860   PRINT#9,grid%(y%,x%);
870  NEXT x% : PRINT#9
880  NEXT y%
890 CLOSEOUT:RETURN
900 ' Load File & Inks
910 MODE 1:PEN 1
920 INPUT"Enter Filename:";fl$
930 OPENIN "!"+fl$
940  FOR y%=0 TO 25
950  FOR x%=0 TO 20
960   INPUT#9,grid%(y%,x%)
970  NEXT x%
980  NEXT y%
990 CLOSEIN
1000 FOR i%=0 TO 14
1010  INK i%,grid%(0,i%)
1020 NEXT i%
1030 RETURN
1100 ' Draw in Screen & Window Setup
1110 y%=1
1120 WHILE y%<=25
1130 FOR x%=1 TO 20
1140  LOCATE x%,y%
1150  PEN grid%(y%,x%)
1160  PRINT CHR$(143);
1170 NEXT x%
1180 y%=y%+1
1190 WEND
1200 x%=sx% : y%=sy%
1210 WINDOW 1,20,1,25
1220 WINDOW#1,1,20,24,25
1230 RETURN
1300 ' Select Pen and or Change Inks
1310 CLS#1
1320 xp%=1
1330 FOR p%=0 TO 14
1340  PEN#1,p%
1350  LOCATE#1,xp%,1
1360  PRINT#1,CHR$(143);
1370  xp%=xp%+1
1380 NEXT p%
1390 p%=c% : xp%=p%+1
1395 ich$=""
1400 WHILE ich$<>chr$(13) and ich$<>" ":'INKEY(18)=-1:'enter
1410  LOCATE#1,xp%,2
1420  PEN#1,15
1430  PRINT#1,CHR$(244);
1440  ich$=UPPER$(INKEY$):if ich$="" then call &bd19:goto 1440
1450  IF ich$=CHR$(243) AND xp%<15 THEN oxp%=xp%:xp%=xp%+1: p%=xp%-1 : c%=p% : GOSUB 1610
1460  IF ich$=CHR$(242) AND xp%>1 THEN oxp%=xp%:xp%=xp%-1: p%=xp%-1 : c%=p% : GOSUB 1610
1470  IF ich$=CHR$(240) AND grid%(0,p%)<26 THEN grid%(0,p%)=grid%(0,p%)+1 : INK p%,grid%(0,p%)
1480  IF ich$=CHR$(241) AND grid%(0,p%)>0 THEN grid%(0,p%)=grid%(0,p%)-1 : INK p%,grid%(0,p%)
1490 WEND
1500 CLS#1
1510 y%=24
1520 GOSUB 1120
1530 RETURN
1600 ' Cursor Update
1610 LOCATE#1,1,1:PRINT#1,CHR$(22)+CHR$(0);
1620 LOCATE#1,oxp%,2
1630 PRINT#1," ";
1640 LOCATE#1,1,1:PRINT#1,CHR$(22)+CHR$(1);
1650 RETURN
1790 '
1800 'dump
1810 lnum=5000:l$=""
1820 for y%=1 to 25
1830 l$="":'?l1;"DATA ";
1840 for x%=1 to 20
1850 l$=l$+right$(str$(grid%(y%,x%)),2)
1860 if x%<20 then l$=l$+","
1870 next x%
1880 ?using"####";lnum;:?" DATA ";l$
1885 lnum=lnum+10
1890 next y%
1900 return
1980 '
1990 'Sample
2000 'MODE 0: INK 0,0:INK 1,26:INK 4,3:INK 6,1:INK 7,2:INK 8,4:INK 9,16
2010 'DIM col(242):GOSUB 2080:a=1
2020 FOR y=1+1 TO 22+1
2030 FOR x=1+1 TO 11+1
2035 read grid%(y,x)
2040 LOCATE x,y:PEN grid%(y,x):PRINT CHR$(143);
2050 'a=a+1
2060 NEXT x:NEXT y
2065 return
2070 'CALL &BB18:PEN 1:MODE 2:END
2080 ' Set up Colours
2090 'FOR a=1 TO 241
2100 'READ c
2110 'col(a)=c
2120 'NEXT a:RETURN
2130 DATA 0,4,4,4,4,4,4,0,0,0,0
2140 DATA 0,4,4,4,4,4,4,4,4,4,0
2150 DATA 0,4,4,4,4,4,4,9,4,4,0
2160 DATA 4,4,4,4,4,4,4,9,4,4,0
2170 DATA 4,4,4,4,4,4,9,9,9,4,4
2180 DATA 4,4,4,4,1,0,9,0,1,4,4
2190 DATA 4,9,4,9,1,0,9,0,1,4,4
2200 DATA 0,9,4,9,1,0,9,0,1,4,4
2210 DATA 0,9,9,9,1,0,9,0,1,4,0
2220 DATA 0,4,9,9,1,1,9,1,9,9,0
2230 DATA 0,4,9,9,9,1,9,1,9,9,0
2240 DATA 0,4,9,9,9,9,9,9,9,9,0
2250 DATA 0,7,4,9,9,9,0,9,9,9,0
2260 DATA 7,7,7,9,9,9,9,9,9,8,0
2270 DATA 7,7,7,8,7,7,7,8,7,8,0
2280 DATA 7,7,9,8,7,7,7,8,9,9,0
2290 DATA 7,9,9,9,8,8,8,8,9,9,0
2300 DATA 0,9,9,8,6,1,6,1,8,9,0
2310 DATA 0,8,8,8,8,6,6,6,6,8,0
2320 DATA 0,8,8,8,8,8,8,8,8,8,8
2330 DATA 0,4,6,6,6,0,6,6,6,6,4
2340 DATA 0,4,4,4,4,0,4,4,4,4,4
2350 '
*/ });
