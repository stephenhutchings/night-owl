## Compilation logic

```
// Unnamed template
/src/to/index.pug
=> /dist/to/index.html

// Named template with data
/src/to/name.pug
=> /dist/to/name/index.html

// Named/unnamed pages template
/src/to/name.page.js using { pages: [...] } as data
=> /src/to/name/slug-one/index.html
   /src/to/name/slug-two/index.html
   /src/to/name/slug-two/etc.

```

## TODO

- ~~global data~~
- ~~compute data from files~~
- ~~markdown~~
- ~~frontmatter~~
- ~~handle markdown templates~~
- ~~load user config~~
- ~~11ty-style collections~~ Use `tags` property to define collections
- 11ty-style passthrough copy
- 11ty-style pagination

Some data is loaded at compile time, some at render time.
Rendering shouldn't care about loading data. Not sure compile should either.

If is page, add to dictionary. Then compute data and render method.

Compiler shouldn't store templates, only return render method for a file.

- watch
- build
- serve
- page
  - getData
  - getRender

The problem with passing data listing the rendered files is that it requires
that all pages are rerendered after any change. But rendering is cheap, and
compilation is expensive, especially for Pug templates.

build => list => compile => render
watch => compile changes => render

### Data cascade

This has been intentionally removed. Data must be explicitly added to templates.
However, items in a `pages` array inherit data from the parent template.
