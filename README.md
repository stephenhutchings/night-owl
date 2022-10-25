# Night Owl

Night Owl is a static site generator which prioritises speed over flexibility.

Night Owl features:

- Zero-config by default
- File-based routing, with configurable URLs
- One-to-many pages
- Pug, Markdown, Sass or JavaScript templates
- Build, watch and serve commands
- esmodule ready

## Is this ready to use?

No. This project is a work-in-progress. As such it hasn't yet been published to
NPM. Feel free to clone the repository and play around, but expect bugs.

## Why not use another tool?

The driving purpose behind Night Owl is to provide a fast tool to develop static
sites using Pug templates. Of all the different templating languages, Pug
reduces HTML down into an extraordinarily elegant syntax. However, most static
site generators (SSG) fail to deliver an ergonomic development experience because
of Pug's slow template compilation.

Night Owl avoids this slowdown by separating the rendering and
compilation. Templates use incremental compilation – they are only
compiled when they or their dependencies change.

## Prior art

This project borrows many ideas from other static site generators, including
11ty, Wintersmith and more. It aims to solve some specific use
cases where other SSGs fall short, and favours convention over customisability.
In that respect, it may not work for every application.

[11ty]: https://www.11ty.dev/
