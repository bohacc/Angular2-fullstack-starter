/**
 * Created by Martin on 29.11.13.
 */
/*jslint node: true, unparam: true */
'use strict';

/**
 * @file api
 * @fileOverview __Server_ORACLE_API
 */

/**
 * @namespace __Server_ORACLE_API
 * @author Martin Boháč
 */

var
  oracle = require('oracledb'),
  Promise = require('promise'),
  constants = require('./constants'),
  conn = require('./connections');

/**
 * @memberof __Server_ORACLE_API
 * @method
 * @name select
 * @description select sql via ORACLE framework
 * @param sql {String} sql text
 * @param vals {Object} vals for sql binding
 * @param req {Object} request reference object
 * @param connectData {Object} object with connection data
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.select = function (sql, vals, req, connectData, obj) {
  return new Promise(function (resolve, reject) {
    // connection instance to database from obj
    if (obj && obj.connection) {
      obj.connection.execute(
        sql,
        vals,
        {
          outFormat: oracle.OBJECT,
          maxRows: 5000
        },
        function (err, result) {
          if (err) {
            console.log(err);
            reject(err.message);
            return;
          }
          if (obj && obj.holdConnect) {
            resolve({connection: obj.connection, result: result});
          } else {
            obj.connection.release(
              function (err) {
                if (err) {
                  reject(err.message);
                  return;
                }
                resolve({connection: {}, result: result});
              }
            );
          }
        }
      );
    } else {
      var connectionObj = connectData || conn.getConnection(req);
      oracle.getConnection(
        connectionObj,
        function (err, connection) {
          if (err) {
            reject(err.message);
            return;
          }
          connection.execute(
            sql,
            vals,
            {
              outFormat: oracle.OBJECT,
              maxRows: 5000
            },
            function (err, result) {
              if (err) {
                console.log(err);
                reject(err.message);
                return;
              }
              if (obj && obj.holdConnect) {
                resolve({connection: connection, result: result});
              } else {
                connection.release(
                  function (err) {
                    if (err) {
                      reject(err.message);
                      return;
                    }
                    resolve({connection: {}, result: result});
                  }
                );
              }
            }
          );
        }
      );
    }
  });
};

/**
 * @memberof __Server_PG_API
 * @method
 * @name executeSQL
 * @description execute sql via PG framework
 * @param req {Object} request reference object
 * @param res {Object} response reference object
 * @param sql {String} sql text
 * @param vals {Object} vals for sql binding
 * @param connectData {Object} object with connection data
 * @param obj {Object} object with properties
 * @returns Promise
 */
exports.executeSQL = function (req, res, sql, vals, connectData, obj) {
  return new Promise(function (resolve, reject) {
    if (obj && obj.connection) {
      obj.connection.execute(
        sql,
        vals,
        {outFormat: oracle.OBJECT},
        function (err, result) {
          if (err /*|| obj.rollback*/) {
            obj.connection.rollback(function (errRollback) {
              if (errRollback) {
                reject(errRollback.message);
                return;
              }
              reject(err ? err.message : 'ROLLBACK');
              return;
            });
          } else if (obj.rollback) {
            obj.connection.rollback(function (errRollback) {
              if (errRollback) {
                reject(errRollback.message);
                return;
              }
              resolve('ROLLBACK');
              return;
            });
          } else {
            if (obj && obj.commit) {
              obj.connection.commit(function (err) {
                if (err) {
                  reject(err.message);
                  return;
                }
                obj.connection.release(
                  function (err) {
                    if (err) {
                      reject(err.message);
                      return;
                    }
                    resolve({connection: {}, result: result});
                  }
                );
              });
            } else {
              resolve({connection: obj.connection, result: result});
            }
          }
        }
      );
    } else {
      var connectionObj = connectData || conn.getConnection(req);
      oracle.getConnection(
        connectionObj,
        function (err, connection) {
          //console.log(connection);
          if (err) {
            reject(err.message);
            return;
          }
          connection.execute(
            sql,
            vals,
            {outFormat: oracle.OBJECT},
            function (err, result) {
              if (err) {
                connection.rollback(function (errRollback) {
                  if (errRollback) {
                    reject(errRollback.message);
                    return;
                  }
                  reject(err.message);
                });
              } else {
                if (obj && obj.commit) {
                  connection.commit(function (err) {
                    if (err) {
                      reject(err.message);
                      return;
                    }
                    connection.release(
                      function (err) {
                        if (err) {
                          reject(err.message);
                          return;
                        }
                        resolve({connection: {}, result: result});
                      }
                    );
                  });
                } else {
                  resolve({connection: connection, result: result});
                }
              }
            }
          );
        }
      );
    }
  });
};
