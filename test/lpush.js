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
 * lpush tests
 */

describe('lpush', function () {
  
  var redis;
  var batch;
  
  beforeEach(function () {
    redis = RedisSpy('lpush');
    batch = new RedisBatch(redis, { flushAfter: flushAfter });
  });


  it('should not flush when nothing is pushed', function (done) {
    var test = function () {
      assert.equal(redis.lpush.callCount, 0);
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(2));
    setTimeout(test, flushes(3));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush one list', function (done) {
    batch.lpush(key1, 'value1', 'value1');
    var test = function () {
      assert.equal(redis.lpush.callCount, 1);
      assert(redis.lpush.calledWith([key1, 'value1', 'value1']));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush several lists', function (done) {
    batch.lpush(key1, 'value1', 'value1');
    batch.lpush(key2, 'value2', 'value2');
    var test = function () {
      assert.equal(redis.lpush.callCount, 2);
      assert(redis.lpush.calledWith([key1, 'value1', 'value1']));
      assert(redis.lpush.calledWith([key2, 'value2', 'value2']));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush multiple pushes to a list as one lpush', function (done) {
    batch.lpush(key1, '1')
      .lpush(key1, '2')
      .lpush(key2, '3')
      .lpush(key2, '4', '5')
    var test = function () {
      assert.equal(redis.lpush.callCount, 2);
      assert(redis.lpush.calledWith([key1, '1', '2']));
      assert(redis.lpush.calledWith([key2, '3', '4', '5']));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

});
