# CPCBasic - Run CPC BASIC in a Browser

CPCBasic allows you to run CPC BASIC programs in a browser. The supported BASIC style is known as Amstrad CPC 6128 Locomotive BASIC 1.1.
BASIC programs are compiled to JavaScript which can be run in the browser. A library provides the functionality which is needed for a simulated CPC and which is not directly available in JavaScript.

(This is work in progress and not complete or accurate.)

CPCBasic Links:
[Colors CPC Demo](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=colors),
[Source code](https://github.com/benchmarko/CPCBasic/),
[HTML Readme](https://github.com/benchmarko/CPCBasic/#readme),

## Features

- Run old BASIC programs in a browser
- "Wrap factor" speed
- Less limitations, breaking out of the CPC box
- BASIC compiler and not just interpreter
- A lot if memory, no memory full
- Runs locally without a server (also on mobile devices, but without input)
- HTML5 / JavaScript without external libraries

## Why CPCBasic

- [Why not?]
- To answer the question: Can CPC Basic be compiled to JavaScript and run at higher speed than similar functionality programmed in Assembler on a CPC or Emulator?

## Usage

- Simply open cpcbasic.html in a browser.
  The user interface shows several boxes which can be shrunk and expanded by pressing the green buttons.
- Use the selection field to select an example program, reset the CPC and run the program.
- When you modify the BASIC program, press the "Run" button to compile the BASIC program to JavaScript and run it. The "Parse only" button parses (or compiles) the program without running in
- When the focus is on the CPC screen window, keystrokes are recognized by a running program.
- The "Break" button stops the simulation. It can be continued with the "Continue" button.
- The "Reset" button resets the CPC.
- Textual output is also written to the "Console" Window. This is useful for Copy&Paste the output.
- With the "Variables" window you can inspect the variables used by the program.
- In the "JavaScript" window you can see the compled JavaScript code. It can be modified and run with the "Run" button in that window. So it is possible to use the simulated CPC with JavaScript directly.

- The "Reload" button reloads the page with the current settings. (Please note that changes to the script are lost!)
- The "Help" button opens the Readme on the server.

## Limitations

- It is just BASIC and cannot execute Z80 machine code
- Changing the color with "INK" does not change existing drawings, no blinking colors
- "TESTR" cannot distinguish between pens of same color
- Not implemented commands, e.g. DEFINT, DEFREAL, DEFSTR, KEY, KEY DEF
- RESTORE on lines without DATA
- Print does not handle BASIC control codes
- No sound
- No direct input mode of BASIC commands, e.g. LIST, RENUM, ...
- Few code checks
- Nearly no type checking
- Resulting JavaScript looks ugly because there is no GOTO in JavaScript and control structures need to be converted to simulated GOTO
- A lot more
- Interpreted CPC BASIC can have lines with any content, if they are not executed, e.g. comments without marking them as comments. The CPCBasic compiler does not allow this.
- That is CPC BASIC: `a(3]=6 : ? a[3)`. Do we really want to allow this?

## Extensions

- Mode 3: Similar to mode 2, but with 16 colors: [Rectangles](https://benchmarko.github.io/CPCBasic/cpcbasic.html?example=rectangles)
- Computations are not limited to 16 bit
- Peek&Poke can access "large" memory, not only 64K or 512K.

## Programming hints

- It is BASIC with "wrap factor". But do not use busy waiting, put in "FRAME" or "CALL &BD19" commands

## Possible Future Enhancements

- Fix some limitations, e.g. handle BASIC control codes
- Drag&Drop BASIC programs (tokenized or ASCII) into CPCBasic
- Sound support
- Support DSK images?
- Create buttons for the keys which the BASIC program checks (useful for e.g. mobile)
- RSX extension libraries/plugins programmed in JavaScript?
- Can we detect busy loops and insert FRAME automatically?
- Extension: More colors, e.g. 256?
- Optimizations of the resulting JavaScript code
- More compile time checks
- Smooth characters to 8x16

## Links

- [CPC 6128 User Instructions](http://www.cpcwiki.eu/manuals/AmstradCPC6128-hypertext-en-Sinewalker.pdf) - (I have the German verison)

- [ROM-Listing CPC 464/664/6128](http://www.cpcwiki.eu/index.php/ROM-Listing_CPC_464/664/6128) - German, excellent information

- [Das Scheider CPC Systembuch](https://k1.spdns.de/Vintage/Schneider%20CPC/Das%20Scheider%20CPC%20Systembuch.pdf) - German, excellent information

- [Locomotive BASIC](https://www.cpcwiki.eu/index.php/Locomotive_BASIC) - Description of the CPC Basic Dialect

- [Disassembly of Locomotive BASIC v1.1](http://cpctech.cpc-live.com/docs/basic.asm) - If you do not have the ROM listing at hand

- [The story of Amstrad’s amazing CPC 464](https://www.theregister.co.uk/2014/02/12/archaeologic_amstrad_cpc_464/)

- [CPCemu](http://www.cpc-emu.org/) - CPC Emulator, currently version 1.7, hopefully there will be an update soon...

- [Arnold TNG - The Warp factor](http://www.yasara.org/cpc/index.html) - Modified Arnold CPC emulator with different speed levels.

- [Simple Web Basic](https://yohan.es/swbasic/) - A link collection of basic interpreters for the Web (2010)

- [qb.js: An implementation of QBASIC in Javascript](http://stevehanov.ca/blog/?id=92)

- [JSBasic - A BASIC to JavaScript Compiler](https://www.codeproject.com/Articles/25069/JSBasic-A-BASIC-to-JavaScript-Compiler),
  [Demo: SpaceWar](http://jsbasic.apphb.com/default.aspx?sourceCode=SpaceWar)

- [Top Down Operator Precedence](http://crockford.com/javascript/tdop/tdop.html) - Douglas Crockford, 2007-02-21. CPCBasic uses this approach.

- [BM Benchmark Suite](https://github.com/benchmarko/BMbench) - A collection of simple benchmarks in different programming languages

- [Locomotive Software](https://www.cpcwiki.eu/index.php/Locomotive_Software) - The developer of CPC's BASIC and operating system

### **mv, 09/2019**
