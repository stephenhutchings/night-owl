import fs from "fs"
import path from "path"
import chokidar from "chokidar"

import server from "./serve.js"
import * as utils from "./utils.js"
import compile from "./compile.js"

export default class {
  constructor(config = {}) {
    this.config = config

    this.config.pug = {
      basedir: this.config.src,
    }

    this.config.templateRx = new RegExp(
      `\\.(${this.config.files.templates.join("|").replace(/\./g, "\\.")})$`
    )

    this.watcher

    this.templates = {}
  }

  handle(type, filename) {
    if (type === "unlink") {
      delete this.templates[filename]
      return
    }

    const render = (template) => this.render(template)

    return utils.time(`Render ${filename}`, async () => {
      // Check if this file is a dependency of any template
      if (type === "change") {
        await Promise.all(
          Object.entries(this.templates).map(([file, template]) => {
            if (template.dependencies.includes(filename)) {
              return new Promise((res) => {
                if (path.extname(filename) === ".js") {
                  utils.logger(`New data ${filename} for template ${file}`)
                  render(template).then(res)
                } else {
                  utils.logger(
                    `${filename} changed, recompiling template ${file}`
                  )
                  compile(file, this.templates, this.config, false)
                    .then(render)
                    .then(res)
                }
              })
            }
          })
        )
      }

      if (!utils.isIgnored(filename, this.config.files.ignored)) {
        await compile(filename, this.templates, this.config).then(render)
      }
    })
  }

  build() {
    return utils.time("Build", async () => {
      for await (const file of utils.getFiles(this.config.src)) {
        const filename = path.relative(".", file)
        if (!utils.isIgnored(filename, this.config.files.ignored)) {
          await compile(filename, this.templates, this.config).then((t) =>
            this.render(t)
          )
        }
      }
    })
  }

  async watch() {
    utils.makeDir(this.config.dist)

    if (this.watcher) await this.watcher.close()

    this.watcher = chokidar
      .watch(this.config.src, {
        ignoreInitial: false,
        usePolling: false,
        awaitWriteFinish: true,
      })
      .on("all", this.handle.bind(this))

    this.server = server(this.config)

    process.on("SIGINT", async () => {
      utils.logger("Exiting...")
      await this.watcher.close()
      this.server.destroy()
      process.exit()
    })
  }

  async render(template) {
    if (!template) return

    const { filename, render, data } = template
    const globals = {}

    const js = path.format({
      dir: path.dirname(filename),
      name: path.basename(filename, ".pug"),
      ext: ".js",
    })

    if (fs.existsSync(js)) {
      utils.logger(`Loading page data from ${js}`)

      if (!this.templates[filename].dependencies.includes(js)) {
        this.templates[filename].dependencies.push(js)
      }

      await utils.time(`Import module ${js}`, () =>
        utils.load(js).then((lib) => {
          if (lib.default) Object.assign(data, lib.default)
        })
      )
    }

    if (fs.existsSync("./src/_data/index.js")) {
      await utils.load("./src/_data/index.js").then((lib) => {
        if (lib.default) Object.assign(globals, lib.default)
      })
    }

    if (path.extname(data.url) === "") {
      data.url = path.join(data.url, "index.html")
    }

    if (data.pages) {
      for (const item of data.pages) {
        const base = path.basename(filename).replace(this.config.templateRx, "")
        item.slug ??= utils.slug(item.title)
        item.url ??= utils.getURL(
          this.config.src,
          path.join(
            path.dirname(filename),
            base !== "index" ? base : "",
            item.slug,
            "index.html"
          )
        )

        await this.write(item.url, render({ ...globals, ...item }))
      }
    } else {
      await this.write(data.url, render({ ...globals, ...data }))
    }

    await this.write("templates.json", JSON.stringify(this.templates, null, 2))

    if (this.server) this.server.update(data.url)
  }

  write(url, content) {
    if (!url) {
      utils.logger("No filename supplied")
      return
    }

    const filename = path.join(this.config.dist, url)

    utils.makeDir(path.dirname(filename))

    return fs.promises.writeFile(filename, content)
  }
}
