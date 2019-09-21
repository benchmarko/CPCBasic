/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM Complex numbers (KOMPLEX)
20 REM Rechnen mit komplexen Zahlen
30 REM 8.4.1989
40 '
50 MODE 2
60 PRINT"Menue:"
70 PRINT:PRINT"1) Die 1.komplexe Zahl soll eingegeben werden"
80 PRINT:PRINT"2) eine  komplexe Zahl soll addiert werden"
90 PRINT:PRINT"3) eine  komplexe Zahl soll subtrahiert werden"
100 PRINT:PRINT"4) es soll mit einer komplexen Zahl multipliziert werden"
110 PRINT:PRINT"5) es soll durch eine komplexe Zahl dividiert werden"
120 PRINT:PRINT"6) Polarform und Normalform sollen umgerechnet werden"
130 PRINT:PRINT"7) die berechnete Zahl soll ausgegeben werden"
140 PRINT:PRINT"8) Ende"
150 t$=INKEY$:IF t$<"1" OR t$>"8" THEN call &bd19: goto 150
160 was=VAL(t$)
170 ON was GOSUB 300,400,400,500,600,700,1100,1200
180 GOTO 50
290 'Eingabe 1.Zahl:
300 GOSUB 1500:'Eingabe nach 2
320 x1=x2:y1=y2
330 RETURN
390 '+ und - :
400 GOSUB 1500:'Eingabe 2.Zahl
410 IF was=2 THEN x1=x1+x2:y1=y1+y2
420 IF was=3 THEN x1=x1-x2:y1=y1-y2
430 RETURN
490 '* :
500 GOSUB 1500:'Eingabe 2.Zahl
510 x3=x1*x2-y1*y2
520 y3=x1*y2+y1*x2
530 x1=x3:y1=y3
540 RETURN
590 '/ :
600 GOSUB 1500:'Eingabe 2.Zahl
620 x3=x1*x2+y1*y2
630 y3=-x1*y2+x2*y1
640 nenner=x2*x2+y2*y2
650 x1=x3/nenner:y1=y3/nenner
660 RETURN
690 'Polarform in Normalform:
700 CLS
710 PRINT"Bei einer Umrechnung von der Polarform in die Normalform muessen die Faktoren   der Normalform dem Programm bereits in x1 und y1 vorliegen."
720 PRINT:PRINT"Bei der umgekehrten Rechnung wird die berechnete Normalform nach x1 und y1      gespeichert.":PRINT
730 PRINT"Was soll umgerechnet werden ?"
740 PRINT:PRINT:PRINT"1) Normalform in Polarform"
750 PRINT:PRINT"2) Polarform in Normalform"
760 t$=INKEY$:IF t$<"1" OR t$>"2" THEN 760
770 was=VAL(t$)
780 IF was=1 THEN 900
790 'Umrechnung Polarform in Normalform
800 DEG
820 INPUT"Betrag :";betrag
830 PRINT:INPUT"Winkel : ";winkel
840 x1=betrag*COS(winkel)
850 y1=betrag*SIN(winkel)
860 GOSUB 1000:'Ausgabe
870 RETURN
890 'Umrechnung Normalform in Polarform
900 DEG
920 betrag=SQR(x1*x1+y1*y1)
930 winkel=ATN(y1/x1)
940 GOSUB 1000:'Ausgabe
950 RETURN
990 'Ausgabe der Umrechnungen:
1000 CLS
1010 PRINT"Realteil : ";x1,"Imaginaerteil : ";y1
1020 PRINT:PRINT"Betrag : ";betrag,"Phi : ";winkel;"grad"
1030 PRINT:PRINT"(Phi u.U. nicht richtig, da ATAN nicht eindeutig)"
1040 LOCATE 1,20:PRINT"Weiter mit beliebiger Taste..."
1050 CALL &BB18
1060 RETURN
1090 'Ausgabe einer komplexen Zahl:
1100 CLS
1110 PRINT"Realteil      : ";x1
1120 PRINT"Imaginaerteil : ";y1
1130 LOCATE 1,20:PRINT"Weiter mit beliebiger Taste..."
1140 CALL &BB18
1150 RETURN
1190 'Ende
1200 CLS
1210 PRINT"Auf Wiedersehen."
1220 END
1490 'Eingabe einer komplexen Zahl:
1500 CLS
1510 INPUT"Realteil      : ";x2
1520 INPUT"Imaginaerteil : ";y2
1530 RETURN
*/ });
