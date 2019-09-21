/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 REM CPC Basic: Big Text
15 mode 1
20 INK 2,2
30 READ caracter:IF caracter=0 THEN RESTORE:GOTO 30
40 PAPER 0:cls:PEN 2:LOCATE 2,24:PRINT "CPC";:LOCATE 1,25:PRINT "Basic";
50 PAPER 3:PEN 1
60 FOR y=1 TO 16
70 FOR x=1 TO 40
80 IF TEST((x-1)*2,32-y*2)=2 THEN LOCATE x,y+4:PRINT CHR$(caracter);
90 NEXT x,y
95 t=time+600
97 if inkey$="" and t>time then call &bd19:goto 97
100 GOTO 30
110 DATA &43,&50,&43,&42,&61,&73,&69,&63,&00
*/ });
