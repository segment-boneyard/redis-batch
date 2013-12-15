var assert = require('assert');
var sinon = require('sinon');
var RedisSpy = require('./lib/redis-spy');
var Flushes = require('./lib/flushes');

var RedisBatch = require('../lib');

/**
 * Testing data.
 */

var key1 = 'key1';
var key2 = 'key2';
var value1 = 'value1';
var value2 = 'value2';

/**
 * Test timing management.
 */

var flushAfter = 10;
var flushes = Flushes(flushAfter);


/**
 * set tests
 */

describe('set', function () {
  
  var redis;
  var batch;
  
  beforeEach(function () {
    redis = RedisSpy('set', 'mset');
    batch = new RedisBatch(redis, { flushAfter: flushAfter });
  });

  it('should not flush when no sets are added', function (done) {
    var test = function () {
      assert.equal(redis.set.callCount, 0);
      assert.equal(redis.mset.callCount, 0);
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(2));
    setTimeout(test, flushes(3));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush a single set', function (done) {
    batch.set(key1, value1);
    var test = function () {
      assert.equal(redis.set.callCount, 0);
      assert.equal(redis.mset.callCount, 1);
      assert(redis.mset.calledWith([key1, value1]));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush a single set for one key', function (done) {
    batch
      .set(key1, value1)
      .set(key1, value1)
      .set(key1, value2);
    var test = function () {
      assert.equal(redis.set.callCount, 0);
      assert.equal(redis.mset.callCount, 1);
      assert(redis.mset.calledWith([key1, value2]));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush multiple sets for multiple keys', function (done) {
    batch
      .set(key1, value1)
      .set(key1, value2)
      .set(key2, value2);
    var test = function () {
      assert.equal(redis.mset.callCount, 1);
      assert(redis.mset.calledWith([key1, value2, key2, value2]));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

});