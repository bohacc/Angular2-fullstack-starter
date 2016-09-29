/*jslint node: true, unparam: true */
'use strict';

/**
 * @file authentication
 * @fileOverview __Server_REST_API_Authentication
 */

/**
 * @namespace __Server_REST_API_Authentication
 * @author Martin Boháč
 */

var crypto = require('crypto'),
  Promise = require('promise'),
  oracle = require('./api_oracle'),
  tools = require('./tools'),
  connections = require('./connections'),
  constants = require('./constants');

/**
 }
 * @memberof __Server_REST_API_Authentication
 * @method
 * @name signin
 * @description application login user, create client token and save to DB
 * @param credentials {Object} credentials object
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns Promise
 */
exports.signin = function (credentials, req, res) {
  var encrypted,
    vals;
  return new Promise(function (resolve, reject) {
    if (credentials && credentials.user && credentials.password) {
      //encryptedPassword = crypto.createHmac('sha1', 'Notia.1*').update(credentials.password).digest('hex');
      vals = {};
      // select with extra connect
      oracle.select("SELECT 1 AS \"exist\" FROM dual", vals, req, credentials, null).then(
        function (promise) {
          var obj = {success: tools.getSingleResult(promise).exist === 1};
          if (obj.success) {
            // create connection token
            encrypted = crypto.createHmac('sha1', String(Math.round((new Date().valueOf() * Math.random())))).update(String(Math.round((new Date().valueOf() * Math.random())))).digest('hex');
            tools.createCookie(res, 'auth_token', encrypted, true, true);
            tools.createCookie(res, 'isLogged', 1, false, false);
            obj.loginToken = encrypted;
            // find user
            oracle.select("SELECT 1 AS \"exist\" FROM user_connections WHERE upper(USER_NAME) = UPPER(:username)", {username: credentials.user}, req, credentials, null).then(
              function (promise) {
                // execute with extra connect
                // UPDATE
                if (tools.getSingleResult(promise).exist === 1) {
                  oracle.executeSQL(
                    req,
                    res,
                    "UPDATE user_connections SET LOGIN_TOKEN = :token,LOGIN_TOKEN_EXPIRATION = sysdate + ((1 / (24 * 60)) * 30) WHERE upper(USER_NAME) = UPPER(:username)",
                    {username: credentials.user, token: encrypted},
                    credentials,
                    {commit: true}
                  ).then(
                    function () {
                      resolve(obj);
                    },
                    function () {
                      reject('error update session user - signin');
                    }
                  );
                } else {
                  oracle.executeSQL(
                    req,
                    res,
                    "INSERT INTO user_connections(USER_NAME, LOGIN_TOKEN, LOGIN_TOKEN_EXPIRATION) VALUES(UPPER(:username), :token, sysdate + ((1 / (24 * 60)) * 30))",
                    {username: credentials.user, token: encrypted},
                    credentials,
                    {commit: true}
                  ).then(
                    function () {
                      resolve(obj);
                    },
                    function () {
                      reject('error insert session user - signin');
                    }
                  );
                }
              },
              function () {
                reject('error find user - signin');
              }
            );
          } else {
            reject('error - invalid login or password');
          }
        },
        function () {
          reject('error signin');
        }
      );
    } else {
      reject('error - credentials and connect string not found');
    }
  });
};

/**
 * @memberof __Server_REST_API_Authentication
 * @method
 * @name logout
 * @description application logout user, delete DB token and cookie token
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @returns void
 */
exports.logout = function (req, res) {
  var obj = {logout: false},
    loginToken = req.signedCookies.auth_token;
  try {
    tools.deleteCookie(res, 'auth_token');
    tools.deleteCookie(res, 'isLogged');
    obj.logout = true;
    oracle.executeSQL(req, res, 'UPDATE user_connections SET LOGIN_TOKEN_EXPIRATION = NULL,LOGIN_TOKEN = NULL WHERE LOGIN_TOKEN = :token', {token: loginToken}, null, {commit: true}).then(
      function () {
        connections.removeConnection(req);
        res.json(obj);
      },
      function (promise) {
        tools.sendResponseError(promise.result, res, false);
      }
    );
  } catch (e) {
    res.json({logout: false});
  }
};
