// Given a local node module, this script returns a list of
// any other local Node modules in the dependency tree.

'use strict';

// Node
const fs = require('fs');
const path = require('path');

// Project
const dependencies = require('./lib/dependencies');

// File
const args = process.argv.slice(2);

let includeDev = true;

if ( args[0] === '--no-dev' ) {
  includeDev = false;
  args.shift();
}
const allDeps = dependencies.getR(args[0], includeDev);

process.stdout.write(allDeps.join(' '));
