/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
50 rem mouse - Mouse escaping from a maze
100 REM Kuenstliche Intelligenz auf dem CPC
110 REM Titel : MAXI - PLEDGE
120 'Aus: Experimente zur KI in Basic auf CPC 464/664/6128 / M&T
130 '21.8.1988
140 '
150 MODE 1:PAPER 0:PEN 1:BORDER 9
160 CLEAR
170 DEFSTR a-h:DEFINT i-z
180 WIDTH 60
190 '
200 '*** Supervisor ***
210 GOSUB 1000:'Initialisation
220 GOSUB 2000:'Hauptprg.
225 GOSUB 5000:'Ausgang gef.
226 STOP
230 '
240 'Initialisation:
1000 xa=39:ya=23:'Ausdehnungen
1005 DIM f(ya+1,xa)
1010 FOR y=1 TO ya:READ a:PRINT a
1020 FOR x=1 TO xa:f(y,x)=MID$(a,x,1):NEXT
1030 NEXT y
1031 PRINT"Richtung___> "
1032 PRINT"Durchgang Nr.";
1040 s=0
1050 '
1060 x=30:y=6:'Anfangsposition
1070 xh=x:yh=y:'Hilfsspeicher
1090 RETURN
1100 '
1999 'Hauptprogramm
2000 ri=0
2010 IF f(y-1,x)=" " THEN y=y-1:GOSUB 4152:GOTO 2010:'kein Hindernis
2020 'Hindernis Nord => nach links drehen,bis Hindernis rechts ist
2030 'um das Hindernis herum, so dass es stets rechts von dir bleibt
2040 ri=ri-90
2050 IF y>=22 THEN RETURN:'Ausgang gef.
2060 IF ri=-90 THEN 2500
2070 IF ri=-180 THEN 2600
2080 IF ri=-270 THEN 2700
2090 IF ri=-360 THEN 2800
2100 IF ri=0 THEN 2010
2110 GOTO 2060
2120 '
2499 'ri=-90
2500 IF f(y,x-1)=" " AND f(y-1,x)<>" " THEN x=x-1:GOSUB 4152:GOTO 2060
2510 IF f(y-1,x)=" " THEN y=y-1:ri=ri+90:GOSUB 4152:GOTO 2060
2520 IF f(y,x-1)="*" THEN ri=ri-90:GOTO 2060
2530 '
2590 'ri=-180
2600 IF f(y+1,x)=" " AND f(y,x-1)<>" " THEN y=y+1:GOSUB 4152:GOTO 2060
2610 IF f(y,x-1)=" " THEN x=x-1:ri=ri+90:GOSUB 4152:GOTO 2060
2620 IF f(y+1,x)="*" THEN ri=ri-90:GOTO 2060
2690 'ri=-270
2700 IF f(y,x+1)=" " AND f(y+1,x)<>" " THEN x=x+1:GOSUB 4152:GOTO 2060
2710 IF f(y+1,x)=" " THEN y=y+1:ri=ri+90:GOSUB 4152:GOTO 2060
2720 IF f(y,x+1)="*" THEN ri=ri-90:GOTO 2060
2790 'ri=-360
2800 IF f(y-1,x)=" " AND f(y,x+1)<>" " THEN y=y-1:GOSUB 4152:GOTO 2060
2810 IF f(y,x+1)=" " THEN x=x+1:ri=ri+90:GOSUB 4152:GOTO 2060
2820 IF f(y-1,x)="*" THEN PRINT"Kein Ausgang !":STOP
2830 '
3990 'Labyrinthausdruck:
4040 '
4120 'Statusausgaben:
4152 z=z+1:'Durchgang
4160 LOCATE 14,24:PRINT USING"####";ri;:PRINT"   ";
4180 IF ri=-180 THEN PRINT"Sueden"
4190 IF ri=-270 THEN PRINT"Osten "
4200 IF ri=0    THEN PRINT"Norden"
4210 IF ri=-90  THEN PRINT"Westen"
4220 '
4230 LOCATE 15,25:PRINT z;
4240 'Mausposition:
4250 LOCATE xh,yh:PRINT" "
4260 LOCATE x,y:PRINT"M"
4270 '
4280 xh=x:yh=y
4290 RETURN
4300 '
4990 'Ausgang gefunden:
5000 LOCATE 1,24:PRINT"Ausgang gefunden !!!    ":CALL &BB18
5010 STOP
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
