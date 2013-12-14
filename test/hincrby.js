var assert = require('assert');
var sinon = require('sinon');
var RedisSpy = require('./lib/redis-spy');
var Flushes = require('./lib/flushes');

var RedisBatch = require('../');

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
    redis = RedisSpy('hincrby');
    batch = new RedisBatch(redis, { flushAfter: flushAfter });
  });

  describe('batching', function () {

    it('should hincrby 1 by default', function () {
      assert(batch.batch.hincrby[key1] === undefined);
      batch.hincrby(key1, field1);
      assert(batch.batch.hincrby[key1][field1] === 1);
    });

    it('should hincrby a positive number if provided', function () {
      assert(batch.batch.hincrby[key1] === undefined);
      batch.hincrby(key1, field3, 1238898);
      assert(batch.batch.hincrby[key1][field3] === 1238898);
    });

    it('should hincrby a negative number if provided', function () {
      assert(batch.batch.hincrby[key2] === undefined);
      batch.hincrby(key2, field2, -81726);
      assert(batch.batch.hincrby[key2][field2] === -81726);
    });

    it('should hincrby a positive number after a negative number', function () {
      assert(batch.batch.hincrby[key2] === undefined);
      batch.hincrby(key2, field2, -81726);
      assert(batch.batch.hincrby[key2][field2] === -81726);
      batch.hincrby(key2, field2, 81727);
      assert(batch.batch.hincrby[key2][field2] === 1);
    });

  });

  describe('flushing', function () {

    it('should not flush when nothing is incremented', function (done) {
      var test = function () {
        assert(redis.hincrby.callCount === 0);
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(2));
      setTimeout(test, flushes(3));
      setTimeout(test, flushes(4));
      setTimeout(done, flushes(5));
    });

    it('should flush one key-field', function (done) {
      batch.hincrby(key1, field1);
      var test = function () {
        assert(redis.hincrby.callCount === 1);
        assert(redis.hincrby.calledWith(key1, field1, 1));
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
      setTimeout(done, flushes(5));
    });

    it('should flush several key-fields', function (done) {
      batch.hincrby(key1, field1);
      batch.hincrby(key1, field3, 3);
      batch.hincrby(key1, field2, -40);
      var test = function () {
        assert(redis.hincrby.callCount === 3);
        assert(redis.hincrby.calledWith(key1, field1, 1));
        assert(redis.hincrby.calledWith(key1, field2, -40));
        assert(redis.hincrby.calledWith(key1, field3, 3));
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
      setTimeout(done, flushes(5));
    });

    it('should flush several keys-field', function (done) {
      batch.hincrby(key1, field1);
      batch.hincrby(key2, field3, 3);
      var test = function () {
        assert(redis.hincrby.callCount === 2);
        assert(redis.hincrby.calledWith(key1, field1, 1));
        assert(redis.hincrby.calledWith(key2, field3, 3));
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
      setTimeout(done, flushes(5));
    });

    it('should flush multiple hincrby of a key-field as one hincrby', function (done) {
      batch.hincrby(key1, field1)
        .hincrby(key1, field1)
        .hincrby(key1, field1)
        .hincrby(key1, field1)
        .hincrby(key1, field1)
        .hincrby(key1, field1)
        .hincrby(key1, field1)
        .hincrby(key1, field1)
        .hincrby(key1, field1)
        .hincrby(key2, field1, 2)
        .hincrby(key2, field1, 2)
        .hincrby(key2, field1, 2)
        .hincrby(key2, field1, 3);
      var test = function () {
        assert(redis.hincrby.callCount === 2);
        assert(redis.hincrby.calledWith(key1, field1, 9));
        assert(redis.hincrby.calledWith(key2, field1, 9));
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
      setTimeout(done, flushes(5));
    });

  });

});