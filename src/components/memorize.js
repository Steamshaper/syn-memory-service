const Minio = require('minio');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

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

const readMetadata = async (bucket, filename) => {
  const filestats = await minioClient.statObject(bucket, filename);
  return filestats;
};

const DEDAULT_BUCKET = 'root-bkt';

exports.load = async ({ filename }) => {
  const tempFilePath = `temp/${filename}`;
  try {
    const { metaData } = await readMetadata(DEDAULT_BUCKET, filename);
    console.log(metaData);
    await minioClient.fGetObject(DEDAULT_BUCKET, filename, tempFilePath);
    const file = await readFile(tempFilePath);
    return { metaData, file };
  } catch (err) {
    return err;
  }
};

exports.record = async ({ path, originalname, filename, mimetype, size }) => {
  // File that needs to be uploaded.
  // Make a bucket called europetrip.

  await createBucketIfNeeded(DEDAULT_BUCKET, { createOnMiss: true });
  const metaData = {
    'Content-Type': mimetype,
    'X-Amz-Meta-Testing': filename,
    size,
    filename: originalname,
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

exports.del = async filename => {
  return await minioClient.removeObject(DEDAULT_BUCKET, filename);
};

exports.list = async ({ bucket = DEDAULT_BUCKET } = {}) => {
  let i = 0;
  minioClient.listObjectsV2(bucket).on('data', item => {
    console.log(`#${i++}`, item);
  });
};
exports.search = async (query, opts) => ({
  query,
  memories: [],
});
