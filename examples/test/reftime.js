/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM reftime - Reference Timings
20 MODE 2
30 m%=1:t=0:c=0
40 PRINT"Test Run Ticks   Loops    Sec     LpS  LpsR  Fact  Description"
50 '
60 READ d$:IF d$="#" THEN PRINT"end":STOP
70 READ lr,tr
80 lpsr=300*lr/tr 'loops per second
90 n%=1:l%=lr
100 '
110 CALL &BD19:t=TIME
120 FOR c%=1 TO l%
130 ON m% GOSUB 260,280,300,320,340,360,380
140 NEXT
150 t=TIME-t
155 if t<1 then t=1
160 sec=t/300
170 lps=300*l%/t
180 fac=lps/lpsr
190 f=300*2/t 'not 2 sec?
200 IF f>2 THEN l%=INT(l%*f):n%=n%+1:GOTO 110 'too fast, do it again
210 PRINT USING "#### ### ##### ####### ##.### ####### ##### #####  &";m%,n%,t,l%,sec,lps,lpsr,fac,d$
220 m%=m%+1
230 GOTO 60
240 '
250 DATA "empty",1000,732
260 RETURN
270 DATA "GOSUB+RETURN",1000,888
280 GOSUB 260:RETURN
290 DATA "FOR i% loop",1000,2723
300 FOR i%=1 TO 10:NEXT:RETURN
310 DATA "FOR r! loop",500,2407
320 FOR r!=1 TO 10:NEXT:RETURN
330 DATA "WHILE i% loop",350,2986
340 i%=0:WHILE i%<10:i%=i%+1:WEND:RETURN
350 DATA "WHILE r! loop",300,3373
360 r!=0:WHILE r!<10:r!=r!+1:WEND:RETURN
370 DATA "PRINT chr+ctrl",1000,2500
380 PRINT"A";CHR$(8);:RETURN
390 DATA "#",0,0
400 '
*/ });
