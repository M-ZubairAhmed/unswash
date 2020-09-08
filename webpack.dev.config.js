const webpack = require('webpack')
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: path.resolve('src', 'index.js'),
  output: {
    path: path.resolve('dist'),
    filename: 'dist.bundle-[hash].js',
    publicPath: '/',
    pathinfo: true,
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer', 'postcss-import'],
              },
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: './src/index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
  resolve: {
    modules: [path.resolve('src'), path.resolve('node_modules')],
  },
  devServer: {
    compress: false,
    historyApiFallback: true,
    host: 'localhost',
    open: true,
    stats: 'errors-only',
    port: 8000,
    disableHostCheck: true,
  },
}
