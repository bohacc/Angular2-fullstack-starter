/**
 * Notia Informační systémy, spol. s r. o.
 * Created by Martin Boháč on 05.09.2014.
 */
/*global require, module, __dirname */
/*jslint node: true */
'use strict';

/**
 * @file constants
 * @fileOverview __Server_Constants
 */

/**
 * @namespace __Server_Constants
 * @author Martin Boháč
 */

var constants = require('./constants');

// predelat na JSON ktery se bude nacitat jak pro server tak pro klienta, aby to bylo na jednom miste
module.exports = {
  PATHS: {
    CART: '/kosik',
    LOGIN: '/login',
    HOMEPAGE: '/homepage',
  },
  SLASH: '/',
  DOT: '.',
  FORMAT_NUMBER_1: '1.0-0',
  FORMAT_NUMBER_2: '1.1-2',
  SESSIONID_CODE: 'sessionid',
  AUTH_TOKEN_CODE: 'auth_token',
};
