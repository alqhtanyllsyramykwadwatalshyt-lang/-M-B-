import React, { useState, useEffect } from 'react';
import { FACTORY_BRANCHES } from '../data/factoryData';
import { FactoryBranch } from '../types';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Building2,
  ExternalLink,
  Search,
  Share2,
  Truck,
  Compass,
  CheckCircle2,
  PlusCircle,
  X,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { useToast } from '../context/ToastContext';
import { FACTORY_CONTACT } from '../data/catalogProfile';
import {
  RegionFilter,
  filterBranchesByRegion,
  projectYemenCoords,
  calculateDistanceKm,
  YEMEN_VIEWBOX,
} from '../utils/mapHelpers';

const BRANCHES_STORAGE_KEY = 'jizan_custom_branches_v1';

const CITY_PRESETS: {
  city: string;
  region: FactoryBranch['region'];
  lat: number;
  lng: number;
}[] = [
  { city: 'ذمار', region: 'central', lat: 14.5426, lng: 44.4051 },
  { city: 'مأرب', region: 'eastern', lat: 15.4622, lng: 45.3264 },
  { city: 'البيضاء', region: 'central', lat: 13.9852, lng: 45.5727 },
  { city: 'سيئون', region: 'eastern', lat: 15.9432, lng: 48.7873 },
  { city: 'لحج', region: 'southern', lat: 13.0567, lng: 44.8819 },
  { city: 'حجة', region: 'western', lat: 15.6943, lng: 43.6058 },
];

const LABEL_OFFSETS: Record<string, string> = {
  'gizan-factory-taiz': 'top-1/2 -translate-y-1/2 right-full mr-2',
  'ibb-dealer': 'top-1/2 -translate-y-1/2 left-full ml-2',
  'sanaa-hub': 'bottom-full mb-1.5 left-1/2 -translate-x-1/2',
  'hodeidah-hub': 'top-1/2 -translate-y-1/2 right-full mr-2',
  'aden-hub': 'top-full mt-1.5 left-1/2 -translate-x-1/2',
  'mukalla-hub': 'bottom-full mb-1.5 left-1/2 -translate-x-1/2',
};

export const DistributionMapView: React.FC = () => {
  const { showToast } = useToast();
  const [branches, setBranches] = useState<FactoryBranch[]>(() => {
    try {
      const saved = localStorage.getItem(BRANCHES_STORAGE_KEY);
      if (saved) {
        const custom = JSON.parse(saved) as FactoryBranch[];
        if (Array.isArray(custom) && custom.length > 0) {
          return [...FACTORY_BRANCHES, ...custom];
        }
      }
    } catch {
      // ignore storage read error
    }
    return FACTORY_BRANCHES;
  });

  const [selectedBranch, setSelectedBranch] = useState<FactoryBranch>(FACTORY_BRANCHES[0]);
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('all');
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const [newBranchForm, setNewBranchForm] = useState({
    name: '',
    city: 'ذمار',
    region: 'central' as FactoryBranch['region'],
    type: 'authorized_dealer' as 'distribution_center' | 'authorized_dealer',
    address: '',
    phone: '',
    workingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
    lat: '14.5426',
    lng: '44.4051',
  });
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    try {
      const customOnly = branches.filter(
        (b) => !FACTORY_BRANCHES.some((base) => base.id === b.id)
      );
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(customOnly));
    } catch {
      // ignore storage write error
    }
  }, [branches]);

  const regionOptions: { id: RegionFilter; label: string }[] = [
    { id: 'all', label: `جميع الفروع (${branches.length})` },
    { id: 'southern', label: 'الجنوبية (تعز وعدن)' },
    { id: 'central', label: 'الوسطى (صنعاء وإب)' },
    { id: 'western', label: 'الساحل الغربي (الحديدة)' },
    { id: 'eastern', label: 'الشرقية (المكلا)' },
  ];

  const filteredBranches = filterBranchesByRegion(branches, activeRegion);
  const hqBranch = branches[0];
  const hqPoint = projectYemenCoords(hqBranch.coordinates.lat, hqBranch.coordinates.lng);

  const handleSelectRegion = (region: RegionFilter) => {
    setActiveRegion(region);
    soundEffects.playClick();
    const nextList = filterBranchesByRegion(branches, region);
    if (nextList.length > 0 && !nextList.some((b) => b.id === selectedBranch.id)) {
      setSelectedBranch(nextList[0]);
    }
  };

  const handleSelectBranch = (branch: FactoryBranch) => {
    setSelectedBranch(branch);
    soundEffects.playClick();
  };

  const handleCityPresetChange = (cityName: string) => {
    const preset = CITY_PRESETS.find((p) => p.city === cityName);
    if (preset) {
      setNewBranchForm((prev) => ({
        ...prev,
        city: preset.city,
        region: preset.region,
        lat: String(preset.lat),
        lng: String(preset.lng),
      }));
    } else {
      setNewBranchForm((prev) => ({ ...prev, city: cityName }));
    }
  };

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newBranchForm.name.trim();
    const city = newBranchForm.city.trim();
    const address = newBranchForm.address.trim();
    const phone = newBranchForm.phone.trim();
    const lat = Number(newBranchForm.lat);
    const lng = Number(newBranchForm.lng);

    if (!name || !city || !address || !phone) {
      setFormError('يرجى تعبئة اسم الفرع والمدينة والعنوان ورقم الهاتف.');
      return;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 11 || lat > 20 || lng < 41 || lng > 55) {
      setFormError('يرجى إدخال إحداثيات صحيحة ضمن نطاق الجمهورية اليمنية.');
      return;
    }

    const createdBranch: FactoryBranch = {
      id: `distributor-${Date.now()}`,
      name,
      type: newBranchForm.type,
      region: newBranchForm.region,
      coordinates: { lat, lng },
      city,
      address,
      phone,
      workingHours: newBranchForm.workingHours.trim() || 'السبت - الخميس: 8:00 ص - 6:00 م',
      capacity: `موزع معتمد لمنظومة جيزان M&B في ${city}`,
      availableProducts: [
        'مواسير PVC علامة JIZAN',
        'توصيلات PVC علامة M&B ذات الخط الأزرق',
      ],
    };

    setBranches((prev) => [...prev, createdBranch]);
    setActiveRegion('all');
    setSelectedBranch(createdBranch);
    setIsAddModalOpen(false);
    setFormError('');
    setNewBranchForm({
      name: '',
      city: 'ذمار',
      region: 'central',
      type: 'authorized_dealer',
      address: '',
      phone: '',
      workingHours: 'السبت - الخميس: 8:00 ص - 6:00 م',
      lat: '14.5426',
      lng: '44.4051',
    });

    soundEffects.playSuccessChime();
    showToast({
      title: 'تمت إضافة فرع جديد لموزعي جيزان M&B',
      message: `تم إدراج «${createdBranch.name}» (${createdBranch.city}) وتثبيته على خريطة التوزيع.`,
      variant: 'success',
    });
  };

  const distanceFromHq = calculateDistanceKm(hqBranch.coordinates, selectedBranch.coordinates);

  return (
    <div className="space-y-6 pb-12">
      {/* Intro Heading */}
      <section className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C81D25]"></span>
            <span className="text-xs font-bold text-red-400">
              المقر الرئيسي وشبكة التوزيع المعتمدة • تعز، الجمهورية اليمنية
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white">
            موقع <span className="text-[#C81D25]">مصنع جيزان للصناعات البلاستيكية</span> وشبكة الفروع
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            يقع المصنع في محافظة تعز (الجندية، تعز، الجمهورية اليمنية)، مع مراكز توزيع ومنافذ معتمدة في
            صنعاء، عدن، الحديدة، إب، والمكلا لتأمين وصول المواسير والتوصيلات لكافة المشاريع في
            الجمهورية اليمنية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsAddModalOpen(true);
              setFormError('');
              soundEffects.playClick();
            }}
            className="bg-[#C81D25] hover:bg-[#a6171e] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-950/40 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>إضافة فرع / موزع جديد</span>
          </button>
          <a
            href={FACTORY_CONTACT.googleProfileShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0A73C7] hover:bg-[#0862a9] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-950/40"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>رابط المشاركة المعتمد</span>
          </a>
          <a
            href="https://www.google.com/search?kgmid=%2Fg%2F11x204vkl9&q=%D9%85%D8%B5%D9%86%D8%B9%20%D8%AC%D9%8A%D8%B2%D8%A7%D9%86%20%D9%84%D9%84%D8%B5%D9%86%D8%A7%D8%B9%D8%A7%D8%AA%20%D8%A7%D9%84%D8%A8%D9%84%D8%A7%D8%B3%D8%AA%D9%8A%D9%83%20%D8%AA%D8%B9%D8%B2%20%D8%A7%D9%84%D9%8A%D9%85%D9%86"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>ملف المصنع</span>
          </a>
        </div>
      </section>

      {/* Region Filter Ribbon */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800/90 p-3 rounded-2xl"
        role="region"
        aria-label="تصفية الفروع حسب المنطقة"
      >
        <div className="flex flex-wrap items-center gap-2">
          {regionOptions.map((region) => {
            const isActive = activeRegion === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => handleSelectRegion(region.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#C81D25] text-white shadow-md shadow-[#C81D25]/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
                }`}
                aria-pressed={isActive}
              >
                {region.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowRoutes((prev) => !prev);
            soundEffects.playClick();
          }}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
            showRoutes
              ? 'bg-[#0A73C7]/20 text-sky-300 border-[#0A73C7]/50'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          aria-pressed={showRoutes}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>خطوط التوريد من تعز</span>
        </button>
      </div>

      {/* Main Map & Branches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Branch Cards List (second on mobile so map is immediately visible, first on desktop RTL) */}
        <div className="order-2 lg:order-1 lg:col-span-5 space-y-3.5 lg:max-h-[650px] overflow-y-auto pr-1">
          {filteredBranches.map((branch) => {
            const isSelected = selectedBranch.id === branch.id;
            return (
              <div
                key={branch.id}
                className={`p-4 rounded-2xl border transition-all relative ${
                  isSelected
                    ? 'bg-slate-800/95 border-[#C81D25] shadow-xl ring-1 ring-[#C81D25]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          branch.type === 'factory'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {branch.type === 'factory'
                          ? 'المصنع الرئيسي (المقر)'
                          : branch.type === 'authorized_dealer'
                          ? 'منفذ توزيع معتمد'
                          : 'مركز توزيع ومبيعات'}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{branch.city}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectBranch(branch)}
                      className="text-right font-extrabold text-sm sm:text-base text-white hover:text-sky-300 transition cursor-pointer block"
                    >
                      {branch.name}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectBranch(branch)}
                    aria-label={`تحديد ${branch.city} على الخريطة`}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#C81D25] border-red-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-[#C81D25] hover:border-slate-600'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 mt-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{branch.address}</span>
                </p>

                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{branch.workingHours}</span>
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <a
                    href={`tel:${branch.phone.replace(/\s+/g, '')}`}
                    className="text-sky-400 hover:underline flex items-center gap-1 font-mono font-bold"
                  >
                    <Phone className="w-3 h-3" />
                    <span dir="ltr">{branch.phone}</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectBranch(branch)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#C81D25]/20 text-red-300 border border-[#C81D25]/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isSelected ? 'محدد على الخريطة' : 'عرض بالخريطة'}
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${branch.coordinates.lat},${branch.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg text-[11px]"
                    >
                      <span>الإحداثيات</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Yemen Distribution Network Map Container */}
        <div className="order-1 lg:order-2 lg:col-span-7 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative bg-[#051320] flex flex-col justify-between">
          {/* Top Map Overlay Header */}
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#0A73C7]" />
              <span className="text-xs font-bold text-slate-200">
                خريطة شبكة التوزيع التفاعلية — الجمهورية اليمنية
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C81D25] inline-block"></span>
                المصنع الرئيسي
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0A73C7] inline-block"></span>
                مركز توزيع
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                منفذ معتمد
              </span>
            </div>
          </div>

          {/* Vector Yemen Map Stage */}
          <div className="relative flex-1 flex items-center justify-center px-3 py-3 sm:px-5 sm:py-4 overflow-hidden bg-[radial-gradient(circle_at_35%_45%,rgba(10,115,199,0.14),transparent_65%)]">
            <div
              className="relative w-full max-w-[740px] aspect-[800/560]"
              data-testid="yemen-distribution-map"
            >
              <svg
                viewBox={`0 0 ${YEMEN_VIEWBOX.width} ${YEMEN_VIEWBOX.height}`}
                className="w-full h-full select-none"
                role="img"
                aria-label="خريطة الجمهورية اليمنية ومواقع مصنع جيزان ومراكز التوزيع"
              >
                <defs>
                  <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.08)"
                      strokeWidth="1"
                    />
                  </pattern>
                  <linearGradient id="yemenLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#132a42" />
                    <stop offset="55%" stopColor="#0f2338" />
                    <stop offset="100%" stopColor="#0b1a2b" />
                  </linearGradient>
                  <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Subtle Coordinate Grid */}
                <rect
                  x="0"
                  y="0"
                  width={YEMEN_VIEWBOX.width}
                  height={YEMEN_VIEWBOX.height}
                  fill="url(#mapGrid)"
                  rx="16"
                />

                {/* Yemen Mainland Silhouette (projected to 800x560 bounds: lat 12.2..18.2, lng 42.0..53.4) */}
                <path
                  d="M 118 172 L 152 136 L 195 96 L 265 58 L 368 28 L 495 26 L 659 26 L 723 158 L 692 204 L 641 262 L 570 296 L 486 332 L 408 378 L 340 420 L 268 462 L 239 474 L 188 486 L 143 486 L 131 434 L 122 374 L 113 312 L 106 244 L 104 188 Z"
                  fill="url(#yemenLandGrad)"
                  stroke="#285078"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Subtle Governorate Topography Accents */}
                <path
                  d="M 146 210 Q 210 245 270 212 T 410 175 M 160 330 Q 225 352 280 310 T 450 268"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.12)"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />

                {/* Sea Labels */}
                <text
                  x="54"
                  y="358"
                  fill="rgba(125, 211, 252, 0.45)"
                  fontSize="12"
                  fontWeight="700"
                  transform="rotate(-76, 54, 358)"
                >
                  البحر الأحمر
                </text>
                <text
                  x="410"
                  y="506"
                  fill="rgba(125, 211, 252, 0.45)"
                  fontSize="13"
                  fontWeight="700"
                >
                  خليج عدن
                </text>

                {/* Distribution Routes from Taiz HQ */}
                {showRoutes &&
                  filteredBranches
                    .filter((b) => b.id !== hqBranch.id)
                    .map((branch) => {
                      const pt = projectYemenCoords(branch.coordinates.lat, branch.coordinates.lng);
                      const isTarget = selectedBranch.id === branch.id;
                      const midX = (hqPoint.x + pt.x) / 2;
                      const midY = Math.min(hqPoint.y, pt.y) - 24;
                      return (
                        <path
                          key={`route-${branch.id}`}
                          d={`M ${hqPoint.x} ${hqPoint.y} Q ${midX} ${midY} ${pt.x} ${pt.y}`}
                          fill="none"
                          stroke={isTarget ? '#ef4444' : '#38bdf8'}
                          strokeWidth={isTarget ? 3 : 1.75}
                          strokeDasharray={isTarget ? 'none' : '5 4'}
                          strokeOpacity={isTarget ? 0.95 : 0.45}
                          filter={isTarget ? 'url(#glowLine)' : undefined}
                        />
                      );
                    })}
              </svg>

              {/* Interactive HTML Branch Markers aligned 1:1 with SVG projection */}
              {filteredBranches.map((branch) => {
                const pt = projectYemenCoords(branch.coordinates.lat, branch.coordinates.lng);
                const isSelected = selectedBranch.id === branch.id;
                const isHq = branch.type === 'factory';
                const isDealer = branch.type === 'authorized_dealer';
                const labelOffsetClass =
                  LABEL_OFFSETS[branch.id] || 'bottom-full mb-1.5 left-1/2 -translate-x-1/2';

                return (
                  <div
                    key={branch.id}
                    style={{ left: `${pt.xPercent}%`, top: `${pt.yPercent}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                      isSelected ? 'z-30' : 'z-20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectBranch(branch)}
                      aria-label={`اختيار ${branch.name}`}
                      aria-pressed={isSelected}
                      className={`group relative flex items-center justify-center rounded-full border-2 transition-transform cursor-pointer shadow-xl ${
                        isSelected ? 'scale-115 ring-4 ring-white/25' : 'hover:scale-110'
                      } ${
                        isHq
                          ? 'w-7 h-7 bg-[#C81D25] border-white text-white'
                          : isDealer
                          ? 'w-5 h-5 bg-emerald-600 border-white text-white'
                          : 'w-6 h-6 bg-[#0A73C7] border-white text-white'
                      }`}
                    >
                      <Building2 className={isHq ? 'w-3.5 h-3.5' : 'w-3 h-3'} />

                      {/* City Label Pill */}
                      <span
                        className={`pointer-events-none absolute whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-extrabold border shadow-md transition ${labelOffsetClass} ${
                          isSelected
                            ? 'bg-white text-slate-950 border-white'
                            : 'bg-slate-950/90 text-slate-200 border-slate-700'
                        }`}
                      >
                        {branch.city.split(' - ')[0]}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Active Branch Info Dock */}
          <div className="mx-3 mb-3 sm:mx-4 sm:mb-4 bg-slate-950/95 border border-slate-800 p-3.5 rounded-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-[#C81D25]">
                    الفرع المحدد في الخريطة
                  </span>
                  {selectedBranch.id !== hqBranch.id && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-semibold">
                      يبعد ~{distanceFromHq} كم عن المصنع الرئيسي بتعز
                    </span>
                  )}
                  <span
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono"
                    dir="ltr"
                  >
                    {selectedBranch.coordinates.lat.toFixed(4)}°N,{' '}
                    {selectedBranch.coordinates.lng.toFixed(4)}°E
                  </span>
                </div>
                <h3 className="font-black text-white text-sm sm:text-base">
                  {selectedBranch.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedBranch.capacity || selectedBranch.address}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedBranch.availableProducts.slice(0, 2).map((prod, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{prod}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href={`tel:${selectedBranch.phone.replace(/\s+/g, '')}`}
                  className="bg-[#C81D25] hover:bg-[#a6171e] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال مباشر</span>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedBranch.coordinates.lat},${selectedBranch.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                >
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>احصل على المسار</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Distributor Branch Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-branch-modal-title"
        >
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-7 text-right space-y-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              aria-label="إغلاق نافذة إضافة الفرع"
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-emerald-400">
                توسيع شبكة موزعي جيزان M&amp;B
              </span>
              <h3 id="add-branch-modal-title" className="text-xl font-black text-white mt-0.5">
                إضافة فرع أو موزع معتمد جديد
              </h3>
            </div>

            <form onSubmit={handleAddBranchSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="branch-name-input"
                  className="block text-xs font-bold text-slate-300 mb-1"
                >
                  اسم الفرع أو الموزع المعتمد:
                </label>
                <input
                  id="branch-name-input"
                  type="text"
                  value={newBranchForm.name}
                  onChange={(e) => setNewBranchForm({ ...newBranchForm, name: e.target.value })}
                  placeholder="مثال: مركز توزيع جيزان M&B - ذمار"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0A73C7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="branch-city-select"
                    className="block text-xs font-bold text-slate-300 mb-1"
                  >
                    المدينة (مع إحداثيات جاهزة):
                  </label>
                  <select
                    id="branch-city-select"
                    value={newBranchForm.city}
                    onChange={(e) => handleCityPresetChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0A73C7]"
                  >
                    {CITY_PRESETS.map((p) => (
                      <option key={p.city} value={p.city}>
                        {p.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="branch-type-select"
                    className="block text-xs font-bold text-slate-300 mb-1"
                  >
                    تصنيف المنفذ:
                  </label>
                  <select
                    id="branch-type-select"
                    value={newBranchForm.type}
                    onChange={(e) =>
                      setNewBranchForm({
                        ...newBranchForm,
                        type: e.target.value as 'distribution_center' | 'authorized_dealer',
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#0A73C7]"
                  >
                    <option value="authorized_dealer">منفذ توزيع معتمد</option>
                    <option value="distribution_center">مركز توزيع ومبيعات</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="branch-address-input"
                  className="block text-xs font-bold text-slate-300 mb-1"
                >
                  العنوان التفصيلي:
                </label>
                <input
                  id="branch-address-input"
                  type="text"
                  value={newBranchForm.address}
                  onChange={(e) => setNewBranchForm({ ...newBranchForm, address: e.target.value })}
                  placeholder="الشارع الرئيسي، بالقرب من..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0A73C7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="branch-phone-input"
                    className="block text-xs font-bold text-slate-300 mb-1"
                  >
                    رقم الهاتف / واتساب:
                  </label>
                  <input
                    id="branch-phone-input"
                    type="tel"
                    dir="ltr"
                    value={newBranchForm.phone}
                    onChange={(e) => setNewBranchForm({ ...newBranchForm, phone: e.target.value })}
                    placeholder="776046048"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0A73C7]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="branch-hours-input"
                    className="block text-xs font-bold text-slate-300 mb-1"
                  >
                    ساعات العمل:
                  </label>
                  <input
                    id="branch-hours-input"
                    type="text"
                    value={newBranchForm.workingHours}
                    onChange={(e) =>
                      setNewBranchForm({ ...newBranchForm, workingHours: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0A73C7]"
                  />
                </div>
              </div>

              {formError && <p className="text-xs text-red-400 font-semibold">{formError}</p>}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#C81D25] hover:bg-[#a6171e] text-white py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>حفظ الفرع وإرسال تنبيه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
