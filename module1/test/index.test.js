require('mocha');

const expect = require('chai').expect;

const module1 = require('../');

describe('My Module', function() {
  it('should say "Hello"', function () {
    expect(module1()).to.include('Hello');
  });
});
