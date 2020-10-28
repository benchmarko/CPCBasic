/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem advint - Adventure Interpreter
2 rem by Marco Vieth, 1988
5 rem
100 REM Adventure Interpreter
110 'ueberarbeitet: 1.6.1988
120 '
130 MODE 1:INK 1,24:INK 0,1:BORDER 1:PEN 1:PAPER 0
140 'IF PEEK(&A200)<>223 THEN MEMORY &A200-1:LOAD"!FILL464.BIN":'Fill:call &a200,farb
150 CLEAR:DEFINT a-z:CLOSEIN:CLOSEOUT
160 |TAPE:OPENOUT"!a":MEMORY HIMEM-1:closeout:|DISC
170 MODE 1
172 |DIR, "*.ADV"
173 INPUT"Adventurename (ohne .ADV):";n$
175 PRINT"Bitte warten ..."
180 CLOSEIN:OPENIN n$+".ADV"
190 INPUT #9,na$:INPUT #9,ve$:INPUT #9,cr$:INPUT #9,wl
200 INPUT #9,ar:INPUT #9,ao:INPUT #9,av:INPUT #9,am:INPUT #9,sp:INPUT #9,af
210 DIM ra$(ar),ob$(ao),rn$(ao),ob(ao),o(ao),ve$(av),vel$(av),ms$(am),du(ar,6),d(ar,6),bc$(av,ao),ac$(av,ao),fl(af)
220 FOR i=1 TO ar:INPUT #9,ra$(i):NEXT
230 FOR i=1 TO ao:INPUT #9,ob$(i):INPUT #9,rn$(i):rn$(i)=LEFT$(rn$(i),wl):INPUT #9,ob(i):o(i)=ob(i):NEXT
240 FOR i=1 TO av:INPUT#9,vel$(i):ve$(i)=LEFT$(vel$(i),wl):NEXT
250 FOR i=1 TO am:INPUT#9,ms$(i):NEXT
260 FOR x=1 TO ar:FOR y=1 TO 6:INPUT#9,du(x,y):d(x,y)=du(x,y):NEXT:NEXT
270 FOR x=1 TO av:FOR y=1 TO ao:INPUT#9,bc$(x,y):NEXT:NEXT
280 FOR x=1 TO av:FOR y=1 TO ao:INPUT#9,ac$(x,y):NEXT:NEXT
290 sspp=sp
300 CLOSEIN
301 x=av:IF av>9 THEN x=9
302 FOR i=1 TO x:KEY i,vel$(i)+" ":NEXT
310 MODE 1:RESTORE
320 spieler=0:xa=0
330 INK 0,11:INK 1,0:INK 2,13:INK 3,9:BORDER 11
340 CLS:LOCATE 30-LEN(na$)/2,2:PRINT na$:LOCATE 26,4:PRINT"PRODUCED":LOCATE 29,6:PRINT"BY":LOCATE 30-LEN(cr$)/2,8:PRINT cr$;
350 ORIGIN 0,256,0,280,256,398:CLG 1
360 WINDOW #1,1,40,10,18
370 WINDOW #0,1,40,20,25
380 PAPER #1,0:CLS#1
390 PAPER #0,0:CLS
400 PEN#0,1:PEN#1,1
410 CLS:CLS#1
420 x=0:er=0:imax=0:xx=0
430 PRINT ""
440 DATA Norden,Sueden,Westen,Osten,Oben,Unten
450 FOR i=1 TO 6
460 READ ri$(i)
470 NEXT i
480 GOSUB 2460
490 PRINT"":CLG 0:GOSUB 2640:GOTO 510
500 IF sp<>spieler THEN PRINT"":CLG 0:GOSUB 2640:'GRAFIK
510 LOCATE #1,1,1:PRINT#1,""
520 PRINT #1,"Ich bin ";
530 PRINT #1,ra$(sp)
540 PRINT #1,"Ich sehe ";:ge=0
550 FOR i=1 TO ao
560 IF ob(i)<>sp THEN 590
570 IF POS(#1)+LEN(ob$(i))+2<40 THEN PRINT #1,ob$(i);", ";:ge=-1:GOTO 590
580 IF POS(#1)+LEN(ob$(i))+2>=40 THEN PRINT #1,"":GOTO 570
590 NEXT i:IF NOT ge THEN PRINT #1,"nichts besonderes  ";
600 PRINT #1,"."
610 PRINT #1,"
Ich kann nach ";
620 FOR ri=1 TO 6
630 IF du(sp,ri)=0 THEN 680
640 IF POS(#1)=15 THEN PRINT #1,ri$(ri);:GOTO 680
650 IF POS(#1)+LEN(ri$(ri))<38 THEN PRINT #1,", ";ri$(ri);:GOTO 680
660 IF POS(#1)+LEN(ri$(ri))>=38 THEN PRINT #1,", ":PRINT #1,ri$(ri);:GOTO 680
670 IF POS(#1)<17 AND POS(#1)>3 THEN PRINT #1,", ";ri$(ri);
680 NEXT ri
690 PRINT #1,"."
700 INPUT "
Was soll ich tun ";eg$:IF eg$="" THEN PRINT"":GOTO 700
710 eg$=UPPER$(eg$):PRINT
720 spieler=sp
730 ln=LEN(eg$):IF ln>2 THEN 770
740 FOR i=1 TO 6:IF eg$=LEFT$(UPPER$(ri$(i)),ln) THEN IF du(sp,i)<>0 THEN sp=du(sp,i):PRINT "O.K.":GOTO 500
750 NEXT
760 PRINT "Dahin fuehrt kein Weg !":GOTO 500
770 e3$=LEFT$(eg$,3):e4$=LEFT$(eg$,4)
780 IF e3$<>"INV" THEN 850
790 PRINT "Ich trage folgendes mit mir:"
800 FOR i=1 TO ao
810 IF ob(i)=-1 THEN PRINT ob$(i)
820 NEXT i
830 a$=INKEY$:IF a$="" THEN 830
840 GOTO 500
850 IF e4$<>"HILF" THEN 880
860 GOSUB 2500
870 GOTO 500
880 IF e4$<>"FICK" THEN 910
890 IF xa<2 THEN PRINT"Geh lieber zum Psychater!":xa=xa+1:GOTO 500
900 PRINT"Mit solchen Leiten wie dich spiele ich  nicht ...":FOR i=1 TO 1000:NEXT:CALL 0
910 IF e4$<>"STOP" THEN 1000
920 PRINT"Spielstand abspeichern (J/N)?":GOSUB 2330
930 IF aa$="J" THEN qq=-1:GOTO 1020
940 PRINT"Wollen Sie noch einmal spielen (J/N)?":GOSUB 2330
950 IF aa$="J" THEN 970
960 END
970 IF ww THEN 2350
980 PRINT"Wollen Sie neu anfangen (J/N)?":GOSUB 2330
990 IF aa$="J" THEN 2350 ELSE 500
1000 IF e4$<>"SAVE" THEN 1160
1010 qq=0
1020 PRINT"";SPC(10)"*Spielstand speichern*"
1030 INPUT"

Unter welchem Namen ";eg$
1040 IF LEN(eg$) >16 THEN 1020
1050 PRINT"

File ";eg$;" wird abgespeichert..."
1060 SPEED WRITE 1:OPENOUT eg$
1070 PRINT #9,na$:PRINT #9,sp:PRINT #9,fl:PRINT #9,imax
1080 FOR i=1 TO ao:PRINT #9,ob(i):NEXT
1090 FOR ra=1 TO ar:FOR ri=1 TO 6:PRINT#9,du(ra,ri):NEXT:NEXT
1100 FOR i=1 TO af:PRINT #9,fl(i):NEXT i
1110 CLOSEOUT:PRINT ""
1120 IF qq THEN 940
1130 PRINT"Wollen Sie weiterspielen (J/N)"
1140 GOSUB 2330
1150 IF aa$="J" THEN 500 ELSE 960
1160 IF e4$<>"LOAD" THEN 1280
1170 PRINT"";SPC(10);"*Spielstand laden*"
1180 INPUT"

Welches Spiel";eg$
1190 IF LEN(eg$)>16 THEN 1170
1200 eg$=UPPER$(eg$)
1210 PRINT"

File ";eg$;" wird geladen..."
1220 OPENIN eg$
1230 INPUT #9,na$:INPUT #9,sp:INPUT #9,fl:INPUT #9,imax
1240 FOR i=1 TO ao:INPUT #9,ob(i):NEXT
1250 FOR ra=1 TO ar:FOR ri=1 TO 6:INPUT#9,du(ra,ri):NEXT:NEXT
1260 FOR i=1 TO af:INPUT #9,fl(i):NEXT
1270 CLOSEIN:PRINT "":GOTO 500
1280 FOR el=1 TO ln
1290 te$=MID$(eg$,el,1)
1300 IF te$<>" " THEN NEXT el
1310 ev$=LEFT$(eg$,wl)
1320 rl=ln-el
1330 IF rl<0 THEN 1350
1340 eo$=RIGHT$(eg$,rl)
1350 vn=0:FOR ii=1 TO av
1360 IF ev$=ve$(ii) THEN vn=ii:ii=av
1370 NEXT ii
1380 IF vn=0 THEN PRINT"Das VERB verstehe ich nicht.":GOTO 500
1390 n=0:ii=1
1395 IF (ob(ii)=sp OR ob(ii)=-1) THEN IF INSTR(eo$,rn$(ii))<>0 THEN n=ii:GOTO 1430
1410 ii=ii+1:IF ii<=ao THEN 1395
1420 n=0:ii=1
1422 IF INSTR(eo$,rn$(ii))<>0 THEN n=ii:GOTO 1426
1424 ii=ii+1:IF ii<=ao THEN 1422
1426 IF n=0 THEN PRINT"Das OBJEKT verstehe ich nicht." ELSE PRINT rn$(n)+" sehe ich nicht."
1427 GOTO 500
1430 IF xx THEN ERASE bd$,ad$
1440 DIM bd$(LEN(bc$(vn,n))),ad$(LEN(ac$(vn,n)))
1450 FOR ab=1 TO LEN(bc$(vn,n))
1460 bd$(ab)=MID$(bc$(vn,n),ab,1)
1470 NEXT ab
1480 FOR aa= 1 TO LEN(ac$(vn,n))
1490 ad$(aa)=MID$(ac$(vn,n),aa,1)
1500 NEXT aa
1510 xx=-1
1520 ab=ab-1:aa=aa-1
1530 x=0:er=0:zz=0
1540 x=x+1
1550 IF x=ab+1 THEN zz=-1:GOTO 1800
1560 er=0:zz=0
1570 IF bd$(x)<>"R" THEN 1590
1580 IF ob(n)=sp THEN er=-1:GOTO 1800
1590 IF bd$(x)<>"I" THEN 1610
1600 IF ob(n)=-1 THEN er=-1: GOTO 1800
1610 IF bd$(x)<>"N" THEN 1630
1620 IF (ob(n)<>sp AND ob(n)<>-1) THEN er=-1:GOTO 1800
1630 IF bd$(x)<>"A" THEN 1650
1640 r1$=bd$(x+1)+bd$(x+2):x=x+2:IF ob(VAL(r1$))=-1 THEN er=-1:GOTO 1800
1650 IF bd$(x)<>"S" THEN 1670
1660 r1$=bd$(x+1)+bd$(x+2):x=x+2:IF sp=VAL(r1$) THEN er=-1:GOTO 1800
1670 IF bd$(x)<>"B" THEN 1690
1680 r1$=bd$(x+1)+bd$(x+2):x=x+2:IF ob(VAL(r1$))<>-1 THEN er=-1:GOTO 1800
1690 IF bd$(x)<>"F" THEN 1740
1700 GOSUB 2220
1710 IF fl(pa) THEN 1730
1720 GOTO 1800
1730 er=-1:GOTO 1800
1740 IF bd$(x)<>"G" THEN 1800
1750 GOSUB 2220
1760 IF NOT fl(pa) THEN 1780
1770 GOTO 1800
1780 er=-1:GOTO 1800
1790 GOTO 1540
1800 IF NOT er THEN PRINT"Das geht im Moment nicht.":GOTO 500
1810 IF NOT zz THEN 1540
1820 x=0:er=0
1830 x=x+1
1840 IF x>aa THEN 500
1850 IF ad$(x)<>"V" THEN 1870
1860 ob(n)=0:GOTO 1830
1870 IF ad$(x)<>"I" THEN 1910
1880 IF imax=9 THEN 2280
1890 ob(n)=-1
1900 imax=imax+1:GOTO 1830
1910 IF ad$(x)<>"N" THEN 1930
1920 GOSUB 2210:ob(pa)=sp:GOTO 1830
1930 IF ad$(x)<>"A" THEN 1960
1940 GOSUB 2210:ob(pa)=sp
1950 imax=imax-1:GOSUB 2310:GOTO 1830
1960 IF ad$(x)<>"B" THEN 1980
1970 GOSUB 2210:GOSUB 2300:ob(pa)=0:GOTO 1830
1980 IF ad$(x)<>"F" THEN 2000
1990 GOSUB 2210:fl(pa)=-1:GOTO 1830
2000 IF ad$(x)<>"S" THEN 2030
2010 GOSUB 2210:sp=pa
2020 GOTO 1830
2030 IF ad$(x)<>"L" THEN 2050
2040 GOSUB 2210:fl(pa)=0:GOTO 1830
2050 IF ad$(x)<>"M" THEN 2070
2060 GOSUB 2210:PRINT ms$(pa):GOTO 1830
2070 IF ad$(x)<>"E" THEN 2090
2080 GOTO 2250
2090 IF ad$(x)<>"T" THEN 2110
2100 ww=-1:GOTO 940
2110 IF ad$(x)<>"D" THEN 1830
2120 GOSUB 2240
2130 du(sp,p1)=p2
2140 IF p1=1 THEN p3=2
2150 IF p1=2 THEN p3=1
2160 IF p1=3 THEN p3=4
2170 IF p1=4 THEN p3=3
2180 IF p1=5 THEN p3=6
2190 IF p1=6 THEN p3=5
2200 du(p2,p3)=sp:GOTO 1830
2210 r2$=ad$(x+1)+ad$(x+2):x=x+2:pa=VAL(r2$):RETURN
2220 r2$=bd$(x+1)+bd$(x+2):x=x+2:pa=VAL(r2$):RETURN
2230 r2$=ad$(x+1):x=x+1:pa=VAL(r2$):RETURN
2240 r2$=ad$(x+1)+ad$(x+2):p2=VAL(r2$):p1=VAL(ad$(x+3)):x=x+3:RETURN
2250 PRINT "HERZLICHEN GLUECKWUNSCH !"
2260 PRINT "

SIE HABEN ES GESCHAFFT !"
2270 END
2280 PRINT "Ich kann nicht mehr tragen"
2290 GOTO 1830
2300 IF ob(pa)=-1 THEN imax=imax-1
2310 IF imax<0 THEN imax=0
2320 RETURN
2330 aa$=INKEY$:IF aa$="" THEN 2330
2340 aa$=UPPER$(aa$):RETURN
2350 sp=sspp
2360 FOR i=1 TO ao
2370 ob(i)=o(i)
2380 NEXT i
2390 FOR x=1 TO ar:FOR y=1 TO 6
2400 du(x,y)=d(x,y)
2410 NEXT y:NEXT x
2420 FOR i=1 TO af:fl(i)=0:NEXT i
2430 spieler=0
2440 xa=0
2450 ERASE ri$:RESTORE:GOTO 430
2460 PRINT "Wollen Sie ein abgespeichertes Spiel    spielen (J/N)?"
2470 GOSUB 2330
2480 IF aa$="J" THEN 1170 ELSE 490
2490 'Hilfe:
2500 CLS:PRINT"Ich kenne folgende Kommandos:":PRINT
2510 PRINT"HILF / FICK / STOP / SAVE"
2520 PRINT"
(Kollision: OS=Osten / OB=Oben)"
2530 GOSUB 2610
2540 CLS:PRINT"und folgende VERBEN ..."
2550 FOR i=1 TO av:PRINT ve$(i)"  =  "vel$(i),:IF i<10 THEN PRINT" <F"+HEX$(i)+">" ELSE PRINT
2560 IF VPOS(#0)>5 THEN GOSUB 2610
2570 NEXT
2580 IF VPOS(#0)>1 THEN GOSUB 2610
2590 RETURN
2600 'Auf Taste warten ..."
2610 PRINT"( Weiter : TASTE druecken ... )"
2620 CALL &BB18:CLS:RETURN
2630 'Grafik:
2640 PLOT 0,0:DRAW 280,0:DRAW 280,142:DRAW 0,142:DRAW 0,0
2650 RETURN
*/ });
