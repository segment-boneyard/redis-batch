
var defaults = require('defaults');

/**
 * Expose `RedisBatch`.
 */

module.exports = RedisBatch;

/**
 * Initialize a new Redis Batch instance.
 *
 * Takes a redis instance and options to control the flust interval.
 *
 * @param {Redis} redis
 * @param {Object} options
 *   @param {Number} flushAfter
 */

function RedisBatch (redis, options) {
  if (!(this instanceof RedisBatch)) return new RedisBatch(redis, options);
  if (!redis) throw new Error('RedisBatch requires a redis instance.');
  this.redis = redis;
  this.options = defaults(options, {
    flushAfter : 5000
  });
  this.batch = {};
  this.batch.sadd = {};
  this.batch.incrby = {};
  this.batch.hincrby = {};

  var self = this;
  this.interval = setInterval(function () {
    self.flush();
  }, this.options.flushAfter);
}

/**
 * Add a key to a set.
 *
 * @param {String} set
 * @param {String} key
 */

RedisBatch.prototype.sadd = function (key, member) {
  if (this.batch.sadd[key] === undefined) this.batch.sadd[key] = {};
  this.batch.sadd[key][member] = true;
  return this;
};

/**
 * Flush all the sadd commands.
 */

RedisBatch.prototype.saddFlush = function () {
  var redis = this.redis;
  var batch = this.batch.sadd;
  Object.keys(batch).forEach(function (key) {
    redis.sadd(key, Object.keys(batch[key]));
  });
  this.batch.sadd = {};
};

/**
 * Increment a key.
 *
 * @param {String} key
 * @param {Number} increment
 */

RedisBatch.prototype.incrby = function (key, increment) {
  if (this.batch.incrby[key] === undefined) this.batch.incrby[key] = 0;
  if (increment === undefined) increment = 1;
  this.batch.incrby[key] += increment;
  return this;
};

/**
 * Flush all the incrby commands.
 */

RedisBatch.prototype.incrbyFlush = function () {
  var batch = this.batch.incrby;
  var redis = this.redis;
  Object.keys(batch).forEach(function (key) {
    redis.incrby(key, batch[key]);
  });
  this.batch.incrby = {};
};

/**
 * Increment a hash key.
 *
 * @param {String} hash key
 * @param {String} field
 * @param {Number} increment
 */

RedisBatch.prototype.hincrby = function (key, field, increment) {
  if (this.batch.hincrby[key] === undefined) this.batch.hincrby[key] = {};
  if (this.batch.hincrby[key][field] === undefined) this.batch.hincrby[key][field] = 0;
  if (increment === undefined) increment = 1;
  this.batch.hincrby[key][field] += increment;
  return this;
};

/**
 * Flush all the hincrby commands.
 */

RedisBatch.prototype.hincrbyFlush = function () {
  var batch = this.batch.hincrby;
  var redis = this.redis;
  Object.keys(batch).forEach(function (key) {
    Object.keys(batch[key]).forEach(function (field) {
      redis.hincrby(key, field, batch[key][field]);
    });
  });
  this.batch.hincrby = {};
};

/**
 * Flush everything in the hashtable to Redis.
 */

RedisBatch.prototype.flush = function () {
  this.saddFlush();
  this.incrbyFlush();
  this.hincrbyFlush();
};
