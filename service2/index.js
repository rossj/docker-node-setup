'use strict';

const express = require('express');
const lodash = require('lodash');
const module1 = require('module1');
const app = express();

app.get('/', function (req, res) {
  res.write('Hello World from service 2\n');
  res.write('Using lodash version ' + lodash.VERSION + '\n');
  res.end(module1());
});

app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + process.env.PORT);
});
