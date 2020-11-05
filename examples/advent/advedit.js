/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem advedit - Adventure Editor
2 rem by Marco Vieth, 1988
5 rem
100 REM Adventure Editor
110 'ueberarbeitet: 1./2.6.1988
120 '
130 CLEAR:MEMORY &9FFF:|TAPE:OPENOUT"!Dummy":MEMORY HIMEM-1:CLOSEOUT:|DISC:SPEED WRITE 1
140 MODE 1:CLEAR:DEFINT a-z:a=80:w=8:'Window Daten ausdrucken
150 DIM ra$(a),ob$(a),rn$(a),ob(a),ve$(a),m$(a),ac$(30,a),bc$(30,a),ad$(20),du(a,6),r$(6)
160 FOR i=1 TO 6:READ r$(i):NEXT
163 'FOR i=&A000 TO &A07C:READ s$:POKE i,VAL("&"+s$):NEXT:CALL &A000
170 ar=0:ao=0:av=0:am=0:af=0:i2=1:l3=1:m1$="       ADVENTURE EDITOR   Ver 2.0":m2$=m2$+"Was wuenschen Sie":m3$=STRING$(40,154):m4$=STRING$(40,32)
180 MODE 1:PRINT m1$:PRINT m3$
190 PRINT TAB(10)"1 - Daten ansehen"
200 PRINT TAB(10)"2 - Daten eingeben"
210 PRINT TAB(10)"3 - Daten aendern"
220 PRINT TAB(10)"4 - Startpositionen"
230 PRINT TAB(10)"5 - Raeume verbinden"
240 PRINT TAB(10)"6 - Daten ausdrucken"
250 PRINT TAB(10)"7 - Bedingungen & Aktionen"
260 PRINT TAB(10)"8 - Datentraeger"
270 PRINT TAB(10)"9 - Programmende"
280 PRINT:PRINT m3$
290 PRINT TAB(10);
300 mi=1:ma=9:GOSUB 2490
310 IF t=9 THEN CLS:t=2:GOSUB 1840:CLS:END
320 CLS
330 ON t GOSUB 1560,360,620,750,890,1700,1070,1840
340 GOTO 180
350 '
360 IF na$="" THEN GOSUB 2220:CLS
370 PRINT TAB(10)"D A T E N   eingeben:"
380 t$=" eingeben":GOSUB 2550
390 IF t=5 THEN RETURN
400 GOSUB 470:t1$=t1$+" eingeben "
410 CLS:l=1:WHILE l<>0
420 IF t=1 THEN z=ar ELSE IF t=2 THEN z=ao ELSE IF t=3 THEN z=av ELSE z=am
430 GOSUB 520
440 IF l<>0 THEN IF t=1 THEN ra$(z)=t$:ar=z ELSE IF t=2 THEN ob$(z)=t$:ao=z ELSE IF t=3 THEN ve$(z)=UPPER$(t$):av=z ELSE m$(z)=t$:am=z
450 WEND
460 WINDOW 1,40,1,25:CLS:GOTO 360
470 IF t=1 THEN t1$="Orte":t2$=" Raum Nr.:":t3$="Ich bin " ELSE IF t=2 THEN t1$="Objekte":t2$=" Obj. Nr.:":t3$="Ich sehe " ELSE IF t=3 THEN t1$="Verben":t2$=" Verb Nr.:":t3$="" ELSE t1$="Meldungen":t2$=" Meld Nr.:":t3$=""
480 CLS:LOCATE 1,1:PRINT t1$:PRINT m3$
490 WINDOW 1,40,3,25
500 RETURN
510 'Eingaben:
520 z=z+1
530 LOCATE#1,25,1:PRINT#1,t2$;z
540 IF t=1 THEN t$=ra$(z) ELSE IF t=2 THEN t$=ob$(z) ELSE IF t=3 THEN t$=ve$(z) ELSE t$=m$(z)
550 IF t$<>"" THEN PRINT t3$"  "t$
560 PRINT t3$;:LINE INPUT t$
570 l=LEN(t$)
580 IF l<>0 THEN IF t=2 THEN PRINT"
"SPC(11);rn$(z):INPUT"Rufname :";rn$(z):rn$(z)=UPPER$(rn$(z)):PRINT
590 PRINT:RETURN
600 '
610 'DATEN aendern:
620 PRINT TAB(10)"D A T E N  aendern:"
630 t$=" aendern":GOSUB 2550
640 IF t=5 THEN RETURN
650 GOSUB 470:t1$=t1$+" aendern "
660 PRINT"1."t2$;:INPUT z:z=z-1
670 IF t=1 THEN i1=ar ELSE IF t=2 THEN i1=ao ELSE IF t=3 THEN i1=av ELSE i1=am
680 CLS:l=1:WHILE l<>0 AND z<i1
690 GOSUB 520
700 IF l<>0 THEN IF t=1 THEN ra$(z)=t$ ELSE IF t=2 THEN ob$(z)=t$ ELSE IF t=3 THEN ve$(z)=UPPER$(t$) ELSE m$(z)=t$
710 WEND
720 WINDOW 1,40,1,25:CLS:GOTO 620
730 '
740 'Startpositionen:
750 WINDOW#1,1,40,19,25:WINDOW#2,1,40,1,18
760 lp=l3
770 ip=1:GOSUB 2300
780 FOR i=lp TO ao
790 CLS#1:PRINT#1,m3$"RETURN=weiter / E=Ende / W,Z=Liste"
800 PRINT#1,"
Objekt ";rn$(i);" in Raum Nr.("ob(i)")";
810 GOSUB 1010:IF t$="" THEN 840
820 IF t$="E" THEN i=ao:GOTO 840
830 IF t$>="0" THEN IF t$<="9" THEN ob(i)=t ELSE 790
840 lp=i+1
850 NEXT
860 RETURN:'HMen
870 '
880 'Raeume verbinden:
890 WINDOW#1,1,40,19,25:WINDOW#2,1,40,1,18
900 ip=1:GOSUB 2300
910 FOR r1=i2 TO ar
920 CLS#1:PRINT#1,m3$"RETURN=weiter / E=Ende / W,Z=Liste"
930 FOR i=1 TO 6
940 PRINT#1,"Raum"r1"fuehrt im "r$(i)" nach ("du(r1,i)") ";
950 GOSUB 1010:IF t$="" THEN 980
960 IF t$="E" THEN i=6:r1=ar:GOTO 980
970 IF t$>="0" THEN IF t$<="9" THEN du(r1,i)=t ELSE PRINT#1,CHR$(11);CHR$(18);:GOTO 940
980 NEXT:NEXT
990 RETURN:'HMen
1000 'Eingabe2:
1010 WINDOW SWAP 1,0:GOSUB 2420:WINDOW SWAP 1,0:t$=UPPER$(t$)
1020 IF t$="W" THEN IF ip+14<=ar THEN ip=ip+14:GOSUB 2300
1030 IF t$="Z" THEN IF ip-14>=1 THEN ip=ip-14:GOSUB 2300
1040 RETURN
1050 '
1060 'Bedingungen & Aktionen:
1070 nb=1:ip=1
1080 WINDOW#1,1,40,19,25:WINDOW#2,1,20,1,18:WINDOW#3,21,40,1,18
1090 '
1100 WHILE nb<=av
1110 GOSUB 2370
1120 CLS#1:PRINT#1,m3$
1130 PRINT#1," RETURN,0=weiter / E=Ende / W,Z=Liste
"
1140 PRINT#1,"Aktion auf Verb ";ve$(nb)
1150 INPUT#1,"und Objekt Nr.";t$
1160 t$=UPPER$(t$):ob=VAL(t$)
1170 IF t$="E" THEN nb=av+1:GOTO 1530
1180 IF t$="W" THEN IF ip+34<=ao THEN ip=ip+34:GOTO 1530
1190 IF t$="Z" THEN IF ip-34>=1 THEN ip=ip-34:GOTO 1530
1200 IF ob=0 THEN IF t$="" OR t$="0" THEN nb=nb+1:GOTO 1530 ELSE 1120
1210 CLS
1220 PRINT"Bitte Bedingung fuer die Aktion ":PRINT ve$(nb);" ";rn$(ob);" eingeben"
1230 PRINT m3$
1240 PRINT TAB(5)" R  - Objekt ist im Raum
"
1250 PRINT TAB(5)" I  - Objekt ist im Inventory
"
1260 PRINT TAB(5)" N  - Objekt ist nicht im Raum/INV
"
1270 PRINT TAB(5)" Axx- Objekt xx ist im INV
"
1280 PRINT TAB(5)" Sxx- Spieler ist im Raum xx
"
1290 PRINT TAB(5)" Bxx- Objekt xx ist nicht im INV
"
1300 PRINT TAB(5)" Fxx- Flag xx ist gesetzt
"
1310 PRINT TAB(5)" Gxx- Flag xx ist geloescht"
1320 LOCATE 1,21:PRINT m3$;:PRINT"Alter Code ===> ";bc$(nb,ob):PRINT
1330 INPUT"Bedingung ";t$
1340 IF t$<>"" THEN bc$(nb,ob)=UPPER$(t$)
1350 CLS:PRINT ve$(nb);" ";ob$(ob);" bewirkt, wenn:"
1360 PRINT bc$(nb,ob);" erfuellt, folgende Aktion:":PRINT m3$;
1370 PRINT TAB(5)"V  - ";rn$(ob);" verschwindet"
1380 PRINT TAB(5)"I  - ";rn$(ob);" kommt ins INV
"
1390 PRINT TAB(5)"Axx- Objekt xx kommt in den Raum"
1400 PRINT TAB(5)"Bxx- Objekt xx verschwindet
"
1410 PRINT TAB(5)"Nxx- Objekt xx erscheint neu"
1420 PRINT TAB(5)"Dxy- Durchgang nach Raum xx"
1430 PRINT TAB(5)"Sxx- Spieler nach Raum xx
"
1440 PRINT TAB(5)"Fxx- Flag xx setzen"
1450 PRINT TAB(5)"Lxx- Flag xx loeschen
"
1460 PRINT TAB(5)"Mxx- Meldung xx ausgeben
"
1470 PRINT TAB(5)"T  - Spieler stirbt"
1480 PRINT TAB(5)"E  - Ende, da gewonnen"
1490 PRINT m3$;
1500 PRINT"Alter Code ===> ";ac$(nb,ob)
1510 INPUT"Aktion ";t$
1520 IF t$<>"" THEN ac$(nb,ob)=UPPER$(t$)
1530 WEND
1540 RETURN:'HMen
1550 '
1560 CLS:PRINT"Kenndaten des Adventures ";na$
1570 PRINT m3$:PRINT
1580 PRINT" Raeume: ";ar
1590 PRINT" Objekte:";ao
1600 PRINT" Verben: ";av:'PRINT" Beding: ";nb (falsch)
1610 PRINT" Mittlg.:";am
1620 IF lo THEN PRINT" ";af;"benutzte Flags"
1630 PRINT m3$
1640 PRINT"Spielbeginn im Raum:         ";sp
1650 PRINT"
erforderliche Eingabelaenge: ";wl
1660 CALL &BB18
1670 RETURN:'HMen
1680 '
1690 'ausdrucken
1700 PRINT TAB(10)"DATEN DRUCKEN:"
1710 t$=" drucken":GOSUB 2550
1720 IF t=5 THEN RETURN
1730 MODE 2
1740 PRINT#w,"Adventurename :  ";na$;"   ";ve$
1750 PRINT#w,"Produced by   :  ";cr$
1760 PRINT#w:PRINT#w
1770 ON t GOSUB 1790,1800,1810,1820
1780 CALL &BB18:MODE 1:GOTO 1700
1790 FOR i=1 TO ar STEP 2:PRINT#w,ra$(i);TAB(40);ra$(i+1):NEXT:RETURN
1800 FOR i=1 TO ao STEP 2:PRINT#w,ob$(i);" = ";rn$(i);TAB(40);ob$(i+1);" = ";rn$(i+1):NEXT:RETURN
1810 FOR i=1 TO av:PRINT#w,USING"\                  \";ve$(i);:NEXT:RETURN
1820 FOR i=1 TO am STEP 2:PRINT#w,m$(i);TAB(40);m$(i+1):NEXT:RETURN
1830 'Laden/Speichern:
1840 PRINT TAB(10)"DATENTRAEGER:"
1850 PRINT m3$
1860 PRINT TAB(10)"1) Adventure laden
"
1870 PRINT TAB(10)"2) Adventure speichern
"
1880 PRINT TAB(10)"3) Menue
"m3$
1890 PRINT TAB(10);
1900 mi=1:ma=3:GOSUB 2490
1910 IF t=3 THEN RETURN:'HMen
1915 if t=1 then |DIR, "*.ADV"
1920 INPUT"
Filename (ohne .ADV): ";n$
1930 PRINT"

Bitte warten.
":ON t GOTO 2070,1940
1940 PRINT"Speicherung laeuft ..."
1950 OPENOUT n$+".ADV"
1960 PRINT#9,na$:PRINT#9,ve$:PRINT#9,cr$:PRINT#9,wl
1970 PRINT#9,ar:PRINT#9,ao:PRINT#9,av:PRINT#9,am:PRINT#9,sp:PRINT#9,af
1980 FOR i=1 TO ar:PRINT#9,ra$(i):NEXT
1990 FOR i=1 TO ao:PRINT#9,ob$(i):PRINT#9,rn$(i):PRINT#9,ob(i):NEXT
2000 FOR i=1 TO av:PRINT#9,ve$(i):NEXT
2010 FOR i=1 TO am:PRINT#9,m$(i):NEXT
2020 FOR x=1 TO ar:FOR y=1 TO 6:PRINT#9,du(x,y):NEXT:NEXT
2030 FOR x=1 TO av:FOR y=1 TO ao:PRINT#9,bc$(x,y):NEXT:NEXT
2040 FOR x=1 TO av:FOR y=1 TO ao:PRINT#9,ac$(x,y):NEXT:NEXT
2050 CLOSEOUT
2060 RETURN:'HMen
2070 PRINT"Daten werden geladen ..."
2080 OPENIN n$+".ADV"
2090 INPUT#9,na$:INPUT#9,ve$:INPUT#9,cr$:INPUT#9,wl
2100 INPUT#9,ar:INPUT#9,ao:INPUT#9,av:INPUT#9,am:INPUT#9,sp:INPUT#9,af
2110 FOR i=1 TO ar:INPUT#9,ra$(i):NEXT
2120 FOR i=1 TO ao:INPUT#9,ob$(i):INPUT#9,rn$(i):INPUT#9,ob(i):NEXT
2130 FOR i=1 TO av:INPUT#9,ve$(i):NEXT
2140 FOR i=1 TO am:INPUT#9,m$(i):NEXT
2150 FOR x=1 TO ar:FOR y=1 TO 6:INPUT#9,du(x,y):NEXT:NEXT
2160 FOR x=1 TO av:FOR y=1 TO ao:INPUT#9,bc$(x,y):NEXT:NEXT
2170 FOR x=1 TO av:FOR y=1 TO ao:INPUT#9,ac$(x,y):NEXT:NEXT
2180 CLOSEIN
2190 RETURN:'Hmen
2200 '
2210 'Angaben:
2220 CLS:PRINT m1$:PRINT m3$;
2230 INPUT"

Wie heisst Ihr Adventure ";na$:INPUT"
Version Nr. ";ve$:na$=UPPER$(na$)
2240 INPUT "
Copyright - Vermerk ";cr$:PRINT
2250 INPUT"

Wortlaenge";wl
2260 INPUT"
Startraum ";sp
2270 INPUT"
Anzahl Flags";af
2280 RETURN
2290 'Raeume zeigen:
2300 CLS#2:PRINT#2,"Liste der moeglichen Raeume:":PRINT#2,m3$
2310 i1=ip:WHILE i1<ar AND VPOS(#2)<18
2320 PRINT#2,USING"###";i1;:PRINT#2,"  "ra$(i1)
2330 IF POS(#0)+LEN(ra$(i1+1))>38 THEN PRINT
2340 i1=i1+1:WEND
2350 RETURN
2360 'Objekte zeigen:
2370 CLS#2:CLS#3
2380 i=ip:WHILE i<=ao AND VPOS(#2)<18:PRINT#2,USING"###";i;:PRINT#2," ";rn$(i):i=i+1:WEND
2390 WHILE i<=ao AND VPOS(#3)<18:PRINT#3,USING"###";i;:PRINT#3," ";rn$(i):i=i+1:WEND
2400 RETURN
2410 'Texteingabe:
2420 INPUT t$:t=VAL(t$):l=LEN(t$)
2430 RETURN
2440 'Zeicheneingabe:
2450 t$=INKEY$:IF t$="" THEN 2450
2460 t$=UPPER$(t$):t=VAL(t$):l=LEN(t$)
2470 RETURN
2480 'Zahleneingabe:
2490 PRINT"Bitte waehlen : ";
2500 GOSUB 2450:IF t<mi OR t>ma THEN 2500
2510 PRINT t
2520 RETURN
2530 '
2540 'Nebenmenue:
2550 PRINT m3$
2560 PRINT TAB(10)"1)  Orte"+t$
2570 PRINT:PRINT TAB(10)"2)  Objekte"+t$
2580 PRINT:PRINT TAB(10)"3)  Verben"+t$
2590 PRINT:PRINT TAB(10)"4)  Meldungen"+t$
2600 PRINT:PRINT TAB(10)"5)  Hauptmenue"
2610 PRINT:PRINT m3$
2620 PRINT TAB(10);
2630 mi=1:ma=5:GOTO 2490:'+RETURN
2640 '
2650 'Richtungen:
2660 DATA Norden,Sueden,Westen,Osten,"Oben","Unten"
2670 'Daten fuer MODE1 fast
2680 'DATA 21,28,A0,22,D4,BD,21,C4,B7,11,2F,B7,3A,39,B9,FE,F3,CC,21,A0,ED,53,55,A0,22,3A,A0,23,23,22,42,A0,C9,21,C9,B1,11,8F,B2,C9,4F,44,16,00,62,5D,29,29,19,29,29,29,29,58,19,19,ED,5B,00,00,19,7C,E6,07,67,3A,00,00,84,67,EB,69,26,00,4C,29
2690 'DATA 29,29,06,38,09,DD,2E,08,3A,00,00,DD,67,01,88,02,D5,E5,6E,60,AF,CB,05,30,01,B1,CB,09,30,F7,DD,A4,12,13,10,F0,44,E1,23,D1,7A,C6,08,57,DD,2D,20,E0,C9
*/ });
