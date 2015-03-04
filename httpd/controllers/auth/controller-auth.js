'use strict';

var assert = require('assert');

var config = require('./../../../config/app'),
  logger = require(config.get('root') + '/config/log'),
  oauthGoogle = require(config.get('root') + '/httpd/lib/oauth/lib-oauth-google'),
  rpcUserSignIn = require(config.get('root') + '/httpd/lib/rpc/users/rpc-users-signin'),
  jwtManager = require(config.get('root') + '/httpd/lib/jwt/jwtManager');

/**
 * Signin at google
 * Create or Update returned user with mongodb
 * Create JWT
 * Generate the redirect to app URL
 *
 * @param code Google Oauth access_code
 * @returns {string} URL - redirect to app URL
 */
exports.googleCallback = function *googleCallback(code) {

  assert.equal(typeof (code), 'string', 'argument code must be a string');

  try {

    // 1
    // Perform Oauth steps
    var oAuthUser = yield oauthGoogle(code);

    // 2
    // Add/Update database
    var signedInUser = yield rpcUserSignIn('google', oAuthUser);

    // 3
    // Generate JWT token
    var token = jwtManager.issueToken({
      name: signedInUser.providers[signedInUser.currentProvider].name.givenName,
      id: signedInUser._id
    });

    var redirectUrl = [
      config.get('oauth').protocol,
      config.get('oauth').success.location,
      '?jwt=',
      token
    ].join('');

    return redirectUrl;

  }
  catch (err) {

    logger.error(err);

    // RPC Error
    if (err.code && err.code === 500) {
      throw new Error(err.message);
    }

    throw new Error(err);
  }

};
