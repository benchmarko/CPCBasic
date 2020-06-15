/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM crypto1: Cryptology 1 (Kryptoanalyse - Kryptologie)
110 '"Die geheime Nachricht/Umschau Verlag/S.63"
120 '16.11.1988
130 '
140 CLEAR
150 DEFSTR a-h:DEFINT i-x:DEFREAL y,z
160 DIM z(5,27):'6 Sprachen mit 28 Daten : 26 Buchstaben+ Vokale/Konson.
170 'Einlesen der Buchstabenhaeufigkeit:
180 FOR j=0 TO 5:FOR i=0 TO 27:READ z(j,i):NEXT i,j
190 MODE 2
200 PRINT TAB(20)"Kryptoanalyse - Kryptologie"
210 PRINT"Anteil der Buchstaben in % :"
220 ZONE 13
230 PRINT"Deutsch:","Englisch:","Franzoesisch","Italienisch:","Spanisch:","Portug."
240 FOR i=0 TO 27:FOR j=0 TO 5
250 IF j=0 THEN PRINT CHR$(i+65)+" ";
260 PRINT z(j,i),:NEXT j
265 if i=22 then t!=time+900:while time<t! and inkey$="":wend
268 NEXT i
270 '
280 PRINT"Prozentsumme:"
290 PRINT"  ";
300 FOR j=0 TO 5:su=0:FOR i=0 TO 25:su=su+z(j,i):NEXT i:PRINT su,:NEXT j
305 t!=time+900:while time<t! and inkey$="":wend
307 ?:?
310 '
320 '
330 'Vergleichstabelle der Haeufigkeit der Einzelbuchstaben bezogen auf 100-Woerter Texte:
340 'Tabelle: 1. Anteil Einzelbuchstaben A-Z
350 '2. Anteil der Vokale (1 Zahl)
360 '2. Anteil der haeufigsten Konsonanten L,N,R,S,T (1 Zahl)
370 '
380 'deutsch:
390 DATA 5,2.5,1.5,5,18.5,1.5,4,4,8,0,1,3,2.5,11.5,3.5,0.5,0,7,7,5,5,1,1.5,0,0,1.5
400 DATA 40,34
410 'englisch
420 DATA 7.81,1.28,2.93,4.11,13.05,2.88,1.39,5.85,6.77,0.23,0.42,3.6,2.62,7.28,8.21,2.15,0.14,6.64,6.46,9.02,2.77,1,1.49,0.3,1.51,0.09
430 DATA 40,33
440 'franzoesisch
450 DATA 9.42,1.02,2.64,3.38,15.87,0.95,1.04,0.77,8.41,0.89,0,5.34,3.24,7.15,5.14,2.86,1.06,6.46,7.9,7.26,6.24,2.15,0,0.3,0.24,0.32
460 DATA 45,34
470 'italienisch
480 DATA 11.74,0.92,4.5,3.73,11.79,0.95,1.64,1.54,11.28,0,0,6.51,2.51,6.88,9.83,3.05,0.61,6.37,4.98,5.62,3.01,2.1,0,0,0,0.49
490 DATA 48,30
500 'spanisch
510 DATA 12.69,1.41,3.93,5.58,13.15,0.46,1.12,1.24,6.25,0.56,0,5.94,2.65,6.95,9.49,2.43,1.16,6.25,7.6,3.91,4.63,1.07,0,0.13,1.06,0.35
520 DATA 47,31
530 'portugiesisch
540 DATA 13.5,0.5,3.5,5,13,1,1,1,6,0.5,0,3.5,4.5,5.5,11.5,3,1.5,7.5,7.5,4.5,4,1.5,0,0.2,0,0.3
550 DATA 48,29
560 '
570 '
610 REM Kryptoanalyse - Kryptologie
620 '"Die geheime Nachricht/Umschau Verlag/S.62"
630 '16.11.1988
640 '
650 'CLEAR
660 DEFSTR a-h:DEFINT i-x
670 ma=25:mb=23:mc=6:md=15:me=14 :'Anzahl-1
680 DIM a(ma),b(mb),c(mc),d(md),e(me) :'Felder fuer Gruppen (Anzahl-1)
690 'Einlesen der Buchstabengruppen
700 FOR i=0 TO ma:READ a(i):NEXT
710 FOR i=0 TO mb:READ b(i):NEXT
720 FOR i=0 TO mc:READ c(i):NEXT
730 FOR i=0 TO md:READ d(i):NEXT
740 FOR i=0 TO me:READ e(i):NEXT
750 '
760 'MODE 2
770 PRINT TAB(20)"Kryptoanalyse - Kryptologie"
775 ?
780 PRINT"Haeufigkeit von Buchstaben(gruppen) im Deutschen:"
790 FOR i=0 TO ma:PRINT a(i)",";:NEXT:PRINT
800 FOR i=0 TO mb:PRINT b(i)",";:NEXT:PRINT
810 FOR i=0 TO mc:PRINT c(i)",";:NEXT:PRINT
820 FOR i=0 TO md:PRINT d(i)",";:NEXT:PRINT
830 FOR i=0 TO me:PRINT e(i)",";:NEXT:PRINT
840 '
850 '
855 ?:call &bb18
860 '
870 'Reihenfolge der Haeufikeiten fuer Buchstaben und Buchstabengruppen im Deutschen:
880 '
890 'einzelne Buchstaben:
900 DATA E,N,R,I,S,T,U,D,A,H,G,L,O,C,M,B,Z,F,W,K,V,P,J,Q,X,Y
910 'Zweiergruppen:
920 DATA EN,ER,CH,DE,GE,EI,IE,IN,NE,BE,EL,TE,UN,ST,DI,ND,UE,SE,AU,RE,HE,IT,RI,TZ
930 'Doppelbuchstaben:
940 DATA EE,TT,LL,SS,DD,MM,NN
950 'Dreiergruppen:
960 DATA EIN,ICH,DEN,DER,TEN,CHT,SCH,CHE,DIE,UNG,GEN,UND,NEN,DES,BEN,RCH
970 'Vierergruppen:
980 DATA ICHT,KEIT,HEIT,CHON,CHEN,CHER,URCH,EICH,DERN,AUCH,SCHA,SCHE,SCHI,SCHO,SCHU
990 '
*/ });
