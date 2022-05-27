import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 3 });

export default axios;
