const Minio = require('minio');

// Instantiate the minio client with the endpoint
// and access keys as shown below.
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'accessKEY',
  secretKey: 'secretKEY',
});

const record = async (file, opts) => {
  // File that needs to be uploaded.
  // Make a bucket called europetrip.
  minioClient.makeBucket('europetrip', 'us-east-1', function(err) {
    if (err) return console.log(err);

    console.log('Bucket created successfully in "us-east-1".');

    var metaData = {
      'Content-Type': 'application/octet-stream',
      'X-Amz-Meta-Testing': 1234,
      example: 5678,
    };
    // Using fPutObject API upload your file to the bucket europetrip.
    minioClient.fPutObject(
      'europetrip',
      'photos-europe.tar',
      file,
      metaData,
      function(err, etag) {
        if (err) return console.log(err);
        console.log('File uploaded successfully.');
      }
    );
  });
};

const search = async (query, opts) => ({
  query,
  memories: [],
});
module.exports.record = record;
module.exports.search = search;
