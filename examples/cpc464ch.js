/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM cpc464ch - CPC 464 Character Art
20 ON BREAK GOSUB 310
21 c.c=1:gosub 9010:'initCpcLib
22 c.c=4:gosub 9020:'checkMode
23 for m=1 to c.m%
24 gosub 30
25 next
26 goto 23
27 '
30 MODE m:rows=50/((m=3)+2):pens=4^(2-m mod 3)+abs(m=2)
35 if pens>4 then pens=4
40 X=18 :T=1 :L=26:K=6:N=26
50 INK 0,1:INK 1,24:INK 2,16:INK 3,6
55 '
60 FOR I=7 TO X+6
70 READ ANZ
80 IF ANZ=0 THEN 160
90 PEN T
100 FOR K=1 TO ANZ
110 READ D(K),W(K):NEXT K
120 FOR K=1 TO ANZ
130 LOCATE D(K),I:PRINT STRING$(W(K),CHR$(207))
140 NEXT K
150 T=T+1:IF T>pens-1 THEN T=1
160 NEXT I
170 '
175 f=0:after 50*8 gosub 340
180 LOCATE 1,rows
190 FOR i=1 TO 6:PRINT:CALL &BD19:CALL &BD19:NEXT i
200 LOCATE 1,1
210 call &bd19:'FOR A=1 TO 100:NEXT A
220 FOR i=1 TO 6:PRINT CHR$(11);:CALL &BD19:CALL &BD19:NEXT i
230 call &bd19:'FOR A=1 TO 100:NEXT A
240 GOSUB 260
245 if inkey$<>"" then gosub 340
247 if f<>0 then restore:return
250 GOTO 180
260 L=L-1:IF L=6 THEN L=26
270 K=K+2:IF K>=26 THEN K=6
280 N=N-2:IF N<=6 THEN N=26
290 INK 1,L,K:INK 2,K,N:INK 3,N,L
300 RETURN
310 REM ENDE
320 INK 1,24:INK 2,16:INK 3,6:MODE 2:STOP
335 '
340 r=remain(0):f=1:return
345 '
400 DATA 3 , 12,3 , 18,4 , 30,3
410 DATA 4 , 11,4 , 18,1 , 21,2 , 29,4
420 DATA 4 , 9,3  , 18,1 , 22,1 , 27,3
430 DATA 4 , 8,2 , 18,1 , 22,1 , 26,2
440 DATA 4 , 8,1 , 18,1 , 21,2 , 26,1
450 DATA 3 , 8,1 , 18,4 , 26,1
460 DATA 3 , 8,1 , 18,1 , 26,1
470 DATA 3 , 8,2 , 18,1 , 26,2
480 DATA 3 , 9,3 , 18,1 , 27,3
490 DATA 3 , 11,4 , 18,1 , 29,4
500 DATA 3 , 12,3 , 18,1 , 30,3
510 DATA 0,0
520 DATA 3 , 14,1 , 20,4 , 25,1
530 DATA 5 , 14,1 , 16,1 , 20,1 , 25,1 , 27,1
540 DATA 3 , 14,4 , 20,4 , 25,4
550 DATA 4 , 16,1 , 20,1 , 23,1 , 27,1
560 DATA 1 , 20,4
595 '
9000 'cpclib will be merged...
9010 chain merge "cpclib"
9020 return
*/ });
