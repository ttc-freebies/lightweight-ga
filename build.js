const {
  copy,
  copySync,
  removeSync,
  copyFileSync,
  unlinkSync,
  exists,
  existsSync,
  mkdir,
  mkdirSync,
  readFile,
  readFileSync,
  writeFile,
  writeFileSync,
} = require("fs-extra");
const { execSync } = require("child_process");
const replace = require("replace-in-file");
const util = require("util");
const rimRaf = util.promisify(require("rimraf"));
const pkg = require("./package.json");
const { version } = pkg;
const root = process.cwd();

(async function exec() {
  // Cleanup
  removeSync(`${root}/dist`);
  removeSync(`${root}/packages`);

  // Make the dist Dir
  mkdirSync(`${root}/dist`);
  mkdirSync(`${root}/src`);
  mkdirSync(`${root}/packages`);

  // Download a fresh copy of the js
  execSync(
    "node_modules/.bin/gist-fetch DavidKuennen minimal-analytics-snippet.js --out src/minimal-analytics-snippet.js"
  );

  await copy("./src", "./package");

  if (!(await exists("./dist"))) {
    await mkdir("./dist");
  }

  // Copy the folers
  copySync(`${root}/mod_perfectgridga`, `${root}/dist/mod_perfectgridga`);
  copySync(`${root}/plg_perfectgridga`, `${root}/dist/plg_perfectgridga`);

  // Run the rollup
  execSync("node_modules/.bin/rollup -c rollup.config.js");

  if (existsSync("dist/script.js")) {
    scriptContent = readFileSync("dist/script.js", {
      encoding: "utf8",
    });
    scriptContent = scriptContent.replace(/\r?\n|\r/g, "");
    scriptContent = `<<<JS
${scriptContent}
JS`;
  }

  // Get date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Do some replacing
  const optionsXml = {
    files: [
      `${root}/dist/mod_perfectgridga/*.xml`,
      `${root}/dist/plg_perfectgridga/*.xml`,
    ],
    from: [/{{copyright}}/g, /{{date}}/g, /{{version}}/g],
    to: [
      `(C) ${currentYear} Perfectgrid.io, All Rights Reserved.`,
      `${currentMonth}/${currentYear}`,
      `${pkg.version}`,
    ],
  };
  const optionsPhp = {
    files: [
      `${root}/dist/mod_perfectgridga/*.php`,
      `${root}/dist/plg_perfectgridga/*.php`,
    ],
    from: [/\<\?php/g],
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
      `${root}/dist/plg_perfectgridga/*.php`,
    ],
    from: ['"###script-goes-here-###"'],
    to: [`${scriptContent}`],
  };

  replace.sync(optionsXml);
  replace.sync(optionsPhp);
  replace.sync(optionsJs);

  // Remove the source of the script
  removeSync(`${root}/src`);

  // remove the update files, they belong to the server
  copyFileSync(
    `${root}/dist/plg_perfectgridga/update_plg.xml`,
    `${root}/docs/update_plg.xml`
  );
  copyFileSync(
    `${root}/dist/mod_perfectgridga/update_mod.xml`,
    `${root}/docs/update_mod.xml`
  );
  unlinkSync(`${root}/dist/plg_perfectgridga/update_plg.xml`);
  unlinkSync(`${root}/dist/mod_perfectgridga/update_mod.xml`);

  // Package it
  const zip = new (require("adm-zip"))();
  zip.addLocalFolder(`${root}/dist/mod_perfectgridga`, false);
  zip.writeZip(`packages/mod_perfectgridga_v${version}.zip`);

  zip.addLocalFolder(`${root}/dist/plg_perfectgridga`, false);
  zip.writeZip(`packages/plg_perfectgridga_v${version}.zip`);

  await rimRaf("./docs/pkgs");
  await copy("./packages", "./docs/pkgs");

  // Update the version, docs
  if (existsSync(`${root}/docs/quickstart.md`)) {
    unlinkSync(`${root}/docs/quickstart.md`);
  }

  const quickStartContent = readFileSync(`${root}/docs/quickstart.txt`, {
    encoding: "utf8",
  });
  const qS = `
 - [Module](/pkgs/mod_perfectgridga_v${pkg.version}.zip ':ignore')
 - [Plugin](/pkgs/plg_perfectgridga_v${pkg.version}.zip ':ignore')

`;

  writeFileSync(
    `${root}/docs/quickstart.md`,
    quickStartContent
      .replace("```downloads```", qS)
      .replace("```version```", `${pkg.version}`),
    { encoding: "utf8" }
  );

  const updPlg = {
    files: [`${root}/docs/update_plg.xml`],
    from: [
      "{{name}}",
      "{{version}}",
      "{{name}}",
      "{{filename}}",
      "{{codeName}}",
      "{{type}}",
      "{{folder}}",
      "{{client}}",
    ],
    to: [
      `PerfectGrid Google Analytics Lightweight Plugin`,
      pkg.version,
      `PerfectGrid Google Analytics Lightweight Plugin`,
      `plg_perfectgridga_v${pkg.version}.zip`,
      "perfectgridga",
      "plugin",
      "system",
      "0",
    ],
  };

  const updMod = {
    files: [`${root}/docs/update_mod.xml`],
    from: [
      "{{name}}",
      "{{version}}",
      "{{name}}",
      "{{filename}}",
      "{{codeName}}",
      "{{type}}",
      "{{folder}}",
      "{{client}}",
    ],
    to: [
      `PerfectGrid Google Analytics Lightweight Module`,
      pkg.version,
      `PerfectGrid Google Analytics Lightweight Module`,
      `mod_perfectgridga_v${pkg.version}.zip`,
      "perfectgridga",
      "module",
      "",
      "0",
    ],
  };

  replace.sync(updPlg);
  replace.sync(updMod);
})();
