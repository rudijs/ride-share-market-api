'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcCreateRideshare = require('./rpc-rideshares-create'),
  rpcRemoveRideshareById = require('./rpc-rideshares-remove-by-id');

var rideshareFixture = fs.readFileSync(config.get('root') + '/test/fixtures/rideshare_2.json').toString();

describe('RPC Create Rideshare', function () {

  afterEach(function(done) {
    if(rpcPublisher.publish.restore) {
      rpcPublisher.publish.restore();
    }
    done();
  });

  var rideshare = JSON.parse(rideshareFixture);

  rideshare.user = '54354a2e1268cf741d84c3e8';

  it('should create a new rideshare', function (done) {

    should.exist(rpcCreateRideshare);

    rpcCreateRideshare(rideshare).then(
      function rpcCreateRideshareSuccess(res) {
        should.exist(res.result._id);
        return q.resolve(res.result._id);
      }
    )
      .then(function(id) {
        rpcRemoveRideshareById(id);
      })
      .then(done, done);

  });

  it('should handle publish errors', function (done) {

    sinon.stub(rpcPublisher, 'publish', function () {
      return q.reject({code: 503, message: 'Service Unavailable'});
    });

    rpcCreateRideshare(rideshare).catch(function rpcCreateRideshareError(err) {
      err.code.should.equal(503);
      err.message.should.equal('Service Unavailable');
    })
      .then(done, done);
  });

});
