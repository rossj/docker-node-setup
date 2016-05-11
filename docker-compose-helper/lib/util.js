'use strict';

module.exports.flattenUniq = function (arr2d) {
  function onlyUnique (value, index, self) {
    return self.indexOf(value) === index;
  }

  const flat = [].concat.apply([], arr2d);
  const uniq = flat.filter(onlyUnique);
  return uniq;
};
