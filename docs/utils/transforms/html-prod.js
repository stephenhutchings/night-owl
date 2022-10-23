import posthtml from "posthtml"
import baseUrl from "posthtml-base-url"
import htmlnano from "htmlnano"

const processer = posthtml([
  baseUrl({
    url: "/night-owl",
    allTags: true,
  }),
  htmlnano({
    minifyCss: false,
    minifyJs: false,
    minifySvg: false,
  }),
])

export default (content, filename) => {
  if (filename.endsWith(".html")) {
    return processer.process(content).then((res) => res.html)
  } else {
    return content
  }
}
