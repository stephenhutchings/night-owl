import fs from "fs"

export default (templates) => {
  const getIndex = (filename, templates) => {
    return templates.findIndex((t) => t.filename === filename)
  }

  return {
    remove: (filename) => {
      const index = getIndex(filename, templates)

      if (index >= 0) templates.splice(index, 1)
    },

    update: (template) => {
      if (!template) return

      const index = getIndex(template.filename, templates)

      if (index >= 0) templates[index] = template
      else templates.push(template)
    },

    changed: async (filename) => {
      const index = getIndex(filename, templates)

      if (index === -1) return true

      const content = await fs.promises.readFile(filename, "utf8")

      return content !== templates[index].content
    },

    list: () => {
      return templates
    },

    pages: () => {
      return templates.map((template) => template.pages).flat()
    },

    collect: () => {
      const pages = templates.map((template) => template.pages).flat()
      const result = {}
      const base = ["all"]

      pages.forEach((page) => {
        const tags = page.data.tags ? base.concat(page.data.tags) : base

        tags.forEach((tag) => {
          if (!result[tag]) result[tag] = [page]
          else result[tag].push(page)
        })
      })

      return result
    },
  }
}
