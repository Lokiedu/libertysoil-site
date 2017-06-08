module.exports = function (source) {
  return source.replace(
    /(@import.*((\'.*\')|(\".*\"));)/g,
    (src, statement, path) => {
      return '/*KIT BEGIN '.concat(path).concat(' */')
        .concat(statement)
        .concat('/*KIT END ').concat(path).concat(' */');
    }
  );
};
