
/**
 * Export the pexpire command.
 */

module.exports = pexpire;

/**
 * Create a new `pexpire` command.
 */
 
function pexpire () {
  this.reset();
}
 
/**
 * Reset the batch
 */
 
pexpire.prototype.reset  = function () {
 this.batch = {};
};

/**
 * Announce what commands are contained here.
 */

pexpire.prototype.commands = ['pexpire'];
 
/**
 * Add a key to a set.
 *
 * @param {String} set
 * @param {String} key
 */
 
pexpire.prototype.pexpire = function (key, milliseconds) {
  this.batch[key] = milliseconds;
  return this;
};
 
/**
 * Add batched commands to the multi.
 */
 
pexpire.prototype.flush = function (redis) {
  var batch = this.batch;
  Object.keys(batch).forEach(function (key) {
    redis.pexpire(key, batch[key]);
  });
  this.reset();
  return this;
};
