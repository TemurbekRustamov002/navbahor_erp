"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { apiClient } from "@/lib/api";
import { TestTube, Terminal, Zap, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarkaTestForm() {
  const [number, setNumber] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const testCreateMarka = async () => {
    setLoading(true);
    setResult("");
    try {
      const response = await apiClient.post('/markas', {
        number,
        productType: "TOLA",
        sex: "ARRALI",
        selection: "S-6524",
        ptm: "4.2",
        pickingType: "mashina",
        capacity: 220,
        showOnScale: true
      });
      setResult(`[SYSTEM_SUCCESS]: UNIT_CREATED\n${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`[SYSTEM_ERROR]: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetMarkas = async () => {
    setLoading(true);
    setResult("");
    try {
      const response = await apiClient.get('/markas');
      setResult(`[SYSTEM_SUCCESS]: DATA_FETCH_COMPLETE\n${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`[SYSTEM_ERROR]: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card rounded-[2.5rem] border-white/60 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <CardHeader className="p-8 border-b border-white/40 bg-white/40 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-sm">
            <TestTube size={22} strokeWidth={2} />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-foreground uppercase tracking-tight leading-none">
              API <span className="text-primary italic">Debugger</span>
            </CardTitle>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Sistemaviy Testlash Protokoli</p>
          </div>
        </div>
        <ShieldCheck className="text-primary/20" size={32} />
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Simulyatsiya Raqami</Label>
          <div className="relative group">
            <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 h-5 w-5" />
            <Input
              type="number"
              value={number}
              onChange={(e) => setNumber(Number(e.target.value))}
              className="h-14 pl-14 bg-white/80 border-border rounded-xl text-xl font-bold text-foreground focus:ring-primary/20 transition-all font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={testGetMarkas}
            disabled={loading}
            className="h-12 rounded-xl bg-white border border-border text-foreground hover:bg-slate-50 transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm active:scale-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bazani Tekshirish"}
          </Button>

          <Button
            onClick={testCreateMarka}
            disabled={loading}
            className="h-12 rounded-xl bg-primary text-white border-none hover:bg-green-700 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap size={14} fill="currentColor" />}
            Obyekt Yaratish
          </Button>
        </div>

        {result && (
          <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Sistemaviy Log</Label>
            <pre className="p-6 bg-slate-900 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-auto max-h-64 scrollbar-thin scrollbar-thumb-emerald-900 shadow-inner">
              {result}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}