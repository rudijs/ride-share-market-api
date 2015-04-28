'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('./../../../config/app'),
  rpcUpdateRideshare = require(config.get('root') + '/httpd/lib/rpc/rideshares/rpc-rideshares-update'),
  jsonRpcResponse = require(config.get('root') + '/httpd/lib/rpc/rpc-json-rpc-response');

module.exports = function updateRideshare(rideshare) {

  assert.equal(typeof (rideshare), 'object', 'argument rideshare must be an object');

  var deferred = q.defer();

  rpcUpdateRideshare(rideshare)
    .then(
    function (res) {
      // A successful JSON-RPC message may contain either result or error
      // Resolve (determine) the reply (result or error)
      return jsonRpcResponse.resolveSuccess(res);

    },
    function (err) {
      // Return JSON-API error object
      deferred.reject(jsonRpcResponse.resolveError(err));
    }
  )
    .then(
    function (res) {
      deferred.resolve({rideshares: [res]});
    },
    function (err) {
      deferred.reject(err);
    }
  )
    .done();

  return deferred.promise;
};
