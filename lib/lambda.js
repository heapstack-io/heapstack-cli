const AWS = require("aws-sdk");
if (!AWS.config.region) {
  AWS.config.update({
    region: "ap-south-1"
  });
}
const { info, error, warn } = require("../utils/logger");

const lambda = new AWS.Lambda({ apiVersion: "2015-03-31" });

const cleanup = file => {
  const fs = require("fs");
  return new Promise((resolve, reject) => {
    fs.unlink(file, err => {
      if (err) {
        warn(`Already cleaned...`);
      } else {
        info(`Cleaning tmp files...`);
        resolve();
      }
    });
  });
};

const createLambda = config => {
  const AdmZip = require("adm-zip");
  let zip = new AdmZip();

  info(`Packing...`);
  zip.addLocalFile("./functions/index.js");
  zip.writeZip("./functions/handler.zip");

  const fs = require("fs");
  const code = fs.readFileSync("./functions/handler.zip");
  const lambda_params = {
    Code: {
      ZipFile: code
    },
    Description: `${config.project} function deployed using heapstack`,
    FunctionName: config.project,
    Handler: "index.handler",
    MemorySize: 128,
    Publish: true,
    Role: config.arn,
    Runtime: "nodejs10.x",
    Timeout: 15,
    VpcConfig: {}
  };
  info(`Deploying function: ${config.project}...`);
  return lambda.createFunction(lambda_params).promise();
};

const addPermission = (name, trigger) => {
  //apigateway.amazonaws.com config.project
  const permission_params = {
    Action: `lambda:InvokeFunction` /* required */,
    FunctionName: `${name}` /* required */,
    Principal: `${trigger}` /* required */,
    StatementId: `${name}_invoke_sid` /* required */
  };

  return lambda.addPermission(permission_params).promise();
};

const update = name => {
  const AdmZip = require("adm-zip");
  let zip = new AdmZip();

  info(`Packing...`);
  zip.addLocalFile("./functions/index.js");
  zip.writeZip("./functions/handler.zip");

  const fs = require("fs");

  const code = fs.readFileSync("./functions/handler.zip");

  const update_params = {
    FunctionName: name,
    Publish: true,
    ZipFile: code
  };
  info(`Updating function:${name}`);
  return lambda.updateFunctionCode(update_params).promise();
};

module.exports.deployLambda = () => {
  let config = require("../.heapstack/config.json");

  createLambda(config)
    .then(data => {
      addPermission(config.project, `apigateway.amazonaws.com`).then(() => {
        cleanup(`./functions/handler.zip`).then(() => {
          info(
            `Successfully deployed function:${
              config.project
            }\n\tarn: ${JSON.stringify(data.FunctionArn)}`
          );
        });
      });
    })
    .catch(err => {
      warn(err.message);
      if (err.code === "ResourceConflictException") {
        warn(err.message);
        return;
      }
    });
};

module.exports.updateLambda = name => {
  let config = require("../.heapstack/config.json");
  update(config.project)
    .then(data => {
      cleanup(`./functions/handler.zip`).then(() => {
        info(
          `Successfully updated function:${name}\n\tarn: ${JSON.stringify(
            data.FunctionArn
          )}`
        );
      });
    })
    .catch(err => {
      error(err.message);
      return;
    });
};
