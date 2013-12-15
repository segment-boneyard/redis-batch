
/**
 * Export the hincr command.
 */

module.exports = hincr;

/**
 * Create a new `hincr` command.
 */
 
function hincr () {
  this.reset();
}
 
/**
 * Reset the batch
 */
 
hincr.prototype.reset  = function () {
 this.batch = {};
};
 
/**
 * Announce what commands are contained here.
 */

hincr.prototype.commands = ['hincr', 'hincrby'];

/**
 * Increment a hash key by one.
 *
 * @param {String} key
 */

hincr.prototype.hincr = function (key, field) {
  return this.hincrby(key, field, 1);
};

/**
 * Increment a hash key.
 *
 * @param {String} key
 * @param {Number} increment
 */

hincr.prototype.hincrby = function (key, field, increment) {
  if (this.batch[key] === undefined) this.batch[key] = {};
  if (this.batch[key][field] === undefined) this.batch[key][field] = 0;
  if (increment === undefined) increment = 1;
  this.batch[key][field] += increment;
  return this;
};

/**
 * Flush all the incrby commands.
 */

hincr.prototype.flush = function (redis) {
  var batch = this.batch;
  Object.keys(batch).forEach(function (key) {
    Object.keys(batch[key]).forEach(function (field) {
      redis.hincrby(key, field, batch[key][field]);
    });
  });
  this.reset();
  return this;
};
