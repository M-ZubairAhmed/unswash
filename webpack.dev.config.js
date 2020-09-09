const webpack = require('webpack')
const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const dotenv = require('dotenv')

const envVars = dotenv.config({
  path: path.resolve(__dirname, '.env'),
})

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
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
                plugins: [require('tailwindcss'), require('autoprefixer')],
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
      'process.env': JSON.stringify(envVars.parsed),
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
