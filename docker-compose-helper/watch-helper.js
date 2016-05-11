// Script that takes in paths of modified files from a file watcher,
// and ultimately streams out which Docker images / containers have
// been modified and might need to be reloaded.

'use strict';

// Node
const path = require('path');
const readline = require('readline');

// NPM
const _ = require('lodash');

// Project
const dependents = require('./lib/dependents');
const composeFiles = require('./lib/compose-files');
const util = require('./lib/util');

// File
const args = process.argv.slice(2);
const pwdLen = args.shift().length;
const yamls = args.filter(a => a !== '-f');

// Parse YML files
const services = composeFiles.parse(yamls);
const serviceNames = Object.keys(services);//.map(s => s.split('.')[0]);
const imageNames = _.uniq(_.map(_.values(services), 'image'));
const imageNameToServiceNames = {};
for ( let serviceName of serviceNames ) {
	const image = services[serviceName].image;
	imageNameToServiceNames[image] = imageNameToServiceNames[image] || [];
	imageNameToServiceNames[image].push(serviceName);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const projectsFromPaths = function (paths) {
  const dirs = _(paths)
    .map(s => s.substring(pwdLen + 1))
    .map(s => s.split('/'))
    .filter(a => a.length > 1) // Filter out files in root dir
    .map(a => a[0])
    .uniq()
    .valueOf();

  return dirs;
};

let paths = [];

const processPaths = function () {
  const modifiedProjects = projectsFromPaths(paths);
  paths = [];

  const modifiedProjects2d = [modifiedProjects];
  for ( let project of modifiedProjects ) {
    modifiedProjects2d.push(dependents.getR(project));
  }

  const modifiedProjectsR = util.flattenUniq(modifiedProjects2d);
  const modifiedImages = imageNames.filter(image => {
    // First, get the project from this image. Some projects may be used used to make
    // multiple images, e.g. clj-pdf is used in clj-pdf.base and clj-pdf
    const imageProject = image.split('.')[0];
    return modifiedProjectsR.indexOf(imageProject) > -1;
  });
  const modifiedServices = _.flatten(_.values(_.pick(imageNameToServiceNames, modifiedImages)));

  for ( let s of modifiedServices ) {
    console.log(s);
  }
};

let timeout;
rl.on('line', line => {
  paths.push(line);

  clearTimeout(timeout);
  timeout = setTimeout(processPaths, 500);
});
