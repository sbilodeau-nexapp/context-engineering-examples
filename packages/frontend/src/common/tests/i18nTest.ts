import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../../../public/locales/en.json';

export const initI18nTest = () => {
  void i18next.use(initReactI18next).init({
    debug: false,
    returnNull: false,
    nsSeparator: false,
    keySeparator: false,
    fallbackLng: 'en',
    load: 'languageOnly',
    lng: 'en',

    interpolation: { escapeValue: true },
    resources: {
      en: { translation: en },
    },
  });

  return i18next;
};
