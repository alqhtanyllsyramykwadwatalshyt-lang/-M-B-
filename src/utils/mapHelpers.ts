import { FactoryBranch } from '../types';

export type RegionFilter = 'all' | 'southern' | 'central' | 'western' | 'eastern';

export interface MapPoint {
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
}

export const YEMEN_VIEWBOX = {
  width: 800,
  height: 560,
  minLng: 42.0,
  maxLng: 53.4,
  minLat: 12.2,
  maxLat: 18.2,
};

/**
 * Projects geographic coordinates (lat, lng) into the Yemen SVG viewBox (800x560)
 * and percentage coordinates for responsive HTML marker overlays.
 */
export function projectYemenCoords(lat: number, lng: number): MapPoint {
  const { width, height, minLng, maxLng, minLat, maxLat } = YEMEN_VIEWBOX;
  const padX = 56;
  const padTop = 30;
  const padBottom = 34;

  const usableW = width - padX * 2;
  const usableH = height - padTop - padBottom;

  const clampedLng = Math.min(Math.max(lng, minLng), maxLng);
  const clampedLat = Math.min(Math.max(lat, minLat), maxLat);

  const normX = (clampedLng - minLng) / (maxLng - minLng);
  const normY = (maxLat - clampedLat) / (maxLat - minLat);

  const x = Number((padX + normX * usableW).toFixed(2));
  const y = Number((padTop + normY * usableH).toFixed(2));

  return {
    x,
    y,
    xPercent: Number(((x / width) * 100).toFixed(2)),
    yPercent: Number(((y / height) * 100).toFixed(2)),
  };
}

/**
 * Filters factory branches by region.
 */
export function filterBranchesByRegion(
  branches: FactoryBranch[],
  region: RegionFilter
): FactoryBranch[] {
  if (region === 'all') return branches;
  return branches.filter((b) => b.region === region);
}

/**
 * Computes great-circle distance in km between two coordinates using the Haversine formula.
 */
export function calculateDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
