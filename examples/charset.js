/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Character set
105 rem Marco Vieth
106 defint a-z
107 c.m%=3:gosub 5060:'check mode
110 for m=0 to 3
112 if m<>3 or c.m%=3 then gosub 120
114 next
116 goto 110
118 '
120 mode m
130 PRINT "Character set mode";str$(m):PRINT
200 FOR i=0 to 255
210 if i<32 then ch$=chr$(1)+chr$(i) else ch$=chr$(i)
220 PRINT ch$;
230 NEXT
240 c.iv%=150:gosub 5040:'wait
250 return
4990'
5000 'CPCBasic lib v0.1
5010 '1. wait c.iv 1/50 sec
5020 c.t!=time+c.iv%*6:while time<c.t!:call &bd19:wend:return
5030 '2. wait c.iv% 1/50 sec, or until keypress (return c.t$)
5040 c.t$="":c.t!=time+c.iv%*6:while time<c.t! and c.t$="":call &bd19:c.t$=inkey$:wend:return
5050 '3. set mode c.m% (return c.m%; if not available, c.m%=-1)
5060 on error goto 5070:mode c.m%:on error goto 0:return
5070 if err=5 then c.m%=-1:resume next else error err
5080 '
*/ });
