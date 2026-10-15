#!/usr/bin/env node
/* Run: `yarn run audit` from repo root (plain `yarn audit` is Yarn's built-in). */

const { spawnSync } = require('node:child_process');

// Advisories whose impact does not apply to this codebase and which cannot
// currently be fixed compatibly. Each entry must document why.
const IGNORED_ADVISORY_IDS = [
  // GHSA-qwww-vcr4-c8h2: react-router RSC CSRF bypass.
  // The advisory explicitly states this only affects the *unstable* RSC APIs,
  // which this project does not use.  The patched version (react-router >=8.3.0)
  // requires upgrading to React 19 and react-router v8 — a separate major
  // undertaking tracked in its own future PR.
  'GHSA-qwww-vcr4-c8h2',

  // GHSA-8j4g-w8fx-2239 / CVE-2026-69207: hono CORS middleware ReDoS.
  // Only affects applications using hono/cors with default (empty) allowHeaders.
  // packages/website/src/worker.ts uses plain Hono routing only — no cors()
  // middleware is imported or applied.
  // Fix: hono >=4.12.34 (pending upgrade).
  'GHSA-8j4g-w8fx-2239',

  // GHSA-f23p-vx2j-j53r / CVE-2026-71850: hono/jsx memo() data leakage.
  // Only affects server-side rendering via hono/jsx when memo() wraps a
  // component that reads ambient request context.  worker.ts uses c.html()
  // with plain string templates — no hono/jsx, no memo().
  // Fix: hono >=4.12.34 (pending upgrade).
  'GHSA-f23p-vx2j-j53r',

  // GHSA-54fx-42gc-7vw4 / CVE-2026-71848: hono languageDetector middleware ReDoS.
  // Only affects applications that use the languageDetector() middleware.
  // worker.ts registers no language detection middleware.
  // Fix: hono >=4.12.34 (pending upgrade).
  'GHSA-54fx-42gc-7vw4',

  // GHSA-mh99-v99m-4gvg / CVE-2026-14257: brace-expansion OOM via unbounded expansion.
  // Path: api > typeorm > glob > minimatch > brace-expansion.
  // The glob patterns in that chain (entity/migration file discovery) are
  // server-controlled constants defined in ormconfig.ts — not user-supplied
  // input — so this DoS vector is not reachable in practice.
  // The patched version (brace-expansion >=5.0.8) requires upgrading TypeORM to
  // v1.x (which replaces glob with tinyglobby) — a separate migration tracked in
  // its own future PR.
  'GHSA-mh99-v99m-4gvg',

  // GHSA-rgw5-rvv9-x895 / CVE-2026-69152: brace-expansion DoS (bypass of prior mitigation).
  // Path: api > typeorm > glob > minimatch > brace-expansion.
  // Same analysis as GHSA-mh99-v99m-4gvg above — patterns are server-controlled
  // constants, not user input. Fix requires the same TypeORM major upgrade.
  'GHSA-rgw5-rvv9-x895',

  // GHSA-5p4m-2wfm-xmqj / js-yaml quadratic CPU in !!omap resolution.
  // Path: api > @nestjs/swagger > js-yaml.
  // The js-yaml usage in @nestjs/swagger parses developer-authored OpenAPI
  // schema files at startup — not runtime user input — so this ReDoS vector
  // is not reachable from external requests.
  // The fix (js-yaml >=4.3.1) requires @nestjs/swagger to update its peer
  // dependency — a separate upgrade tracked in its own future PR.
  'GHSA-5p4m-2wfm-xmqj',

  // GHSA-vcc3-ghjq-m6fr / CVE-2026-45822: decode-uri-component DoS via
  // malformed percent-encoded input.
  // Path: api > @googlemaps/google-maps-services-js > query-string >
  // decode-uri-component.
  // Patched 0.5.0 is ESM-only and breaks Jest + the CJS google-maps /
  // query-string@7 stack (which pins decode-uri-component ^0.2.2).
  // Input here is Google Maps API response/query serialization, not
  // untrusted end-user URL decoding. Pin stays at 0.2.2 until query-string
  // / google-maps-services-js ship an ESM-compatible upgrade.
  'GHSA-vcc3-ghjq-m6fr',
];

// GHSA-86w9-cpqp-85rv / CVE-2026-85393 affects forge RSA signature verification.
// No patched release is listed: https://github.com/advisories/GHSA-86w9-cpqp-85rv
// The locked firebase-admin uses forge only for privateKeyFromPem; google-p12-pem
// uses it only to decode PKCS#12 credentials and export private keys. Firebase
// JWT verification (jsonwebtoken/jwa) and Google auth use Node's crypto instead.
// Limit this exception to these reviewed paths; new consumers must be reviewed.
// Remove it when a patched release is available, and revisit on dependency changes.
const FORGE_CREDENTIAL_PATHS = [
  'api>firebase-admin>node-forge',
  'api>@google-cloud/storage>google-auth-library>gtoken>google-p12-pem>node-forge',
];

function isIgnoredAdvisory(data) {
  const advisory = data?.advisory;
  return (
    IGNORED_ADVISORY_IDS.includes(advisory?.github_advisory_id) ||
    (advisory?.github_advisory_id === 'GHSA-86w9-cpqp-85rv' &&
      advisory.module_name === 'node-forge' &&
      FORGE_CREDENTIAL_PATHS.includes(data.resolution?.path))
  );
}

function getAuditOptions() {
  return {
    level: 'moderate',
    groups: ['dependencies', 'optionalDependencies'],
  };
}

function parseAuditLines(lines) {
  return lines
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((entry) => entry.type === 'auditAdvisory')
    .map((entry) => entry.data)
    .filter((data) => !isIgnoredAdvisory(data));
}

function getAuditResultError(result, lines) {
  if (result.error) return result.error.message;
  // Yarn uses a severity bitmask (0-31) as its audit exit code. Nonzero is
  // expected even when every reported advisory has a documented exception.
  if (
    result.signal ||
    !Number.isInteger(result.status) ||
    result.status < 0 ||
    result.status > 31
  ) {
    return 'Yarn audit did not complete normally.';
  }

  let entries;
  try {
    entries = lines.map((line) => JSON.parse(line));
  } catch {
    return 'Failed to parse yarn audit output.';
  }
  if (entries.some((entry) => !entry || entry.type === 'error')) {
    return 'Yarn audit returned an error.';
  }
  if (
    entries.some(
      (entry) => entry.type === 'auditAdvisory' && !entry.data?.advisory,
    )
  ) {
    return 'Yarn audit returned an invalid advisory.';
  }
  if (
    !entries.some(
      (entry) => entry.type === 'auditSummary' && entry.data?.vulnerabilities,
    )
  ) {
    return 'Yarn audit returned no summary; the security check is incomplete.';
  }
  return null;
}

function formatAuditFailureReport(lines) {
  const advisories = parseAuditLines(lines);
  const grouped = new Map();

  for (const advisoryData of advisories) {
    const advisory = advisoryData.advisory || {};
    const pathValue = advisoryData.resolution?.path || '(unknown path)';
    const ids = [
      advisory.github_advisory_id,
      ...(advisory.cves || []),
      ...(advisory.cvss ? [] : []),
    ].filter(Boolean);
    const key = [
      advisory.severity || 'unknown',
      advisory.module_name || '(unknown module)',
      ids.join(','),
      advisory.recommendation || 'none listed',
    ].join('|');

    if (!grouped.has(key)) {
      grouped.set(key, {
        severity: advisory.severity || 'unknown',
        moduleName: advisory.module_name || '(unknown module)',
        ids,
        recommendation: advisory.recommendation || 'none listed',
        paths: [],
      });
    }

    grouped.get(key).paths.push(pathValue);
  }

  const linesOut = ['Blocking advisories:'];
  for (const entry of grouped.values()) {
    const uniquePaths = [...new Set(entry.paths)].sort();
    linesOut.push(
      `- ${entry.severity} | ${entry.moduleName} | ${entry.ids.join(', ') || 'unknown advisory'} | fix: ${entry.recommendation} | paths: ${uniquePaths.length}`,
    );
    for (const advisoryPath of uniquePaths) {
      linesOut.push(`  - ${advisoryPath}`);
    }
  }

  return linesOut;
}

function run() {
  const { level, groups } = getAuditOptions();
  const spawnOptions = {
    cwd: process.cwd(),
    encoding: 'utf8',
    ...(process.platform === 'win32' ? { shell: true } : {}),
  };

  const result = spawnSync(
    'yarn',
    ['audit', '--json', '--level', level, '--groups', ...groups],
    spawnOptions,
  );

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const auditError = getAuditResultError(result, lines);
  if (auditError) {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    console.error(auditError);
    process.exit(1);
  }

  const advisories = parseAuditLines(lines);

  if (advisories.length === 0) {
    console.log('Passed yarn security audit.');
    process.exit(0);
  }

  console.log(formatAuditFailureReport(lines).join('\n'));
  process.exit(1);
}

if (require.main === module) {
  run();
}

module.exports = {
  formatAuditFailureReport,
  getAuditOptions,
  getAuditResultError,
};
