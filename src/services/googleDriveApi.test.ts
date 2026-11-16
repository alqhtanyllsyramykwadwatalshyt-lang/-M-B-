import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDriveListQuery,
  buildMultipartBody,
  formatFileSize,
} from './googleDriveApi.js';

test('buildDriveListQuery composes clean sanitized Drive queries', () => {
  assert.equal(buildDriveListQuery('', 'all'), 'trashed = false');
  assert.equal(
    buildDriveListQuery("jizan'catalog", 'documents'),
    "trashed = false and name contains 'jizancatalog' and mimeType != 'application/vnd.google-apps.folder'"
  );
  assert.equal(
    buildDriveListQuery('M&B', 'folders'),
    "trashed = false and name contains 'M&B' and mimeType = 'application/vnd.google-apps.folder'"
  );
});

test('buildMultipartBody formats metadata and content with matching boundary', () => {
  const { body, contentType } = buildMultipartBody(
    { name: 'jizan-catalog.html', mimeType: 'text/html' },
    '<html></html>',
    'text/html',
    'test_boundary'
  );
  assert.equal(contentType, 'multipart/related; boundary=test_boundary');
  assert.ok(body.includes('--test_boundary'));
  assert.ok(body.includes('"name":"jizan-catalog.html"'));
  assert.ok(body.includes('<html></html>'));
  assert.ok(body.endsWith('--test_boundary--'));
});

test('formatFileSize formats bytes, KB, and MB cleanly', () => {
  assert.equal(formatFileSize(undefined), '—');
  assert.equal(formatFileSize('512'), '512 B');
  assert.equal(formatFileSize('2048'), '2.0 KB');
  assert.equal(formatFileSize(String(2 * 1024 * 1024)), '2.00 MB');
});
