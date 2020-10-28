/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM anibas - Animator BASIC Viewer
20 REM (c) Marco Vieth, 1991
30 rem
100 'Animator (v3.2) - Basic
110 '25.11.1991  (8.3.1991 11.11.1989  5.,6.11.89)
120 '
130 MODE 2
140 CLEAR:DEFINT a-z
150 xm!=2.5:ym!=2.5:xv!=0:yv!=-114:'Korrekturfaktoren (m=Mult.,v=Verschiebung)
160 aniblk=&8000
170 PRINT"Animator (v3.2) - Basic"
180 PRINT"Dieses Programm zeigt Animationsphasen unter Basic."
190 PRINT"Den richtigen Animator mit  RUN"+CHR$(34)+"ANIMATOR   starten !"
200 PRINT
205 |DIR,"*.AND"
210 INPUT"Filename (ohne .AND): ";t$:IF t$<>"" THEN MEMORY &7FFF:LOAD t$+".AND",aniblk
220 PRINT:PRINT"Border blinkt : S=Screen speichern":PRINT
230 INPUT"Modus (0..2): ";m:MODE m
240 ph=aniblk:'Phasenadr
250 anidatadr=ph+UNT(PEEK(ph)+PEEK(ph+1)*256):'Animationsdatenadr
260 anz=PEEK(ph+2):'Anzahl Phasen
270 ph=ph+3:'Adr 1.Phasennummer
280 FOR i2=1 TO anz
290 phase=PEEK(ph):'Phasennummer
300 farbe=PEEK(ph+1):'Farbzahl
310 ph=ph+2:'auf naechste Phase
320 GOSUB 430:'Animationsphase zeigen
330 '
340 t$="*":WHILE t$<>"":t$=INKEY$:WEND:BORDER 5,7
350 i=0:WHILE (i<500) AND (t$=""):t$=UPPER$(INKEY$):i=i+1:WEND
360 IF t$="S" THEN SAVE"ANISCR.BIN",b,&C000,&4000
370 BORDER 1
380 CLS
390 NEXT i2
400 PRINT"Bye":STOP
410 '
420 REM Animationsphase zeigen
430 'x=UNT(PEEK(a)+PEEK(a+1)*256)
440 i=anidatadr+phase*2:'da 2 Bytes pro Datenoffset
450 a=UNT(anidatadr+(PEEK(i)+PEEK(i+1)*256))
460 REM
470 panz=PEEK(a):'Anz Punkte
480 IF panz=0 THEN RETURN
490 x=PEEK(a+1):y=PEEK(a+2):a=a+3
500 PLOT x*xm!+xv!,(255-y)*ym!+yv!:panz=panz-1:IF panz=0 THEN 470
510 FOR i=1 TO panz
520 x=PEEK(a):y=PEEK(a+1):a=a+2
530 DRAW x*xm!+xv!,(255-y)*ym!+yv!
540 NEXT i
550 GOTO 470
560 REM
*/ });
