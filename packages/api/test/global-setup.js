module.exports = async () => {
  process.env.TZ = 'UTC';
  process.env.BACKEND_BASE_URL =
    process.env.BACKEND_BASE_URL || 'http://localhost:8080';
  process.env.STORAGE_MAX_FILE_SIZE_MB =
    process.env.STORAGE_MAX_FILE_SIZE_MB || '25';
  process.env.GCS_BUCKET = process.env.GCS_BUCKET || 'storage';
};
