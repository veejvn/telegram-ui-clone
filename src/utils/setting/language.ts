export const AVAILABLE_LANGUAGES = [
  { code: "en", label: "English", sub: "English" },
  { code: "ar", label: "Arabic", sub: "العربية" },
  { code: "be", label: "Belarusian", sub: "Беларуская" },
  { code: "ca", label: "Catalan", sub: "Català" },
  { code: "hr", label: "Croatian", sub: "Hrvatski" },
  { code: "cs", label: "Czech", sub: "Čeština" },
  { code: "nl", label: "Dutch", sub: "Nederlands" },
  { code: "fi", label: "Finnish", sub: "Suomi" },
  { code: "fr", label: "French", sub: "Français" },
  { code: "de", label: "German", sub: "Deutsch" },
  { code: "ms", label: "Malay", sub: "Bahasa Melayu" },
  { code: "no", label: "Norwegian (Bokmål)", sub: "Norsk (Bokmål)" },
  { code: "fa", label: "Persian", sub: "فارسی" },
  { code: "pl", label: "Polish", sub: "Polski" },
  { code: "pt-br", label: "Portuguese (Brazil)", sub: "Português (Brasil)" },
  { code: "ro", label: "Romanian", sub: "Română" },
  { code: "ru", label: "Russian", sub: "Русский" },
  { code: "sr", label: "Serbian", sub: "Српски" },
  { code: "sk", label: "Slovak", sub: "Slovenčina" },
  { code: "es", label: "Spanish", sub: "Español" },
  { code: "sv", label: "Swedish", sub: "Svenska" },
  { code: "tr", label: "Turkish", sub: "Türkçe" },
  { code: "uk", label: "Ukrainian", sub: "Українська" },
  { code: "uz", label: "Uzbek", sub: "O'zbek" },
];

export const LANG_CODE_KEY = 'selected_language_code';
export const LANG_LABEL_KEY = 'selected_language_label';

// 3. Hàm lấy code đã chọn từ localStorage (dùng ở ngoài setting)
export function getSelectedLanguageCode(defaultCode = 'en') {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LANG_CODE_KEY) || defaultCode;
  }
  return defaultCode;
}

// 4. Hàm lấy label từ code (hiển thị ngoài setting)
export function getLanguageLabelByCode(code: string): string {
  const lang = AVAILABLE_LANGUAGES.find(l => l.code === code);
  return lang ? lang.label : 'English';
}

// 5. Hàm khởi tạo state khi vào trang Language
export function getInitialLang() {
  if (typeof window !== 'undefined') {
    const savedCode = localStorage.getItem(LANG_CODE_KEY);
    const found = AVAILABLE_LANGUAGES.find(l => l.code === savedCode);
    return found ? found : AVAILABLE_LANGUAGES[0]; // English mặc định
  }
  return AVAILABLE_LANGUAGES[0];
}
