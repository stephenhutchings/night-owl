import fs from "fs"
import path from "path"
import chokidar from "chokidar"

import build from "../build/index.js"
import { info, time } from "../utils/logger.js"
import copy from "../utils/copy.js"

import compile from "../templates/compile.js"
import render from "../templates/render.js"
import debounce from "./debounce.js"

const dependencyCache = {}

// Determine whether a change has occured, and recompile affected templates
const handle = async (type, filename, templates, config) => {
  let changed = {
    render: false,
    reload: false,
  }

  // The file no longer exists. Note that rendered files aren't deleted.
  if (type === "unlink") {
    templates.remove(filename, templates)
    return changed
  }

  // Check if this file is a dependency of any template
  if (type === "change") {
    const dependants = templates
      .list()
      .filter((template) => template.dependencies.includes(filename))

    if (dependants.length) {
      const content = (await fs.promises.readFile(filename, "utf8")).toString()

      if (dependencyCache[filename] !== content) {
        await time(`Compiling ${dependants.length} files`, async () => {
          for (const template of dependants) {
            await compile(template.filename, config).then(templates.update)
          }
        })

        changed.render = true
        dependencyCache[filename] = content
      }
    }
  }

  if (!changed.render && (type === "change" || type === "add")) {
    if (config.isTemplate(filename)) {
      // If a file is added, we don't need to check whether it has changed
      // TODO: both templates.changed() and compile() read the file content
      if (type === "add" || (await templates.changed(filename))) {
        changed.render = (
          await time(`Compiling ${filename}`, () =>
            compile(filename, config, true).then(templates.update)
          )
        )?.pages[0]?.page.url
      }
    } else if (filename === path.normalize(config.data)) {
      info("Global data has changed")
      changed.render = true
    } else {
      changed.reload = await copy(filename, config.copy, config.dist)
    }
  }

  return changed
}

// Before watching, run a build. This provides a dictionary of templates
// with methods to handle updates and removals.
// Template rendering is debounced, but file compilation happens in real-time.
export default (config, onChange) =>
  build(config).then((templates) => {
    const dorender = debounce(() => render(templates, config), 50)
    const norender = debounce(() => info("No change detected"), 50)

    const watcher = chokidar
      .watch(config.watch, {
        ignoreInitial: true,
        usePolling: false,
        awaitWriteFinish: true,
      })
      .on("all", (type, filename) =>
        handle(type, filename, templates, config).then((changed) => {
          if (changed.render) {
            dorender().then(() => onChange(changed.render))
          } else if (changed.reload) {
            onChange(changed.reload)
          } else {
            norender()
          }
        })
      )

    return {
      close: () => {
        info("Closing file watcher")
        watcher.close()
      },
    }
  })
