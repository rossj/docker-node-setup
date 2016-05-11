'use strict';

const express = require('express');
const request = require('request');
const lodash = require('lodash');
const module1 = require('module1');
const app = express();

app.get('/service1', function (req, res) {
  res.write('Hello World from service 1\n');
  res.write('Using lodash version ' + lodash.VERSION + '\n');
  res.end(module1());
});

app.get('/service2', function (req, res) {
  const addr = process.env.SERVICE2_PORT_3000_TCP_ADDR + ':' + process.env.SERVICE2_PORT_3000_TCP_PORT;
  request('http://' + addr).pipe(res);
});

app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + process.env.PORT);
});
