#!/usr/bin/env node
"use strict";
global.fetch = require("node-fetch");
const program = require("commander");
const { prompt } = require("inquirer");
const pkg = require("./package.json");
const Amplify = require("aws-amplify");

const {
  login,
  whoami,
  logout,
  checkFile,
  currentSession
} = require("./lib/user");
const { configAWS } = require("./lib/provider");
const { createIAMRecord } = require("./lib/iam");
const { deployLambda, updateLambda } = require("./lib/lambda");
const { createEndPoints } = require("./lib/apigateway");
const { hostWebsite, validate, deployWebsite } = require("./lib/website");
const { info, error, warn } = require("./utils/logger");
const {
  auth,
  aws,
  project_details,
  websiteBucket,
  init,
  select_backend
} = require("./utils/questions");

const config = require("./config/auth_config.json");
Amplify.default.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID
  }
});

// version
program
  .version(pkg.version, "-v, --version")
  .description("Heapstack command line tool");

// login
program
  .command("login")
  .alias("signin")
  .description("Login to Heapstack CLI")
  .action(() => {
    prompt(auth).then(answers => login(answers.username, answers.password));
  });

// check loggedin user
program
  .command("whoami")
  .alias("who")
  .description("Check logged in user")
  .action(() => {
    whoami();
  });

// logout
program
  .command("logout")
  .alias("signout")
  .description("Logout user")
  .action(() => {
    logout();
  });

// configure aws provider
program
  .command("configure:aws")
  .description("Configure AWS Credentials")
  .action(() => {
    if (checkFile) {
      prompt(aws).then(answers => {
        configAWS(answers.accessKeyID, answers.secretAccesskey, answers.region);
      });
    } else {
      error(`Please login to continue.`);
    }
  });

// create or init a new project
program
  .command("init <project>")
  .alias("i")
  .description("Create a new heapstack project")
  .option("-p", "--path", "Path for project directory")
  .action(project => {
    checkFile()
      .then(() =>
        prompt(init).then(answers => {
          console.log(answers);
          const { region, type } = answers;

          if (type === "backend") {
            prompt(select_backend).then(backend => {
              const { backend_type } = backend;
              console.log(project, type, region, backend_type);

              // create from selected backend template
              if (type === "hello_world") {
                // create local project directory in path provided.
                // prompt user to perform next steps (edit and deploy)
              }
              // createIAMRecord(project);
            });
          } else {
            console.log(project, type, region);
            // create from website template
            hostWebsite(project);
          }
        })
      )
      .catch(() => error(`Please login to continue.`));
  });

// create and deploy lambda
program
  .command("deploy:aws")
  .alias("deploy")
  .description("Deploy lambda function")
  .action(() => {
    checkFile()
      .then(() => deployLambda())
      .catch(() => error(`Please login to continue.`));
  });

// update lambda
program
  .command("update:aws <function_name>")
  .alias("update")
  .description("Update an existing lambda function")
  .action(function_name => {
    checkFile()
      .then(() => updateLambda(function_name))
      .catch(() => error(`Please login to continue.`));
  });

// create api gateway endpoints
program
  .command("trigger:aws <function_name> <stage>")
  .alias("trigger")
  .description("Add API Gateway trigger for lambda")
  .action((function_name, stage) => {
    checkFile()
      .then(() => createEndPoints(function_name, stage))
      .catch(() => error(`Please login to continue.`));
  });

// create a static website
program
  .command("website <project_name>")
  .alias("w")
  .description("Host a serverless website")
  .option("-p", "--path", "Path for project directory")
  .action(project_name => {
    checkFile()
      .then(() => hostWebsite(project_name))
      .catch(() => error(`Please login to continue.`));
  });

// host a static website
program
  .command("host <project>")
  .alias("h")
  .description("Deploy a serverless website")
  .option("-p", "--path", "Path for project directory")
  .action(project => {
    checkFile()
      .then(() =>
        prompt(websiteBucket).then(({ bucket, region }) => {
          deployWebsite(project, bucket, region);
        })
      )
      .catch(() => error(`Please login to continue.`));
  });

program.parse(process.argv);
