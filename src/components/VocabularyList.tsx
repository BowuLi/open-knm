"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Locale, uiTexts } from "@/lib/uiTexts";
import { vocabularyList, VocabularyItem } from "@/data/vocabulary";

const ITEMS_PER_PAGE = 6;

export default function VocabularyList({ locale }: { locale: Locale }) {
  const texts = uiTexts[locale].vocabulary;
  
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check screen width (standard tablet/mobile breakpoint)
      const isMobileView = window.innerWidth < 768;
      // Check user agent for mobile devices
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileView || isMobileDevice);
    };
    
    // Check on mount
    checkIsMobile();
    
    // Check on resize
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const categories = [
    { id: "all", label: texts.categories.all },
    { id: "daily", label: texts.categories.daily },
    { id: "work", label: texts.categories.work },
    { id: "housing", label: texts.categories.housing },
    { id: "health", label: texts.categories.health },
    { id: "admin", label: texts.categories.admin },
  ];

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") {
      return vocabularyList;
    }
    return vocabularyList.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentPage(1); // Reset pagination on category change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
          {texts.title}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          {texts.description}
        </p>
        <div className="text-sm text-slate-400 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2 inline-block">
          💡 {locale === 'zh' ? '手机端暂时不支持发音，想听发音请桌面端访问。' : 'Mobile audio is currently not supported. Please use desktop to listen.'}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-[var(--primary)] text-white shadow-md shadow-orange-200 transform scale-105"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => (
          <VocabularyCard key={item.id} item={item} locale={locale} isMobile={isMobile} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-6 pt-8 border-t border-slate-100">
          <p className="text-slate-400 text-sm font-medium">
            {texts.showing} <span className="text-slate-900">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)}</span> {texts.of} <span className="text-slate-900">{filteredItems.length}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              aria-label="Previous page"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                        currentPage === page
                          ? "bg-[var(--primary)] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-slate-300 px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              aria-label="Next page"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VocabularyCard({ item, locale, isMobile }: { item: VocabularyItem; locale: Locale; isMobile: boolean }) {
  const isZh = locale === 'zh';
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMobile) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(item.dutch);
    
    // Try to find a Dutch voice specifically
    const voices = window.speechSynthesis.getVoices();
    const dutchVoice = voices.find(v => v.lang.includes('nl'));
    if (dutchVoice) {
      utterance.voice = dutchVoice;
    }
    
    utterance.lang = 'nl-NL';
    utterance.rate = 0.9;

    // Important: Fix for iOS/Safari garbage collection issue
    // We attach the utterance to the window object to prevent it from being garbage collected
    // before the onend event fires.
    // @ts-expect-error - attaching to window to prevent GC
    window.currentUtterance = utterance;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      // @ts-expect-error - cleanup
      delete window.currentUtterance;
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      // @ts-expect-error - cleanup
      delete window.currentUtterance;
    };

    window.speechSynthesis.speak(utterance);
  };
  
  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Top decorative bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary)] to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
          {item.level}
        </span>
        <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">
          {item.category}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-[var(--primary)] transition-colors">
            {item.dutch}
          </h3>
          <button
            onClick={handlePlay}
            disabled={isPlaying || isMobile}
            aria-label={isMobile ? "Audio not available on mobile" : "Play pronunciation"}
            title={isMobile ? (isZh ? "手机端暂不支持发音" : "Audio not available on mobile") : ""}
            className={`p-2 rounded-full transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 
              ${isMobile 
                ? "text-slate-200 cursor-not-allowed opacity-50" 
                : "text-slate-400 hover:text-[var(--primary)] hover:bg-orange-50 disabled:opacity-50"
              }`}
          >
            {isPlaying ? (
              <span className="flex space-x-1 h-4 items-center">
                <span className="w-1 h-2 bg-current rounded-full animate-[bounce_1s_infinite]"></span>
                <span className="w-1 h-3 bg-current rounded-full animate-[bounce_1s_infinite_0.2s]"></span>
                <span className="w-1 h-2 bg-current rounded-full animate-[bounce_1s_infinite_0.4s]"></span>
              </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-lg font-medium text-slate-600 border-b border-slate-100 pb-3">
          {item.translations[locale]}
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-50 rounded-xl p-3 text-sm leading-relaxed text-slate-600">
          <span className="block font-semibold text-slate-400 text-xs uppercase mb-1 tracking-wider">
            {isZh ? '笔记' : 'Note'}
          </span>
          {item.notes[locale]}
        </div>
      </div>
    </div>
  );
}
