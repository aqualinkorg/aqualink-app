module.exports = async () => {
  process.env.TZ = 'UTC';
  // Survey fixtures use this bucket; cloud file deletion is mocked by the tests.
  process.env.GCS_BUCKET = 'storage';
};
