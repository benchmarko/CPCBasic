/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Sphere 1 (Kugel 1)
110 REM Marco Vieth, 2.12.1989
120 '
130 CLEAR:DEFINT a-z:DEFREAL a,x-z:DEG
131 w1=10:w2=0:w3=80:r=150
132 INK 0,0:INK 1,24:INK 3,6
133 c.c=1:gosub 9010:'initCpcLib
134 c.c=4:gosub 9020:'checkMode
135 '
140 for m=0 to c.m%
142 gosub 160
148 next
150 goto 140
155 '
160 MODE m
163 locate 1,1:pen 3:?"Mode";m:pen 1
165 after 100 gosub 700
170 'Laengenkreise
180 FOR a=0 TO 180 STEP 15
190 GOSUB 390:p1=bx:p2=by
200 FOR h=0 TO 360 STEP 15
210 GOSUB 390
220 p3=bx:p4=by
230 PLOT p1,p2:DRAW p3,p4,1
240 p1=p3:p2=p4
250 PLOT bx,by
260 NEXT h,a
270 'Breitenkreise
280 FOR h=-90 TO 90 STEP 15
290 a=0
300 GOSUB 390:p1=bx:p2=by
310 FOR a=0 TO 360 STEP 15
320 GOSUB 390
330 p3=bx:p4=by
340 PLOT p1,p2:DRAW p3,p4,3
350 p1=p3:p2=p4
360 NEXT a,h
365 c.c=3:c.iv%=200:gosub 9020:'waitOrKey
367 rm=remain(0)
370 return
375 '
380 'Rotationsmatrix
390 x=COS(h)*COS(a)
400 y=COS(h)*SIN(a)
410 z=SIN(h)
420 a[1]=COS(w2)*COS(w3)
430 a[2]=-COS(w2)*SIN(w3)
440 a[3]=SIN(w2)
450 a[4]=COS(w1)*SIN(w3)+SIN(w1)*SIN(w2)*COS(w3)
460 a[5]=COS(w1)*COS(w3)-SIN(w1)*SIN(w2)*SIN(w3)
470 a[6]=-SIN(w1)*COS(w2)
480 a[7]=SIN(w1)*SIN(w3)-COS(w1)*SIN(w2)*COS(w3)
490 a[8]=SIN(w1)*COS(w3)+COS(w1)*SIN(w2)*SIN(w3)
500 a[9]=COS(w1)*COS(w2)
510 xa=a[1]*x+a[2]*y+a[3]*z
520 ya=a[4]*x+a[5]*y+a[6]*z
530 za=a[7]*x+a[8]*y+a[9]*z
540 bx=320+r*xa:by=200+r*za
550 RETURN
560 '
700 rm=remain(0):LOCATE 1,1:?space$(7);:return
710 '
9000 'cpclib will be merged...
9010 chain merge "cpclib"
9020 return
*/ });
