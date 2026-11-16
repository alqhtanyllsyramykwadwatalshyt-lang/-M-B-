import React, { useState } from 'react';
import {
  Printer,
  FileDown,
  FileCode2,
  PhoneCall,
  MapPin,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  CloudUpload,
} from 'lucide-react';
import {
  FACTORY_CONTACT,
  QUALITY_PIPELINE_STEPS,
  QUALITY_TESTS,
} from '../data/catalogProfile';
import { DIGITAL_CATALOG } from '../data/factoryData';
import {
  buildCatalogDocumentHtml,
  triggerFileDownload,
  SpecRowExport,
} from '../utils/catalogExport';
import { useToast } from '../context/ToastContext';
import { soundEffects } from '../utils/soundEffects';

import pipesShowcaseImg from '../assets/images/jizan_upvc_pipes_showcase_1794835748555.jpg';
import fittingsShowcaseImg from '../assets/images/mb_pvc_fittings_showcase_1794835748381.jpg';
import qualityBenchImg from '../assets/images/jizan_quality_inspection_bench_1794835748684.jpg';

interface CatalogBrochureViewProps {
  specRows: SpecRowExport[];
  onRequestQuote: () => void;
  onOpenGoogleDrive?: () => void;
}

interface BrochureImageProps {
  src: string;
  alt: string;
  aspectClass?: string;
  fallbackTitle: string;
}

const BrochureImage: React.FC<BrochureImageProps> = ({
  src,
  alt,
  aspectClass = 'aspect-[4/3]',
  fallbackTitle,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`${aspectClass} w-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex flex-col items-center justify-center p-4 text-center`}
      >
        <Layers className="w-8 h-8 text-[#0A73C7] mb-2" />
        <span className="text-xs font-bold text-slate-700">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <div className={`${aspectClass} w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export const CatalogBrochureView: React.FC<CatalogBrochureViewProps> = ({
  specRows,
  onRequestQuote,
  onOpenGoogleDrive,
}) => {
  const { showToast } = useToast();

  const handlePrintPdf = () => {
    soundEffects.playSuccessChime();
    showToast({
      title: 'تجهيز الكتالوج بصيغة PDF للطباعة',
      message: 'اختر «حفظ كملف PDF / Save as PDF» من نافذة الطباعة لحفظ النسخة الرسمية.',
      variant: 'info',
    });
    window.setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownloadWord = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const docHtml = buildCatalogDocumentHtml(specRows, { baseUrl, forWord: true });
    triggerFileDownload(docHtml, 'jizan-mb-catalog.doc', 'application/msword');
    soundEffects.playSuccessChime();
    showToast({
      title: 'تم تحميل كتالوج Word (.doc)',
      message: 'تم تصدير كتالوج مصنع جيزان M&B الرسمي بصيغة قابلة للتحرير في Microsoft Word.',
      variant: 'success',
    });
  };

  const handleDownloadHtml = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const html = buildCatalogDocumentHtml(specRows, { baseUrl, forWord: false });
    triggerFileDownload(html, 'jizan-mb-catalog.html', 'text/html');
    soundEffects.playSuccessChime();
    showToast({
      title: 'تم تحميل الكتالوج التفاعلي (.html)',
      message: 'تم حفظ نسخة ويب مستقلة من كتالوج جيزان M&B متضمنة كافة الروابط الرسمية.',
      variant: 'success',
    });
  };

  return (
    <section className="space-y-6" data-testid="catalog-brochure-view">
      {/* Export & Print Toolbar (Hidden when printing) */}
      <div className="no-print bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-white">
            إخراج وتصدير كتالوج مصنع جيزان M&amp;B الرسمي
          </h3>
          <p className="text-xs text-slate-400">
            نسخة بروشور احترافية جاهزة للطباعة أو الحفظ بصيغة PDF وتصدير Word متضمنة الشعار الأصلي
            وبيانات التواصل المعتمدة في الجندية، تعز.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handlePrintPdf}
            data-testid="export-pdf-btn"
            className="bg-[#C81D25] hover:bg-[#a6171e] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadWord}
            data-testid="export-word-btn"
            className="bg-[#0A73C7] hover:bg-[#0862a9] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileDown className="w-4 h-4" />
            <span>تحميل نسخة Word (.doc)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            data-testid="export-html-btn"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileCode2 className="w-4 h-4 text-sky-400" />
            <span>تحميل نسخة HTML</span>
          </button>

          {onOpenGoogleDrive && (
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                onOpenGoogleDrive();
              }}
              data-testid="open-drive-from-brochure-btn"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <CloudUpload className="w-4 h-4" />
              <span>حفظ في Google Drive</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable White-Paper Executive Brochure */}
      <article className="print-brochure bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Brochure Cover Header */}
        <div className="bg-[#071827] text-white p-6 sm:p-10 border-b-4 border-[#C81D25]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-md shrink-0">
                <img
                  src={FACTORY_CONTACT.logoSrc}
                  alt="شعار مصنع جيزان للصناعات البلاستيكية"
                  referrerPolicy="no-referrer"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-sky-300 tracking-wide block">
                  {FACTORY_CONTACT.brandEn}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {FACTORY_CONTACT.brandAr}
                </h1>
                <p className="text-sm font-bold text-[#f87171]">
                  {FACTORY_CONTACT.slogan} · {FACTORY_CONTACT.tagline}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 text-xs space-y-1.5 shrink-0">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <MapPin className="w-4 h-4 text-[#C81D25] shrink-0" />
                <span>{FACTORY_CONTACT.addressAr}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <PhoneCall className="w-4 h-4 text-[#0A73C7] shrink-0" />
                <span dir="ltr" className="font-mono tabular-nums">
                  {FACTORY_CONTACT.phoneDisplay}
                </span>
                <span className="text-slate-400 font-normal">(هاتف وواتساب)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-10">
          {/* Dual Brand System + Real Product Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 space-y-3">
              <BrochureImage
                src={pipesShowcaseImg}
                alt="مواسير UPVC مصنع جيزان للأنابيب البلاستيكية"
                aspectClass="aspect-[16/9]"
                fallbackTitle="مواسير UPVC — علامة JIZAN"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div>
                  <span className="text-xs font-bold text-[#C81D25]">العلامة الأولى · JIZAN</span>
                  <h2 className="text-lg font-black text-slate-900">مواسير UPVC للمياه والصرف والري</h2>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  حواف نظيفة مشطوفة · سطح داخلي أملس · أطوال قياسية
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
              <BrochureImage
                src={fittingsShowcaseImg}
                alt="توصيلات PVC علامة M&B بالخط الأزرق المميز"
                aspectClass="aspect-[4/3]"
                fallbackTitle="توصيلات PVC بالخط الأزرق — علامة M&B"
              />
              <div className="px-1">
                <span className="text-xs font-bold text-[#0A73C7]">العلامة الثانية · M&amp;B</span>
                <h2 className="text-lg font-black text-slate-900">
                  توصيلات PVC ذات الخط الأزرق المميز
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  أكواع 90° و45°، تيهات، جلب مستقيمة، محولات تخفيض، وسدادات بعلامة الخط الأزرق لسرعة
                  التمييز والمطابقة في موقع العمل.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Product Portfolio Summary Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-[#0A73C7]">01 · تشكيلة المنتجات</span>
                <h3 className="text-xl font-black text-slate-900">
                  منظومة المواسير والتوصيلات المعتمدة (JIZAN + M&amp;B)
                </h3>
              </div>
              <span className="text-xs text-slate-600">
                تخدم قطاعات: المياه · السباكة · الصرف الصحي · الري · المقاولات · البنية التحتية
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="py-3 px-4 font-bold">الفئة والمنتج</th>
                    <th className="py-3 px-4 font-bold">الهوية اللونية</th>
                    <th className="py-3 px-4 font-bold">المقاسات المتوفرة</th>
                    <th className="py-3 px-4 font-bold">التعبئة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {DIGITAL_CATALOG.flatMap((cat) =>
                    cat.items.map((item, idx) => (
                      <tr key={`${cat.id}-${idx}`} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{item.description}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#0A73C7] whitespace-nowrap">
                          {item.color}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-800" dir="ltr">
                          {item.availableSizes.join(' · ')}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{item.packaging}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quality Control + Lab Image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6">
            <div className="lg:col-span-5">
              <BrochureImage
                src={qualityBenchImg}
                alt="مختبر فحص الأبعاد والجودة في مصنع جيزان"
                aspectClass="aspect-[4/3]"
                fallbackTitle="مختبر الجودة وفحص الأبعاد"
              />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-bold text-[#C81D25]">02 · الجودة تبدأ من المصنع</span>
                <h3 className="text-xl font-black text-slate-900">
                  مسار ضبط الجودة (9 مراحل) والفحوصات الفنية
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  تبدأ جودة المنتج من اختيار خامات PVC والمثبتات المناسبة وتستمر عبر فحص الأبعاد
                  والقطر والاستدارة والتشطيب قبل التعبئة والتوريد.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUALITY_PIPELINE_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 flex items-center gap-2"
                  >
                    <span className="font-mono tabular-nums text-[#0A73C7]">
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-slate-700 pt-1">
                {QUALITY_TESTS.map((testItem) => (
                  <span key={testItem} className="inline-flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{testItem}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Official Specification Policy Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-black text-slate-900">
                03 · هيكل المواصفات الفنية المعتمدة في الكتالوج
              </h3>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 text-xs text-amber-900 flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                تُعتمد الأرقام الفنية الدقيقة للسماكات والأوزان وفئات الضغط (PN / SDR) حصريًا من جداول
                المصنع الرسمية عند الطلب والتوريد.
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-800 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">البند الفني</th>
                    <th className="py-2.5 px-4 font-bold">الوصف والمعايير</th>
                    <th className="py-2.5 px-4 font-bold">مرجع الاعتماد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {specRows.map((row) => (
                    <tr key={row.field}>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{row.field}</td>
                      <td className="py-2.5 px-4 text-slate-700">{row.description}</td>
                      <td className="py-2.5 px-4 font-bold text-[#0A73C7]">{row.statusText}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Contact & Channels Block */}
          <div className="bg-[#071827] text-white rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-300">04 · بيانات التواصل الرسمية المعتمدة</span>
              <h3 className="text-xl font-black text-white">{FACTORY_CONTACT.brandAr}</h3>
              <p className="text-xs text-slate-300">
                العنوان: {FACTORY_CONTACT.addressAr} · الهاتف والواتساب:{' '}
                <span dir="ltr" className="font-mono font-bold text-white">
                  {FACTORY_CONTACT.phoneDisplay}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <a
                  href={FACTORY_CONTACT.googleProfileShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:text-white underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>ملف المصنع على Google</span>
                </a>
                <span className="text-slate-600">·</span>
                <a
                  href={FACTORY_CONTACT.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:text-white underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>موقع المصنع على خرائط Google</span>
                </a>
                <span className="text-slate-600">·</span>
                <a
                  href={FACTORY_CONTACT.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-300 hover:text-white underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">YouTube · Instagram</span>
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={FACTORY_CONTACT.whatsappCatalogRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                <span>طلب الجداول عبر واتساب</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onRequestQuote();
                }}
                className="bg-[#C81D25] hover:bg-[#a6171e] text-white px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer whitespace-nowrap"
              >
                <span>طلب تسعير ومواصفات</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};
