'use client'

import { useLanguageStore } from '@/stores/languageStore'
import { AppearanceSettings } from '@/components/settings/AppearanceSettings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Settings, User, Bell } from 'lucide-react'

export default function SettingsPage() {
  const { t, language } = useLanguageStore()

  const settingsSections = [
    {
      id: 'appearance',
      title: t('settings.appearance'),
      description: language === 'tr' 
        ? 'Tema, renk ve dil ayarları'
        : language === 'ru'
        ? 'Настройки темы, цвета и языка'
        : language === 'en'
        ? 'Theme, color and language settings'
        : 'Mavzu, rang va til sozlamalari',
      icon: Settings,
      component: <AppearanceSettings />,
    },
    {
      id: 'account',
      title: language === 'tr' 
        ? 'Hesap Ayarları'
        : language === 'ru'
        ? 'Настройки аккаунта'
        : language === 'en'
        ? 'Account Settings'
        : 'Hisob sozlamalari',
      description: language === 'tr' 
        ? 'Kişisel bilgiler ve hesap ayarları'
        : language === 'ru'
        ? 'Личная информация и настройки аккаунта'
        : language === 'en'
        ? 'Personal information and account settings'
        : 'Shaxsiy ma\'lumotlar va hisob sozlamalari',
      icon: User,
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {language === 'tr' 
                ? 'Hesap Bilgileri'
                : language === 'ru'
                ? 'Информация об аккаунте'
                : language === 'en'
                ? 'Account Information'
                : 'Hisob ma\'lumotlari'
              }
            </CardTitle>
            <CardDescription>
              {language === 'tr' 
                ? 'Kişisel bilgilerinizi güncelleyin'
                : language === 'ru'
                ? 'Обновите вашу личную информацию'
                : language === 'en'
                ? 'Update your personal information'
                : 'Shaxsiy ma\'lumotlaringizni yangilang'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Bu bo'lim tez orada ishga tushiriladi.</p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'notifications',
      title: language === 'tr' 
        ? 'Bildirimler'
        : language === 'ru'
        ? 'Уведомления'
        : language === 'en'
        ? 'Notifications'
        : 'Bildirishnomalar',
      description: language === 'tr' 
        ? 'E-posta ve push bildirim ayarları'
        : language === 'ru'
        ? 'Настройки email и push уведомлений'
        : language === 'en'
        ? 'Email and push notification settings'
        : 'Email va push bildirishnoma sozlamalari',
      icon: Bell,
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {language === 'tr' 
                ? 'Bildirim Ayarları'
                : language === 'ru'
                ? 'Настройки уведомлений'
                : language === 'en'
                ? 'Notification Settings'
                : 'Bildirishnoma sozlamalari'
              }
            </CardTitle>
            <CardDescription>
              {language === 'tr' 
                ? 'Hangi bildirimleri alacağınızı kontrol edin'
                : language === 'ru'
                ? 'Управляйте какие уведомления получать'
                : language === 'en'
                ? 'Control which notifications you receive'
                : 'Qanday bildirishnomalar olishni boshqaring'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {language === 'tr' 
                ? 'Bu bölüm yakında kullanıma sunulacak.'
                : language === 'ru'
                ? 'Этот раздел скоро будет запущен.'
                : language === 'en'
                ? 'This section will be available soon.'
                : 'Bu bo\'lim tez orada ishga tushiriladi.'
              }
            </p>
          </CardContent>
        </Card>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {language === 'tr' 
            ? 'Uygulama ayarlarını ve kişisel parametreleri yönetin'
            : language === 'ru'
            ? 'Управляйте настройками приложения и личными параметрами'
            : language === 'en'
            ? 'Manage application settings and personal parameters'
            : 'Ilova sozlamalarini va shaxsiy parametrlarni boshqaring'
          }
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="space-y-8">
        {settingsSections.map((section) => (
          <div key={section.id} className="space-y-4">
            <div className="flex items-center gap-3 border-b pb-2">
              <section.icon className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>
            <div>{section.component}</div>
          </div>
        ))}
      </div>
    </div>
  )
}