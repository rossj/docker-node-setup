// Reads service descriptions from one or more docker-compose yaml files.
// Used primarily to determine which images a service depends on.

'use strict';

// Node
const fs = require('fs');

// NPM
const yaml = require('js-yaml');

// File
const baseDir = '/mount';

module.exports.parse = function (files) {
  // Load all yaml files (may be an override)
  const docs = files.map(f => {
    const text = fs.readFileSync(baseDir + '/' + f, 'utf8')
    const doc = yaml.safeLoad(text);
    return doc;
  });

  // Go through each yaml file, overriding props
  const services = {};

  for ( let i = 0; i < docs.length; i++ ) {
    for ( let s in docs[i] ) {
      const service = docs[i][s];
      if ( !services[s] ) {
        services[s] = service;
      } else {
        // Merge service descriptions
        for ( let p in service ) {
          services[s][p] = service[p];
        }
      }
    }
  }

  return services;
};
