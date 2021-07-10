const AWS = require("aws-sdk");
const { info, error, warn } = require("../utils/logger");
const websitePolicy = require("../config/s3-website-policy.json");

module.exports.putBucketWebsite = (name, region) => {
  if (!AWS.config.region) {
    AWS.config.update({
      region: region
    });
  }
  info(`Configuring website bucket...`);
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  // Create JSON for putBucketWebsite parameters
  let staticHostParams = {
    Bucket: name,
    WebsiteConfiguration: {
      ErrorDocument: {
        Key: "index.html"
      },
      IndexDocument: {
        Suffix: "index.html"
      }
    }
  };

  return s3.putBucketWebsite(staticHostParams).promise();
};

module.exports.createBucket = (name, region) => {
  if (!AWS.config.region) {
    AWS.config.update({
      region: region
    });
  }

  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  let bucketParams = {
    Bucket: name,
    ACL: "public-read"
  };

  info(`Creating website bucket...`);
  // call S3 to create the bucket
  return s3.createBucket(bucketParams).promise();
};

module.exports.putObject = (
  region,
  buffer,
  fileName,
  contentType,
  bucket_name
) => {
  if (!AWS.config.region) {
    AWS.config.update({
      region: region
    });
  }
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  let params = {
    Body: buffer,
    Key: fileName,
    Bucket: bucket_name,
    ContentType: contentType
  };
  return s3.putObject(params).promise();
};

module.exports.checkIfBucketExists = bucket => {
  info(`Checking for any exsting bucket with name ${bucket}`);
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  let params = {
    Bucket: bucket
  };

  return s3.headBucket(params).promise();
};

module.exports.getBucketAcl = bucket => {
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  let params = {
    Bucket: bucket
  };

  info(`Checking permissions for ${bucket}`);
  return s3.getBucketAcl(params).promise();
};

module.exports.attachBucketPolicy = name => {
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  const arn = `arn:aws:s3:::${name}/*`;
  let policy = websitePolicy;
  policy.Statement[0].Resource = arn;

  let params = {
    Bucket: name,
    Policy: JSON.stringify(policy)
  };
  info(`Attaching policy ${JSON.stringify(policy)}`);
  return s3.putBucketPolicy(params).promise();
};
