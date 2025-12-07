import type { Metadata } from "next";
import { Locale } from "@/lib/uiTexts";
import { absoluteUrl } from "@/lib/siteConfig";
import { SpeakingContent } from "@/components/SpeakingContent";

const speakingPageMeta: Record<Locale, { title: string; description: string; keywords: string[] }> = {
  en: {
    title: "A2 Speaking Practice & Mock Exam | Open KNM",
    description:
      "Interactive Dutch A2 speaking practice with speech recognition. Mock exam questions for Inburgering Part 1 (Q&A) and Part 2 (Picture Description).",
    keywords: [
      "Dutch speaking practice",
      "Inburgering exam A2",
      "Dutch speaking exam",
      "speaking mock test",
      "Dutch speech recognition",
      "learn Dutch speaking",
      "Inburgering part 1",
      "Inburgering part 2",
    ],
  },
  zh: {
    title: "A2 口语模拟练习 (带语音识别) | Open KNM",
    description: "融入考试口语全真模拟。包含第一部分（问答）与第二部分（看图说话），支持浏览器语音识别实时反馈，助你自信通过荷兰语 A2 口语考试。",
    keywords: [
      "荷兰语口语练习",
      "融入考试口语",
      "Inburgering A2 口语",
      "荷兰语语音识别",
      "荷兰语口语模拟",
      "荷兰语看图说话",
      "荷兰语口语题库",
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fallback: Locale = "zh";
  const resolvedLocale = ["zh", "en"].includes(locale) ? locale : fallback;
  const meta = speakingPageMeta[resolvedLocale];
  const canonical = absoluteUrl(`/${resolvedLocale}/speaking`);

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical,
      languages: {
        en: absoluteUrl("/en/speaking"),
        zh: absoluteUrl("/zh/speaking"),
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function SpeakingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <SpeakingContent locale={locale} />;
}
