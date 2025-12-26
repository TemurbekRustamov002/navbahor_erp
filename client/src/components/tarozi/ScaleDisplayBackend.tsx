"use client";
import { useScaleProfessional } from "@/lib/hooks/useScale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Scale, Wifi, WifiOff, CheckCircle, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScaleDisplayProps {
  weight: number;
  isStable: boolean;
  isConnected: boolean;
  unit?: string;
  className?: string;
}

export function ScaleDisplay({ 
  weight, 
  isStable, 
  isConnected, 
  unit = "kg", 
  className 
}: ScaleDisplayProps) {
  return (
    <Card className={cn("w-full h-auto", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-green-600 dark:text-green-400" />
            <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Tarozi Ma'lumotlari
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500 dark:text-red-400" />
            )}
            <span className={cn(
              "text-xs font-medium",
              isConnected 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-500 dark:text-red-400"
            )}>
              {isConnected ? "Ulangan" : "Uzilgan"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Weight Display */}
        <div className="text-center mb-4">
          <div className={cn(
            "text-3xl font-bold mb-1 transition-all duration-300",
            isConnected && isStable 
              ? "text-green-600 dark:text-green-400" 
              : isConnected
              ? "text-orange-500 dark:text-orange-400"
              : "text-gray-400 dark:text-gray-500"
          )}>
            {weight.toFixed(1)} {unit}
          </div>
          
          <div className="flex items-center justify-center gap-1 text-xs">
            {isConnected ? (
              isStable ? (
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <Activity className="h-3 w-3 text-orange-500 dark:text-orange-400 animate-pulse" />
              )
            ) : (
              <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
            )}
            <span className={cn(
              "font-medium",
              isConnected ? (
                isStable 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-orange-500 dark:text-orange-400"
              ) : "text-gray-400 dark:text-gray-500"
            )}>
              {isConnected ? (isStable ? "Barqaror" : "O'zgaruvchan") : "Kutilmoqda"}
            </span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border">
            <span className="text-slate-600 dark:text-slate-400">Model:</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              CAS CI-200A
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border">
            <span className="text-slate-600 dark:text-slate-400">Holat:</span>
            <span className={cn(
              "font-medium px-2 py-1 rounded-full text-xs",
              isConnected 
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            )}>
              {isConnected ? "Faol" : "Nofaol"}
            </span>
          </div>
        </div>

        {/* Real-time indicator */}
        {isConnected && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time ma'lumot uzatilmoqda</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}