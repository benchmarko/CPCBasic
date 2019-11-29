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
9100 '4. checkMode (c.m%; return c.m%, if not available, c.m%=-1)
9110 on error goto 9120:mode c.m%:on error goto 0:return
9120 if err=5 then c.m%=-1:resume next else error err
9130 '
*/ });
