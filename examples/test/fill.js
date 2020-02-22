/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM fill - Fill Test
60 REM Fill pattern from CPC Systembuch, p. 356
100 MODE 1:defint a-z
110 dx=638:dy=398:MOVE 0,0:GOSUB 240
120 MOVE 10,390:dx=10
130 FOR dy=-10 TO -380 STEP -12
140 GOSUB 240:MOVER 20,0
150 NEXT
160 r=100:ORIGIN 10,10
170 DEG:MOVE -50,150
180 FOR w=-20 TO 130 STEP 5
190 DRAW SIN(w)*r,COS(w)*r
200 r=400-r
210 NEXT
220 x=400:y=20: 'GOSUB 260:' not used
225 move x,y
226 fill 2
228 while inkey$="":wend
230 stop
240 DRAWR dx,0:DRAWR 0,dy:DRAWR -dx,0:DRAWR 0,-dy:RETURN
250 '
260 DIM x(200),y(200),dx(200),dy(200)
270 dx=2:dy=0:zg=0
280 IF TEST(x,y) THEN 450
290 call &bd19:PLOT x,y:z=dy:dy=dx:dx=-z     ' Plot und drehe nach links.
300 IF TEST(x+dx,y+dy)=0 THEN 390 ' Punkt frei? dann nach links weiter.
310 z=dx:dx=dy:dy=-z              ' sonst wieder nach rechts drehen.
320 IF TEST(x+dx,y+dy)=0 THEN 360 ' Punkt frei? dann geradeaus weiter.
330 z=dx:dx=dy:dy=-z              ' sonst nochmal nach rechts drehen.
340 x=x+dx:y=y+dy                 ' vorwärts gehen (insgesamt nach rechts)
350 GOTO 280                      ' und weiter. Verzweigungen nicht möglich!
355 ' Punkt rechts auf Verzweigung testen, nach vorne schreiten und weiter:
360 IF TEST(x+dy,y-dx)=0 THEN IF TESTR(dx,dy) THEN GOSUB 380
365 'IF TEST(x+dy,y-dx)=0         ' Test auf Verzweigung:
366 '  THEN IF TESTR(dx,dy)       ' rechts frei aber rechts vorne gesetzt?
367 '          THEN GOSUB 380     ' Wenn ja, eintragen
370 x=x+dx:y=y+dy:GOTO 290        ' Schritt nach vorne und weiter
380 SOUND 1,200,20: zg=zg+1:x(zg)=x+dy:y(zg)=y-dx:dx(zg)=dy:dy(zg)=-dx: RETURN
381 'SOUND 1,200,20:               ' Punkt rechts eintragen
382 '   zg=zg+1:x(zg)=x+dy:y(zg)=y-dx:dx(zg)=dy:dy(zg)=-dx:
383 '   RETURN
385 ' Punkt hinten auf Verzweigung testen und dann weiter bei 360:
390 IF TEST(x-dx,y-dy) THEN 360   ' Punkt hinten gesetzt? Dann keine Verzweigung
400 IF TESTR(dy,-dx)=0 AND TESTR(dx,dy)=0 THEN 360
401 'IF TESTR(dy,-dx)=0            ' sonst: trennt Punkt rechts oder
402 'AND TESTR(dx,dy)=0 THEN 360   ' Punkt rechts hinten? Nein, dann keine Verzweigung
410 SOUND 1,200,20: zg=zg+1:x(zg)=x-dx:y(zg)=y-dy:dx(zg)=-dx:dy(zg)=-dy:
411 'SOUND 1,200,20:               ' sonst erst Punkt hinten eintragen.
412 ' zg=zg+1:x(zg)=x-dx:y(zg)=y-dy:dx(zg)=-dx:dy(zg)=-dy: GOTO 360
413 ' GOTO 360
450 SOUND 1,300,20: IF zg THEN x=x(zg):y=y(zg):dx=dx(zg):dy=dy(zg):zg=zg-1:GOTO 280
451 'SOUND 1,300,20:               ' Punkt aus Speicher holen:
452 '  IF zg THEN x=x(zg):y=y(zg):dx=dx(zg):dy=dy(zg):zg=zg-1:GOTO 280
460 RETURN                        ' Zeiger zg=0 dann fertig.
*/ });
