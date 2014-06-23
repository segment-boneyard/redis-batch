var assert = require('assert');
var RedisSpy = require('./lib/redis-spy');
var Flushes = require('./lib/flushes');

var RedisBatch = require('../lib');

/**
 * Testing data.
 */

var key1 = 'key1';
var key2 = 'key2';
var field1 = 'mobile';
var field2 = 'server';
var field3 = 'browser';

/**
 * Test timing management.
 */

var flushAfter = 10;
var flushes = Flushes(flushAfter);

/**
 * hincrby tests
 */

describe('hincrby', function () {
  
  var redis;
  var batch;
  
  beforeEach(function () {
    redis = RedisSpy('hincr', 'hincrby');
    batch = new RedisBatch(redis, { flushAfter: flushAfter });
  });

  it('should not flush when nothing is incremented', function (done) {
    var test = function () {
      assert.equal(redis.hincrby.callCount, 0);
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(2));
    setTimeout(test, flushes(3));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush one key-field with hincr', function (done) {
    batch.hincr(key1, field1);
    var test = function () {
      assert.equal(redis.hincrby.callCount, 1);
      assert(redis.hincrby.calledWith(key1, field1, 1));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush one key-field with hincrby', function (done) {
    batch.hincrby(key1, field1, 3);
    var test = function () {
      assert.equal(redis.hincrby.callCount, 1);
      assert(redis.hincrby.calledWith(key1, field1, 3));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush several key-fields', function (done) {
    batch.hincrby(key1, field1, 1);
    batch.hincrby(key1, field3, 3);
    batch.hincrby(key1, field2, -40);
    var test = function () {
      assert.equal(redis.hincrby.callCount, 3);
      assert(redis.hincrby.calledWith(key1, field1, 1));
      assert(redis.hincrby.calledWith(key1, field2, -40));
      assert(redis.hincrby.calledWith(key1, field3, 3));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush several keys-field', function (done) {
    batch.hincrby(key1, field1, 1);
    batch.hincrby(key2, field3, 3);
    var test = function () {
      assert.equal(redis.hincrby.callCount, 2);
      assert(redis.hincrby.calledWith(key1, field1, 1));
      assert(redis.hincrby.calledWith(key2, field3, 3));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush multiple hincrby of a key-field as one hincrby', function (done) {
    batch.hincr(key1, field1)
      .hincr(key1, field1)
      .hincr(key1, field1)
      .hincr(key1, field1)
      .hincr(key1, field1)
      .hincrby(key1, field1, 1)
      .hincrby(key1, field1, 12)
      .hincrby(key1, field1, 7)
      .hincrby(key1, field1, -2)
      .hincrby(key2, field1, 2)
      .hincrby(key2, field1, 2)
      .hincrby(key2, field1, 2)
      .hincrby(key2, field1, 3);
    var test = function () {
      assert.equal(redis.hincrby.callCount, 2);
      assert(redis.hincrby.calledWith(key1, field1, 23));
      assert(redis.hincrby.calledWith(key2, field1, 9));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

});
