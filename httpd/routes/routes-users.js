'use strict';

var config = require('./../../config/app'),
  usersController = require(config.get('root') + '/httpd/controllers/users/controller-users-find'),
  auth = require(config.get('root') + '/httpd/middlewares/authorization');

module.exports = function (app) {

  app.get('/users/:id', auth(), function *() {
    //app.get('/users/:id', function *() {

    try {
      var user = yield usersController.findById(this.params.id);
      this.body = user;
    }
    catch (e) {
      //console.log('e', e);
      this.throw(e.status, {message: {errors: e.errors}});
    }

  });

};
