/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Graphics CPC Demo
110 REM Known from CPC CP/M Disk
115 dim md(2):md(0)=1:md(1)=0
116 c.m%=3:gosub 5060:'check mode
117 if c.m%=3 then md(2)=3 else md(2)=-1
118 '
120 for i2=0 to 2
125 m=md(i2)
130 if m>-1 then gosub 1500
140 next
230 'run"colors"
240 goto 120
250 '
1500 mode m
1560 INK 0,0:BORDER 0:INK 1,24:INK 2,6:INK 3,2
1565 locate 1,1:?"Mode":?m
1570 RAD
1580 ORIGIN 320,200
1584 '
1585 i=1
1590 FOR a=0 TO 4*PI STEP PI/60
1600 MOVE 320*SIN(a/2),198*COS(a)
1610 DRAW 200*COS(a/2),198*SIN(a),i
1620 i=i+1:IF i=4 THEN i=1
1630 NEXT
1635 after 50,1 gosub 1800
1640 EVERY 5 GOSUB 1680
1665 c.iv%=350:gosub 5040:'wait
1670 R=REMAIN(0)+remain(1)
1675 return
1677 '
1680 IF i=1 THEN INK 1,24:INK 2,6:INK 3,2:i=2:RETURN
1690 IF I=2 THEN INK 1,6:INK 2,2:INK 3,24:I=3:RETURN
1700 IF I=3 THEN INK 1,2:INK 2,24:INK 3,6:I=1:RETURN
1710 stop
1790 '
1800 r=remain(1):locate 1,1:?space$(5):?space$(3):return
4990 '
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
