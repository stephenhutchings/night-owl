import os from "os"
import fs from "fs"
import path from "path"
import http from "http"
import stream from "stream"

import WebSocket, { WebSocketServer } from "ws"
import mime from "mime-types"
import { info } from "../utils/logger.js"
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

async function sendFile(req, res, file) {
  if (file.endsWith(".html")) {
    let content = insertClient(await fs.promises.readFile(file, "utf-8"))

    res.writeHead(200, {
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    })

    res.end(content)
  } else {
    res.writeHead(200, {
      "Content-Length": (await fs.promises.stat(file)).size,
      "Content-Type": mime.contentType(path.basename(file)),
      "Cache-Control": "no-cache, no-store, must-revalidate",
    })

    stream.pipeline(fs.createReadStream(file), res, (err) => {
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
    const filePath = decodeURIComponent(
      req.url.slice(1).match(/.*?(?=[#?]|$)/) ?? ""
    )

    try {
      if (filePath === CLIENT_URL) {
        sendFile(req, res, CLIENT_FILE)
        return
      }
    } catch (ex) {
      res.writeHead(500)
      res.end()
      console.error(err)
      return
    }

    let url = path.resolve(path.join(config.dist, filePath))

    if (fs.existsSync(url) && fs.lstatSync(url).isDirectory()) {
      url = path.join(url, "index.html")
    } else if (!fs.existsSync(url) && fs.existsSync(url + ".html")) {
      url += ".html"
    }

    try {
      if (fs.existsSync(url)) {
        sendFile(req, res, url)
      } else {
        const file = path.join(config.dist, "404.html")

        res.writeHead(404)

        if (fs.existsSync(file)) {
          res.end(insertClient(await fs.promises.readFile(file, "utf-8")))
        } else {
          res.end("404 Not Found")
        }
      }
    } catch (err) {
      if (url.endsWith(".html")) {
        const html = `<html><body style="color:#ddd;background-color:#111;margin:0;padding:60px;min-height:100vh;box-sizing:border-box;overflow-x:auto">
          <script type="module" src="/${CLIENT_URL}"></script>
          <h1>Error</h1>
          <pre><code>${err.stack
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")}
          </code></pre>
        </body></html>`

        res.writeHead(200, {
          "Content-Length": html.length,
          "Content-Type": "text/html",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        })
        res.end(html)
      } else {
        res.writeHead(500)
        res.end()
      }
      console.error(err)
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
