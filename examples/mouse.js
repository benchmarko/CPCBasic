/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem mouse - Mouse escaping from a maze
2 rem Experimente zur KI in Basic auf CPC 464/664/6128 / M&T
3 rem
4 rem Modifications: some delay; highlight mouse; seems to not always find the exit ( if it needs to go west)
5 rem
100 REM Kuenstliche Intelligenz auf dem CPC
110 REM Titel : MAXI - PLEDGE
120 'Aus: Experimente zur KI in Basic auf CPC 464/664/6128 / M&T
130 '21.8.1988
135 'Angepasst:
136 'Richtung ri:
140 '
150 MODE 1:PAPER 0:PEN 1:BORDER 9
160 CLEAR
170 DEFSTR a-h:DEFINT i-z
180 WIDTH 60
190 '
200 '*** Supervisor ***
210 GOSUB 1000:'Initialisation
211 '
212 gosub 1040
215 locate 14,24:?"Ready?";
216 t!=time+600:while time<t! and inkey$="":wend
220 GOSUB 2000:'Hauptprg.
221 while inkey$<>"":call &bd19:wend
222 t!=time+1500:while time<t! and inkey$="":wend
227 LOCATE xh,yh:PRINT" ":'remove mouse
229 goto 212
230 '
240 'Initialisation:
1000 xa=39:ya=23:'Ausdehnungen
1005 DIM f(ya+1,xa)
1010 FOR y=1 TO ya:READ a:PRINT a
1020 FOR x=1 TO xa:f(y,x)=MID$(a,x,1):NEXT
1030 NEXT y
1031 DIM b(3)
1032 b(0)="Sueden":b(1)="Osten ":b(2)="Norden":b(3)="Westen"
1031035 return
1036 '
1040 z=0
1041 locate 1,24:?chr$(20);
1042 PRINT"Richtung___> "
1045 PRINT"Durchgang Nr.";
1050 '
1060 'x=30:y=6:'Anfangsposition
1061 'x=33:y=4:'start with no exit
1062 'x=16:y=14:'another start
1063 x=rnd*(xa-3)+2:y=rnd*(ya-3)+2:if f(y,x)="*" then 1063:'random
1065 'locate x,y:?"*";:goto 1063:'test fill
1070 xh=x:yh=y:'Hilfsspeicher
1075 gosub 4250
1090 RETURN
1100 '
1999 'Hauptprogramm
2000 ri=0:'Norden?
2010 IF f(y-1,x)=" " THEN y=y-1:GOSUB 4152:GOTO 2010:'kein Hindernis
2020 'Hindernis Nord => nach links drehen,bis Hindernis rechts ist
2030 'um das Hindernis herum, so dass es stets rechts von dir bleibt
2040 ri=ri-1
2050 IF y>=22 THEN goto 5000:'Ausgang gefunden
2060 ON ri+5 GOTO 2800,2700,2600,2500,2010
2100 'IF ri=0 THEN 2010
2110 GOTO 2060
2120 '
2499 'ri=-1 (Nord, -90)
2500 IF f(y,x-1)=" " AND f(y-1,x)<>" " THEN x=x-1:GOSUB 4152:GOTO 2060
2510 IF f(y-1,x)=" " THEN y=y-1:ri=ri+1:GOSUB 4152:GOTO 2060
2520 IF f(y,x-1)="*" THEN ri=ri-1:GOTO 2060
2530 '
2590 'ri=-2 (Ost, -180)
2600 IF f(y+1,x)=" " AND f(y,x-1)<>" " THEN y=y+1:GOSUB 4152:GOTO 2060
2610 IF f(y,x-1)=" " THEN x=x-1:ri=ri+1:GOSUB 4152:GOTO 2060
2620 IF f(y+1,x)="*" THEN ri=ri-1:GOTO 2060
2690 'ri=-3 (Sued, -270)
2700 IF f(y,x+1)=" " AND f(y+1,x)<>" " THEN x=x+1:GOSUB 4152:GOTO 2060
2710 IF f(y+1,x)=" " THEN y=y+1:ri=ri+1:GOSUB 4152:GOTO 2060
2720 IF f(y,x+1)="*" THEN ri=ri-1:GOTO 2060
2790 'ri=-4 (West, -360)??
2800 IF f(y-1,x)=" " AND f(y,x+1)<>" " THEN y=y-1:GOSUB 4152:GOTO 2060
2810 IF f(y,x+1)=" " THEN x=x+1:ri=ri+1:GOSUB 4152:GOTO 2060
2820 IF f(y-1,x)="*" THEN 4800:'kein Ausgang
2825 ?"Error":stop
2830 '
3990 'Labyrinthausdruck:
4040 '
4120 'Statusausgaben:
4152 z=z+1:'Durchgang
4160 LOCATE 14,24:PRINT USING"####";ri;:?" ";
4170 if ri<>-4 then PRINT b(ri+3); else ?"??    ";
4220 '
4230 LOCATE 15,25:PRINT z;
4240 'Mausposition:
4250 LOCATE xh,yh:PRINT" "
4260 LOCATE x,y:paper 3:PRINT"M";:paper 0
4270 '
4280 xh=x:yh=y
4285 t!=time+50:while time<t! and inkey$="":wend
4290 RETURN
4300 '
4790 'Kein Ausgang
4800 LOCATE 1,24:PRINT"Kein Ausgang!";chr$(18)
4810 return
4990 'Ausgang gefunden:
5000 LOCATE 1,24:PRINT"Ausgang gefunden !!!";chr$(18)
5010 return
5020 '
5999 'Labyrinth
6000 DATA ***************************************
6010 DATA * *   *    *        *      *  **  *   *
6020 DATA *   * **** * **  *  ****  *  **     ***
6030 DATA * **   *   *  *  *        *   *       *
6040 DATA * *    *   *     *        **   ********
6050 DATA * *           *     ****   *          *
6060 DATA * ***** **** **     *  *              *
6070 DATA *       *         ***  *   *     ******
6080 DATA *****  **** ***  *     * ***   *      *
6090 DATA *             *        *  *    ********
6100 DATA *** *** ***** *    *****  *           *
6110 DATA *     *       *  **       *           *
6120 DATA * ***   ** * **   *      * ***  **   **
6130 DATA * *      * *  *   **   **  *   ***   **
6140 DATA *      *   *  **    ***   *      ******
6150 DATA *                                     *
6160 DATA *     *   *                         ***
6170 DATA *    *          **********    ***     *
6180 DATA * ****          *        *    *       *
6190 DATA * *        ******     ****         ****
6200 DATA * ****    *                      **   *
6210 DATA *         *****                       *
6220 DATA ***     *******************************
*/ });
