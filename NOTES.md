## Compilation logic

```
// Unnamed template
/src/to/index.pug
=> /dist/to/index.html

// Named template with data
/src/to/name.pug
/src/to/name.js
=> /dist/to/name/index.html called with name.js as data

// Named/unnamed pages template
/src/to/name.pug
/src/to/name.js where name.js returns { pages }
=> /src/to/name/slug-one/index.html
   /src/to/name/slug-two/index.html
   /src/to/name/slug-two/etc.

// Do the same with markdown files in a directory?
```

## Ideas

- global data
- compute data from files
- handle asset copy
- ~~markdown~~
- ~~frontmatter~~

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
