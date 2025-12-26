"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { downloadBlob } from "@/lib/utils/export";
import * as XLSX from "xlsx";
import { apiClient } from "@/lib/api";
import { AlertTriangle, Filter, RefreshCw, FileDown, List, Database } from "lucide-react";

interface AuditLog {
  id: string;
  actorId?: string;
  actorRole?: string;
  action: string;
  entity: string;
  entityId?: string;
  diff?: any;
  ip?: string;
  createdAt: string;
}

interface PagedResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function AuditDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<PagedResponse | null>(null);
  const [entities, setEntities] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [actorId, setActorId] = useState("");

  const fetchFilters = async () => {
    try {
      const [e, a] = await Promise.all([
        apiClient.get<string[]>("/admin/audit/entities"),
        apiClient.get<string[]>("/admin/audit/actions"),
      ]);
      setEntities(e || []);
      setActions(a || []);
    } catch (err) {
      // ignore; filters are optional
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<PagedResponse>("/admin/audit", {
        params: {
          page,
          limit,
          entity: entity || undefined,
          action: action || undefined,
          actorId: actorId || undefined,
        },
      });
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || "Ma'lumotni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const applyFilters = () => {
    setPage(1);
    fetchData();
  };

  const resetFilters = () => {
    setEntity("");
    setAction("");
    setActorId("");
    setPage(1);
    fetchData();
  };

  const exportCurrentPageXLSX = () => {
    if (!data) return;
    const rows = data.logs.map((l, idx) => ({
      "#": (data.page - 1) * data.limit + idx + 1,
      Sana: new Date(l.createdAt),
      "Foydalanuvchi": l.actorId || "",
      "Roli": l.actorRole || "",
      "Amal": l.action,
      "Ob'ekt": l.entity,
      "Ob'ekt ID": l.entityId || "",
      IP: l.ip || "",
      "O'zgarish": l.diff ? JSON.stringify(l.diff) : "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows, { cellDates: true });
    ws["!cols"] = [
      { wch: 4 },
      { wch: 20 },
      { wch: 16 },
      { wch: 12 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 40 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array", cellDates: true });
    downloadBlob(
      new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `audit-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const pages = useMemo(() => data?.pages ?? 1, [data]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit loglari</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-1" /> Qayta yuklash
              </Button>
              <Button size="sm" onClick={exportCurrentPageXLSX}>
                <FileDown className="h-4 w-4 mr-1" /> XLSX eksport
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Entity</label>
              <Input list="entities" placeholder="Masalan: marka, lab, toy" value={entity} onChange={(e) => setEntity(e.target.value)} />
              <datalist id="entities">
                {entities.map((e) => (
                  <option key={e} value={e} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Action</label>
              <Input list="actions" placeholder="create/update/delete/login" value={action} onChange={(e) => setAction(e.target.value)} />
              <datalist id="actions">
                {actions.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Foydalanuvchi (actorId)</label>
              <Input placeholder="user id" value={actorId} onChange={(e) => setActorId(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={applyFilters}>
                <Filter className="h-4 w-4 mr-1" /> Filtrlash
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 border rounded-lg">
              <div className="text-xs text-gray-500">Jami loglar</div>
              <div className="text-lg font-semibold">{data?.total ?? 0}</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-xs text-gray-500">Sahifa</div>
              <div className="text-lg font-semibold">{data?.page ?? page} / {pages}</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-xs text-gray-500">Sahifa hajmi</div>
              <div className="text-lg font-semibold">{data?.limit ?? limit}</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-xs text-gray-500">Entitylar</div>
              <div className="text-lg font-semibold">{entities.length}</div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-3 py-2">Sana</th>
                  <th className="px-3 py-2">Foydalanuvchi</th>
                  <th className="px-3 py-2">Roli</th>
                  <th className="px-3 py-2">Amal</th>
                  <th className="px-3 py-2">Ob'ekt</th>
                  <th className="px-3 py-2">Ob'ekt ID</th>
                  <th className="px-3 py-2">IP</th>
                  <th className="px-3 py-2">O'zgarish</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                )}
                {!loading && data?.logs?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-gray-500">
                      Hech narsa topilmadi
                    </td>
                  </tr>
                )}
                {!loading && data?.logs?.map((log) => (
                  <tr key={log.id} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(log.createdAt).toLocaleString("uz-UZ")}</td>
                    <td className="px-3 py-2">{log.actorId || "—"}</td>
                    <td className="px-3 py-2">{log.actorRole || "—"}</td>
                    <td className="px-3 py-2">{log.action}</td>
                    <td className="px-3 py-2">{log.entity}</td>
                    <td className="px-3 py-2">{log.entityId || "—"}</td>
                    <td className="px-3 py-2">{log.ip || "—"}</td>
                    <td className="px-3 py-2 max-w-[360px]">
                      {log.diff ? (
                        <details className="text-xs text-gray-600">
                          <summary className="cursor-pointer text-nb-green">Ko'rish</summary>
                          <pre className="p-2 bg-gray-50 rounded overflow-auto max-h-48">
                            {JSON.stringify(log.diff, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
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
              <select
                className="border rounded px-2 py-1 text-sm"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Oldingi
              </Button>
              <span className="text-sm text-gray-600">{page} / {pages}</span>
              <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
                Keyingi
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div>
                {error}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage/DB quick info (placeholder, can be wired to real endpoints later) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" /> Ma'lumotlar bazasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">Audt loglar soni: {data?.total ?? 0}</div>
            <div className="text-xs text-gray-400">Realtime monitoring keyin qo'shiladi</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><List className="h-4 w-4" /> Entitylar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 text-xs">
              {entities.map((e) => (
                <span key={e} className="px-2 py-1 rounded bg-gray-100 text-gray-700">{e}</span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><List className="h-4 w-4" /> Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 text-xs">
              {actions.map((a) => (
                <span key={a} className="px-2 py-1 rounded bg-gray-100 text-gray-700">{a}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
