import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBarlowBurstPressure,
  calculateWaterFlow,
  evaluateStressTest,
  JIZAN_PIPE_CATALOG,
} from './pipeCalculations.js';

test('JIZAN_PIPE_CATALOG has valid dimensions and values', () => {
  assert.ok(JIZAN_PIPE_CATALOG.length >= 8);
  for (const pipe of JIZAN_PIPE_CATALOG) {
    assert.ok(pipe.outerDiameterMm > pipe.wallThicknessMm);
    assert.ok(pipe.workingPressureBar >= 16);
    assert.ok(pipe.minBurstPressureBar >= 40);
  }
});

test('calculateBarlowBurstPressure calculates correct pressure', () => {
  // OD = 110mm, wall = 8.1mm, hoop stress = 42 MPa
  // Barlow: (20 * 42 * 8.1) / (110 - 8.1) = 6804 / 101.9 = 66.77 bar
  const burst = calculateBarlowBurstPressure(110, 8.1, 42);
  assert.ok(burst > 65 && burst < 70);

  // Invalid dimensions return 0
  assert.equal(calculateBarlowBurstPressure(0, 5), 0);
  assert.equal(calculateBarlowBurstPressure(50, 60), 0);
});

test('calculateWaterFlow calculates volumetric flow rates', () => {
  // Inner diameter 27.2mm (1" pipe), velocity 1.5 m/s
  const flow = calculateWaterFlow(27.2, 1.5);
  assert.ok(flow.litersPerMin > 45 && flow.litersPerMin < 60);
  assert.ok(flow.cubicMetersPerHour > 2.5 && flow.cubicMetersPerHour < 4.0);

  // Zero diameter returns 0
  assert.deepEqual(calculateWaterFlow(0, 1.5), { litersPerMin: 0, cubicMetersPerHour: 0 });
});

test('evaluateStressTest accurately grades authentic vs failed sample', () => {
  const authenticResult = evaluateStressTest({
    pressureBar: 25,
    impactDropHeightM: 2.0,
    bendAngleDeg: 30,
    isAuthenticBlueLine: true,
  });
  assert.equal(authenticResult.scorePercent, 100);
  assert.equal(authenticResult.overallRating, 'ممتاز - معتمد');
  assert.equal(authenticResult.leakagePass, true);

  const failedResult = evaluateStressTest({
    pressureBar: 45, // exceeds burst limit
    impactDropHeightM: 3.5, // exceeds impact limit
    bendAngleDeg: 60, // cracked
    isAuthenticBlueLine: false, // leak
  });
  assert.equal(failedResult.scorePercent, 0);
  assert.equal(failedResult.overallRating, 'فشل الاختبار');
  assert.equal(failedResult.leakagePass, false);
});
