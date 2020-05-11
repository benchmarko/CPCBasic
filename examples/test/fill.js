/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM fill - Fill Test
20 REM Fill pattern from CPC Systembuch, p. 356
40 defint a-z
50 c.c=1:gosub 9010:'initCpcLib
60 c.c=4:gosub 9020:'checkMode
70 '
80 for m=0 to c.m%
90 gosub 140
100 c.c=3:c.iv%=200:gosub 9020:'waitOrKey
110 next
120 goto 80
130 '
140 MODE m
150 move 32,30:m$=right$(str$(m),1):tag:?m$;:tagoff
160 dx=638:dy=398:MOVE 0,0:GOSUB 320
170 MOVE 10,390:dx=10
180 FOR dy=-10 TO -380 STEP -12
190 GOSUB 320:MOVER 20,0
200 NEXT
210 r=100:ORIGIN 10,10
220 DEG:MOVE -50,150
230 FOR w=-20 TO 130 STEP 5
240 DRAW SIN(w)*r,COS(w)*r
250 r=400-r
260 NEXT
270 x=400:y=20: 'GOSUB 260:' not used
280 move x,y
290 if m<>2 then fill 2 else fill 1
300 return
310 '
320 DRAWR dx,0:DRAWR 0,dy:DRAWR -dx,0:DRAWR 0,-dy:RETURN
330 '
340 DIM x(200),y(200),dx(200),dy(200)
350 dx=2:dy=0:zg=0
360 IF TEST(x,y) THEN 630
370 call &bd19:PLOT x,y:z=dy:dy=dx:dx=-z     ' Plot und drehe nach links.
380 IF TEST(x+dx,y+dy)=0 THEN 550 ' Punkt frei? dann nach links weiter.
390 z=dx:dx=dy:dy=-z              ' sonst wieder nach rechts drehen.
400 IF TEST(x+dx,y+dy)=0 THEN 450 ' Punkt frei? dann geradeaus weiter.
410 z=dx:dx=dy:dy=-z              ' sonst nochmal nach rechts drehen.
420 x=x+dx:y=y+dy                 ' vorwärts gehen (insgesamt nach rechts)
430 GOTO 360                      ' und weiter. Verzweigungen nicht möglich!
440 ' Punkt rechts auf Verzweigung testen, nach vorne schreiten und weiter:
450 IF TEST(x+dy,y-dx)=0 THEN IF TESTR(dx,dy) THEN GOSUB 500
460 'IF TEST(x+dy,y-dx)=0         ' Test auf Verzweigung:
470 '  THEN IF TESTR(dx,dy)       ' rechts frei aber rechts vorne gesetzt?
480 '          THEN GOSUB 380     ' Wenn ja, eintragen
490 x=x+dx:y=y+dy:GOTO 370        ' Schritt nach vorne und weiter
500 SOUND 1,200,20: zg=zg+1:x(zg)=x+dy:y(zg)=y-dx:dx(zg)=dy:dy(zg)=-dx: RETURN
510 'SOUND 1,200,20:               ' Punkt rechts eintragen
520 '   zg=zg+1:x(zg)=x+dy:y(zg)=y-dx:dx(zg)=dy:dy(zg)=-dx:
530 '   RETURN
540 ' Punkt hinten auf Verzweigung testen und dann weiter bei 360:
550 IF TEST(x-dx,y-dy) THEN 450   ' Punkt hinten gesetzt? Dann keine Verzweigung
560 IF TESTR(dy,-dx)=0 AND TESTR(dx,dy)=0 THEN 450
570 'IF TESTR(dy,-dx)=0            ' sonst: trennt Punkt rechts oder
580 'AND TESTR(dx,dy)=0 THEN 360   ' Punkt rechts hinten? Nein, dann keine Verzweigung
590 SOUND 1,200,20: zg=zg+1:x(zg)=x-dx:y(zg)=y-dy:dx(zg)=-dx:dy(zg)=-dy:
600 'SOUND 1,200,20:               ' sonst erst Punkt hinten eintragen.
610 ' zg=zg+1:x(zg)=x-dx:y(zg)=y-dy:dx(zg)=-dx:dy(zg)=-dy: GOTO 360
620 ' GOTO 360
630 SOUND 1,300,20: IF zg THEN x=x(zg):y=y(zg):dx=dx(zg):dy=dy(zg):zg=zg-1:GOTO 360
640 'SOUND 1,300,20:               ' Punkt aus Speicher holen:
650 '  IF zg THEN x=x(zg):y=y(zg):dx=dx(zg):dy=dy(zg):zg=zg-1:GOTO 280
660 RETURN                        ' Zeiger zg=0 dann fertig.
670 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
