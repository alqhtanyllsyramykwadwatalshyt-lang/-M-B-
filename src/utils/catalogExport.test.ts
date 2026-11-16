import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalogDocumentHtml, escapeHtml } from './catalogExport.js';
import { OFFICIAL_SPEC_FIELDS, FACTORY_CONTACT } from '../data/catalogProfile.js';

test('escapeHtml safely escapes special HTML characters', () => {
  assert.equal(escapeHtml('<script>"test" & \'x\'</script>'), '&lt;script&gt;&quot;test&quot; &amp; &#39;x&#39;&lt;/script&gt;');
});

test('buildCatalogDocumentHtml includes official Taiz Al-Jundiyyah contact info and all 14 sections', () => {
  const html = buildCatalogDocumentHtml(OFFICIAL_SPEC_FIELDS, { forWord: true });
  assert.ok(html.includes(escapeHtml(FACTORY_CONTACT.brandAr)));
  assert.ok(html.includes('الجندية، تعز، الجمهورية اليمنية'));
  assert.ok(html.includes('776046048'));
  assert.ok(html.includes('https://share.google/zlmwZg5PWTy56dQqs'));
  assert.ok(html.includes(FACTORY_CONTACT.facebookUrl));
  assert.ok(html.includes('حسب جدول المصنع المعتمد'));
  assert.ok(html.includes('urn:schemas-microsoft-com:office:word'));
});
