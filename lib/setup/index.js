import fs from "fs"
import path from "path"
import deepmerge from "deepmerge"

const filename = "nightowl.js"
const filepath = path.join(process.cwd(), filename)

const baseConfig = {
  src: "./src",
  dist: "./dist",

  port: 8080,

  data: false,

  files: {
    templates: ["pug", "md", "page.js"],
    ignored: [/(^|[\/\\])[\._]/, /^node_modules/],
  },

  pugOptions: {},
  markedOptions: {},
}

const normalize = (urserConfig) => {
  const config = deepmerge(baseConfig, urserConfig)

  const templateRx = new RegExp(
    `\\.(${config.files.templates.join("|").replace(/\./g, "\\.")})$`
  )

  config.isTemplate = (filename) =>
    !config.files.ignored.some((rule) => rule.test(filename)) &&
    templateRx.test(filename)

  config.pugOptions.basedir ??= config.src

  return config
}

export default () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filepath)) {
      console.error(
        `Ensure ${filename} exists in your project's root directory.\n`
      )
      throw new Error(`${filepath} not found`)
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
