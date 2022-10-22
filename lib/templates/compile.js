import fs from "fs"
import pug from "pug"
import path from "path"
import gm from "gray-matter"
import { marked } from "marked"

import load from "../utils/load.js"
import getURL from "../utils/getURL.js"
import { log } from "../utils/logger.js"
import slugify from "../utils/slugify.js"

const getPage = (inputPath, url, config) => {
  let slash = "/"
  let outputPath = path.join(config.dist, url)

  if (path.extname(outputPath) === "") {
    outputPath = path.join(outputPath, "index.html")
  }

  // We have been using `path` methods so far
  // On Windows, we need to fix the slashes
  url = url.split(path.sep).join(slash)

  // Everything get a leading slash
  if (url[0] !== slash) url = slash + url

  return {
    url,
    inputPath,
    outputPath,
  }
}

// Some templates specify a Pug layout file.
// Compiling layouts is expensive, so they are only compiled when
// they (or one of their dependencies) changes.
const layoutCache = {}

export default async (filename, config, useLayoutCache = false) => {
  try {
    const content = await fs.promises.readFile(filename, "utf8")
    const filetype = path.extname(filename).slice(1)

    let template, data, str

    if (filetype === "js") {
      data = await load(filename)
    } else {
      ;({ data, content: str } = gm(content))
    }

    const url = data.url ?? getURL(config.src, filename)
    const page = getPage(filename, url, config)

    if (filetype === "md" || filetype === "js") {
      let render
      let dependencies = []

      if (data.layout) {
        let layout
        const filename = path.join(
          config.pugOptions.basedir,
          data.layout + ".pug"
        )

        const content = await fs.promises.readFile(filename, "utf8")

        // Only use the cached layout if its data is the same. Because
        // dependencies are tracked, we only need to worry about the
        // layout itself.
        if (useLayoutCache && layoutCache[filename]) {
          layout =
            layoutCache[filename].content === content && layoutCache[filename]
        }

        if (!layout) {
          layout = {
            content,
            render: pug.compile(content, {
              filename,
              ...config.pugOptions,
            }),
          }
        }

        layoutCache[filename] = layout

        render = layout.render
        dependencies = [filename, ...layout.render.dependencies]
      } else {
        render = data.render || ((data) => data.content)
      }

      data = { ...data, content: str }

      template = {
        render,
        content,
        filename,
        dependencies,
      }
    }

    if (filetype === "pug") {
      const render = pug.compile(str, {
        filename,
        ...config.pugOptions,
      })

      template = {
        render,
        content,
        filename,
        dependencies: render.dependencies,
      }
    }

    if (data.pages) {
      template.pages = data.pages.map((item, i) => {
        const slug = item.slug ?? slugify(item.title || (i + 1).toString())
        const url = path.join(page.url, slug)

        // Child pages extend the parent's data, but there is no need
        // to copy the `pages` property down to the child.
        const parent = { ...data }
        delete parent.pages

        if (item.layout) {
          log(`Ignoring layout "${item.layout}" in ${template.filename}`)
          log(`Page items cannot specify custom layouts\n`)
        }

        return {
          page: getPage(page.inputPath, url, config),
          data: { ...parent, ...item },
        }
      })
    } else {
      template.pages = [{ page, data }]
    }

    template.pages
      .filter((item) => item.data.content)
      .forEach((item) => {
        item.data.content = marked(item.data.content, config.markedOptions)
      })

    return template
  } catch (err) {
    log(`Failed to compile template ${filename}`)
    console.error(err)
  }
}
