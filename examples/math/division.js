/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 rem division - Division of long numbers (Division langer Zahlen)
110 '
120 CLEAR:MODE 1
130 PRINT"  Division langer Zahlen
145 'a$="123456789":b$="37"
150 PRINT"Divident:":if a$="" then LINE INPUT a$ else PRINT a$
155 PRINT
160 PRINT"Divisor:":if b$="" then LINE INPUT b$ else PRINT b$
165 PRINT
190 m=LEN(a$):n=LEN(b$):m=m-n
200 IF m>0 THEN 220
210 PRINT"Divident muss > als Divisor sein":?:goto 150
220 DIM u(n+m),v(n),w(n),q(m)
240 FOR i=1 TO n+m
250 u(i)=VAL(MID$(a$,i,1))
260 NEXT
270 FOR i=1 TO n
280 v(i)=VAL(MID$(b$,i,1))
290 NEXT
310 d=INT(10/(v(1)+1)):u(0)=0
320 IF d=1 THEN 450
330 k=0
340 FOR i=n+m TO 1 STEP -1
350 u=u(i)*d+k:k=INT(u/10):u(i)=u-k*10
360 NEXT
370 u(0)=k
390 k=0
400 FOR i=n TO 1 STEP -1
410 v=v(i)*d+k:k=INT(v/10):v(i)=v-k*10
420 NEXT
430 v(0)=k
450 j=0
460 IF u(j)=v(1) THEN q=9:GOTO 490
470 IF v(1)=0 THEN PRINT" fuehrende Null":END
480 q=INT((u(j)*10+u(j+1))/v(1))
490 q1=(u(j)*10+u(j+1)-q*v(1))*10+u(j+2)
500 IF v(2)*q<=q1 THEN 530
510 q=q-1:GOTO 490
530 k=0
540 FOR i=n TO 1 STEP -1
550 w=v(i)*q+k:k=INT(w/10):w(i)=w-k*10
560 NEXT
570 w(0)=k
590 k=0:f=0
600 FOR i=j+n TO j STEP -1
610 u=u(i)-w(i-j)+k:k=INT(u/10):u(i)=u-k*10
620 NEXT
630 IF k=-1 THEN f=1
650 q(j)=q
660 IF f=0 THEN 730
670 q(j)=q(j)=1:k=0
680 FOR i=j+n TO j STEP -1
690 u=u(i)+v(i-j)+k:k=INT(u/10):u(i)=u-k*10
700 NEXT
710 u(j-1)=u(j-1)+k
730 j=j+1
740 IF j<=m THEN 460
760 k=0
770 FOR i=m+1 TO m+n
780 u=u(i)+k*10:u(i)=INT(u/d):k=u-INT(u/d)*d
790 NEXT
800 '
810 'Ergebnis
820 PRINT:PRINT"Quotient=":j=0
830 IF q(j)=0 THEN j=j+1:GOTO 830
840 FOR i=j TO m
850 PRINT hex$(q(i));: 'use hex to get digit only
860 NEXT i:PRINT".";
870 FOR i=m+1 TO n+m
880 PRINT hex$(u(i));
890 NEXT
900 call &bb18
910 goto 120
*/ });
