var assert = require('assert');
var RedisSpy = require('./lib/redis-spy');
var Flushes = require('./lib/flushes');

var RedisBatch = require('../lib');

/**
 * Testing data.
 */

var key1 = 'key1';
var key2 = 'key2';
var expire = 1000;

/**
 * Test timing management.
 */

var flushAfter = 10;
var flushes = Flushes(flushAfter);


/**
 * pexpire tests
 */

describe('pexpire', function () {
  
  var redis;
  var batch;
  
  beforeEach(function () {
    redis = RedisSpy('pexpire', 'expire');
    batch = new RedisBatch(redis, { flushAfter: flushAfter });
  });

  it('should not flush when no pexpires are added', function (done) {
    var test = function () {
      assert.equal(redis.expire.callCount, 0);
      assert.equal(redis.pexpire.callCount, 0);
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(2));
    setTimeout(test, flushes(3));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush a single pexpire', function (done) {
    batch.pexpire(key1, expire);
    var test = function () {
      assert.equal(redis.pexpire.callCount, 1);
      assert(redis.pexpire.calledWith(key1, expire));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush a single expire for one key', function (done) {
    batch.expire(key1, expire*9)
      .pexpire(key1, expire*3)
      .expire(key1, expire*2)
      .expire(key1, expire/1000);
    var test = function () {
      assert.equal(redis.expire.callCount, 0);
      assert.equal(redis.pexpire.callCount, 1);
      assert(redis.pexpire.calledWith(key1, expire));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush a single pexpire for one key', function (done) {
    batch.pexpire(key1, expire)
      .pexpire(key1, expire)
      .pexpire(key1, expire)
      .pexpire(key1, expire);
    var test = function () {
      assert.equal(redis.pexpire.callCount, 1);
      assert(redis.pexpire.calledWith(key1, expire));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

  it('should flush multiple pexpires for multiple keys', function (done) {
    batch.pexpire(key1, expire)
      .pexpire(key1, expire)
      .pexpire(key1, expire)
      .pexpire(key1, expire)
      .pexpire(key2, expire);
    var test = function () {
      assert.equal(redis.pexpire.callCount, 2);
      assert(redis.pexpire.calledWith(key1, expire));
      assert(redis.pexpire.calledWith(key2, expire));
    };
    setTimeout(test, flushes(1));
    setTimeout(test, flushes(4));
    setTimeout(done, flushes(5));
  });

});
