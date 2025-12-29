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
    PieChart,
    Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ReportChartsProps {
    stats: any;
}

export function ReportCharts({ stats }: ReportChartsProps) {
    if (!stats) return null;

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Production Chart */}
            <Card className="border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-white/80 backdrop-blur-md">
                <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Ishlab Chiqarish (Turlari boʻyicha)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.production}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="type"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="weight" radius={[8, 8, 0, 0]}>
                                {stats.production.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Shipment Trends */}
            <Card className="border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-white/80 backdrop-blur-md">
                <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Yuklanish Dinamikasi (Oxirgi 7 kun)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.recentShipments}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                tickFormatter={(val) => val.split('-').slice(1).reverse().join('.')}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#10b981"
                                strokeWidth={4}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
