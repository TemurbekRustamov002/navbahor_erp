"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { downloadBlob } from "@/lib/utils/export";
import * as XLSX from "xlsx";
import { Trash2, Edit, RefreshCw, CheckCircle2, XCircle, Search } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface PagedUsers {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function AdminUsersManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<PagedUsers | null>(null);

  // filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState<string>(""); // "", "true", "false"

  const pages = useMemo(() => data?.pages ?? 1, [data]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<PagedUsers>("/admin/users", {
        params: {
          page,
          limit,
          search: search || undefined,
          role: role || undefined,
          isActive: isActive === "" ? undefined : isActive === "true",
        },
      });
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const applyFilters = () => {
    setPage(1);
    fetchUsers();
  };

  const resetFilters = () => {
    setSearch("");
    setRole("");
    setIsActive("");
    setPage(1);
    fetchUsers();
  };

  const toggleActive = async (user: AdminUser) => {
    try {
      await apiClient.put(`/admin/users/${user.id}/toggle-active`);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Statusni o'zgartirishda xatolik");
    }
  };

  const removeUser = async (user: AdminUser) => {
    if (!confirm(`${user.username} foydalanuvchini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await apiClient.delete(`/admin/users/${user.id}`);
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "O'chirishda xatolik");
    }
  };

  // Create User modal state
  const [isCreateOpen, setCreateOpen] = useState(false);
  const ROLES = [
    'ADMIN','SCALE','LAB','WAREHOUSE','SALES','ACCOUNTANT','SUPERVISOR','OPERATOR','LAB_ANALYST','WAREHOUSE_MANAGER','PRODUCTION_MANAGER','CUSTOMER_MANAGER','SALES_MANAGER'
  ] as const;

  const [createForm, setCreateForm] = useState({
    username: '', email: '', fullName: '', role: 'WAREHOUSE', password: '', confirmPassword: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Reset Password modal state
  const [isResetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const openResetModal = (user: AdminUser) => { setResetUser(user); setResetOpen(true); setResetPassword(''); };

  const submitCreate = async () => {
    // Basic client-side validation
    if (!createForm.username?.trim()) {
      setError("Login majburiy");
      return;
    }
    if (!createForm.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      setError("Email noto'g'ri yoki kiritilmagan");
      return;
    }
    if (!createForm.fullName?.trim()) {
      setError("FISH majburiy");
      return;
    }
    if (!createForm.password || createForm.password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (createForm.confirmPassword && createForm.confirmPassword !== createForm.password) {
      setError("Parollar mos emas");
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      await apiClient.post('/admin/users', createForm);
      setCreateOpen(false);
      setCreateForm({ username: '', email: '', fullName: '', role: 'WAREHOUSE', password: '', confirmPassword: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Yaratishda xatolik');
    } finally {
      setIsCreating(false);
    }
  };

  const submitReset = async () => {
    if (!resetUser) return;
    if (!resetPassword || resetPassword.length < 6) {
      setError("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    setIsResetting(true);
    setError(null);
    try {
      await apiClient.put(`/admin/users/${resetUser.id}/password`, { password: resetPassword });
      setResetOpen(false);
      setResetUser(null);
      setResetPassword('');
    } catch (err: any) {
      const serverMsg = err?.response?.data?.error?.message || err?.response?.data?.message;
      setError(serverMsg || err?.message || 'Parolni yangilashda xatolik');
    } finally {
      setIsResetting(false);
    }
  };

  const exportXLSX = () => {
    const rows = (data?.users || []).map((u, idx) => ({
      "#": (data!.page - 1) * data!.limit + idx + 1,
      ID: u.id,
      Login: u.username,
      FISH: u.fullName || "",
      Email: u.email || "",
      Roli: u.role,
      "Faol": u.isActive ? "Ha" : "Yo'q",
      "Yaratilgan": new Date(u.createdAt),
    }));
    const ws = XLSX.utils.json_to_sheet(rows, { cellDates: true });
    ws["!cols"] = [
      { wch: 4 },
      { wch: 24 },
      { wch: 18 },
      { wch: 24 },
      { wch: 16 },
      { wch: 12 },
      { wch: 8 },
      { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array", cellDates: true });
    downloadBlob(new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `users-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Foydalanuvchilar boshqaruvi</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 mr-1" /> Yangilash
            </Button>
            <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>+ Yangi foydalanuvchi</Button>
            <Button size="sm" onClick={exportXLSX}>XLSX eksport</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Qidirish</label>
            <div className="flex gap-2">
              <Input placeholder="username, email, FISH" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button variant="outline" onClick={applyFilters}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Roli</label>
            <Input placeholder="ADMIN/LAB/WAREHOUSE/..." value={role} onChange={(e) => setRole(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Faol</label>
            <select className="border rounded px-2 py-1 text-sm w-full" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
              <option value="">Hammasi</option>
              <option value="true">Ha</option>
              <option value="false">Yo'q</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={applyFilters}>Filtrlash</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2">Login</th>
                <th className="px-3 py-2">FISH</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Roli</th>
                <th className="px-3 py-2">Faol</th>
                <th className="px-3 py-2">Yaratilgan</th>
                <th className="px-3 py-2">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="p-6 text-center"><LoadingSpinner /></td>
                </tr>
              )}
              {!loading && (data?.users?.length || 0) === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">Hech narsa topilmadi</td>
                </tr>
              )}
              {!loading && data?.users?.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2">{u.username}</td>
                  <td className="px-3 py-2">{u.fullName || '—'}</td>
                  <td className="px-3 py-2">{u.email || '—'}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Ha' : "Yo'q"}</span></td>
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(u.createdAt).toLocaleString('uz-UZ')}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={u.isActive ? 'outline' : 'default'} onClick={() => toggleActive(u)}>
                        {u.isActive ? <XCircle className="h-4 w-4 mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />} {u.isActive ? 'Oʻchirish' : 'Faollashtirish'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openResetModal(u)}>
                        <Edit className="h-4 w-4 mr-1" /> Parolni yangilash
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeUser(u)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Oʻchirish
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sahifa hajmi:</span>
            <select className="border rounded px-2 py-1 text-sm" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              {[10, 20, 50, 100].map((n) => (<option key={n} value={n}>{n}</option>))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Oldingi</Button>
            <span className="text-sm text-gray-600">{page} / {pages}</span>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Keyingi</Button>
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <Alert title="Xatolik" variant="error">{error}</Alert>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Create User Modal */}
    <Modal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} title="Yangi foydalanuvchi" size="lg">
      {error && (
        <div className="mb-3">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Login</label>
          <Input value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} placeholder="username" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Email</label>
          <Input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="email@example.com" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">FISH</label>
          <Input value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} placeholder="Full name" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Roli</label>
          <select
            className="border rounded px-2 py-1 text-sm w-full"
            value={createForm.role}
            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
          >
            {ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Parol</label>
          <Input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="parol" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Parol (tasdiq)</label>
          <Input type="password" value={createForm.confirmPassword} onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })} placeholder="parol" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => setCreateOpen(false)}>Bekor qilish</Button>
        <Button onClick={submitCreate} disabled={isCreating}>{isCreating ? 'Saqlanmoqda...' : 'Saqlash'}</Button>
      </div>
    </Modal>

    {/* Reset Password Modal */}
    <Modal isOpen={isResetOpen} onClose={() => setResetOpen(false)} title="Parolni yangilash" size="md">
      <div className="space-y-2">
        <div className="text-sm text-gray-600">Foydalanuvchi: <b>{resetUser?.username}</b></div>
        <label className="block text-xs text-gray-600 mb-1">Yangi parol</label>
        <Input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="yangi parol" />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={() => setResetOpen(false)}>Bekor qilish</Button>
        <Button onClick={submitReset} disabled={isResetting}>{isResetting ? 'Saqlanmoqda...' : 'Saqlash'}</Button>
      </div>
    </Modal>
    </>
  );
}
