'use strict';

var q = require('q');

var config = require('./../../../config/app'),
  rpcFindAllRideshares = require(config.get('root') + '/httpd/lib/rpc/rideshares/rpc-rideshares-find-all'),
  jsonRpcResponse = require(config.get('root') + '/httpd/lib/rpc/rpc-json-rpc-response');

module.exports = function findAll() {

  var deferred = q.defer();

  rpcFindAllRideshares()
    .then(
    function rpcFindAllRidesharesSuccess(res) {
      // A successful JSON-RPC message may contain either result or error
      // Resolve (determine) the reply (result or error)
      return jsonRpcResponse.resolveSuccess(res);
    },
    function rpcFindAllRidesharesError(err) {
      // Return JSON-API error object
      return q.reject(jsonRpcResponse.resolveError(err));
    }
  )
    .then(
    function jsonRpcResponseSuccess(res) {
      deferred.resolve({rideshares: res});
    },
    function jsonRpcResponseError(err) {
      deferred.reject(err);
    }
  )
    .done();

  return deferred.promise;
};
