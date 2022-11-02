import os from "os"
import fs from "fs"
import path from "path"
import http from "http"
import stream from "stream"

import WebSocket, { WebSocketServer } from "ws"
import mime from "mime-types"
import { info, fail } from "../utils/logger.js"
import { fileURLToPath } from "url"

const PORT_RETRY_LIMIT = 10
const PORT = 34567

const IP_ADDRESS =
  Object.values(os.networkInterfaces())
    .flat()
    .find((a) => a.family === "IPv4" && !a.internal)?.address || "localhost"

const CLIENT_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "client.js"
)
const CLIENT_URL = "__socket.js"

function insertClient(html) {
  return html.replace(
    "</head>",
    `<script type="module" src="/${CLIENT_URL}" data-address="ws://${IP_ADDRESS}:${PORT}"></script></head>`
  )
}

function wrap(msg) {
  return `<html><body style="color:#eee;background:#012;margin:0;display:flex;height:100%;"><pre style="margin:auto;padding:2rem;"><code style="font:17px / 1.6 Menlo, monospace"><center style="color:#c4d">NightOwl</center>\n${msg
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</code></pre></body></html>`
}

async function handle(res, filename) {
  if (filename.endsWith(".html")) {
    const html = insertClient(await fs.promises.readFile(filename, "utf-8"))

    res.writeHead(200, {
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    })

    res.end(html)
  } else {
    res.writeHead(200, {
      "Content-Length": (await fs.promises.stat(filename)).size,
      "Content-Type": mime.contentType(path.basename(filename)),
      "Cache-Control": "no-cache, no-store, must-revalidate",
    })

    stream.pipeline(fs.createReadStream(filename), res, (err) => {
      if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        console.error(err)
      }
    })
  }
}

export default (config) => {
  let port = config.port

  const wss = new WebSocketServer({ port: PORT })

  const server = http.createServer(async (req, res) => {
    let filename = decodeURIComponent(
      req.url.slice(1).match(/.*?(?=[#?]|$)/) ?? ""
    )

    try {
      if (filename === CLIENT_URL) {
        handle(res, CLIENT_FILE)
        return
      }

      filename = path.resolve(path.join(config.dist, filename))

      if (fs.existsSync(filename)) {
        if (fs.lstatSync(filename).isDirectory()) {
          filename = path.join(filename, "index.html")
        }
      } else {
        if (fs.existsSync(filename + ".html")) {
          filename += ".html"
        }
      }

      if (fs.existsSync(filename)) {
        handle(res, filename)
      } else {
        const file = path.join(config.dist, "404.html")

        res.writeHead(404)

        if (fs.existsSync(file)) {
          res.end(insertClient(await fs.promises.readFile(file, "utf-8")))
        } else {
          res.end(wrap("404 Not Found"))
        }
      }
    } catch (err) {
      res.writeHead(500, {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      })

      res.end(wrap(err.stack))

      fail(`Couldn't serve ${req.url}`, err)
    }
  })

  // Increment port if the selected one is in use
  server.on("error", (err) => {
    if (err.code == "EADDRINUSE") {
      if (err.port < config.port + PORT_RETRY_LIMIT) {
        server.listen(++port)
      } else {
        throw new Error(
          `No port available between ${config.port} and ${
            config.port + PORT_RETRY_LIMIT
          }.`
        )
      }
    }
  })

  server.listen(port, () => {
    info(`Server running on http://${IP_ADDRESS}:${port}/`)
  })

  return {
    close: () => {
      info("Closing server")

      server.close()
      wss.close()
    },

    update: (urls = []) => {
      if (urls.every((url) => url.endsWith(".css"))) {
        info("Reloading css")
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send("css")
          }
        })
      } else {
        info("Reloading page")
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send("page")
          }
        })
      }
    },
  }
}
