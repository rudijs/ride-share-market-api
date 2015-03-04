'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q');

var config = require('./../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  ridesharesFindAll = require('./controller-rideshares-find-all');

describe('Controller Rideshares Find All', function () {

  afterEach(function (done) {
    if (rpcPublisher.publish.restore) {
      rpcPublisher.publish.restore();
    }
    done();
  });

  describe('RPC Success', function () {

    it('should return an array of Rideshares', function (done) {

      ridesharesFindAll().then(function ridesharesFindAllSuccess(res) {
        should.exist(res.rideshares);
        res.rideshares.should.be.an.instanceof(Array);
      })
        .then(done, done);
    });

  });

  describe('RPC Error', function () {

    it('should handle RPC connections errors', function (done) {

      sinon.stub(rpcPublisher, 'publish', function () {
        return q.reject({
          code: 503,
          message: 'service_unavailable',
          data: 'Service Unavailable'
        });
      });

      ridesharesFindAll().catch(function ridesharesFindAllError(err) {
        err.status.should.equal(503);
        err.errors[0].code.should.equal('service_unavailable');
        err.errors[0].title.should.equal('Service Unavailable');
      })
        .then(done, done);

    });

  });

});
