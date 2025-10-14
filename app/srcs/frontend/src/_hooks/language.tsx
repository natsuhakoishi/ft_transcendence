import React from "react";

export type Lang = "en" | "zh" | "jp";

export const LanguageContext = React.createContext<any>(null);

export function useLanguage() {
  const storedLang = (localStorage.getItem("lang") as Lang) ?? "en";
  const [lang, setLang] = React.useState<Lang>(storedLang);
  const [translations, setTranslations] = React.useState<Record<string, any>>({});

  // `${lang}-pop.json`
  React.useEffect(() => {
    const files = [`${lang}.json`];

    Promise.all(
      files.map(file =>
        fetch(`locales/${file}`)
          .then(res => res.json())
          .catch(() => {
            console.error(`Missing language file: ${file}`);
            return {};
          })
      )
    ).then((results) => {
      const mergedTranslations = Object.assign({}, ...results);
      setTranslations(mergedTranslations);
    });
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
    return <div className="text-xl">Translation loading..</div>;

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
