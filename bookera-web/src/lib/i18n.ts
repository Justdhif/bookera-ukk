import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '@/assets/locales/en/common.json';
import idCommon from '@/assets/locales/id/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  id: {
    common: idCommon,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'id', // Set default to Indonesian to match server-side rendering
    fallbackLng: 'id',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
