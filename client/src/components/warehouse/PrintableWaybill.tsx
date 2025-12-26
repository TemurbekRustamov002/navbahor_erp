"use client";
import React from 'react';
import { formatWeight } from '@/lib/utils/number';
import { FileText } from 'lucide-react';

interface WaybillProps {
    data: {
        waybillNumber?: string;
        date: string;
        customerName: string;
        driverName: string;
        vehicleNumber: string;
        items: any[];
        totalWeight: number;
        notes?: string;
    };
}

export function PrintableWaybill({ data }: WaybillProps) {
    return (
        <div className="bg-white p-12 text-slate-900 font-sans leading-relaxed max-w-5xl mx-auto shadow-2xl rounded-sm" id="waybill-content">
            {/* Authoritative Header - Senior Polish */}
            <div className="flex justify-between items-start border-b-[3px] border-slate-900 pb-8 mb-10">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">NAVBAHOR <span className="text-primary italic">TEKSTIL</span> ERP</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] leading-none">INTEGRIRALLASHGAN KLASTER BOSHQARUVI</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">YUK XATI</h2>
                    <p className="text-[13px] font-black tracking-widest text-slate-500 mt-1 uppercase">SERIYA: {data.waybillNumber || 'PRO-FORMA'}</p>
                </div>
            </div>

            {/* Logistics Intelligence Grid */}
            <div className="grid grid-cols-2 gap-16 mb-12">
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Yuboruvchi Tashkilot</p>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-all hover:bg-white">
                            <p className="font-black text-[15px] uppercase tracking-tight text-slate-900 leading-tight">"NAVBAHOR TEKSTIL" MCHJ</p>
                            <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">Navoiy viloyati, Navbahor tumani, Sanoat zonasi</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Yukni Qabul Qiluvchi</p>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm transition-all hover:bg-white">
                            <p className="font-black text-[15px] uppercase tracking-tight text-slate-900 leading-tight">{data.customerName}</p>
                            <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Shartnoma asosida rasmiylashtirilgan mijoz</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sana / Date</p>
                            <p className="font-black text-sm tabular-nums">{new Date(data.date).toLocaleDateString('uz-UZ')}</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vaqt / Time</p>
                            <p className="font-black text-sm tabular-nums">{new Date(data.date).toLocaleTimeString('uz-UZ')}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Transport va Logistika Operatori</p>
                        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-2">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mashina:</span>
                                <span className="text-[13px] font-black text-white uppercase tracking-widest tabular-nums">{data.vehicleNumber}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Haydovchi:</span>
                                <span className="text-[13px] font-black text-white uppercase tracking-tight">{data.driverName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Industrial Items Table - Senior Fidelity */}
            <div className="mb-12 overflow-hidden rounded-2xl border border-slate-900 shadow-sm">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white">
                            <th className="p-4 text-[11px] font-black uppercase tracking-widest text-center border-r border-white/10 w-16">№</th>
                            <th className="p-4 text-[11px] font-black uppercase tracking-widest text-left border-r border-white/10">Marka</th>
                            <th className="p-4 text-[11px] font-black uppercase tracking-widest text-left border-r border-white/10">Toy Identifikatori</th>
                            <th className="p-4 text-[11px] font-black uppercase tracking-widest text-left border-r border-white/10">Mahsulot Klasifikatsiyasi</th>
                            <th className="p-4 text-[11px] font-black uppercase tracking-widest text-right">Sof Vazn (Netto)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, idx) => (
                            <tr key={item.id} className="border-b border-slate-200 transition-colors hover:bg-slate-50/50">
                                <td className="p-4 text-center text-[11px] font-black border-r border-slate-200 tabular-nums text-slate-400">{idx + 1}</td>
                                <td className="p-4 text-[11px] font-black border-r border-slate-200 uppercase tracking-tight">M#{item.marka?.number || item.markaNo || '---'}</td>
                                <td className="p-4 text-[11px] font-black border-r border-slate-200 tabular-nums">#{item.toy?.orderNo || item.orderNo || '---'}</td>
                                <td className="p-4 text-[11px] font-bold border-r border-slate-200 uppercase text-slate-500">{item.productType}</td>
                                <td className="p-4 text-[13px] font-black border-r-0 text-right tabular-nums text-slate-900">{formatWeight(item.netto, 'kg', 2)}</td>
                            </tr>
                        ))}
                        <tr className="bg-slate-50/80">
                            <td colSpan={4} className="p-5 text-right text-[11px] font-black uppercase tracking-[0.3em] border-t-2 border-slate-900 text-slate-500">JAMI UMUMIY VAZN:</td>
                            <td className="p-5 text-xl font-black text-right border-t-2 border-slate-900 tabular-nums text-slate-900">{formatWeight(data.totalWeight, 'kg', 2)} KG</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Verification Signatures - Authoritative System */}
            <div className="grid grid-cols-3 gap-12 mt-20 pb-16">
                <div className="border-t-[3px] border-slate-900 pt-6 text-center group">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-12 text-slate-400 transition-colors group-hover:text-slate-900">Topshirdi (Ombor Mas&apos;uli)</p>
                    <div className="h-px w-3/4 mx-auto bg-slate-200 mb-2"></div>
                    <p className="text-[11px] font-black uppercase tracking-widest">____________________</p>
                </div>
                <div className="border-t-[3px] border-slate-900 pt-6 text-center group">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-12 text-slate-400 transition-colors group-hover:text-slate-900">Qabul Qildi (Logistika)</p>
                    <div className="h-px w-3/4 mx-auto bg-slate-200 mb-2"></div>
                    <p className="text-[12px] font-black uppercase tracking-tight">{data.driverName}</p>
                </div>
                <div className="border-t-[3px] border-slate-900 pt-6 text-center group">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-12 text-slate-400 transition-colors group-hover:text-slate-900">Qabul Qildi (Mijoz Agent)</p>
                    <div className="h-px w-3/4 mx-auto bg-slate-300 mb-2"></div>
                    <p className="text-[11px] font-black uppercase tracking-widest">____________________</p>
                </div>
            </div>

            {/* Notes Intelligence Section */}
            {data.notes && (
                <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-slate-100 flex items-center justify-center rounded-bl-xl">
                        <FileText size={14} className="text-slate-400" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Maxsus Ko&apos;rsatmalat va Izohlar:</p>
                    <p className="text-[13px] font-bold text-slate-700 italic leading-relaxed">{data.notes}</p>
                </div>
            )}

            <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-4 px-6 py-2 bg-slate-50 rounded-full border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">
                        NAVBAHOR TEKSTIL ERP • AVTOMATIK GENERATSIYA QILINGAN HUJJAT
                    </p>
                </div>
            </div>
        </div>
    );
}
