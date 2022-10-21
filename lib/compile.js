import fs from "fs"
import path from "path"
import pug from "pug"
import { marked } from "marked"
import gm from "gray-matter"
import * as utils from "./utils.js"

function compileLayout() {}

const layoutCache = {}

export default async function compile(
  filename,
  templates,
  config,
  useCache = true
) {
  if (!utils.isTemplate(filename, config.templateRx)) return

  const content = await fs.promises.readFile(filename, { encoding: "utf8" })
  const filetype = path.extname(filename).slice(1)

  // If content is unchanged, use the cache
  if (
    useCache &&
    templates[filename] &&
    templates[filename].content === content
  ) {
    return templates[filename]
  }

  try {
    let template
    let { data, content: str } = gm(content)

    if (filetype === "js") {
      data = (await utils.load(filename)).default
    }

    Object.assign(data, { url: utils.getURL(config.src, filename) })

    if (data.pages) {
      data.pages
        .filter((item) => item.content)
        .forEach((item) => (item.content = marked(item.content)))
    }

    if (filetype === "md" || filetype === "js") {
      let render, dependencies

      if (data.layout) {
        const layoutname = path.join(config.src, data.layout + ".pug")
        const layout = await compile(layoutname, layoutCache, config)

        render = layout.render
        dependencies = [layout, ...layout.dependencies]
      } else {
        render = (str) => str
      }

      template = {
        render,
        content,
        filename,
        dependencies,
        data: { ...data, content: marked(str) },
      }
    }

    if (filetype === "pug") {
      const render = pug.compile(str, { ...config.pug, filename })

      template = {
        render,
        content,
        filename,
        dependencies: render.dependencies,
        data,
      }
    }

    return (templates[filename] = template)
  } catch (error) {
    console.error(`Failed to compile ${filename}`)
    console.error(error)
    return
  }
}
