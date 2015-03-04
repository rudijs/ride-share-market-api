'use strict';

var assert = require('assert'),
  q = require('q');

var config = require('./../../../config/app'),
  rpcUserFind = require(config.get('root') + '/httpd/lib/rpc/users/rpc-users-find'),
  jsonRpcResponse = require(config.get('root') + '/httpd/lib/rpc/rpc-json-rpc-response');

var validateId = function validateId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

var findById = function findById(id) {

  assert.equal(typeof (id), 'string', 'argument id must be a string');

  if (!validateId(id)) {
    return q.reject({
        status: 400,
        errors: [
          {
            code: 'invalid_format',
            title: 'Invalid user ID format.'
          }
        ]
      }
    );
  }

  // TODO: test this again
  //throw new Error('Oops! Something blew up!');

  var deferred = q.defer();

  rpcUserFind.findById(id)
    .then(
    function findUserByIdSuccess(res) {
      // A successful JSON-RPC message may contain either result or error
      // Resolve (determine) the reply (result or error)
      return jsonRpcResponse.resolveSuccess(res);
    },
    function findByIdError(err) {
      // Return JSON-API error object
      deferred.reject(jsonRpcResponse.resolveError(err));
    }
  )
    .then(
    function jsonRpcResponseSuccess(res) {
      deferred.resolve({users: res});
    },
    function jsonRpcResponseError(err) {
      deferred.reject(err);
    }
  )
    .done();

  return deferred.promise;
};

exports.findById = findById;
