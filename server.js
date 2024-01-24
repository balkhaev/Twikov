const express = require("express")
const bodyParser = require("body-parser")

const app = express()

const updater = require("./updater")

app.use(bodyParser.urlencoded({ extended: true }))

app.post("/api", async (req, res) => {
  res.send(await updater(req.body))
})

app.use(express.static("public"))

app.listen(3333)

console.log("hUY!")
