---
title: Serve
layout: _includes/layouts/docs
tags: ["commands"]
---

In your `package.json` scripts, add the Night Owl `--serve` command option.

```json
{
  "scripts": {
    "serve": "night-owl --serve"
  }
}
```

You can now run Night Owl from the command line.

```bash
npm run serve
```

## Combining watch and serve

Usually, you will call `serve` and [`watch`](../watch/) together.

```json
{
  "scripts": {
    "start": "night-owl --watch --serve"
  }
}
```

## Live reloading

When Night Owl detects a change, it will reload the page. If only a CSS file has
changed, it will reload all the CSS links on the page.

## Setting the port

You can configure which port to use in your [`config`](../config/). The default
is `8080`.

```js
export default {
  port: 3000,
}
```

If the port is unavailable, Night Owl will increment the number a handful of
times to find one that is available.
