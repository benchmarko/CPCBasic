/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem scrudu - Scrudu (Gedichte)"
2 rem
10 REM Kuenstliche Intelligenz auf dem CPC
20 REM Titel : SCRUDU - Gedichtsgenerierung
30 'Aus: Experimente zur KI in Basic auf CPC 464/664/6128 / M&T
40 '17.6.1988
50 '
55 CLEAR
60 DEFSTR a-h:DEFINT i-z
65 w=0:'Ausgabewindow
70 WIDTH 60
90 '
100 '*** Supervisor ***
110 GOSUB 30000:'Initialisation
120 GOSUB 40000:'Titel
130 '
140 GOSUB 1000:'Verstyp ermitteln
150 ON ty GOSUB 2000,3000,4000,5000:'4 Typen
160 '
170 GOSUB 50000:'weiterer Vers
180 GOTO 140
190 '
990 'Verstyp ermitteln
1000 ty=1+INT(RND(1)*4):IF ta=ty THEN 1000
1010 ta=ty
1020 PRINT#w:PRINT TAB(50)"(Verstyp___"ty"__)"
1040 RETURN
1050 '
1990 'Verstyp Nr. 1
2000 GOSUB 23000
2010 '1.Satz: Praeposition+Artikel+Nomen
2020 GOSUB 18000:GOSUB 25000:GOSUB 21000:GOSUB 23000:GOSUB 19000
2030 '2.Satz: Artikel+Adjektiv+Nomen
2040 GOSUB 18000:GOSUB 21000:GOSUB 22000:GOSUB 23000:GOSUB 19000
2050 '3.Satz: Artikel+Adjektiv+Nomen
2060 GOSUB 18000:GOSUB 21000:GOSUB 22000:GOSUB 23000:GOSUB 19000
2070 RETURN
2080 '
2990 'Verstyp Nr. 2
3000 '1.Satz: Artikel+Adjektiv+Nomen
3010 GOSUB 18000:GOSUB 21000:GOSUB 22000:GOSUB 23000:GOSUB 19000
3020 '2.Satz: Artikel+Nomen+Verb+Praeposition+Artikel+Nomen
3030 GOSUB 18000:GOSUB 21000:GOSUB 23000:GOSUB 24000:GOSUB 25000:GOSUB 21000:GOSUB 23000:GOSUB 19000
3040 '3.Satz: Artikel+Adjektiv+Nomen+Verb
3050 GOSUB 18000:GOSUB 21000:GOSUB 22000:GOSUB 23000:GOSUB 24000:GOSUB 19000
3060 RETURN
3080 '
3990 'Verstyp Nr. 3
4000 '1.Satz: Artikel+Adjektiv+Nomen+Verb
4010 GOSUB 18000:GOSUB 21000:GOSUB 22000:GOSUB 23000:GOSUB 24000:GOSUB 19000
4015 t3=77:'Flag 2 Adjektive
4020 '2.Satz: Artikel+Adjektiv+Adjektiv2+Nomen
4030 GOSUB 18000:GOSUB 21000:GOSUB 22000:GOSUB 22000:GOSUB 23000:GOSUB 19000
4040 '3.Satz: Praeposition+Artikel+Adjektiv+Nomen
4050 GOSUB 18000:GOSUB 25000:GOSUB 21000:GOSUB 22000:GOSUB 23000:GOSUB 19000
4060 RETURN
4070 '
4990 'Verstyp Nr. 4
5000 '1.Satz: Artikel+Adjektiv+Nomen
5010 GOSUB 18000:GOSUB 21000:GOSUB 22000:GOSUB 23000:GOSUB 19000
5020 '2.Satz: Praeposition+Artikel+Adjektiv+Nomen
5030 GOSUB 18000:GOSUB 25000:GOSUB 21000:GOSUB 22000:GOSUB 23000:GOSUB 19000
5040 '3.Satz: Artikel+Nomen+Verb
5050 GOSUB 18000:GOSUB 21000:GOSUB 23000:GOSUB 24000:GOSUB 19000
5060 RETURN
5070 '
5080 '
17990 'Satzfeld reset
18000 n=0:ra=0:rb=0:re=0
18010 FOR i=0 TO 10:g(i)="":NEXT
18020 RETURN
18030 '
18990 'Satzzuweisungen
19000 a="  ":'2 Leerzeichen 
19010 FOR i=1 TO n:a=a+g(i)+" ":NEXT
19015 PRINT#w,a
19020 RETURN
19030 '
19980 'Woerter aus Vokabular bestimmen
19990 'Artikel
21000 n=n+1:ra=n
21010 vo=1+INT((RND)*sa):g(n)=a(vo)
21020 RETURN
21030 '
21990 'Adjektive
22000 n=n+1:rb=n
22010 vo=1+INT(RND(1)*sb):g(n)=b(vo)
22020 RETURN
22030 '
22990 'Nomen
23000 n=n+1
23010 vo=1+INT(RND(1)*sc):g(n)=c(vo)
23020 GOSUB 27000
23030 RETURN
23040 '
23990 'Verben
24000 n=n+1
24010 vo=1+INT(RND(1)*sd):g(n)=d(vo)
24020 RETURN
24030 '
24990 'Praepositionen
25000 n=n+1:re=99
25010 vo=1+INT(RND(1)*se):g(n)=e(vo)
25020 RETURN
25030 '
26990 'Artikel korrekt zuweisen:
27000 h=RIGHT$(g(n),1)
27001 ar=g(ra)
27010 zu=1+INT(RND(1)*2)
27020 IF h="-" THEN IF zu=1 THEN g(ra)="der" ELSE IF re=99 THEN g(ra)="ein":g(rb)=g(rb)+"n":GOTO 28000 ELSE g(ra)="ein":g(rb)=g(rb)+"r"
27030 IF h="+" THEN IF zu=1 THEN g(ra)="die" ELSE g(ra)="eine"
27040 IF h="/" THEN IF zu=1 THEN g(ra)="ein":g(rb)=g(rb)+"s" ELSE g(ra)="das"
27050 '
27060 IF t3=77 THEN t3=0:rb=rb-1:GOTO 27020:'zwei Adjektive:auch fuer 2.!!
27070 '
28000 g(n)=LEFT$(g(n),LEN(g(n))-1):'Geschlecht entfernen
28010 RETURN
28020 '
29990 'Initialisieren
30000 MODE 1:|DIR,"*.VOK":INPUT"Vokabulardatei (ohne .VOK): ";a:if a="" then a="SCRUDU"
30001 DIM g(10):OPENIN a+".VOK"
30002 INPUT#9,a1,a2
30003 WHILE a<>"#":INPUT#9,a:WEND
30005 INPUT#9,sa,sb,sc,sd,se:'Anzahlen
30010 DIM a(sa),b(sb),c(sc),d(sd),e(se):'Art.Adj.Nom.Praep.
30020 INPUT#9,a:FOR i=1 TO sa:INPUT#9,a(i):NEXT
30030 INPUT#9,a:FOR i=1 TO sb:INPUT#9,b(i):NEXT
30040 INPUT#9,a:FOR i=1 TO sc:INPUT#9,c(i):NEXT
30050 INPUT#9,a:FOR i=1 TO sd:INPUT#9,d(i):NEXT
30060 INPUT#9,a:FOR i=1 TO se:INPUT#9,e(i):NEXT
30070 CLOSEIN
30080 RETURN
30090 '
39990 'Titel
40000 MODE 2
40010 PRINT:PRINT TAB(15)a1
40020 PRINT TAB(30)a2
40030 'Gedichtstitel waehlen:
40040 'Artikel+Adjektiv+Nomen
40050 GOSUB 18000:GOSUB 21000:GOSUB 22000:GOSUB 23000:PRINT#w:PRINT#w,"  Titel :  ";:GOSUB 19000
40070 RETURN
40080 '
49990 'Taste=weiterer Vers,'s'=STOP
50000 h=INKEY$:IF h="" THEN 50000
50010 IF LOWER$(h)="s" THEN PRINT:STOP
50020 RETURN
50030 '
*/ });
