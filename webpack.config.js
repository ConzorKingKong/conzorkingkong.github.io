/* eslint-env node */
"use strict"

const ENVIRONMENT = process.env.NODE_ENV || "development"
const {resolve} = require("path")
const {description} = require("./package.json")
const routes = require("./routes.json")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const marked = require("marked")
const autoprefixer = require("autoprefixer")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const extractCSS = new ExtractTextPlugin("site.css")

const exclude = /node_modules/

const renderer = new marked.Renderer()
const $ = {}

$.devtool = "source-map"

$.entry = {
  site: "./_site/index.js"
}

$.output = {
  path: __dirname + "/static",
  publicPath: ENVIRONMENT === "development" ? "/" : "/static",
  filename: "[name].js",
  sourceMapFilename: "[name].map"
}

$.plugins = [
  new webpack.NoErrorsPlugin(),
  new webpack.LoaderOptionsPlugin({
    options: {
      markdownLoader: {renderer},
      postcss: {
        plugins: [autoprefixer({remove: false, browsers: ["last 2 versions", "ie 10"]})]
      }
    }
  }),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(ENVIRONMENT)
  }),
  extractCSS,
  new HtmlWebpackPlugin({
    description,
    title: "Instant Plugin",
    template: "_site/index.pug"
  })
]

$.resolve = {
  extensions: [".js", ".json"],
  modules: [resolve(__dirname, "_site"), "node_modules"]
}

const minimizeParam = ENVIRONMENT === "development" ? "-minimize" : "minimize"

$.module = {
  noParse: /\.min\.js/,
  loaders: [
    {test: /\.pug$/, loader: "pug", exclude},
    {test: /\.png|jpe?g|gif$/i, loader: "url?limit=0", exclude},
    {test: /\.js$/, loader: "eslint", enforce: "pre", exclude},
    {test: /\.js$/, loader: "babel", exclude},
    {test: /\.svg$/, loader: "svg-inline", exclude},
    {
      test: /\.styl$/,
      loader: ExtractTextPlugin.extract({
        fallbackLoader: "style",
        loader: `css?${minimizeParam}!postcss!stylus?paths=app`
      })
    }
  ]
}

if (ENVIRONMENT === "development") {
  $.devtool = "eval"

  const devServerClient = `webpack-dev-server/client?http://0.0.0.0:${routes.development.port}`

  if (Array.isArray($.entry)) {
    $.entry.unshift(devServerClient)
  }
  else {
    $.entry["dev-server-client"] = devServerClient
  }
}

module.exports = $
