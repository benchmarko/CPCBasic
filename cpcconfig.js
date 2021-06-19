/* cpcconfig.js - configuration file for CPCBasic */

"use strict";

var cpcconfig = { // eslint-disable-line no-unused-vars
	databaseDirs: "examples,https://benchmarko.github.io/CPCBasicApps/apps,storage"
	//databaseDirs: "examples,../CPCBasicApps/apps,storage" // use this, if CPCBasicApps is available locally
	//databaseDirs: "https://benchmarko.github.io/CPCBasic/examples,https://benchmarko.github.io/CPCBasicApps/apps,storage" // all remote
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = cpcconfig;
}
