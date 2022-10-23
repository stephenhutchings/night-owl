import fs from "fs"
import path from "path"
import minimatch from "minimatch"
import deepmerge from "deepmerge"

import { log } from "../utils/logger.js"

const filename = "nightowl.js"
const filepath = path.join(process.cwd(), filename)

const baseConfig = {
  src: "./src",
  dist: "./dist",

  port: 8080,

  data: false,

  templates: {
    include: ["**/*.@(pug|md|page.js)"],
    exclude: ["**/_*", "**/_*/**"],
  },

  copy: [],
  watch: [],

  pugOptions: {},
  markedOptions: {},

  trailingSlash: true,
}

const normalize = (userConfig) => {
  const config = deepmerge(baseConfig, userConfig)

  config.isTemplate = (filename) =>
    !config.templates.exclude.some((rule) => minimatch(filename, rule)) &&
    config.templates.include.some((rule) => minimatch(filename, rule))

  config.watch.push(config.src, ...config.copy.map((rule) => rule.src))

  config.pugOptions.basedir ??= config.src

  return config
}

export default () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filepath)) {
      log(`${filename} wasn't found in your project's root directory.`)
      log(`The default configuration options will be used.\n`)
      return resolve(normalize({}))
    }

    import(filepath)
      .then((lib) => normalize(lib.default))
      .then(resolve)
      .catch((error) => {
        console.error(`An error occured loading ${filename}.\n`)
        reject(error)
      })
  })
}
