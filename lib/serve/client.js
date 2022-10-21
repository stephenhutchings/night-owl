const socket = new WebSocket("ws://localhost:34567")

socket.addEventListener("open", () => {
  console.log("[night-owl] %cListening for reload...", "font-weight: bold")
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
  if (event.data === "reload") {
    location.reload()
  } else if (event.data === "reload css") {
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
