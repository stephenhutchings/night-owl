import fs from "fs"
import path from "path"
import { info, time } from "../utils/logger.js"
import load from "../utils/load.js"
import makeDir from "../utils/makeDir.js"

export const write = (filename, content) => {
  if (!filename) {
    info("No filename for", content)
    return Promise.resolve(null)
  }

  if (!content) {
    info("No content for", filename)
    return Promise.resolve(null)
  }

  makeDir(path.dirname(filename))

  return fs.promises.writeFile(filename, content)
}

const render = async (template, globals, transforms = []) => {
  if (!template) return

  await Promise.all(
    template.pages.map((page) => {
      new Promise(async (resolve) => {
        let content = page.render({
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
    globals.filters = config.pugOptions.filters

    return Promise.all(
      templates.list().map(
        (template) =>
          new Promise((resolve) => {
            render(template, globals, config.transforms).then(resolve)
          })
      )
    )
  })
