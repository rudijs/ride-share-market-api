'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcFindAllRideshares = require('./rpc-rideshares-find-all');

describe('RPC Find All Rideshares', function () {

  afterEach(function(done) {
    if(rpcPublisher.publish.restore) {
      rpcPublisher.publish.restore();
    }
    done();
  });

  it('should return an array of rideshares', function (done) {

    rpcFindAllRideshares().then(function rpcFindAllRidesharesSuccess(res) {
      should.exist(res.result);
      res.result.should.be.instanceof(Array);
    })
      .then(done, done);

  });

  it('should handle publish errors', function (done) {

    sinon.stub(rpcPublisher, 'publish', function () {
      return q.reject({code: 503, message: 'Service Unavailable'});
    });

    rpcFindAllRideshares().catch(function rpcFindAllRidesharesError(err) {
      err.code.should.equal(503);
      err.message.should.equal('Service Unavailable');
    })
      .then(done, done);
  });

});
