/* 0index.js - index file for BASIC examples */
/* globals cpcBasic */

"use strict";

cpcBasic.addIndex("./examples", function () { /*
[
    {
		"key": "1st",
		"title": "First Program (empty)"
	},
	{
    	"key": "art",
		"title": "Computer Art"
	},
	{
		"key": "blkedit",
		"title": "Block Editor"
    },
    {
    	"key": "cpc464ch",
		"title": "CPC 464 Character Art"
	},
	{
    	"key": "cpcbasic",
		"title": "CPC Basic"
	},
	{
    	"key": "cpclib",
		"title": "CPC Lib"
	},
	{
		"key": "crypto1",
		"title": "Cryptology 1"
	},
	{
		"key": "labyrinth",
		"title": "Labyrinth"
	},
	{
		"key": "landscape",
		"title": "Landscape"
	},
	{
		"key": "morse",
		"title": "Morse Code (Morsen)"
	},
	{
		"key": "mouse",
		"title": "Mouse escaping from a maze"
	},
	{
		"key": "piechart",
		"title": "Pie Chart"
	},
	   {
    	"key": "rastercircle",
		"title": "Raster Circle"
    },
    {
		"key": "simple",
		"title": "Simple Labyrinth"
	},
    {
		"key": "scrudu",
		"title": "Scrudu (Gedichte)"
	},
    {
		"key": "scrudu.vok",
		"title": "Scrudu Vokabular",
		"meta": "D"
	},
	{
		"key": "soundtest1",
		"title": "Sound Test 1"
	},
    {
		"key": "sphere",
		"title": "Sphere"
	},
	{
    	"key": "advent/advedit",
		"title": "Adventure Editor"
	},
	{
    	"key": "advent/advint",
		"title": "Adventure Interpreter"
	},
	{
    	"key": "advent/home.adv",
		"title": "Our Home Adventure",
		"meta": "D"
	},
	{
    	"key": "advent/goldrush.adv",
		"title": "Goldrush Adventure",
		"meta": "D"
	},
	{
    	"key": "advent/tunnel.adv",
		"title": "Forest Tunnel Adventure",
		"meta": "D"
	},
	{
    	"key": "animator/anibas",
		"title": "Animator BASIC Viewer"
	},
	{
    	"key": "animator/animator",
		"title": "Animator"
	},
	{
    	"key": "animator/biplane.anc",
		"title": "Biplane Model",
		"meta": "D"
	},
	{
    	"key": "animator/biplane.and",
		"title": "Biplane Animation",
		"meta": "D"
	},
	{
    	"key": "animator/blimp.anc",
		"title": "Blimp Model",
		"meta": "D"
	},
	{
    	"key": "animator/blimp.and",
		"title": "Blimp Animation",
		"meta": "D"
	},
	{
    	"key": "animator/box3d.anc",
		"title": "Box 3D Model",
		"meta": "D"
	},
	{
    	"key": "animator/box3d.and",
		"title": "Box 3D Animation",
		"meta": "D"
	},
	{
    	"key": "animator/copymate.anc",
		"title": "Copymate Model",
		"meta": "D"
	},
	{
    	"key": "animator/copymate.and",
		"title": "Copymate Animation",
		"meta": "D"
	},
	{
    	"key": "animator/me109.anc",
		"title": "ME-109 Model",
		"meta": "D"
	},
	{
    	"key": "animator/me109.and",
		"title": "ME-109 Animation",
		"meta": "D"
	},
	{
    	"key": "animator/rg1.anc",
		"title": "RG-1 Model",
		"meta": "D"
	},
	{
    	"key": "animator/rg1.and",
		"title": "RG-1 Animation",
		"meta": "D"
	},
	{
    	"key": "archi/archidr",
		"title": "Little Architect Draw (BASIC)"
	},
	{
    	"key": "archi/archi1.bil",
		"title": "Drawing Set 1",
		"meta": "D"
	},
	{
    	"key": "archi/archi2.bil",
		"title": "Drawing Set 2",
		"meta": "D"
	},
	{
    	"key": "demo/blocky",
		"title": "Blocky CPC Demo"
	},
    {
    	"key": "demo/colors",
		"title": "Colors CPC Demo"
	},
    {
    	"key": "demo/graphics",
		"title": "Graphics CPC Demo"
	},
	{
		"key": "games/energy0",
		"title": "Energy Collectors 0"
	},
	{
		"key": "games/energy1",
		"title": "Energy Collectors 1"
	},
	{
		"key": "games/energysa",
		"title": "Energy Savers"
	},
	{
		"key": "games/hopper",
		"title": "Hopper (Hüpfer)"
	},
	{
		"key": "games/hopper2",
		"title": "Hopper: Main Part (Hüpfer)"
	},
	{
		"key": "games/joker",
		"title": "Black Joker (Der Schwarze Joker)"
	},
	{
		"key": "games/shot",
		"title": "Shot Game (Textual)"
	},
	{
		"key": "games/states",
		"title": "States of the Earth"
	},
	{
		"key": "games/statesfx",
		"title": "States of the Earth",
		"meta": "D"
	},
	{
    	"key": "math/anageo",
		"title": "Analytical Geometry"
	},
	{
    	"key": "math/complex",
		"title": "Complex numbers (Komplexe Zahlen)"
	},
	{
    	"key": "math/derivat",
		"title": "Derivatives of Polynomials (Ableitungen eines Polynoms)"
	},
	{
    	"key": "math/division",
		"title": "Division of long numbers (Division langer Zahlen)"
	},
	{
    	"key": "math/euler",
		"title": "Compute e with 1000 digits"
	},
	{
    	"key": "math/factorials",
		"title": "Big Factorials (Berechnung grosser Fakultaeten)"
    },
	{
    	"key": "math/fractions",
		"title": "Fractions (Bruchrechnen)"
	},
	{
    	"key": "math/funcarea",
		"title": "Functional Area"
	},
	{
    	"key": "math/funcspec",
		"title": "Functional Spectrum"
	},
	{
    	"key": "math/ninedig2",
		"title": "Nine Digits 2 (tokenized BASIC)"
	},
	{
    	"key": "math/regress",
		"title": "Regression (Ausgleich)"
	},
	{
		"key": "test/basbankm",
		"title": "Basic Bank Manager"
	},
	{
		"key": "test/bmbench3",
		"title": "BM Benchmark 3"
	},
	{
    	"key": "test/charset",
		"title": "Character set"
	},
	{
    	"key": "test/circles",
		"title": "Drawing circles"
    },
	{
    	"key": "test/cpcmhz",
		"title": "CPC Mhz"
	},
	{
    	"key": "test/fancy",
		"title": "Test copychr$"
	},
		{
    	"key": "test/fill",
		"title": "Test Fill"
	},
	{
		"key": "test/keyboard",
		"title": "Keyboard Test"
	},
	{
		"key": "test/linemask",
		"title": "Line Mask"
	},
	{
		"key": "test/mousepa",
		"title": "Mouse Painting"
	},
	{
		"key": "test/pixeltst",
		"title": "Pixel Test (Mode 0)"
	},
	{
		"key": "test/ramtest",
		"title": "RAM Test"
	},
	{
		"key": "test/rectangles",
		"title": "Rectangles Test"
	},
	{
		"key": "test/reftime",
		"title": "Reference Timings"
	},
	{
		"key": "test/scrtest",
		"title": "Screen Memory Test"
	},
	{
		"key": "test/seconds",
		"title": "Seconds Test"
	},
	{
		"key": "test/stars",
		"title": "Stars Test 1 and 2"
	},
    {
		"key": "test/testpage",
		"title": "Test Page"
	},
	{
    	"key": "test/testpage.dat",
		"title": "Test data for Test Page",
		"meta": "D"
	},
	{
		"key": "vidi/vidi",
		"title": "VIDI - Der Videofilmverwalter"
	},
	{
		"key": "vidi/v2000.fil",
		"title": "VIDI - Video 2000 Sammlung",
		"meta": "D"
	},
	{
		"key": "vidi/vhs.fil",
		"title": "VIDI - VHS Sammlung",
		"meta": "D"
	}
]
*/ });
