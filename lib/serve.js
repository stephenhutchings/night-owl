import fs from "fs"
import path from "path"
import http from "http"
import stream from "stream"

import WebSocket, { WebSocketServer } from "ws"
import mime from "mime-types"
import { logger, getDir } from "./utils.js"

const clientSrc = "__socket.js"
const portRetryLimit = 10

function insertClient(html) {
  return html.replace(
    "</head>",
    `<script type="module" src="/${clientSrc}"></script></head>`
  )
}

async function sendFile(req, res, file) {
  if (file.endsWith(".html")) {
    let content = insertClient(await fs.promises.readFile(file, "utf-8"))

    res.writeHead(200, {
      "Content-Length": content.length,
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    })

    res.end(content)
  } else {
    res.writeHead(200, {
      "Content-Length": (await fs.promises.stat(file)).size,
      "Content-Type": mime.contentType(path.basename(file)),
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    })

    stream.pipeline(fs.createReadStream(file), res, (err) => {
      if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        console.error(err)
      }
    })
  }
}

function ready(port) {
  logger(`----------------------------------------`)
  logger(`Server running on http://localhost:${port}/`)
  logger(`----------------------------------------`)
}

export default (config) => {
  let port = config.port

  const wss = new WebSocketServer({ port: 34567 })

  const server = http.createServer(async (req, res) => {
    const filePath = decodeURIComponent(
      req.url.slice(1).match(/.*?(?=[#?]|$)/) ?? ""
    )

    try {
      if (filePath === clientSrc) {
        sendFile(req, res, "lib/serve/client.js")
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
        res.end(insertClient(await fs.promises.readFile(file, "utf-8")))
      }
    } catch (err) {
      if (url.endsWith(".html")) {
        const html = `
        <body style="color:#ddd;background-color:#111;margin:0;padding:60px;min-height:100vh;box-sizing:border-box;overflow-x:auto">
          <script type="module" src=${clientSrc}></script>
          <h1>Pug / HTML Error</h1>
          <pre><code>${err.stack
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")}
          </code></pre>
        </body>`.trim()

        res.writeHead(200, {
          "Content-Length": html.length,
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*",
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
      if (err.port < config.port + portRetryLimit) {
        server.listen(++port)
      } else {
        throw new Error(
          `No port available between ${config.port} and ${
            config.port + portRetryLimit
          }.`
        )
      }
    }
  })

  server.listen(port, () => ready(port))

  return {
    destroy: () => {
      server.close()
      wss.close()
    },

    update: (url) => {
      if (url.match(/\.(css)$/)) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send("reload css")
          }
        })
      } else {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send("reload")
          }
        })
      }
    },
  }
}