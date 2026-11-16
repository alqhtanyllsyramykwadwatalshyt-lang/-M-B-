import React, { useState } from 'react';
import { X, CheckCircle, Send, PhoneCall, Building2 } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    projectType: 'residential',
    pipeSize: '2"',
    estimatedQuantity: '500',
    notes: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    soundEffects.playSuccessChime();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-right">
        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onClose();
          }}
          className="absolute top-5 left-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          aria-label="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500/40">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">تم استلام طلبك بنجاح!</h3>
            <p className="text-slate-300 text-sm max-w-sm mx-auto">
              سيقوم قسم المبيعات والمشاريع بمصنع جيزان بالتواصل معك خلال ساعتي عمل لتقديم عرض السعر وجدول
              المواصفات الفنية المعتمدة.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                onClose();
              }}
              className="bg-[#0A73C7] text-white px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer mt-2"
            >
              تم
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C81D25]"></span>
              <span className="text-xs font-bold text-red-400">قسم المشاريع والمبيعات</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              طلب تسعير ومواصفات معتمدة
            </h3>
            <p className="text-xs text-slate-400">
              احصل على تسعير مباشر لمواسير جيزان UPVC وتوصيلات M&B مع شهادات اختبارات الجودة للمشروع.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الاسم الكريم / اسم المهندس:
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#0A73C7]"
                  placeholder="مثال: المهندس أحمد / شركة المقاولات - تعز"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم الجوال:
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#0A73C7]"
                    placeholder="776046048"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    اسم المؤسسة / الشركة:
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#0A73C7]"
                    placeholder="مؤسسة المقاولات"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    المقاس الرئيسي المطلوب:
                  </label>
                  <select
                    value={formData.pipeSize}
                    onChange={(e) => setFormData({ ...formData, pipeSize: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#0A73C7]"
                  >
                    <option value='1/2"'>1/2 بوصة (20 مم)</option>
                    <option value='3/4"'>3/4 بوصة (25 مم)</option>
                    <option value='1"'>1 بوصة (32 مم)</option>
                    <option value='1 1/2"'>1 1/2 بوصة (50 مم)</option>
                    <option value='2"'>2 بوصة (63 مم) - الأكثر طلباً</option>
                    <option value='3"'>3 بوصة (90 مم)</option>
                    <option value='4"'>4 بوصة (110 مم)</option>
                    <option value="مقاسات متعددة">مقاسات متعددة للمشروع</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الكمية التقريبية (أمتار):
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedQuantity}
                    onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#0A73C7]"
                    placeholder="مثال: 500 متر"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ملاحظات أو مواصفات خاصة:
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-[#0A73C7]"
                  placeholder="حدد موقع التوريد أو متطلبات الفحص الخاصة..."
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#C81D25] hover:bg-[#a6171e] text-white py-3 rounded-xl font-bold text-sm shadow-xl shadow-red-950/50 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Send className="w-4 h-4" />
              <span>إرسال طلب التسعير المباشر</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
