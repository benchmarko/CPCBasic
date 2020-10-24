/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 rem linemask - Line Mask
20 rem
30 INK 14,9:INK 15,15:BORDER 4
40 DEFINT a-z
50 dim pa(7)
60 b=1:for p=0 to 7:pa(p)=b:b=b*2:next
70 '
80 for m=0 to 2
90 xd=2^(2-min(m,2)):yd=((m=3)+2)
100 MODE m:paper #1,11:cls#1:locate 1,24
110 h=1:gosub 170
120 h=2:gosub 170
130 call &bb18
140 next m
150 goto 80
160 '
170 t!=time
172 tp=0: 'background transparent mode 0 or -1
174 graphics pen ,(tp=0)+1
180 k=&X10110100
190 x1=0:if h=2 then x1=320
200 x2=x1+xd*8*8-1
210 y1=398:y2=0
220 c=1:f=1
230 gosub 330
235 ym=(y2+(y1-y2)\2):ym=ym-(ym mod yd)
240 for y=y1 to y2 step -yd
250 on h gosub 370,410
260 c=c+1:if c>15 then c=1:f=f xor 1:k=k+1:gosub 330
265 if y=ym then tp=not tp:if h=1 then graphics pen ,(tp=0)+1
270 next
280 t!=time-t!
285 graphics pen ,0
290 tag:move 8*xd+((h=1)+1)*320,2*8*yd,1:?int(t!/300*1000);:tagoff
300 return
310 '
320 ' init method
330 if h=1 then MASK k,f else p=7
340 return
350 '
360 REM method 1: MASK instruction
370 MOVE x1,y:DRAW x2,y,c
380 return
390 '
400 REM method 2: BASIC MASK simulation
410 fd=0:if f=0 then fd=xd
420 for x=x1+fd to x2 step xd
430 b=pa(p)
440 if (k and b)=b then PLOT x,y,c else if not tp then plot x,y,0
450 p=p-1:if p<0 then p=7
460 next
470 return
480 '
*/ });
