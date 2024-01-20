const fs = require('fs');

fs.readdirSync('./plugins', { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent, index) => ({
    addon: require(`../plugins/${dirent.name}/addon.json`),
    directory: `plugins/${dirent.name}/`,
  }))
  .forEach((config) => {
    const fileName = `${config.addon.name}-${config.addon.version}.c3addon`;

    if (!fs.existsSync('dist/')) {
      fs.mkdirSync('dist/');
    }

    const output = fs.createWriteStream(`dist/${fileName}`, { flags: 'w' });

    const archiver = require('archiver')('zip', {
      zlib: { level: 9 },
    });

    output.on('error', () => {
      console.log(`[${fileName}] Build: Error`);
    });

    output.on('finish', () => {
      const kib = (archiver.pointer() / 1024).toPrecision(2);
      console.log(`[${fileName}] Build: Success (${kib} KiB)`);
    });

    archiver.pipe(output);

    archiver.directory(config.directory, false);

    archiver.finalize();
  });
