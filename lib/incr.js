
/**
 * Export the incr command.
 */

module.exports = incr;

/**
 * Create a new `incr` command.
 */
 
function incr () {
  this.reset();
}
 
/**
 * Reset the batch
 */
 
incr.prototype.reset  = function () {
 this.batch = {};
};
 
/**
 * Announce what commands are contained here.
 */

incr.prototype.commands = ['incr', 'incrby', 'decr', 'decrby'];

/**
 * Increment a key by one.
 *
 * @param {String} key
 */

incr.prototype.incr = function (key) {
  return this.incrby(key, 1);
};

/**
 * Increment a key.
 *
 * @param {String} key
 * @param {Number} increment
 */

incr.prototype.incrby = function (key, increment) {
  if (this.batch[key] === undefined) this.batch[key] = 0;
  if (increment === undefined) increment = 1;
  this.batch[key] += increment;
  return this;
};

/**
 * Decrement a key by one.
 *
 * @param {String} key
 */

incr.prototype.decr = function (key) {
  return this.incrby(key, -1);
};

/**
 * Decrement a key by one.
 *
 * @param {String} key
 * @param {Number} decrement
 */

incr.prototype.decrby = function (key, decrement) {
  if (decrement === undefined) decrement = 1;
  return this.incrby(key, -1*decrement);
};

/**
 * Flush all the incrby commands.
 */

incr.prototype.flush = function (redis) {
  var batch = this.batch;
  Object.keys(batch).forEach(function (key) {
    redis.incrby(key, batch[key]);
  });
  this.reset();
  return this;
};