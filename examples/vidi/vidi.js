/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 ON z GOTO 260,370
110 'VIDI - Der Videofilmverwalter (v2.0)
120 'Marco Vieth, Juli 1988  (29.8.1989 / 17.7.1988)
130 '
140 IF PEEK(&30)=&C7 THEN SYMBOL AFTER 245:MEMORY &A5FF:|TAPE:OPENOUT"!S":MEMORY HIMEM-1:CLOSEOUT:|DISC:POKE &30,&F3
150 CLEAR
160 KEY 159,"goto 100"+CHR$(13):KEY DEF 68,0,159
170 DEFSTR a-f:DEFINT g-z
180 n=355
190 DIM f(n):'Filmarray
200 p=0:'Anz.Filme
205 anam=""
210 w=0:'Window
220 ON ERROR GOTO 2910
230 ON BREAK GOSUB 2740
240 ret=&AC18:IF PEEK(6)=&80 THEN ret=&AC32:'CPC 464
250 '
260 GOSUB 430
270 PRINT#1,"3Hauptmenue:   2( Filme:"p")3
280 PRINT"21)1  Filme auflisten"
290 ?:PRINT"22)1  Filme suchen"
300 ?:PRINT"23)1  Filme aendern"
310 ?:PRINT"24)1  Filme laden/speichern"
320 ?:PRINT"25)1  Filme sortieren"
330 ?:PRINT"26)1  Ausgabemedium"
340 ?:?:PRINT"27)1  Programm beenden"
345 ?:?
350 mi=1:ma=7:GOSUB 2350
360 IF m<7 THEN ON m GOSUB 490,780,1120,1530,1850,2070:GOTO 260
370 MODE 2
380 ?:?:PRINT"Bei Neustart des Programms ohne Datenverlust bitte"
390 ?:PRINT"die <TAB> - Taste druecken ..."
395 ?:?:?
400 z=1
410 END
420 '
430 MODE 1
440 PRINT TAB(7)"1VIDI - 2Der Videofilmverwalter"
450 PRINT TAB(19)"3Marco Vieth,1988"
460 WINDOW#1,5,35,4,4:WINDOW 5,35,7,25
470 RETURN
480 '
490 CLS#1:CLS
500 IF p=0 THEN 2410
510 PRINT#1,"Bereich angeben:"
520 PRINT"21)1  alle Filme"
530 ?:PRINT"22)1  Filmbereich"
540 ?:?:PRINT"23)1  Hauptmenue"
545 ?:?
550 mi=1:ma=3:GOSUB 2350
560 IF m=3 THEN RETURN
570 IF m=1 THEN x=1:y=p:GOTO 650
580 CLS
590 IF x<1 OR x>p THEN x=1
600 y=p
610 b="erste Position : "
620 h=x:mi=1:ma=p:GOSUB 2460:x=h
630 b="letzte Position : "
640 h=y:mi=x:ma=p:GOSUB 2460:y=h
650 GOSUB 670:GOSUB 730
660 GOSUB 430:GOTO 490
670 MODE 2
680 WINDOW 1,80,1,2
690 PRINT#w,"Nr.:  Cass.:   F  i  l  m  n  a  m  e  :        Art:      Anf.:  End.:  Laenge:"
700 WINDOW 1,80,3,25
710 RETURN
720 'Filme auflisten:
730 FOR i=x TO y:PRINT#w,f(i):IF VPOS(#0)>20 THEN PRINT:GOSUB 2430:CLS
740 NEXT
750 IF VPOS(#0)>1 THEN GOSUB 2430
760 RETURN
770 '
780 CLS#1:CLS
790 IF p=0 THEN 2410
800 a="Filme suchen :":b="Suchen durch Eingabe von:"
810 GOSUB 2230
820 IF m=8 THEN RETURN
830 CLS:d=""
840 ON m GOSUB 1040,1050,1060,1070,1080,1090,1100
850 GOSUB 670
860 '
870 h1=0
880 FOR i=1 TO p
890 b=MID$(f(i),mi,h)
900 IF m<3 OR m=7 THEN WHILE LEFT$(b,1)=" ":b=RIGHT$(b,LEN(b)-1):WEND
910 IF m=3 OR m=4 THEN IF INSTR(b,a)>0 THEN b=a
920 IF a=b THEN PRINT#w,f(i):h1=h1+1:IF VPOS(#0)>20 THEN PRINT:GOSUB 2430:CLS
930 NEXT
940 '
950 a="e":IF h1=1 THEN a=""
960 PRINT"";
970 PRINT#w,h1;"Film"+a+" gefunden.";
980 PRINT"";
990 IF w=8 THEN PRINT#8
1000 PRINT#w
1010 GOSUB 2430
1020 GOSUB 430:GOTO 780
1030 '
1040 mi=1:ma=3:b="Filmnummer :":h=3:GOTO 2550
1050 mi=7:ma=9:b="Kassettennummer :":h=3:GOTO 2550
1060 mi=16:ma=45:b="Filmname :":h=30:GOTO 2550
1070 mi=49:ma=55:b="Filmart :":h=7:GOTO 2550
1080 mi=59:ma=62:b="Bandzeit Anfang :":h=4:GOTO 2550
1090 mi=66:ma=69:b="Bandzeit Ende :":h=4:GOTO 2550
1100 mi=73:ma=75:b="Filmlaenge:":h=3:GOTO 2550
1110 '
1120 CLS:CLS#1
1130 PRINT#1,"Filme aendern :"
1140 PRINT"21)1  Film hinzufuegen"
1150 ?:?:PRINT"22)1  Film ueberschreiben"
1160 ?:?:PRINT"23)1  AFSS"
1170 ?:?:PRINT"    (Autom.FilmSuchSystem)"
1180 ?:?:PRINT"24)1  Hauptmenue"
1185 ?:?
1190 mi=1:ma=4:GOSUB 2350
1200 IF m=4 THEN RETURN
1210 '
1220 d="":CLS:CLS#1
1230 ON m GOSUB 1250,1280,1300
1240 GOTO 1120
1250 IF p>=n THEN CLS:?:PRINT"Maximal nur"n"Filme !":GOTO 2430
1260 h1=p+1:GOSUB 1340
1270 p=h1:RETURN
1280 mi=1:ma=p:h=p:b="Filmnummer :":GOSUB 2460:h1=h
1290 m=9:GOTO 1340
1300 '
1310 CLS:PRINT"Noch nicht eingebaut."
1320 GOSUB 2430
1330 RETURN
1340 CLS:CLS#1
1350 PRINT#1,"Film Nummer"h1
1360 a=STR$(h1):a=RIGHT$(a,LEN(a)-1)
1370 h=3:GOSUB 2650:c=a+"   "
1380 IF m=9 THEN IF LEFT$(f(h1),h)<>a THEN h1=1:WHILE LEFT$(f(h1),h)<>a AND h1<=p:h1=h1+1:WEND:PRINT"Film an Position"h1
1390 GOSUB 1050:GOSUB 2650:c=c+a+" "
1400 mi=11:ma=11:h=1:b="Kennbuchstabe :"
1410 GOSUB 2550:c=c+a+"    "
1420 GOSUB 1060:GOSUB 2670:c=c+a+"   "
1430 GOSUB 1070:GOSUB 2670:c=c+a+"   "
1440 GOSUB 1080:c=c+a+"   "
1450 GOSUB 1090:c=c+a+"   "
1460 'GOSUB 2620:GOSUB 8500:c=c+a
1470 f(h1)=c
1480 GOSUB 2700
1490 a=STR$(lg):a=RIGHT$(a,LEN(a)-1)
1500 h=3:GOSUB 2650:f(h1)=f(h1)+a
1510 RETURN
1520 '
1530 CLS:CLS#1
1540 PRINT#1,"Filme laden / speichern :"
1550 PRINT"21)1  Filme laden"
1560 ?:PRINT"22)1  Filme speichern"
1570 ?:?:PRINT"23)1  Hauptmenue"
1575 ?:?
1580 mi=1:ma=3:GOSUB 2350
1590 IF m=3 THEN RETURN
1595 mh=m
1600 IF mh=2 THEN IF p=0 THEN PRINT:GOSUB 2410:GOTO 1530 ELSE CLS:a=anam:IF a="V2000" OR a="VHS.FIL" THEN GOTO 1700 ELSE m=3:GOTO 1680
1610 CLS:CLS#1
1620 PRINT#1,"Filmgruppe zum Laden waehlen :"
1630 PRINT"21)1  V2000"
1635 ?:PRINT"22)1  VHS"
1640 ?:?:PRINT"23)1  eigene Filmgruppe"
1650 ?:?:PRINT"24)1  Hauptmenue"
1655 ?:?
1660 mi=1:ma=4:GOSUB 2350
1670 IF m=4 THEN RETURN
1675 CLS
1680 IF m=1 THEN a="V2000" ELSE IF m=2 THEN a="VHS" ELSE INPUT"Filename: ";a
1690 a=a+".FIL"
1700 PRINT a
1705 CLOSEIN:CLOSEOUT
1710 ON mh GOTO 1730,1800
1720 '
1730 OPENIN a
1740 p=1:anam=""
1750 WHILE NOT EOF:LINE INPUT#9,f(p):p=p+1:WEND
1760 p=p-1
1770 CLOSEIN
1775 anam=a
1780 RETURN
1790 '
1800 OPENOUT a
1810 FOR i=1 TO p:PRINT#9,f(i):NEXT
1820 CLOSEOUT
1830 RETURN
1840 '
1850 CLS:CLS#1
1860 IF p=0 THEN 2410
1870 a="Filme sortieren :":b="Sortieren nach:"
1880 GOSUB 2230
1890 IF m=8 THEN RETURN
1900 CLS:IF PEEK(&A600)<>254 THEN PRINT"VIDISORT nachladen ...":LOAD"!VIDISOR.BIN",&A600
1910 ON m GOSUB 1990,2000,2010,2020,2030,2040,2050
1920 POKE &A6A1,mi:POKE &A6A2,h
1930 ?:PRINT"Ich sortiere ...":?
1940 CALL &A600,f(1),f(p)
1950 IF m=1 THEN a="V2000" ELSE IF m=2 THEN a="VHS"
1960 PRINT"Schon erledigt ."
1970 GOTO 2430
1980 '
1990 mi=0:h=3:RETURN
2000 mi=6:h=5:RETURN
2010 mi=15:h=30:RETURN
2020 mi=48:h=7:RETURN
2030 mi=58:h=4:RETURN
2040 mi=65:h=4:RETURN
2050 mi=72:h=3:RETURN
2060 '
2070 CLS#1:CLS
2080 PRINT#1,"Ausgabemedium:
2090 PRINT"21)1  Bildschirm"
2100 ?:PRINT"22)1  Bildschirm schnell"
2110 ?:PRINT"23)1  Drucker"
2120 ?:PRINT"24)1  Hauptmenue"
2125 ?:?
2130 mi=1:ma=4:GOSUB 2350
2140 IF m=4 THEN RETURN
2150 IF m=3 THEN 2200
2160 w=0
2170 CALL &BB51
2180 IF m=2 THEN IF PEEK(&BEB0)=42 THEN CALL &BEB0 ELSE LOAD"!VIDIMD2.BIN",&BEB0:CALL &BEB0
2190 RETURN
2200 IF INP(&F500) AND 64 THEN CLS:PRINT"Drucker nicht bereit !":PRINT"Einschalten und":?:?"nochmal versuchen ...":GOSUB 2430:GOTO 2070
2210 w=8:RETURN
2220 '
2230 PRINT#1,a
2240 PRINT"2"b
2250 PRINT"21)1  Nummer"
2260 ?:PRINT"22)1  Kassette"
2270 ?:PRINT"23)1  Titel"
2280 ?:PRINT"24)1  Art"
2290 ?:PRINT"25)1  Bandzeit Anf."
2300 ?:PRINT"26)1  Bandzeit End."
2310 ?:PRINT"27)1  Laenge"
2320 ?:PRINT"28)1  Hauptmenue"
2325 ?:?
2330 mi=1:ma=8:GOTO 2350
2340 'Auswahl:
2350 PRINT"( Bitte waehlen ... )";
2360 a="":WHILE a="":a=INKEY$:WEND:IF a<"0"THEN a="0"
2370 m=VAL(a):IF m<mi THEN PRINT CHR$(13);"("m;" ist zu klein ! )";:CALL &BB18:PRINT CHR$(13);:GOTO 2350
2380 IF m>ma THEN PRINT CHR$(13);"(";m;" ist zu gross ! )";:CALL &BB18:PRINT CHR$(13);:GOTO 2350
2390 RETURN
2400 '
2410 PRINT"Leider keine Filme vorhanden !"
2420 '
2430 PRINT"(Bitte eine Taste druecken)";:CALL &BB18:PRINT CHR$(17);CHR$(13);
2440 RETURN
2450 'Zahl input:
2460 WINDOW#2,5,35,13,20:PAPER#2,0
2470 CLS#2:PRINT#2,b:PRINT#2,"( Eingabe : "mi"bis"ma" )"
2480 ?:PRINT#2,"Alter Wert: ";h
2490 INPUT#2,"Neuer Wert:  ",a
2500 IF a="" THEN RETURN
2510 h1=VAL(a)
2520 IF h1<mi THEN PRINT#2,"("h1" ist zu klein ! )";:CALL &BB18:GOTO 2470
2530 IF h1>ma THEN PRINT#2,"(";h1;" ist zu gross ! )";:CALL &BB18:GOTO 2470
2540 h=h1:RETURN
2550 IF m=9 THEN d=MID$(f(h1),mi,h)
2560 WINDOW#2,5,37,18,22:PAPER#2,0
2570 CLS#2:PRINT#2,b
2580 IF d<>"" THEN PRINT#2,"("d")"
2590 LOCATE#2,1,4:PRINT#2,"Eingabe ("h" stellig ) :"
2600 WINDOW#2,5,5+h,22,22
2610 PAPER#2,3:CLS#2:LINE INPUT#2,"",a
2620 PAPER#2,0
2630 IF a="" THEN a=d
2640 RETURN
2650 WHILE LEN(a)<h:a=" "+a:WEND
2660 RETURN
2670 WHILE LEN(a)<h:a=a+" ":WEND
2680 RETURN
2690 'Minuten berech.
2700 a1=MID$(f(h1),59,1):a2=MID$(f(h1),66,1):a3=MID$(f(h1),61,2):a4=MID$(f(h1),68,2)
2710 lg=(VAL(a2)-VAL(a1))*60-VAL(a3)+VAL(a4)
2720 RETURN
2730 'Break:
2740 LOCATE#7,1,25:PRINT#7,"E=ESCAPE M=MENUE N=NEUSTART ...";
2750 esc=INKEY$:IF esc="" THEN 2750
2760 esc=UPPER$(esc):z=0
2770 IF esc<>"E" THEN IF esc<>"M" THEN IF esc<>"N" THEN 2810
2780 POKE ret,&73:POKE ret+1,&1:'return an Adr &173:Zeile 1!!
2790 IF esc="N" THEN 2830
2800 IF esc="M" THEN z=1 ELSE z=2
2810 PRINT#7,CHR$(17);
2820 RETURN
2830 CLS:PRINT"Wirklich Neustart ?"
2840 PRINT"1) Ja"
2850 ?:PRINT"2) Nein"
2855 ?
2860 mi=1:ma=2:GOSUB 2350
2870 IF m=2 THEN z=1
2880 RETURN
2890 '
2900 'Errors:
2910 IF ERR=32 THEN 2940
2920 PRINT:PRINT"Fehler"ERR" in Zeile"ERL"!!"
2930 STOP
2940 PRINT"Disketten - ERROR !!"
2950 g=DERR AND &7F
2960 IF g=18 THEN PRINT"Datei existiert nicht !"
2970 IF g=20 THEN PRINT"Ihre Diskette ist voll!"
2980 GOSUB 2430
2990 RESUME 1530
*/ });
