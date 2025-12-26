'use client'

import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft, Search, Wrench } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-nb-dark via-nb-dark to-purple-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-nb-green/10 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-nb-green rounded"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                navbahor<span className="text-nb-green">tekstil</span>
              </h2>
              <p className="text-gray-600 text-xs">ERP Tizimi</p>
            </div>
          </div>

          {/* Error Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Sahifa topilmadi
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan. 
              Iltimos, URL manzilini tekshiring yoki bosh sahifaga qaytishingiz mumkin.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-nb-green hover:bg-nb-green/90"
            >
              <Home className="w-4 h-4 mr-2" />
              Bosh sahifaga qaytish
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Orqaga qaytish
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-500 mb-3">
              <Wrench className="w-4 h-4 mr-2" />
              Yordam kerakmi?
            </div>
            <p className="text-xs text-gray-500">
              Agar muammo davom etsa, texnik yordam bilan bog'laning: 
              <br />
              <span className="font-medium text-nb-green">+998 71 123-45-67</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}