import React from "react";

export type Lang = "en" | "zh" | "jp";

export const LanguageContext = React.createContext<any>(null);

export function useLanguage() {
  const storedLang = (localStorage.getItem("lang") as Lang) ?? "en";
  const [lang, setLang] = React.useState<Lang>(storedLang);
  const [translations, setTranslations] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    fetch(`locales/${lang}.json`)
      .then((res) => res.json())    
      .then((data) => setTranslations(data))
      .catch(() => console.error(`Missing language file: ${lang}`));

    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = (key: string): string =>
    key.split('.').reduce((obj: any, k) => obj && obj[k], translations) || key;

  return { lang, setLang, t, translations };
}

export const useLang = () => React.useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const langPack = useLanguage();

  if (!Object.keys(langPack.translations).length)
    return <div>Translation loading..</div>;

  return (
    <LanguageContext.Provider value={langPack}>
      {children}
    </LanguageContext.Provider>
  );
};

export function withTranslation<T extends { t: Function; lang?: string }>(
  Component: React.ComponentType<T>
) {
  return (props: Omit<T, "t">) => {
    const { t, lang } = useLang();
    return <Component {...(props as T)} t={t} lang={lang} />;
  };
}
