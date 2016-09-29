/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 11.09.2014.
 */
/*jslint node: true, unparam: true*/
'use strict';

/**
 * @file connections
 * @fileOverview __Server_Connections
 */

/**
 * @namespace __Server_Connections
 * @author Martin Boháč
 */

var connections = [],
  env,
  clientDBDevelopment = null,
  Promise = require('promise'),
  tools = require('./tools'),
  auth = require('./authentication'),
  oracle = require('oracledb'),
  apiOracle = require('./api_oracle'),
  constants = require('./constants'),
  conn = require('./connections');

/**
 * @memberof __Server_Connections
 * @method
 * @name setEnv
 * @description set NODE_ENV
 * @param str {String} string for ENV
 * @returns void
 */
exports.setEnv = function (str) {
  env = str;
};

/**
 * @memberof __Server_Connections
 * @method
 * @name getEnv
 * @description get NODE_ENV
 * @returns String
 */
exports.getEnv = function () {
  return env;
};

/**
 * @memberof __Server_Connections
 * @method
 * @name ConnObj
 * @description object for instances connections
 * @param obj {Object} object with connection data
 * @returns void
 */
exports.ConnObj = function (obj) {
  this.loginToken = obj.loginToken;
  this.id = obj.id;
  this.user = obj.user;
  this.password = obj.password;
  this.database = obj.database;
  this.hostname = obj.hostname;
  this.port = obj.port;
  this.connectString = obj.connectString;
  this.meta = obj.meta;
};

/**
 * @memberof __Server_Connections
 * @method
 * @name connect
 * @description application login user, create client token and save to DB
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.connect = function (req, res) {
  var credentials = req.body.credentials;
  // add information for connection from logging dB
  tools.updateCredentials(credentials);
  // connect to DB
  auth.signin(credentials, req, res).then(
    function (obj) {
      if (obj.success) {
        // save current login
        credentials.loginToken = obj.loginToken;
        conn.addConnection(credentials);
      }
      res.json({success: obj.success});
    },
    function (result) {
      res.json({message: {type: constants.MESSAGE_ERROR, message: constants.MESSAGE_CONNECT_INVALID_USERNAME_OR_PASSWORD + ' (' + result + ')'}});
    }
  );
};

/**
 * @memberof __Server_Connections
 * @method
 * @name getConnection
 * @description get connection to DB
 * @param req {Object} request reference object
 * @returns Object
 */
/*
exports.getConnection = function (req) {
  var i, l, connect = {}, loginToken;
  loginToken = tools.getLoginToken(req);
  if (conn.getEnv() === 'Xdevelopment') {
    connect = {
      user: 'TESTER_TABLET',
      password: 'TESTER_TABLET',
      database: 'sunee.notia.cz',
      hostname: 'sun.notia.cz',
      port: 1521,
      clientDB: clientDBDevelopment,
      connectString: 'sun.notia.cz/sunee.notia.cz',
      meta: {}
    };
  } else {
    // search connection on PRODUCTION
    for (i = 0, l = connections.length; i < l; i += 1) {
      if (connections[i].loginToken === loginToken) {
        connect = connections[i];
        break;
      }
    }
  }
  return connect;
};*/

exports.getConnection = function(req) {
  var i, l, connect = {}, loginToken;
  return connect = {
    user: 'mcled_website_v3',
    password: 'Slepic12',
    database: '',
    hostname: '',
    port: 1521,
    clientDB: '',
    connectString: (process.env.APP_CONNECT_STRING || 'mail.schmachtl.cz/notia'),
    meta: {}
  };
}

/**
 * @memberof __Server_Connections
 * @method
 * @name setConnectionClientDB
 * @description set connection to DB
 * @param req {Object} request reference object
 * @param client {Object} client instance for DB
 * @returns void
 */
exports.setConnectionClientDB = function (req, client) {
  var i, l, loginToken;
  loginToken = tools.getLoginToken(req);
  if (conn.getEnv() === 'development') {
    clientDBDevelopment = client;
  } else {
    // search connection on PRODUCTION
    for (i = 0, l = connections.length; i < l; i += 1) {
      if (connections[i].loginToken === loginToken) {
        connections[i].clientDB = client;
        break;
      }
    }
  }
};

/**
 * @memberof __Server_Connections
 * @method
 * @name removeConnection
 * @description remove connection instance from connection stack
 * @param req {Object} request reference object
 * @returns void
 */
exports.removeConnection = function (req) {
  try {
    var loginToken = tools.getLoginToken(req), i;
    for (i = 0; i < connections.length; i += 1) {
      if (loginToken === connections[i].loginToken) {
        connections.splice(i, 1);
        return;
      }
    }
  } catch (e) {
    console.log(e.message);
  }
};

/**
 * @memberof __Server_Connections
 * @method
 * @name addConnection
 * @description push connection instance to connection stack
 * @param credentials {Object} credentials data
 * @returns void
 */
exports.addConnection = function (credentials) {
  try {
    connections.push({
      loginToken: credentials.loginToken,
      id: credentials.id,
      user: credentials.user,
      password: credentials.password,
      database: credentials.database,
      hostname: credentials.host,
      port: credentials.port,
      connectString: credentials.connectString,
      meta: {}
    });
  } catch (e) {
    console.log(e.message);
  }
};
