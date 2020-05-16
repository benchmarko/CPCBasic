/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Functional Area with Hidden Line (Funktionsflaeche)
110 '26.11.1989
115 'Modifications: line 460: inserted int() to avoid fp array indices
120 '
130 MODE 1
140 DIM uh(639),oh(639)
150 PRINT TAB(8)"1.Funktionsflaeche"
160 PRINT TAB(4)"(Funktionsterm ab Zeile 900)"
165 xu=-2:xo=2:yu=-2:yo=2:zu=0:zo=4
167 goto 200:'use defaults
170 INPUT "xmin (-2):";xu:INPUT "xmax (2):";xo
180 INPUT "ymin (-2):";yu:INPUT "ymax (2):";yo
190 INPUT "zmin (0):";zu:INPUT "zmax (4):";zo
200 uo=xo+yo/2:uu=xu+yu/2:vo=zo+yo/2:vu=zu+yu/2
210 ku=639/(uo-uu):kv=399/(vo-vu)
220 dx=(xo-xu)/160:dy=(yo-yu)/20:'Schwittweiten
230 dx1=(xo-xu)/20:dy1=(yo-yu)/160:'Schwittweiten
240 MODE 2
242 gosub 530:gosub 310
244 gosub 530:gosub 380
250 PRINT"Zeichnen: 1) Frontlinien  2)Tiefenlinien  3)Ende"
260 t$=INKEY$:IF t$="" THEN call &bd19: goto 260
270 IF UPPER$(t$)="S" THEN SAVE"FUNK.SCR",b,&C000,&4000
280 t=VAL(t$):IF t<1 OR t>4 THEN call &bd19: goto 260
290 PRINT t;:GOSUB 530:'loeschen
300 IF t=3 THEN END ELSE ON t GOSUB 310,380
305 GOTO 260
310 FOR y=yu TO yo STEP dy:x=xu:GOSUB 550:GOSUB 460:s1=sp:z1=ze
320 GOSUB 480:f1=f:'Sichtbarkeit
330 FOR x=xu TO xo STEP dx:GOSUB 550:GOSUB 460:s2=sp:z2=ze
340 GOSUB 480:f2=f:'Sichtbarkeit
350 IF f1+f2=2 THEN MOVE s1,399-z1:DRAW s2,399-z2,1
360 s1=s2:z1=z2:f1=f2:NEXT x,y
370 RETURN
380 FOR x=xo TO xu STEP -dx1:y=yu:GOSUB 550:GOSUB 460:s1=sp:z1=ze
390 GOSUB 480:f1=f:'Sichtbarkeit
400 FOR y=yu TO yo STEP dy1:GOSUB 550:GOSUB 460:s2=sp:z2=ze
410 GOSUB 480:f2=f:'Sichtbarkeit
420 IF f1+f2=2 THEN MOVE s1,399-z1:DRAW s2,399-z2,1
430 s1=s2:z1=z2:f1=f2:NEXT y,x
440 RETURN
450 'Abbilden eines Punktes
460 u=x+y/2:v=z+y/2:sp=int(ku*(u-uu)):ze=int(kv*(vo-v)):RETURN: 'sp=ku*(u-uu):ze=kv*(vo-v):RETURN
470 REM Sichtbarkeit
480 f=0
490 IF ze>uh(sp) THEN f=1:uh(sp)=ze
500 IF ze<oh(sp) THEN f=1:oh(sp)=ze
510 RETURN
520 REM loeschen
530 FOR i=0 TO 639:uh(i)=0:oh(i)=639:NEXT i:RETURN
540 'Funktion
550 z=x*x+y*y:z=SIN(z)
560 IF z<zu THEN z=zu ELSE IF z>zo THEN z=zo
570 RETURN
580 REM weitere Funktionen:
590 'z=cos(z):z=sin(z):z=zin(z)/z:z=exp(-cos(z))
600 '
*/ });
