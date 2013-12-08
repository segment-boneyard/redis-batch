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
   * Constructor tests.
   */

  describe('Constructor', function () {

    it('should error if not given a redis instance', function () {
      try {
        var batch = new RedisBatch();
        assert(false);
      } catch (err) {
        assert(err);
      }
    });

    it('should instantiate with just a redis', function () {
      try {
        var redis = redisSpy();
        var batch = new RedisBatch(redis);
        assert(batch);
        assert.equal(batch.options.flushAfter, 5000);
      } catch (err) {
        assert(false);
      }
    });

    it('should override the default flushAfter if provided', function () {
      var redis = redisSpy();
      var batch = new RedisBatch(redis, { flushAfter: flushAfter });
      assert(batch.options.flushAfter === flushAfter);
    });

  });

  /**
   * incrby tests
   */
  
  describe('incrby', function () {
    
    var redis;
    var batch;
    
    beforeEach(function () {
      redis = redisSpy();
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

  /**
   * hincrby tests
   */
  
  describe('hincrby', function () {
    
    var redis;
    var batch;
    
    beforeEach(function () {
      redis = redisSpy();
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
