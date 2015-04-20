'use strict';

var assert = require('assert');

function userFormat(obj) {
  return [{
    _id: obj[0]._id,
    provider: obj[0].currentProvider,
    displayName: obj[0].providers[obj[0].currentProvider].displayName,
    url: obj[0].providers[obj[0].currentProvider].url,
    image: obj[0].providers[obj[0].currentProvider].image.url
  }];
}

module.exports = function(obj) {
  assert.equal(typeof (obj), 'object', 'argument obj must be an object');
  return userFormat(obj);
};
