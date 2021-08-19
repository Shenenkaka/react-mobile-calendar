const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  devtool: "eval-cheap-source-map",
  entry: [
    "./playground/index.js",
    "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true",
  ],
  output: {
    filename: "main.js",
    path: path.resolve(path.resolve(), "dist"),
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    esmodules: true,
                  },
                },
              ],
              "@babel/preset-react",
            ],
          },
        },
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader", // creates style nodes from JS strings
          },
          {
            loader: "css-loader", // translates CSS into CommonJS
          },
          {
            loader: "less-loader", // compiles Less to CSS
          },
        ],
      },
    ],
  },
};
