"use client";

import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function DashboardCharts({ revenueData, statusData }: { revenueData: any[], statusData: any[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Added polyfill classes for the loading state */}
        <div className="lg:col-span-2 bg-white h-[400px] rounded-[24px] border border-gray-100 transition-colors chart-bg-card chart-border-main"></div>
        <div className="bg-white h-[400px] rounded-[24px] border border-gray-100 transition-colors chart-bg-card chart-border-main"></div>
      </div>
    );
  }

  // Check if there are any leads at all so the Pie Chart doesn't render an invisible circle
  const hasLeads = statusData.some(d => d.value > 0);

  return (
    <>
      <style>{`
        /* 🛡️ GUARANTEED DARK MODE OVERRIDES FOR RECHARTS 🛡️ */
        html.dark .chart-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
        html.dark .chart-border-main { border-color: #334155 !important; }
        html.dark .chart-text-secondary { color: #94A3B8 !important; }

        /* Recharts SVG Overrides */
        html.dark .recharts-cartesian-grid line { stroke: #334155 !important; }
        html.dark .recharts-cartesian-axis-tick-value tspan { fill: #94A3B8 !important; }
        html.dark .recharts-legend-item-text { color: #94A3B8 !important; }
        
        /* Recharts Tooltip Overrides */
        html.dark .recharts-default-tooltip { 
            background-color: #0F172A !important; 
            border-color: #334155 !important; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
        }
        html.dark .recharts-tooltip-item { color: #E2E8F0 !important; }
        html.dark .recharts-tooltip-label { color: #94A3B8 !important; }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* --- CHART 1: REVENUE TREND --- */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[24px] border border-gray-100 shadow-sm transition-all hover:shadow-md chart-bg-card chart-border-main">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 chart-text-secondary">Revenue Trend (Current Year)</h3>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A93A7', fontWeight: 600 }} dy={10} />
                <YAxis 
  axisLine={false} 
  tickLine={false} 
  tick={{ fontSize: 12, fill: '#8A93A7', fontWeight: 600 }} 
  tickFormatter={(value) => {
    if (value >= 1000000) return `Rs ${value / 1000000}M`;
    return `Rs ${value / 1000}k`;
  }} 
/><YAxis 
  axisLine={false} 
  tickLine={false} 
  tick={{ fontSize: 12, fill: '#8A93A7', fontWeight: 600 }} 
  tickFormatter={(value) => {
    if (value >= 1000000) return `Rs ${value / 1000000}M`;
    return `Rs ${value / 1000}k`;
  }} 
/>
                
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E5E9F2', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                  itemStyle={{ fontWeight: 800, color: '#0A1628' }}
                  formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
                />
                
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- CHART 2: LEAD DISTRIBUTION --- */}
        <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-100 shadow-sm transition-all hover:shadow-md chart-bg-card chart-border-main">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 chart-text-secondary">Leads Health</h3>
          
          <div style={{ width: '100%', height: 300 }}>
            {!hasLeads ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 chart-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="font-bold text-sm">No leads to display</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E5E9F2', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                    itemStyle={{ fontWeight: 800, color: '#0A1628' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 700, color: '#4B5563' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </>
  );
}