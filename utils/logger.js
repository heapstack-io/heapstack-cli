const chalk = require("chalk");
const date = require("date-and-time");

const homedir = require("os").homedir();
const fs = require("fs");
const mkdirp = require("mkdirp");
const log_dir = `${homedir}/.heapstackv2/logs`;

const info_color = chalk.green;
const error_color = chalk.bold.red;
const warning_color = chalk.keyword("orange");

module.exports.info = msg => {
  let now = new Date();
  let ts = date.format(now, "DD-MM-YYYY HH:mm:ss");
  let m = info_color(`Heapstack: ${msg}`);
  console.log(`[${ts}] ${m}`);
  mkdirp(log_dir, () => {
    fs.appendFile(
      `${log_dir}/heapstack.log`,
      `[${ts}] [INFO] Heapstack: ${msg}\n`,
      "utf8",
      () => {}
    );
  });
};

module.exports.error = msg => {
  let now = new Date();
  let ts = date.format(now, "DD-MM-YYYY HH:mm:ss");
  let m = error_color(`Heapstack: ${msg}`);
  console.log(`[${ts}] ${m}`);
  mkdirp(log_dir, () => {
    fs.appendFile(
      `${log_dir}/heapstack.log`,
      `[${ts}] [ERROR] Heapstack: ${msg}\n`,
      "utf8",
      () => {}
    );
  });
};

module.exports.warn = msg => {
  let now = new Date();
  let ts = date.format(now, "DD-MM-YYYY HH:mm:ss");
  let m = warning_color(`Heapstack: ${msg}`);
  console.log(`[${ts}] ${m}`);
  mkdirp(log_dir, () => {
    fs.appendFile(
      `${log_dir}/heapstack.log`,
      `[${ts}] [WARN] Heapstack: ${msg}\n`,
      "utf8",
      () => {}
    );
  });
};
