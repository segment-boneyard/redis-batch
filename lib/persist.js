
/**
 * Export the persist command.
 */

module.exports = persist;

/**
 * Create a new `persist` command.
 */
 
function persist () {
  this.reset();
}
 
/**
 * Reset the batch
 */
 
persist.prototype.reset  = function () {
 this.batch = {};
};

/**
 * Announce what commands are contained here.
 */

persist.prototype.commands = ['persist'];
 
/**
 * Make this key persistent.
 *
 * @param {String} key
 */
 
persist.prototype.persist = function (key) {
  this.batch[key] = true;
  return this;
};
 
/**
 * Send each persist.
 */
 
persist.prototype.flush = function (redis) {
  var batch = this.batch;
  Object.keys(batch).forEach(function (key) {
    redis.persist(key);
  });
  this.reset();
  return this;
};
