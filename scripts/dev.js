const express = require('express');
const cors = require('cors');
const fs = require('fs');

fs.readdirSync('./plugins', { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent, index) => ({
    name: require(`../plugins/${dirent.name}/addon.json`).name,
    path: `plugins/${dirent.name}/`,
    port: 5500 + index,
  }))
  .forEach((config) => {
    const app = express();
    app.use(cors());
    app.use(express.static(config.path));
    app.listen(config.port, () => {
      console.log(`[${config.name}] URL - http://localhost:${config.port}/addon.json`);
    });
  });
