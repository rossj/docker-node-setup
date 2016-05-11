'use strict';

const express = require('express');
const request = require('request');
const lodash = require('lodash');
const module1 = require('module1');
const app = express();

app.get('/hello', function (req, res) {
  res.write('Hello World from service1\n');
  res.write('Using lodash version ' + lodash.VERSION + '\n');

  res.write('\nCalling module1 from service1\n');
  res.write(module1());

  res.write('\nCalling service2 from service1\n');
  const addr = process.env.SERVICE2_PORT_3000_TCP_ADDR + ':' + process.env.SERVICE2_PORT_3000_TCP_PORT;
  request('http://' + addr + '/hello', function (err, response, body) {
    res.end(body);
  });
});

app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + process.env.PORT);
});
