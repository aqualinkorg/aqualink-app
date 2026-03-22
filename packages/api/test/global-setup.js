module.exports = async () => {
  process.env.TZ = 'UTC';
  process.env.BACKEND_BASE_URL =
    process.env.BACKEND_BASE_URL || 'http://localhost:3000';
};
