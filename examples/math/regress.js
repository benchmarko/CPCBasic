/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 REM regress - Regression (Ausgleich)
2 REM
100 REM Programm Ausgleich + Polanpass 1.0
110 REM 8.4.1989
120 '
130 dimen=100
140 DIM x(dimen),y(dimen)
145 DIM a1(5)
150 MODE 2
160 PRINT"Menue zur Ausgleichsrechnung (Regression) :"
165 PRINT"(Funktionalen Zusammenhang von Messwerten ermitteln)"
170 PRINT:PRINT"1) Gerade (lineare R.) y=a + b*x"
180 PRINT:PRINT"2) Exponentialfunktion y=a*exp(b*x)"
190 PRINT:PRINT"3) Logarithmusfunktion y=a + b*log(x)"
200 PRINT:PRINT"4) Potenzfunktion      y=a+x^b (a>0)"
205 PRINT:PRINT"5) Polynomanpassung    y=a*x^n+b*x^(n-1)"
210 PRINT:PRINT"6) Messwerte eingeben"
220 PRINT:PRINT"7) Messwerte loeschen"
230 PRINT:PRINT"8) Regression erzeugt Depression"
240 t$=INKEY$:IF t$<"1" OR t$>"8" THEN 240
250 was=VAL(t$)
251 IF anzahl<1 AND was<=5 THEN CLS:PRINT"Bitte erst Messwerte eingeben.":GOSUB 790:GOTO 150
255 sum1=0:sum2=0:sum3=0:sum4=0
256 anpass=-1
260 ON was GOSUB 400,600,1000,1300,10000,1700,3000,1600
270 IF (was>5) OR (anpass=0) THEN 150
272 GOSUB 2500:'Guetekriterien
274 GOSUB 2000:'Ausgabe
280 CLS:PRINT"Soll die ermittelte Gleichung fuer Interpolation verwendet werden  (J/N) :"
290 t$=UPPER$(INKEY$):IF t$<>"J" AND t$<>"N" THEN 290
300 IF t$="N" THEN 150
310 PRINT"Beenden der Interpolationsrechnung durch Eingabe von 333.33"
320 PRINT:PRINT"x : ";:INPUT x
330 IF x=333.33 THEN 150
340 IF was=1 THEN y=a+b*x
350 IF was=2 THEN y=a*EXP(b*x)
360 IF was=3 THEN y=a+b*LOG(x)
370 IF was=4 THEN y=a*x^b
375 IF was=5 THEN y=0:FOR i=0 TO grad:y=y+a1(i)*x^i:NEXT
380 PRINT"y = ";y:GOTO 320
385 '
390 'lineare Regression:
400 a1$="Lineare Regression           y = a + b*x"
430 sum1=0:sum2=0:sum3=0:sum4=0
440 FOR k=1 TO anzahl
450 sum1=sum1+x(k)*y(k)
460 sum2=sum2+x(k)
470 sum3=sum3+y(k)
480 sum4=sum4+x(k)*x(k)
490 NEXT
500 b=(sum1-(sum2*sum3/anzahl))/(sum4-(sum2*sum2/anzahl))
510 a=sum3/anzahl-(b*sum2/anzahl)
540 RETURN
590 'Anpassung durch Exponentialfunktion
600 a1$="Exponentialanpassung      y = a*exp(b*x)"
630 sum1=0:sum2=0:sum3=0:sum4=0
640 FOR k=1 TO anzahl
650 IF y(k)<=0 THEN 760
660 sum1=sum1+x(k)
670 sum2=sum2+LOG(y(k))
680 sum3=sum3+x(k)*LOG(y(k))
690 sum4=sum4+x(k)*x(k)
700 NEXT
710 b=(sum3-(sum1*sum2/anzahl))/(sum4-(sum1*sum1/anzahl))
720 a=EXP((sum2/anzahl)-(b*sum1/anzahl))
730 RETURN
760 CLS
770 PRINT"Kurvenanpassung ueber eine Exponentialfunktion nur moeglich, wenn alle   y(i) groesser 0 sind ."
775 anpass=0:'Anpassung unmoeglich
780 PRINT:PRINT"Hier ist aber y";k;" = ";y(k)
790 LOCATE 1,20:PRINT"Weiter mit beliebiger Taste"
800 CALL &BB18
810 RETURN
990 'Logarithmusanpassung:
1000 a1$="Logarithmische Funktionsanpassung      y = a + b*log(x)"
1040 FOR k=1 TO anzahl
1050 IF x(k)<=0 THEN 1160
1060 sum1=sum1+y(k)*LOG(x(k))
1070 sum2=sum2+LOG(x(k))
1080 sum3=sum3+LOG(x(k))*LOG(x(k))
1090 sum4=sum4+y(k)
1100 NEXT
1110 b=(sum1-(sum2*sum4/anzahl))/(sum3-(sum2*sum2/anzahl))
1120 a=(sum4-(b*sum2))/anzahl
1130 RETURN
1160 CLS
1170 PRINT"Eine logarithmische Kurvenanpassung ist nicht moeglich, wenn ein x-Wert         kleiner oder gleich 0 ist."
1180 PRINT:PRINT"Hier ist aber x";k;" = ";x(k)
1190 anpass=0:'Anpassung unmoeglich
1200 GOSUB 790:'Taste
1210 RETURN
1290 'Potenzfunktion:
1300 a1$="Anpassung ueber die Potenzfunktion      y = a*x^b"
1340 FOR k=1 TO anzahl
1350 IF (x(k)<=0) OR (y(k)<=0) THEN 1460
1360 sum1=sum1+LOG(x(k))*LOG(y(k))
1370 sum2=sum2+LOG(x(k))
1380 sum3=sum3+LOG(y(k))
1390 sum4=sum4+LOG(x(k))*LOG(x(k))
1400 NEXT
1410 b=(sum1-(sum2*sum3/anzahl))/(sum4-(sum2*sum2/anzahl))
1420 a=EXP(sum3/anzahl - (b*sum2/anzahl))
1430 RETURN
1460 CLS
1470 PRINT"Bei einer Anpassung ueber eine Potenzfunktion muessen alle x(i) und alle y(i)   groesser 0 sein."
1480 PRINT:PRINT"Hier ist aber x";k;" = ";x(k);"  und y";k;" = ";y(k)
1490 anpass=0:'Anpassung unmoeglich
1500 GOSUB 790:'Taste
1510 RETURN
1590 'Ende:
1600 CLS:PRINT"Tschuess."
1610 END
1690 'Eingabe der Messwerte:
1700 anzahl=0
1710 CLS
1720 PRINT"Geben Sie die Messwerte ein."
1730 PRINT:PRINT"Beenden Sie die Messwerteingabe durch Eingabe von 333.33 als x-Wert"
1750 LOCATE 1,6
1760 anzahl=anzahl+1
1770 PRINT"x";anzahl;":";:INPUT x(anzahl)
1780 IF x(anzahl)=333.33 THEN 1830
1790 PRINT:PRINT"y";anzahl;":";:INPUT y(anzahl)
1800 LOCATE 1,6:PRINT SPC(30)
1810 LOCATE 1,8:PRINT SPC(30)
1820 GOTO 1750
1830 anzahl=anzahl-1
1840 RETURN
1990 'Ausgabeunterprogramm
2000 CLS
2020 PRINT a1$
2030 PRINT STRING$(60,"-")
2035 IF was=5 THEN FOR k=0 TO grad:PRINT"a";k;": ";a1(k):NEXT:GOTO 2050
2040 PRINT"a : ";a,,"b : ";b
2050 PRINT:PRINT"r^2        : ";r2u
2055 PRINT"(Bestimmtheitsmass r^2 : Im Idealfall=1)"
2060 PRINT:PRINT"Abweichung : ";abw
2070 PRINT"           = ";USING"###.##";abwrel;:PRINT"%"
2080 GOSUB 790:'Taste
2090 RETURN
2480 'Berechnung der Guetekriterien
2490 'relative Quadratische Abweichung
2500 abw=0
2530 FOR k=1 TO anzahl
2540 x=x(k)
2550 IF was=1 THEN yb=a+b*x
2560 IF was=2 THEN yb=a*EXP(b*x)
2570 IF was=3 THEN yb=a+b*LOG(x)
2580 IF was=4 THEN yb=a*x^b
2585 IF was=5 THEN yb=0:FOR i=0 TO grad:yb=yb+a1(i)*x^i:NEXT
2590 abw=abw+(yb-y(k))*(yb-y(k))
2600 NEXT
2610 abw=SQR(abw/anzahl)
2620 'Bestimmtheitsmass nach Ullmann
2630 sqay=0:sqmy=0
2640 sum1=0
2650 FOR k=1 TO anzahl
2660 sum1=sum1+y(k)
2670 NEXT
2680 mwy=sum1/anzahl
2690 FOR k=1 TO anzahl
2700 sqay=sqay+(y(k)-mwy)*(y(k)-mwy):'Quadrat.Abweichung
2710 x=x(k)
2720 IF was=1 THEN yb=a+b*x
2730 IF was=2 THEN yb=a*EXP(b*x)
2740 IF was=3 THEN yb=a+b*LOG(x)
2750 IF was=4 THEN yb=a*x^b
2755 IF was=5 THEN yb=0:FOR i=0 TO grad:yb=yb+a1(i)*x^i:NEXT
2760 sqmy=sqmy+(yb-mwy)*(yb-mwy):'Quadrat.Abweichung der y-Werte
2770 NEXT
2780 r2u=sqmy/sqay
2790 'rel.Abweichung,bezogen auf den Mittelwert:
2800 abwrel=abw/mwy*100
2810 RETURN
2990 'Messwerte loeschen:
3000 anzahl=0
3010 RETURN
9990 'Polanpass 1.0
10000 '
10020 a1$="Polynomanpassung  y=a0 + a1*x + a2*x^2 +...+ an*x^n"
10040 GOSUB 10500:'Loesungsmatrixberechnung
10050 GOSUB 11000:'Berechnung der Polynomglieder
10060 ERASE lmat,a
10080 RETURN
10490 'Loesungsmatrixberechnung:
10500 CLS
10520 PRINT"Welchen Grad soll das Ausgleichspolynom haben";:INPUT grad
10530 PRINT:PRINT:PRINT"Bitte warten Sie. Ich bin beschaeftigt ..."
10540 DIM lmat(grad,grad+1)
10550 FOR j=0 TO grad
10560 FOR k=0 TO grad
10570 FOR i=1 TO anzahl
10580 IF x(i)<0 THEN 10590 ELSE 10610
10590 IF k/2=FIX(k/2) THEN 10610
10600 x1=-ABS(x(i)^k):GOTO 10620
10610 x1= ABS(x(i)^k)
10620 IF x(i)<0 THEN 10630 ELSE 10650
10625 'x^k und x^j berechnen: (Potenzieren negat.Zahlen abgefangen)
10630 IF j/2=FIX(j/2) THEN 10650
10640 x2=-ABS(x(i)^j):GOTO 10660
10650 x2= ABS(x(i)^j)
10660 lmat(j,k)=lmat(j,k)+x1*x2
10670 NEXT
10680 NEXT
10690 NEXT
10700 'B-Wert Berechnung:
10710 FOR j=0 TO grad
10720 FOR i=1 TO anzahl
10730 IF x(i)<0 THEN 10740 ELSE 10760
10740 IF j/2=FIX(j/2) THEN 10760
10750 x2=-ABS(x(i)^j):GOTO 10770
10760 x2= ABS(x(i)^j)
10770 lmat(j,grad+1)=lmat(j,grad+1)+y(i)*x2
10780 NEXT
10790 NEXT
10800 RETURN
10990 'Determinantenberechnung nach Gauss:
11000 ERASE a1:DIM a(grad,grad+1),a1(grad)
11020 FOR i=0 TO grad
11030 FOR k=0 TO grad+1
11040 a(i,k)=lmat(i,k)
11050 NEXT
11060 NEXT
11070 FOR k=0 TO grad
11080 FOR i=0 TO grad
11090 IF i=k THEN 11150
11100 f=-a(i,k)/a(k,k)
11110 FOR l=0 TO grad+1
11120 b=a(k,l)*f
11130 a(i,l)=a(i,l)+b
11140 NEXT
11150 NEXT
11160 NEXT
11170 FOR i=0 TO grad
11180 a1(i)=a(i,grad+1)/a(i,i)
11190 NEXT
11200 RETURN
*/ });
