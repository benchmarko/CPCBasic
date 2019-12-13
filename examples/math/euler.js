/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM euler - Compute e with 1000 digits
110 MODE 2
120 PRINT"Compute e with 1000 digits"
130 CLEAR
140 DIM a(202)
150 b=100000:a(0)=1
160 FOR n=450 TO 1 STEP -1
170  FOR i=0 TO 201
180   IF a(i)=0 THEN 220
190   q=INT(a(i)/n):r=a(i)-q*n
200   a(i)=q:a(i+1)=a(i+1)+b*r
210  NEXT
220  a(0)=a(0)+1
230 NEXT
240 'Round
250 a(201)=a(201)+INT(a(202)/b+0.5)
260 FOR i=200 TO 1 STEP -1
270  u=INT(a(i)/b):a(i)=a(i)-b*u
280  a(i-1)=a(i-1)+u
290 NEXT
300 'MODE 2
310 PRINT"e="a(0)"."
320 FOR i=1 TO 200
330  a$=STR$(a(i)):a$=RIGHT$(a$,LEN(a$)-1)
340  PRINT RIGHT$("0000"+a$,5)" ";
350  'IF i MOD 13=0 THEN PRINT
360 NEXT
370 END
*/ });
