var redis = require('redis');
var _ = require('underscore');

/**
 * Expose `RedisIncr`.
 */

module.exports = RedisIncr;

/**
 * Initialize a new Redis Incr instance.
 *
 * Takes a redis instance and a flush after interval.
 *
 * @param {Redis} redis
 * @param {Number} flushAfter
 */

function RedisIncr (redis, flushAfter) {
  if (!(this instanceof RedisIncr)) return new RedisIncr(redis, flushAfter);
  if (!redis) throw new Error('RedisIncr requires a redis instance.');
  this.redis = redis;
  this.flushAfter = flushAfter || 5000; // default to 5 seconds
  this.hashtable = {};
}

/**
 * Increment a key.
 *
 * @param {String} hash key
 * @param {String} field
 * @param {Number} increment
 */

RedisIncr.prototype.incr = function (key, field, increment) {
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

RedisIncr.prototype.flush = function () {
  var redis = this.redis;
  _.each(_.keys(this.hashtable), function (key) {
    _.each(_.keys(this.hashtable[key]), function (field) {
      redis.hincrby(key, field, this.hashtable[key][field]);
      this.hashtable[key][field] = 0;
    });
  });
};
