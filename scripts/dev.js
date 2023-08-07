const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const addonJSON = require("../source/addon.json");
const port = 5500;

const app = express();

app.use(cors());

app.use(morgan(`[${addonJSON.name}] :method :url :status`));

app.use(express.static("source/"));

app.listen(port, () => {
  console.log(
    `[${addonJSON.name}] Development URL - http://localhost:${port}/addon.json`
  );
});
