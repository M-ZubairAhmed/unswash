const webpack = require('webpack')
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const dotenv = require('dotenv')

const reactlibsVendorsRegex = /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/
const restVendorsRegex = /[\\/]node_modules[\\/](!react)(!react-dom)(!react-router-dom)[\\/]/
const svgsRegex = /[\\/]src[\\/]_icons[\\/]/

const envVars = dotenv.config({
  path: path.resolve(__dirname, '.env'),
})

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
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    usedExports: true,
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        reactLibraryVendor: {
          test: reactlibsVendorsRegex,
          name: 'reactlibs',
        },
        vendor: {
          test: restVendorsRegex,
          name: 'vendors',
        },
        svg: {
          test: svgsRegex,
          name: 'svgs',
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
          MiniCssExtractPlugin.loader,
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
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(envVars.parsed),
    }),
    new htmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, 'src', 'index.html'),
      favicon: path.resolve(__dirname, 'src', 'favicon.ico'),
      minify: true,
      hash: true,
      scriptLoading: 'defer',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.[contenthash].css',
      chunkFilename: 'style.[id].[contenthash].css',
    }),
    new CompressionPlugin(),
  ],
}
