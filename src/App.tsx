import React, { useState, useEffect } from 'react';
import { ActiveScreen } from './types';
import { Navbar } from './components/Navbar';
import { VideoPlayerView } from './components/VideoPlayerView';
import { PlumberTestView } from './components/PlumberTestView';
import { ThreeDView } from './components/ThreeDView';
import { DistributionMapView } from './components/DistributionMapView';
import { SpecsCalculatorView } from './components/SpecsCalculatorView';
import { QuoteModal } from './components/QuoteModal';
import { Footer } from './components/Footer';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('video');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);

  // Check URL query parameters (e.g. ?screen=stress-test or ?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen') as ActiveScreen;
    if (
      screenParam &&
      ['video', 'stress-test', '3d-viewer', 'map', 'specs'].includes(screenParam)
    ) {
      setActiveScreen(screenParam);
    }
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-[#071827] text-slate-100 font-['Tajawal',sans-serif]">
        {/* Main Header / Navigation */}
        <Navbar
          activeScreen={activeScreen}
          onSelectScreen={setActiveScreen}
          onRequestQuote={() => setIsQuoteModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
          {activeScreen === 'video' && (
            <VideoPlayerView onNavigateToScreen={setActiveScreen} />
          )}
          {activeScreen === 'stress-test' && <PlumberTestView />}
          {activeScreen === '3d-viewer' && <ThreeDView />}
          {activeScreen === 'map' && <DistributionMapView />}
          {activeScreen === 'specs' && (
            <SpecsCalculatorView onRequestQuote={() => setIsQuoteModalOpen(true)} />
          )}
        </main>

        {/* RFQ & Sample Request Modal */}
        <QuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
        />

        {/* Global Toast Notifications */}
        <ToastContainer />

        {/* Footer */}
        <Footer
          onSelectScreen={setActiveScreen}
          onRequestQuote={() => setIsQuoteModalOpen(true)}
        />
      </div>
    </ToastProvider>
  );
}
