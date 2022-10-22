import path from "path"
import chokidar from "chokidar"

import build from "../build/index.js"
import * as utils from "../utils/logger.js"
import _compile from "../templates/compile.js"
import templateList from "../templates/list.js"
import renderAll, { write } from "../templates/render.js"

const compile = (...args) =>
  utils.time("Compile " + args[0], () => _compile(...args))

/**
 *
 * @param {string} type - Type of the file change event
 * @param {string} filename - Name of the changed file
 * @param {templateList} templates - Dictionary of templates
 * @param {*} config - NightOwl Config
 */
const handle = async (type, filename, templates, config) => {
  let changed = false

  if (type === "unlink") {
    templates.remove(filename, templates)
    return changed
  }

  // Check if this file is a dependency of any template
  if (type === "change") {
    await Promise.all(
      templates
        .list()
        .filter((template) => template.dependencies.includes(filename))
        .map(
          (template) =>
            new Promise((res) => {
              changed = true

              compile(template.filename, config)
                .then(templates.update)
                .then(res)
            })
        )
    )
  }

  if ((type === "change" || type === "add") && config.isTemplate(filename)) {
    if (type === "add" || (await templates.changed(filename))) {
      changed = true
      await compile(filename, config, true).then(templates.update)
    }
  }

  return changed
}

const debounce = (fn, ms) => {
  let timeout

  return () =>
    new Promise((res) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => res(fn()), ms)
    })
}

/**
 * @param {object} config
 * @param {function} [onChange] - Callback after each compilation cycle
 * @return {{ close: function }} - Close the file watcher
 */
export default (config, onChange) =>
  build(config).then((templates) => {
    const report = () =>
      write(
        path.join(config.dist, "templates.json"),
        JSON.stringify(templates.pages(), null, 2)
      )

    const render = debounce(async () => await renderAll(templates, config), 50)
    const norender = debounce(() => utils.log("No change detected"), 50)

    const watcher = chokidar
      .watch(config.src, {
        ignoreInitial: true,
        usePolling: false,
        awaitWriteFinish: true,
      })
      .on("all", (type, filename) =>
        handle(type, filename, templates, config).then((changed) => {
          if (changed) {
            render().then(report).then(onChange)
          } else {
            norender()
          }
        })
      )

    report()

    return {
      close: () => {
        utils.log("Closing file watcher")
        watcher.close()
      },
    }
  })
