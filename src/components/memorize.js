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

const getBucket = async (name, { createOnMiss = false }) => {
  if (createOnMiss) {
    const bucketExists = await minioClient.bucketExists(name);
    if (!bucketExists) {
      await minioClient.makeBucket(name, 'us-east-1');
      console.log(`Bucket created: ${name}`);
      return;
    }
  }
};

const record = async (req, res, next) => {
  // File that needs to be uploaded.
  // Make a bucket called europetrip.

  const { path, originalname, filename, fieldname, mimetype, size } = req.file;
  await getBucket('root-bkt', { createOnMiss: true });
  const metaData = {
    'Content-Type': 'application/octet-stream',
    'X-Amz-Meta-Testing': filename,
    mimetype,
    size,
  };
  // Using fPutObject API upload your file to the bucket europetrip.
  const putResponse = await minioClient.fPutObject(
    'root-bkt',
    originalname,
    path,
    metaData
  );

  fs.unlink(path, err => {
    if (err) {
      console.log(`Unable to delete ${path}`, err);
    }
    console.log(`Deleted: ${path}`);
  });

  return;
};
const search = async (query, opts) => ({
  query,
  memories: [],
});
module.exports.record = record;
module.exports.search = search;
