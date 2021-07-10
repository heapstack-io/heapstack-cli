const AWS = require("aws-sdk");
if (!AWS.config.region) {
  AWS.config.update({
    region: "ap-south-1"
  });
}

const apig = new AWS.APIGateway({ apiVersion: "2015/07/09" });
const { info, error, warn } = require("../utils/logger");

const createRestApi = name => {
  const params = {
    name: `${name}_api`,
    binaryMediaTypes: ["*"],
    cloneFrom: null,
    apiKeySource: null,
    description: `Rest API for lambda ${name}`,
    endpointConfiguration: {
      types: ["EDGE"]
    },
    minimumCompressionSize: 0,
    version: "1.0.0"
  };
  info(`Creating endpoints...`);
  return apig.createRestApi(params).promise();
};

const getAPIResource = id => {
  const params = {
    restApiId: id
  };
  info(`Getting resource...`);
  return apig.getResources(params).promise();
};

const addMethod = (id, resourceId) => {
  const params = {
    restApiId: id,
    resourceId: resourceId,
    httpMethod: "GET",
    authorizationType: "NONE"
  };
  info(`Adding GET "/" method...`);
  return apig.putMethod(params).promise();
};

const addMethodResponse = (id, resourceId) => {
  const params = {
    restApiId: id,
    resourceId: resourceId,
    httpMethod: "GET",
    statusCode: "200"
  };
  return apig.putMethodResponse(params).promise();
};

const getLambdaARN = function_name => {
  const lambda = new AWS.Lambda({ apiVersion: "2015-03-31" });
  const params = {
    FunctionName: function_name
  };

  return lambda.getFunction(params).promise();
};
const addLambda = (id, resourceId, arn) => {
  const uri = `arn:aws:apigateway:${
    AWS.config.region
  }:lambda:path/2015-03-31/functions/${arn}/invocations`;

  const params = {
    restApiId: id,
    resourceId: resourceId,
    httpMethod: "GET",
    type: "AWS",
    integrationHttpMethod: "POST",
    uri: uri
  };
  info(`Adding lambda...`);
  return apig.putIntegration(params).promise();
};

const addLambdaResponse = (id, resourceId) => {
  const params = {
    restApiId: id,
    resourceId: resourceId,
    httpMethod: "GET",
    statusCode: "200",
    selectionPattern: ""
  };
  return apig.putIntegrationResponse(params).promise();
};

const deployAPI = (id, stage_name, function_name) => {
  const params = {
    restApiId: id,
    stageName: stage_name,
    stageDescription: `${stage_name} environment`,
    description: `Deplyment for lambda ${function_name} in ${stage_name} environment using Heapstack`
  };
  info(`Deploying api on [${stage_name}] ...`);
  return apig.createDeployment(params).promise();
};

module.exports.createEndPoints = async (function_name, stage) => {
  try {
    let createApiResponse = await createRestApi(function_name);
    const { id } = createApiResponse;
    let apiresource = await getAPIResource(id);
    const resourceId = apiresource.items[0].id;
    await addMethod(id, resourceId);
    await addMethodResponse(id, resourceId);
    const lambda = await getLambdaARN(function_name);
    const {
      Configuration: { FunctionArn }
    } = lambda;

    await addLambda(id, resourceId, FunctionArn);
    await addLambdaResponse(id, resourceId);
    await deployAPI(id, stage, function_name);
    info(
      `Invoke URL: \n\thttps://${id}.execute-api.${
        AWS.config.region
      }.amazonaws.com/${stage}`
    );
  } catch (err) {
    error(err.message);
    return;
  }
};
