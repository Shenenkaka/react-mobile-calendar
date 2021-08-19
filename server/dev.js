const webpack = require("webpack");
const WebpackHotMiddleware = require("webpack-hot-middleware");
const WebpackDevMiddleware = require("webpack-dev-middleware");
const express = require("express");
const path = require("path");

const webpackOptions = require("./webpack.dev.config");

const webpackCompiler = webpack(webpackOptions);

const app = express();

//set template
app.set("views", path.resolve(path.resolve(), "views"));
app.set("view engine", "ejs");

// Serve static resources
app.use(express.static(path.resolve(path.resolve(), "public")));

// use webpack middleware
app.use(
  WebpackDevMiddleware(webpackCompiler, {
    publicPath: "/dist/",
    stats: {
      colors: true,
    },
  })
);

app.use(
  WebpackHotMiddleware(webpackCompiler, {
    reload: true,
  })
);

app.use("/", function (req, res, next) {
  res.render("index.ejs");
});

app.listen(8000, () =>
  console.log("Server is now running in http://127.0.0.1:8000")
);
