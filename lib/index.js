#!/usr/bin/env node

import setup from "./setup/index.js"
import build from "./build/index.js"
import watch from "./watch/index.js"
import serve from "./serve/index.js"

setup()
  .then(async (config) => {
    const isWatch = process.argv.includes("--watch")
    const isServe = process.argv.includes("--serve")
    const isBuild = process.argv.includes("--build")

    const buildr = isBuild ? await build(config) : null
    const server = isServe ? await serve(config) : null
    const watchr = isWatch ? await watch(config, server?.update) : null

    process.on("SIGINT", async () => {
      await watchr?.close?.()
      await server?.close?.()
      process.exit()
    })
  })

  .catch((error) => {
    throw error
  })
