/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem pixeltst - Pixel Test (Mode 0)
100 'DECODIERUNG MODE 0
110 MODE 1:PRINT"Im Mode 0 werden -anstelle von einem-
120 PRINT "immer vier Punkte angesprochen !":PRINT
130 p$="Pixelelement"
140 INPUT "Zeichen:";a$
150 INPUT "Pen:";p:IF p=0 THEN p=1
160 MODE 0:PEN p
170 '
180 GOSUB 450:FOR i=1 TO 500:NEXT
190 '
200 f1$=BIN$(PEEK(&C000),8):f2$=BIN$(PEEK(&C001),8)
210 f3$=BIN$(PEEK(&C002),8):f4$=BIN$(PEEK(&C003),8)
220 '
230 MODE 2:PEN 1
240 p0$=MID$(f1$,7,1)+MID$(f1$,3,1)+MID$(f1$,5,1)+MID$(f1$,1,1)
250 p1$=MID$(f1$,8,1)+MID$(f1$,4,1)+MID$(f1$,6,1)+MID$(f1$,2,1)
260 p2$=MID$(f2$,7,1)+MID$(f2$,3,1)+MID$(f2$,5,1)+MID$(f2$,1,1)
270 p3$=MID$(f2$,8,1)+MID$(f2$,4,1)+MID$(f2$,6,1)+MID$(f2$,2,1)
280 p4$=MID$(f3$,7,1)+MID$(f3$,3,1)+MID$(f3$,5,1)+MID$(f3$,1,1)
290 p5$=MID$(f3$,8,1)+MID$(f3$,4,1)+MID$(f3$,6,1)+MID$(f3$,2,1)
300 p6$=MID$(f4$,7,1)+MID$(f4$,3,1)+MID$(f4$,5,1)+MID$(f4$,1,1)
310 p7$=MID$(f4$,8,1)+MID$(f4$,4,1)+MID$(f4$,6,1)+MID$(f4$,2,1)
320 '
330 MODE 2:PRINT"Das gewuenschte Zeichen war :  "a$
340 '
350 LOCATE 1,5:PRINT "Die Speicherinhalte:":PRINT
360 PRINT "&c000        &c001        &c002        &c003
370 PRINT f1$,f2$,f3$,f4$:PRINT
380 '
390 PRINT :PRINT "Der Code der obersten Pixelreihe:":PRINT
400 PRINT p0$,"1. "p$;" (links)":PRINT p1$,"2. "p$:PRINT p2$,"3. "p$
410 PRINT p3$,"4. "p$:PRINT p4$,"5. "p$:PRINT p5$,"6. "p$
420 PRINT p6$,"7. "p$:PRINT p7$,"8. "p$;" (rechts)"
430 END
440 '
450 PRINT a$;:RETURN
460 PLOT 0,399,p:RETURN
*/ });
