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
290 c.iv%=250:gosub 5040:'wait
300 goto 185
310 '
320 'a(i,0)=Amplitude der Fourier-Synthese
330 'a(i,1)=entsprechende Phasen
340 'a(i,2)=entsprechende Farben
4990'
5000 'CPCBasic lib v0.1
5010 '1. wait c.iv 1/50 sec
5020 c.t!=time+c.iv%*6:while time<c.t!:call &bd19:wend:return
5030 '2. wait c.iv% 1/50 sec, or until keypress (return c.t$)
5040 c.t$="":c.t!=time+c.iv%*6:while time<c.t! and c.t$="":call &bd19:c.t$=inkey$:wend:return
5050 '3. set mode c.m% (return c.m%; if not avvailable, c.m%=-1)
5060 on error goto 5070:mode c.m%:on error goto 0:return
5070 if err=5 then c.m%=-1:resume next else error err
5080 '
*/ });
