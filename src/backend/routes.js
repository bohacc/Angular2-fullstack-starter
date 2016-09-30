/*global require, module,  __dirname */
/*jslint es5: true, indent: 2, node:true, nomen: true, maxlen: 80, vars: true*/
'use strict';

/**
 * @file user
 * @fileOverview __Server_ROUTE
 */

/**
 * @namespace __Server_ROUTE
 * @author Martin Boháč
 */
var env = process.env.NODE_ENV || 'development';

var api = require('./api'),
  path = require('path'),
  tools = require('./tools'),
  constants = require('./constants'),
  authentication = require('./authentication');

module.exports = function (app) {
  // APIs
  app.get('/test', api.test);

// all other routes are handled by Angular
  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });

  app.get('*', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var pojo = { status: 404, message: 'No Content' };
    var json = JSON.stringify(pojo, null, 2);
    res.status(404).send(json);
  });
};
