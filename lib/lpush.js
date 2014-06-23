
/**
 * Export the lpush command.
 */

module.exports = lpush;

/**
 * Create a new `lpush` command.
 */
 
function lpush () {
  this.reset();
}
 
/**
 * Reset the batch
 */
 
lpush.prototype.reset  = function () {
  this.batch = {};
};
 
/**
 * Announce what commands are contained here.
 */

lpush.prototype.commands = ['lpush'];

/**
 * Insert values at the head of the list stored at key.
 *
 * @param {String} key
 * @param {String, ..} values
 * @para
 */

lpush.prototype.lpush = function (key, value) {
  for (var i = 1; i < arguments.length; i++) {
    this.batch[key] = this.batch[key] || [];
    this.batch[key].push(arguments[i]);
  }
  return this;
};

/**
 * Flush all the lpushby commands.
 */

lpush.prototype.flush = function (redis) {
  var batch = this.batch;
  Object.keys(batch).forEach(function (key) {
    redis.lpush([key].concat(batch[key]));
  });
  this.reset();
  return this;
};
