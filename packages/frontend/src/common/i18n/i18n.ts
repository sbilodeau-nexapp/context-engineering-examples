import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

export const initI18n = () => {
  void i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(HttpApi)
    .init({
      debug: false,
      returnNull: false,
      load: 'languageOnly',
      fallbackLng: 'fr',

      interpolation: { escapeValue: true },
      backend: {
        loadPath: 'locales/{{lng}}.json',
      },
    });

  return i18next;
};

initI18n();

export default i18next;
