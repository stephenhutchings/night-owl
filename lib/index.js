import build from "./build/index.js"
import watch from "./watch/index.js"
import serve from "./serve/index.js"

const isWatch = process.argv.includes("watch")
const isServe = process.argv.includes("serve")
const isBuild = process.argv.includes("build")

const config = {
  src: "./src",
  dist: "./dist",

  port: 8080,

  data: "./src/_data/index.js",

  files: {
    data: ["data.js"],
    templates: ["pug", "md", "page.js"],
    ignored: /(^|[\/\\])[\._]/,
  },
}

config.pug = {
  basedir: config.src,
}

config.templateRx = new RegExp(
  `\\.(${config.files.templates.join("|").replace(/\./g, "\\.")})$`
)

const buildr = isBuild ? await build(config) : null
const server = isServe ? await serve(config) : null
const watchr = isWatch ? await watch(config, server?.update) : null

process.on("SIGINT", async () => {
  await watchr?.close?.()
  await server?.close?.()
  process.exit()
})
