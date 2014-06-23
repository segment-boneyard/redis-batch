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
 * incr tests
 */

describe('incr', function () {
  
  var redis;
  var batch;
  
  beforeEach(function () {
    redis = RedisSpy('incr', 'incrby', 'decr', 'decrby');
    batch = new RedisBatch(redis, { flushAfter: flushAfter });
  });


  it('should not flush when nothing is incremented', function (done) {
    var test = function () {
      assert.equal(redis.incr.callCount, 0);
      assert.equal(redis.incrby.callCount, 0);
      assert.equal(redis.decr.callCount, 0);
      assert.equal(redis.decrby.callCount, 0);
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(2));
    setTimeout(test, flushes(3));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush one incr key', function (done) {
    batch.incr(key1);
    var test = function () {
      assert.equal(redis.incrby.callCount, 1);
      assert(redis.incrby.calledWith(key1, 1));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush one incrby key', function (done) {
    batch.incrby(key1, 7);
    var test = function () {
      assert.equal(redis.incrby.callCount, 1);
      assert(redis.incrby.calledWith(key1, 7));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush one decr key', function (done) {
    batch.decr(key1);
    var test = function () {
      assert.equal(redis.incrby.callCount, 1);
      assert(redis.incrby.calledWith(key1, -1));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush one decrby key', function (done) {
    batch.decrby(key1, 10);
    var test = function () {
      assert.equal(redis.incrby.callCount, 1);
      assert(redis.incrby.calledWith(key1, -10));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush several keys', function (done) {
    batch.incrby(key1);
    batch.incrby(key2, -40);
    var test = function () {
      assert.equal(redis.incrby.callCount, 2);
      assert(redis.incrby.calledWith(key1, 1));
      assert(redis.incrby.calledWith(key2, -40));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush multiple increments of a key-field as one incrby', function (done) {
    batch.incr(key1)
      .incr(key1)
      .incr(key1)
      .decr(key1)
      .incrby(key1, 2)
      .incrby(key1, 8)
      .incrby(key1, 3)
      .incrby(key1, 8)
      .decrby(key1, 3)
      .incrby(key2, 2)
      .incrby(key2, 2)
      .incrby(key2, 2)
      .incrby(key2, 3);
    var test = function () {
      assert.equal(redis.incrby.callCount, 2);
      assert(redis.incrby.calledWith(key1, 20));
      assert(redis.incrby.calledWith(key2, 9));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

});
