
/**
 * Export the sadd command.
 */

module.exports = sadd;

/**
 * Create a new `sadd` command.
 */
 
function sadd () {
  this.reset();
}
 
/**
 * Reset the batch
 */
 
sadd.prototype.reset  = function () {
 this.batch = {};
};
 
 
/**
 * Add a key to a set.
 *
 * @param {String} set
 * @param {String} key
 */
 
sadd.prototype.sadd = function (key, member) {
  if (!this.batch[key]) this.batch[key] = {};
  this.batch[key][member] = true;
  return this;
};
 
/**
 * Add batched commands to the multi.
 */
 
sadd.prototype.flush = function (redis) {
  var batch = this.batch;
  Object.keys(batch).forEach(function (key) {
    redis.sadd(key, Object.keys(batch[key]));
  });
  this.reset();
  return this;
};
