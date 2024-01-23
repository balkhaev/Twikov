const express = require("express")
const app = express()

const updater = require("./updater")

app.get("/api", async (req, res) => {
  res.send(await updater())
})

app.use(express.static("public"))

app.listen(3333)
