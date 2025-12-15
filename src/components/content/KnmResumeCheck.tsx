"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Locale, uiTexts } from "@/lib/uiTexts";
import { ResumePrompt } from "@/components/ResumePrompt";

const STORAGE_KEY = "knm-bookmark";

type BookmarkData = {
  slug: string;
  title: string;
  locale: Locale;
  updatedAt: number;
};

export function KnmResumeCheck({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [bookmark, setBookmark] = useState<BookmarkData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed: BookmarkData = JSON.parse(raw);
      if (parsed?.slug && parsed?.locale) {
        setTimeout(() => setBookmark(parsed), 0);
      }
    } catch (error) {
      console.error("Failed to read KNM bookmark:", error);
    }
  }, []);

  if (!bookmark) return null;

  const prompts = uiTexts[locale].vocabulary.bookmarkPrompt;

  const handleConfirm = () => {
    router.push(`/${bookmark.locale}/articles/${bookmark.slug}`);
    setBookmark(null); // Hide after action
  };

  const handleDismiss = () => {
    setBookmark(null);
  };

  return (
    <ResumePrompt
      message={`${prompts.resume} “${bookmark.title}”`}
      confirmText={prompts.continueReading}
      dismissText={prompts.dismiss}
      onConfirm={handleConfirm}
      onDismiss={handleDismiss}
    />
  );
}
