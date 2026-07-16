import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "./Card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  gradient?: string;
  iconColor?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  gradient = "from-foreground/10 to-foreground/5",
  iconColor = "text-foreground"
}: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", gradient, iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend.isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
          )}>
            {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-black text-foreground">{value}</h3>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
        {title}
      </p>
      {description && (
        <p className="text-xs font-medium text-muted-foreground mt-3">
          {description}
        </p>
      )}
    </Card>
  );
}
