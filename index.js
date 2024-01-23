require("dotenv").config({ path: __dirname + "/.env" })
const tmi = require("tmi.js")

const client = new tmi.Client({
  options: { debug: true },
  connection: {
    secure: true,
    reconnect: true,
  },
  identity: {
    username: "pep1ch",
    password: process.env.TWITCH_OAUTH_TOKEN,
  },
  channels: ["pep1ch"],
})

client.connect()

client.on("message", (channel, tags, message, self) => {
  console.log(tags["custom-reward-id"])
  console.log(`${tags["display-name"]}: ${message}`)
})
