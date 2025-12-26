import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'uz' | 'ru' | 'en' | 'tr'

export interface LanguageOption {
  code: Language
  name: string
  nativeName: string
  flag: string
}

export const languages: LanguageOption[] = [
  { code: 'uz', name: 'Uzbek', nativeName: "O'zbek", flag: '🇺🇿' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
]

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

// Translation keys - in production, this would come from translation files
const translations: Record<Language, Record<string, string>> = {
  uz: {
    // Navigation
    'nav.dashboard': 'Bosh sahifa',
    'nav.marka': 'Markalar',
    'nav.lab': 'Laboratoriya',
    'nav.warehouse': 'Ombor',
    'nav.customers': 'Mijozlar',
    'nav.production': 'Ishlab chiqarish',
    'nav.packages': 'Paketlar',
    'nav.scale': 'Tarozi',
    'nav.reports': 'Hisobotlar',
    'nav.settings': 'Sozlamalar',
    'nav.admin': 'Administrator',
    
    // Common
    'common.save': 'Saqlash',
    'common.cancel': 'Bekor qilish',
    'common.delete': 'O\'chirish',
    'common.edit': 'Tahrirlash',
    'common.add': 'Qo\'shish',
    'common.search': 'Qidirish',
    'common.loading': 'Yuklanmoqda...',
    'common.confirm': 'Tasdiqlash',
    'common.success': 'Muvaffaqiyatli',
    'common.error': 'Xatolik',
    'common.warning': 'Ogohlantirish',
    
    // Settings
    'settings.title': 'Sozlamalar',
    'settings.theme': 'Mavzu',
    'settings.language': 'Til',
    'settings.appearance': 'Ko\'rinish',
    'settings.theme.light': 'Yorqin',
    'settings.theme.dark': 'Qorong\'u',
    'settings.theme.system': 'Tizim',
    'settings.color.green': 'Yashil',
    'settings.color.blue': 'Ko\'k',
    'settings.color.purple': 'Binafsha',
    'settings.color.orange': 'Sariq',
    'settings.color.red': 'Qizil',
    
    // Dashboard
    'dashboard.welcome': 'Xush kelibsiz',
    'dashboard.overview': 'Umumiy ko\'rinish',
    'dashboard.stats': 'Statistika',
    'dashboard.recent_activity': 'Oxirgi faoliyat',
    
    // Auth
    'auth.login': 'Kirish',
    'auth.logout': 'Chiqish',
    'auth.username': 'Foydalanuvchi nomi',
    'auth.password': 'Parol',
    'auth.remember_me': 'Meni eslab qol',
  },
  ru: {
    // Navigation
    'nav.dashboard': 'Главная',
    'nav.marka': 'Марки',
    'nav.lab': 'Лаборатория',
    'nav.warehouse': 'Склад',
    'nav.customers': 'Клиенты',
    'nav.production': 'Производство',
    'nav.packages': 'Пакеты',
    'nav.scale': 'Весы',
    'nav.reports': 'Отчеты',
    'nav.settings': 'Настройки',
    'nav.admin': 'Администратор',
    
    // Common
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Редактировать',
    'common.add': 'Добавить',
    'common.search': 'Поиск',
    'common.loading': 'Загрузка...',
    'common.confirm': 'Подтвердить',
    'common.success': 'Успешно',
    'common.error': 'Ошибка',
    'common.warning': 'Предупреждение',
    
    // Settings
    'settings.title': 'Настройки',
    'settings.theme': 'Тема',
    'settings.language': 'Язык',
    'settings.appearance': 'Внешний вид',
    'settings.theme.light': 'Светлая',
    'settings.theme.dark': 'Темная',
    'settings.theme.system': 'Системная',
    'settings.color.green': 'Зеленый',
    'settings.color.blue': 'Синий',
    'settings.color.purple': 'Фиолетовый',
    'settings.color.orange': 'Оранжевый',
    'settings.color.red': 'Красный',
    
    // Dashboard
    'dashboard.welcome': 'Добро пожаловать',
    'dashboard.overview': 'Обзор',
    'dashboard.stats': 'Статистика',
    'dashboard.recent_activity': 'Последняя активность',
    
    // Auth
    'auth.login': 'Войти',
    'auth.logout': 'Выйти',
    'auth.username': 'Имя пользователя',
    'auth.password': 'Пароль',
    'auth.remember_me': 'Запомнить меня',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.marka': 'Brands',
    'nav.lab': 'Laboratory',
    'nav.warehouse': 'Warehouse',
    'nav.customers': 'Customers',
    'nav.production': 'Production',
    'nav.packages': 'Packages',
    'nav.scale': 'Scale',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.confirm': 'Confirm',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.warning': 'Warning',
    
    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.appearance': 'Appearance',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.system': 'System',
    'settings.color.green': 'Green',
    'settings.color.blue': 'Blue',
    'settings.color.purple': 'Purple',
    'settings.color.orange': 'Orange',
    'settings.color.red': 'Red',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',
    'dashboard.stats': 'Statistics',
    'dashboard.recent_activity': 'Recent Activity',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.remember_me': 'Remember me',
  },
  tr: {
    // Navigation
    'nav.dashboard': 'Ana Sayfa',
    'nav.marka': 'Markalar',
    'nav.lab': 'Laboratuvar',
    'nav.warehouse': 'Depo',
    'nav.customers': 'Müşteriler',
    'nav.production': 'Üretim',
    'nav.packages': 'Paketler',
    'nav.scale': 'Terazi',
    'nav.reports': 'Raporlar',
    'nav.settings': 'Ayarlar',
    'nav.admin': 'Yönetici',
    
    // Common
    'common.save': 'Kaydet',
    'common.cancel': 'İptal',
    'common.delete': 'Sil',
    'common.edit': 'Düzenle',
    'common.add': 'Ekle',
    'common.search': 'Ara',
    'common.loading': 'Yükleniyor...',
    'common.confirm': 'Onayla',
    'common.success': 'Başarılı',
    'common.error': 'Hata',
    'common.warning': 'Uyarı',
    
    // Settings
    'settings.title': 'Ayarlar',
    'settings.theme': 'Tema',
    'settings.language': 'Dil',
    'settings.appearance': 'Görünüm',
    'settings.theme.light': 'Açık',
    'settings.theme.dark': 'Koyu',
    'settings.theme.system': 'Sistem',
    'settings.color.green': 'Yeşil',
    'settings.color.blue': 'Mavi',
    'settings.color.purple': 'Mor',
    'settings.color.orange': 'Turuncu',
    'settings.color.red': 'Kırmızı',
    
    // Dashboard
    'dashboard.welcome': 'Hoş Geldiniz',
    'dashboard.overview': 'Genel Bakış',
    'dashboard.stats': 'İstatistikler',
    'dashboard.recent_activity': 'Son Aktiviteler',
    
    // Auth
    'auth.login': 'Giriş',
    'auth.logout': 'Çıkış',
    'auth.username': 'Kullanıcı Adı',
    'auth.password': 'Şifre',
    'auth.remember_me': 'Beni Hatırla',
  },
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'uz',
      
      setLanguage: (language: Language) => {
        set({ language })
        // Update document language
        if (typeof window !== 'undefined') {
          document.documentElement.lang = language
        }
      },
      
      t: (key: string, params?: Record<string, string | number>) => {
        const { language } = get()
        let translation = translations[language]?.[key] || key
        
        if (params) {
          Object.entries(params).forEach(([paramKey, value]) => {
            translation = translation.replace(`{{${paramKey}}}`, String(value))
          })
        }
        
        return translation
      },
    }),
    {
      name: 'navbahor-language-storage',
    }
  )
)