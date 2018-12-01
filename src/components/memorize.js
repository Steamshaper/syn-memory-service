const Minio = require('minio');
const fs = require('fs');

// Instantiate the minio client with the endpoint
// and access keys as shown below.
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'accessKEY',
  secretKey: 'secretKEY',
});

const createBucketIfNeeded = async (name, { createOnMiss = false }) => {
  if (createOnMiss) {
    const bucketExists = await minioClient.bucketExists(name);
    if (!bucketExists) {
      await minioClient.makeBucket(name, 'us-east-1');
      console.log(`Bucket created: ${name}`);
      return;
    }
  }
};

const DEDAULT_BUCKET = 'root-bkt';
const record = async ({ path, originalname, filename, mimetype, size }) => {
  // File that needs to be uploaded.
  // Make a bucket called europetrip.

  await createBucketIfNeeded(DEDAULT_BUCKET, { createOnMiss: true });
  const metaData = {
    'Content-Type': 'application/octet-stream',
    'X-Amz-Meta-Testing': filename,
    mimetype,
    size,
  };
  // Using fPutObject API upload your file to the bucket europetrip.
  const putResponse = await minioClient.fPutObject(
    DEDAULT_BUCKET,
    filename,
    path,
    metaData
  );

  fs.unlink(path, err => {
    if (err) {
      console.log(`Unable to delete ${path}`, err);
    }
    console.log(`Deleted temp file: ${filename} - ${path}`);
  });

  return { putResponse, filename };
};

const del = filename => {
  return minioClient.removeObject(DEDAULT_BUCKET, filename);
};

const search = async (query, opts) => ({
  query,
  memories: [],
});
module.exports.record = record;
module.exports.del = del;
module.exports.search = search;
