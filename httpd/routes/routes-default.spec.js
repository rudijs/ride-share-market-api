'use strict';

var http = require('http'),
  request = require('supertest'),
  should = require('chai').should(),
  router = require('koa-router'),
  koa = require('koa'),
  app = koa();

app.use(router(app));

require('./routes-default')(app);

var server = http.createServer(app.callback());

describe('Default Routes', function () {

  it('should 404 Page Not Found', function (done) {
    request(server)
      .get('/not/found')
      .expect(404)
      .end(function (err, res) {
        if (err) {
          should.not.exist(err);
          return done(err);
        }
        res.statusCode.should.equal(404);
        res.text.should.equal('<p>Page Not Found</p>');
        done();

      });
  });

});
