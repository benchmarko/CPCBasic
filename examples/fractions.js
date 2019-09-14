/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
5  REM Fractions: Bruchrechnen
10 INK 1,24:INK 2,7:INK 3,13:GOTO 1000
100 REM Erweitern
105 p=2:l1=13:l2=2:t$="E R W E I T E R N :":GOSUB 1150
110 PEN 1:p=1:l1=3:l2=4:GOSUB 700
120 LOCATE 3,8:INPUT"Erweiterungsfaktor :";e
130 CLS:l1=6:l2=4:GOSUB 800:PRINT"   = eingegebener Bruch"
140 l2=8:l1=9+l:t$="Erweitert mit":GOSUB 1150:PRINT e
145 z=a:n=b:a=a*e:b=b*e:l2=12:l1=6:GOSUB 800
150 PRINT"   = erweiterter Bruch":GOTO 950
160 REM Kuerzen
165 p=2:l1=13:l2=2:t$="K U E R Z E N :":GOSUB 1150
170 PEN 1:p=1:l1=3:l2=4:GOSUB 700 : GOSUB 270
180 CLS:l1=6:l2=4:GOSUB 800:PRINT"   = eingegebener Bruch"
190 l2=8:l1=9+l:t$="gekuerzt durch":GOSUB 1150:PRINT ggt
200 a=z:b=n:l2=12:l1=6:GOSUB 800:PRINT"   = gekuerzter Bruch"
210 z=a:n=b:GOTO 950
270 GOSUB 850:z=a/ggt:n=b/ggt:RETURN
300 REM Brueche addieren
305 p=2:l1=9:l2=2:t$="Brueche addieren :":GOSUB 1150
310 GOSUB 430
320 a1=a1*(kgv/b1):a2=a2*(kgv/b2):b1=kgv:b2=kgv
330 z=a1+a2:n=kgv::GOTO 900
340 REM Brueche subtrahieren
350 p=2:l1=8:l2=2:t$="Brueche subtrahieren :":GOSUB 1150
360 GOSUB 430
370 a1=a1*(kgv/b1):a2=a2*(kgv/b2):b1=kgv:b2=kgv
380 z=a1-a2:n=kgv:GOTO 900
430 l1=6:l2=4:p=1:t$="1. Bruch:":GOSUB 1150:l1=3:l2=l2+2:GOSUB 700:a1=a:b1=b
440 l1=6:l2=l2+5:t$="2. Bruch:":GOSUB 1150:l1=3:l2=l2+3:GOSUB 700
450 a2=a:b2=b:a=b1:b=b2:GOSUB 850:IF t=3 THEN t$="+" ELSE IF t=4 THEN t$="-" ELSE IF t=5 THEN t$="*" ELSE IF t=6 THEN t$="/"
455 t$="3 "+t$+"1":CLS:l1=3:l2=4:a=a1:b=b1:GOSUB 800:PRINT t$;:l1=POS(#0):a=a2:b=b2:GOSUB 800:PRINT" ="
460 RETURN
500 REM Brueche multiplizieren
505 p=2:l1=7:l2=2:t$="Brueche multiplizieren :":GOSUB 1150
510 GOSUB 430
530 a=a1:b=b1:GOSUB 270:a1=z:b1=n:a=a2:b=b2:GOSUB 270:a2=z:b2=n
540 z=a1*a2:n=b1*b2:GOTO 900
600 REM Brueche dividieren
610 p=2:l1=10:l2=2:t$="Brueche dividieren :":GOSUB 1150
620 GOSUB 430
630 a=a1:b=b1:GOSUB 270:a1=z:b1=n:a=a2:b=b2:GOSUB 270:a2=z:b2=n
640 z=a1*b2::n=a2*b1:GOTO 900
700 REM Eingabe des Bruches
710 LOCATE l1,l2:INPUT"Wert des Zaehlers:";a
720 LOCATE l1,l2+2::INPUT"Wert des Nenners:";b
730 IF a<>ABS(a) OR b<>ABS(b) THEN LOCATE 5,25:PRINT"Keine Vorzeichen eingeben !!!":GOTO 710
740 RETURN
800 REM Ausgabe eines Buches
810 l=LEN(STR$(MAX(a,b)))-1:LOCATE l1,l2-1:PRINT a
815 LOCATE l1,l2-1:PRINT a
820 LOCATE l1+1,l2:FOR i=1 TO l:PRINT"-";:NEXT
830 LOCATE l1,l2+1:PRINT b:LOCATE l1+l+1,l2:RETURN
850 REM Berechnung ggT und kgV
860 z1=MAX(a,b):z2=MIN(a,b):h1=z1:h2=z2:r=3
870 r=z1-z2*INT(z1/z2):IF r>0 THEN z1=z2:z2=r:GOTO 870
880 ggt=z2:kgv=(h1*h2)/ggt
890 RETURN
900 REM Ausgabe bei den Rechenarten
910 l2=l2+4:a=a1:b=b1:l1=3:GOSUB 800:PRINT t$;:l1=POS(#0):a=a2:b=b2:GOSUB 800
920 PRINT" =":l2=l2+4:l1=3:a=z:b=n:GOSUB 800:PRINT" =";:l1=POS(#0)
930 GOSUB 270:a=z:b=n:l2=l2+4:l1=3:GOSUB 800:PRINT" [gekuerzt durch";ggt;"]"
950 REM Umrechnung
955 l2=l2+3:LOCATE 3,l2:PRINT USING"####.##";z/n;:PRINT" in Dezimalschreibweise"
960 l2=l2+2:LOCATE 6,l2:PRINT " Das sind";z/n*100;"%"
980 RETURN
1000 CLEAR:MODE 1:p=2:l1=15:l2=2:t$="M E N U E":GOSUB 1150
1010 p=1:l1=6:l2=5:t$="1)  Bruch erweitern":GOSUB 1150
1020 p=3:l2=l2+2:t$="2)  Bruch kuerzen":GOSUB 1150
1030 p=1:l2=l2+3:t$="3)  Brueche addieren":GOSUB 1150
1040 p=3:l2=l2+2:t$="4)  Brueche subtrahieren":GOSUB 1150
1050 p=1:l2=l2+2:t$="5)  Brueche multiplizieren":GOSUB 1150
1060 p=3:l2=l2+2:t$="6)  Brueche dividieren":GOSUB 1150
1070 p=2:l2=l2+2:t$="7)  Ende":GOSUB 1150:CALL &BB03
1080 p=3:l1=4:l2=24:t$="Bitte gewuenschtes waehlen...":GOSUB 1150
1090 t$="":t=0:WHILE t<1 OR t>7:t$=INKEY$:call &bd19:t=VAL(t$):WEND:CLS
1100 ON t GOSUB 100,160,300,340,500,600,1120
1110 CALL &BB18:GOTO 1000
1120 MODE 2:PRINT"Ende":END
1150 PEN p:LOCATE l1,l2:PRINT t$;:RETURN
*/ });
