/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 rem mousepa: Mouse Painting
20 rem CPCBasic only
30 mode 1
40 window #1,1,15,25,25
50 d$(0)="plot":d$(1)="draw":d$(2)="fill":d=-1
60 '
70 d=d+1:d=d mod 3:locate #1,1,1:?#1,d$(d); 'switch drawing mode
80 '
90 x0=xpos:y0=ypos
100 locate #1,5,1:?#1,x0;y0;chr$(18); 'show coordinates
110 move 1000,1000 'activate move on mouse click
120 '
130 call &bd19
135 t$=inkey$:if t$<>"" then ?t$; 'side effect: click on text
140 if xpos=1000 and ypos=1000 then 130
150 x=xpos:y=ypos
160 if x<16*4 and y<16 then move x0,y0:goto 70
170 if d=0 then plot x,y
180 if d=1 then move x0,y0:draw x,y
190 if d=2 then if test(x,y)=2 then fill 3 else fill 2
200 goto 90
*/ });
