/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM basbankm - Basic Bank Manager
105 rem strange logic to use: Z=read mode, S=write mode for the following commands
110 CLEAR:adr=&A660:MEMORY adr-1
120 GOSUB 480:'ms-Code init
125 m=1
130 MODE 1
140 PRINT"Basic-Bank-Manager"
150 PRINT:PRINT
160 PRINT"Kommandos:"
170 PRINT"1-5  Bloecke waehlen
180 PRINT:PRINT
190 PRINT"Z    Bloecke zeigen
200 PRINT"S    Bloecke schreiben
210 PRINT"T    Text eingeben
215 PRINT"M    Modus"
220 PRINT"L    Laden
230 PRINT"E    Ende
240 PRINT:PRINT:PRINT"Taste?
250 CALL &BB18
260 MODE m:GOSUB 460:'akt.Bild
270 WINDOW 8,32,1,1:WINDOW#1,1,40,2,25
280 PAPER #1,0:PEN #1,1
290 CLS:PRINT"Bild:";bild
300 t$=INKEY$:IF t$="" THEN 300
310 t$=UPPER$(t$):IF t$="E" THEN MODE 1:STOP
320 IF t$="Z" THEN GOSUB 410:PRINT"Zeig Nr...":GOTO 300
330 IF t$="S" THEN GOSUB 440:PRINT"Schreib Nr":GOTO 300
340 IF t$="T" THEN CLS:INPUT t$:PRINT#1,t$:GOTO 290
350 IF t$="L" THEN INPUT"Name:";t$:LOAD"!"+t$,&C000:GOTO 290
355 IF t$="M" THEN INPUT"Mode:";m:IF m<0 OR m>2 THEN 355 ELSE 260
360 IF t$<"1" OR t$>"5" THEN 300
370 IF PEEK(hl)=&C0 THEN CLS:PRINT"Bild:";bild:'schreiben
380 bild=VAL(t$):GOSUB 460
390 GOTO 290
400 'out(zeigen)
410 POKE hl,&40:POKE de,&C0
420 RETURN
430 'in(schreiben)
440 POKE hl,&C0:POKE de,&40
450 RETURN
460 POKE bildzahl,z(bild):gosub 600:'CALL adr
470 RETURN
480 bildzahl=adr+1
490 hl=adr+7:de=adr+10
500 FOR i=adr TO adr+&10:READ a$:POKE i,VAL("&"+a$):NEXT
510 DIM z(5)
520 FOR i=1 TO 5:READ z(i):NEXT
530 GOSUB 410:'zeigen der Bloecke
540 bild=1:GOSUB 460
550 RETURN
560 DATA 3E,00,CD,5B,BD,21,00,40,11,00,C0,01,00,40,ED,B0,C9
570 DATA 0,  4,5,6,7
580 '
590 '
600 b=peek(bildzahl):'bank
610 'we could simply set the bank by OUT &7f00,&cx, but let's try CALL &bd5b
620 on b+1 gosub 700,700,700,700,710,720,730,740
630 src=peek(hl)*256:dest=peek(de)*256
632 for i=0 to &3fff:poke i+dest,peek(i+src):next
690 return
700 call &bd5b:return
710 call &bd5b,1,2,3,4:return:'register A=parameter count
720 call &bd5b,1,2,3,4,5:return
730 call &bd5b,1,2,3,4,5,6:return
740 call &bd5b,1,2,3,4,5,6,7:return
750 '
*/ });
