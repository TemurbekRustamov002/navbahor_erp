'use client'

import { useAuthStore } from '@/stores/authStore'
import { AuditDashboard } from '@/components/admin/AuditDashboard'
import { AdminUsersManager } from '@/components/admin/AdminUsersManager'

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
    <div className="space-y-8 p-2 md:p-4">
      <section>
        <h2 className="text-xl font-semibold mb-3">Foydalanuvchilar boshqaruvi</h2>
        <AdminUsersManager />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Audit loglari</h2>
        <AuditDashboard />
      </section>
    </div>
  )
}
