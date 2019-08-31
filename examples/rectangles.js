/* globals cpcBasic */

"use strict";

cpcBasic.addItem("",  String.raw`
100 'rectangles
110 MODE 2
120 for i = 0 to 48 step 2
130 move 0+i,0+i
140 draw 639-i,0+i
150 draw 639-i,399-i
160 draw 0+i,399-i
170 draw 0+i,0+i
180 frame
190 next
`);
