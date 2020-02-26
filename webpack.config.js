const path = require("path");
module.exports = {
  devtool: "clean-module-source-map",
  target: "node",
  entry: "./webpack-entry.js",
  mode: "production",
  optimization: {
    minimize: true
  },
  performance: {
    hints: false
  },
  output: {
    filename: "edgeroutine-cli"
  },
  module: {
    rules: [{
      test: /\.mjs$/,
      type: "javascript/auto",
      use: []
    }, {
      test: /\.js$/,
      type: "javascript/auto",
      use: []
    }]
  }
};