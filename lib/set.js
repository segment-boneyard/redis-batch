
/**
 * Export the set command.
 */

module.exports = set;

/**
 * Create a new `set` command.
 */
 
function set () {
  this.reset();
}
 
/**
 * Reset the batch
 */
 
set.prototype.reset  = function () {
 this.batch = {};
};

/**
 * Announce what commands are contained here.
 */

set.prototype.commands = ['set'];
 
/**
 * Set the key's value.
 *
 * @param {String} key
 * @param {String} value
 */
 
set.prototype.set = function (key, value) {
  this.batch[key] = value;
  return this;
};
 
/**
 * Send each set.
 */
 
set.prototype.flush = function (redis) {
  var batch = this.batch;
  var params = [];
  Object.keys(batch).forEach(function (key) {
    params.push(key);
    params.push(batch[key]);
  });
  if (params.length) redis.mset(params);
  this.reset();
  return this;
};
