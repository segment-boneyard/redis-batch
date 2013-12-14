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

/**
 * Test timing management.
 */

var flushAfter = 10;
var flushes = Flushes(flushAfter);

/**
 * incrby tests
 */

describe('incrby', function () {
  
  var redis;
  var batch;
  
  beforeEach(function () {
    redis = RedisSpy('incrby');
    batch = new RedisBatch(redis, { flushAfter: flushAfter });
  });

  describe('batching', function () {

    it('should incrby 1 by default', function () {
      assert.equal(batch.batch.incrby[key1], undefined);
      batch.incrby(key1);
      assert.equal(batch.batch.incrby[key1], 1);
    });

    it('should incrby a positive number if provided', function () {
      assert.equal(batch.batch.incrby[key1], undefined);
      batch.incrby(key1, 1238898);
      assert.equal(batch.batch.incrby[key1], 1238898);
    });

    it('should incrby a negative number if provided', function () {
      assert.equal(batch.batch.incrby[key2], undefined);
      batch.incrby(key2, -81726);
      assert.equal(batch.batch.incrby[key2], -81726);
    });

    it('should incrby a positive number after a negative number', function () {
      assert.equal(batch.batch.incrby[key2], undefined);
      batch.incrby(key2, -81726);
      assert.equal(batch.batch.incrby[key2], -81726);
      batch.incrby(key2, 81727);
      assert.equal(batch.batch.incrby[key2], 1);
    });

  });

  describe('flushing', function () {

    it('should not flush when nothing is incremented', function (done) {
      var test = function () {
        assert.equal(redis.incrby.callCount, 0);
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(2));
      setTimeout(test, flushes(3));
      setTimeout(test, flushes(4));
      setTimeout(done, flushes(5));
    });

    it('should flush one key', function (done) {
      batch.incrby(key1);
      var test = function () {
        assert.equal(redis.incrby.callCount, 1);
        assert(redis.incrby.calledWith(key1, 1));
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
      batch.incrby(key1)
        .incrby(key1)
        .incrby(key1)
        .incrby(key1)
        .incrby(key1)
        .incrby(key1)
        .incrby(key1)
        .incrby(key1)
        .incrby(key1)
        .incrby(key2, 2)
        .incrby(key2, 2)
        .incrby(key2, 2)
        .incrby(key2, 3);
      var test = function () {
        assert.equal(redis.incrby.callCount, 2);
        assert(redis.incrby.calledWith(key1, 9));
        assert(redis.incrby.calledWith(key2, 9));
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
      setTimeout(done, flushes(5));
    });

  });

});
