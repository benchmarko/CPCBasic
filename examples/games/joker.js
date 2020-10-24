/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
10 rem joker - Black Joker (Der Schwarze Joker)
20 rem (c) Marco Vieth
30 rem
90 REM Der Schwarze Joker
100 CLEAR:GOSUB 10000
110 MODE 1:INK 1,24:INK 2,7:INK 3,6,12:PEN 1:PAPER 0
120 CLEAR:GOSUB 5050:GOSUB 5000:RANDOMIZE TIME
130 p=1:GOSUB 2310:sp=0:j1=3:j2=3:ON ERROR GOTO 2010
140 sp=sp+1:LOCATE 18,j1:PRINT "3";n$(sp);"1":T$="":j2=j1:j1=j1+5
150 IF za2=55 THEN 2610 ELSE IF a(sp)=0 THEN 180
160 CALL &BB03:WHILE t$<"1" OR t$>"5":t$=INKEY$:IF UPPER$(t$)="E" THEN STOP ELSE WEND:t=VAL(t$)
170 ON t GOSUB 510,610,810,1000,1100
180 LOCATE 18,j2:PRINT "1";n$(sp);:IF sp=anz THEN sp=0:j1=3:j2=3 
190 GOTO 140 
500 REM *** Karte nehmen ***
510 IF a(sp)=5 THEN ERROR 31 
520 IF za1=55 THEN ERROR 34  
530 FOR i=1 TO 5:IF po$(sp,i)="" THEN x=455+(35*(i-1)):Y=p(sp):a$=CHR$(207):b$=a$:pe=1:GOSUB 5000 ELSE NEXT i    
540 o=i:GOSUB 2110  
550 a(sp)=a(sp)+1
560 RETURN
600 REM *** Karte aufdecken *** 
610 IF za1<55 THEN IF a(sp)=2 THEN ERROR 32   
620 GOSUB 910
630 b$=LEFT$(po$(sp,nr),1):a$=MID$(po$(sp,nr),3,1):pe=VAL(MID$(po$(sp,nr),5,2)) 
640 y=p(sp):x=455+(35*(nr-1)):GOSUB 5000
650 a(sp)=a(sp)-1
660 mul=1:IF a$=b1$ OR a$=b2$ THEN mul=-mul
670 IF b$="Z" THEN mul=mul*10 ELSE IF b$="A" THEN mul=mul*11 ELSE IF b$="B" THEN mul=mul*20 ELSE IF b$="D" THEN mul=mul*3 ELSE IF b$="K" THEN mul=mul*4 ELSE IF b$<>"J" AND b$<>"0" THEN mul=mul*VAL(b$)
680 IF b$="J" THEN IF pe=2 THEN mul=-pu(sp) ELSE mul=pu(sp)   
690 IF b$="0" THEN mul=INT(pu(sp)/2) 
700 pu(sp)=pu(sp)+mul:GOSUB 2210:po$(sp,nr)=""
710 IF mul<0 THEN FOR i=100 TO 500 STEP 50:SOUND 2,i,15,5:NEXT i ELSE FOR i=500 TO 50 STEP -50:SOUND 2,i,15,5:NEXT i  
720 IF (SQ(2) AND 128)<>0 THEN 720
730 a$=" ":b$=" ":p=0:GOSUB 5000:p=1
740 za2=za2+1:IF za2=55 THEN 2610 ELSE RETURN   
800 REM *** Karte schieben ***
810 h=sp-1:IF h=0 THEN h=anz
820 IF a(h)=5 THEN ERROR 33
830 IF za1<55 THEN IF a(sp)=2 THEN ERROR 32  
840 GOSUB 910
850 FOR i=1 TO 5:IF po$(h,i)<>"" THEN NEXT i 
860 po$(h,i)=po$(sp,nr):po$(sp,nr)="":x=455+(35*(i-1)):Y=p(h):a$=CHR$(207)
870 b$=a$:pe=1:GOSUB 5000 
880 x=455+(35*(nr-1)):Y=p(sp):a$=" ":b$=" ":p=0:GOSUB 5000:p=1
890 a(sp)=a(sp)-1:a(h)=a(h)+1:RETURN  
900 REM *** Eingabe der Kartennummer ***
910 LOCATE 1,25:PRINT"Kartennummer (";:FOR i=1 TO 5:IF po$(sp,i)<>"" THEN PRINT i;:h$=h$+STR$(i)  
920 NEXT i:IF h$="" THEN 180 ELSE PRINT"):":t$="":WHILE INSTR(h$,t$)=0 OR t$="" 
930 t$=INKEY$:WEND:nr=VAL(t$):LOCATE 1,25:PRINT SPACE$(38):h$="" 
940 RETURN
990 REM *** Hilfe ***
1000 GOSUB 910:LOCATE 1,25:PRINT"Die Karte"nr"ist ";
1010 h$="klein":IF VAL(po$(sp,nr))=0 THEN h$="gross" ELSE IF VAL(po$(sp,nr))>5 THEN h$="mittel"
1020 PRINT h$+".";:CALL &BB18:PRINT CHR$(17);:RETURN
1100 LOCATE 1,25:PRINT"Wirklich ENDE ???";:t$="":WHILE t$<>"N" AND t$<>"J"
1110 t$=UPPER$(INKEY$):WEND:IF t$="N" THEN PRINT CHR$(17);:RETURN
1120 GOTO 2610
2000 REM *** error ***
2010 LOCATE 2,25:IF ERR<=30 THEN PRINT"Fehler";ERR;"in Zeile";ERL:STOP 
2020 RESTORE 2060:BORDER ERR\2,ERR\3:FOR i=1 TO ERR-30:READ er$:NEXT i
2030 PRINT er$:CALL &BB18:LOCATE 1,25:PRINT SPACE$(30);:t$="" 
2040 BORDER 6:RESUME 160
2050 REM *** error DATAS ***
2060 DATA schon 5 Karten vorhanden,du hast zu wenig Karten 
2070 DATA Nachbar hat 5 Karten,Kartenstapel leer, 
2100 REM *** Karten zuweisen ***
2110 LOCATE 14,j2+3:PRINT"0Moment1";
2120 a=INT(RND*13)+1:b=INT(RND*5):IF b=0 AND a>3 OR RIGHT$(ka$(a,b),2)="XX" THEN 2120    
2130 po$(sp,o)=ka$(a,b):ka$(a,b)=ka$(a,b)+"XX" 
2140 za1=za1+1:LOCATE 14,j2+3:PRINT SPACE$(6):RETURN
2200 REM *** Punkte ***
2210 j=4:FOR i=1 TO anz:LOCATE 22,j:PRINT pu(i):j=j+5:NEXT i 
2220 RETURN    
2300 REM *** Eingabe + Aufbau ***  
2310 MODE 1:LOCATE 10,2:PRINT"Wieviele Spieler (max 341):";  
2320 WHILE t$<"2" OR t$>"4":t$=INKEY$:WEND:anz=VAL(t$):PRINT ANZ   
2330 DIM n$(anz),ka$(13,4),po$(anz,5) 
2340 WINDOW #1,10,24,12,12:PAPER #1,2:PEN #1,1:CLS#1:LOCATE 13,10 
2350 PRINT"Name
. Spieler":FOR i=1 TO anz:LOCATE 11,11:PRINT LEFT$(STR$(i),2);
2360 LINE INPUT #1,n$(i):n$(i)=UPPER$(LEFT$(n$(i),1))+LOWER$(MID$(n$(i),2,13)):NEXT i 
2370 PAPER 2:CLS
2380 j=3:FOR i=1 TO anz:pu(i)=80:WINDOW #i,29,39,j,j+3:PAPER #i,0 
2390 PEN #i,1:CLS#i:LOCATE 18,j:PRINT n$(i):j=j+5:NEXT i 
2400 LOCATE 1,6:PRINT"311)Nehmen":PRINT"
321)Aufdecken":PRINT"
331)Schieben"
2405 PRINT"
341)Hilfe":PRINT"
351)Ende"
2410 FOR i=1 TO 4:FOR j=1 TO 13:ka$(j,i)=w$(j)+","+s$(i)+","+STR$(pe(i)):NEXT j,i 
2420 ka$(1,0)=w$(14)+","+w$(14)+",2":ka$(2,0)=w$(14)+","+w$(14)+",3" 
2430 ka$(3,0)="0,0,0":A$=CHR$(207):B$=A$:pe=1:FOR J=360 TO 120 STEP -80 
2440 sp=sp+1:IF sp>anz THEN 2460  
2450 FOR I=0 TO 1:a(sp)=i+1:X=455+(35*I):Y=J:GOSUB 5000:o=a(sp):GOSUB 2110:NEXT I,j 
2460 p(1)=360:p(2)=280:p(3)=200:p(4)=120 
2470 a=INT(RND*4)+1:b=INT(RND*4)+1:b1$=s$(a):b2$=s$(b):a=pe(a):b=pe(b):IF a=b THEN 2470 
2480 IF a=2 THEN a=0 ELSE IF b=2 THEN b=0
2490 LOCATE 10,1:PRINT"Bezahlen bei :";:PEN a:PRINT b1$;"1 und ";:PEN b:PRINT b2$;"1"  
2500 j=4:FOR i=1 TO anz:LOCATE 14,j:PRINT"Punkte:":j=j+5:NEXT i:GOSUB 2210 
2510 RETURN
2600 REM *** Ende,denn alle Karten weg ***
2610 MODE 1:PRINT"10      G E W I N N E :"
2620 FOR i=1 TO anz:PRINT USING"\             \";n$(i);:PRINT" hat";pu(i);"Punkte erreicht":NEXT i  
2630 CALL &BB18:LOCATE 1,10:STOP
4999  REM *** Kartenzeichnen ***
5000  TAG:PLOT x+3,y-5,pe:PRINT a$;:PLOT x,y:DRAW x+19,y,p:DRAW x+19,y-50
5010  DRAW x,y-50:DRAW x,y:PLOT x+3,y-34:PRINT b$;:TAGOFF:RETURN
5040 REM *** Initialisieren ***
5050 MODE 1:INK 1,26:INK 2,6:INK 3,12,14 
5060 FOR j=1 TO 4:s$(j)=CHR$(225+j):pe(j)=3:NEXT j:pe(1)=2:pe(4)=2 
5070 RESTORE 6000:DIM w$(14):FOR j=1 TO 14:READ w$(j):NEXT j:RETURN   
6000 DATA "2","3","4","5","6","7","8","9","Z","B","D","K","A","J" 
10000 REM titelbild
10030 GOSUB 5050:p=1
10040 FOR j=365 TO 25 STEP -58:y=j:FOR i=10 TO 630 STEP 27:x=i
10050 r=INT(4*RND)+1:a$=s$(r):pe=pe(r):b$=w$(INT(14*RND)+1):IF b$="J" THEN a$=b$
10060 GOSUB 5000:NEXT i,j  
10070 WINDOW #1,13,28,12,15:CLS#1:PRINT#1,"
  DER 2SCHWARZE3       JOKER1"
10075 WINDOW #1,12,29,20,20:CLS#1:PRINT#1,"  Taste 3druecken1"  
10080 FOR j=6 TO 26:INK 2,6,j:INK 3,10+(j/2),8:SPEED INK 3,18-j/2:SOUND 2,620-j*20,35,5 
10090 IF (SQ(2) AND 128)<>0 THEN 10090 ELSE NEXT j:SPEED INK 10,10:INK 2,6:INK 3,12,14
10100 FOR m=1 TO 10:FOR n=1 TO 255:CALL &BD23,n:NEXT n:SOUND 4,500-(m*30),150,5 
10110 FOR n=0 TO 40:OUT 46359,n:CALL &BD19:SOUND 1,10*n,1,5:NEXT n:IF INKEY$="" THEN NEXT m
10120 CLS#1:PEN #1,3:PRINT#1,"Spielregeln(J/N):";
10130 WHILE t$<>"J" AND t$<>"N":t$=UPPER$(INKEY$):WEND  
10140 IF t$="N" THEN 10500 ELSE MODE 1:PEN 1:PAPER 0:INK 3,14
10199 REM *** Spielregeln ***
10200 PRINT SPACE$(7);"S P I E L R E G E L N" 
10210 PRINT"        Der 2schwarze3 Joker1
"   
10220 PRINT"Es geht darum,am Ende das meiste Geld"
10230 PRINT"zu besitzen."
10240 PRINT"Durch Zufall bestimmt der Computer zu"  
10250 PRINT"Beginn,bei welchen Farbgruppen bezahlt"
10260 PRINT"werden muss(2 Farben).Nachdem jeder 2"
10270 PRINT"2verdeckte1 Karten bekommen hat,kann er"
10280 PRINT" entweder:"  
10290 PRINT"   2a) 3 eine verdeckte Karte nehmen," 
10300 PRINT"   2b) 3 eine seiner Karten aufdeckten," 
10310 PRINT"1(und dann je nach Farbe den Wert der    Karte in Geld bekommen oder bezahlen)."  
10320 PRINT"   2c) 3 eine verdeckte Karte zu seinem"
10330 PRINT"       2linken 3Nachbarn schieben1.
"
10340 PRINT"bekommt man einen :"    
10350 PRINT"2schwarzen 1Joker: 2ist 3alles 2Geld weg1." 
10360 PRINT"3bunten 1Joker: 2wird das Geld verdoppelt1."  
10370 PRINT"Blankokarte: 2 bek.man die 3Haelfte2 des   Geldes dazu1." 
10380 PRINT"Groesste Kartenanzahl: 5  kleinste: 2"
10390 LOCATE 7,25:PRINT"(BITTE 3TASTE1 DRUECKEN)"
10400 t$="":WHILE t$="":a=a+1:t$=INKEY$:IF a=2000 THEN 10500 ELSE WEND  
10500 LOCATE 7,25:PRINT"    ( BITTE 2WARTEN1 )  "
10510 RETURN
*/ });
