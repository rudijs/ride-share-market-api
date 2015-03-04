'use strict';

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q');

var config = require('../../../../config/app'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher'),
  rpcUserSignIn = require('./rpc-users-signin');

describe('RPC User Sign In', function () {

  afterEach(function (done) {
    if (rpcPublisher.publish.restore) {
      rpcPublisher.publish.restore();
    }
    done();
  });

  describe('Google Oauth', function () {

    var user = {
      emails: [{value: 'net@citizen.com'}],
      googlePlus: 'profile-data-here'
    };

    it('should publish a JSON-RPC user.signin message and return the result', function (done) {

      should.exist(rpcUserSignIn);

      sinon.stub(rpcPublisher, 'publish', function (json) {
        var jsonRpc = JSON.parse(json);

        jsonRpc.jsonrpc.should.equal('2.0');
        (typeof (jsonRpc.id)).should.be.a('string');
        jsonRpc.method.should.equal('user.signIn');
        jsonRpc.params.should.be.an('object');

        var result = JSON.stringify({
            result: {
              email: user.emails[0].value
            }
          }
        );

        return q.resolve(result);
      });

      rpcUserSignIn('google', user).then(function rpcUserSignInSuccess(res) {
        res.email.should.equal(user.emails[0].value);
      })
        .then(done, done);

    });

    it('should handle publish errors', function (done) {

      sinon.stub(rpcPublisher, 'publish', function () {
        return q.reject({code: 500, message: 'Service Unavailable'});
      });

      rpcUserSignIn('google', user).catch(function rpcUserSignInError(err) {
        err.code.should.equal(500);
        err.message.should.equal('Service Unavailable');
      })
        .then(done, done);
    });

  });

});
