/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM fancy - test copychr$
20 MODE 1:CLEAR:DEFINT a-z:RANDOMIZE TIME:PEN 1:PAPER 0
30 useCopychr=0: 'set this to use copychr$
40 c$=CHR$(&CD)+CHR$(&60)+CHR$(&BB)+CHR$(&32)+CHR$(0)+CHR$(0)+CHR$(&C9): 'call &BB60 (TXT RD CHAR)
50 fancy$="F"+CHR$(15)+CHR$(2)+"a"+CHR$(15)+CHR$(3)+"n"+CHR$(15)+CHR$(1)+CHR$(24)+"cy"+CHR$(24)+" s"+CHR$(14)+CHR$(2)+"t"+CHR$(14)+CHR$(3)+"u"+CHR$(14)+CHR$(0)+"ff"+"!"
60 LOCATE 1,1:PRINT fancy$;" ";fancy$
70 ' pixelize the first 12 characters
80 xstart=0
90 FOR i=1 TO 12
100 ckeep=1:IF i=2 OR i=3 OR i=7 OR i=10 THEN ckeep=0: 'the color to keep (1=pen or 0=paper)
110 FOR y=0 TO 7:FOR x=0 TO 7
120 xp=xstart+x*2:yp=399-y*2
130 IF TEST(xp,yp)=ckeep THEN 160
140 c=INT(RND*3+0.5):IF c=ckeep THEN 140
150 PLOT xp,yp,c :'set random color which is not the kept color
160 NEXT x,y
170 xstart=xstart+2*8
180 CALL &BD19:NEXT i
190 ' recognize characters in first line
200 a$="":FOR i=1 TO 12*2+1:LOCATE i,1:
210 GOSUB 290
220 a$=a$+t$
230 NEXT
240 LOCATE 1,5:PRINT a$;
250 t!=TIME+600:WHILE TIME<t! AND INKEY$="":CALL &BD19:WEND:LOCATE 1,5:PRINT CHR$(18);
260 GOTO 80
270 '
280 'call &BB60 (TXT RD CHAR) as COPYCHR$ on any CPC
290 IF useCopychr OR PEEK(&BB60)<>&CF THEN t$=COPYCHR$(#0):GOTO 330: 'flag set or CPCBasic
300 a%=UNT(PEEK(@c$+1)+PEEK(@c$+2)*&100)
310 CALL a%:b%=PEEK(0)
320 t$=CHR$(b%)
330 RETURN
*/ });
