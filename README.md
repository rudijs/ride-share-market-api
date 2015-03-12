# Ride Share Market API

This is a Node.js HTTP API application.

This HTTP API layer for ridesharemarket.com sits between the [DATA](https://github.com/rudijs/ride-share-market-data) and APP applications.

## Overview

This API should adhere to the [JSON API specification](http://jsonapi.org).

JSON API requires use of the JSON API media type (application/vnd.api+json) for exchanging data for all requests.

Header example:

`Content-Type: application/vnd.api+json`

Error responses will be a collection keyed with "errors".
An error response may have one or more error objects with these properties:
- code - Application/machine message
- title - Human readable message

## Dependencies

    npm install -g gulp

## Install

    git clone git@github.com:rudijs/ride-share-market-api.git
    cd ride-share-market-api
    git fetch && git checkout develop
    npm install

## Gulp Tasks

    gulp help

## Unit Tests

    gulp test

    gulp watch-test

## Run dev server

    gulp serve

## API Tests (requires a running server)

    gulp test-api

## Development Tools

    gulp watch-lint

## Manual

    curl -v  -H "Accept: application/vnd.api+json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiTmV0IENpdGl6ZW4iLCJpYXQiOjE0MDYyNjc1ODB9.nD4JZi4XRwT8eJcdHyc8Ut9vfjFAW_52teSfgL4EeKc" 127.0.0.1:3001/rideshares

### Patch for Solarized theme

'patch' mocha to update the colours to a more solarized-friendly version. Run it in your working directory after an npm install to affect local versions of mocha, or in /usr/lib/node_modules (on my unix machine at least) to affect a global install of mocha.

    sudo apt-get install ack-grep
    pushd node_modules/mocha
    ack-grep -li "'pass': 90" --noignore-dir=node_modules | xargs sed -i "s/'pass': 90/'pass': 92/; s/'error stack': 90/'error stack': 92/; s/'fast': 90/'fast': 92/; s/'light': 90/'light': 92/; s/'diff gutter': 90/'diff gutter': 92/; s/'diff added': 42/'diff added': 34/; s/'diff removed': 41/'diff removed': 33/"
    popd
