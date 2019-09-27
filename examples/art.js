/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Computer Art (Computerkunst+Kreativitaet)
110 'M.V.  16.6.1988
120 '
130 CLEAR:DEFINT h-p
135 m=0
150 unten=9:'untere Bildsch.grenze
160 h=20:'Anzahl der Huegel
170 INK 0,11:INK 14,16
180 DIM a(h,2)
185 MODE m
187 pWidth=2^(2-min(m,2))
190 FOR i=0 TO h:a(i,0)=RND*100/(i+1):a(i,1)=RND*2*PI:a(i,2)=RND*15:NEXT
200 '
210 FOR i=1 TO 640 STEP pWidth
220 w=2*i/640*PI
230 y=unten
240 PLOT i-1,1
250 FOR p=0 TO h
260 y=y+a(p,0)*(1+SIN(p*w  +a(p,1)))
270 DRAW i-1,y,a(p,2)
280 NEXT p,i
290 'CALL &BB18
291 cont1=0
292 after 250 gosub 305
295 t$=inkey$:call &bd19:if t$="" and cont1=0 then 295
207 r=remain(0)
300 goto 185
305 cont1=1:return
310 '
320 'a(i,0)=Amplitude der Fourier-Synthese
330 'a(i,1)=entsprechende Phasen
340 'a(i,2)=entsprechende Farben
*/ });
