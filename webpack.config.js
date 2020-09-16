const webpack = require('webpack')
const path = require('path')
const optimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const htmlWebpackPlugin = require('html-webpack-plugin')
const miniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin

const reactVendorsRegex = /[\\/]node_modules[\\/](react|react-dom)[\\/]/
const restVendorsRegex = /[\\/]node_modules[\\/](!react)(!react-dom)[\\/]/

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[contenthash].js',
    pathinfo: true,
    publicPath: '/',
    chunkFilename: '[name].[contenthash].js',
  },
  devtool: 'source-map',
  optimization: {
    minimizer: [new optimizeCssAssetsPlugin({})],
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        reactVendor: {
          test: reactVendorsRegex,
          name: 'reactvendor',
        },
        vendor: {
          test: restVendorsRegex,
          name: 'vendor',
        },
      },
    },
  },
  module: {
    strictExportPresence: true,
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
                plugins: [require('tailwindcss'), require('autoprefixer')],
              },
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  performance: {
    hints: 'warning',
  },
  stats: 'verbose',
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new htmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'src', 'index.html'),
      minify: true,
      hash: true,
    }),
    new miniCssExtractPlugin({
      filename: 'styles.[contenthash].css',
      chunkFilename: 'style.[id].[contenthash].css',
    }),
    new optimizeCssAssetsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
}
