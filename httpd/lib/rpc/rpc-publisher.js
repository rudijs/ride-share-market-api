'use strict';

var config = require('./../../../config/app'),
  rpcPublisherFactory = require('amqp-rpc-factory').publisher;

function getRabbitmqUrl(config) {
  var rmq_options = config.get('messageQueue').rabbitmq;
  return rmq_options.user + ':' + rmq_options.password + '@' + rmq_options.url + rmq_options.vhost;
}

var publisher = null;

if (!publisher) {
  publisher = rpcPublisherFactory.create({
    url: getRabbitmqUrl(config),
    queue: 'rpc_mongodb'
  });
}

module.exports = publisher;
