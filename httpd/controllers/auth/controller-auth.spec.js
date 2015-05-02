'use strict';

require('co-mocha');

var should = require('chai').should(),
  sinon = require('sinon'),
  q = require('q'),
  google = require('googleapis'),
  OAuth2 = google.auth.OAuth2;

var config = require('./../../../config/app'),
  authController = require('./controller-auth'),
  rpcPublisher = require(config.get('root') + '/httpd/lib/rpc/rpc-publisher');

describe('Controllers', function () {

  describe('Auth', function () {

    afterEach(function (done) {

      // Restore sinon stubs
      if (OAuth2.prototype.getToken.restore) {
        OAuth2.prototype.getToken.restore();
      }
      if (rpcPublisher.publish.restore) {
        rpcPublisher.publish.restore();
      }
      if (google.plus.restore) {
        google.plus.restore();
      }
      done();
    });

    it('should handle missing required arguments', function *() {

      should.exist(authController.googleCallback);

      try {
        yield authController.googleCallback();
      }
      catch (e) {
        e.name.should.equal('AssertionError');
        e.message.should.match(/code.*string/);
      }

    });

    it('should handle Google Oauth Error', function *() {

      sinon.stub(OAuth2.prototype, 'getToken', function (code, callback) {
        callback('invalid_grant');
      });

      try {
        yield authController.googleCallback('abc123');
      }
      catch (e) {
        e.name.should.equal('Error');
        e.message.should.equal('invalid_grant');
      }

    });

    describe('RPC processes', function () {

      beforeEach(function (done) {

        // 1st stub the Google Oauth process with a success result

        var getOauthTokenTokens = {
          access_token: 'ya29.cgBOAwcobnnB_iEAAACkeFP2kwCfkDjdefR0Utqn4ln0dNgWO546IatEMyFui3KNgeCg6gBWr8yKomYkT_X',
          token_type: 'Bearer',
          id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImRmNGNmZGQzMmYwYmI4Zjg4N2EwNDBhMGJhYTdjODUxYjhmOTViMzcifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWQiOiIxMDk1MTE5NjI3MjY3MTk1NTM2MTIiLCJzdWIiOiIxMDk1MTE5NjI3MjY3MTk1NTM2MTIiLCJhenAiOiIxMDE1OTc4ODI5OTA5LWRqYzJsamZtZTVyNG1ucWQ0Y28zODBtbm1uODlhZnBtLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiZW1haWwiOiJvb2x5Lm1lQGdtYWlsLmNvbSIsImF0X2hhc2giOiJ2cFBpWDljZ1NwNzJoUG5fZFhlbEhBIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF1ZCI6IjEwMTU5Nzg4Mjk5MDktZGpjMmxqZm1lNXI0bW5xZDRjbzM4MG1ubW44OWFmcG0uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJ0b2tlbl9oYXNoIjoidnBQaVg5Y2dTcDcyaFBuX2RYZWxIQSIsInZlcmlmaWVkX2VtYWlsIjp0cnVlLCJjaWQiOiIxMDE1OTc4ODI5OTA5LWRqYzJsamZtZTVyNG1ucWQ0Y28zODBtbm1uODlhZnBtLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiaWF0IjoxNDA5NDk3OTY1LCJleHAiOjE0MDk1MDE4NjV9.DjT7VxG-2rU7GQ1ycobvl3hp19AP9dS8uqqKHWAtvKdnhQfT3mK5PCYwrFsLgBpbtf_vR3fa1c0t9ZnFrkGgPUrH7kiSg0s9e7PoBsN2z39gbn9X4Blc4Y0NvS-CWFINJuxl3KYURIY2u1n2bMFcJFD2kFi34re8a4FKY9YV_rs',
          expiry_date: 1409501865230
        };

        sinon.stub(OAuth2.prototype, 'getToken', function (code, callback) {
          callback(null, getOauthTokenTokens);
        });

        // Google plus user
        var user = {
          kind: 'plus#person',
          etag: '"pNz5TVTpPz2Rn5Xw8UrubkkbOJ0/8wII0zxjh6EMZTkJA--p6DSI-wX"',
          gender: 'male',
          emails: [{value: 'net@citizen.com', type: 'account'}],
          objectType: 'person',
          id: '109515962716719253613',
          displayName: 'Net Citizen',
          name: {familyName: 'Citizen', givenName: 'Net'},
          url: 'https://plus.google.com/109511962727719553613',
          image: {
            url: 'https://lh3.googleusercontent.com/-eLAFwuSEM2x/AAAAAAAAAAI/AAAAAAAAACg/dWlcwoWU533/photo.jpg?sz=50',
            isDefault: false
          },
          isPlusUser: true,
          circledByCount: 8,
          verified: false
        };

        sinon.stub(google, 'plus').returns({
          people: {
            get: function (obj, callback) {
              callback(null, user);
            }
          }
        });

        done();

      });

      it('should handle database errors', function *() {

        // stub the database save operation with an error
        sinon.stub(rpcPublisher, 'publish', function () {
          return q.reject({code: 500, message: 'Service Unavailable'});
        });

        try {
          yield authController.googleCallback('abc123');
        }
        catch (e) {
          e.name.should.equal('Error');
          e.message.should.equal('Service Unavailable');
        }

      });

      it('should return a redirect URL', function *() {

        // stub the database save operation with a success
        sinon.stub(rpcPublisher, 'publish', function () {

          var result = JSON.stringify({
              result: {
                _id: 'xyzdef',
                currentProvider: 'google',
                providers: {
                  google: {
                    name: {
                      givenName: 'User'
                    }
                  }
                }
              }
            }
          );

          return q.resolve(result);
        });

        var redirectUrl = yield authController.googleCallback('abc123');

        redirectUrl.should.match(/^http.*jwt=.*/);

      });

    });

  });

});
