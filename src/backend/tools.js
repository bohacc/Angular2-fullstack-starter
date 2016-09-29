var Constants = require('./constants');

exports.getSingleResult = function(result) {
  var obj = {};
  if (result && result.result) {
    if (result.result.rows) {
      if (result.result.rows[0]) {
        obj = result.result.rows[0];
      } else {
        obj = {};
      }
    }
  }
  return obj;
}

exports.getMultiResult = function(result) {
  var obj = [], i, l;
  if (result && result.result) {
    if (result.result.rows) {
      for (i = 0, l = result.result.rows.length; i < l; i += 1) {
        obj.push(result.result.rows[i]);
      }
    }
  }
  return obj;
}

exports.validateEmail = function(value) {
  var re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      result = value ? re.test(value) : true;
  return result;
}

exports.validatePhone = function(value) {
  var re = /^(\+420)? ?[0-9]{3} ?[0-9]{3} ?[0-9]{3}$/,
      result = value ? re.test(value) : true;
  return result;
}

exports.validateZip = function(value) {
  var re = /^[0-9]{3} ?[0-9]{2}$/,
      result = value ? re.test(value) : true;
  return result;
}

exports.getCookieId = function(req, name) {
  return req.cookies.get(name);
}

exports.getSessionId = function(req) {
  return req.cookies.get(Constants.SESSIONID_CODE);
}

exports.createCookie = function(res, name, val, options) {
  res.cookies.set(name, val, options);
}

exports.createAuthCookie = function(res, val) {
  //let expires = new Date();
  res.cookies.set(Constants.AUTH_TOKEN_CODE, val, {});
}

exports.deleteCookie = function(res, name) {
  //res.cookies.set(name, {expire: new Date()});
  res.clearCookie(name);
}


