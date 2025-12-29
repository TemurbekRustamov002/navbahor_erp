import { Card, CardContent } from "@/components/ui/Card";
import { TrendingUp, Package, CheckCircle, Activity } from "lucide-react";

interface ReportStatsProps {
    stats: any;
}

export function ReportStats({ stats }: ReportStatsProps) {
    if (!stats) return null;

    const totalProduction = stats.production.reduce((sum: number, p: any) => sum + p.weight, 0);
    const totalInStock = stats.inventory.find((i: any) => i.status === 'IN_STOCK')?.weight || 0;
    const totalShipped = stats.inventory.find((i: any) => i.status === 'SHIPPED')?.weight || 0;

    const cards = [
        {
            title: "Jami Ishlab Chiqarish",
            value: `${totalProduction.toLocaleString()} kg`,
            sub: "Joriy oy",
            icon: Activity,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Mavjud Zaxira",
            value: `${totalInStock.toLocaleString()} kg`,
            sub: "Omborda tayyor",
            icon: Package,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Sotilgan Mahsulot",
            value: `${totalShipped.toLocaleString()} kg`,
            sub: "Jami yuklangan",
            icon: CheckCircle,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            title: "Sifat Ko'rsatkichi",
            value: "98.5%",
            sub: "Oʻrtacha samaradorlik",
            icon: TrendingUp,
            color: "text-amber-600",
            bg: "bg-amber-50"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
                <Card key={i} className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mt-1">{card.value}</h3>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.sub}</span>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12.5%</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
