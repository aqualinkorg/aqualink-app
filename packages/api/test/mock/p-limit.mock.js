/**
 * Mock for p-limit ES module
 * p-limit creates a concurrency limiter function
 * This mock simply executes functions without concurrency limiting for tests
 */
function pLimit(_concurrency) {
  return async (fn) => {
    return fn();
  };
}

module.exports = pLimit;

