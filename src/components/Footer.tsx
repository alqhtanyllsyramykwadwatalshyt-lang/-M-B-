import React from 'react';
import { ActiveScreen } from '../types';
import {
  PhoneCall,
  MapPin,
  ShieldCheck,
  ArrowUp,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { FACTORY_CONTACT } from '../data/catalogProfile';

interface FooterProps {
  onSelectScreen: (screen: ActiveScreen) => void;
  onRequestQuote: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectScreen, onRequestQuote }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    soundEffects.playClick();
  };

  return (
    <footer className="bg-[#040e18] border-t border-slate-800 text-slate-400 text-xs">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200/20">
                <img
                  src="/assets/aistudio/image-1791387165348__1__e8778707.png"
                  alt="شعار مصنع جيزان لصناعة الأنابيب البلاستيكية"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-base text-white block">
                  مصنع <span className="text-[#C81D25]">جيزان</span> للصناعات البلاستيكية
                </span>
                <span className="text-[11px] text-slate-400">
                  جودة تصنع المستقبل • JIZAN &amp; M&amp;B PLASTIC INDUSTRIES
                </span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-md">
              منشأة متخصصة في تصنيع مواسير وتوصيلات PVC في الجمهورية اليمنية (مواسير JIZAN وتوصيلات
              M&amp;B) لتقديم حلول متكاملة لمشاريع المياه والسباكة والصرف الصحي والري والمقاولات
              والبنية التحتية.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>جودة تصنع المستقبل • المنتج الجيد يثبت نفسه عند التركيب</span>
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-white text-sm">أقسام التطبيق والحملة</h4>
            <ul className="space-y-2">
              {[
                { id: 'video', label: '🎬 الفيديو الرسمي وجولة المصنع' },
                { id: 'stress-test', label: '🧪 محاكي حملة اختبار السباك' },
                { id: '3d-viewer', label: '📐 المختبر ثلاثي الأبعاد 3D' },
                { id: 'map', label: '🗺️ خريطة الفروع ومنافذ التوزيع' },
                { id: 'specs', label: '📋 الكتالوج التعريفي وحاسبة السباك' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onSelectScreen(item.id as ActiveScreen);
                      scrollToTop();
                    }}
                    className="hover:text-white transition cursor-pointer text-slate-300"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-bold text-white text-sm">بيانات التواصل الرسمية</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C81D25] flex-shrink-0 mt-0.5" />
                <span>{FACTORY_CONTACT.addressAr}</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#0A73C7] flex-shrink-0" />
                <a
                  href={`tel:${FACTORY_CONTACT.phoneIntl}`}
                  className="hover:text-white font-mono font-bold text-slate-200"
                  dir="ltr"
                >
                  {FACTORY_CONTACT.phoneDisplay}
                </a>
                <span className="text-slate-500">(هاتف / واتساب)</span>
              </li>
              <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-0.5">
                <a
                  href={FACTORY_CONTACT.googleProfileShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-sky-400 underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>ملف المصنع على Google</span>
                </a>
                <a
                  href={FACTORY_CONTACT.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-sky-400 underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>خرائط Google</span>
                </a>
                <a
                  href={FACTORY_CONTACT.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-sky-400 underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              </li>
            </ul>

            <a
              href={FACTORY_CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>واتساب المصنع ({FACTORY_CONTACT.phoneDisplay}) — اطلب «كتالوج»</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom ribbon */}
      <div className="border-t border-slate-900 bg-[#02070d] py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} مصنع جيزان للصناعات البلاستيكية. جميع الحقوق محفوظة. JIZAN & M&B
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 hover:text-white transition cursor-pointer"
          >
            <span>العودة للأعلى</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
