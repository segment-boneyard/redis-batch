var sinon = require('sinon');

module.exports = function () {
  var redisSpy = {};
  for (var i = 0; i < arguments.length; i++){
    var mock = arguments[i];
    redisSpy[mock] = sinon.spy();
  }
  return redisSpy;
};