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

  // GHSA-mh99-v99m-4gvg / CVE-2026-14257: brace-expansion OOM via unbounded expansion.
  // Path: api > typeorm > glob > minimatch > brace-expansion.
  // The glob patterns in that chain (entity/migration file discovery) are
  // server-controlled constants defined in ormconfig.ts — not user-supplied
  // input — so this DoS vector is not reachable in practice.
  // The patched version (brace-expansion >=5.0.8) requires upgrading TypeORM to
  // v1.x (which replaces glob with tinyglobby) — a separate migration tracked in
  // its own future PR.
  'GHSA-mh99-v99m-4gvg',
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
