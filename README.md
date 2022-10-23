# Night Owl

Night Owl is a static site generator which prioritises speed over flexibility.

Night Owl provides:

- Zero-config by default
- File-based routing, with configurable URLs
- One-to-many pages
- Pug, Markdown or JavaScript templates
- Build, watch and serve

### Why not use another tool?

The driving purpose behind Night Owl is to provide a fast tool to develop static
sites using the Pug templating library. Of all the different template
engines, Pug reduces HTML to a beautiful syntax. However, most SSGs fail to
deliver an ergonomic development experience because of Pug's slow template
compilation.

Night Owl aims to avoid this slowdown by separating the rendering and
compilation steps. Templates use incremental compilation – they are only
compiled when their dependencies change.

This project borrows many ideas from other static site generators, especially
[11ty]. It aims to solve some specific use cases where other SSGs fall short,
and favours convention over customisability. In that respect, it may not work
for every application.

[11ty]: https://www.11ty.dev/
