/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
100 REM Sound Test 1
110 MODE 2:CLEAR:DEFINT a-z
120 ?"Sound Test 1":?
130 ?"1) Richard Wagner: Brautchor aus 'Lohengrin'"
140 ?"2) Franz Schubert: Die Forelle"
150 ?
160 ?"Your choice ";
170 x=pos(#0):y=vpos(#0)
175 p=1:gosub 500:every 50*2 gosub 500
180 call &bd19:t$=inkey$:if t$="" then 180
190 if t$=chr$(13) or t$=" " then t$=hex$(p+1)
200 if t$<"1" or t$>"2" then 180
205 r=remain(0)
210 ?t$;
220 on val(t$) gosub 1000,1100
225 ?" stopping...";
227 WHILE SQ(4)<>4:call &bd19:WEND
230 ?chr$(17);chr$(13);:goto 160
490 '
500 p=(p+1) mod 2:locate x,y:?"[";p+1;"]: ";:return
980 '
990 REM Richard Wagner: Brautchor aus 'Lohengrin'
1000 RESTORE 1060
1010 ENV 3,10,-1,10:laut=12
1020 READ ton,dauer
1030 IF ton=-1 or inkey$<>"" THEN return
1040 SOUND 1,ton/2,dauer,laut,3:SOUND 2,ton*2,dauer,laut,3:SOUND 4,ton,dauer,laut,3
1050 GOTO 1020
1060 DATA 358,60,268,45,0,2,268,15,0,2,268,120,358,60,239,45,284,15,268,120,358,60,268,45,201,15,0,2,201,60,213,45,239,15,268,60,239,2,268,2,284,45,268,15,239,120
1070 DATA 358,60,268,45,0,2,268,15,0,2,268,120,358,60,239,45,284,15,268,120,358,60,268,45,201,15,0,2,201,60,213,45,239,15,268,60,239,2,268,2,284,45,268,15,239,120
1080 DATA 358,60,268,45,0,2,268,15,0,2,268,120,358,60,239,45,284,15,268,120,358,60,268,45,213,15,179,60,213,45,268,15,319,60,239,45,213,15,268,120,-1,-1
1090 REM Franz Schubert: Die Forelle
1100 ENV 2,10,-1,10
1110 RESTORE 1150:laut1=12:laut2=10
1120 READ ton,dauer:IF ton=-1 or inkey$<>"" THEN return
1130 IF ton=0 THEN SOUND 1,ton,dauer:SOUND 2,ton,dauer:SOUND 4,ton,dauer:GOTO 1120
1140 dauer=dauer*1.5:SOUND 1,ton*2,dauer/2,laut1,2:SOUND 1,ton,dauer/2,laut1,2:SOUND 2,ton,dauer,laut2,2:SOUND 4,ton*0.25,dauer,laut1,2:GOTO 1120
1150 DATA 426,25,319,25,0,2,319,25,253,25,0,2,253,25,319,50,426,25,0,2,426,25,0,2,426,25,0,2,426,25,284,12,319,12,338,12,379,12,426,75,0,2
1160 DATA 426,25,319,25,0,2,319,25,253,25,0,2,253,25,319,50,426,25,319,25,338,25,379,12,338,12,319,25,451,25,426,75,0,2
1170 DATA 426,25,338,25,0,2,338,25,319,12,338,25,379,12,338,12,319,50,426,25,319,25,338,25,0,2,338,25,0,2,338,12,239,12,284,12,338,12,319,75,0,2
1180 DATA 319,25,379,25,0,2,379,25,0,2,379,25,319,25,0,2,319,50,426,25,0,2,426,25,0,2,426,25,0,2,426,25,284,25,338,25,319,75,0,2
1190 DATA 319,25,379,25,0,2,379,25,0,2,379,25,319,25,0,2,319,50,426,25,0,2,426,25,0,2,426,25,0,2,426,25,284,25,338,25,319,75,-1,-1
1200 '
*/ });
