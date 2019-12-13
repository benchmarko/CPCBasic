/* globals cpcBasic */

"use strict";

cpcBasic.addItem("", function () { /*
500 REM BM Bench - bmbench.bas (BASIC) mod1
510 REM https://github.com/benchmarko/BMbench
600 'PRINT "Press and release Space to start measurement"
610 'IF INKEY(47)<>0 THEN 610
620 'IF INKEY(47)<>-1 THEN 620
900 MODE 2
999 CALL &BD19
1000 REM BM Bench - bmbench.bas (BASIC) mod1
1010 REM (c) Marco Vieth, 2002
1020 REM http://www.benchmarko.de
1030 REM
1040 REM 06.05.2002  0.01
1050 REM 18.05.2002  0.02
1060 REM 24.01.2003  0.05  output format changed
1070 REM
1080 REM Usage (bwbasic):
1090 REM bwbasic bmbench.bas
1100 REM
1110 REM Usage (Locomotive Basic)
1120 REM run"bmbasic1.bas"
1130 REM
1140 REM
1150 REM Documentation for bwbasic (Bywater BASIC Interpreter):
1160 REM /usr/share/doc/packages/bwbasic/bwbasic.doc
1170 REM
1180 REM Notes
1190 REM - commands are not case sensitive, variables are
1200 REM - bwbasic does not require line numbers but we use them here
1210 REM - bwbasic would also support subroutines
1220 REM
1230 REM Notes (bwbasic problems)
1240 REM - Precision is irrelavalt to bwbasic (all computations in double?)
1250 REM - FOR and NEXT statements must be on single lines?
1260 REM - RETURN should also on single line
1270 REM - No comments starting with apostrophe available
1280 REM - Function definitions: DEF NF<name> cannot be redefined (so do it before Locomotive Basic)
1290 REM - No comment in line with SYSTEM
1300 REM
1310 REM
1320 CLEAR
1330 DEFINT a-z: REM irrelevant to bwbasic
1340 bwbasic = 0: REM 1 for bwbasic, 0 for Locomotive Basic
1350 'IF TIMER > 0 THEN bwbasic = 1: REM TIMER variable set -> assume bwbasic
1360 REM
1370 REM Set time conversion factor for ms (adapt for Emulators!)
1380 IF bwbasic = 0 THEN GOTO 1480
1390 REM
1400 REM Settings for bwbasic
1410 basicver$ = "bwbasic ?"
1420 tfac! = 1000: REM time conversion factor for ms
1430 DEF FNgetms!(fac!) = TIMER * fac!
1440 REM PRINT "DEBUG: bwbasic: tfac="; tfac!; ", time="; FNgetms!(tfac!)
1450 GOTO 2480: REM main
1460 REM
1470 REM Settings for Locomotive Basic
1480 basicver$ = "Locomotive Basic 1.1"
1490 tfac! = 10 / 3: REM time conversion factor for ms, normally 300 Hz (adapt for Emulators!)
1500 DEF FNgetms!(fac!) = TIME * fac!
1510 REM PRINT "DEBUG: Locomotive Basic: tfac="; tfac!; ", time="; FNgetms!(tfac!)
1520 GOTO 2480: REM main
1530 REM
1540 REM
1550 REM
1560 REM bench00(loops, n!)
1570 x! = 0
1580 sum1! = (n! / 2) * (n! + 1)
1590 ndiv = INT(n! / 32768)
1600 nmod = (n! - ndiv * 32768)
1610 REM PRINT "DEBUG: sum1="; sum1!
1620 l = loops
1630 WHILE l > 0: l = l - 1
1640 FOR i = ndiv TO 1 STEP -1
1650 FOR j = 32767 TO 0 STEP -1
1660 x! = x! + j
1670 NEXT j
1680 REM PRINT "DEBUG: i=";i
1690 NEXT i
1700 FOR j = nmod TO 1 STEP -1
1710 x! = x! + j
1720 NEXT j
1730 REM PRINT "DEBUG: x!=";x!
1740 IF l > 0 THEN x! = x! - sum1!: IF x! <> 0 THEN x = x!: RETURN: REM Error
1750 WEND
1760 x! = (x! - INT(x! / 65536) * 65536): REM x mod 65536
1770 IF x! > 32767 THEN x = x! - 65536 ELSE x = x!
1780 REM PRINT "DEBUG: end  x!=";x!;", x=";x
1790 RETURN
1800 REM returns x
1810 REM
1820 REM
1830 REM bench01(loops, n!)
1840 x = 0
1850 GOTO 1990: REM do not use now!
1860 sum1! = (n! / 2) * (n! + 1)
1870 sum1 = (sum1! - INT(sum1! / 65536) * 65536)
1880 REM PRINT "DEBUG: sum1="; sum1
1890 l = loops
1900 WHILE l > 0: l = l - 1
1910 FOR i! = 1 TO n! STEP 1
1920 x = x + i!
1930 NEXT i!
1940 REM (overflow for 32640+256?)
1950 IF l > 0 THEN x = x - sum1: IF x <> 0 THEN RETURN: REM Error
1960 WEND
1970 x = x MOD 65536
1980 REM x = (x - INT(x / 65536) * 65536): REM x mod 65536
1990 RETURN
2000 REM returns x
2010 REM
2020 REM
2030 REM bench02(loops, n!) (Floating Point)
2040 x! = 0
2050 sum1! = (n! / 2) * (n! + 1)
2060 REM PRINT "DEBUG: sum1="; sum1!
2070 l = loops
2080 WHILE l > 0: l = l - 1
2090 FOR i! = n! TO 1 STEP -1
2100 x! = x! + i!
2110 NEXT i!
2120 REM PRINT "DEBUG: x!=";x!
2130 IF l > 0 THEN x! = x! - sum1!: IF x! <> 0 THEN x = x!: RETURN: REM Error
2140 WEND
2150 x! = (x! - INT(x! / 65536) * 65536): REM x mod 65536
2160 IF x! > 32767 THEN x = x! - 65536 ELSE x = x!
2170 REM PRINT "DEBUG: end  x!=";x!;", x=";x
2180 RETURN
2190 REM returns x
2200 REM
2210 REM
2220 REM
2230 REM
2240 REM run_bench(bench, loops, n!)
2250 x = 0: check1 = 0
2260 IF bench > 2 THEN GOTO 2400
2270 benchtmp = bench + 1: REM 0 gets 1
2280 ON benchtmp GOSUB 1570,1840,2040
2290 IF bwbasic > 0 THEN GOTO 2360
2300 REM Checks for Locomotive Basic
2310 IF bench = 0 THEN check1 = 1032
2320 IF bench = 1 THEN check1 = 1032
2330 IF bench = 2 THEN check1 = 1032
2340 GOTO 2420
2350 REM Checks for bwbasic
2360 IF bench = 0 THEN check1 = 10528
2370 IF bench = 1 THEN check1 = 10528
2380 IF bench = 2 THEN check1 = 10528
2390 GOTO 2420
2400 PRINT "Error: Unknown benchmark:"; bench
2410 check1 = x + 1
2420 IF x <> check1 THEN PRINT "Error(bench"; bench ;"): x=";x : x = -1
2430 RETURN
2440 REM returns x
2450 REM
2460 REM
2470 REM main()
2480 startt1! = FNgetms!(tfac!)
2490 bench1 = 0: REM first benchmark to test
2500 bench2 = 5: REM last benchmark to test
2510 n! = 1000000: REM maximum number
2520 minms = 10000: REM minimum runtime for measurement in ms
2530 DIM benchres!(5): REM benchmark timing results (we use real!)
2540 PRINT "BM Bench v0.5 (Basic) -- "; basicver$
2550 PRINT "(c) Marco Vieth, 2002"
2560 IF bwbasic = 0 THEN n! = n! / 100 : PRINT "NOTE: To come to an end, we use n=";n!
2570 FOR bench = bench1 TO bench2
2580 REM calibrate
2590 loops = 1: x = 0: t1! = 0
2600 WHILE (t1! < 1001) AND (x <> -1): REM we want at least 1001 ms calibration time
2610 PRINT "Calibrating benchmark"; bench; " with loops ="; loops; "; n ="; n!
2620 t1! = FNgetms!(tfac!)
2630 GOSUB 2250: REM x = run_bench(bench, loops, n!)
2640 t1! = FNgetms!(tfac!) - t1!
2650 PRINT "x ="; x; " (time="; t1!; ")"
2660 loops = loops * 2
2670 WEND
2680 IF x = -1 THEN benchres!(bench) = -1 : GOTO 2790
2690 loops = loops / 2
2700 loops = loops * INT(minms / t1!) + 1 : REM integer division!
2710 PRINT "Calibration done. Starting measurement with "; loops; " loops to get >="; minms; "ms"
2720 REM measurement
2730 t1! = FNgetms!(tfac!)
2740 GOSUB 2250: REM x = run_bench(bench, loops, n!)
2750 t1! = FNgetms!(tfac!) - t1!
2760 PRINT "x ="; x; " (time="; t1!; ")"
2770 benchres!(bench) = INT((t1! * 10) / loops)
2780 PRINT "Elapsed time for"; loops; " loops:"; t1!; " ms; estimation for 10 loops:"; (t1! * 10 / loops); "ms"
2790 REM
2800 NEXT bench
2810 PRINT "Times for all benchmarks (10 loops, ms):"
2820 PRINT "BM Results (Basic):";
2830 FOR bench = bench1 TO bench2
2840 PRINT USING "####### ";benchres!(bench);
2850 NEXT bench
2860 PRINT
2870 t1! = FNgetms!(tfac!) - startt1!
2880 PRINT "Total elapsed time:"; t1!; "ms"
2890 IF bwbasic = 0 THEN GOTO 2920
2900 'SYSTEM
2910 REM system or quit to exit bwbasic
2920 END
2930 REM end
*/ });
