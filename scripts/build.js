const fs = require("fs");

const addonJSON = require("../source/addon.json");

const fileName = `${addonJSON.name}-${addonJSON.version}.c3addon`;

if (!fs.existsSync("dist/")) {
  fs.mkdirSync("dist/");
}

const output = fs.createWriteStream(`dist/${fileName}`, { flags: "w" });

const archiver = require("archiver")("zip", {
  zlib: { level: 9 },
});

output.on("error", function () {
  console.log(`[${fileName}] Build: Error`);
});

output.on("finish", function () {
  const kib = (archiver.pointer() / 1024).toPrecision(2);
  console.log(`[${fileName}] Build: Success (${kib} KiB)`);
});

archiver.pipe(output);

archiver.directory("source/", false);

archiver.finalize();
