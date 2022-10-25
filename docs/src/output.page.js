export default {
  url: "output.json",
  render: (data) => JSON.stringify(data.collections.all, null, 2),
}
