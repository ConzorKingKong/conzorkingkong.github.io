/* eslint-env node */

const config = require("../webpack.config")
const webpack = require("webpack")
const del = require("del")
const fs = require("fs")
const compiler = webpack(config)
const buildDir = config.output.path

function logError(error) {
  console.dir(error, {depth: null, colors: true})
}

function validate(fatalError, stats) {
  if (fatalError) throw fatalError

  const {errors, warnings} = stats.toJson()

  if (errors.length > 0 || warnings.length > 0) {
    logError(warnings)
    logError(errors)
    process.exit(1)
  }
}

del.sync(buildDir)

compiler.run((fatalError, stats) => {
  validate(fatalError, stats)
  fs.renameSync(`${buildDir}/index.html`, `${buildDir}/../index.html`)
})
