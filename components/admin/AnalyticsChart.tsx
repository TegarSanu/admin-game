"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsChartProps {
  data: any[];
  valueFormatter?: (value: any) => string;
  gradientId?: string;
  strokeColor?: string;
}

export default function AnalyticsChart({ 
  data, 
  valueFormatter = (val) => `$${val}`, 
  gradientId = "colorValue",
  strokeColor = "var(--accent)" 
}: AnalyticsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Beautiful placeholder matching the premium aesthetic while mounting
    return (
      <div className="h-[300px] w-full bg-muted/5 animate-pulse rounded-3xl border border-border/30" />
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.15}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickFormatter={valueFormatter}
          />
          <Tooltip 
            formatter={(value) => [valueFormatter(value), ""]}
            contentStyle={{ 
              backgroundColor: 'var(--background)', 
              borderColor: 'var(--border)',
              borderRadius: '14px',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 12px 20px -3px rgb(0 0 0 / 0.15)',
              borderWidth: '1px'
            }}
            itemStyle={{ color: 'var(--foreground)' }}
            cursor={{ stroke: 'var(--foreground)', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor} 
            strokeWidth={3}
            fillOpacity={1} 
            fill={`url(#${gradientId})`} 
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
