/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 rem derivat - Derivatives of Polynomials (Ableitungen eines Polynoms)
110 rem Computation of 3 derivatives (Berechnung dreier Ableitungen)
120 rem 18.7.1988
130 '
140 CLEAR
150 MODE 2:PRINT"Untersucht wird eine ganze rationale Funktion der Form"
160 PRINT:PRINT"y=a1*x^n1 + a2*x^n2 +...+ am*x^nm"
170 PRINT:INPUT"Wieviele Glieder hat die Funktion ";m
180 DIM a(m,3),n(m,3)
190 PRINT:PRINT"Geben Sie die einzelnen Faktoren ein."
200 FOR i=1 TO m:LOCATE 1,10:PRINT"a";i;" : ";:INPUT ;a(i,0):PRINT TAB(30);"n";i;" : ";:INPUT n(i,0)
210 LOCATE 1,10:PRINT SPACE$(50)
220 NEXT
230 PRINT:INPUT"Eingaben alle OK ( /n) ";a$
240 IF LOWER$(a$)="n" THEN 140
250 FOR i=1 TO m:FOR h=1 TO 3
260 a(i,h)=a(i,h-1)*n(i,h-1)
270 n(i,h)=n(i,h-1)-1
280 NEXT h,i
290 '
300 'Ausgabe der Gleichung:
310 CLS
320 PRINT"Gleichung :"
330 FOR h=0 TO 3
340 IF h>0 THEN PRINT:PRINT:PRINT h".Ableitung :"
350 FOR i=1 TO m
360 IF a(i,h)=0 THEN 410
370 IF a(i,h)>0 THEN PRINT"+";
380 PRINT a(i,h);
390 IF n(i,h)=0 THEN 410
400 IF n(i,h)=1 THEN PRINT"*x"; ELSE PRINT"*x^"n(i,h);
410 NEXT i,h
420 PRINT:PRINT:PRINT:PRINT"Soll noch eine Gleichung untersucht werden (j/n) ";:INPUT a$
430 IF LOWER$(a$)="n" THEN END
440 GOTO 140
*/ });
