const socket = new WebSocket("ws://localhost:34567")

const log = (msg) => {
  console.log(`[night-owl] %c${msg}`, "font-weight: bold")
}

socket.addEventListener("open", () => {
  log("Listening for reload...")
})

function* getLinkedStylesheets(root = document) {
  for (const link of root.querySelectorAll('link[rel="stylesheet"][href]')) {
    yield link
  }

  for (const element of root.querySelectorAll("*")) {
    if (element.shadowRoot) {
      yield* getLinkedStylesheets(element.shadowRoot)
    }
  }
}

socket.addEventListener("message", (event) => {
  if (event.data === "page") {
    location.reload()
  } else if (event.data === "css") {
    log("Reloading CSS")

    const cache = {}

    const param = (key) => {
      if (cache[key]) {
        return cache[key]
      } else {
        const url = new URL(key, location.href)
        url.searchParams.set("reload", Date.now())
        return (cache[key] = url.toString())
      }
    }

    for (const link of getLinkedStylesheets()) {
      link.setAttribute("href", param(link.getAttribute("href")))
    }
  }
})
