var assert = require('assert');
var sinon = require('sinon');
var after = require('after');

describe('RedisIncrementBatch', function () {

  var RedisIncrementBatch = require('../');

  var key1 = 'key1';
  var key2 = 'key2';
  var fields = ['mobile', 'server', 'browser'];
  var flushAfter = 250;

  /**
   * Constructor tests.
   */

  describe('Constructor', function () {

    it('should error if not given a redis instance', function () {
      try {
        var batch = new RedisIncrementBatch();
        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('should instantiate with just a redis', function () {
      var redis = {};
      try {
        var batch = new RedisIncrementBatch(redis);
        assert(batch);
        assert(batch.options.flushAfter === 5000);
      } catch (err) {
        assert(false);
      }
    });

    it('should override the default flushAfter if provided', function () {
      var redis = {};
      var batch = new RedisIncrementBatch(redis, { flushAfter: flushAfter });
      assert(batch.options.flushAfter === flushAfter);
    });

  });

  /**
   * Incrementing tests.
   */
  
  describe('Increment', function () {
    
    var batch;
    
    beforeEach(function () {
      var redis = {};
      redis.hincrby = sinon.spy();
      batch = new RedisIncrementBatch(redis, { flushAfter: flushAfter });
    });

    it('should increment by 1 by default', function () {
      assert(batch.hashtable[key1] === undefined);
      batch.increment(key1, fields[0]);
      assert(batch.hashtable[key1][fields[0]] === 1);
    });

    it('should increment by a positive number if provided', function () {
      assert(batch.hashtable[key1] === undefined);
      batch.increment(key1, fields[2], 1238898);
      assert(batch.hashtable[key1][fields[2]] === 1238898);
    });

    it('should increment by a negative number if provided', function () {
      assert(batch.hashtable[key2] === undefined);
      batch.increment(key2, fields[1], -81726);
      assert(batch.hashtable[key2][fields[1]] === -81726);
    });

    it('should increment by a positive number after a negative number', function () {
      assert(batch.hashtable[key2] === undefined);
      batch.increment(key2, fields[1], -81726);
      assert(batch.hashtable[key2][fields[1]] === -81726);
      batch.increment(key2, fields[1], 81727);
      assert(batch.hashtable[key2][fields[1]] === 1);
    });

  });

  /**
   * Flushing tests.
   */
  
  describe('Flushing', function () {

    var flushes = function (flushes) {
      return (flushAfter * flushes + 20);
    };
    
    var redis;
    var batch;
    
    beforeEach(function () {
      redis = {};
      redis.hincrby = sinon.spy();
      batch = new RedisIncrementBatch(redis, { flushAfter: flushAfter });
    });

    it('should not flush when nothing is incremented', function (done) {
      done = after(4, done);
      var test = function () {
        assert(redis.hincrby.callCount === 0);
        done();
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(2));
      setTimeout(test, flushes(3));
      setTimeout(test, flushes(4));
    });

    it('should flush one key-field', function (done) {
      batch.increment(key1, fields[0]);
      done = after(2, done);
      var test = function () {
        assert(redis.hincrby.callCount === 1);
        assert(redis.hincrby.calledWith(key1, fields[0], 1));
        done();
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
    });

    it('should flush several key-fields', function (done) {
      batch.increment(key1, fields[0]);
      batch.increment(key1, fields[2], 3);
      batch.increment(key1, fields[1], -40);
      done = after(2, done);
      var test = function () {
        assert(redis.hincrby.callCount === 3);
        assert(redis.hincrby.calledWith(key1, fields[0], 1));
        assert(redis.hincrby.calledWith(key1, fields[1], -40));
        assert(redis.hincrby.calledWith(key1, fields[2], 3));
        done();
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
    });

    it('should flush several keys-field', function (done) {
      batch.increment(key1, fields[0]);
      batch.increment(key2, fields[2], 3);
      done = after(2, done);
      var test = function () {
        assert(redis.hincrby.callCount === 2);
        assert(redis.hincrby.calledWith(key1, fields[0], 1));
        assert(redis.hincrby.calledWith(key2, fields[2], 3));
        done();
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
    });

    it('should flush multiple increments of a key-field as one hincrby', function (done) {
      batch.increment(key1, fields[0]);
      batch.increment(key1, fields[0]);
      batch.increment(key1, fields[0]);
      batch.increment(key1, fields[0]);
      batch.increment(key1, fields[0]);
      batch.increment(key1, fields[0]);
      batch.increment(key1, fields[0]);
      batch.increment(key1, fields[0]);
      batch.increment(key1, fields[0]);
      batch.increment(key2, fields[0], 2);
      batch.increment(key2, fields[0], 2);
      batch.increment(key2, fields[0], 2);
      batch.increment(key2, fields[0], 2);
      done = after(2, done);
      var test = function () {
        assert(redis.hincrby.callCount === 2);
        assert(redis.hincrby.calledWith(key1, fields[0], 9));
        assert(redis.hincrby.calledWith(key2, fields[0], 8));
        done();
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
    });

  });

});
