
var _ = require('underscore');

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
 * @param {Number} flushAfter
 */

function RedisIncrementBatch (redis, flushAfter) {
  if (!(this instanceof RedisIncrementBatch)) return new RedisIncrementBatch(redis, flushAfter);
  if (!redis) throw new Error('RedisIncrementBatch requires a redis instance.');
  this.redis = redis;
  this.flushAfter = flushAfter || 5000; // default to 5 seconds
  this.hashtable = {};

  var self = this;
  this.interval = setInterval(function () {
    self.flush();
  }, this.flushAfter);
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
  _.each(_.keys(self.hashtable), function (key) {
    _.each(_.keys(self.hashtable[key]), function (field) {
      redis.hincrby(key, field, self.hashtable[key][field]);
      delete self.hashtable[key][field];
    });
    delete self.hashtable[key];
  });
};
