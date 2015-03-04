'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcRemoveRideshareById = require('./rpc-rideshares-remove-by-id');

describe('RPC Remove Rideshare By ID', function() {

  afterEach(function(done) {
    if(rpcPublisher.publish.restore) {
      rpcPublisher.publish.restore();
    }
    done();
  });

  it('should successfully execute an JSON-RPC call', function(done) {

    rpcRemoveRideshareById('5469c666b207c9564a1d2632').then(function rpcRemoveRideshareByIdSuccess(res) {
      res.jsonrpc.should.equal('2.0');
      should.exist(res.id);
      res.error.code.should.equal(404);
      res.error.message.should.equal('not_found');
      res.error.data.should.equal('Rideshare not found.');
    })
    .then(done,done);

  });

  it('should handle publish errors', function (done) {

    sinon.stub(rpcPublisher, 'publish', function () {
      return q.reject({code: 503, message: 'Service Unavailable'});
    });

    rpcRemoveRideshareById('5469c666b207c9564a1d2632').catch(function rpcRemoveRideshareByIdError(err) {
      err.code.should.equal(503);
      err.message.should.equal('Service Unavailable');
    })
      .then(done, done);
  });


});