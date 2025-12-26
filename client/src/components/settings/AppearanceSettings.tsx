'use client'

import { useThemeStore, type Theme, type Color } from '@/stores/themeStore'
import { useLanguageStore, languages, type Language } from '@/stores/languageStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Monitor, Moon, Sun, Check, Palette } from 'lucide-react'

export function AppearanceSettings() {
  const { theme, color, setTheme, setColor } = useThemeStore()
  const { language, setLanguage, t } = useLanguageStore()

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: t('settings.theme.light'), icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: t('settings.theme.dark'), icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: t('settings.theme.system'), icon: <Monitor className="h-4 w-4" /> },
  ]

  const colorOptions: { value: Color; label: string; class: string }[] = [
    { value: 'green', label: t('settings.color.green'), class: 'bg-emerald-500' },
    { value: 'blue', label: t('settings.color.blue'), class: 'bg-blue-500' },
    { value: 'purple', label: t('settings.color.purple'), class: 'bg-purple-500' },
    { value: 'orange', label: t('settings.color.orange'), class: 'bg-orange-500' },
    { value: 'red', label: t('settings.color.red'), class: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            {t('settings.theme')}
          </CardTitle>
          <CardDescription>
            {language === 'tr' 
              ? 'Uygulamanın görünümünü değiştirin - açık, koyu veya sistem ayarlarına uygun'
              : language === 'ru' 
              ? 'Измените внешний вид приложения - светлый, темный или по системным настройкам'
              : language === 'en'
              ? 'Change app appearance - light, dark or match system settings'
              : "Ilova ko'rinishini o'zgartiring - yorqin, qorong'u yoki tizim sozlamalariga moslang"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <Button
              key={option.value}
              variant={theme === option.value ? 'default' : 'outline'}
              onClick={() => setTheme(option.value)}
              className={cn(
                'h-auto p-4 flex flex-col items-center gap-2',
                theme === option.value && 'ring-2 ring-primary'
              )}
            >
              {option.icon}
              <span className="text-sm font-medium">{option.label}</span>
              {theme === option.value && <Check className="h-4 w-4 text-primary" />}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Color Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {language === 'tr' 
              ? 'Renk Şeması'
              : language === 'ru' 
              ? 'Цветовая схема'
              : language === 'en'
              ? 'Color Scheme'
              : 'Rang sxemasi'
            }
          </CardTitle>
          <CardDescription>
            {language === 'tr' 
              ? 'Uygulamanın ana rengini seçin'
              : language === 'ru' 
              ? 'Выберите основной цвет приложения'
              : language === 'en'
              ? 'Choose the primary color of the app'
              : 'Ilovaning asosiy rangini tanlang'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {colorOptions.map((option) => (
            <Button
              key={option.value}
              variant={color === option.value ? 'default' : 'outline'}
              onClick={() => setColor(option.value)}
              className={cn(
                'h-auto p-4 flex flex-col items-center gap-2',
                color === option.value && 'ring-2 ring-offset-2 ring-primary'
              )}
            >
              <div className={cn('h-6 w-6 rounded-full', option.class)} />
              <span className="text-sm font-medium">{option.label}</span>
              {color === option.value && <Check className="h-4 w-4 text-primary" />}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.language')}</CardTitle>
          <CardDescription>
            {language === 'tr' 
              ? 'Uygulama dilini değiştirin'
              : language === 'ru' 
              ? 'Изменить язык приложения'
              : language === 'en'
              ? 'Change the application language'
              : "Ilova tilini o'zgartiring"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? 'default' : 'outline'}
              onClick={() => setLanguage(lang.code)}
              className={cn(
                'h-auto p-4 flex flex-col items-center gap-2',
                language === lang.code && 'ring-2 ring-primary'
              )}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="text-center">
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-xs text-muted-foreground">{lang.name}</div>
              </div>
              {language === lang.code && <Check className="h-4 w-4 text-primary" />}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}