import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import mrTranslations from './locales/mr.json';
import guTranslations from './locales/gu.json';
import bnTranslations from './locales/bn.json';
import teTranslations from './locales/te.json';
import taTranslations from './locales/ta.json';
import urTranslations from './locales/ur.json';
import knTranslations from './locales/kn.json';
import orTranslations from './locales/or.json';
import mlTranslations from './locales/ml.json';
import paTranslations from './locales/pa.json';
import asTranslations from './locales/as.json';
import maiTranslations from './locales/mai.json';
import saTranslations from './locales/sa.json';

const resources = {
    en: { translation: enTranslations },
    hi: { translation: hiTranslations },
    mr: { translation: mrTranslations },
    gu: { translation: guTranslations },
    bn: { translation: bnTranslations },
    te: { translation: teTranslations },
    ta: { translation: taTranslations },
    ur: { translation: urTranslations },
    kn: { translation: knTranslations },
    or: { translation: orTranslations },
    ml: { translation: mlTranslations },
    pa: { translation: paTranslations },
    as: { translation: asTranslations },
    mai: { translation: maiTranslations },
    sa: { translation: saTranslations },
};

i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass i18n instance to react-i18next
    .init({
        resources,
        fallbackLng: 'en', // Fallback language
        lng: localStorage.getItem('edutalks_language_preference') || 'en',

        detection: {
            // Order of language detection methods
            order: ['localStorage', 'navigator'],
            // Cache user language
            caches: ['localStorage'],
            lookupLocalStorage: 'edutalks_language_preference',
        },

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        react: {
            useSuspense: true, // Enable suspense mode
        },
    });

export default i18n;
