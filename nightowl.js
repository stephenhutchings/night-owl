const config = {
  src: "./src",

  data: "./src/_data/index.js",

  pugOptions: {
    pretty: true,
  },

  markedOptions: {
    smartypants: true,
  },

  copy: [
    {
      src: "src/assets",
      dist: "dist/assets",
      exclude: "**/.DS_Store",
    },
  ],
}

export default config
