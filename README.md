# CPCBasic Unchained - Run CPC BASIC in a Browser

CPCBasic lets you run CPC BASIC programs in a browser. The supported BASIC style is known as Amstrad CPC 6128 Locomotive BASIC 1.1.
BASIC programs are compiled to JavaScript which can be run in the browser. A library provides the functionality of the commands that are not directly available in JavaScript.

CPCBasic Links:
[CPCBasic Demo](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=cpcbasic),
[Colors CPC Demo](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=demo/colors),
[Source code](https://github.com/benchmarko/CPCBasic/),
[HTML Readme](https://github.com/benchmarko/CPCBasic/#readme),

## Features

- Run old an new BASIC programs in a browser
- "Wrap factor" Speed: Frame Fly and other events in real-time, calculations as fast as possible
- CPC Basic Unchained: Less restrictions, extended by new features, breaking out of the CPC box
- BASIC compiler and not just interpreter
- Lots of memory, no memory full
- Runs locally without a server (even on mobile devices, but without input)
- HTML5 / JavaScript without external libraries

[![A sample with cpcbasic](./img/cpcbasic.gif)](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=cpcbasic)]

[![Art](./img/art.png)](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=art)]
[![Graphics](./img/graphics.png)](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=demo/graphics)]
[![Labyrinth](./img/labyrinth.png)](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=labyrinth)]
[![Landscape](./img/landscape.png)](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=landscape)]

More examples are in the sample library [CPCBasicApps](https://github.com/benchmarko/CPCBasicApps/#readme). They are included in CPCBasic as *apps*, example: [10print](https://benchmarko.github.io/CPCBasic/cpcbasic.html?database=apps&example=demo/10print).

## Why CPCBasic

There are several great CPC emulators which emulate a complete CPC with exact timing and allow demos to run, pushing CPC hardware to its limits.

With CPC Basic we do not get that accuracy. But if we compile it to JavaScript, can we achieve a similar or faster speed than the assembler programmed functionality that runs on a CPC or emulator?

## Usage

- Just open cpcbasic.html in a browser.
  The user interface shows several windows, which can be reduced and expanded by pressing the **green** buttons.
- The *Input* window is used to input and modify the BASIC code.
  - Use the *first selection field* to select the example library: CPCBasic *examples* or CPCBasicApps *apps*.
  - Use the *second selection field* to select a sample program. It will reset the CPC, and run the program.
  - The **Help** button opens the readme file in a browser.
  - The **Reload** button reloads the page with the current settings. (Please note that changes to the BASIC program are not saved.)
  - The **Check** button checks the syntax of the program. It compiles the program to JavaScript.
  - The **Renum** button renumbers the line numbers starting with 10 and increasing by 10 (see also *RENUM*)
- The *CPC* window shows the output on a CPC screen.
  - If you change the BASIC program, press the **Run** button to compile the BASIC program to JavaScript and run it.
  - If the focus is on the CPC screen, keystrokes will be detected by a running program. (An alternative way of input is the *virtual keyboard* below.)
  - The **Break** button halts the simulation. You can continue with the **Continue** button.
    This is an unconditional break. Pressing the ESC key once also halts the program, if not masked with *ON BREAK CONT*
  - The **Reset** button resets the CPC.
  - The **Screenshot** button creates a screenshot of the current CPC screen.
  - The **Sound** button activates or deactivates sound.
    - If you use the *Reload* button with sound activated, the sound needs to be activated again. Just do a user action, e.g. click somewhere. This is a browser limitation.
- The *Text View* window shows the text which is written in text mode.
- The *Keyboard* window shows a virtual keyboard which can be also used with touch devices. You can test the functionality with the test program [keyboard](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=test/keyboard&showKbd=true).
- The *Input* window is an alternative way to send input to the CPC.
- The *Console* window shows the textual output. This is useful for copying and pasting the output. It is cleared when the CPC screen is cleared (*MODE* or *CLS*).
- The *Variables* window allows you to see the variables used by the program.
- In the *JavaScript* window you will see the compiled JavaScript code. It can be changed and then executed with the **Run** button in this window. So it is possible to program the simulated CPC directly with JavaScript.

## Restrictions

- CPCBasic is still in progress and not complete or accurate. The goal is that most BASIC programs run without change.
- It is BASIC only and can not execute Z80 machine code
- Unimplemented commands are ignored: *AUTO*, *PRINT #8*, *RESUME* (partly), *SPEED KEY/WRITE*, *WIDTH*, *WRITE #8*, some AMDSOS commands
- Sound: More hardware volume envelopes
- Multi-line strings containing LF (\n)
- No complete check of the BASIC program
- Incomplete type checking
- Variables typed with *DEFINT*, *DEFREAL* or *DEFSTR* are different from those with type extension:
  `defint a: a=1: a%=2: ?a,a%`
- Array access: Array indices are not rounded, and there is no range check.
- *ON ERROR GOTO* and *RESUME* without line number do not fully work because this would require to single step every instruction
- Resulting JavaScript looks ugly because there is no *GOTO* in JavaScript. Control structures need to be converted to *GOTO* because for some commands and events it is necessary to jump out of a block
- Interpreted CPC BASIC may contain lines of arbitrary content if they are not executed, e.g. comments without marking them as comments. The CPCBasic compiler does not allow this.
- That is CPC BASIC: `a(3]=6: ?a[3)`. Do we really want to allow that?
- Maybe something more...

## Fixed Restrictions

- [fixed: *TEST*, *TESTR* can not distinguish between pens of the same color]
- [fixed: Changing the color with *INK*, existing drawings will not be changed and the colors will
  not blink. Currently you have to redraw the screen with another color to get a blinking effect.]
- [fixed: Comparison with equal in assignment is possible now: `a=0: x=(a=0): ?x`, returns -1 for true as on the CPC]
- [fixed: No sound]
- [fixed: *ENT* (tone envelopes); hardware volume envelopes with sepcial *ENV* syntax "="]
- [fixed: *RESTORE* for lines without *DATA*: search next *DATA* line]
- [done: Separate sample library; sample category]
- [fixed: Almost no type checking]
- [fixed: Access screen memory in the range &c000-&ffff with *PEEK&POKE*]
- [done: Pause key: Use ESC, and then any key to continue]
- [done: *COPYCHR$*]
- [done: *SPEED INK*]
- [done: *FILL*]
- [done: *RENUM*]
- [done: *SAVE* ASCII, *OPENOUT*, *PRINT #9*, *WRITE #9*]
- [done: *CURSOR*, *CONT*]
- [done: Edit and direct input and execution mode; cursor]
- [done: *DELETE*, *EDIT*, *LIST*, *NEW*]
- [done: *CAT*, *|DIR*, *|ERA*, *|REN*]
- [done: Drag and drop BASIC programs (tokenized or ASCII) into CPCBasic]
- [done: DSK images support, for reading]
- [done: *MASK*]

## Extensions and Features

- File operations work on Browser local storage memory (check in Browser: e.g. Developement tools, Application).
  - Use "storage" in the "CPC BASIC" selection field to load files.
  - Specific for *RUN*, *LOAD*, *MERGE*, *OPENIN*: If a file is not found in storage memory and an example with the name exists in the current directory, this example is loaded.
  - Use Drag & Drop on the CPC canvas or on the input drop zone to import files. An AMSDOS header is detected.
  File types can be normal ASCII, tokenized BASIC, protected (tokenized) BASIC, or Binary. ZIP files and DSK files can also be imported.
- Mouse clicks on CPC canvas: If the canvas is not active, click on it to activate it. The border color changes. A click on a character written in text mode puts this character in the keyboard input queue. The next *INKEY$* will return it. This could be useful to select options presented on the screen.
  Another feature: After a MOVE 1000,1000, a mouse click does a *MOVE* at the click position. this can be detected by a BASIC program. Example: [Mouse Painting](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=test/mousepa)
- *MODE 3*: High resolution mode with real 640x400 pixels, 16 colors and 8x8 pixels per character. This is different to the unofficial and not very useful Gate Array mode 3 on a real CPC: [CPC live: Graphics](http://cpctech.cpc-live.com/docs/graphics.html).
Several examples use CPCBasic mode 3, e.g. [Art](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=test/art), [Landscape](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=test/landscape), [Rectangles](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=test/rectangles).
- *|MODE,n*: Change mode without *CLS*, including mode 3 (experimental)
- *|RENUM,...*: similar to *RENUM* but with a 4th parameter to keep line numbers starting with this line
- Computations with numbers are not limited to 16 bit
- *PEEK & POKE* features:
  - Access screen memory in screen base address range, e.g. &C000-&FFFF or &4000-&7FFF
  - Access character map data starting at *HIMEM*+1 after *SYMBOL AFTER* n with n<256

## Supported CALLs and OUTs

### CALLs

- *CALL &BB00*: KM Initialize (KM Reset and reset also CPC key extensions)
- *CALL &BB03*: KM Reset (clear input and reset expansion tokens)
- *CALL &BB06*: KM Wait Char (CPCBasic: same as *Call &BB18*)
- *CALL &BB0C*: KM Char Return (depending on number of arguments)
- *CALL &BB18*: KM Wait Key
- *CALL &BB4E*: TXT Initialize (initialize window parameter, delete custom chars)
- *CALL &BB51*: TXT Reset (reset control character buffer)
- *CALL &BB5A*: TXT Output (*PRINT* text char including control codes, depending on number of arguments)
- *CALL &BB5D*: TXT WR Char (*PRINT* text char depending on number of arguments)
- *CALL &BB6C*: TXT Clear Window
- *CALL &BB7B*: TXT Cursor Enable
- *CALL &BB7E*: TXT Cursor Disable
- *CALL &BB81*: TXT Cursor On
- *CALL &BB84*: TXT Cursor Off
- *CALL &BB8A*: TXT Place Cursor
- *CALL &BB8D*: TXT Remove Cursor
- *CALL &BB90*: TXT Set Pen (set *PEN* depending on number of arguments)
- *CALL &BB96*: TXT Set Paper (set *PAPER* depending on number of arguments)
- *CALL &BB9C*: TXT Inverse (same as *PRINT CHR$(24)*)
- *CALL &BB9F*: TXT Set Back (set *PEN* transparent mode, depending on number of arguments)
- *CALL &BBDB*: GRA Clear Window
- *CALL &BBDE*: GRA Set Pen (set *GRAPHICS PEN* depending on number of arguments)
- *CALL &BBE4*: GRA Set Paper (set *GRAPHICS PAPER* depending on number of arguments)
- *CALL &BBFC*: GRA WR Char (*PRINT* graphics char depending on number of arguments)
- *CALL &BBFF*: SCR Initialize (set *MODE* 1, reset inks, clear screen)
- *CALL &BC06,nn*: SCR SET BASE (really &BC08; set screen start high byte: &00, &40, &80 or &C0)
- *CALL &BC0E*: SCR Set Mode (set *MODE* depending on number of arguments)
- *CALL &BCA7*: SOUND Reset
- *CALL &BCB6*: SOUND Hold (TODO)
- *CALL &BCB9*: SOUND Continue (TODO)
- *CALL &BD19*: MC Wait Flyback (wait for screen beam flyback; same as *FRAME*)
- *CALL &BD3D*: KM Flush (*CLEAR INPUT*; CPC 664/6128 only)
- *CALL &BD49*: GRA Set First (set *MASK* first pixel, depending on number of arguments; CPC 664/6128 only)
- *CALL &BD4C*: GRA Set Mask (set *MASK*, depending on number of arguments; CPC 664/6128 only)
- *CALL &BD52*: GRA Fill (*FILL*, depending on number of arguments; CPC 664/6128 only)
- *CALL &BD5B*: KL RAM SELECT (depending on number of arguments; CPC 6128 only)

### OUTs

- *OUT &7Fxx,nn*: Select RAM bank in range &4000-&7FFF; &C0=default; &C4-&FF=additional banks
- *WAIT &F5xx,1*: Wait for Frame Fly (same as *CALL &BD19*, *FRAME*)

## Programming hints

- CPCBasic is BASIC with "wrap factor". However, do not use busy waiting. Put in *FRAME* or *CALL &BD19* commands.
  - An example on how to insert a delay of one second:
  `t!=TIME+300:WHILE TIME<t!:CALL &BD19:WEND`
  - There is a special feature when using the *INKEY$* function: If it returns no key more than once during a frame, a *FRAME* or *CALL &BD19* is implicitely called.
    - An example on how to wait for 5 seconds or a keypress:
    `t!=TIME+300*5:WHILE TIME<t! AND INKEY$="":WEND :?"Done."`
    You may check that the CPU load stays low.
    - This is not true for the *INKEY* function. Use *CALL &BD19* again. An example on how to wait 5 seconds or the SPACE key: `t!=TIME+300*5:WHILE TIME<t! AND INKEY(47)<0:CALL &BD19:WEND :?"Done."`
- Use URL parameter "tron=true" to activate line tracing mode with *TRON* and *TROFF*
- Use *OPENIN* and *INPUT#9* to load data from a file in the current "directory" or from Browser local storage
- If the program is complete (that means, no *MERGE* or *CHAIN MERGE* inside), line number destinations are checked for existence. For example, if the *line number* in *GOTO line* does not exist, the compilation fails.
- The commands and functions are checked for number of arguments but not always for argument types.

## Debugging

- Use the URL parameter *tron=true* to compile with BASIC line number trace. The trace can be switched on and off in BASIC with *TRON* and *TROFF*. A side effect of "trace on" in CPCBasic   is that the correct line number is reported in case of an error.
- For debugging in a desktop browser, you will usually use the Browser Development Tools (F12).
- You can also use a *Console log* window which is usually hidden. You can activate it with the URL parameters *showConsole=true* and *debug=2*. Example:
 [CPCBasic Debug](https://benchmarko.github.io/CPCBasic/cpcbasic.html?showConsole=true&debug=2).
 This is especially useful on mobile devices. Clear its content manually, if needed.
- There is also an experimental parameter *bench=n* to time the *parsing step* n times.
  An example with a large BASIC program:
[sultans2 parsing](https://benchmarko.github.io/CPCBasic/cpcbasic.html?bench=5&database=apps&example=games/sultan2) (Check the console in the browser developer tools).

## Development, Testing

QUnit test [testsuite.qunit.html](https://benchmarko.github.io/CPCBasic/test/testsuite.qunit.html) runs:

- [Model.qunit.html](https://benchmarko.github.io/CPCBasic/test/Model.qunit.html)
- To be done

## Possible Future Enhancements

- Create buttons for the keys that the BASIC program checks (useful for e.g. mobile devices)
- RSX extension libraries / plugins programmed in JavaScript
- Can we detect busy loops and insert *FRAME* automatically?
- Shall we support hardware scrolling with *OUT* or is it already a hardware emulation feature?
- Extension: More colors, e.g. 256
- Optimizations of the resulting JavaScript code
- Further checks during compile time
- Smooth character map from 8x8 to 8x16

## Links

- [Amstrad CPC 6128 User Instructions](http://www.cpcwiki.eu/manuals/AmstradCPC6128-hypertext-en-Sinewalker.pdf), or:
  [Schneider CPC 6128 Benutzerhandbuch](https://acpc.me/ACME/MANUELS/[DEU]DEUTSCH(GERMAN)/CPC6128_SCHNEIDER[DEU]_Erste_Ausgabe_1985[OCR].pdf)

- [ROM-Listing CPC 464/664/6128](http://www.cpcwiki.eu/index.php/ROM-Listing_CPC_464/664/6128) - German, excellent information

- [Das Scheider CPC Systembuch](https://k1.spdns.de/Vintage/Schneider%20CPC/Das%20Scheider%20CPC%20Systembuch.pdf) - German, excellent information

- [Locomotive BASIC](https://www.cpcwiki.eu/index.php/Locomotive_BASIC) - Description of the CPC Basic Dialect

- [Disassembly of Locomotive BASIC v1.1](http://cpctech.cpc-live.com/docs/basic.asm) - If you do not have the ROM listing at hand

- [The story of Amstrad’s amazing CPC 464](https://www.theregister.co.uk/2014/02/12/archaeologic_amstrad_cpc_464/)

- [CPCemu](http://www.cpc-emu.org/) - CPC Emulator, currently version 1.7, hopefully there will be an update soon ...

- [Arnold TNG - The Warp factor](http://www.yasara.org/cpc/index.html) - Modified Arnold CPC emulator at various speed levels.

- [Simple Web Basic](https://yohan.es/swbasic/) - A link collection of basic interpreters for the Web (2010)

- [qb.js: An implementation of QBASIC in Javascript](http://stevehanov.ca/blog/?id=92)

- [JSBasic - A BASIC to JavaScript Compiler](https://www.codeproject.com/Articles/25069/JSBasic-A-BASIC-to-JavaScript-Compiler), with
  [Demo: SpaceWar](http://jsbasic.apphb.com/default.aspx?sourceCode=SpaceWar)

- [Top Down Operator Precedence](http://crockford.com/javascript/tdop/tdop.html) - Douglas Crockford, 2007-02-21. CPCBasic uses this approach.

- [BM Benchmark Suite](https://github.com/benchmarko/BMbench) - A collection of simple benchmarks in various programming languages

- [Locomotive Software](https://www.cpcwiki.eu/index.php/Locomotive_Software) - The developer of CPCs BASIC and operating system

### **mv, 04/2020**
