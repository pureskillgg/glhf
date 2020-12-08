const path = require('path')

const serverlessWebpack = require('serverless-webpack')
const webpackNodeExternals = require('webpack-node-externals')

module.exports = {
  entry: serverlessWebpack.lib.entries,
  target: 'node',
  mode: serverlessWebpack.lib.webpack.isLocal ? 'development' : 'production',
  // UPSTREAM: https://github.com/serverless-heaven/serverless-webpack/issues/651#issuecomment-718787162
  optimization: {
    concatenateModules: false,
    minimize: false
  },
  performance: {
    hints: false
  },
  devtool: 'nosources-source-map',
  externals: [webpackNodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      }
    ]
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  }
}
