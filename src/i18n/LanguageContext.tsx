// =============================================================================
// CONTEXTE DE LANGUE - COPIEZ CE FICHIER
// =============================================================================
// Ce fichier gère l'état global de la langue et la persistance dans localStorage
// =============================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, languages, translations, Translations, LanguageInfo } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languages: LanguageInfo[];
  currentLanguage: LanguageInfo;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'app-language';

// Détecte la langue du navigateur
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = languages.map(l => l.code);
  
  if (supportedLanguages.includes(browserLang as Language)) {
    return browserLang as Language;
  }
  
  return 'fr'; // Langue par défaut
};

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  defaultLanguage 
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Priorité: localStorage > defaultLanguage > détection navigateur
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && languages.some(l => l.code === stored)) {
      return stored;
    }
    return defaultLanguage || detectBrowserLanguage();
  });

  const currentLanguage = languages.find(l => l.code === language) || languages[0];
  const isRTL = currentLanguage.rtl || false;

  // Met à jour l'attribut dir du document pour les langues RTL
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    languages,
    currentLanguage,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personnalisé pour utiliser les traductions
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Hook raccourci pour les traductions uniquement
export const useTranslation = () => {
  const { t, language } = useLanguage();
  return { t, language };
};

export default LanguageContext;
