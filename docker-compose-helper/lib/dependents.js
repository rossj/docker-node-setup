// Functions to return an array of local Node modules that
// depend on the given module

'use strict';

// Node
const fs = require('fs');
const path = require('path');

// Project
const dependencies = require('./dependencies');

// File
const baseDir = '/mount';
const dirs = fs.readdirSync(baseDir)
  .filter(f => fs.lstatSync(baseDir + '/' + f).isDirectory());
const depsR2d = dirs.map(dependencies.getR);

// Invert the mapping
const dependents = {};
for ( let idx in dirs ) {
  let proj = dirs[idx];
  for ( let dep of depsR2d[idx] ) {
    dependents[dep] = dependents[dep] || [];
    dependents[dep].push(proj);
  }
}

module.exports.getR = function (project) {
  return dependents[project] || [];
};

