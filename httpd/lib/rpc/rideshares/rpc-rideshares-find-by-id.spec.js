'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcFindRideshareById = require('./rpc-rideshares-find-by-id');

var rideshareFixture = fs.readFileSync(config.get('root') + '/test/fixtures/rpc_response_rpc-rideshares-find-by-id.json').toString();

describe('RPC Find Rideshare By ID', function () {

  afterEach(function (done) {
    if (rpcPublisher.publish.restore) {
      rpcPublisher.publish.restore();
    }
    done();
  });

  it('should return an array with one rideshare', function (done) {

    sinon.stub(rpcPublisher, 'publish', function () {
      return q.resolve(rideshareFixture);
    });

    rpcFindRideshareById('54f4136c64cb08491774eee0').then(function rpcFindRideshareByIdSuccess(res) {
      should.exist(res.result);
      res.result.should.be.instanceof(Array);
      res.result.length.should.equal(1);
      res.result[0]._id.should.equal('54f4136c64cb08491774eee0');
    })
      .then(done, done);

  });

  it('should handle publish errors', function (done) {

    sinon.stub(rpcPublisher, 'publish', function () {
      return q.reject({code: 503, message: 'Service Unavailable'});
    });

    rpcFindRideshareById('54449e565a2982eab34eb8e5').catch(function rpcFindAllRidesharesError(err) {
      err.code.should.equal(503);
      err.message.should.equal('Service Unavailable');
    })
      .then(done, done);
  });

});
