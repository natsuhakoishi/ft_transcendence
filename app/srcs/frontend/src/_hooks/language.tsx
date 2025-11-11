import React from "react";
import { bakery } from "../utils";
import en from "../locales/en.json"
import en_pop from "../locales/en-pop.json"
import zh from "../locales/zh.json"
import zh_pop from "../locales/zh-pop.json"
import jp from "../locales/jp.json"
import jp_pop from "../locales/jp-pop.json"

export const dictionaries = {
  en: { ...en, pop: en_pop },
  zh: { ...zh, pop: zh_pop },
  jp: { ...jp, pop: jp_pop },
};

export type Lang = "en" | "zh" | "jp";

export const LanguageContext = React.createContext<any>(null);

export function useLanguage() {
  const storedLang = (localStorage.getItem("lang") as Lang) ?? "en";
  const [lang, setLang] = React.useState<Lang>(storedLang);
  const [translations, setTranslations] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    const langDict = dictionaries[lang] || dictionaries['en'];
    setTranslations(langDict);
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key: string): string =>
    key.split('.').reduce((obj: any, k) => obj && obj[k], translations) || key;

  return { lang, setLang, t, translations };
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const langPack = useLanguage();

  if (!Object.keys(langPack.translations).length)
    return <div className="text-xl">Translation loading..</div>;

  const toasterPluz = bakery(langPack.t);

  return (
    <LanguageContext.Provider value={{ ...langPack, toasterPluz }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => React.useContext(LanguageContext);

export interface TranslationProps {
  t: (key: string) => string;
  lang?: string;
  toasterPluz: (key: string) => void;
}

export function withTranslation<T extends object>(
  Component: React.ComponentType<T & TranslationProps>
) {
  return (props: T) => {
    const { t, lang, toasterPluz } = useLang();
    return <Component {...props} t={t} lang={lang} toasterPluz={toasterPluz} />;
  };
}
