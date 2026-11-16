import React, { useState, useEffect, useRef } from 'react';
import { VIDEO_SCENES, INSIDE_FACTORY_SERIES } from '../data/factoryData';
import { OFFICIAL_VIDEO_CUES, FACTORY_CONTACT } from '../data/catalogProfile';
import { VideoScene, ActiveScreen } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Layers,
  ArrowLeft,
  Flame,
  Droplets,
  Stamp,
  Scissors,
  ShieldCheck,
  CheckCircle,
  Clock,
  Video,
  Clapperboard,
  MessageCircle,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface VideoPlayerViewProps {
  onNavigateToScreen: (screen: ActiveScreen) => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ onNavigateToScreen }) => {
  const [viewMode, setViewMode] = useState<'official-20s' | '30s-campaign' | '10-episodes'>('official-20s');
  const [officialVideoTime, setOfficialVideoTime] = useState<number>(0);
  const [officialVideoDuration, setOfficialVideoDuration] = useState<number>(20);
  const [officialIsPlaying, setOfficialIsPlaying] = useState<boolean>(false);
  const officialVideoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState<number>(0);
  const [showScript, setShowScript] = useState<boolean>(true);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const TOTAL_DURATION = 30; // 30 seconds campaign brief

  // Playback timer loop for 30s mode
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && viewMode === '30s-campaign') {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * playbackSpeed;
          if (next >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, viewMode]);

  // Update current stage based on currentTime
  useEffect(() => {
    if (viewMode === '30s-campaign') {
      const stageIdx = Math.min(
        Math.floor(currentTime / 5),
        VIDEO_SCENES.length - 1
      );
      if (stageIdx !== activeStageIndex) {
        setActiveStageIndex(stageIdx);
      }
    }
  }, [currentTime, activeStageIndex, viewMode]);

  const activeScene: VideoScene = VIDEO_SCENES[activeStageIndex] || VIDEO_SCENES[0];
  const activeEpisode = INSIDE_FACTORY_SERIES[activeEpisodeIndex] || INSIDE_FACTORY_SERIES[0];

  const handlePlayPause = () => {
    if (currentTime >= TOTAL_DURATION) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
    soundEffects.playClick();
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    const stageIdx = Math.min(Math.floor(time / 5), VIDEO_SCENES.length - 1);
    setActiveStageIndex(stageIdx);
    soundEffects.playClick();
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setActiveStageIndex(0);
    setIsPlaying(true);
    soundEffects.playClick();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && playerContainerRef.current) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const renderSceneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'Droplets':
        return <Droplets className="w-6 h-6 text-sky-400" />;
      case 'Stamp':
        return <Stamp className="w-6 h-6 text-[#C81D25]" />;
      case 'Scissors':
        return <Scissors className="w-6 h-6 text-indigo-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      default:
        return <Layers className="w-6 h-6 text-blue-400" />;
    }
  };

  const activeOfficialCue =
    OFFICIAL_VIDEO_CUES.find(
      (c) => officialVideoTime >= c.startSec && officialVideoTime < c.endSec
    ) || OFFICIAL_VIDEO_CUES[OFFICIAL_VIDEO_CUES.length - 1];

  const handleSeekOfficialVideo = (startSec: number) => {
    const vid = officialVideoRef.current;
    if (vid) {
      vid.currentTime = startSec;
      vid.play().catch(() => {});
      setOfficialIsPlaying(true);
    }
    setOfficialVideoTime(startSec);
    soundEffects.playClick();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Campaign Hero Intro Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071827] via-[#0b243b] to-[#071827] border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C81D25]/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0A73C7]/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-xs font-bold text-red-300">
              <span className="w-2 h-2 rounded-full bg-[#C81D25]"></span>
              {FACTORY_CONTACT.brandAr} • {FACTORY_CONTACT.slogan}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              «جودة تصنع المستقبل» — {FACTORY_CONTACT.tagline}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              منظومة متكاملة تجمع بين مواسير <strong className="text-white">JIZAN</strong> وتوصيلات{' '}
              <strong className="text-sky-400">M&B</strong> لتلبية احتياجات المياه والسباكة والصرف
              الصحي والري والمقاولات في الجمهورية اليمنية، مع عرض مراحل التصنيع والفحص بالتعليق الصوتي الرسمي.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateToScreen('specs')}
                className="bg-[#C81D25] hover:bg-[#a6171e] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-900/40 transition flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>الكتالوج التعريفي (14 محوراً)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateToScreen('stress-test')}
                className="bg-[#0A73C7] hover:bg-[#0862a9] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-950/40 transition flex items-center gap-2 cursor-pointer"
              >
                <span>محاكي قائمة فحص السباك</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <a
                href={FACTORY_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-950/40 transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب المصنع: {FACTORY_CONTACT.phoneDisplay}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200">منظومة العلامتين المتكاملة</span>
              <span className="text-emerald-400 font-bold">الجمهورية اليمنية</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-red-500/20">
                <div className="w-3.5 h-3.5 rounded-full bg-[#C81D25] flex-shrink-0"></div>
                <div className="text-slate-300">
                  <span className="font-bold text-white">JIZAN:</span> مواسير PVC للنقل والتمديد
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-blue-500/20">
                <div className="w-3.5 h-3.5 rounded-full bg-[#0A73C7] flex-shrink-0"></div>
                <div className="text-slate-300">
                  <span className="font-bold text-white">M&B:</span> توصيلات PVC للربط والتفرعات والخط الأزرق
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setViewMode('official-20s');
              soundEffects.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'official-20s'
                ? 'bg-[#C81D25] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>الفيديو الرسمي بالتعليق الصوتي (20 ثانية)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('30s-campaign');
              soundEffects.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === '30s-campaign'
                ? 'bg-[#0A73C7] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            <span>محاكاة مراحل الإنتاج (30 ثانية)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('10-episodes');
              soundEffects.playClick();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              viewMode === '10-episodes'
                ? 'bg-[#0A73C7] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>سلسلة تيك توك وريلز «من داخل المصنع» (10 حلقات)</span>
          </button>
        </div>
      </section>

      {/* MODE 0: Official 20s Factory Video with Male Voiceover */}
      {viewMode === 'official-20s' && (
        <section className="space-y-6">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C81D25]"></span>
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  الفيديو التعريفي الرسمي — مصنع جيزان M&B للصناعات البلاستيكية
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span dir="ltr" className="font-mono font-bold">
                  00:{Math.floor(officialVideoTime).toString().padStart(2, '0')} / 00:
                  {Math.round(officialVideoDuration).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="relative bg-black flex items-center justify-center">
              <video
                ref={officialVideoRef}
                data-testid="official-factory-video"
                src={FACTORY_CONTACT.officialVideoSrc}
                controls
                playsInline
                preload="metadata"
                onLoadedMetadata={(e) => {
                  const dur = e.currentTarget.duration;
                  if (Number.isFinite(dur) && dur > 0) {
                    setOfficialVideoDuration(dur);
                  }
                }}
                onTimeUpdate={(e) => setOfficialVideoTime(e.currentTarget.currentTime)}
                onPlay={() => setOfficialIsPlaying(true)}
                onPause={() => setOfficialIsPlaying(false)}
                className="w-full max-h-[540px] aspect-video object-contain bg-black"
              >
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            </div>

            {/* Synchronized Voiceover Cue Bar */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-[#C81D25]/20 text-red-300 border border-[#C81D25]/40 font-bold">
                    المشهد {activeOfficialCue.id} من 6
                  </span>
                  <span className="font-bold text-sky-400">{activeOfficialCue.stageName}</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    ({activeOfficialCue.startSec}ث - {activeOfficialCue.endSec}ث)
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-white">
                  &ldquo;{activeOfficialCue.voiceoverLine}&rdquo;
                </p>
                <p className="text-xs text-slate-400">{activeOfficialCue.highlight}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const vid = officialVideoRef.current;
                    if (!vid) return;
                    if (vid.paused) {
                      vid.play().catch(() => {});
                    } else {
                      vid.pause();
                    }
                    soundEffects.playClick();
                  }}
                  className="bg-[#C81D25] hover:bg-[#a6171e] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  {officialIsPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>تشغيل الفيديو</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSeekOfficialVideo(0)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>من البداية</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6 Synchronized Video Chapters */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C81D25]" />
              <span>الانتقال السريع لمشاهد الفيديو الرسمي (20 ثانية)</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {OFFICIAL_VIDEO_CUES.map((cue) => {
                const isSelected = activeOfficialCue.id === cue.id;
                return (
                  <button
                    key={cue.id}
                    type="button"
                    onClick={() => handleSeekOfficialVideo(cue.startSec)}
                    className={`p-3.5 rounded-xl text-right transition-all border flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800/95 border-[#C81D25] shadow-lg ring-1 ring-[#C81D25]'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isSelected && <div className="absolute top-0 right-0 left-0 h-1 bg-[#C81D25]"></div>}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-extrabold text-[#C81D25]">0{cue.id}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          00:{cue.startSec.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white leading-snug">{cue.stageName}</h4>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{cue.endSec - cue.startSec} ثوانٍ</span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* MODE 1: 30s Campaign Video Player */}
      {viewMode === '30s-campaign' && (
        <>
          <section
            ref={playerContainerRef}
            className="relative bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="relative aspect-video max-h-[560px] w-full bg-gradient-to-b from-[#030b12] to-[#071827] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f273d15_1px,transparent_1px),linear-gradient(to_bottom,#0f273d15_1px,transparent_1px)] bg-[size:32px_32px]"></div>

              <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C81D25]"></span>
                    <span className="text-slate-200 font-bold">
                      المرحلة {activeStageIndex + 1} من 6:
                    </span>
                    <span className="text-white font-extrabold">{activeScene.stageName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span dir="ltr" className="font-mono font-bold text-white">
                        00:{Math.floor(currentTime).toString().padStart(2, '0')} / 00:30
                      </span>
                    </div>
                    <div className="bg-white/95 border border-red-700/80 px-2 py-1 rounded flex items-center gap-1.5 shadow">
                      <img
                        src="/assets/aistudio/image-1791387165348__1__e8778707.png"
                        alt="شعار مصنع جيزان"
                        className="h-4.5 w-auto object-contain"
                      />
                      <span className="text-[10px] font-black text-slate-900">تعز، اليمن</span>
                    </div>
                  </div>
                </div>

                {/* Central Animation Area */}
                <div className="my-auto text-center max-w-2xl mx-auto space-y-4">
                  <div className="relative inline-flex items-center justify-center p-6 bg-slate-900/90 rounded-2xl border border-slate-700 shadow-2xl">
                    <div className="absolute -top-3 -right-3 p-2 rounded-full bg-slate-800 border border-slate-600 shadow-lg">
                      {renderSceneIcon(activeScene.visualIcon)}
                    </div>

                    <div className="w-72 sm:w-96 space-y-3">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>خط الإنتاج والتشكيل</span>
                        <span className="text-sky-400 font-mono">
                          {activeScene.stageNameEn}
                        </span>
                      </div>

                      <div className="relative h-14 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 rounded-lg overflow-hidden border-2 border-slate-600 flex items-center justify-center shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40"></div>

                        {activeStageIndex === 0 && (
                          <div className="text-xs text-white font-mono bg-black/50 px-3 py-1 rounded">
                            تجهيز الخامات والمثبتات الهندسية
                          </div>
                        )}
                        {activeStageIndex === 1 && (
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span>تشكيل وتصنيع المواسير والتوصيلات</span>
                          </div>
                        )}
                        {activeStageIndex === 2 && (
                          <div className="flex items-center gap-2 text-xs font-bold text-sky-200">
                            <Droplets className="w-4 h-4 text-sky-400" />
                            <span>التبريد المائي والمعايرة لضبط القطر</span>
                          </div>
                        )}
                        {activeStageIndex === 3 && (
                          <div className="flex items-center justify-center gap-3 w-full px-3">
                            <div className="bg-white px-2 py-0.5 rounded shadow flex items-center">
                              <img
                                src="/assets/aistudio/image-1791387165348__1__e8778707.png"
                                alt="شعار مصنع جيزان"
                                className="h-5.5 w-auto object-contain"
                              />
                            </div>
                            <div className="h-2 w-14 bg-[#0A73C7] rounded-full animate-pulse"></div>
                            <span className="text-[11px] font-mono text-white bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                              UPVC • 2&quot; • M&B
                            </span>
                          </div>
                        )}
                        {activeStageIndex === 4 && (
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Scissors className="w-4 h-4 text-indigo-400" />
                            <span>القص وشطف الحواف لسهولة التركيب</span>
                          </div>
                        )}
                        {activeStageIndex === 5 && (
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <span>فحص الجودة والمظهر وتجهيز التوريد</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300">
                          <span className="block text-[10px] text-slate-500">حالة الخط</span>
                          <span className="font-bold text-white">تشغيل مستقر</span>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300">
                          <span className="block text-[10px] text-slate-500">القطر والدائرية</span>
                          <span className="font-bold text-emerald-400">منتظم</span>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300">
                          <span className="block text-[10px] text-slate-500">العلامة المطبوعة</span>
                          <span className="font-bold text-sky-400">جيزان الأصلية</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showScript && (
                    <div className="bg-black/75 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-xl shadow-xl max-w-xl mx-auto transition-all">
                      <p className="text-white text-sm sm:text-base font-semibold leading-relaxed">
                        &ldquo;{activeScene.voiceoverScript}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Scrubber */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-slate-300">
                      {activeScene.stageName} ({activeScene.startTimeSec}ث - {activeScene.endTimeSec}ث)
                    </span>
                    <span className="font-mono text-slate-400">
                      {Math.round((currentTime / TOTAL_DURATION) * 100)}%
                    </span>
                  </div>
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                      const targetTime = (1 - ratio) * TOTAL_DURATION;
                      handleSeek(targetTime);
                    }}
                    className="relative h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden group"
                  >
                    <div
                      className="absolute top-0 right-0 h-full bg-gradient-to-l from-[#C81D25] via-red-500 to-[#0A73C7] rounded-full transition-all"
                      style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
                    ></div>
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                        style={{ right: `${(idx / 6) * 100}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-900 border-t border-slate-800 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayPause}
                    className="p-3 rounded-xl bg-[#C81D25] hover:bg-[#a6171e] text-white shadow-md transition cursor-pointer"
                    aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الفيديو'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                  <button
                    onClick={handleRestart}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="إعادة التشغيل من البداية"
                    aria-label="إعادة التشغيل"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowScript(!showScript)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      showScript
                        ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {showScript ? 'إخفاء النص' : 'إظهار النص'}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 ml-1">السرعة:</span>
                  {[0.5, 1, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed);
                        soundEffects.playClick();
                      }}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                        playbackSpeed === speed
                          ? 'bg-[#0A73C7] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    aria-label="شاشة كاملة"
                    title="شاشة كاملة"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 6 Stage Selector */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C81D25]" />
              <span>مراحل الإنتاج الستة بالفيديو (30 ثانية)</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {VIDEO_SCENES.map((scene, idx) => {
                const isSelected = activeStageIndex === idx;
                return (
                  <button
                    key={scene.id}
                    onClick={() => handleSeek(idx * 5)}
                    className={`p-3.5 rounded-xl text-right transition-all border flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800/90 border-[#C81D25] shadow-lg ring-1 ring-[#C81D25]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isSelected && <div className="absolute top-0 right-0 left-0 h-1 bg-[#C81D25]"></div>}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-extrabold text-[#C81D25]">0{scene.id}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          00:{scene.startTimeSec.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs text-white leading-snug line-clamp-2">
                        {scene.stageName}
                      </h3>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{scene.stageNameEn.split(' ')[0]}</span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* MODE 2: 10 Episodes Inside Factory Series */}
      {viewMode === '10-episodes' && (
        <section className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-[#C81D25] block">
                  سلسلة «من داخل مصنع جيزان» • تيك توك وريلز (9:16)
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  الحلقة {activeEpisode.episodeNumber}: {activeEpisode.title}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-sky-400 font-mono text-xs font-bold">
                المدة المقترحة: {activeEpisode.durationSec} ثانية
              </span>
            </div>

            {/* Episode details grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              {/* Left Video Card Simulation */}
              <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                <div className="relative aspect-[9/16] max-h-[440px] mx-auto bg-gradient-to-b from-[#0b1d2e] to-[#040e17] rounded-2xl border-2 border-slate-700 p-4 flex flex-col justify-between overflow-hidden shadow-2xl">
                  {/* Overlay Tags */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="bg-[#C81D25] text-white px-2 py-0.5 rounded font-bold">
                      من داخل المصنع #{activeEpisode.episodeNumber}
                    </span>
                    <div className="bg-white/95 px-1.5 py-0.5 rounded shadow-sm flex items-center">
                      <img
                        src="/assets/aistudio/image-1791387165348__1__e8778707.png"
                        alt="شعار مصنع جيزان"
                        className="h-3.5 w-auto object-contain"
                      />
                    </div>
                  </div>

                  {/* Visual Hook Center */}
                  <div className="my-auto space-y-3">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center border border-white/20">
                      <Clapperboard className="w-8 h-8 text-[#C81D25]" />
                    </div>
                    <div className="bg-black/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-amber-400 font-bold block mb-1">
                        الخطاف البصري (أول ثانيتين):
                      </span>
                      <p className="text-xs text-white font-bold leading-relaxed">
                        &ldquo;{activeEpisode.hook}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Bottom Script overlay */}
                  <div className="bg-black/80 backdrop-blur-sm p-3 rounded-xl text-right text-[11px] text-slate-200">
                    <span className="text-[10px] text-sky-400 font-bold block mb-0.5">الدعوة للتفاعل:</span>
                    <p className="font-semibold text-white">{activeEpisode.cta}</p>
                  </div>
                </div>
              </div>

              {/* Right Details */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    النص المنطوق في الفيديو (Voiceover):
                  </h4>
                  <p className="text-white text-base sm:text-lg font-bold leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                    &ldquo;{activeEpisode.script}&rdquo;
                  </p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    لقطات المشهد الميدانية المطلوبة:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeEpisode.shots.map((shot, idx) => (
                      <li
                        key={idx}
                        className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-200 flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[#0A73C7] font-bold text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{shot}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-300 block">الدعوة للإجراء الثابتة:</span>
                    <span className="text-emerald-400 font-bold">{activeEpisode.cta}</span>
                  </div>
                  <a
                    href={FACTORY_CONTACT.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب الكتالوج</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 10 Episode Selector List */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {INSIDE_FACTORY_SERIES.map((ep, idx) => {
              const isSelected = activeEpisodeIndex === idx;
              return (
                <button
                  key={ep.episodeNumber}
                  onClick={() => {
                    setActiveEpisodeIndex(idx);
                    soundEffects.playClick();
                  }}
                  className={`p-3 rounded-xl text-right transition border cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-[#C81D25] ring-1 ring-[#C81D25]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-extrabold text-[#C81D25]">حلقة {ep.episodeNumber}</span>
                    <span className="font-mono text-[10px]">{ep.durationSec}ث</span>
                  </div>
                  <h4 className="font-bold text-xs text-white line-clamp-2">{ep.title}</h4>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
