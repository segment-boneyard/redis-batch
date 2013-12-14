var sinon = require('sinon');

module.exports = function (mock) {
  var redisSpy = {};
  redisSpy[mock] = sinon.spy();
  return redisSpy;
};