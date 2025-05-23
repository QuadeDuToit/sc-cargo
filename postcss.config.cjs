module.exports = {
  plugins: [
    require('postcss-preset-env')({
      stage: 1, // enables modern CSS features
      features: {
        'nesting-rules': true
      }
    })
  ]
}
