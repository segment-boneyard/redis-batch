var assert = require('assert');
var sinon = require('sinon');
var _ = require('underscore');

describe('RedisIncr', function () {

  var RedisIncr = require('../');

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
        var redisIncr = new RedisIncr();
        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('should instantiate with just a redis', function () {
      var redis = {};
      try {
        var redisIncr = new RedisIncr(redis);
        assert(redisIncr);
      } catch (err) {
        assert(false);
      }
    });

    it('should override the default flushAfter if provided', function () {
      var redis = {};
      var redisIncr = new RedisIncr(redis, flushAfter);
      assert(redisIncr.flushAfter === flushAfter);
    });

  });

  /**
   * Incrementing tests.
   */
  
  describe('Increment', function () {
    
    var redisIncr;
    
    beforeEach(function () {
      var redis = {};
      redis.hincrby = sinon.spy();
      redisIncr = new RedisIncr(redis, flushAfter);
    });

    it('should increment by 1 by default', function () {

    });

    it('should increment by a positive number if provided', function () {

    });

    it('should increment by a negative number if provided', function () {

    });

    it('should increment by a positive number after a negative number', function () {

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
    var redisIncr;
    
    beforeEach(function () {
      redis = {};
      redis.hincrby = sinon.spy();
      redisIncr = new RedisIncr(redis, flushAfter);
    });

    it('should not flush when nothing is incremented', function (done) {
      done = _.after(4, done);
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
      redisIncr.increment(key1, fields[0]);
      done = _.after(2, done);
      var test = function () {
        assert(redis.hincrby.callCount === 1);
        assert(redis.hincrby.calledWith(key1, fields[0], 1));
        done();
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
    });

    it('should flush several key-fields', function (done) {
      redisIncr.increment(key1, fields[0]);
      redisIncr.increment(key1, fields[2], 3);
      redisIncr.increment(key1, fields[1], -40);
      done = _.after(2, done);
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
      redisIncr.increment(key1, fields[0]);
      redisIncr.increment(key2, fields[2], 3);
      done = _.after(2, done);
      var test = function () {
        assert(redis.hincrby.callCount === 2);
        assert(redis.hincrby.calledWith(key1, fields[0], 1));
        assert(redis.hincrby.calledWith(key2, fields[2], 3));
        done();
      };
      setTimeout(test, flushes(1));
      setTimeout(test, flushes(4));
    });

  });

});
