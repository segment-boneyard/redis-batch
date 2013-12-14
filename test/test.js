var assert = require('assert');
var sinon = require('sinon');

describe('RedisBatch', function () {

  var RedisBatch = require('../');

  var key1 = 'key1';
  var key2 = 'key2';
  var field1 = 'mobile';
  var field2 = 'server';
  var field3 = 'browser';
  var expire = 1000;
  var flushAfter = 10;

  var redisSpy = function () {
    return {
      incrby: sinon.spy(),
      hincrby: sinon.spy(),
      sadd: sinon.spy(),
      pexpire: sinon.spy()
    };
  };

  var flushes = function (flushes) {
    return (flushAfter * flushes + 5);
  };


  /**
   * pexpire tests
   */
  
  describe('pexpire', function () {
    
    var redis;
    var batch;
    
    beforeEach(function () {
      redis = redisSpy();
      batch = new RedisBatch(redis, { flushAfter: flushAfter });
    });

    describe('batching', function () {

      it('should pexpire a single key', function () {
        assert.equal(batch.batch.pexpire[key1], undefined);
        batch.pexpire(key1, expire);
        assert.equal(batch.batch.pexpire[key1], expire);
      });

      it('should pexpire multiple expires to one', function () {
        assert.equal(batch.batch.pexpire[key1], undefined);
        batch.pexpire(key1, expire+100);
        batch.pexpire(key1, expire-100);
        batch.pexpire(key1, expire+123);
        batch.pexpire(key1, expire);
        assert.equal(batch.batch.pexpire[key1], expire);
      });

      it('should pexpire multiple keys', function () {
        assert.equal(batch.batch.pexpire[key1], undefined);
        batch.pexpire(key1, expire)
          .pexpire(key1, expire)
          .pexpire(key1, expire)
          .pexpire(key1, expire)
          .pexpire(key2, expire)
          .pexpire(key2, expire);
        assert.deepEqual(batch.batch.pexpire[key1], expire);
        assert.deepEqual(batch.batch.pexpire[key2], expire);
      });

    });

    describe('flushing', function () {

      it('should not flush when no pexpires are added', function (done) {
        var test = function () {
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

  });

  /**
   * sadd tests
   */
  
  describe('sadd', function () {
    
    var redis;
    var batch;
    
    beforeEach(function () {
      redis = redisSpy();
      batch = new RedisBatch(redis, { flushAfter: flushAfter });
    });

    describe('batching', function () {

      it('should sadd a single member', function () {
        assert.equal(batch.batch.sadd[key1], undefined);
        batch.sadd(key1, field1);
        assert.deepEqual(Object.keys(batch.batch.sadd[key1]), [field1]);
      });

      it('should sadd multiple members to one key', function () {
        assert.equal(batch.batch.sadd[key1], undefined);
        batch.sadd(key1, field1);
        batch.sadd(key1, field1);
        batch.sadd(key1, field3);
        batch.sadd(key1, field2);
        assert.deepEqual(Object.keys(batch.batch.sadd[key1]), [field1, field3, field2]);
      });

      it('should add multiple members to multiple keys', function () {
        assert.equal(batch.batch.sadd[key1], undefined);
        batch.sadd(key1, field1)
          .sadd(key1, field1)
          .sadd(key1, field3)
          .sadd(key1, field2)
          .sadd(key2, field2)
          .sadd(key2, field3);
        assert.deepEqual(Object.keys(batch.batch.sadd[key1]), [field1, field3, field2]);
        assert.deepEqual(Object.keys(batch.batch.sadd[key2]), [field2, field3]);
      });

    });

    describe('flushing', function () {

      it('should not flush when no members are added', function (done) {
        var test = function () {
          assert.equal(redis.sadd.callCount, 0);
        };
        setTimeout(test, flushes(1));
        setTimeout(test, flushes(2));
        setTimeout(test, flushes(3));
        setTimeout(test, flushes(4));
        setTimeout(done, flushes(5));
      });

      it('should flush a single key and member', function (done) {
        batch.sadd(key1, field1);
        var test = function () {
          assert.equal(redis.sadd.callCount, 1);
          assert(redis.sadd.calledWith(key1, [field1]));
        };
        setTimeout(test, flushes(1));
        setTimeout(test, flushes(4));
        setTimeout(done, flushes(5));
      });

      it('should flush a single key with multiple members', function (done) {
        batch.sadd(key1, field1)
          .sadd(key1, field2)
          .sadd(key1, field1)
          .sadd(key1, field3);
        var test = function () {
          assert.equal(redis.sadd.callCount, 1);
          assert(redis.sadd.calledWith(key1, [field1, field2, field3]));
        };
        setTimeout(test, flushes(1));
        setTimeout(test, flushes(4));
        setTimeout(done, flushes(5));
      });

      it('should flush multiple keys', function (done) {
        batch.sadd(key1, field1)
          .sadd(key1, field2)
          .sadd(key1, field1)
          .sadd(key1, field3)
          .sadd(key2, field1);
        var test = function () {
          assert.equal(redis.sadd.callCount, 2);
          assert(redis.sadd.calledWith(key1, [field1, field2, field3]));
          assert(redis.sadd.calledWith(key2, [field1]));
        };
        setTimeout(test, flushes(1));
        setTimeout(test, flushes(4));
        setTimeout(done, flushes(5));
      });

    });

  });

});
