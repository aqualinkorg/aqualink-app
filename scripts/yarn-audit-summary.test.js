const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  formatAuditFailureReport,
  getAuditResultError,
} = require('./yarn-audit-summary');

const summary = JSON.stringify({
  type: 'auditSummary',
  data: {
    vulnerabilities: { info: 0, low: 0, moderate: 0, high: 1, critical: 0 },
  },
});

function advisory(path, id = 'GHSA-86w9-cpqp-85rv', moduleName = 'node-forge') {
  return JSON.stringify({
    type: 'auditAdvisory',
    data: {
      resolution: { path },
      advisory: {
        github_advisory_id: id,
        module_name: moduleName,
        severity: 'high',
      },
    },
  });
}

test('only the reviewed forge credential paths are exempted', () => {
  const lines = [
    advisory('api>firebase-admin>node-forge'),
    advisory(
      'api>@google-cloud/storage>google-auth-library>gtoken>google-p12-pem>node-forge',
    ),
    summary,
  ];
  assert.deepEqual(formatAuditFailureReport(lines), ['Blocking advisories:']);
  assert.equal(getAuditResultError({ status: 8 }, lines), null);
});

test('new forge consumers and unknown paths remain blocking', () => {
  for (const path of ['api>new-consumer>node-forge', undefined]) {
    assert.match(
      formatAuditFailureReport([advisory(path)]).join('\n'),
      /high \| node-forge/,
    );
  }
});

test('other advisories and modules are not covered by the forge exception', () => {
  const path = 'api>firebase-admin>node-forge';
  assert.match(
    formatAuditFailureReport([advisory(path, 'GHSA-new-advisory')]).join('\n'),
    /GHSA-new-advisory/,
  );
  assert.match(
    formatAuditFailureReport([advisory(path, undefined, 'other-module')]).join(
      '\n',
    ),
    /other-module/,
  );
});

test('mixed results still report a blocking advisory', () => {
  const report = formatAuditFailureReport([
    advisory('api>firebase-admin>node-forge'),
    advisory('api>new-consumer>node-forge'),
  ]).join('\n');
  assert.match(report, /api>new-consumer>node-forge/);
  assert.doesNotMatch(report, /api>firebase-admin>node-forge/);
});

test('empty output and network failures cannot pass as a clean audit', () => {
  assert.match(getAuditResultError({ status: 0 }, []), /no summary/);
  assert.match(
    getAuditResultError({ status: 1 }, [
      JSON.stringify({ type: 'info', data: 'Retrying' }),
    ]),
    /no summary/,
  );
  assert.match(
    getAuditResultError({ status: 1 }, [
      summary,
      JSON.stringify({ type: 'error', data: 'Network failure' }),
    ]),
    /error/,
  );
});

test('malformed output and incomplete advisories fail the check', () => {
  assert.match(
    getAuditResultError({ status: 0 }, ['not JSON', summary]),
    /parse/,
  );
  assert.match(getAuditResultError({ status: 0 }, ['null', summary]), /error/);
  assert.match(
    getAuditResultError({ status: 8 }, [
      JSON.stringify({ type: 'auditAdvisory', data: {} }),
      summary,
    ]),
    /invalid advisory/,
  );
});

test('process launch failures and abnormal termination fail the check', () => {
  assert.equal(
    getAuditResultError({ error: new Error('ENOENT') }, []),
    'ENOENT',
  );
  for (const result of [
    { status: null },
    { status: 0, signal: 'SIGTERM' },
    { status: 127 },
  ]) {
    assert.match(getAuditResultError(result, [summary]), /did not complete/);
  }
});

test('a completed audit accepts the Yarn severity exit bitmask', () => {
  for (const status of [0, 8, 30, 31]) {
    assert.equal(getAuditResultError({ status }, [summary]), null);
  }
});
