
var defaults = require('defaults');

/**
 * Require all the commands we'll be attaching.
 */

var hincr = require('./hincr');
var incr = require('./incr');
var persist = require('./persist');
var pexpire = require('./pexpire');
var sadd = require('./sadd');
var set = require('./set');

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

  this.inherit(redis);

  this
    .use(hincr)
    .use(incr)
    .use(persist)
    .use(pexpire)
    .use(sadd)
    .use(set);

  var self = this;
  this.interval = setInterval(function () {
    self.flush();
  }, this.options.flushAfter);
}

/**
 * Inherit prototype of `obj`.
 *
 * @param {Object} obj
 * @api private
 */

RedisBatch.prototype.inherit = function(obj){
  var self = this;
  Object.keys(obj.__proto__).forEach(function(key){
    self[key] = obj[key].bind(obj);
  });
};

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

