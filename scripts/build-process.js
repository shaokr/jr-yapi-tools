/* eslint-disable @typescript-eslint/no-unsafe-argument */
const fs = require('fs-extra');
const glob = require('glob');
const fp = require('lodash/fp');
const path = require('path');
const AdmZip = require('adm-zip');
const archiver = require('archiver');
const exec = require('child_process').exec;

const packageJson = require('../package.json');

const name = packageJson.name;
const yapiYoolsPubilc = path.join(__dirname, `../dist`); // 编译后的项目地址
// manifest 文件生成
fs.outputJsonSync(path.join(yapiYoolsPubilc, 'manifest.json'), {
  manifest_version: 3,
  name,
  description: 'yapi用工具',
  version: packageJson.version,
  icons: {
    "128": "favicon.png"
  },
  content_scripts: [
    {
      "matches": ["http://yapi.itcjf.com/*"],
      "css": ["style.css"],
      "js": [
        "lib/json5.min.js",
        "lib/lodash.min.js",
        "lib/react.production.min.js",
        "lib/react-dom.production.min.js",
        "yapi-tools.js"
      ]
    }
  ]
});
const zip = new AdmZip();
zip.addLocalFolder(yapiYoolsPubilc);
zip.writeZip(`./packages/${name}-${packageJson.version}.zip`);
