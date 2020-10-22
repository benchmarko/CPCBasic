/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem hopper - Hopper
2 rem (c) Marco Vieth, 1986
3 rem TODO...
100 REM Huepfer.Lader
110 ENV 1,1,10,2,10,-1,5
120 MODE 0:mi=10:w=3:RESTORE 500:GOSUB 170
130 t$="":WHILE t$<>"J" AND t$<>"N":t$=UPPER$(INKEY$):WEND
140 IF t$="J" THEN MODE 1:RESTORE 520:mi=20:w=1:GOSUB 170
150 RESTORE 700:GOSUB 170
160 PEN 1:RUN"!HUEPFER2.BAS"
170 READ t$:IF t$="" THEN RETURN
180 LOCATE mi-LEN(t$)/2,VPOS(#0)+w:READ p:PEN p
190 FOR i=1 TO LEN(t$):PRINT MID$(t$,i,1);
200 SOUND 4,60,w*3,0,1:WHILE SQ(4)<>4:WEND
210 NEXT i:GOTO 170
500 DATA Huepfer,1,von Marco Vieth,3,August 1986,8
510 DATA " ",0,Spielregeln(J/N)?,15,
520 DATA Spielregeln,2," ",1
530 DATA Dieses Spiel koennen bis zu 4 Spieler,1
540 DATA auf einem 20*10 grossen Spielfeld spie-,3
550 DATA "len. Jeder hat 3 Feldsteine, die er zu",1
560 DATA Beginn beliebig plazieren kann. Mit den,3
570 DATA 4 Koordinatensteinen muss jeder versu-,1
580 DATA "chen, einen dieser Steine zu erwischen.",3
590 DATA "Erwischt er seinen eigenen, bekommt er",1
600 DATA "100 DM, sonst 500 DM.",2
610 DATA Der Feldstein wird dann eine Etage hoe-,1
620 DATA hergehoben und kann dort weiterhuepfen.,3
630 DATA Ein Feldstein kann auch gefangen werden,1
640 DATA wenn ein anderer von einer hoeheren,3
650 DATA Ebene auf ihn springt.,2
660 DATA Jeder Spieler muss ...,3
670 DATA "1. einen Koordinatenstein legen ",1
680 DATA "2. einen Feldstein schieben     ",2
690 DATA "3. einen Koordinatenstein nehmen",1,
700 DATA " ",1,Bitte  warten,2,
*/ });
