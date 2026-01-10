import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { TrendingUp, Package, CheckCircle, Activity, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardStats } from "@/stores/reportStore";

interface ReportStatsProps {
    stats: DashboardStats | null;
}

export function ReportStats({ stats }: ReportStatsProps) {
    if (!stats) return null;

    const totalProduction = stats.production?.reduce((sum, p) => sum + p.weight, 0) || 0;
    const totalInStock = stats.inventory?.find(i => i.status === 'IN_STOCK')?.weight || 0;
    const totalShipped = stats.inventory?.find(i => i.status === 'SHIPPED')?.weight || 0;

    const cards = [
        {
            title: "Ishlab Chiqarish",
            value: totalProduction.toLocaleString(),
            unit: "kg",
            sub: "Joriy oy",
            icon: Activity,
            change: "+12.5%",
            changeType: 'increase' as const
        },
        {
            title: "Omborda Tayyor",
            value: totalInStock.toLocaleString(),
            unit: "kg",
            sub: "Mavjud zaxira",
            icon: Package,
            change: "+5.2%",
            changeType: 'increase' as const
        },
        {
            title: "Sotilgan",
            value: totalShipped.toLocaleString(),
            unit: "kg",
            sub: "Jami yuklangan",
            icon: CheckCircle,
            change: "+8.1%",
            changeType: 'increase' as const
        },
        {
            title: "Sifat Ko'rsatkichi",
            value: "98.5",
            unit: "%",
            sub: "Oʻrtacha samaradorlik",
            icon: TrendingUp,
            change: "+2.4%",
            changeType: 'increase' as const
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
            {cards.map((card, i) => (
                <Card key={i} className="card-premium group hover:-translate-y-2 transition-all duration-500 overflow-hidden border-none shadow-xl">
                    <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-all duration-700 group-hover:rotate-[15deg] shadow-md">
                                <card.icon className="h-7 w-7" />
                            </div>
                            <div className={cn(
                                "flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                card.changeType === 'increase'
                                    ? "bg-primary/10 text-primary"
                                    : "bg-destructive/10 text-destructive"
                            )}>
                                {card.changeType === 'increase' ? (
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {card.change}
                            </div>
                        </div>

                        <div className="mt-8">
                            <p className="text-label-premium">
                                {card.title}
                            </p>
                            <div className="flex items-baseline mt-2 gap-1.5">
                                <h3 className="text-3xl font-black text-foreground tracking-tight tabular-nums">
                                    {card.value}
                                </h3>
                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest italic opacity-70">
                                    {card.unit}
                                </span>
                            </div>
                        </div>

                        {/* Premium Progress Indicator */}
                        <div className="mt-6 relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className={cn(
                                "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-sm bg-gradient-to-r from-primary to-emerald-400"
                            )} style={{ width: i === 0 ? '75%' : i === 1 ? '45%' : i === 2 ? '60%' : '90%' }} />
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.sub}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
