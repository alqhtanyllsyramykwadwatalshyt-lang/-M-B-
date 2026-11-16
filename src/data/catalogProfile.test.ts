import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INTRODUCTORY_CATALOG_SECTIONS,
  OFFICIAL_VIDEO_CUES,
  OFFICIAL_SPEC_FIELDS,
  QUALITY_PIPELINE_STEPS,
  QUALITY_TESTS,
  FACTORY_CONTACT,
} from './catalogProfile.js';

test('INTRODUCTORY_CATALOG_SECTIONS covers all 14 profile sections in order', () => {
  assert.equal(INTRODUCTORY_CATALOG_SECTIONS.length, 14);
  for (let i = 0; i < 14; i++) {
    const expectedNum = String(i + 1).padStart(2, '0');
    assert.equal(INTRODUCTORY_CATALOG_SECTIONS[i].number, expectedNum);
    assert.ok(INTRODUCTORY_CATALOG_SECTIONS[i].title.length > 0);
  }
});

test('OFFICIAL_VIDEO_CUES spans 0 to 20 seconds continuously', () => {
  assert.equal(OFFICIAL_VIDEO_CUES.length, 6);
  assert.equal(OFFICIAL_VIDEO_CUES[0].startSec, 0);
  assert.equal(OFFICIAL_VIDEO_CUES[OFFICIAL_VIDEO_CUES.length - 1].endSec, 20);
  for (let i = 1; i < OFFICIAL_VIDEO_CUES.length; i++) {
    assert.equal(OFFICIAL_VIDEO_CUES[i].startSec, OFFICIAL_VIDEO_CUES[i - 1].endSec);
  }
});

test('OFFICIAL_SPEC_FIELDS avoids unconfirmed dimensions and defers to official factory tables', () => {
  assert.equal(OFFICIAL_SPEC_FIELDS.length, 8);
  for (const row of OFFICIAL_SPEC_FIELDS) {
    assert.equal(row.statusText, 'حسب جدول المصنع المعتمد');
  }
});

test('QUALITY_PIPELINE_STEPS and QUALITY_TESTS match catalog specifications', () => {
  assert.equal(QUALITY_PIPELINE_STEPS.length, 9);
  assert.equal(QUALITY_TESTS.length, 10);
  assert.equal(FACTORY_CONTACT.phoneDisplay, '776046048');
  assert.ok(FACTORY_CONTACT.officialVideoSrc.endsWith('.mp4'));
});
