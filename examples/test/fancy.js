/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM fancy - test copychr$
20 rem
30 '|renum,10,1,10,9000:stop
40 CLEAR:DEFINT a-z:RANDOMIZE TIME
50 c.c=1:gosub 9010:'initCpcLib
60 c.c=4:gosub 9020:'checkMode
70 '
80 useCopychr=0
90 on error goto 120
100 t$=copychr$(#0)
110 useCopychr=1
120 on error goto 0
130 '
140 for m=0 to c.m%
150 if m<>2 then gosub 190
160 next
170 goto 140
180 '
190 MODE m:xd=2^(2-min(m,2)):yd=((m=3)+2):rows=50/yd
200 PEN 1:PAPER 0
205 locate 1,rows:?"Mode";m;
210 c$=CHR$(&CD)+CHR$(&60)+CHR$(&BB)+CHR$(&32)+CHR$(0)+CHR$(0)+CHR$(&C9): 'call &BB60 (TXT RD CHAR)
220 fancy$="F"+CHR$(15)+CHR$(2)+"a"+CHR$(15)+CHR$(3)+"n"+CHR$(15)+CHR$(1)+CHR$(24)+"cy"+CHR$(24)+" s"+CHR$(14)+CHR$(2)+"t"+CHR$(14)+CHR$(3)+"u"+CHR$(14)+CHR$(0)+"ff"+"!"
230 LOCATE 1,1:PRINT fancy$;" ";
240 locate 1,4:print fancy$;
250 lp=0
260 '
270 ' pixelize the first 12 characters
280 xstart=0
290 FOR i=1 TO 12
300 ckeep=1:IF i=2 OR i=3 OR i=7 OR i=10 THEN ckeep=0: 'the color to keep (1=pen or 0=paper)
310 FOR y=0 TO 7:FOR x=0 TO 7
320 xp=xstart+x*xd:yp=399-y*yd
330 IF TEST(xp,yp)=ckeep THEN 360
340 c=INT(RND*3+0.5):IF c=ckeep THEN 340
350 PLOT xp,yp,c :'set random color which is not the kept color
360 NEXT x,y
370 xstart=xstart+xd*8
380 CALL &BD19:NEXT i
390 '
400 ' recognize characters
410 r=1:gosub 510:LOCATE 1,2:PRINT a$;
420 r=4:gosub 510:LOCATE 1,5:PRINT a$;
430 '
440 t!=TIME+300:WHILE TIME<t! AND INKEY$="":CALL &BD19:WEND
450 LOCATE 1,2:PRINT CHR$(18);
460 LOCATE 1,5:PRINT CHR$(18);
470 lp=lp+1:if lp>3 then lp=0:return
480 GOTO 280
490
500 'recognize characters in line r
510 a$="":FOR i=1 TO 12*2+1:LOCATE i,r:
520 IF useCopychr then t$=COPYCHR$(#0) else GOSUB 580
530 a$=a$+t$
540 NEXT
550 return
560 '
570 'call &BB60 (TXT RD CHAR) as COPYCHR$ on any CPC
580 a%=UNT(PEEK(@c$+1)+PEEK(@c$+2)*&100)
590 CALL a%:b%=PEEK(0)
600 t$=CHR$(b%)
610 RETURN
620 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
