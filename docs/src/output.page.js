export default {
  url: "templates.json",
  render: (data) => {
    return JSON.stringify(data.collections.all, null, 2)
  },
}
