/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
141 REM Colors CPC Demo
143 REM Known from CPC CP/M Disk
144 chain merge "cpclib",145:'subroutines at 5000
145 DEG
150 DIM cx(5),cy(5),r(5),lc(5)
160 cx(1)=320:cy(1)=140
170 r(1)=75:r(2)=40:r(3)=20:r(4)=12:r(5)=8
1730 sa=120
1760 st=1:m=1
1765 c.m%=3:gosub 5060:'check mode
1790 INK 0,13:INK 1,2:INK 2,6:INK 3,18:BORDER 13
1792 gosub 1800
1793 if c.m%=3 then if m=1 then m=3 else m=1
1794 goto 1790
1795 '
1800 MODE m
1805 locate 1,1:pen 3:?"Mode";m:pen 1
1806 t!=time
1810 GOSUB 1890
1815 t!=time-t!:c.iv%=50-t!/50:if c.iv%>0 then gosub 5040:'wait
1820 LOCATE 1,1:?space$(7);
1830 EVERY 25,1 GOSUB 2070
1840 EVERY 15,2 GOSUB 2110
1850 EVERY 5,3 GOSUB 2150
1860 f=0
1870 AFTER 500 GOSUB 2190
1880 if inkey$<>"" then gosub 2190
1885 IF f=0 THEN call &bd19:goto 1880
1888 return:'goto 2400
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
1990 cx(st+1)=cx(st)+1.70000000018626*r(st)*SIN(sa+lc(st))
2000 cy(st+1)=cy(st)+1.70000000018626*r(st)*COS(sa+lc(st))
2010 st=st+1
2020 GOSUB 1900
2030 st=st-1
2040 lc(st)=lc(st)+2*sa
2050 IF(lc(st)MOD 360)<>0 THEN 1990
2060 RETURN
2065 '
2070 ik1=INT(RND*27)
2080 IF ABS(ik1-ik2)<3 OR ABS(ik1-ik3)<3 THEN 2070
2090 INK 1,ik1
2100 RETURN
2105 '
2110 ik2=INT(RND*27)
2120 IF ABS(ik2-ik1)<3 OR ABS(ik2-ik3)<3 THEN 2110
2130 INK 2,ik2
2140 RETURN
2145 '
2150 ik3=INT(RND*27)
2160 IF ABS(ik3-ik1)<3 OR ABS(ik3-ik2)<3 THEN 2150
2170 INK 3,ik3
2180 RETURN
2185 '
2190 r=REMAIN(1)+REMAIN(2)+REMAIN(3)
2200 f=1
2210 RETURN
2220 '
2300 f=2
2310 return
4990 '
5000 'cpclib will be merged...
*/ });
