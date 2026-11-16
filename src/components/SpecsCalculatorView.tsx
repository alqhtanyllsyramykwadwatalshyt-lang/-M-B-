import React, { useState, useEffect } from 'react';
import { JIZAN_PIPE_CATALOG, calculateWaterFlow } from '../utils/pipeCalculations';
import { DIGITAL_CATALOG } from '../data/factoryData';
import {
  INTRODUCTORY_CATALOG_SECTIONS,
  OFFICIAL_SPEC_FIELDS,
  QUALITY_PIPELINE_STEPS,
  FACTORY_CONTACT,
} from '../data/catalogProfile';
import { soundEffects } from '../utils/soundEffects';
import { useToast } from '../context/ToastContext';
import {
  Calculator,
  FileText,
  CheckCircle2,
  MessageCircle,
  Package,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Award,
  PhoneCall,
  ExternalLink,
  Layers,
  Pencil,
  RotateCcw,
  Save,
  X,
  Printer,
} from 'lucide-react';
import { CatalogBrochureView } from './CatalogBrochureView';

const SPEC_STORAGE_KEY = 'jizan_official_spec_fields_v1';

interface SpecsCalculatorViewProps {
  onRequestQuote: () => void;
}

export const SpecsCalculatorView: React.FC<SpecsCalculatorViewProps> = ({ onRequestQuote }) => {
  const { showToast } = useToast();
  const [activeCatalogTab, setActiveCatalogTab] = useState<
    'brochure' | 'profile-14' | 'catalog' | 'calculator'
  >('brochure');
  const [selectedProfileSection, setSelectedProfileSection] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('pipes');
  const [selectedPipe, setSelectedPipe] = useState(JIZAN_PIPE_CATALOG[2]); // 1" default
  const [projectLengthMeters, setProjectLengthMeters] = useState<number>(120);
  const [waterVelocity, setWaterVelocity] = useState<number>(1.5); // 1.5 m/s

  const [specRows, setSpecRows] = useState(() => {
    try {
      const saved = localStorage.getItem(SPEC_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage read error
    }
    return OFFICIAL_SPEC_FIELDS;
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editStatusValue, setEditStatusValue] = useState<string>('');
  const [editDescValue, setEditDescValue] = useState<string>('');
  const [editError, setEditError] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(SPEC_STORAGE_KEY, JSON.stringify(specRows));
    } catch {
      // ignore storage write error
    }
  }, [specRows]);

  const handleStartEditRow = (row: { field: string; description: string; statusText: string }) => {
    setEditingField(row.field);
    setEditStatusValue(row.statusText);
    setEditDescValue(row.description);
    setEditError('');
    soundEffects.playClick();
  };

  const handleSaveSpecRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;
    if (!editStatusValue.trim() || !editDescValue.trim()) {
      setEditError('يرجى إدخال مرجع الاعتماد والوصف قبل الحفظ.');
      return;
    }

    setSpecRows((prev) =>
      prev.map((r) =>
        r.field === editingField
          ? {
              ...r,
              description: editDescValue.trim(),
              statusText: editStatusValue.trim(),
            }
          : r
      )
    );
    soundEffects.playSuccessChime();
    showToast({
      title: 'تم تحديث جدول المواصفات الفنية',
      message: `تم تحديث بند «${editingField}» بالمرجع المعتمد: ${editStatusValue.trim()}`,
      variant: 'success',
    });
    setEditingField(null);
    setEditError('');
  };

  const handleResetSpecs = () => {
    setSpecRows(OFFICIAL_SPEC_FIELDS);
    setEditingField(null);
    soundEffects.playClick();
    showToast({
      title: 'استعادة جدول المواصفات الافتراضي',
      message: 'تمت إعادة جميع بنود المواصفات الفنية إلى مرجع جدول المصنع المعتمد.',
      variant: 'info',
    });
  };

  const innerDiameterMm = Math.max(
    1,
    selectedPipe.outerDiameterMm - 2 * selectedPipe.wallThicknessMm
  );

  const flow = calculateWaterFlow(innerDiameterMm, waterVelocity);
  const totalPipesNeeded = Math.ceil(projectLengthMeters / 6);

  const currentCategory = DIGITAL_CATALOG.find((c) => c.id === selectedCategory) || DIGITAL_CATALOG[0];
  const visibleSections =
    selectedProfileSection === 'all'
      ? INTRODUCTORY_CATALOG_SECTIONS
      : INTRODUCTORY_CATALOG_SECTIONS.filter((s) => s.id === selectedProfileSection);

  return (
    <div className="space-y-8 pb-12">
      {/* Intro Header */}
      <section className="no-print bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A73C7]"></span>
            <span className="text-xs font-bold text-sky-400">
              {FACTORY_CONTACT.brandAr} • {FACTORY_CONTACT.slogan}
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white">
            الكتالوج التعريفي لمصنع جيزان M&amp;B وحاسبة التمديدات
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            {FACTORY_CONTACT.tagline} — صياغة فنية وتسويقية معتمدة تخدم السباك والمزارع والمقاول
            والموزع، مع اعتماد الأرقام الدقيقة للسماكات والضغوط من جداول المصنع الرسمية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={FACTORY_CONTACT.whatsappCatalogRequestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب المصنع ({FACTORY_CONTACT.phoneDisplay})</span>
          </a>
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onRequestQuote();
            }}
            className="bg-[#C81D25] hover:bg-[#a6171e] text-white px-5 py-3 rounded-xl font-bold text-xs shadow-lg shadow-red-950/50 transition flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>طلب الجداول المعتمدة والتسعير</span>
          </button>
        </div>
      </section>

      {/* Main Mode Tabs: Brochure (PDF/Word) | 14-Section Introductory Catalog | 5 Product Categories | Calculator & Official Spec Fields */}
      <div className="no-print flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveCatalogTab('brochure');
            soundEffects.playClick();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeCatalogTab === 'brochure'
              ? 'bg-[#C81D25] text-white shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>بروشور الكتالوج الاحترافي (PDF / Word)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveCatalogTab('profile-14');
            soundEffects.playClick();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeCatalogTab === 'profile-14'
              ? 'bg-[#0A73C7] text-white shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>الكتالوج التعريفي الشامل (14 محوراً)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveCatalogTab('catalog');
            soundEffects.playClick();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeCatalogTab === 'catalog'
              ? 'bg-[#0A73C7] text-white shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>كتالوج المنتجات (المواسير والتوصيلات)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveCatalogTab('calculator');
            soundEffects.playClick();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeCatalogTab === 'calculator'
              ? 'bg-[#0A73C7] text-white shadow-md'
              : 'text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>حاسبة التدفق وهيكل الجداول الرسمية</span>
        </button>
      </div>

      {/* VIEW BROCHURE: Executive Printable & Word/HTML Exportable Catalog */}
      {activeCatalogTab === 'brochure' && (
        <CatalogBrochureView specRows={specRows} onRequestQuote={onRequestQuote} />
      )}

      {/* VIEW 0: Complete 14-Section Introductory Catalog */}
      {activeCatalogTab === 'profile-14' && (
        <section className="space-y-6" data-testid="introductory-catalog-14">
          {/* Quick Section Filter Pills */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0A73C7]" />
                <span>تصفح محاور الكتالوج التعريفي لمصنع جيزان M&amp;B:</span>
              </span>
              <span className="text-[11px] text-amber-300 font-semibold">
                الأرقام الفنية الدقيقة للسماكات والضغوط تُعتمد من جداول المصنع الرسمية
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedProfileSection('all');
                  soundEffects.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedProfileSection === 'all'
                    ? 'bg-[#C81D25] text-white'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                عرض الكل (14)
              </button>
              {INTRODUCTORY_CATALOG_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setSelectedProfileSection(sec.id);
                    soundEffects.playClick();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedProfileSection === sec.id
                      ? 'bg-[#0A73C7] text-white'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {sec.number} | {sec.title}
                </button>
              ))}
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-5">
            {visibleSections.map((sec) => (
              <article
                key={sec.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-[#C81D25]/20 border border-[#C81D25]/40 text-[#f87171] font-mono font-black text-sm flex items-center justify-center shrink-0">
                      {sec.number}
                    </span>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white">{sec.title}</h3>
                      {sec.subtitle && (
                        <span className="text-xs font-mono text-sky-400 font-bold block mt-0.5">
                          {sec.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{sec.summary}</p>

                {/* Special Quality Pipeline Flow for Section 09 */}
                {sec.id === 'factory-quality' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 pt-1">
                    {QUALITY_PIPELINE_STEPS.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-1"
                      >
                        <span className="inline-flex w-6 h-6 rounded-full bg-[#0A73C7]/20 text-sky-300 font-mono text-xs font-black items-center justify-center">
                          {idx + 1}
                        </span>
                        <p className="text-[11px] font-bold text-white leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cards Grid */}
                {sec.cards && sec.cards.length > 0 && (
                  <div
                    className={`grid gap-3 ${
                      sec.cards.length >= 8
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        : sec.cards.length === 4
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        : 'grid-cols-1 md:grid-cols-3'
                    }`}
                  >
                    {sec.cards.map((card, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-1.5 hover:border-slate-700 transition"
                      >
                        {card.tag && (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/50 mb-1">
                            {card.tag}
                          </span>
                        )}
                        <h4 className="font-extrabold text-sm text-white">{card.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{card.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bullets Grid (for sections other than 09 pipeline) */}
                {sec.bullets && sec.bullets.length > 0 && sec.id !== 'factory-quality' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {sec.bullets.map((bullet, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/80 border border-slate-800/90 px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs text-slate-200 font-semibold"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section 14 Direct Contact Buttons */}
                {sec.id === 'contact' && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`tel:${FACTORY_CONTACT.phoneIntl}`}
                      className="bg-[#C81D25] hover:bg-[#a6171e] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span dir="ltr">{FACTORY_CONTACT.phoneDisplay}</span>
                    </a>
                    <a
                      href={FACTORY_CONTACT.whatsappCatalogRequestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>طلب الجداول المعتمدة عبر واتساب</span>
                    </a>
                    <a
                      href={FACTORY_CONTACT.googleProfileShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition border border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4 text-sky-400" />
                      <span>ملف المصنع على Google</span>
                    </a>
                    <a
                      href={FACTORY_CONTACT.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition border border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                      <span>خرائط Google (الجندية، تعز)</span>
                    </a>
                    <a
                      href={FACTORY_CONTACT.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0A73C7] hover:bg-[#0862a9] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>الصفحة الرسمية على Facebook</span>
                    </a>
                  </div>
                )}

                {sec.note && (
                  <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl px-4 py-2.5 text-xs text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{sec.note}</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* VIEW 1: Digital Catalog */}
      {activeCatalogTab === 'catalog' && (
        <section className="space-y-6">
          {/* Category Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {DIGITAL_CATALOG.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    soundEffects.playClick();
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#C81D25] text-white shadow-lg ring-1 ring-[#C81D25]'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Category Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white">{currentCategory.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentCategory.description}</p>
              </div>
              <span className="text-xs font-mono text-sky-400 font-bold">
                {currentCategory.nameEn}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {currentCategory.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-white text-base">{item.name}</h4>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800/60">
                      {item.color}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-900 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block font-semibold mb-1">
                        المقاسات المتوفرة المعتمدة:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.availableSizes.map((sz) => (
                          <span
                            key={sz}
                            className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-sky-300 font-bold text-xs font-mono"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
                      <span>طريقة التعبئة: <strong className="text-slate-200">{item.packaging}</strong></span>
                      <span className="text-emerald-400 font-bold">جاهز للتوريد</span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic pt-1">{item.notes}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How to order box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">كيف تطلب من الكتالوج؟</span>
                <p className="text-slate-400">
                  أرسل اسم المنتج، المقاس المطلوب، الكمية التقريبية، والمدينة إلى مبيعات مصنع جيزان.
                </p>
              </div>

              <a
                href={FACTORY_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 flex-shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>أرسل «كتالوج» على واتساب ({FACTORY_CONTACT.phoneDisplay})</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 2: Hydraulic Calculator & Standard Specs */}
      {activeCatalogTab === 'calculator' && (
        <>
          <section className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-6">
              <Calculator className="w-6 h-6 text-[#0A73C7]" />
              <h3 className="text-lg sm:text-xl font-black text-white">
                حاسبة التمديدات المائية ومعدل التدفق (Flow & Sizing Calculator)
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    اختر مقاس الماسورة (UPVC Class PN16):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {JIZAN_PIPE_CATALOG.map((pipe) => {
                      const isSelected = selectedPipe.nominalInch === pipe.nominalInch;
                      return (
                        <button
                          key={pipe.nominalInch}
                          onClick={() => {
                            setSelectedPipe(pipe);
                            soundEffects.playClick();
                          }}
                          className={`py-2 px-2.5 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                            isSelected
                              ? 'bg-[#0A73C7] text-white shadow-md ring-1 ring-sky-300'
                              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                          }`}
                        >
                          {pipe.nominalInch}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {pipe.outerDiameterMm} مم
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">
                      إجمالي طول خط التمديد في المشروع:
                    </span>
                    <span className="font-mono text-sky-400 font-bold text-sm">
                      {projectLengthMeters} متر
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="600"
                    step="6"
                    value={projectLengthMeters}
                    onChange={(e) => {
                      setProjectLengthMeters(Number(e.target.value));
                      soundEffects.playClick();
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0A73C7]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">
                      سرعة سريان المياه الموصى بها:
                    </span>
                    <span className="font-mono text-sky-400 font-bold text-sm">
                      {waterVelocity} م/ثانية
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={waterVelocity}
                    onChange={(e) => {
                      setWaterVelocity(Number(e.target.value));
                      soundEffects.playClick();
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0A73C7]"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-slate-400 block border-b border-slate-800 pb-2">
                  نتائج الحساب الهندسي للمقاس المختار ({selectedPipe.nominalInch} - {selectedPipe.outerDiameterMm}مم):
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">معدل تدفق المياه</span>
                    <span className="text-lg font-black text-sky-400 font-mono">
                      {flow.litersPerMin}
                    </span>
                    <span className="text-[10px] text-slate-500 block">لتر / دقيقة</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">التدفق بالساعة</span>
                    <span className="text-lg font-black text-sky-400 font-mono">
                      {flow.cubicMetersPerHour}
                    </span>
                    <span className="text-[10px] text-slate-500 block">متر مكعب / ساعة</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">عدد المواسير (طول 6م)</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      {totalPipesNeeded} حبة
                    </span>
                    <span className="text-[10px] text-slate-500 block">ماسورة طول 6 أمتار</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">السماكة وفئة الضغط (PN/SDR)</span>
                    <span className="text-sm font-black text-amber-300">
                      حسب جدول المصنع المعتمد
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      تُعتمد القيم الدقيقة من جداول المصنع قبل التوريد
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Official Catalog Table Fields Policy (No unconfirmed thickness/pressure figures) */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>هيكل جدول المواصفات الفنية الرسمي لمواسير وتوصيلات جيزان M&amp;B</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  لضمان الدقة الهندسية وعدم إدراج مواصفات غير مؤكدة، تُدرج السماكات والأوزان وفئات الضغط
                  (PN / SDR) حصريًا وفق جداول المصنع الرسمية المعتمدة لكل فئة ومقاس.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEditRow(specRows[0])}
                  className="bg-[#0A73C7] hover:bg-[#0862a9] text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>تحديث جدول المواصفات</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSpecs}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border border-slate-700"
                  title="استعادة القيم الافتراضية"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة الافتراضي</span>
                </button>
                <a
                  href={FACTORY_CONTACT.whatsappCatalogRequestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>اطلب الجدول المعتمد ({FACTORY_CONTACT.phoneDisplay})</span>
                </a>
              </div>
            </div>

            {/* Inline Spec Row Editor */}
            {editingField && (
              <form
                onSubmit={handleSaveSpecRow}
                className="p-5 bg-slate-950/90 border-b border-slate-800 space-y-3"
                data-testid="spec-edit-form"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-sky-400">
                    تحديث بيانات البند الفني: {editingField}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    aria-label="إلغاء التعديل"
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="spec-status-input"
                      className="block text-[11px] font-bold text-slate-300 mb-1"
                    >
                      القيمة المعتمدة / رقم جدول المصنع:
                    </label>
                    <input
                      id="spec-status-input"
                      type="text"
                      value={editStatusValue}
                      onChange={(e) => setEditStatusValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0A73C7]"
                      placeholder="مثال: معتمد حسب جدول المصنع رقم JZ-2026"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="spec-desc-input"
                      className="block text-[11px] font-bold text-slate-300 mb-1"
                    >
                      الوصف والمعايير الفنية:
                    </label>
                    <input
                      id="spec-desc-input"
                      type="text"
                      value={editDescValue}
                      onChange={(e) => setEditDescValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#0A73C7]"
                    />
                  </div>
                </div>

                {editError && (
                  <p className="text-xs text-red-400 font-semibold">{editError}</p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ التحديث وإرسال تنبيه</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">البند الفني في الكتالوج الرسمي</th>
                    <th className="py-3 px-4">الوصف والمعايير المرتبطة</th>
                    <th className="py-3 px-4">مرجع الاعتماد</th>
                    <th className="py-3 px-4">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {specRows.map((row) => (
                    <tr key={row.field} className="hover:bg-slate-800/40 text-slate-200">
                      <td className="py-3.5 px-4 font-bold text-sky-400">{row.field}</td>
                      <td className="py-3.5 px-4 text-slate-300">{row.description}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            row.statusText === 'حسب جدول المصنع المعتمد'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {row.statusText}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleStartEditRow(row)}
                          aria-label={`تحديث بند ${row.field}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition"
                        >
                          <Pencil className="w-3 h-3 text-sky-400" />
                          <span>تحديث</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
