/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem hopper2 - Hopper: Main Part (Hüpfer)
2 rem (c) Marco Vieth, 1986
3 rem TODO...
4 rem
100 REM Huepfer
110 CLEAR:GOSUB 2000
115 s=0:z=0:pl=0
120 'Schleife
130 WHILE za<(br+1)*(lg+1)
140 pl=pl+1:IF pl>sp THEN pl=1
145 GOSUB 1820:CLS:bit=4:p=2:FOR s=1 TO 4:GOSUB 1450:NEXT
150 PRINT"Feldstein schieben !":PRINT"1.waehlen..."
160 s=0:z=0:GOSUB 1200:k(s,z)=k(s,z)-bit
165 IF NOT k(s,z) AND 4 THEN t$="kein Feldstein!":GOSUB 1350:GOTO 160
170 IF NOT k(s,z) AND 2^(pl+2) THEN t$="gehoert nicht dir!":GOSUB 1350:GOTO 160
180 anz=0:h1=0:h2=0:h3=0:IF k(s,z) AND 4 THEN h3=1
185 IF k(s,z) AND 2 THEN h2=1 ELSE h1=1
190 FOR i=-1 TO +1:FOR j=-1 TO +1
200 s1=s+i:z1=z+j:IF s1>br OR s1<0 THEN 300
210 IF z1>lg OR z1<0 THEN 300
220 IF h2=1 THEN 250 ELSE IF k(s1,z1) AND 2 THEN 300
250 IF k(s1,z1) AND 4 THEN 300
290 anz=anz+1:b1(anz)=s1:b2(anz)=z1
300 NEXT j,i
310 IF anz=0 THEN t$="Bewegung unmoeglich":GOSUB 1350:GOTO 160
320 GOSUB 1500:PRINT"2.bewegen...":ss=s:zz=z
330 t$=INKEY$:GOSUB 1200:k(s,z)=k(s,z)-bit
340 FOR i=1 TO anz:IF b1(i)=s THEN IF b2(i)=z THEN 360
350 NEXT i:t$="Nur 1 Feld !":GOSUB 1350:GOTO 330
360 s1=s:z1=z:s=ss:z=zz:GOSUB 1540:k(s,z)=k(s,z)-bit-2^(i+2):GOSUB 1500
370 s=s1:z=z1:k(s,z)=k(s,z)+bit+2^(i+2):GOSUB 1500
380 CLS:PRINT"Koordinatenstein":PRINT"legen ..."
390 GOSUB 1250:k(s,z)=k(s,z)+2:GOSUB 1500
391 IF NOT k(s,z) AND 4 THEN 400
392 IF k(s,z) AND 2^(pl+2) THEN i=100 ELSE i=500
393 p(pl)=p(pl)+i:GOSUB 1800:t$="** Bonus **":GOSUB 1400
400 s=j:IF za<(br+1)*(lg+1)-4*sp THEN t$="Neuer Stein :":GOSUB 1400:p=1:GOSUB 1300:GOSUB 1450 ELSE t$="  ":GOSUB 1320
420 t$="naechster Spieler...":GOSUB 1400
500 za=za+1:WEND
600 CLS:WINDOW 1,30,21,25:CLS:PRINT"Das Spiel ist beendet."
610 CALL &BB18:STOP
620 RUN
998 CALL &BB18:STOP
999 REM Steuerung
1000 j=0:j=JOY(0):IF j=0 THEN 1000
1005 IF j=16 THEN RETURN
1010 IF j AND 8 THEN IF s1<br THEN s1=s1+1:RETURN
1020 IF j AND 4 THEN IF s1>0 THEN s1=s1-1:RETURN
1030 IF j AND 2 THEN IF z1<lg THEN z1=z1+1:RETURN
1040 IF j AND 1 THEN IF z1>0 THEN z1=z1-1:RETURN
1050 GOTO 1000
1200 s=0:z=0:s1=0:z1=0:k(s,z)=k(s,z)+bit:GOSUB 1500
1210 GOSUB 1000:k(s,z)=k(s,z)-bit:GOSUB 1500:s=s1:z=z1
1220 k(s,z)=k(s,z)+bit:GOSUB 1500:IF j<>16 THEN 1210
1230 RETURN
1249 REM Fuer Koordinatenstein
1250 s=0:s1=s:p=3:ss=br:zz=lg:br=3:lg=0:s=s+1:GOSUB 1450:s=s-1
1260 GOSUB 1000:p=2:s=s+1:GOSUB 1450:s=s-1
1270 s=s1:z=z1:IF j<>16 THEN p=3:s=s+1:GOSUB 1450:s=s-1:GOTO 1260
1280 br=ss:lg=zz:t$=MID$(f$(pl),s*2+1,2)
1281 IF t$="  " THEN t$="Was ???":GOSUB 1400:GOTO 1250
1285 j=s+1:s=ASC(t$)-65
1290 z=VAL(RIGHT$(t$,1)):p=0:s1=s:s=j:GOSUB 1450:s=s1:RETURN
1300 s1=INT(RND*(br+1)):z1=INT(RND*(lg+1)):IF NOT k(s1,z1) AND 1 THEN 1300
1310 k(s1,z1)=k(s1,z1)-1:t$=CHR$(s1+65)+RIGHT$(STR$(z1),1)
1320 s=s-1:f$(pl)=LEFT$(f$(pl),s*2)+t$+RIGHT$(f$(pl),8-s*2)
1330 s=s+1:RETURN
1349 REM Zurueck
1350 GOSUB 1400:GOTO 1500
1399 REM text
1400 p1=POS(#0):p2=VPOS(#0):PRINT t$:FOR i=1 TO 100:n$(0)=INKEY$:NEXT
1405 WHILE JOY(0)<>0:n$(0)=INKEY$:WEND:CALL &BB18
1410 LOCATE p1,p2:PRINT SPACE$(LEN(t$)):LOCATE p1,p2:RETURN
1449 REM Steine
1450 PLOT -5,-5,p:MOVE 18*(s*2)+330,40
1455 TAG:MOVER 4,-4:i=s*2-1:PRINT MID$(f$(pl),i,1);
1460 i=i+1:MOVER -4,-10:PRINT MID$(f$(pl),i,1);:TAGOFF
1470 MOVE 18*(s*2)+330,40:GOTO 1610
1500 GOSUB 1550
1510 TAG:MOVER 4,-4:PRINT CHR$(s+65);:IF p<>3 THEN 1517
1515 GOSUB 1540:IF i<>0 THEN 1520
1517 t$=RIGHT$(STR$(z),1)
1520 MOVER -8,-10:PRINT t$;:TAGOFF:RETURN
1540 IF k(s,z) AND 8 THEN i=1 ELSE IF k(s,z) AND 16 THEN i=2 ELSE IF k(s,z) AND 32 THEN i=3 ELSE IF k(s,z) AND 64 THEN i=4 ELSE i=0
1545 t$=n$(i):RETURN
1549 REM Grafikposition+Farbe
1550 IF k(s,z) AND 4 THEN p=3 ELSE IF k(s,z) AND 2 THEN p=2 ELSE p=1
1560 PLOT -5,-5,p:MOVE 16*(s*2),399-16*(z*2):RETURN
1600 GOSUB 1550
1610 MOVER -1,0:DRAWR 24,0:DRAWR 0,-10:MOVER -12,-18:DRAWR -12,0
1620 DRAWR 0,28:RETURN
1799 REM Punkteanzeige
1800 CLS #1:FOR i=1 TO sp:PRINT #1,USING "####";p(i):NEXT:RETURN
1819 REM Spieler
1820 CLS #2:LOCATE #2,1,pl:PRINT#2,CHR$(243);:RETURN
1899 REM auf Zeichen warten
1900 t$="":WHILE t$="":t$=UPPER$(INKEY$):WEND
1910 PRINT t$;:RETURN
1949 REM Zahl von mi-ma holen
1950 GOSUB 1900:t=VAL(t$):IF t<mi OR t>ma THEN 1950
1960 RETURN
2000 FOR i=72 TO 77:KEY DEF i,1,0:NEXT
2010 MODE 0
2020 LOCATE 7,3:PEN 1:PRINT"HUEPFER"
2030 LOCATE 3,6:PEN 2:PRINT"Wieviele Spieler"
2040 LOCATE 3,8:PRINT"(1-4):";
2050 PEN 1:mi=1:ma=4:GOSUB 1950
2060 sp=t:RANDOMIZE TIME
2070 LOCATE 3,10:PRINT"Abmessungen:"
2080 LOCATE 1,12:PEN 1:INPUT"Breite (-20):";br
2090 IF br>20 THEN 2080
2100 LOCATE 1,14:INPUT"Laenge (-10):";lg
2110 IF lg>10 OR lg<1 THEN 2100
2115 IF sp*4>lg*br THEN PRINT"Zu klein !!":CALL &BB18:CLS:GOTO 2070
2120 br=br-1:lg=lg-1:DIM k(br,lg),p(sp),f$(sp),n$(sp)
2130 MODE 1:INK 2,16:INK 3,8:INK 1,25
2140 FOR z=0 TO lg:FOR s=0 TO br
2150 k(s,z)=1:GOSUB 1500:GOSUB 1600:NEXT s,z
2160 LOCATE 34,21:PEN 2:PRINT"Punkte:":PEN 1
2170 FOR pl=1 TO sp:p(pl)=0:LOCATE 1,pl+21
2180 PRINT"Kennzeichen Spieler";pl;:GOSUB 1900
2190 LOCATE 34,21+pl:PRINT t$;":";
2200 n$(pl)=t$:f$(pl)=STRING$(8," "):NEXT pl
2210 WINDOW #1,36,40,22,25:PAPER #1,3:CLS #1:GOSUB 1800
2220 WINDOW #2,33,33,22,25:PAPER #2,2:PEN #2,3:CLS #2
2230 WINDOW 1,25,21,25:CLS:PEN 2:PRINT"Anweisungen:":PEN 1
2240 WINDOW 1,20,22,25:PRINT"Feldsteine ver-":PRINT"teilen."
2250 bit=4:FOR pl=1 TO sp:GOSUB 1820:FOR h=1 TO 3
2260 GOSUB 1200:IF k(s,z)>7 THEN k(s,z)=k(s,z)-bit:t$="schon besetzt !":GOSUB 1350:GOTO 2260
2265 k(s,z)=k(s,z)+2^(pl+2):GOSUB 1500:s=h:GOSUB 1300
2270 t$="angenommen.":GOSUB 1400:NEXT h:s=h:GOSUB 1300:NEXT pl
2280 RETURN
*/ });
