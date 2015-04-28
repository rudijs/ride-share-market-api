'use strict';

var config = require('./../../config/app'),
  auth = require(config.get('root') + '/httpd/middlewares/authorization'),
  ridesharesController = require(config.get('root') + '/httpd/controllers/rideshares');

module.exports = function (app) {

  app.get('/rideshares', function *() {

    try {
      var rideshares = yield ridesharesController.findAll();
      this.body = rideshares;
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }
  });

  app.get('/rideshares/:id', function *() {

    try {
      var rideshares = yield ridesharesController.findById(this.params.id);
      this.body = rideshares;
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

  app.post('/rideshares', auth(), function *() {

    // curl -i -H 'Accept: application/vnd.api+json' -H 'Content-Type: application/vnd.api+json' --data '{"itinerary": { "route": [{"place": "Melbourne"},{"place": "Sydney"}],"type": "Wanted"}}' localhost:3001/rideshares

    var assert = require('assert');
      //q = require('q');

    function buildRideshare(userId, requestBody) {

      assert.equal(typeof (userId), 'string', 'argument userId must be a string');
      assert.equal(typeof (requestBody), 'object', 'argument requestBody must be an object');

      var rideshare = requestBody;
      // TODO: validate userId is active user
      rideshare.user = userId;
      return rideshare;

      //return q.reject({
      //    status: 400,
      //    errors: [
      //      {
      //        code: 'invalid_format',
      //        title: 'Invalid Rideshare.'
      //      }
      //    ]
      //  }
      //);

    }

    try {

      var rideshare = yield buildRideshare(this.jwtToken.id, this.request.body);

      var newRrideshare = yield ridesharesController.create(rideshare);

      this.body = newRrideshare;
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

  app.put('/rideshares/:id', auth(), function *() {

    try {

      // TODO: validate user is owner
      // TODO: validate body

      var result = yield ridesharesController.update(this.request.body);

      this.body = result;
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

  app.del('/rideshares/:id', auth(), function *() {

    // TODO: if the user owns the rideshare
    // console.log('this.jwtToken', this.jwtToken);

    try {
      this.body = yield ridesharesController.removeById(this.params.id);
    }
    catch (e) {
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });
};
