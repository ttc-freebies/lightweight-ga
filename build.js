//Load the library and specify options
const replace = require('replace-in-file');
const fsExtra = require('fs-extra');
const fs = require('fs');
const archiver = require("archiver");
const { execSync } = require('child_process');

const root = process.cwd();
const pkg = require('./package.json');
let scriptContent;

// Cleanup
fsExtra.removeSync(`${root}/dist`);
fsExtra.removeSync(`${root}/packages`);

// Make the dist Dir
fsExtra.mkdirSync(`${root}/dist`);
fsExtra.mkdirSync(`${root}/src`);
fsExtra.mkdirSync(`${root}/packages`);

// Download a fresh copy of the js
execSync('npx gist-fetch DavidKuennen minimal-analytics-snippet.js --out src/minimal-analytics-snippet.js');

// Copy the folers
fsExtra.copySync(`${root}/mod_perfectgridga`, `${root}/dist/mod_perfectgridga`);
fsExtra.copySync(`${root}/plg_perfectgridga`, `${root}/dist/plg_perfectgridga`);

// Run the rollup
execSync('npx rollup -c rollup.config.js');

if (fs.existsSync('dist/script.js')) {
  scriptContent = fs.readFileSync('dist/script.js', { encoding: 'utf8' });
  scriptContent = scriptContent.replace(/\r?\n|\r/g, '');
  scriptContent = `<<<JS
${scriptContent}
JS`
}

// Get date
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

// Do some replacing
const optionsXml = {
  files: [
    `${root}/dist/mod_perfectgridga/*.xml`,
    `${root}/dist/plg_perfectgridga/*.xml`
  ],
  from: [
    /{{copyright}}/g,
    /{{date}}/g,
    /{{version}}/g,
  ],
  to: [
    `(C) ${currentYear} Perfectgrid.io, All Rights Reserved.`,
    `${currentMonth}/${currentYear}`,
    `${pkg.version}`
  ],
};
const optionsPhp = {
  files: [
    `${root}/dist/mod_perfectgridga/*.php`,
    `${root}/dist/plg_perfectgridga/*.php`
  ],
  from: [
    /\<\?php/g,
  ],
  to: [
    `<?php
/**
 * @copyright   Copyright (C) ${currentYear} Dimitrios Grammatikogiannis. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */
`,
  ],
};

const optionsJs = {
  files: [
    `${root}/dist/mod_perfectgridga/*.php`,
    `${root}/dist/plg_perfectgridga/*.php`
  ],
  from: [
    '"###script-goes-here-###"',
  ],
  to: [
    `${scriptContent}`,
  ],
};

replace.sync(optionsXml);
replace.sync(optionsPhp);
replace.sync(optionsJs);

// Remove the source of the script
fsExtra.removeSync(`${root}/src`);

// Make the module
const archiveMod = archiver('zip', { zlib: { level: 9 } });
const streamMod = fs.createWriteStream(`${root}/packages/mod_perfectgridga_v${pkg.version}.zip`);

// Make the plugin
const archivePlg = archiver('zip', { zlib: { level: 9 } });
const streamPlg = fs.createWriteStream(`${root}/packages/plg_perfectgridga_v${pkg.version}.zip`);

Promise.all([
  new Promise((resolve, reject) => {
    archiveMod
      .directory(`${root}/dist/mod_perfectgridga`, false)
      .on('error', err => reject(err))
      .pipe(streamMod);

    streamMod.on('close', _ => resolve());
    archiveMod.finalize();
    if (!fsExtra.existsSync(`${root}/docs/packages`)) {
      fsExtra.mkdirSync(`${root}/docs/packages`);
    }

    fsExtra.copySync(`${root}/packages`, `${root}/docs/packages`);
  }),
  new Promise((resolve, reject) => {
    archivePlg
      .directory(`${root}/dist/plg_perfectgridga`, false)
      .on('error', err => reject(err))
      .pipe(streamPlg);

    streamPlg.on('close', _ => resolve());
    archivePlg.finalize();

  })
]).then(function () {
  if (!fsExtra.existsSync(`${root}/docs/packages`)) {
    fsExtra.mkdirSync(`${root}/docs/packages`);
  }

  fsExtra.copySync(`${root}/packages`, `${root}/docs/packages`);

  if (fsExtra.existsSync(`${root}/docs/quickstart.md`)) {
    fsExtra.unlinkSync(`${root}/docs/quickstart.md`)
  }

  const quickStartContent = fsExtra.readFileSync(`${root}/docs/quickstart.txt`, { encoding: 'utf8' })
  const qS = `
 - [Module](/packages/mod_perfectgridga_v${pkg.version}.zip ':ignore')
 - [Plugin](/packages/mod_perfectgridga_v${pkg.version}.zip ':ignore')

`
  fsExtra.writeFileSync(`${root}/docs/quickstart.md`, quickStartContent.replace('```downloads```', qS), { encoding: 'utf8' });

});
