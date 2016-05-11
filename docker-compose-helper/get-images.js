// Given a set of docker-compose yaml files and a service name, this script
// determines which docker images need to be built, including any linked
// service images, recursivly.

'use strict';

// Node
const fs = require('fs');

// NPM
const yaml = require('js-yaml');

// Project
const composeFiles = require('./lib/compose-files');

// File
const args = process.argv.slice(2);
const service = args.pop();

const onlyUnique = function (value, index, self) {
  return self.indexOf(value) === index;
};

// Load all yaml files (may be an override)
const yamls = args.filter(a => a !== '-f');
const services = composeFiles.parse(yamls);

const getImageDepsR = function (service) {
  const serviceDesc = services[service] || {};

  const arr2d = [];

  // Get any linked dependency images, recursively
  const links = serviceDesc['links']
  if ( links && links.length ) {
    for ( let link of links ) {
      arr2d.push(getImageDepsR(link));
    }
  }

  // Add the services own image
  const image = serviceDesc['image'];
  if ( image )
    arr2d.push([image]);

  const allImages = [].concat.apply([], arr2d);
  return allImages.filter(onlyUnique);
};

const getAllImageDeps = function () {
  const arr2d = [];

  for ( let service in services ) {
    arr2d.push(getImageDepsR(service));
  }

  const all = [].concat.apply([], arr2d);
  return all.filter(onlyUnique);
};

let images;
if ( service === ':all:' ) {
  images = getAllImageDeps();
} else {
  images = getImageDepsR(service);
}

// Filter out images that have a colon... assume these are likely from docker hub
images = images.filter(image => {
  return image.indexOf(':') === -1;
});
process.stdout.write(images.join(' '));
