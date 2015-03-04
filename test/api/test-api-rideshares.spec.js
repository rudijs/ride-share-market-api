'use strict';

var config = require('../../config/app'),
  request = require('supertest'),
  should = require('chai').should(),
  assert = require('chai').assert;

console.log('http://' + config.get('app').hostname + ':' + config.get('app').port);

var apiRequest = request('http://' + config.get('app').hostname + ':' + config.get('app').port);

describe('Rideshares', function () {

  describe('Non Authorized requests', function () {

    describe('GET /rideshares', function () {

      describe('accept', function () {

        it('should 200 with JSON API format', function (done) {
          apiRequest
            .get('/rideshares')
            .set('Accept', 'application/vnd.api+json')
            .expect('Content-Type', /application\/vnd\.api\+json/)
            .expect(200)
            .end(function (err, res) {
              if (err) {
                return done(err);
              }

              // Raw response test
              res.text.should.match(/{"rideshares":\[{"_id":.*}/);

              // Parse response test
              var jsonResponse = JSON.parse(res.text);

              should.exist(jsonResponse.rideshares);
              assert.isArray(jsonResponse.rideshares, 'Top level response property should be an Array');

              // First element in the response array should be a rideshare
              should.exist(jsonResponse.rideshares[0]);
              should.exist(jsonResponse.rideshares[0]._id);

              done();
            });
        });

      });

    });

  });

});
