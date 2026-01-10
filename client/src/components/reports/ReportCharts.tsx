import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardStats } from '@/stores/reportStore';

interface ReportChartsProps {
    stats: DashboardStats | null;
}

export function ReportCharts({ stats }: ReportChartsProps) {
    if (!stats) return null;

    // Use primary green and its variations
    const COLORS = ['#0bae4a', '#10b981', '#059669', '#34d399', '#6ee7b7'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Production Chart */}
            <Card className="card-premium overflow-hidden border-none shadow-xl">
                <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-label-premium">Ishlab Chiqarish (Turlari boʻyicha)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.production}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis
                                dataKey="type"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9', radius: 8 }}
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(8px)'
                                }}
                            />
                            <Bar dataKey="weight" radius={[6, 6, 0, 0]} barSize={40}>
                                {stats.production.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Shipment Trends */}
            <Card className="card-premium overflow-hidden border-none shadow-xl">
                <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-label-premium">Yuklanish Dinamikasi (Oxirgi 7 kun)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.recentShipments}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0bae4a" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0bae4a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                tickFormatter={(val) => val.split('-').slice(1).reverse().join('.')}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(8px)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#0bae4a"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                dot={{ fill: '#0bae4a', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
