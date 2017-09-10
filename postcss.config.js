module.exports = {
  plugins: [
    require('autoprefixer')({
      remove: false,
      browsers: ['>1%', 'last 3 versions', 'last 3 iOS versions']
    })
  ]
};
