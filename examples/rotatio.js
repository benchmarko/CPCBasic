/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem rotatio - Rotatio
2 rem (c) Marco Vieth, 1991
3 rem
100 REM Rotatio3 (v1.3)
110 REM 16.3.1991
120 REM Marco Vieth
130 REM
140 CLEAR:DEFINT a-z:DEFREAL c,s
150 DEG
160 xv=0:yv=0:'x,y-Verschiebung
170 xm!=10:ym!=10:'x,y-Multiplikator
180 w=0:'Drehwinkel
190 m=2:'Modus
200 GOSUB 1100:'Figur einlesen
210 MODE 1
220 PRINT"Rotationsdemo (v1.3)"
230 PRINT"Marco Vieth, 16.3.1991"
240 PRINT
250 PRINT"Steuerung der Figur:"
260 PRINT"Joy hoch   = hoch"
270 PRINT"Joy runter = runter"
280 PRINT"Joy links  = links"
290 PRINT"Joy rechts = rechts"
300 PRINT
310 PRINT"Joy hoch   + Feuer = vergroessern"
320 PRINT"Joy runter + Feuer = verkleinern"
330 PRINT"Joy links  + Feuer = links drehen"
340 PRINT"Joy rechts + Feuer = rechts drehen"
350 PRINT
360 PRINT"Feuer = Menue oder Parameter"
370 PRINT
380 PRINT"Bitte eine Taste druecken ..."
390 CALL &BB18
400 REM
410 MODE 1
420 WINDOW#1,13,37,3,10:WINDOW#2,5,35,15,18
430 PRINT"Parameter:"
440 PRINT
450 PRINT"Modus:"
460 PRINT"Drehwinkel:"
470 PRINT"x-Versch. :"
480 PRINT"y-Versch. :"
490 PRINT"x-Multipl.:"
500 PRINT"y-Multipl.:"
510 PRINT"Grafik"
520 PRINT"Ende"
530 po=7:pomax=8
540 GOSUB 1070
550 GOSUB 1040
560 REM
570 LOCATE#1,1,po:PRINT#1,CHR$(243);
580 FOR j=1 TO 500/50:call &bd19:NEXT
590 call &bd19:j=JOY(0):IF j=0 THEN 590
600 LOCATE#1,1,po:PRINT#1," ";
610 IF j AND 16 THEN 660
620 IF j AND 2 THEN po=po+1:IF po>pomax THEN po=1
630 IF j AND 1 THEN po=po-1:IF po<1 THEN po=pomax
640 GOTO 570
650 REM
660 GOSUB 1070
670 IF po=pomax THEN MODE 2:PRINT"bye.":END
680 IF po=pomax-1 THEN 780
690 CLS#2:ON po GOSUB 710,720,730,740,750,760
700 GOTO 550
710 INPUT#2,"Modus (0..2):";m:RETURN
720 INPUT#2,"Drehwinkel (0..360):";w:RETURN
730 INPUT#2,"x-Versch.:";xv:RETURN
740 INPUT#2,"y-Versch.:";yv:RETURN
750 INPUT#2,"x-Mult.:";xm!:RETURN
760 INPUT#2,"y-Mult.:";ym!:RETURN
770 REM
780 MODE m
790 ORIGIN 320,200
800 'Rotieren und Zeichnen
810 sn=SIN(w):cs=COS(w)
820 CLS
830 FOR i=1 TO n
840 x=(x(i)*cs-y(i)*sn)*xm!:y=(x(i)*sn+y(i)*cs)*ym!
850 x=x+xv:y=y+yv
860 IF i>1 THEN DRAW x,y ELSE PLOT x,y
870 NEXT i
880 REM Joystick
890 call &bd19:j=JOY(0):IF j=0 THEN 890
900 IF j=16 THEN gosub 1070:goto 410
910 IF j AND 16 THEN 980
920 IF j AND 8 THEN xv=xv+10
930 IF j AND 4 THEN xv=xv-10
940 IF j AND 2 THEN yv=yv-10
950 IF j AND 1 THEN yv=yv+10
960 GOTO 820
970 REM Drehen
980 IF j AND 8 THEN w=(w-10) MOD 360:IF w<0 THEN w=w+360:GOTO 810 ELSE 810
990 IF j AND 4 THEN w=(w+10) MOD 360:GOTO 810
1000 IF j AND 2 THEN xm!=xm!*0.9:ym!=ym!*0.9
1010 IF j AND 1 THEN xm!=xm!*1.1:ym!=ym!*1.1
1020 GOTO 820
1030 REM
1040 CLS#1:PRINT#1," "m:PRINT#1," "w:PRINT#1," "xv:PRINT#1," "yv:PRINT#1," "xm!:PRINT#1," "ym!
1050 RETURN
1060 REM
1070 t$="a":WHILE t$<>"" or joy(0)=16:CALL &BD19:t$=INKEY$:WEND:RETURN
1080 REM
1090 REM Daten der Figur einlesen
1100 n=9:DIM x(n),y(n)
1110 FOR i=1 TO n:READ x(i),y(i):NEXT
1120 RETURN
1130 DATA -5,-5,-5,5,0,10,5,5,5,-5,-5,-5,5,5,-5,5,5,-5
1140 REM
*/ });
