/// only works for Dahua ATM POS DVR or compatible with it
/// insert a text to CCTV

const net = require("net");
const watch = require("node-watch");
const fs = require("fs");
const ini = require("ini");
const client = new net.Socket();

// read setting
const setting = ini.parse(fs.readFileSync("cctv.ini", "ascii"));

const server = setting.server;
const port = setting.port;

let connected = false;

// create TCP connection
client.connect(port, server, function () {
  connected = true;
  console.log("Connected");
});

client.on("close", function () {
  connected = false;
  console.log("Connection closed");
});

client.on("error", function () {
  connected = false;
  console.log("Connection error");
});

// check in realtime if _text.txt is changing
watch("_text.txt", async function (event, filename) {
  if (!connected) {
    client.connect(port, server, function () {
      connected = true;
      console.log("Connected");
    });
  }

  console.log("changed");
  const data = await fs.readFileSync("_text.txt", "ascii");
  console.log(data);

  // send to DVR
  client.write(data);
});
