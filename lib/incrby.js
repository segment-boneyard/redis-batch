

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