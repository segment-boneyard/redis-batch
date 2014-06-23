var assert = require('assert');
var RedisSpy = require('./lib/redis-spy');
var Flushes = require('./lib/flushes');

var RedisBatch = require('../lib');

/**
 * Testing data.
 */

var key1 = 'key1';
var key2 = 'key2';

/**
 * Test timing management.
 */

var flushAfter = 10;
var flushes = Flushes(flushAfter);


/**
 * persist tests
 */

describe('persist', function () {
  
  var redis;
  var batch;
  
  beforeEach(function () {
    redis = RedisSpy('persist');
    batch = new RedisBatch(redis, { flushAfter: flushAfter });
  });

  it('should not flush when no persists are added', function (done) {
    var test = function () {
      assert.equal(redis.persist.callCount, 0);
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(2));
    setTimeout(test, flushes(3));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush a single persist', function (done) {
    batch.persist(key1);
    var test = function () {
      assert.equal(redis.persist.callCount, 1);
      assert(redis.persist.calledWith(key1));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush a single persist for one key', function (done) {
    batch.persist(key1)
      .persist(key1)
      .persist(key1);
    var test = function () {
      assert.equal(redis.persist.callCount, 1);
      assert(redis.persist.calledWith(key1));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush multiple persists for multiple keys', function (done) {
    batch.persist(key1)
      .persist(key1)
      .persist(key1)
      .persist(key1)
      .persist(key2);
    var test = function () {
      assert.equal(redis.persist.callCount, 2);
      assert(redis.persist.calledWith(key1));
      assert(redis.persist.calledWith(key2));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

});
