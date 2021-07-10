const AWS = require("aws-sdk");
const { info, error, warn } = require("../utils/logger");
const policyjson = require("../config/lambda_policy.json");
const rolejson = require("../config/lambda_role.json");

const iam = new AWS.IAM({ apiVersion: "2010-05-08" });

const createRole = name => {
  const params = {
    AssumeRolePolicyDocument: JSON.stringify(rolejson),
    Path: "/",
    RoleName: `${name}_role`
  };
  info(`Creating role...`);
  return iam.createRole(params).promise();
};

const createPolicy = name => {
  const params = {
    PolicyDocument: JSON.stringify(policyjson),
    PolicyName: `${name}_policy`,
    Description:
      "Minimum privileges needed to use Heapstack to manage your Lambda functions."
  };
  info(`Creating policy...`);
  return iam.createPolicy(params).promise();
};

const attachRolePolicy = (policy, rolename) => {
  let policyarn;
  if (policy.hasOwnProperty("Policy")) {
    policyarn = policy.Policy.Arn;
  } else {
    policyarn = policy.Arn;
  }

  const params = {
    PolicyArn: policyarn,
    RoleName: rolename
  };
  info(`Attaching policy to role...`);
  return iam.attachRolePolicy(params).promise();
};

const saveRole = (project, role) => {
  const mkdirp = require("mkdirp");
  const fs = require("fs");
  const local_config_dir = "./.heapstack/";

  const data = {
    project: project,
    id: role.RoleId,
    name: role.RoleName,
    arn: role.Arn
  };

  return new Promise((resolve, reject) => {
    mkdirp(local_config_dir, () => {
      fs.writeFile(
        `${local_config_dir}/config.json`,
        JSON.stringify(data),
        error => {
          if (error) reject(error);
          resolve();
        }
      );
    });
  });
};

const createDefaultFunction = () => {
  const f = `exports.handler = async event => {
    const response = {
      statusCode: 200,
      body: JSON.stringify("Hello from Heapstack!")
    };
    return response;
  };`;
  info(`Create function template ...`);
  return new Promise((resolve, reject) => {
    const mkdirp = require("mkdirp");
    const fs = require("fs");
    const local_function_dir = "./functions/";
    mkdirp(local_function_dir, () => {
      fs.writeFile(`${local_function_dir}/index.js`, f, error => {
        if (error) reject(error);
        resolve();
      });
    });
  });
};

const getExistingRole = name => {
  const params = {
    RoleName: name
  };
  return iam.getRole(params).promise();
};

const listExistingPolicies = policyname => {
  const params = {
    Scope: "Local"
  };

  return iam.listPolicies(params).promise();
};

module.exports.createIAMRecord = async name => {
  let role = null,
    policy = null;
  try {
    role = await createRole(name);
  } catch (err) {
    if (err.code === `EntityAlreadyExists`) {
      info(`Role already exists. Skipping...`);
      try {
        role = await getExistingRole(`${name}_role`);
      } catch (err) {
        error(err.message);
        return;
      }
    } else {
      error(err.message);
      return;
    }
  }

  try {
    policy = await createPolicy(name);
  } catch (error) {
    if (error.code === `EntityAlreadyExists`) {
      info(`Policy already exists. Skipping...`);
      const { Policies } = await listExistingPolicies(`${name}_policy`);
      policy = Policies.filter(p => p.PolicyName === `${name}_policy`)[0];
    } else {
      error(error.message);
      return;
    }
  }

  try {
    await attachRolePolicy(policy, role.Role.RoleName);
  } catch (error) {
    warn(error.message);
  }

  try {
    await saveRole(name, role.Role);
    await createDefaultFunction();
    info(`IAM role created: \n\t${role.Role.RoleName}\n\t${role.Role.Arn}`);
    if (policy.hasOwnProperty("Policy")) {
      info(
        `IAM policy created: \n\t${policy.Policy.PolicyName}\n\t${policy.Policy.Arn}\n\n`
      );
    } else {
      info(`IAM policy created: \n\t${policy.PolicyName}\n\t${policy.Arn}\n\n`);
    }

    info(`Edit functions/index.js and write your lambda.\n`);
  } catch (error) {
    warn(error.message);
  }
};
