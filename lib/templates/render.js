import fs from "fs"
import path from "path"
import * as utils from "../utils/logger.js"
import load from "../utils/load.js"
import makeDir from "../utils/makeDir.js"

export const write = (filename, content) => {
  if (!filename) {
    utils.log("No filename for", content)
    return
  }

  if (!content) {
    utils.log("No content for", filename)
    return
  }

  makeDir(path.dirname(filename))

  return fs.promises.writeFile(filename, content)
}

const render = async (template, globals) => {
  if (!template) return

  const { render, pages } = template

  for (const page of pages) {
    await write(
      page.page.outputPath,
      render({ ...globals, ...page.data, page: page.page })
    )
  }

  return template
}

export default async (templates, config) => {
  const globals = fs.existsSync(config.data) ? await load(config.data) : {}

  globals.collections = templates.collect()

  return utils.time(`Render ${templates.pages().length} pages`, () =>
    Promise.all(
      templates.list().map(
        (page) =>
          new Promise((res) => {
            render(page, globals).then(res)
          })
      )
    )
  )
}
