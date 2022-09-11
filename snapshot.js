/// only works for Dahua ATM POS DVR or compatible with it
/// Get screenshot/snapshot from CCTV
/// Read Dahua API to understand the API

const watch = require("node-watch");
const fs = require("fs-extra");
const ini = require("ini");
const setting = ini.parse(fs.readFileSync("cctv.ini", "ascii"));
const axios = require("axios");
const Path = require("path");
const moment = require("moment");

const id = setting.id || "XXX";
const channel = setting.channel || "1";
const server = setting.server;
const user = setting.user;
const pass = setting.pass;

// check in realtime if _text.txt is changing
watch("_text.txt", async function (event, filename) {
  console.log("Changed");
  await downloadImage();
});

// take snapshot of CCTV
async function downloadImage() {
  // API url of Dahua API
  // read the document of Dahua API to understand the API
  const url = `http://${server}/cgi-bin/snapshot.cgi?channel=${channel}`;

  const dir = Path.resolve(
    __dirname,
    "datapos",
    moment().format("YYYYMMDD"),
    "foto"
  );

  fs.ensureDirSync(dir);

  //const path = Path.resolve(__dirname, 'images', `${id}-${timestamp}.jpg`)

  const filename =
    id +
    "-" +
    moment().format("YYYY-MM-DD") +
    "_" +
    moment().format("HH-mm-ss");

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    auth: {
      username: user,
      password: pass,
    },
  });

  const writer = fs.createWriteStream(`${dir}/${filename}.jpg`);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
