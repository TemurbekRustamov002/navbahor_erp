'use client'

import { useAuthStore } from '@/stores/authStore'
import { AuditDashboard } from '@/components/admin/AuditDashboard'
import { AdminUsersManager } from '@/components/admin/AdminUsersManager'
import { ModificationRequestManager } from '@/components/admin/ModificationRequestManager'

export default function AdminPage() {
  const { user } = useAuthStore()
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN'

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
          Ushbu bo‘lim faqat Administratorlar uchun. Iltimos, admin hisob bilan kiring.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 p-2 md:p-6 bg-slate-50/50 min-h-screen">
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ModificationRequestManager />
      </section>

      <div className="grid grid-cols-1 gap-12 mt-12">
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <AdminUsersManager />
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <AuditDashboard />
        </section>
      </div>
    </div>
  )
}
