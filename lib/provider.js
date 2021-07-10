const homedir = require("os").homedir();
const fs = require("fs");

const config_dir = `${homedir}/.heapstack`;
const config_file = `config.json`;

const { info, error, warn } = require("../utils/logger");

module.exports.configAWS = (accessKeyID, secretAccesskey, region) => {
  const aws_credentials = `${homedir}/.aws/credentials`;
  fs.readFile(`${config_dir}/${config_file}`, (err, data) => {
    if (err) {
      warn(
        `\nNot logged in.\n\nPlease login to Heapstack using: heapstack login`
      );
    } else {
      let credentials = `[default]
aws_access_key_id = ${accessKeyID}
aws_secret_access_key = ${secretAccesskey}
aws_region = ${region}\n`;

      fs.writeFile(`${aws_credentials}`, credentials, (err, data) => {
        if (err) {
          error(`Error writing aws provider credentials`);
        } else {
          info(`AWS provider credentials saved`);
        }
      });
    }
  });
};
