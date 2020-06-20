/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
50 rem Simple Labyrinth
60 rem Idea from: https://scruss.com/blog/tag/amstrad/
70 clear:defint a-z
75 c.c=1:gosub 9010:'initCpcLib
80 c.c=4:gosub 9020:'checkMode
81 '
82 for m=0 to c.m%
83 gosub 100
84 next
85 goto 82
90 '
100 mode m
102 cols=80/2^(2-min(m,2)):rows=50/((m=3)+2)
105 locate 1,rows:?"Mode";m;:locate 1,1
106 f=0
107 after 50*8 gosub 300
110 while f=0
115 t!=time
120 a$=""
130 while len(a$)<cols
140 a$=a$+CHR$(199+2*RND)
150 wend
160 print a$;
170 t!=time-t!:c.iv%=5-t!/6:if c.iv%>0 then c.c=2:gosub 9020:'wait
175 if inkey$<>"" then gosub 300
180 wend
185 return
190 '
300 r=remain(0):f=1:return
310 '
9000 'cpclib will be merged...
9010 chain merge "cpclib"
9020 return
*/ });
