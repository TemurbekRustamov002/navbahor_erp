'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
  }, [error])

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
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Xatolik yuz berdi
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Kechirasiz, dasturda kutilmagan xatolik yuz berdi. 
              Iltimos, sahifani yangilab ko'ring yoki texnik yordam bilan bog'laning.
            </p>
            
            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                <div className="flex items-center mb-2">
                  <Bug className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-red-700">Debug Ma'lumoti:</span>
                </div>
                <code className="text-xs text-red-600 break-all">
                  {error.message}
                </code>
                {error.digest && (
                  <div className="mt-2">
                    <span className="text-xs text-red-500">Error ID: {error.digest}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={reset}
              className="w-full bg-nb-green hover:bg-nb-green/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Qayta urinish
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Bosh sahifaga qaytish
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Muammo davom etsa, texnik yordam bilan bog'laning:
              <br />
              <span className="font-medium text-nb-green">support@navbahor.uz</span>
              <br />
              <span className="font-medium text-nb-green">+998 71 123-45-67</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}