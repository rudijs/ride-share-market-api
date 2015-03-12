'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  fs = require('fs');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcCreateRideshare = require('./rpc-rideshares-create'),
  rpcFindAllRideshares = require('./rpc-rideshares-find-all'),
  rpcRemoveRideshareById = require('./rpc-rideshares-remove-by-id');

var rideshareFixture = fs.readFileSync(config.get('root') + '/test/fixtures/rideshare_1.json').toString();

describe('RPC Find All Rideshares', function () {

  afterEach(function (done) {
    if (rpcPublisher.publish.restore) {
      rpcPublisher.publish.restore();
    }
    done();
  });

  var rideshare = JSON.parse(rideshareFixture);

  rideshare.user = '54354a2e1268cf741d84c3e8';

  var rideshareID;

  it('should return a result', function (done) {

    rpcCreateRideshare(rideshare).then(
      function rpcCreateRideshareSuccess(res) {
        should.exist(res.result._id);
        rideshareID = res.result._id;
        return q.resolve(res.result._id);
      }
    )
      .then(function() {
        return rpcFindAllRideshares();
      })
      .then(function(res) {
        should.exist(res.result);
        res.result.should.be.instanceof(Array);
      })
      .then(function() {
        rpcRemoveRideshareById(rideshareID);
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
