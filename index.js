
var defaults = require('defaults');

/**
 * Expose `RedisIncrementBatch`.
 */

module.exports = RedisIncrementBatch;

/**
 * Initialize a new Redis Incr instance.
 *
 * Takes a redis instance and a flush after interval.
 *
 * @param {Redis} redis
 * @param {Object} options
 *  @param {Number} flushAfter
 */

function RedisIncrementBatch (redis, options) {
  if (!(this instanceof RedisIncrementBatch)) return new RedisIncrementBatch(redis, options);
  if (!redis) throw new Error('RedisIncrementBatch requires a redis instance.');
  this.redis = redis;
  this.options = defaults(options, {
    flushAfter : 5000
  });
  this.hashtable = {};

  var self = this;
  this.interval = setInterval(function () {
    self.flush();
  }, this.options.flushAfter);
}

/**
 * Increment a key.
 *
 * @param {String} hash key
 * @param {String} field
 * @param {Number} increment
 */

RedisIncrementBatch.prototype.increment = function (key, field, increment) {
  if (this.hashtable[key] === undefined)
    this.hashtable[key] = {};
  if (this.hashtable[key][field] === undefined)
    this.hashtable[key][field] = 0;

  if (increment === undefined)
    increment = 1;

  this.hashtable[key][field] += increment;
};

/**
 * Flush everything in the hashtable to Redis.
 */

RedisIncrementBatch.prototype.flush = function () {
  var self = this;
  var redis = self.redis;
  Object.keys(self.hashtable).forEach(function (key) {
    Object.keys(self.hashtable[key]).forEach(function (field) {
      redis.hincrby(key, field, self.hashtable[key][field]);
    });
  });
  this.hashtable = {};
};
