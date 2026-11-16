/**
 * Pipe engineering calculations and validation criteria for JIZAN UPVC pipes
 * Based on ISO 1452 / DIN 8062 and standard hydraulic formulations.
 */

export interface PipeSpec {
  nominalInch: string;
  outerDiameterMm: number;
  wallThicknessMm: number;
  pressureClass: 'PN6' | 'PN10' | 'PN16' | 'PN25';
  workingPressureBar: number;
  minBurstPressureBar: number;
  weightKgPerMeter: number;
}

export const JIZAN_PIPE_CATALOG: PipeSpec[] = [
  {
    nominalInch: '1/2"',
    outerDiameterMm: 20,
    wallThicknessMm: 1.5,
    pressureClass: 'PN16',
    workingPressureBar: 16,
    minBurstPressureBar: 42,
    weightKgPerMeter: 0.14,
  },
  {
    nominalInch: '3/4"',
    outerDiameterMm: 25,
    wallThicknessMm: 1.9,
    pressureClass: 'PN16',
    workingPressureBar: 16,
    minBurstPressureBar: 42,
    weightKgPerMeter: 0.22,
  },
  {
    nominalInch: '1"',
    outerDiameterMm: 32,
    wallThicknessMm: 2.4,
    pressureClass: 'PN16',
    workingPressureBar: 16,
    minBurstPressureBar: 42,
    weightKgPerMeter: 0.35,
  },
  {
    nominalInch: '1 1/4"',
    outerDiameterMm: 40,
    wallThicknessMm: 3.0,
    pressureClass: 'PN16',
    workingPressureBar: 16,
    minBurstPressureBar: 42,
    weightKgPerMeter: 0.54,
  },
  {
    nominalInch: '1 1/2"',
    outerDiameterMm: 50,
    wallThicknessMm: 3.7,
    pressureClass: 'PN16',
    workingPressureBar: 16,
    minBurstPressureBar: 42,
    weightKgPerMeter: 0.83,
  },
  {
    nominalInch: '2"',
    outerDiameterMm: 63,
    wallThicknessMm: 4.7,
    pressureClass: 'PN16',
    workingPressureBar: 16,
    minBurstPressureBar: 42,
    weightKgPerMeter: 1.32,
  },
  {
    nominalInch: '3"',
    outerDiameterMm: 90,
    wallThicknessMm: 6.7,
    pressureClass: 'PN16',
    workingPressureBar: 16,
    minBurstPressureBar: 42,
    weightKgPerMeter: 2.68,
  },
  {
    nominalInch: '4"',
    outerDiameterMm: 110,
    wallThicknessMm: 8.1,
    pressureClass: 'PN16',
    workingPressureBar: 16,
    minBurstPressureBar: 42,
    weightKgPerMeter: 3.96,
  },
];

/**
 * Calculates burst pressure using Barlow's formula:
 * P (Bar) = (20 * S * t) / (D - t)
 * where S is hoop stress in MPa (typically 42 MPa for virgin UPVC at 20°C short-term burst test)
 */
export function calculateBarlowBurstPressure(
  outerDiameterMm: number,
  wallThicknessMm: number,
  hoopStressMpa = 42
): number {
  if (outerDiameterMm <= 0 || wallThicknessMm <= 0 || wallThicknessMm >= outerDiameterMm) {
    return 0;
  }
  const meanDiameter = outerDiameterMm - wallThicknessMm;
  const pressureBar = (20 * hoopStressMpa * wallThicknessMm) / meanDiameter;
  return Math.round(pressureBar * 10) / 10;
}

/**
 * Calculates water flow rate (Liters per Minute) given inner diameter and flow velocity (m/s)
 * Recommended velocity in residential/commercial: 1.0 - 2.0 m/s
 */
export function calculateWaterFlow(innerDiameterMm: number, velocityMetersPerSec = 1.5): {
  litersPerMin: number;
  cubicMetersPerHour: number;
} {
  if (innerDiameterMm <= 0 || velocityMetersPerSec <= 0) {
    return { litersPerMin: 0, cubicMetersPerHour: 0 };
  }
  const radiusMeters = innerDiameterMm / 2000;
  const areaM2 = Math.PI * radiusMeters * radiusMeters;
  const volumeFlowM3PerSec = areaM2 * velocityMetersPerSec;
  const cubicMetersPerHour = volumeFlowM3PerSec * 3600;
  const litersPerMin = volumeFlowM3PerSec * 60000;

  return {
    litersPerMin: Math.round(litersPerMin * 10) / 10,
    cubicMetersPerHour: Math.round(cubicMetersPerHour * 100) / 100,
  };
}

/**
 * Evaluates plumber stress test battery
 */
export interface StressTestState {
  pressureBar: number;
  impactDropHeightM: number;
  bendAngleDeg: number;
  isAuthenticBlueLine: boolean;
}

export interface StressTestEvaluation {
  pressurePass: boolean;
  impactPass: boolean;
  bendingPass: boolean;
  leakagePass: boolean;
  overallRating: 'ممتاز - معتمد' | 'جيد' | 'فشل الاختبار';
  scorePercent: number;
  recommendation: string;
}

export function evaluateStressTest(state: StressTestState): StressTestEvaluation {
  // JIZAN UPVC pipes withstand up to 35 bar in the campaign test
  const pressurePass = state.pressureBar <= 36;
  // Impact test: passes drop heights up to 2.5 meters with 5kg steel striker
  const impactPass = state.impactDropHeightM <= 2.8;
  // Bending test: elasticity allows flex up to 45 degrees without cracking
  const bendingPass = state.bendAngleDeg <= 50;
  // Authentic M&B Blue Line joint guarantees zero leakage
  const leakagePass = state.isAuthenticBlueLine;

  const points =
    (pressurePass ? 30 : 0) +
    (impactPass ? 25 : 0) +
    (bendingPass ? 25 : 0) +
    (leakagePass ? 20 : 0);

  let overallRating: 'ممتاز - معتمد' | 'جيد' | 'فشل الاختبار' = 'ممتاز - معتمد';
  let recommendation = 'منتج جيزان الأصلي يجتاز كافة متطلبات الجودة العالية ومقاومة الضغط والتسريب.';

  if (points === 100) {
    overallRating = 'ممتاز - معتمد';
    recommendation = 'اجتازت العينة جميع اختبارات السباك بنجاح بنسبة 100% ومطابقة لأعلى المواصفات القياسية.';
  } else if (points >= 70) {
    overallRating = 'جيد';
    recommendation = 'الأداء مقبول، لكن يُوصى دائماً باستخدام وصلات M&B ذات الخط الأزرق المعتمد لمنع التسريب.';
  } else {
    overallRating = 'فشل الاختبار';
    recommendation = 'فشلت العينة التجارية في تحمل الاختبارات الشاقة. احرص على اختيار مواسير جيزان المختومة الأصلية.';
  }

  return {
    pressurePass,
    impactPass,
    bendingPass,
    leakagePass,
    overallRating,
    scorePercent: points,
    recommendation,
  };
}
