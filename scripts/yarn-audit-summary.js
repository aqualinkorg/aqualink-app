#!/usr/bin/env node
/* Run: `yarn run audit` from repo root (plain `yarn audit` is Yarn's built-in). */

const { spawnSync } = require('node:child_process');

// Advisories that cannot be fixed without a major framework upgrade and whose
// impact does not apply to this codebase. Each entry must document why.
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
];

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
    .filter((data) => {
      const ghsaId = data?.advisory?.github_advisory_id;
      return !ghsaId || !IGNORED_ADVISORY_IDS.includes(ghsaId);
    });
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

  let advisories = [];
  try {
    advisories = parseAuditLines(lines);
  } catch (error) {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    console.error(`Failed to parse yarn audit output: ${error.message}`);
    process.exit(result.status || 1);
  }

  if (result.error) {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    console.error(result.error.message);
    process.exit(1);
  }

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
};
