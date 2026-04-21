'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';
import { createClient } from '@/lib/supabase/client';

type TranslationKeys = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // 1. Check localStorage first
    const localLang = localStorage.getItem('ecoagent_lang') as Language;
    if (localLang === 'en' || localLang === 'es') {
      setLanguageState(localLang);
    }

    // 2. Initial sync with Supabase user settings
    const syncLanguage = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('language')
        .eq('user_id', user.id)
        .single();

      if (settings?.language === 'en' || settings?.language === 'es') {
        const lang = settings.language as Language;
        setLanguageState(lang);
        localStorage.setItem('ecoagent_lang', lang);
      }
    };

    syncLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ecoagent_lang', lang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (!current || current[key] === undefined) {
        // Fallback to Spanish if key not found in current language
        let fallback: any = translations.es;
        for (const fKey of keys) {
          if (!fallback || fallback[fKey] === undefined) return path;
          fallback = fallback[fKey];
        }
        return fallback;
      }
      current = current[key];
    }

    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
