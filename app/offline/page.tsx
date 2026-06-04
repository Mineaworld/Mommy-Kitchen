"use client";

import Link from "next/link";

const OfflinePage = () => {
  const handleRetry = () => {
    window.location.href = "/";
  };

  return (
    <main className="max-w-[800px] mx-auto min-h-screen bg-surface px-4 py-8 flex flex-col justify-center">
      <Link className="absolute top-4 left-4 z-10 w-12 h-12 rounded-full bg-surfaceContainerHighest flex items-center justify-center text-onSurface mb-6 transition-colors active:scale-95" href="/">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M15 18l-6-6 6-6"/></svg>
      </Link>
      <section className="p-8 text-center bg-surfaceContainer rounded-3xl shadow-sm border border-outlineVariant/20 flex flex-col items-center">
        <div className="text-6xl mb-4 bg-surfaceContainerHighest w-24 h-24 rounded-full flex items-center justify-center shadow-sm">🍲</div>
        <h2 className="text-2xl font-bold text-onSurface m-0">គ្មានអ៊ីនធឺណិត</h2>
        <p className="text-onSurfaceVariant text-base font-semibold m-0 mt-3">សូមភ្ជាប់អ៊ីនធឺណិតហើយព្យាយាមម្ដងទៀត។</p>
        <p className="text-onSurfaceVariant text-sm font-medium m-0 mt-1">Internet is required for videos. Please reconnect.</p>
        
        <button 
          type="button" 
          className="mt-8 w-full max-w-[240px] bg-primary text-onPrimary font-bold rounded-full min-h-[56px] text-lg px-6 flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-[0_4px_12px_rgba(158,61,0,0.3)]" 
          onClick={handleRetry}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </section>
    </main>
  );
};

export default OfflinePage;
