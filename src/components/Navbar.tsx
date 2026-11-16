import React, { useState } from 'react';
import { ActiveScreen } from '../types';
import {
  Film,
  FlaskConical,
  Box,
  MapPin,
  Calculator,
  Volume2,
  VolumeX,
  PhoneCall,
  Download,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { FACTORY_CONTACT } from '../data/catalogProfile';

interface NavbarProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  onRequestQuote: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onSelectScreen,
  onRequestQuote,
}) => {
  const [isMuted, setIsMuted] = useState(soundEffects.getMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    soundEffects.setMuted(nextState);
    setIsMuted(nextState);
    if (!nextState) {
      soundEffects.playClick();
    }
  };

  const navItems: { id: ActiveScreen; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'video',
      label: 'جولة المصنع بالفيديو',
      icon: <Film className="w-4 h-4" />,
      badge: 'فيديو رسمي',
    },
    {
      id: 'stress-test',
      label: 'حملة اختبار السباك',
      icon: <FlaskConical className="w-4 h-4" />,
      badge: 'تفاعلي',
    },
    {
      id: '3d-viewer',
      label: 'المختبر ثلاثي الأبعاد 3D',
      icon: <Box className="w-4 h-4" />,
      badge: 'Three.js',
    },
    {
      id: 'map',
      label: 'موقع المصنع وشبكة التوزيع',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 'specs',
      label: 'المواصفات وحاسبة السباك',
      icon: <Calculator className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#071827]/95 border-b border-slate-800 shadow-xl backdrop-blur-md">
      {/* Top utility ribbon */}
      <div className="bg-[#05111c] border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              خطوط الإنتاج تعمل بكامل طاقتها • مصنع جيزان للصناعات البلاستيكية (تعز، اليمن)
            </span>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <span className="hidden md:inline-block text-slate-300">
              JIZAN &amp; M&amp;B • مواسير PVC وتوصيلات PVC
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${FACTORY_CONTACT.phoneIntl}`}
              className="hover:text-white transition flex items-center gap-1 text-slate-300"
              aria-label="اتصل بالمصنع"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#C81D25]" />
              <span dir="ltr">{FACTORY_CONTACT.phoneDisplay}</span>
            </a>
            <button
              onClick={toggleSound}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
              aria-label={isMuted ? 'تشغيل المؤثرات الصوتية' : 'كتم المؤثرات الصوتية'}
              title={isMuted ? 'تشغيل المؤثرات' : 'كتم المؤثرات'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-500">صامت</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px] text-blue-400">الصوت نشط</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo and Title */}
          <div
            onClick={() => {
              soundEffects.playClick();
              onSelectScreen('video');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative bg-white p-2 rounded-xl shadow-md border border-slate-200/20 transition-transform group-hover:scale-105">
              <img
                src="/assets/aistudio/image-1791387165348__1__e8778707.png"
                alt="شعار مصنع جيزان لصناعة الأنابيب البلاستيكية"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  مصنع <span className="text-[#C81D25]">جيزان</span> للبلاستيك
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A73C7]/20 text-[#38bdf8] border border-[#0A73C7]/40">
                  M&B
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                الجمهورية اليمنية • جودة تصنع المستقبل — «المنتج الجيد يثبت نفسه عند التركيب»
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="شريط التنقل الرئيسي">
            {navItems.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundEffects.playClick();
                    onSelectScreen(item.id);
                  }}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#C81D25] text-white shadow-lg shadow-[#C81D25]/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => {
                soundEffects.playClick();
                onRequestQuote();
              }}
              className="bg-[#0A73C7] hover:bg-[#0862a9] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-[#0A73C7]/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>طلب تسعير ومواصفات</span>
            </button>
          </div>

          {/* Mobile menu hamburger toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#071827] px-4 pt-3 pb-5 space-y-2">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEffects.playClick();
                  onSelectScreen(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-right px-4 py-3 rounded-lg text-sm font-bold transition flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#C81D25] text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                onRequestQuote();
                setMobileMenuOpen(false);
              }}
              className="flex-1 bg-[#0A73C7] text-white py-2.5 rounded-lg text-sm font-bold text-center"
            >
              طلب تسعير ومواصفات
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
