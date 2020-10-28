/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
1 rem morse - Morse Code (Morsen)
2 rem Marco Vieth, 1988
3 rem
100 REM MORSEN
110 'verbessert: 24.5.1988
120 '
130 SYMBOL AFTER 90:SYMBOL 95,0,0,0,0,0,0,126,0
140 SYMBOL 91,66,90,36,102,126,102,102,0    
150 SYMBOL 123,102,0,102,102,102,102,60,0   
160 SYMBOL 93,146,170,68,198,198,108,56,0 
170 KEY 1,CHR$(46):KEY 2,CHR$(95):KEY 3,CHR$(47)
180 CLEAR:DEFINT a-z
190 n=45
200 DIM Z$(n,1),a$(50),b$(50)
210 FOR I=1 TO N:READ z$(i,0),z$(i,1):NEXT
220 MODE 1
230 WINDOW #1,1,20,3,25:WINDOW #2,21,40,3,25
240 LOCATE 7,3:PRINT"M  O  R  S  E  N  :"
250 LOCATE 7,6:PRINT"M E N U E :

"
260 PRINT TAB(7)"1) Buchstaben eingeben
"
270 PRINT TAB(7)"2) Morsezeichen eingeben
"
280 PRINT TAB(7)"3) Buchstaben ausgeben
"
290 PRINT TAB(7)"4) Morsezeichen ausgeben
"
300 PRINT TAB(7)"5) Hilfe

"
310 PRINT TAB(7)"6) Ende

"
320 PRINT TAB(7)"(Bitte gewuenschtes waehlen)"
330 T$=INKEY$:IF T$<"1" OR T$>"6" THEN 330
340 t=VAL(t$)
350 IF t=6 THEN MODE 2:PRINT"Bye.":END
360 CLS
370 ON t GOSUB 400,430,670,690,770
380 LOCATE 1,25:PRINT"Bitte eine Taste druecken ...   ":CALL &BB18
390 GOTO 220
400 PRINT:PRINT" LATEINISCHE SCHRIFT"TAB(22)"MORSEALPHABET"
410 a=0:b=1:'Buchstaben eingeben
420 GOTO 450
430 PRINT:PRINT" MORSEALPHABET" TAB(22);"LATEINISCHE SCHRIFT"
440 a=1:b=0:'Morsezeichen eingeben
450 LOCATE 1,1:PRINT" Eingeben:  Beenden mit '#' !"
460 FOR i=0 TO MAX(a1,b1):a$(i)="":b$(i)="":NEXT
470 a1=0:b1=0
480 IF a=1 THEN INPUT#1,t$:PRINT#1,CHR$(11);CHR$(18);:GOTO 530
490 PRINT#1,"?";
500 t$=INKEY$:IF t$="" THEN 500
510 t$=UPPER$(t$)
520 PRINT#1,CHR$(8);CHR$(16);
530 IF t$="#" THEN PRINT#1,t$:PRINT#2,t$:RETURN
540 FOR i=1 TO n:IF t$=z$(i,a) THEN 570
550 NEXT
560 PRINT#1,CHR$(13);CHR$(18);"UNM]GLICH ! (TASTE)";:CALL &BB18:PRINT#1,CHR$(13);CHR$(18);:GOTO 480
570 PRINT#1,t$:PRINT#2,z$(i,b)
580 IF LEN(b$(b1)+z$(i,b))>38 THEN b1=b1+1
590 b$(b1)=b$(b1)+z$(i,b)
600 IF LEN(a$(a1)+t$)>38 THEN a1=a1+1
610 a$(a1)=a$(a1)+t$
620 IF a=1 THEN a$(a1)=a$(a1)+"/" ELSE b$(b1)=b$(b1)+"/"
630 IF t$=" " OR t$="//" THEN IF a=1 THEN a$(a1)=LEFT$(a$(a1),LEN(a$(a1))-2) ELSE b$(b1)=LEFT$(b$(b1),LEN(b$(b1))-2)
640 GOTO 480
650 '
660 'Ausgeben des Textes:
670 IF a=0 THEN 700 ELSE 730
680 'Ausgeben der Morsezeichen
690 IF a=0 THEN 730
700 FOR i=0 TO a1:PRINT a$(i)
710 IF VPOS(#0)>23 THEN IF i<>a1-1 THEN PRINT"Taste?":CALL &BB18:CLS
720 NEXT:RETURN
730 FOR i=0 TO b1:PRINT b$(i)
740 IF VPOS(#0)>23 THEN IF i<>b1-1 THEN PRINT"Taste?":CALL &BB18:CLS
750 NEXT:RETURN
760 '
770 MODE 2
780 WINDOW 8,72,1,25:PRINT TAB(15)"
M   O   R   S   E   N
"
790 PRINT TAB(6)"VON MARCO VIETH, 16.6.1985 / 24.5.1988

"
800 PRINT"Dieses Programm hilft Ihnen beim erstellen Ihrer Morsetexte."
810 PRINT:PRINT"Hinweise zur Buchstabeneingabe:"
820 PRINT"Neben dem ganzen Alphabet und den Zahlen ausserdem:"
830 PRINT"[=eckige Klammer auf / ]=eckige Klammer zu"
840 PRINT"{=SHIFT+eckige Klammer auf"
850 PRINT"auch: .(Punkt) / ,(Komma) / ?(Fragez.) / '(Apostroph)"
851 PRINT"Am Wortende einfach ' '."
860 PRINT:PRINT"Hinweise zur Morsezeicheneingabe:"
870 PRINT"Es duerfen nur die Zeichen . _ / eingegeben werden !"
880 PRINT"Belegung: F1=.   F2=_   F3=/"
890 PRINT"Wortende - Markierung: //"
900 PRINT:PRINT"Viel Spass !!"
920 RETURN
930 '
940 DATA A,._ , [,._._ , B,_... , C,_._. , CH,____ , D,_.. , E,.   
950 DATA F,.._. , G,__. , H,.... , I,.. , J,.___ , K,_._ , L,._..
960 DATA M,__ , N,_. , O,___ , ],___. , P,.__. , Q,__._ , R,._.    
970 DATA S,... , T,_ , U,.._ , {,..__ , V,..._ , W,.__ , X,_.._   
980 DATA Y,_.__ , Z,__.. , 1,.____ , 2,..___ , 3,...__ , 4,...._
990 DATA 5,..... , 6,_.... , 7,__... , 8,___.. , 9,____. , 0,_____
1000 DATA .,._._._ , ",",__..__ , ?,..__.. , ',____.
1010 DATA " ",//
*/ });
