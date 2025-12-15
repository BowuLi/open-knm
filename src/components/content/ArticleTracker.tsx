"use client";

import { useEffect } from "react";
import { Locale } from "@/lib/uiTexts";

const STORAGE_KEY = "knm-bookmark";
const HISTORY_KEY = "knm-read-history";

type BookmarkPayload = {
  slug: string;
  title: string;
  locale: Locale;
  updatedAt: number;
};

type ArticleTrackerProps = {
  slug: string;
  title: string;
  locale: Locale;
};

export function ArticleTracker({ slug, title, locale }: ArticleTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const payload: BookmarkPayload = {
        slug,
        title,
        locale,
        updatedAt: Date.now(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      // Update read history
      const historyRaw = window.localStorage.getItem(HISTORY_KEY);
      const history: string[] = historyRaw ? JSON.parse(historyRaw) : [];
      if (!history.includes(slug)) {
        history.push(slug);
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error("Failed to save KNM bookmark:", error);
    }
  }, [slug, title, locale]);

  return null;
}
