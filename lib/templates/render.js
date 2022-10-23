import fs from "fs"
import path from "path"
import { log, time } from "../utils/logger.js"
import load from "../utils/load.js"
import makeDir from "../utils/makeDir.js"

export const write = (filename, content) => {
  if (!filename) {
    log("No filename for", content)
    return
  }

  if (!content) {
    log("No content for", filename)
    return
  }

  makeDir(path.dirname(filename))

  return fs.promises.writeFile(filename, content)
}

const render = async (template, globals, transforms = []) => {
  if (!template) return

  await Promise.all(
    template.pages.map((page) => {
      new Promise(async (resolve) => {
        let content = template.render({
          ...globals,
          ...page.data,
          page: page.page,
        })

        for (const transform of transforms) {
          content = await transform(content, page.page.outputPath)
        }

        write(page.page.outputPath, content).then(resolve)
      })
    })
  )

  return template
}

export default (templates, config) =>
  time(`Render ${templates.pages().length} pages`, async () => {
    const globals = fs.existsSync(config.data) ? await load(config.data) : {}

    globals.collections = templates.collect()

    return Promise.all(
      templates.list().map(
        (template) =>
          new Promise((resolve) => {
            render(template, globals, config.transforms).then(resolve)
          })
      )
    )
  })
