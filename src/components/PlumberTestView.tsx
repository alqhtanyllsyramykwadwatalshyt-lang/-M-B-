import React, { useState } from 'react';
import { PLUMBER_CHALLENGES, CAMPAIGN_30_DAYS } from '../data/factoryData';
import { evaluateStressTest } from '../utils/pipeCalculations';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Gauge,
  Hammer,
  RotateCw,
  Droplet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Download,
  Calendar,
  ClipboardCheck,
  Sliders,
  Sparkles,
  Info,
  Check,
  MessageCircle,
} from 'lucide-react';

export const PlumberTestView: React.FC = () => {
  const [pressure, setPressure] = useState<number>(25);
  const [dropHeight, setDropHeight] = useState<number>(2.0);
  const [bendAngle, setBendAngle] = useState<number>(30);
  const [isAuthenticBlueLine, setIsAuthenticBlueLine] = useState<boolean>(true);
  const [plumberName, setPlumberName] = useState<string>('فني السباكة المعتمد');
  const [activeTab, setActiveTab] = useState<'checklist' | 'simulation' | '30days' | 'certificate'>('checklist');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Interactive 4-point plumber checklist state
  const [checklist, setChecklist] = useState({
    correctSize: true,
    cleanEdges: true,
    noVisibleFlaws: true,
    appropriateFitting: true,
  });

  const evaluation = evaluateStressTest({
    pressureBar: pressure,
    impactDropHeightM: dropHeight,
    bendAngleDeg: bendAngle,
    isAuthenticBlueLine,
  });

  const triggerRunAllTests = () => {
    setIsTesting(true);
    soundEffects.playPressurePump(220);

    setTimeout(() => {
      soundEffects.playImpactClang();
      setTimeout(() => {
        setIsTesting(false);
        if (evaluation.scorePercent >= 80) {
          soundEffects.playSuccessChime();
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#C81D25', '#0A73C7', '#ffffff'],
          });
        }
      }, 400);
    }, 600);
  };

  const handleResetDefaults = () => {
    setPressure(25);
    setDropHeight(2.0);
    setBendAngle(30);
    setIsAuthenticBlueLine(true);
    soundEffects.playClick();
  };

  const filteredDays = CAMPAIGN_30_DAYS.filter((d) => d.week === selectedWeek);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071827] via-[#0d2238] to-[#071827] border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-xs font-bold text-red-300">
              <Award className="w-4 h-4 text-[#C81D25]" />
              <span>حملة «اختبار السباك» • مصنع جيزان للصناعات البلاستيكية (تعز)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              «المنتج الجيد يثبت نفسه عند التركيب»
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              نضع منتجات جيزان أمام الاختبار العملي الذي يهم فني التركيب: وضوح المقاس، نظافة الحواف،
              سهولة التوافق، وانتظام المنتج بدون ادعاءات تسويقية.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={triggerRunAllTests}
              disabled={isTesting}
              className={`px-6 py-3.5 rounded-xl font-extrabold text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                isTesting
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-[#C81D25] hover:bg-[#a6171e] text-white shadow-red-950/50'
              }`}
            >
              {isTesting ? (
                <span>جاري تنفيذ الفحص التوضيحي...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>بدء الفحص التوضيحي الشامل</span>
                </>
              )}
            </button>
            <a
              href="https://wa.me/?text=%D9%83%D8%AA%D8%A7%D9%84%D9%88%D8%AC"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>أرسل «كتالوج» على واتساب</span>
            </a>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => {
              setActiveTab('checklist');
              soundEffects.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-[#0A73C7] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>قائمة فحص السباك (4 خطوات قبل التركيب)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('simulation');
              soundEffects.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-[#0A73C7] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>محاكي الفحص التوضيحي المباشر</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('30days');
              soundEffects.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === '30days'
                ? 'bg-[#0A73C7] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>خطة شهر حملة «اختبار السباك» (30 يوماً)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('certificate');
              soundEffects.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-[#0A73C7] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>بطاقة فحص السباك المعتمد</span>
          </button>
        </div>
      </section>

      {/* TAB 1: 4-Point Checklist */}
      {activeTab === 'checklist' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <ClipboardCheck className="w-5 h-5 text-[#C81D25]" />
                <h3 className="font-extrabold text-white text-base">
                  قائمة فحص السباك الأساسية — 4 نقاط قبل التركيب
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                قبل إدخال الماسورة في الوصلة أو وضع المادة اللاصقة في موقع العمل، ينصح فنيو التركيب
                بمراجعة هذه النقاط الأربع لضمان عمل سريع وخالٍ من الأخطاء:
              </p>

              <div className="space-y-3 pt-2">
                {[
                  {
                    key: 'correctSize' as const,
                    title: '1. هل المقاس مطابق للمطلوب في المخطط أو الموقع؟',
                    desc: 'طابق المقاس المطبوع على الماسورة والتوصيلة مع قطر الشبكة المصمم، ولا تعتمد على الشكل فقط.',
                  },
                  {
                    key: 'cleanEdges' as const,
                    title: '2. هل الحواف نظيفة ومشطوفة بزاوية مناسبة؟',
                    desc: 'تحقق من نظافة حافة القطع وخلوها من الرايش ووجود شطف دائري يسهل الانزلاق داخل الوصلة.',
                  },
                  {
                    key: 'noVisibleFlaws' as const,
                    title: '3. هل القطعة خالية من العيب الظاهر أو الشروخ؟',
                    desc: 'فحص بصري سريع أمام الضوء للتأكد من استقامة الماسورة وسلامة جدار التوصيلة.',
                  },
                  {
                    key: 'appropriateFitting' as const,
                    title: '4. هل نوع الوصلة مناسب للتطبيق؟',
                    desc: 'تأكد من اختيار القطعة المعتمدة للغرض (كوع لتغيير المسار، تيه للتفرع، جلبة للربط المستمر).',
                  },
                ].map((item) => {
                  const isChecked = checklist[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        setChecklist({ ...checklist, [item.key]: !isChecked });
                        soundEffects.playClick();
                      }}
                      className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-slate-800/90 border-emerald-500/50 shadow-md'
                          : 'bg-slate-950/70 border-slate-800 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <span className="text-xs font-bold text-sky-400 block border-b border-slate-800 pb-2">
                نتيجة الفحص الأولي للمنتج
              </span>

              <div className="text-center py-4">
                <div className="text-4xl font-black text-white font-mono">
                  {Object.values(checklist).filter(Boolean).length} / 4
                </div>
                <span className="text-xs text-emerald-400 font-bold block mt-1">
                  {Object.values(checklist).every(Boolean)
                    ? 'جاهز للتركيب وفق الأصول الهندسية'
                    : 'يُرجى مراجعة النقاط غير المكتملة'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                <p className="leading-relaxed">
                  «الفحص البصري لا يغني عن الاختبارات الفنية الرسمية، لكنه خطوة عملية يبدأ بها السباك
                  المحترف لمنع إعادة العمل وهدر المواد في الموقع.»
                </p>
              </div>

              <a
                href="https://wa.me/?text=%D9%83%D8%AA%D8%A7%D9%84%D9%88%D8%AC"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0A73C7] hover:bg-[#0862a9] text-white py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>أرسل «كتالوج» على واتساب لمعرفة المقاسات</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Physical Interactive Simulation */}
      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#0A73C7]" />
                  <span>متغيرات الفحص التوضيحي العملي</span>
                </h3>
                <span className="text-[11px] text-slate-400">فحص تعليمي</span>
              </div>

              {/* Slider 1: Pressure Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-sky-400" />
                    <span>ضغط المياه المطبق (توضيحي):</span>
                  </span>
                  <span className="font-mono font-bold text-base text-sky-400">
                    {pressure} بار (Bar)
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={pressure}
                  onChange={(e) => {
                    setPressure(Number(e.target.value));
                    soundEffects.playPressurePump(140 + Number(e.target.value) * 3);
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0A73C7]"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5 بار</span>
                  <span className="text-amber-400">16 بار (المعتاد)</span>
                  <span className="text-red-400">35 بار (الفحص التوضيحي)</span>
                </div>
              </div>

              {/* Slider 2: Hammer Drop Height */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Hammer className="w-4 h-4 text-orange-400" />
                    <span>ارتفاع إسقاط المطرقة (وزن 5 كجم):</span>
                  </span>
                  <span className="font-mono font-bold text-base text-orange-400">
                    {dropHeight} م
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={dropHeight}
                  onChange={(e) => {
                    setDropHeight(Number(e.target.value));
                    soundEffects.playClick();
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Slider 3: Bending Angle */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <RotateCw className="w-4 h-4 text-indigo-400" />
                    <span>زاوية الانحناء والإجهاد الميكانيكي:</span>
                  </span>
                  <span className="font-mono font-bold text-base text-indigo-400">
                    {bendAngle}° درجة
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={bendAngle}
                  onChange={(e) => {
                    setBendAngle(Number(e.target.value));
                    soundEffects.playClick();
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Toggle 4: Authentic Blue Line Joint vs Generic */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="block text-xs font-bold text-slate-200">
                  فحص إحكام التوصيلة والخط الأزرق المميز:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsAuthenticBlueLine(true);
                      soundEffects.playClick();
                    }}
                    className={`p-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isAuthenticBlueLine
                        ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-300"></div>
                    <span>توصيلة M&B (خط أزرق)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAuthenticBlueLine(false);
                      soundEffects.playClick();
                    }}
                    className={`p-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      !isAuthenticBlueLine
                        ? 'bg-red-800 text-white shadow-md ring-1 ring-red-400'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
                    <span>توصيلة تجارية بدون خط</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">منصة الفحص التوضيحي</h3>
                <span className="text-xs text-emerald-400 font-bold">
                  {evaluation.overallRating}
                </span>
              </div>

              {/* Physical Pipe Simulation Visual */}
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md bg-slate-900/90 rounded-2xl p-6 border border-slate-800 relative">
                  <div
                    className="relative mx-auto transition-transform duration-300"
                    style={{
                      transform: `rotate(${bendAngle * 0.15}deg)`,
                      transformOrigin: 'right center',
                    }}
                  >
                    <div className="h-16 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 rounded-r-xl border-y-2 border-slate-400 relative flex items-center justify-between px-4 shadow-lg overflow-hidden">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm text-[#C81D25]">
                          JIZAN • جيزان
                        </span>
                        <span className="text-[10px] font-mono text-slate-800 font-bold hidden sm:inline">
                          UPVC PIPE 2&quot;
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-0 -left-6 h-16 w-14 bg-gradient-to-r from-slate-300 to-slate-200 rounded-l-xl border-2 border-slate-400 shadow-xl flex items-center justify-center">
                      {isAuthenticBlueLine ? (
                        <div className="w-3 h-full bg-[#0A73C7] shadow-sm animate-pulse"></div>
                      ) : (
                        <div className="w-1 h-full bg-slate-400"></div>
                      )}
                    </div>
                  </div>

                  {!isAuthenticBlueLine && (
                    <div className="absolute bottom-4 left-10 flex items-center gap-1 text-red-400 text-xs font-bold animate-bounce">
                      <Droplet className="w-4 h-4 fill-current text-red-500" />
                      <span>تسريب مياه من حافة التوصيلة</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-white block mb-1">ملاحظة الضوابط الرسمية:</span>
                <p>
                  «هذا فحص توضيحي للمقارنة والمطابقة، والاختبارات الرسمية تخضع لتقارير الفحص والاعتمادات الصادرة عن إدارة المصنع.»
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 30-Day Campaign Calendar */}
      {activeTab === '30days' && (
        <section className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-[#C81D25] block">
                  خطة شهر كامل لحملة «اختبار السباك»
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  جدول المحتوى اليومي والأسبوعي (TikTok, Reels, Instagram, WhatsApp)
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                {[1, 2, 3, 4].map((wk) => (
                  <button
                    key={wk}
                    onClick={() => {
                      setSelectedWeek(wk);
                      soundEffects.playClick();
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      selectedWeek === wk
                        ? 'bg-[#0A73C7] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    الأسبوع {wk}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredDays.map((day) => (
                <div
                  key={day.day}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-extrabold text-xs">
                        اليوم {day.day}
                      </span>
                      <h4 className="font-extrabold text-sm text-white">{day.title}</h4>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                      {day.type === 'video' ? 'فيديو قصير' : day.type === 'post' ? 'منشور ثابت' : day.type === 'story' ? 'قصة تفاعلية' : 'ملخص أسبوعي'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{day.summary}</p>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-200">
                    <span className="text-[10px] font-bold text-sky-400 block mb-0.5">النص / المحتوى:</span>
                    <p>{day.scriptOrContent}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400 font-semibold">الدعوة للإجراء: {day.cta}</span>
                    <a
                      href="https://wa.me/?text=%D9%83%D8%AA%D8%A7%D9%84%D9%88%D8%AC"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      أرسل كتالوج
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: Plumber Inspection Card */}
      {activeTab === 'certificate' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1">
              <label htmlFor="plumber-input" className="block text-xs font-bold text-slate-300 mb-1">
                اسم الفني / السباك للفحص:
              </label>
              <input
                id="plumber-input"
                type="text"
                value={plumberName}
                onChange={(e) => setPlumberName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs"
                placeholder="أدخل اسمك هنا"
              />
            </div>
            <button
              onClick={() => {
                window.print();
                soundEffects.playClick();
              }}
              className="bg-[#0A73C7] hover:bg-[#0862a9] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>طباعة بطاقة الفحص</span>
            </button>
          </div>

          <div className="bg-white text-slate-900 p-8 rounded-3xl border-4 border-slate-300 shadow-2xl space-y-4 text-center">
            <img
              src="/assets/aistudio/image-1791387165348__1__e8778707.png"
              alt="شعار جيزان"
              className="h-10 mx-auto object-contain"
            />
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                بطاقة فحص السباك الميدانية
              </h2>
              <span className="text-xs text-slate-600 block">
                مصنع جيزان للصناعات البلاستيكية — تعز، اليمن
              </span>
            </div>

            <div className="py-2 border-y border-dashed border-slate-300">
              <span className="text-xs text-slate-500 block">فني الفحص والتركيب:</span>
              <span className="text-lg font-black text-[#0A73C7]">{plumberName}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-right bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>✓ مطابقة المقاس: <strong>تمت المراجعة</strong></div>
              <div>✓ نظافة الحواف: <strong>مشطوفة ونظيفة</strong></div>
              <div>✓ سلامة القطعة: <strong>خالية من العيوب</strong></div>
              <div>✓ الخط الأزرق M&B: <strong>أصلي ومعتمد</strong></div>
            </div>

            <p className="text-[11px] text-slate-500">
              «المنتج الجيد يثبت نفسه عند التركيب» • مصنع جيزان للصناعات البلاستيكية
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
