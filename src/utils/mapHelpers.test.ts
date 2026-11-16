import test from 'node:test';
import assert from 'node:assert/strict';
import {
  projectYemenCoords,
  filterBranchesByRegion,
  calculateDistanceKm,
  YEMEN_VIEWBOX,
} from './mapHelpers.js';
import { FACTORY_BRANCHES } from '../data/factoryData.js';

test('projectYemenCoords places Yemen branches within SVG viewBox bounds and preserves relative geography', () => {
  const taiz = projectYemenCoords(13.5795, 44.0209);
  const sanaa = projectYemenCoords(15.3694, 44.191);
  const aden = projectYemenCoords(12.8258, 45.0367);
  const hodeidah = projectYemenCoords(14.7978, 42.9545);
  const mukalla = projectYemenCoords(14.5425, 49.1242);

  for (const pt of [taiz, sanaa, aden, hodeidah, mukalla]) {
    assert.ok(pt.x > 0 && pt.x < YEMEN_VIEWBOX.width);
    assert.ok(pt.y > 0 && pt.y < YEMEN_VIEWBOX.height);
    assert.ok(pt.xPercent > 0 && pt.xPercent < 100);
    assert.ok(pt.yPercent > 0 && pt.yPercent < 100);
  }

  // Sana'a is north of Taiz (smaller y), Aden is south of Taiz (larger y)
  assert.ok(sanaa.y < taiz.y);
  assert.ok(aden.y > taiz.y);

  // Hodeidah is west of Taiz (smaller x), Mukalla is east of Taiz (larger x)
  assert.ok(hodeidah.x < taiz.x);
  assert.ok(mukalla.x > taiz.x);
});

test('filterBranchesByRegion returns all branches or subsets accurately', () => {
  const all = filterBranchesByRegion(FACTORY_BRANCHES, 'all');
  assert.equal(all.length, FACTORY_BRANCHES.length);

  const central = filterBranchesByRegion(FACTORY_BRANCHES, 'central');
  assert.equal(central.length, 2);
  assert.ok(central.every((b) => b.region === 'central'));

  const southern = filterBranchesByRegion(FACTORY_BRANCHES, 'southern');
  assert.equal(southern.length, 2);
  assert.ok(southern.some((b) => b.id === 'gizan-factory-taiz'));
});

test('calculateDistanceKm computes realistic shipping distance from Taiz HQ', () => {
  const taiz = FACTORY_BRANCHES[0].coordinates;
  const sanaa = FACTORY_BRANCHES[1].coordinates;
  const mukalla = FACTORY_BRANCHES[5].coordinates;

  assert.equal(calculateDistanceKm(taiz, taiz), 0);
  const taizToSanaa = calculateDistanceKm(taiz, sanaa);
  const taizToMukalla = calculateDistanceKm(taiz, mukalla);
  assert.ok(taizToSanaa >= 180 && taizToSanaa <= 220);
  assert.ok(taizToMukalla >= 520 && taizToMukalla <= 600);
});
