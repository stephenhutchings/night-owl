import path from "path"
import chokidar from "chokidar"

import build from "../build/index.js"
import { log, time } from "../utils/logger.js"
import copy from "../utils/copy.js"

import _compile from "../templates/compile.js"
import render from "../templates/render.js"
import debounce from "./debounce.js"

// Wrap compile in timer in watch mode
const compile = (filename, ...rest) =>
  time(`Compile ${filename}`, () => _compile(filename, ...rest))

// Determine whether a change has occured, and recompile affected templates
const handle = async (type, filename, templates, config) => {
  let changed = false

  // The file no longer exists. Note that rendered files aren't deleted.
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
            new Promise((resolve) => {
              changed = true

              compile(template.filename, config)
                .then(templates.update)
                .then(resolve)
            })
        )
    )
  }

  if (!changed && (type === "change" || type === "add")) {
    if (config.isTemplate(filename)) {
      // If a file is added, we don't need to check whether it has changed
      // TODO: both templates.changed() and compile() read the file content
      if (type === "add" || (await templates.changed(filename))) {
        changed = true
        await compile(filename, config, true).then(templates.update)
      }
    } else if (filename === path.normalize(config.data)) {
      log("Global data has changed")
      changed = true
    } else {
      changed = await copy(filename, config.copy)
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
    const norender = debounce(() => log("No change detected"), 50)

    const watcher = chokidar
      .watch(config.watch, {
        ignoreInitial: true,
        usePolling: false,
        awaitWriteFinish: true,
      })
      .on("all", (type, filename) =>
        handle(type, filename, templates, config).then((changed) => {
          if (changed === true) {
            dorender().then(() => onChange())
          } else if (changed) {
            onChange(path.relative(config.dist, changed))
          } else {
            norender()
          }
        })
      )

    return {
      close: () => {
        log("Closing file watcher")
        watcher.close()
      },
    }
  })
