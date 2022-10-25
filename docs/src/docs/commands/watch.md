---
title: Watch
layout: _includes/layouts/docs
tags: ["commands"]
---

In your `package.json` scripts, add the Night Owl `--watch` command option.

```json
{
  "scripts": {
    "watch": "night-owl --watch"
  }
}
```

You can now run Night Owl from the command line.

```bash
npm run watch
```

## Combining watch and serve

Usually, you will call `watch` and [`serve`](../serve/) together.

```json
{
  "scripts": {
    "start": "night-owl --watch --serve"
  }
}
```

## Watching other files

If you need other files to trigger a build, add them to `watch` in your Night Owl
[`configuration file`](../configuration/).

```js
export default {
  // When this file changes,
  watch: ["./dist/assets/compiled.js"],
}
```

This can be useful for files that aren't within your `src` directory, or if you
are building some files with a different process.

## Start-up

When you run the `watch` command, it will run [`build`](../build/) first.
