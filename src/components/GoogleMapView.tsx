/// <reference types="google.maps" />
import React, { useEffect, useState, useCallback } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
  useApiLoadingStatus,
  APILoadingStatus,
  CollisionBehavior,
} from '@vis.gl/react-google-maps';
import { FactoryBranch } from '../types';
import { calculateDistanceKm } from '../utils/mapHelpers';
import { FACTORY_CONTACT } from '../data/catalogProfile';
import { AlertTriangle, Compass, ExternalLink, Maximize2, Navigation, Phone } from 'lucide-react';

interface GoogleMapViewProps {
  branches: FactoryBranch[];
  selectedBranch: FactoryBranch;
  hqBranch: FactoryBranch;
  showRoutes: boolean;
  onSelectBranch: (branch: FactoryBranch) => void;
  onSwitchToVectorMap: () => void;
}

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const MAPS_ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];

interface BranchMarkerProps {
  branch: FactoryBranch;
  hqBranch: FactoryBranch;
  isSelected: boolean;
  isInfoOpen: boolean;
  zIndex: number;
  onOpenInfo: (branch: FactoryBranch) => void;
  onCloseInfo: () => void;
}

const BranchAdvancedMarker: React.FC<BranchMarkerProps> = ({
  branch,
  hqBranch,
  isSelected,
  isInfoOpen,
  zIndex,
  onOpenInfo,
  onCloseInfo,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const isHq = branch.type === 'factory';
  const isDealer = branch.type === 'authorized_dealer';

  const pinBackground = isHq ? '#C81D25' : isDealer ? '#059669' : '#0A73C7';
  const pinBorder = isHq ? '#7f1d1d' : isDealer ? '#065f46' : '#075985';
  const pinScale = isSelected ? 1.25 : isHq ? 1.15 : 0.95;

  const distanceKm = calculateDistanceKm(hqBranch.coordinates, branch.coordinates);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={branch.coordinates}
        zIndex={zIndex}
        title={branch.name}
        collisionBehavior={
          isHq || isSelected
            ? CollisionBehavior.REQUIRED
            : CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY
        }
        onClick={() => onOpenInfo(branch)}
      >
        <Pin
          background={pinBackground}
          borderColor={pinBorder}
          glyphColor="#ffffff"
          scale={pinScale}
        />
      </AdvancedMarker>

      {isInfoOpen && marker && (
        <InfoWindow anchor={marker} maxWidth={290} onCloseClick={onCloseInfo}>
          <div dir="rtl" className="text-right text-slate-900 space-y-2 p-0.5 font-['Tajawal',sans-serif]">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isHq
                    ? 'bg-red-100 text-red-800'
                    : isDealer
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {isHq
                  ? 'المصنع الرئيسي'
                  : isDealer
                  ? 'منفذ توزيع معتمد'
                  : 'مركز توزيع ومبيعات'}
              </span>
              {!isHq && (
                <span className="text-[10px] font-semibold text-slate-500">
                  ~{distanceKm} كم من تعز
                </span>
              )}
            </div>

            <h4 className="font-extrabold text-sm text-slate-950 leading-snug">
              {branch.name}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">{branch.address}</p>

            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200">
              <a
                href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#C81D25] hover:underline px-1 py-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C81D25]/50"
              >
                <Phone className="w-3 h-3" />
                <span dir="ltr">{branch.phone}</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${branch.coordinates.lat},${branch.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0A73C7] hover:underline px-1 py-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A73C7]/50"
              >
                <Navigation className="w-3 h-3" />
                <span>الاتجاهات</span>
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface MapEffectsProps {
  branches: FactoryBranch[];
  selectedBranch: FactoryBranch;
  hqBranch: FactoryBranch;
  showRoutes: boolean;
  fitBoundsTrigger: number;
}

const MapCameraAndRoutes: React.FC<MapEffectsProps> = ({
  branches,
  selectedBranch,
  hqBranch,
  showRoutes,
  fitBoundsTrigger,
}) => {
  const map = useMap();
  const coreLib = useMapsLibrary('core');
  const mapsLib = useMapsLibrary('maps');

  // Smoothly pan map when the user picks a branch from cards or pins
  useEffect(() => {
    if (!map) return;
    map.panTo(selectedBranch.coordinates);
    const currentZoom = map.getZoom();
    if (typeof currentZoom === 'number' && currentZoom < 7) {
      map.setZoom(8);
    }
  }, [map, selectedBranch]);

  // Fit bounds to all currently visible branches on explicit request
  useEffect(() => {
    if (!map || !coreLib || fitBoundsTrigger === 0 || branches.length === 0) return;
    if (branches.length === 1) {
      map.panTo(branches[0].coordinates);
      map.setZoom(11);
      return;
    }
    const bounds = new coreLib.LatLngBounds();
    branches.forEach((b) => bounds.extend(b.coordinates));
    map.fitBounds(bounds, 48);
  }, [map, coreLib, branches, fitBoundsTrigger]);

  // Render geodesic supply lines from Taiz HQ to filtered branches
  useEffect(() => {
    if (!map || !mapsLib || !showRoutes) return;

    const polylines: google.maps.Polyline[] = branches
      .filter((b) => b.id !== hqBranch.id)
      .map((branch) => {
        const isTarget = branch.id === selectedBranch.id;
        return new mapsLib.Polyline({
          path: [hqBranch.coordinates, branch.coordinates],
          geodesic: true,
          strokeColor: isTarget ? '#C81D25' : '#0A73C7',
          strokeOpacity: isTarget ? 0.92 : 0.45,
          strokeWeight: isTarget ? 3.5 : 2,
          map,
        });
      });

    return () => {
      polylines.forEach((line) => line.setMap(null));
    };
  }, [map, mapsLib, branches, selectedBranch, hqBranch, showRoutes]);

  return null;
};

const GoogleMapCanvas: React.FC<GoogleMapViewProps> = ({
  branches,
  selectedBranch,
  hqBranch,
  showRoutes,
  onSelectBranch,
  onSwitchToVectorMap,
}) => {
  const status = useApiLoadingStatus();
  const [infoOpenBranchId, setInfoOpenBranchId] = useState<string | null>(selectedBranch.id);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState<number>(0);

  useEffect(() => {
    setInfoOpenBranchId(selectedBranch.id);
  }, [selectedBranch.id]);

  useEffect(() => {
    if (status === APILoadingStatus.AUTH_FAILURE) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  }, [status]);

  const handleOpenInfo = useCallback(
    (branch: FactoryBranch) => {
      onSelectBranch(branch);
      setInfoOpenBranchId(branch.id);
    },
    [onSelectBranch]
  );

  const handleCloseInfo = useCallback(() => {
    setInfoOpenBranchId(null);
  }, []);

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="h-[460px] sm:h-[520px] flex flex-col items-center justify-center text-center p-6 bg-slate-950/90 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-sm sm:text-base font-black text-white">
            تعذر تحميل خرائط Google في هذه اللحظة
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            يمكنك التبديل فوراً إلى خريطة الشبكة الهندسية التفاعلية أو فتح موقع المصنع الرئيسي في
            خرائط Google مباشرة.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onSwitchToVectorMap}
            className="bg-[#0A73C7] hover:bg-[#0862a9] text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>عرض خريطة الشبكة الهندسية</span>
          </button>
          <a
            href={FACTORY_CONTACT.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح في خرائط Google</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] bg-slate-950" data-testid="google-map-container">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={hqBranch.coordinates}
        defaultZoom={7}
        gestureHandling="greedy"
        mapTypeControl={true}
        streetViewControl={false}
        fullscreenControl={true}
        internalUsageAttributionIds={MAPS_ATTRIBUTION_IDS}
        className="w-full h-full"
      >
        <MapCameraAndRoutes
          branches={branches}
          selectedBranch={selectedBranch}
          hqBranch={hqBranch}
          showRoutes={showRoutes}
          fitBoundsTrigger={fitBoundsTrigger}
        />

        {branches.map((branch, idx) => {
          const isSelected = branch.id === selectedBranch.id;
          const zIndex = isSelected ? 1000 : branch.type === 'factory' ? 500 : idx + 1;
          return (
            <BranchAdvancedMarker
              key={branch.id}
              branch={branch}
              hqBranch={hqBranch}
              isSelected={isSelected}
              isInfoOpen={infoOpenBranchId === branch.id}
              zIndex={zIndex}
              onOpenInfo={handleOpenInfo}
              onCloseInfo={handleCloseInfo}
            />
          );
        })}
      </GoogleMap>

      {/* Fit All Branches Button */}
      <button
        type="button"
        onClick={() => setFitBoundsTrigger((n) => n + 1)}
        className="absolute bottom-4 right-4 z-10 bg-slate-950/90 hover:bg-slate-900 text-white border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-lg flex items-center gap-1.5 transition cursor-pointer backdrop-blur-sm"
      >
        <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
        <span>عرض كافة الفروع</span>
      </button>
    </div>
  );
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = (props) => {
  if (!MAPS_API_KEY) {
    return (
      <div className="h-[460px] sm:h-[520px] flex flex-col items-center justify-center text-center p-6 bg-slate-950/90 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Compass className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-sm sm:text-base font-black text-white">
            مفتاح خرائط Google غير مهيأ في هذه البيئة
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            عند توفر مفتاح خرائط Google في إعدادات البيئة، ستعمل الخريطة الحية تلقائياً. يمكنك
            استخدام خريطة الشبكة الهندسية التفاعلية أو فتح الإحداثيات في خرائط Google.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={props.onSwitchToVectorMap}
            className="bg-[#0A73C7] hover:bg-[#0862a9] text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>التبديل إلى خريطة الشبكة الهندسية</span>
          </button>
          <a
            href={FACTORY_CONTACT.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح تعز على خرائط Google</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={MAPS_API_KEY}
      libraries={['marker']}
      language="ar"
      region="YE"
    >
      <GoogleMapCanvas {...props} />
    </APIProvider>
  );
};
