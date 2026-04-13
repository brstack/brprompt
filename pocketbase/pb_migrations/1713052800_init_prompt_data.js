/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "prompt_data",
    type: "base",
    fields: [
      {
        name: "sections",
        type: "json",
        maxSize: 0
      }
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: ""
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("prompt_data")
  return app.delete(collection)
})
