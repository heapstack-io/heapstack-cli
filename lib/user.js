const { Auth } = require("aws-amplify");

const homedir = require("os").homedir();
const mkdirp = require("mkdirp");
const fs = require("fs");

const { info, error, warn } = require("../utils/logger");

const config_dir = `${homedir}/.heapstackv2`;
const config_file = `config.json`;

module.exports.login = async (username, password) => {
  try {
    const user = await Auth.signIn(username, password);
    const json = JSON.stringify(user);
    mkdirp(config_dir, () => {
      fs.writeFile(
        `${config_dir}/${config_file}`,
        json,
        { flag: "w" },
        (err, result) => {
          if (err) {
            error(err);
          } else {
            console.log(`Success. You are now logged in as ${username}`);
          }
        }
      );
    });

    return user;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports.whoami = () => {
  fs.readFile(`${config_dir}/${config_file}`, (err, data) => {
    if (err) {
      warn(`Not logged in`);
    } else {
      const config = JSON.parse(data);
      info(`Logged in as ${config.username}`);
    }
  });
};

module.exports.checkFile = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${config_dir}/${config_file}`, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
};

module.exports.logout = async () => {
  try {
    await Auth.signOut();
    fs.unlink(`${config_dir}/${config_file}`, err => {
      if (err) {
        warn(`Not logged in`);
      } else {
        info(`Success. User logged out`);
      }
    });
  } catch (err) {
    console.log(err);
    return err;
  }
};
