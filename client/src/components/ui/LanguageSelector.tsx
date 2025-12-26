'use client'

import { useLanguageStore, languages } from '@/stores/languageStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Fragment, useState } from 'react'
import { Dialog, Transition, Menu } from '@headlessui/react'
import { ChevronDown, Globe } from 'lucide-react'

interface LanguageSelectorProps {
  className?: string
  showFlag?: boolean
  showText?: boolean
}

export function LanguageSelector({ className, showFlag = true, showText = true }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguageStore()
  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  return (
    <Menu as="div" className="relative">
      <Menu.Button as={Button} variant="ghost" size="sm" className={cn('gap-2', className)}>
        {showFlag && <span className="text-lg">{currentLanguage.flag}</span>}
        {showText && <span className="text-sm">{currentLanguage.nativeName}</span>}
        <ChevronDown className="h-4 w-4" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md border bg-popover p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {languages.map((lang) => (
            <Menu.Item key={lang.code}>
              {({ active }) => (
                <button
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm',
                    active ? 'bg-accent text-accent-foreground' : 'text-foreground',
                    language === lang.code && 'bg-primary text-primary-foreground'
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{lang.nativeName}</span>
                    <span className="text-xs opacity-60">{lang.name}</span>
                  </div>
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguageStore()
  const [isOpen, setIsOpen] = useState(false)
  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn('relative', className)}
        title={`Current language: ${currentLanguage.nativeName}`}
      >
        <Globe className="h-4 w-4" />
        <span className="sr-only">Change language</span>
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-white dark:bg-black" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Select Language
                  </Dialog.Title>
                  <div className="mt-4 space-y-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setIsOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700',
                          language === lang.code && 'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="font-medium">{lang.nativeName}</div>
                          <div className="text-sm opacity-60">{lang.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}