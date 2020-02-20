/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
9000 rem cpclib - CPC Lib v0.2
9010 rem Marco Vieth
9020 on c.c goto 9050,9070,9090,9110
9030 print "Merge cpclib to an app.":end
9040 '1. initCpcLib
9050 return
9060 '2. wait (c.iv% 1/50 sec)
9070 c.t!=time+c.iv%*6:while time<c.t!:call &bd19:wend:return
9080 '3. waitOrKey (c.iv% 1/50 sec, or until keypress, return c.t$)
9090 c.t$="":c.t!=time+c.iv%*6:while time<c.t! and c.t$="":call &bd19:c.t$=inkey$:wend:return
9100 '4. checkMode (return max available mode c.m%=3 or c.m%=2)
9110 c.m%=3:on error goto 9130:mode c.m%
9120 on error goto 0:return
9130 if err=5 then c.m%=2:resume 9120 else 9120
9140 '
*/ });
