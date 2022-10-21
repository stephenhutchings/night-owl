import fs from "fs"
import path from "path"
import slugify from "slugify"
import { fileURLToPath } from "url"

const DEBUG = true

export const time = async (label, fn) => {
  if (DEBUG) console.time(label)
  await fn()
  if (DEBUG) console.timeEnd(label)
}

export const logger = (str, ...args) => {
  if (DEBUG) console.log("[night-owl] " + str, ...args)
}

export const isIgnored = (file, ignoreRx) =>
  ignoreRx ? ignoreRx.test(file) : false

export const isTemplate = (file, templateRx = /\.pug$/) => templateRx.test(file)

export const getURL = (src, filename) => {
  filename = path.relative(src, filename)
  filename = filename.replace(/\.(pug|md|page\.js)$/, ".html")

  if (!/(^|[\\\/])(index|404).html$/.test(filename)) {
    filename = path.join(filename.replace(/\.html$/, ""), "index.html")
  }

  return path.normalize(filename)
}

export const getDir = (url) => path.dirname(fileURLToPath(import.meta.url))

export const getFiles = async function* (dir) {
  const list = await fs.promises.readdir(dir, { withFileTypes: true })
  for (const item of list) {
    const res = path.resolve(dir, item.name)
    if (item.isDirectory()) {
      yield* getFiles(res)
    } else {
      yield res
    }
  }
}

export const slug = (slug) =>
  slugify(slug, {
    lower: true,
    strict: true,
  })

let count = 0

export const load = (js) => {
  const url = path.relative(getDir(import.meta.url), js)
  return import(url + "?" + count++)
}

export const makeDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}
