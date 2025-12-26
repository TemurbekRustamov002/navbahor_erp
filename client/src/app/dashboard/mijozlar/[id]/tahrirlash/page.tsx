'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { useBackendCustomerStore } from '@/stores/backendCustomerStore'
import { Customer } from '@/types/customer'
import { ArrowLeft, Edit } from 'lucide-react'

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const { updateCustomer, findCustomerById } = useBackendCustomerStore()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (customerId) {
      loadCustomer(customerId)
    }
  }, [customerId])

  const loadCustomer = async (id: string) => {
    setLoading(true)
    try {
      // Use backend store to find customer
      const customerData = findCustomerById(id)
      if (customerData) {
        setCustomer(customerData)
      } else {
        // Mock customer data
        setCustomer({
          id,
          name: 'Silk Road Textiles',
          tin: '123456789',
          address: 'Toshkent, Chilonzor tumani, Bunyodkor ko\'chasi 1-uy',
          contactName: 'Aziz Karimov',
          contactPhone: '+998 90 123 45 67',
          contactEmail: 'aziz@silkroad.uz',
          notes: 'Muntazam mijoz, sifatga e\'tibor beradi',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        })
      }
    } catch (error) {
      console.error('Error loading customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCustomer = async (data: any) => {
    if (!customer) return

    setIsSubmitting(true)
    try {
      await updateCustomer(customer.id, data)
      alert('Mijoz ma\'lumotlari yangilandi!')
      router.push(`/dashboard/mijozlar/${customer.id}`)
    } catch (error) {
      console.error('Failed to update customer:', error)
      alert('Xato yuz berdi. Qayta urinib ko\'ring.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/mijozlar/${customerId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Ma'lumotlar yuklanmoqda..." />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orqaga
          </Button>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Mijoz topilmadi
          </h3>
          <p className="text-gray-600">
            Ko'rsatilgan mijoz mavjud emas yoki o'chirilgan
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] animate-in fade-in duration-700 pb-20">
      {/* Navbahor Premium Header */}
      <div className="border-b border-slate-100 bg-white/85 backdrop-blur-md px-8 py-5 shadow-sm border border-white/60 mb-10">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center p-0"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            </Button>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/5">
                <Edit className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight leading-none mb-1">Hamkorni <span className="text-primary italic">Tahrirlash</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">{customer.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 lg:px-12 max-w-[1700px] mx-auto">
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-6 duration-700">
          <CustomerForm
            customer={customer}
            onSave={handleUpdateCustomer}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}