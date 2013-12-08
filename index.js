
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
  this.sadd = {};
  this.incrby = {};
  this.hincrby = {};

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

RedisBatch.prototype.sadd = function (set, key) {
  if (this.sadd[set] === undefined) this.sadd[set] = {};
  this.sadd[set][key] = true;
};

/**
 * Flush all the sadd commands.
 */

RedisBatch.prototype.saddFlush = function () {
  var self = this;
  var redis = self.redis;
  Object.keys(self.sadd).forEach(function (set) {
    redis.sadd(set, Object.keys(self.sadd[set]));
  });
  this.sadd = {};
};

/**
 * Increment a key.
 *
 * @param {String} key
 * @param {Number} increment
 */

RedisBatch.prototype.incrby = function (key, increment) {
  if (this.incrby[key] === undefined) this.incrby[key] = {};
  if (increment === undefined) increment = 1;
  this.incrby[key] += increment;
};

/**
 * Flush all the incrby commands.
 */

RedisBatch.prototype.incrbyFlush = function () {
  var self = this;
  var redis = self.redis;
  Object.keys(self.incrby).forEach(function (key) {
    redis.incrby(key, self.incrby[key]);
  });
  this.incrby = {};
};

/**
 * Increment a hash key.
 *
 * @param {String} hash key
 * @param {String} field
 * @param {Number} increment
 */

RedisBatch.prototype.hincrby = function (key, field, increment) {
  if (this.hincrby[key] === undefined) this.hincrby[key] = {};
  if (this.hincrby[key][field] === undefined) this.hincrby[key][field] = 0;
  if (increment === undefined) increment = 1;
  this.hincrby[key][field] += increment;
};

/**
 * Flush all the hincrby commands.
 */

RedisBatch.prototype.hincrbyFlush = function () {
  var self = this;
  var redis = self.redis;
  Object.keys(self.hincrby).forEach(function (key) {
    Object.keys(self.hincrby[key]).forEach(function (field) {
      redis.hincrby(key, field, self.hincrby[key][field]);
    });
  });
  this.hincrby = {};
};

/**
 * Flush everything in the hashtable to Redis.
 */

RedisBatch.prototype.flush = function () {
  this.saddFlush();
  this.incrbyFlush();
  this.hincrbyFlush();
};
