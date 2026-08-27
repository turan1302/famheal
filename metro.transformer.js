const transformer = require('@react-native/metro-babel-transformer');

module.exports.transform = function transform(params) {
  const { filename, src, options } = params;
  if (filename.endsWith('.txt')) {
    return transformer.transform({
      src: `module.exports = ${JSON.stringify(src)};`,
      filename: `${filename}.js`,
      options,
    });
  }
  return transformer.transform(params);
};
