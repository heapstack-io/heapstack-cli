const path = require("path");
const { regions } = require("./regions");

module.exports.auth = [
  {
    type: "input",
    name: "username",
    message: "Enter Heapstack Username: "
  },
  {
    type: "password",
    name: "password",
    message: "Enter Password: "
  }
];

module.exports.aws = [
  {
    type: "input",
    name: "accessKeyID",
    message: "AWS Access Key ID : "
  },
  {
    type: "input",
    name: "secretAccesskey",
    message: "AWS Secret Access Key : "
  },
  {
    type: "input",
    name: "region",
    message: "Default region name : "
  }
];

module.exports.websiteBucket = [
  {
    type: "input",
    name: "bucket",
    message: "Enter a unique DNS-compliant name for your new bucket: "
  },
  {
    type: "list",
    name: "region",
    message: "Select your AWS Region :",
    choices: regions
  }
];

module.exports.project_details = [
  {
    type: "input",
    name: "project_name",
    message: "Enter name of your project",
    default: () => {
      return path.basename(path.resolve());
    }
  }
];

module.exports.init = [
  {
    type: "list",
    name: "region",
    message: "Select your AWS Region :",
    choices: regions
  },
  {
    type: "list",
    name: "type",
    message: "What type of project you want to create? ",
    choices: [
      {
        name: "Frontend",
        value: "frontend"
      },
      {
        name: "Backend",
        value: "backend"
      }
    ]
  }
];

module.exports.select_backend = [
  {
    type: "list",
    name: "backend_type",
    message: "Choose a backend template: ",
    choices: [
      {
        name: "Basic `Hello World` template",
        value: "hello_world"
      },
      {
        name: "DynamoDB CRUD with backend apis",
        value: "dynamodb"
      },
      {
        name: "MongoDB CRUD with backend apis",
        value: "mongodb"
      }
    ]
  }
];
