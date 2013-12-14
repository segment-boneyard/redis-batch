
var defaults = require('defaults');

/**
 * Require all the commands we'll be attaching.
 */

var incr = require('./incr');
var pexpire = require('./pexpire');
var sadd = require('./sadd');

/**
 * Expose `RedisBatch`.
 */

module.exports = RedisBatch;

/**
 * Initialize a new Redis Batch instance.
 *
 * Takes a redis instance and options to control the flush interval.
 *
 * @param {Redis} redis
 * @param {Object} options
 *   @param {Number} flushAfter
 */

function RedisBatch (redis, options) {
  if (!(this instanceof RedisBatch)) return new RedisBatch(redis, options);
  if (!redis) throw new Error('RedisBatch requires a redis instance.');
  this.redis = redis;
  this.options = defaults(options, {
    flushAfter : 5000
  });

  this.commands = [];
  this
    .use(incr)
    .use(pexpire)
    .use(sadd);

  var self = this;
  this.interval = setInterval(function () {
    self.flush();
  }, this.options.flushAfter);
}

/**
 * Use the redis command.
 *
 * @param {Constructor} command
 */

RedisBatch.prototype.use = function (command) {
  var cmd = new command();
  this.commands.push(cmd);
  var self = this;
  cmd.commands.forEach(function (name) {
    self[name] = cmd[name].bind(cmd);
  });
  return this;
};

/**
 * Flushes the redis batch.
 */
 
RedisBatch.prototype.flush = function () {
  var redis = this.redis;
  this.commands.forEach(function (command) {
    command.flush(redis);
  });
  return this;
};

