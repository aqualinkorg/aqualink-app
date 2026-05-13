module.exports = async () => {
  process.env.TZ = 'UTC';
  // Provide defaults for env vars that are unavailable in fork CI
  if (!process.env.BACKEND_BASE_URL) {
    process.env.BACKEND_BASE_URL = 'http://localhost:3000';
  }
  if (!process.env.SOFAR_API_TOKEN) {
    process.env.SOFAR_API_TOKEN = '';
  }
};
