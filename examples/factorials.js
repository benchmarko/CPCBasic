/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 rem Big Factorials (Berechnung grosser Fakultaeten)
110 MODE 1:CLEAR
120 PRINT"    Fakultaet grosser Zahlen"
130 PRINT:INPUT"Fakultaet welcher Zahl:";n
140 PRINT:PRINT n"!="
150 DIM r(100)
160 'Zahl der Fuenferbloecke
170 l=1:r(1)=1
180 FOR i=2 TO n:l=l+LOG(i):NEXT
190 l=l*0.434295000042766:r%=int(l/5+1)
200 'Multi-Schleife
210 l=1:FOR i=n TO 2 STEP -1
220 l=l+LOG(i)*0.434294575010426:l%=l/5+1:u=0
230 FOR j=1 TO l%
240 h=r(j)*i+u
250 IF h<-100000 THEN u=0:GOTO 270
260 u=INT(h/100000):h=h-u*100000
270 r(j)=h:NEXT j,i
280 'Ausgabe
290 IF r(r%)=0 THEN r%=r%-1:GOTO 290
300 FOR i=r% TO 1 STEP -1
310 r$=STR$(r(i)):r$=RIGHT$(r$,LEN(r$)-1)
320 PRINT RIGHT$("0000"+r$,5);"  ";
330 IF (r%-i+1) MOD 10=0 THEN PRINT
340 NEXT
350 call &bb18
360 run
*/ });
