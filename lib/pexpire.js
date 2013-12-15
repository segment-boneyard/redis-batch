
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

pexpire.prototype.commands = ['pexpire', 'expire'];
 
/**
 * Set the key's expire time in milliseconds.
 *
 * @param {String} key
 * @param {String} milliseconds
 */
 
pexpire.prototype.pexpire = function (key, milliseconds) {
  this.batch[key] = milliseconds;
  return this;
};

/**
 * Set the key's expire time in seconds.
 *
 * @param {String} key
 * @param {String} seconds
 */
 
pexpire.prototype.expire = function (key, seconds) {
  return this.pexpire(key, seconds * 1000);
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
