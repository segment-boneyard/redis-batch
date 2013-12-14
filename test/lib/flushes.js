
module.exports = function (flushAfter) {
  return function (flushes) {
    return (flushAfter * flushes + 5);
  };
};