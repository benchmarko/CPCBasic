/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
40 rem rastercircle
50 rem https://de.wikipedia.org/wiki/Bresenham-Algorithmus
55 mode 0
60 origin 320,200
70 radius=200:c=0
75 dim col(8)
77 for i=0 to 7:read d:col(i)=d:next
78 'for i=1 to 8:ink i,24:next
80 gosub 100
85 'every 50 gosub 100
90 goto 400
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
330 return
390 '
400 every 15 gosub 500
410 goto 800
500 for i=0 to 7
510 ink i+1,col((i+c1) mod 8)
525 next
526 c1=c1+1
530 return
700 '
800 while inkey$="":call &bd19:wend
810 r=remain(0)
900 end
950 data 24, 20, 6, 26, 0, 2, 8, 10
*/ });
