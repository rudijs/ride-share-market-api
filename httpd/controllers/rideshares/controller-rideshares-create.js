'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('./../../../config/app'),
  rpcCreateRideshare = require(config.get('root') + '/httpd/lib/rpc/rideshares/rpc-rideshares-create'),
  jsonRpcResponse = require(config.get('root') + '/httpd/lib/rpc/rpc-json-rpc-response');

module.exports = function createRideshare(rideshare) {

  assert.equal(typeof (rideshare), 'object', 'argument rideshare must be an object');

  var deferred = q.defer();

  rpcCreateRideshare(rideshare)
    .then(
    function rpcCreateRideshareSuccess(res) {
      // A successful JSON-RPC message may contain either result or error
      // Resolve (determine) the reply (result or error)
      return jsonRpcResponse.resolveSuccess(res);

    },
    function rpcCreateRideshareError(err) {
      // Return JSON-API error object
      deferred.reject(jsonRpcResponse.resolveError(err));
    }
  )
    .then(
    function jsonRpcResponseSuccess(res) {
      deferred.resolve({rideshares: [res]});
    },
    function jsonRpcResponseError(err) {
      console.log(err);
      deferred.reject(err);
    }
  )
    .done();

  return deferred.promise;
};
