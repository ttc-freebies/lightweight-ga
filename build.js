//Load the library and specify options
const replace = require('replace-in-file');
const fsExtra = require('fs-extra');
const fs = require('fs');
const archiver = require("archiver");
const { execSync } = require('child_process');

const root = process.cwd();
const pkg = require('./package.json');
let scriptContent;
let content;

// Cleanup
fsExtra.removeSync(`${root}/dist`);
fsExtra.removeSync(`${root}/packages`);

// Make the dist Dir
fsExtra.mkdirSync(`${root}/dist`);
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

if (fs.existsSync('dist/mod_perfectgridga/mod_perfectgridga.php') && scriptContent) {
  content = fs.readFileSync('dist/mod_perfectgridga/mod_perfectgridga.php', { encoding: 'utf8' });
  content = content.replace('"###script-goes-here-###"', `${scriptContent}`);
  fs.writeFileSync('dist/mod_perfectgridga/mod_perfectgridga.php', content, { encoding: 'utf8' });
  content = '';
}

if (fs.existsSync('dist/plg_perfectgridga/perfectgridga.php') && scriptContent) {
  content = fs.readFileSync('dist/plg_perfectgridga/perfectgridga.php', { encoding: 'utf8' });
  content = content.replace('"###script-goes-here-###"', `${scriptContent}`);
  fs.writeFileSync('dist/plg_perfectgridga/perfectgridga.php', content, { encoding: 'utf8' });

  fsExtra.removeSync(`${root}/src`);
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

replace.sync(optionsXml);
replace.sync(optionsPhp);

// Make the module
const archiveMod = archiver('zip', { zlib: { level: 9 } });
const streamMod = fs.createWriteStream(`${root}/packages/mod_perfectgridga_v${pkg.version}.zip`);

new Promise((resolve, reject) => {
  archiveMod
    .directory(`${root}/dist/mod_perfectgridga`, false)
    .on('error', err => reject(err))
    .pipe(streamMod);

  streamMod.on('close', _ => resolve());
  archiveMod.finalize();
});

// Make the plugin
const archivePlg = archiver('zip', { zlib: { level: 9 } });
const streamPlg = fs.createWriteStream(`${root}/packages/plg_perfectgridga_v${pkg.version}.zip`);

new Promise((resolve, reject) => {
  archivePlg
    .directory(`${root}/dist/plg_perfectgridga`, false)
    .on('error', err => reject(err))
    .pipe(streamPlg);

  streamPlg.on('close', _ => resolve());
  archivePlg.finalize();
});
