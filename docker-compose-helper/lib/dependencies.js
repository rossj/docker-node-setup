// Functions to return an array of local Node module dependencies,
// recursively or just single-level

'use strict';

// Node
const fs = require('fs');
const path = require('path');

// Project
const util = require('./util');

// File
const baseDir = '/mount';

const cache = {};

module.exports.get = function (proj, includeDev) {
  // Check the cache
  if ( cache[proj] && cache[proj].deps ) {
    return cache[proj].deps;
  }

  let text;
  try {
    text = fs.readFileSync(baseDir + '/' + proj + '/package.json', 'utf8');
  } catch (err) {
    if ( err.code === 'ENOENT' )
      return [];
    else
      throw err;
  }

  let json = JSON.parse(text);

  let deps = [];
  for ( let dep in json.dependencies || {} ) {
    if ( json.dependencies[dep].indexOf('../') === 0 )
      deps.push(dep);
  }

  if ( includeDev ) {
    for ( let dep in json.devDependencies || {} ) {
      if ( json.devDependencies[dep].indexOf('../') === 0 )
        deps.push(dep);
    }
  }

  // Populate the cache
  cache[proj] = cache[proj] || {};
  cache[proj].deps = deps;

  return deps;
};

module.exports.getR = function (proj, includeDev) {
  // Check the cache
  if ( cache[proj] && cache[proj].depsR ) {
    return cache[proj].depsR;
  }

  const deps = module.exports.get(proj, includeDev);

  // Recurse through children deps
  const deps2d = [];
  for ( let dep of deps ) {
    deps2d.push(module.exports.getR(dep, includeDev));
  }
  deps2d.push(deps);

  const depsR = util.flattenUniq(deps2d);

  // Populate the cache
  cache[proj] = cache[proj] || {};
  cache[proj].depsR = depsR;

  return depsR;
};
