---
title: Copy assets
layout: _includes/layouts/docs
tags: ["configuration"]
sort: 3
---

If you need to copy assets from one location to another, use `copy`.

Use an array of rule objects to choose which files should be copied.

```js
export default {
  copy: [
    {
      // Required properties

      // Look in this folder
      src: "src/assets",
      // Or for a file
      src: "src/assets/logo.png",

      // Copy to this folder
      dist: "dist/assets",

      // Optional properties

      // Don't include these files
      exclude: ".DS_Store",

      // Only include these files
      include: "*.img",

      // Don't replicate the directory structure from `src`
      flat: true,
    },
  ],
}
```

If a file matches multiple rules, it will be copied multiple times.
