import fs from "fs"
import path from "path"
import * as utils from "../utils/index.js"

export const write = (dist, url, content) => {
  if (!url) {
    utils.log("No filename supplied")
    return
  }

  if (path.extname(url) === "") {
    url = path.join(url, "index.html")
  }

  const filename = path.join(dist, url)

  utils.makeDir(path.dirname(filename))

  return fs.promises.writeFile(filename, content)
}

export const render = async (template, config) => {
  if (!template) return

  const { filename, render, data } = template
  const globals = {}

  if (fs.existsSync(config.data)) {
    Object.assign(globals, await utils.load(config.data))
  }

  if (data.pages) {
    for (const item of data.pages) {
      const base = path.basename(filename).replace(config.templateRx, "")
      item.slug ??= utils.slug(item.title)
      item.url ??= utils.getURL(
        config.src,
        path.join(
          path.dirname(filename),
          base !== "index" ? base : "",
          item.slug
        )
      )

      await write(config.dist, item.url, render({ ...globals, ...item }))
    }
  } else {
    await write(config.dist, data.url, render({ ...globals, ...data }))
  }

  return template
}

export const renderAll = async (pages, config) => {
  return Promise.all(
    pages.map(
      (page) =>
        new Promise((res) => {
          render(page, config).then(res)
        })
    )
  )
}

export default render
