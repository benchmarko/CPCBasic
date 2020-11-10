/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem quadfunc - Quadratic Function
2 rem
3 rem
90 rem quagr3h1
100 'Berechnung einer quadratischen Funktion
110 '27.5.1988
120 '
130 MODE 2
210 anf=-5:ende=5:schritt=0.5
220 xa=20:ya=10
390 MODE 2
400 PRINT"Ausgabemenue:"
410 PRINT:PRINT"1) xmin fuer Berechnung ("anf")"
420 PRINT"2) xmax fuer Berechnung ("ende")"
430 PRINT"3) Schrittweite fuer Berechnung ("schritt")"
440 PRINT"4) x-Ausdehnung fuer Graph ("xa")"
450 PRINT"5) y-Ausdehnung fuer Graph ("ya")"
460 PRINT
470 PRINT"6) Graph sehen"
480 PRINT"7) Hardcopy"
490 PRINT:PRINT"8) Ende" 
500 PRINT:PRINT"( Bitte waehlen ... )"
510 t$=INKEY$:IF t$="" THEN 510
520 t=VAL(t$):IF t<1 OR t>8 THEN 510
530 IF t=8 THEN MODE 2:PRINT"Bye.":END
540 CLS:ON t GOSUB 560,570,580,590,600,610,740
550 GOTO 390
560 PRINT"xmin fuer Berechnung ("anf")";:INPUT anf:RETURN
570 PRINT"xmax fuer Berechnung ("ende")";:INPUT ende:RETURN
580 PRINT"schritt fuer Berechnung ("schritt")";:INPUT schritt:RETURN
590 PRINT"x-Ausdehnung fuer Graph ("xa")";:INPUT xa:RETURN
600 PRINT"y-Ausdehnung fuer Graph ("ya")";:INPUT ya:RETURN
610 ORIGIN sx+320,200+sy*-5
620 MOVE 0,399:DRAW 0,-399
630 MOVE -320,0:DRAW 320,0
640 FOR i=0 TO -320 STEP -xa:PLOT i,2:DRAW i,-2:NEXT:FOR i=0 TO 320 STEP xa:PLOT i,2:DRAW i,-2:NEXT
650 FOR i=0 TO -300 STEP -ya:PLOT -2,i:DRAW 2,i:NEXT:FOR i=0 TO 300 STEP ya:PLOT -2,i:DRAW 2,i:NEXT
670 FOR x=anf TO ende STEP schritt
680 y=x^4-8*x^3+16*x^2
690 IF x<>anf THEN DRAW x*xa,y*ya ELSE PLOT x*xa,y*ya
700 NEXT x
701 PRINT"Funktion:"
702 PRINT"f(x)=x^4-8*x^3+16*x^2"
710 CALL &BB18
720 RETURN
730 'Hardcopy:
740 GOSUB 610:  'CALL &A000
750 RETURN
*/ });
