var assert = require('assert');
var sinon = require('sinon');
var RedisBatch = require('../');

describe('Constructor', function () {

  var flushAfter = 10;

  it('should error if not given a redis instance', function () {
    try {
      var batch = new RedisBatch();
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('should instantiate with just a redis', function () {
    try {
      var batch = new RedisBatch({});
      assert(batch);
      assert.equal(batch.options.flushAfter, 5000);
    } catch (err) {
      assert(false);
    }
  });

  it('should override the default flushAfter if provided', function () {
    var batch = new RedisBatch({}, { flushAfter: flushAfter });
    assert(batch.options.flushAfter === flushAfter);
  });

});

