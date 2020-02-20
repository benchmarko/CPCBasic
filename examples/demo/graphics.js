/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM graphics - Graphics CPC Demo
110 REM Known from CPC CP/M Disk
111 rem more colors by MV
112 '
113 clear:defreal a:defint b-z
114 c.c=1:gosub 9010:'initCpcLib
117 c.c=4:gosub 9020:'checkMode
119 '
120 dim ik(15)
121 for i=0 to 15: read n:ik(i)=n:next
122 data 24,6,2, 20, 6, 26, 2, 8, 10, 12, 14, 16, 18, 22, 24, 11
125 for m=0 to c.m%
130 if m<>2 then gosub 1500
140 next m
240 goto 125
250 '
1490 'demo
1500 mode m
1510 pens=4^(2-m mod 3)+abs(m=2)
1560 INK 0,0:BORDER 0:n=0:gosub 1700
1565 locate 1,1:?"Mode":?m
1570 RAD:ORIGIN 320,200
1583 '
1584 'draw graphics
1587 n=0
1590 FOR a=0 TO 4*PI STEP PI/60
1600 MOVE 320*SIN(a/2),198*COS(a)
1610 DRAW 200*COS(a/2),198*SIN(a),n+1
1620 n=(n+1) mod (pens-1)
1630 NEXT
1632 '
1633 'wait for key or timeout and cycle colors
1635 after 50,1 gosub 1800
1640 EVERY 5 GOSUB 1700
1665 c.c=3:c.iv%=350:gosub 9020:'waitOrKey
1670 R=REMAIN(0)+remain(1)
1675 return
1680 '
1690 'cycle colors
1700 for i=0 to pens-2
1702 INK i+1,ik((n+i) mod (pens-1))
1706 next i
1708 n=(n+1) mod (pens-1)
1710 return
1780 '
1790 'remove mode text
1800 r=remain(1):locate 1,1:?space$(5):?space$(3)
1805 return
1810 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
