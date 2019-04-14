import { resolve } from "path";
import express from "express";
import { urlencoded, json, static as expressStatic } from "express";
import cors from "cors";

import { Server } from "http";

process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

const isDev = process.env.NODE_ENV !== "production";
const port  = process.env.PORT || 8080;

// Configuration

let server: Server;
const app = express();
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

if (isDev) {
  const historyApiFallback = require("connect-history-api-fallback");
  const webpack = require("webpack");
  const webpackDevMiddleware = require("webpack-dev-middleware");
  const webpackHotMiddleware = require("webpack-hot-middleware");
  let webpackConfig = require("../config/webpack.config")("development");
  let compiler = webpack(webpackConfig);

  app.use(historyApiFallback({
    verbose: false
  }));

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    filename: resolve(__dirname, "../client/public"),
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  }));

  app.use(webpackHotMiddleware(compiler));
  
  compiler.hooks.done.tap("onDone", () => {
    startServer();
  });
}
else {
  app.use(expressStatic(resolve(__dirname, "../client")));
  app.get("*", function (req, res) {
    res.sendFile(resolve(__dirname, "../client/index.html"));
    res.end();
  });
}

function startServer() {
  if (!server) {
    server = app.listen(port, () => {
      console.info(">>> Open http://localhost:%s/ in your browser.", port);
    });
  }
}
