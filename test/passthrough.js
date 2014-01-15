
var redis = require('redis');
var assert = require('assert');
var RedisBatch = require('..');

/**
 * Other command passthrough tests.
 */

describe('others', function () {
  it('should pass through to the redis instance', function(){
    var client = redis.createClient();
    var batch = new RedisBatch(client);
    assert('Multi' == batch.multi().constructor.name);
  })
});