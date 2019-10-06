/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
50 rem Simple Labyrinth
60 rem Idea from: https://scruss.com/blog/tag/amstrad/
70 defint a-z
80 c.m%=3:gosub 5060:'check mode
82 for m=0 to 3
83 if m<>3 or c.m%=3 then gosub 100
84 next
85 goto 82
90 '
100 mode m
105 cols=80/2^(2-min(m,2))
106 f=0
107 after 50*8 gosub 300
110 while f=0
115 t!=time
120 a$=""
130 while len(a$)<cols
140 a$=a$+CHR$(199+2*RND)
150 wend
160 print a$;
170 t!=time-t!:c.iv%=5-t!/6:if c.iv%>0 then gosub 5020:'wait
175 if inkey$<>"" then gosub 300
180 wend
185 return
190 '
300 r=remain(0):f=1:return
4990'
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
