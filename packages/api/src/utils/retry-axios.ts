import axios from 'axios';
import axiosRetry from 'axios-retry';

// Force HTTP adapter in Node.js to ensure consistent behavior
// This prevents axios from using the fetch adapter which can cause
// different response handling in Node.js 20+ environments
// Using getAdapter('http') ensures we use Node's http/https modules
const axiosInstance = axios.create({
  adapter: axios.getAdapter('http'),
});

axiosRetry(axiosInstance, { retries: 3 });

export default axiosInstance;
