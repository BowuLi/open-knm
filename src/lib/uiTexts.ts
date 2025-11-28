export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export type NavTexts = {
  society: string;
  life: string;
  knm: string;
  resources: string;
  about: string;
};

export type UiTexts = {
  nav: NavTexts;
  footer: {
    tagline: string;
    note: string;
    discord: string;
  };
};

export const uiTexts: Record<Locale, UiTexts> = {
  zh: {
    nav: {
      society: "荷兰社会",
      life: "生活实用",
      knm: "KNM 专区",
      resources: "资源",
      about: "关于与贡献",
    },
    footer: {
      tagline: "© open-knm，欢迎开源共享。",
      note: "为准备在荷兰生活、学习与工作的你而写。",
      discord: "加入 Discord 社区讨论",
    },
  },
  en: {
    nav: {
      society: "Dutch Society",
      life: "Daily Life",
      knm: "KNM Zone",
      resources: "Resources",
      about: "About & Contribute",
    },
    footer: {
      tagline: "© open-knm — open knowledge for expats.",
      note: "Written for people living, studying, or working in the Netherlands.",
      discord: "Join our Discord Community",
    },
  },
};

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function getLocalizedPath(locale: Locale, path = "/") {
  const normalized = normalizePath(path);
  return normalized ? `/${locale}${normalized}` : `/${locale}`;
}
