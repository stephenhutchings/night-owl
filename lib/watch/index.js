import path from "path"
import chokidar from "chokidar"

import build from "../build/index.js"
import * as utils from "../utils/index.js"
import compile from "../page/compile.js"
import _render, { write, renderAll } from "../page/render.js"

/**
 *
 * @param {string} type - Type of the file change event
 * @param {string} filename - Name of the changed file
 * @param {templates} array - Dictionary of templates
 * @param {*} config - NightOwl Config
 */
const handle = (type, filename, templates, config) => {
  if (type === "unlink") {
    templates.splice(
      templates.findIndex((t) => t.filename === filename),
      1
    )
    return Promise.resolve()
  }

  utils.time(`Render ${filename}`, async () => {
    // Check if this file is a dependency of any template
    if (type === "change") {
      await Promise.all(
        templates
          .filter((template) => template.dependencies.includes(filename))
          .map(
            (template) =>
              new Promise((resolve) => {
                if (path.extname(filename) === ".js") {
                  utils.log(
                    `New data ${filename} for template ${template.filename}`
                  )
                  resolve(template)
                } else {
                  utils.log(
                    `${filename} changed, recompiling template ${template.filename}`
                  )
                  compile(template.filename, templates, config, false).then(
                    resolve
                  )
                }
              })
          )
      )
    }

    if (!utils.isIgnored(filename, config.files.ignored)) {
      await compile(filename, templates, config)
    }

    return renderAll(Object.values(templates), config)
  })
}

/**
 * @param {object} config
 * @param {function} [onChange] - Callback after each compilation cycle
 * @return {{ close: function }} - Close the file watcher
 */
export default (config, onChange) => {
  build(config).then((templates) => {
    console.log(templates)
    const report = () =>
      write(config.dist, "templates.json", JSON.stringify(templates, null, 2))

    const watcher = chokidar
      .watch(config.src, {
        ignoreInitial: true,
        usePolling: false,
        awaitWriteFinish: true,
      })
      .on("all", (type, filename) =>
        handle(type, filename, templates, config)?.then(onChange).then(report)
      )

    report()

    return {
      close: () => {
        utils.log("Closing file watcher")
        watcher.close()
      },
    }
  })
}
