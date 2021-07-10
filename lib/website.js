const { info, error, warn } = require("../utils/logger");
const {
  checkIfBucketExists,
  getBucketAcl,
  createBucket,
  attachBucketPolicy,
  putBucketWebsite,
  putObject
} = require("./s3");

module.exports.hostWebsite = project_name => {
  // const { project_name } = project_name;
  info(project_name);

  // create folder, copy static website template
  getStaticWebsiteTemplate(project_name, (err, res) => {
    if (err) {
      warn(JSON.stringify(err));
    } else {
      info(res.filepath);
    }
  });
};

module.exports.validate = (name, param) => {
  if (name === "" || name === undefined || name === null) {
    error(`${param} can't be blank`);
    return;
  } else {
    return true;
  }
};

module.exports.deployWebsite = (project, name, region) => {
  const fs = require("fs");
  try {
    buildWebsite(project, async (err, buildpath) => {
      if (err) {
        return warn(JSON.stringify(err));
      } else {
        try {
          await checkIfBucketExists(name);
          try {
            await getBucketAcl(name);
          } catch (e) {
            return warn(`Error getting bucket ACL: ${e}`);
          }
        } catch (error) {
          // Bucket name is unique, go ahead and create new bucket
          if (error.statusCode === 404) {
            info(`Creating bucket ${name}`);
            await createBucket(name, region);
          } else {
            if (error.statusCode === 403) {
              // Bucket exists with name. Return
              return warn(`Bucket already exists with name : ${name}`);
            }
            // Some other exception
            return warn(`Error checking for existing bucket: ${error}`);
          }
        }
        try {
          await attachBucketPolicy(name);
          fs.readdir(buildpath, (error, files) => {
            if (error)
              return warn(`Unable to scan directory ${buildpath}: ${error}`);
            else {
              files.map(async file => {
                let fileBuffer = fs.readFileSync(buildpath + file);
                let contentType = getContentType(file);
                info(`Uploading ${file}`);
                try {
                  await putObject(region, fileBuffer, file, contentType, name);
                } catch (err) {
                  warn(`putObject ${err}`);
                }
              });
            }
          });
        } catch (exe) {
          return warn(`Error attaching bucket policy: ${error}`);
        }

        try {
          await putBucketWebsite(name, region);
          return info(
            `Wesite URL : http://${name}.s3-website.${region}.amazonaws.com`
          );
        } catch (e) {
          return warn(`putBucketWebsite ${e}`);
        }
      }
    });
  } catch (error) {
    return warn(error);
  }
};

const getStaticWebsiteTemplate = (project, cb) => {
  info(`Creating project code ${project}  ...`);
  const path = require("path");
  const mkdirp = require("mkdirp");
  const fs = require("fs-extra");
  const { exec } = require("child_process");

  const template_path_dir = path.join(
    __dirname,
    `../templates/frontend/heapstack-static-website/`
  ); // COPY FROM

  const local_project_dir = `${project}`; // COPY TO
  mkdirp(local_project_dir, () => {
    fs.copy(template_path_dir, local_project_dir, err => {
      if (err) return cb(err, null);
      // change directory to template_path_dir and run `yarn`
      const cmd = `cd ${local_project_dir} && yarn`;
      exec(cmd, (err, res) => {
        if (err)
          return cb(err, { filepath: `${local_project_dir}/src/App.js` });
        else
          return cb(null, {
            filepath: `\ncd ${local_project_dir}/ and run \`yarn start\` \n Edit and Run \`heapstack host\` when done \n`
          });
      });
    });
  });
};

const buildWebsite = (project, cb) => {
  info(`Building website ...`);
  const fs = require("fs");
  const homedir = require("os").homedir();
  const { exec } = require("child_process");

  // const workspace = `${homedir}/heapstack`;
  const local_project_dir = `${project}`;

  if (fs.existsSync(local_project_dir)) {
    const cmd = `cd ${local_project_dir} && yarn build`;
    exec(cmd, (err, res) => {
      if (err) {
        warn(`Error building website ${local_project_dir}/`);
        return cb(err, `Error building website ${local_project_dir}/`);
      } else {
        info(`Successfully build website ${local_project_dir}/`);
        return cb(null, `${local_project_dir}/build/`);
      }
    });
  } else {
    // warn(`Project dosn't exists in workspace ${local_project_dir}/`);
    return cb(`Project dosn't exists at path ${local_project_dir}/`, null);
  }
};

const getContentType = file => {
  const mime = require("mime-types");
  return mime.lookup(file);
};
