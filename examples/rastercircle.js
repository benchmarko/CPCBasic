/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 rem rastercircle - Raster circle
20 rem https://de.wikipedia.org/wiki/Bresenham-Algorithmus
30 '
40 clear:defint a-z
41 c.c=1:gosub 9010:'initCpcLib
42 c.c=4:gosub 9020:'checkMode
44 radius=200:c=0
45 dim col(8)
46 for i=0 to 7:read d:col(i)=d:next
49 '
50 for m=0 to c.m%
51 gosub 60
53 next
55 goto 50
57 '
60 mode m
62 locate 1,1:pen 3:?"Mode";m:pen 1
70 after 100,1 gosub 800
80 origin 320,200
100 f=1-radius
110 ddFx=0
120 ddFy=-2*radius
130 x=0
140 y=radius
150 'plot x0, y0 + radius
160 'plot x0, y0 - radius
170 'plot x0 + radius, y0
180 'plot x0 - radius, y0
190 while x < y
200 if f >= 0 then y=y-1: ddFy=ddFy+2: f=f+ddFy
210 x=x+1
220 ddFx=ddFx+2
230 f=f+ddFx+1
240 move 0,0:draw x0 + x, y0 + y,1
262 move 0,0:draw x0 + y, y0 + x,2
263 move 0,0:draw x0 + y, y0 - x,3
264 move 0,0:draw x0 + x, y0 - y,4
266 move 0,0:draw x0 - x, y0 - y,5
310 move 0,0:draw x0 - y, y0 - x,6
311 move 0,0:draw x0 - y, y0 + x,7
315 move 0,0:draw x0 - x, y0 + y,8
320 wend
390 '
400 every 15 gosub 500
410 c.c=3:c.iv%=250:gosub 9020:'waitOrKey
420 r=remain(0)+remain(1)
440 return
490 '
500 for i=0 to 7
510 ink i+1,col((i+c1) mod 8)
525 next
526 c1=c1+1
530 return
700 '
800 r=remain(1):LOCATE 1,1:?space$(7);:return
810 '
940 'colors
950 data 24, 20, 6, 26, 0, 2, 8, 10
980 '
9000 'cpclib will be merged...
9010 chain merge "cpclib"
9020 return
*/ });
