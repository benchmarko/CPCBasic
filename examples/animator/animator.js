/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem animator - Animator
2 rem (c) Marco Vieth, 1991
3 rem
4 rem TODO: make it working with CPCBasic
5 rem
100 REM Animator (v3.2) - Der 3D-Animator
110 REM Marco Vieth
120 REM 28.3.1991 (16.7.,6.8.,7.8.1990)
130 REM
140 CLS:CLEAR:DEFINT a-s,u-z:DEFSTR t
150 '
160 animate=&A000:anirech=&6000:doke=anirech+9
165 if peek(0)=0 then MEMORY anirech-1:goto 190:'CPCBasic
170 IF PEEK(animate+12)<>2 THEN MEMORY anirech-1:LOAD"!ANIMATE2.BIN",animate:LOAD"!ANIRECH2.BIN",anirech
180 '
190 punkta=&79FF:linea=&77AD:ania=&75CC:aniblk=&8000
200 anidata=&8100
210 datadr=anidata:'Buffer zum Laden/Saven
220 CALL doke,aniblk,anidata-aniblk
230 '
240 DIM x[7],w[7]
250 w[7]=0
260 POKE animate+13,3:'Wartezeit
270 ani=0
280 '
290 CALL anirech+6,punkta,linea,ania,anidata,aniblk
300 GOSUB 3560
310 PRINT"Punkte:";PEEK(punkta);" Linien:";PEEK(linea);" Phasen:";PEEK(ania)
320 RESTORE 3700:t[0]="Hauptmenue":GOSUB 3600
330 t[0]=t:IF i=7 THEN MODE 2:STOP:GOTO 300
340 CLS
350 ON i GOSUB 400,2040,2550,2850,2890,2930
360 GOTO 300
370 REM
380 REM *** Eingeben ***
390 REM
400 CLS:RESTORE 3710:GOSUB 3610
410 IF i=6 THEN RETURN
420 CLS
430 PRINT t[0]" "t[i]:PRINT
440 ON i GOSUB 490,780,1120,1370,1560
450 GOTO 400
460 REM
470 REM
480 REM Punkte:
490 ani=0:PRINT"Eckpunkt:  X:     Y:     Z:"
500 WINDOW#1,1,32,11,20:WINDOW SWAP 1,0
510 x[0]=4:'Anz x-Spalten
520 x[1]=3:x[2]=12:x[3]=19:x[4]=26
530 ym=PEEK(punkta)
540 p=0:x=1:y=1
550 GOSUB 650:i=0
560 GOSUB 3210
570 ON i GOTO 550,580,750
580 IF x=1 THEN x=2:GOSUB 610:x=3:GOSUB 610:x=4:GOSUB 610:x=1 ELSE GOSUB 610
590 IF p+y-1=ym THEN IF ym<255 THEN ym=ym+1:POKE punkta,ym:IF (y=ye) AND (ye<10) THEN ye=ye+1:GOSUB 650
600 i=2:GOTO 560
610 mi=-700:ma=700:ad=punkta+1+6*(p+y-1)+2*(x-2)
620 GOSUB 3470:CALL doke,ad,i:LOCATE x[x],y:PRINT i;"  ";
630 RETURN
640 '
650 CLS:x2=x:y2=y:p2=p:y=1
660 WHILE y<=10 AND p<=ym
670 ad=punkta+1+p*6
680 IF p=ym THEN CALL doke,ad,0:CALL doke,ad+2,0:CALL doke,ad+4,0
690 i=p:x=1:GOSUB 3180:x=2:a=ad:GOSUB 3150
700 x=3:a=ad+2:GOSUB 3150:x=4:a=ad+4:GOSUB 3150
710 p=p+1:y=y+1
720 WEND
730 ye=y-1
740 x=x2:y=y2:p=p2:RETURN
750 WINDOW SWAP 1,0:RETURN
760 REM
770 REM Linien
780 IF PEEK(punkta)=0 THEN t="Punkte":GOTO 3130
790 ani=0:PRINT"Nummer:  Punktnummer od. Anzahl"
800 WINDOW#1,1,32,11,20:WINDOW SWAP 1,0
810 x[0]=2:x[1]=3:x[2]=15:p=0:x=1:y=1:ym=0:ylin=0:i=0
820 ad=linea+1+ym:IF PEEK(ad)<>0 THEN IF PEEK(linea)>i THEN ym=ym+PEEK(ad)+1:i=i+1:GOTO 820
830 IF PEEK(linea)>i THEN POKE linea,i
840 ad=linea+1+ym:POKE ad,0
850 GOSUB 990:i=0
860 GOSUB 3210
870 ON i GOTO 850,880,1090
880 IF x=1 THEN x=2:GOSUB 950:x=1 ELSE GOSUB 950
890 IF p+y-1<>ym THEN 940
900 GOSUB 1060:'Anzahl?
910 ad=linea+1+p+y-1
920 IF ylin=p+y-1 THEN IF ym+PEEK(ad)+1<&250 THEN ym=ym+PEEK(ad)+1:FOR i=ad+1 TO linea+1+ym+1:POKE i,0:NEXT:POKE linea,PEEK(linea)+1:ye=ye+PEEK(ad):GOSUB 990:GOTO 940
930 IF ym<&250 THEN ym=ym+1:POKE linea+1+ym,0:IF (y=ye) AND (ye<10) THEN ye=ye+1:GOSUB 990
940 i=2:GOTO 860
950 '
960 mi=0:ma=PEEK(punkta)-1:GOSUB 1060:IF ylin=p+y-1 THEN ma=&251-ym:IF ma>255 THEN ma=255:'Anzahl eing.
970 ad=linea+1+p+y-1:GOSUB 3470:POKE ad,i:LOCATE x[x],y:PRINT i;"  ";
980 RETURN
990 CLS:x2=x:y2=y:y=1:p2=p:GOSUB 1030:p=p2:WHILE y<=10 AND p<=ym:ad=linea+1+p
1000 i=p:x=1:GOSUB 3180:i=PEEK(ad):x=2:GOSUB 3180:LOCATE x[x]+11,y:ad=linea+1+ylin:IF (p=ylin) THEN PRINT"A"; ELSE IF (p=ylin+PEEK(ad)+1) THEN PRINT"A";:ylin=ylin+PEEK(ad)+1 ELSE PRINT" ";
1010 p=p+1:y=y+1:WEND:ye=y-1:x=x2:y=y2:p=p2:RETURN
1020 '
1030 p=0:ylin=0
1040 ylin=p:ad=linea+1+p:IF PEEK(ad)<>0 THEN IF p<p2 THEN p=p+PEEK(ad)+1:GOTO 1040
1050 RETURN
1060 p2=p:GOSUB 1030:p=p2
1070 IF ylin<p+y-1 THEN ylin=ylin+PEEK(linea+1+ylin)+1:GOTO 1070
1080 RETURN
1090 WINDOW SWAP 1,0:RETURN
1100 REM
1110 REM Phasen
1120 ani=0:PRINT"Phase: alpha beta gamma  xoff yoff zoff";
1130 WINDOW#1,1,40,11,20:WINDOW SWAP 1,0
1140 x[0]=7:x[1]=2:x[2]=8:x[3]=14:x[4]=19:x[5]=26:x[6]=31:x[7]=36
1150 ym=PEEK(ania):p=0:x=1:y=1
1160 GOSUB 1270:i=0
1170 GOSUB 3210
1180 ON i GOTO 1160,1190,1340
1190 IF x=1 THEN FOR x=2 TO 7:GOSUB 1220:NEXT:x=1 ELSE GOSUB 1220
1200 IF p+y-1=ym THEN IF ym<79 THEN ym=ym+1:POKE ania,ym:IF (y=ye) AND (ye<10) THEN ye=ye+1:GOSUB 1270
1210 i=2:GOTO 1170
1220 IF x<5 THEN mi=0:ma=35 ELSE mi=-128:ma=127
1230 ad=ania+1+6*(p+y-1)+x-2:GOSUB 3470
1240 IF i<0 THEN POKE ad,i+256 ELSE POKE ad,i
1250 LOCATE x[x],y:PRINT"    ";:LOCATE x[x],y:PRINT i;
1260 RETURN
1270 CLS:x2=x:y2=y:p2=p:y=1
1280 WHILE y<=10 AND p<=ym:ad=ania+1+p*6
1290 IF p=ym THEN FOR i=ad TO ad+5:POKE i,0:NEXT
1300 i=p:x=1:GOSUB 3180:FOR x=2 TO 7:i=PEEK(ad+x-2):IF x>=5 THEN IF i>127 THEN i=i-256
1310 GOSUB 3180:NEXT
1320 p=p+1:y=y+1:WEND
1330 ye=y-1:x=x2:y=y2:p=p2:RETURN
1340 WINDOW SWAP 1,0:RETURN
1350 REM
1360 REM Ablauf
1370 IF PEEK(ania)=0 THEN t="Phasen":GOTO 3130
1380 PRINT"Nummer:  Animationsphase:  Farbe:"
1390 WINDOW#1,1,32,11,20:WINDOW SWAP 1,0
1400 x[0]=3:x[1]=3:x[2]=15:x[3]=27:ym=PEEK(aniblk+2):p=0:x=1:y=1
1410 GOSUB 1500:i=0
1420 GOSUB 3210
1430 ON i GOTO 1410,1440,1530
1440 IF x=1 THEN x=2:GOSUB 1470:x=3:GOSUB 1470:x=1 ELSE GOSUB 1470
1450 IF p+y-1=ym THEN IF ym<&A0 THEN ym=ym+1:POKE aniblk+2,ym:IF (y=ye) AND (ye<10) THEN ye=ye+1:GOSUB 1500
1460 i=2:GOTO 1420
1470 mi=0:IF x=3 THEN ma=255 ELSE ma=PEEK(ania)-1
1480 ad=aniblk+3+(p+y-1)*2+(x-2):GOSUB 3470:POKE ad,i:LOCATE x[x],y:PRINT i;"  ";
1490 RETURN
1500 CLS:x2=x:y2=y:p2=p:y=1:WHILE y<=10 AND p<=ym:ad=aniblk+3+p*2
1510 IF p=ym THEN POKE ad,0:POKE ad+1,&80
1520 i=p:x=1:GOSUB 3180:i=PEEK(ad):x=2:GOSUB 3180:i=PEEK(ad+1):x=3:GOSUB 3180:p=p+1:y=y+1:WEND:ye=y-1:x=x2:y=y2:p=p2:RETURN
1530 WINDOW SWAP 1,0:RETURN
1540 REM
1550 REM Automatik
1560 t2=t[0]:t[0]=t
1570 CLS:RESTORE 3720:GOSUB 3610
1580 IF i=3 THEN t[0]=t2:RETURN
1590 CLS:'PRINT t[0]" "t[i]:PRINT
1600 ON i GOSUB 1620,1970
1610 GOTO 1570
1620 t="":IF PEEK(punkta)=0 THEN t="Punkte,"
1630 IF PEEK(linea)=0 THEN t=t+"Linien"
1640 IF t<>"" THEN 3130
1650 ani=0:CALL animate:ye=7
1660 RESTORE 1950:FOR x=1 TO ye:READ x[x],t:y=x:IF y>=6 THEN y=y-1
1670 LOCATE x[x]-3,y:PRINT t;"= ";:NEXT
1680 x=1:y=1:x2=x:y2=y
1690 IF w[7]<0 THEN w[7]=PEEK(ania) ELSE IF w[7]>PEEK(ania) THEN w[7]=0
1700 ad=ania+w[7]*6:IF w[7]=PEEK(ania) THEN FOR i=ad+1 TO ad+6:POKE i,0:NEXT:'Phase loeschen
1710 FOR i=1 TO 6:w[i]=PEEK(ad+i):NEXT
1720 FOR i=1 TO ye:y=i:IF y>=6 THEN y=y-1
1730 LOCATE x[i],y:PRINT USING"####";w[i];:NEXT
1740 GOTO 1930
1750 y=x:IF y>=6 THEN y=y-1
1760 y2=x2:IF y2>=6 THEN y2=y2-1
1770 GOSUB 3390
1780 t=INKEY$:i=ASC(t+CHR$(0))
1790 IF i=13 OR i=224 THEN GOSUB 3440:CALL animate+6:GOSUB 3530:GOSUB 3560:ad=ania+w[7]*6:FOR i=1 TO 6:POKE ad+i,w[i]:NEXT:ym=PEEK(ania):IF (w[7]=ym) AND (ym<79) THEN ym=ym+1:POKE ania,ym:RETURN ELSE RETURN
1800 IF (i>=48 AND i<=57) OR (i=45) THEN GOSUB 3360:LOCATE x[x],y:INPUT"    ",w[x]:GOTO 1880
1810 x2=x:y2=y
1820 IF INKEY(0)>-1 THEN x=x-1:IF x<1 THEN x=ye
1830 IF INKEY(2)>-1 THEN x=x+1:IF x>ye THEN x=1
1840 IF INKEY(8)>-1 THEN IF INKEY(8)<>32 THEN i=-1:GOTO 1870 ELSE i=-4:GOTO 1870
1850 IF INKEY(1)>-1 THEN IF INKEY(1)<>32 THEN i=1:GOTO 1870 ELSE i=4:GOTO 1870
1860 FOR i=1 TO 100:NEXT:GOTO 1750
1870 w[x]=w[x]+i
1880 IF x<4 THEN IF w[x]<0 THEN w[x]=35 ELSE IF w[x]>35 THEN w[x]=0
1890 IF x=7 THEN CALL animate+9,aniblk:GOTO 1690
1900 IF x>=4 THEN IF w[x]<-128 THEN w[x]=127 ELSE IF w[x]>127 THEN w[x]=-128
1910 CALL animate+9,aniblk
1920 LOCATE x[x],y:PRINT USING"####";w[x];
1930 CALL anirech+3,w[1],w[2],w[3],w[4],w[5],w[6]:CALL animate+9,aniblk
1940 GOTO 1750
1950 DATA 36,"a",28,"b",20,"g",12,"x",4,"y",36,"z",28,"p"
1960 REM
1970 GOSUB 3110:IF t<>"J" THEN RETURN
1980 ym=PEEK(ania)
1990 POKE aniblk+2,ym:FOR i=0 TO ym:PRINT i:ad=aniblk+3+i*2:POKE ad,i:POKE ad+1,&80:NEXT
2000 CALL &BB18:RETURN
2010 REM
2020 REM *** Ausgeben ***
2030 REM
2040 CLS:RESTORE 3710:GOSUB 3610
2050 IF i=6 THEN RETURN
2060 CLS
2070 PRINT t[0]" "t[i]:PRINT
2080 IF i=5 THEN 2040
2090 PRINT"Ausgabe auf Drucker";:GOSUB 3050
2100 w=0:IF t="J" THEN w=8
2110 IF w=0 THEN MODE 2
2120 PRINT#w,"Anzahl "t[i]" : ";
2130 ON i GOSUB 2170,2230,2310,2330
2140 IF w=0 THEN CALL &BB18:GOSUB 3560
2150 GOTO 2040
2160 REM Punkte
2170 ad=punkta+1:ym=PEEK(punkta)
2180 x[0]=4:'Anz x-Spalten
2190 x[1]=3:x[2]=12:x[3]=19:x[4]=26:t[1]="Nr.":t[2]="xko":t[3]="yko":t[4]="zko"
2200 br=2:'je 2 Byte
2210 GOTO 2350
2220 REM Linien
2230 ad=linea+1:ym=PEEK(linea):PRINT#w,ym:PRINT#w
2240 p=0:WHILE p<ym:y=PEEK(ad):ad=ad+1:PRINT#w,USING"##";p+1;:PRINT#w,". Block (";:PRINT#w,USING"###";y;:PRINT#w,") : ";
2250 FOR x=1 TO y:PRINT#w,USING"###";PEEK(ad);:ad=ad+1:IF x<y THEN PRINT#w,",";
2260 NEXT
2270 PRINT#w
2280 p=p+1:WEND
2290 RETURN
2300 REM Phasen
2310 ad=ania+1:ym=PEEK(ania):x[0]=7:x[1]=2:x[2]=8:x[3]=14:x[4]=19:x[5]=26:x[6]=31:x[7]=36:t[1]="Phase":t[2]="alpha":t[3]="beta":t[4]="gamma":t[5]="xoff":t[6]="yoff":t[7]="zoff":br=1:GOTO 2350
2320 REM Ablauf
2330 ad=aniblk+3:ym=PEEK(aniblk+2):x[0]=3:x[1]=3:x[2]=12:x[3]=19:t[1]="Nummer":t[2]="Phase":t[3]="Farbe":br=1
2340 '
2350 PRINT#w,ym
2360 PRINT#w
2370 FOR x2=0 TO 40 STEP 40:FOR x=1 TO x[0]:PRINT#w,TAB(x[x]+x2);t[x];:NEXT:NEXT
2380 x2=0
2390 PRINT#w
2400 p=0
2410 WHILE p<ym
2420 PRINT#w,TAB(x[1]+x2);p;
2430 FOR x=2 TO x[0]
2440 i=PEEK(ad):ad=ad+1:IF br=2 THEN i=UNT(i+PEEK(ad)*256):ad=ad+1
2450 IF x>=5 THEN IF i>127 THEN i=i-256:'Zweierkomplement bei Phasen
2460 PRINT#w,TAB(x[x]+x2);i;
2470 NEXT
2480 IF x2=0 THEN x2=40 ELSE x2=0:PRINT#w
2490 p=p+1:WEND
2500 RETURN
2510 REM
2520 REM
2530 REM *** Animate ***
2540 REM
2550 IF ani<>0 THEN 2720
2560 t="":IF PEEK(punkta)=0 THEN t="Punkte,"
2570 IF PEEK(linea)=0 THEN t=t+"Linien,"
2580 IF PEEK(ania)=0 THEN t=t+"Phasen,"
2590 IF PEEK(aniblk+2)=0 THEN t=t+"Ablauf"
2600 IF t<>"" THEN 3130
2610 PRINT"Animationsphase : ";
2620 i=0:CALL anirech,@i:PRINT
2630 IF i=0 THEN PRINT"Animation zu lang !":CALL &BB18:RETURN
2640 ani=1
2650 PRINT"Daten von &";HEX$(aniblk);" bis &";HEX$(i)
2660 PRINT:PRINT"Animationsablauf abspeichern";:GOSUB 3050
2670 IF t<>"J" THEN 2720
2680 PRINT:INPUT"Dateinamen (ohne .AND): ";t:IF t="" THEN 2720
2690 t=t+".AND"
2700 SAVE t,b,aniblk,i-aniblk
2720 CALL animate:GOTO 2740
2730 CALL animate+3,aniblk
2740 FOR i=1 TO 500/10:call &bd19:NEXT
2750 IF INKEY$="" THEN 2730
2760 CALL &BD19:CALL animate+6:GOSUB 3530
2770 RETURN
2780 REM
2790 REM *** Laden/Speichern ***
2800 REM
2810 CLOSEIN:CLOSEOUT:MODE 2:|DIR,"*.ANC":PRINT:PRINT t
2820 INPUT"Bitte Dateinamen eingeben (ohne.ANC): ";t:IF t<>"" THEN t=t+".ANC"
2830 RETURN
2840 REM Laden
2850 GOSUB 2810:IF t<>"" THEN ani=0:CALL anirech+12,t,datadr
2860 RETURN
2870 REM
2880 REM Speichern
2890 GOSUB 2810:IF t<>"" THEN ani=0:CALL anirech+15,t,datadr
2900 RETURN
2910 REM
2920 REM *** Loeschen ***
2930 CLS:RESTORE 3710:GOSUB 3610
2940 IF i=6 THEN RETURN
2950 IF i=5 THEN t[i]="alles"
2960 CLS:PRINT t[0]" "t[i]:PRINT
2970 GOSUB 3110:IF t<>"J" THEN 2930
2980 IF i=5 THEN FOR i=1 TO 4:GOSUB 3000:NEXT:GOTO 2930
2990 GOSUB 3000:GOTO 2930
3000 IF i=1 THEN POKE punkta,0 ELSE IF i=2 THEN POKE linea,0 ELSE IF i=3 THEN POKE ania,0:ani=0 ELSE IF i=4 THEN POKE aniblk+2,0:ani=0
3010 RETURN
3020 REM
3030 REM
3040 REM *** Proceduren ***
3050 t=" (J/N)"
3060 REM
3070 PRINT t"? ";
3080 t=UPPER$(INKEY$):IF t="" THEN 3080
3090 PRINT t
3100 RETURN
3110 PRINT"Wirklich";:GOSUB 3050:IF t<>"J" THEN t="N"
3120 RETURN
3130 PRINT"Erst":PRINT t;" definieren!";:CALL &BB18:RETURN
3140 REM
3150 i=0
3160 POKE @i,PEEK(a):POKE @i+1,PEEK(a+1)
3170 REM
3180 LOCATE x[x],y:PRINT i;
3190 RETURN
3200 REM
3210 x2=x:y2=y:IF i<>0 THEN GOSUB 3390:GOTO 3270
3220 GOSUB 3390
3230 t=INKEY$:i=ASC(t+CHR$(0))
3240 IF i=13 OR i=224 THEN i=3:GOSUB 3440:GOTO 3530
3250 IF (i>=48 AND i<=57) OR (i=45) THEN 3360
3260 i=0
3270 x2=x:y2=y
3280 IF INKEY(0)>-1 THEN y=y-1:IF y<1 THEN IF p<=0 THEN y=y+1 ELSE i=1:p=p-10:y=10:RETURN
3290 IF INKEY(2)>-1 OR i=2 THEN y=y+1:IF y>ye THEN IF p+10>ym THEN y=y-1 ELSE i=1:p=p+10:y=1:RETURN
3300 IF INKEY(8)>-1 THEN IF x>1 THEN x=x-1
3310 IF INKEY(1)>-1 THEN IF x<x[0] THEN x=x+1
3320 IF INKEY(21)>-1 THEN 3280
3330 FOR i=1 TO 100/10:call &bd19:NEXT
3340 GOTO 3220
3350 '
3360 IF PEEK(6)=&80 THEN POKE &B4E0,i ELSE POKE &B62A,i
3370 i=2:GOTO 3440
3380 '
3390 GOSUB 3430
3400 LOCATE x[x]-1,y:PRINT CHR$(1)+CHR$(9);
3410 RETURN
3420 REM
3430 IF x2=x AND y2=y THEN RETURN
3440 LOCATE x[x2]-1,y2:PRINT" ";
3450 RETURN
3460 REM
3470 WINDOW#2,5,35,22,24:CLS#2
3480 PRINT#2,"Zahl von "mi" bis "ma" :";
3490 WINDOW#3,5,35,23,24:CLS#3
3500 INPUT#3,i
3510 IF i<mi OR i>ma THEN 3490
3520 CLS#2
3530 WHILE INKEY$<>"":CALL &BD19:WEND
3540 RETURN
3550 REM
3560 MODE 1
3570 PRINT STRING$(40,35):WINDOW#1,1,2,2,4:PRINT#1,"######";:WINDOW#1,39,40,2,4:PRINT#1,"######";:LOCATE 12,3:PEN 3:PRINT"Animator (v3.2)":PEN 1:PRINT:PRINT STRING$(40,35)
3580 WINDOW 1,40,7,25
3590 RETURN
3600 REM
3610 WINDOW#2,10,30,10,22:CLS#2:PRINT#2,t[0]+":":PRINT#2
3620 READ ma:FOR i=1 TO ma:READ t[i]:PRINT#2,HEX$(i)+") "+t[i]:NEXT
3630 PRINT#2:PRINT#2,"Ihre Wahl : ";
3640 t=INKEY$:IF t="" THEN 3640
3650 IF t<"0" OR t>"9" THEN 3640
3660 i=VAL(t):IF i<1 OR i>ma THEN 3640
3670 PRINT#2,t:t=t[i]:RETURN
3680 REM
3690 REM
3700 DATA 7,Eingeben,Ausgeben,Animation,Laden,Speichern,Loeschen,Ende
3710 DATA 6,Punkte,Linien,Phasen,Ablauf,Automatik,Hauptmenue
3720 DATA 3,Einzelschritt,Setze Ablauf,zurueck
3730 REM
*/ });
