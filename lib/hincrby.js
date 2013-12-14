

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