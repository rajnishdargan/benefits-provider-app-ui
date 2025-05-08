import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
console.log(import.meta.env.VITE_APP_BASE_UBA_UI);
export const initializeI18n = (defaultLanguage: string = "en") => {
  i18n
    .use(HttpApi) // Loads translations via HTTP
    .use(initReactI18next) // Connects i18n with React
    .init({
      lng: defaultLanguage,
      fallbackLng: "en",
      backend: {
        loadPath: `/local/{{lng}}.json`, // Path to the translation files
      },
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: true, // Enable suspense mode
      },
    });
};
