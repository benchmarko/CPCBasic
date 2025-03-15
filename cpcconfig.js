/* cpcconfig.js - configuration file for CPCBasic */

"use strict";

var cpcconfig = { // eslint-disable-line no-unused-vars
	databaseDirs: "examples,https://benchmarko.github.io/CPCBasicApps/apps,https://benchmarko.github.io/CPCBasicApps/rosetta,storage",
	//databaseDirs: "examples,../CPCBasicApps/apps,../CPCBasicApps/rosetta,storage", // use this, if CPCBasicApps is available locally
	//databaseDirs: "https://benchmarko.github.io/CPCBasic/examples,https://benchmarko.github.io/CPCBasicApps/apps,https://benchmarko.github.io/CPCBasicApps/rosetta,storage", // all remote

	redirectExamples: { 
		"examples/art": {
			database: "apps",
			example: "demo/art"
		},
		"examples/blkedit": {
			database: "apps",
			example: "apps/blkedit"
		},
		"examples/circlewr": {
			database: "apps",
			example: "test/circlewr"
		},
		"examples/cpc464ch": {
			database: "apps",
			example: "test/cpc464ch"
		},
		"examples/cpclib": {
			database: "apps",
			example: "test/cpclib"
		},
		"examples/crypto1": {
			database: "apps",
			example: "test/crypto1"
		},
		"examples/geogra": {
			database: "apps",
			example: "apps/geogra"
		},
		"examples/labyrinth": {
			database: "apps",
			example: "test/labyrinth"
		},
		"examples/morse": {
			database: "apps",
			example: "apps/morse"
		},
		"examples/mouse": {
			database: "apps",
			example: "test/mouse"
		},
		"examples/piechart": {
			database: "apps",
			example: "test/piechart"
		},
		"examples/rastercircle": {
			database: "apps",
			example: "test/rastercircle"
		},
		"examples/rotatio": {
			database: "apps",
			example: "test/rotatio"
		},
		"examples/scrudu": {
			database: "apps",
			example: "test/scrudu"
		},
		"examples/simple": {
			database: "apps",
			example: "test/simple"
		},
		"examples/soundtest1": {
			database: "apps",
			example: "test/soundtest1"
		},
		"examples/sphere": {
			database: "apps",
			example: "test/sphere"
		},
		"examples/vocabula": {
			database: "apps",
			example: "apps/vocabula"
		},
		"examples/advent/advedit": {
			database: "apps",
			example: "apps/advent/advedit"
		},
		"examples/advent/advint": {
			database: "apps",
			example: "apps/advent/advint"
		},
		"examples/animator/anibas": {
			database: "apps",
			example: "apps/animator/anibas"
		},	
		"examples/animator/animator": {
			database: "apps",
			example: "apps/animator/animator"
		},	
		"examples/archi/archidr": {
			database: "apps",
			example: "apps/archi/archidr"
		},
		"examples/demo/blocky": {
			database: "apps",
			example: "test/blocky"
		},
		"examples/demo/colors": {
			database: "apps",
			example: "test/colors"
		},
		"examples/demo/graphics": {
			database: "apps",
			example: "test/graphics"
		},
		"examples/games/energy0": {
			database: "apps",
			example: "test/energy0"
		},
		"examples/games/energy0": {
			database: "apps",
			example: "test/energy0"
		},
		"examples/games/energy1": {
			database: "apps",
			example: "test/energy1"
		},
		"examples/games/energysa": {
			database: "apps",
			example: "test/energysa"
		},
		"examples/games/hopper": {
			database: "apps",
			example: "games/hopper"
		},
		"examples/games/hopper2": {
			database: "apps",
			example: "games/hopper2"
		},
		"examples/games/joker": {
			database: "apps",
			example: "games/joker"
		},
		"examples/games/shot": {
			database: "apps",
			example: "games/shot"
		},
		"examples/games/states": {
			database: "apps",
			example: "games/states"
		},
		"examples/math/anageo": {
			database: "apps",
			example: "math/anageo"
		},
		"examples/math/complex": {
			database: "apps",
			example: "math/complex"
		},
		"examples/math/derivat": {
			database: "apps",
			example: "math/derivat"
		},
		"examples/math/division": {
			database: "apps",
			example: "math/division"
		},
		"examples/math/euler": {
			database: "apps",
			example: "math/euler"
		},
		"examples/math/factorials": {
			database: "apps",
			example: "math/factorials"
		},
		"examples/math/fractions": {
			database: "apps",
			example: "math/fractions"
		},
		"examples/math/funcarea": {
			database: "apps",
			example: "math/funcarea"
		},
		"examples/math/funcspec": {
			database: "apps",
			example: "math/funcspec"
		},
		"examples/math/ninedig2": {
			database: "apps",
			example: "math/ninedig2"
		},
		"examples/math/quadfunc": {
			database: "apps",
			example: "math/quadfunc"
		},
		"examples/math/regress": {
			database: "apps",
			example: "math/regress"
		},
		"examples/math/funcarea": {
			database: "apps",
			example: "test/funcarea"
		},
		"examples/test/basbankm": {
			database: "apps",
			example: "test/basbankm"
		},
		"examples/test/bmbench3": {
			database: "apps",
			example: "test/bmbench3"
		},
		"examples/test/charset": {
			database: "apps",
			example: "test/charset"
		},
		"examples/test/circles": {
			database: "apps",
			example: "test/circles"
		},
		"examples/test/cpcmhz": {
			database: "apps",
			example: "test/cpcmhz"
		},
		"examples/test/fancy": {
			database: "apps",
			example: "test/fancy"
		},
		"examples/test/fill": {
			database: "apps",
			example: "test/fill"
		},
		"examples/test/keyboard": {
			database: "apps",
			example: "test/keyboard"
		},
		"examples/test/linemask": {
			database: "apps",
			example: "test/linemask"
		},
		"examples/test/mousepa": {
			database: "apps",
			example: "test/mousepa"
		},
		"examples/test/pixeltst": {
			database: "apps",
			example: "test/pixeltst"
		},
		"examples/test/ramtest": {
			database: "apps",
			example: "test/ramtest"
		},
		"examples/test/rectangles": {
			database: "apps",
			example: "test/rectangles"
		},
		"examples/test/reftime": {
			database: "apps",
			example: "test/reftime"
		},
		"examples/test/scrtest": {
			database: "apps",
			example: "test/scrtest"
		},
		"examples/test/seconds": {
			database: "apps",
			example: "test/seconds"
		},
		"examples/test/stars": {
			database: "apps",
			example: "test/stars"
		},
		"examples/vidi/vidi": {
			database: "apps",
			example: "apps/vidi/vidi"
		}
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = cpcconfig;
}
