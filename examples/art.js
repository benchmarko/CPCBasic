/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Computer Art (Computerkunst+Kreativitaet)
110 'Marco Vieth,  16.6.1988
120 '
125 chain merge "cpclib",130:'subroutines at 5000
126 '
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
290 c.iv%=250:gosub 5040:'wait
300 goto 185
310 '
320 'a(i,0)=Amplitude der Fourier-Synthese
330 'a(i,1)=entsprechende Phasen
340 'a(i,2)=entsprechende Farben
5000 'cpclib will be merged...
*/ });
