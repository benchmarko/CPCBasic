/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM art - Computer Art
102 REM Computerkunst+Kreativitaet
103 REM (c) Olaf Hartwig
104 REM Experimente zur Künstlichen Intelligenz in Basic auf CPC 464/664/6128, page 112
105 REM http://www.cpcwiki.eu/imgs/1/1e/Hartwig%2C_Experimente_zur_KI.pdf
110 'Modifications by Marco Vieth, 16.6.1988
115 'similar to Desert Prive (https://amstrad.eu/desert-prive/)
120 '
130 CLEAR:DEFINT h-p
132 c.c=1:gosub 9010:'initCpcLib
133 c.c=4:gosub 9020:'checkMode
150 unten=9:'untere Bildsch.grenze
160 h=20:'Anzahl der Huegel
170 INK 0,11:INK 14,16:INK 15,18
171 DIM a(h,2)
172 '
173 for m=0 to c.m%
176 gosub 183
177 next
178 goto 173
182 '
183 MODE m
186 locate 1,1:pen 3:?"Mode";m:pen 1
187 after 100 gosub 500
189 pWidth=2^(2-min(m,2))
190 FOR i=0 TO h
192 a(i,0)=RND*100/(i+1)
194 a(i,1)=RND*2*PI
196 a(i,2)=RND*15
198 NEXT
200 '
210 FOR i=1 TO 640 STEP pWidth
220 w=2*i/640*PI
230 y=unten
240 PLOT i-1,1
250 FOR p=0 TO h
260 y=y+a(p,0)*(1+SIN(p*w+a(p,1)))
270 DRAW i-1,y,a(p,2)
280 NEXT p,i
285 '
290 t!=time+250*6:while time<t! and inkey$="":wend
300 r=remain(0)
305 return
310 '
320 'a(i,0)=Amplitude der Fourier-Synthese
330 'a(i,1)=entsprechende Phasen
340 'a(i,2)=entsprechende Farben
350 '
500 r=remain(0):LOCATE 1,1:?space$(7);:return
510 '
9000 'cpclib will be merged...
9010 chain merge "cpclib"
9020 return
*/ });
