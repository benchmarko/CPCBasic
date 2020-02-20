/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
141 REM Colors CPC Demo
143 REM Known from CPC CP/M Disk
145 clear:defint a-z
146 c.c=1:gosub 9010:'initCpcLib
149 DEG
150 DIM cx(5),cy(5),r(5),lc(5),ik(3)
160 cx(1)=320:cy(1)=140
170 r(1)=75:r(2)=40:r(3)=20:r(4)=12:r(5)=8
180 '
1730 sa=120
1760 st=1:m=1
1765 c.c=4:gosub 9020:'checkMode
1790 INK 0,13:INK 1,2:INK 2,6:INK 3,18:BORDER 13
1792 gosub 1800
1793 if c.m%=3 then if m=1 then m=3 else m=1
1794 goto 1790
1795 '
1800 MODE m
1805 locate 1,1:pen 3:?"Mode";m:pen 1
1806 t!=time
1810 GOSUB 1900
1815 t!=time-t!:c.iv%=50-t!/50:if c.iv%>0 then c.c=3:gosub 9020:'waitOrKey
1820 LOCATE 1,1:?space$(7);
1830 EVERY 25,1 GOSUB 2070
1840 EVERY 15,2 GOSUB 2110
1850 EVERY 5,3 GOSUB 2150
1860 f=0
1870 AFTER 500 GOSUB 2190:'exit via timeout
1880 if inkey$<>"" then gosub 2190:'exit via key
1885 IF f=0 THEN call &bd19:goto 1880
1888 return
1889 '
1890 'draw circle plus 3,4 or 6 around it
1900 cx%=cx(st):cy%=cy(st):lc(st)=0
1910 FOR x%=1 TO r(st)
1920 ORIGIN cx%,cy%,0,640,0,400
1925 'draw frame
1930 MOVE 0,0
1940 DRAWR r(st)*SIN(x%*360/r(st)),r(st)*COS(x%*360/r(st)),1+(st MOD 3)
1950 DRAW r(st)*SIN((x%+1)*360/r(st)),r(st)*COS((x%+1)*360/r(st))
1960 NEXT x%
1970 IF st=5 THEN RETURN
1980 lc(st)=0
1990 cx(st+1)=cx(st)+1.7*r(st)*SIN(sa+lc(st))
2000 cy(st+1)=cy(st)+1.7*r(st)*COS(sa+lc(st))
2010 st=st+1
2020 GOSUB 1900
2030 st=st-1
2040 lc(st)=lc(st)+2*sa
2050 IF(lc(st)MOD 360)<>0 THEN 1990
2060 RETURN
2065 '
2070 n=1:goto 2160
2080 '
2110 n=2:goto 2160
2145 '
2150 n=3:goto 2160
2158 '
2159 'set new random color which is not too near to existing ones
2160 n2=((n+1) mod 3)+1:n3=((n2+1) mod 3)+1
2162 ik(n)=INT(RND*27)
2163 IF ABS(ik(n)-ik(n2))<3 OR ABS(ik(n)-ik(n3))<3 THEN 2162
2164 ink n,ik(n)
2166 return
2185 '
2190 r=REMAIN(1)+REMAIN(2)+REMAIN(3)
2200 f=1:'set exit flag
2210 RETURN
2220 '
9000 'cpclib will be merged...
9010 chain merge "../cpclib"
9020 return
*/ });
