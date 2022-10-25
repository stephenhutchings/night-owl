import random from "./_data/random.js"

export default {
  url: "output.json",
  random,
  render: (data) => JSON.stringify(data.collections.all, null, 2),
}
