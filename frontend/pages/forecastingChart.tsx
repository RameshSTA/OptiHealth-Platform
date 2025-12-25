import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
  // Removed 'defs', 'linearGradient', 'stop' because they are native SVG tags!
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ChartData {
  actual: { date: string; count: number }[];
  predicted: { date: string; count: number }[];
}

interface Props {
  data: ChartData;
}

const ForecastingChart: React.FC<Props> = ({ data }) => {
  
  const chartData = useMemo(() => {
    if (!data || (!data.actual && !data.predicted)) return [];

    const mergedDataMap = new Map();

    // 1. Map Actual Data
    data.actual?.forEach((item) => {
      mergedDataMap.set(item.date, {
        date: item.date,
        actual: item.count,
        predicted: null, 
      });
    });

    // 2. Map Predicted Data
    data.predicted?.forEach((item) => {
      if (mergedDataMap.has(item.date)) {
        mergedDataMap.get(item.date).predicted = item.count;
      } else {
        mergedDataMap.set(item.date, {
          date: item.date,
          actual: null,
          predicted: item.count,
        });
      }
    });

    return Array.from(mergedDataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100">
          <p className="text-sm font-bold text-slate-700 mb-2">
            {format(parseISO(label), 'MMM dd, yyyy')}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm font-medium" style={{ color: entry.color }}>
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold text-lg">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
            <h2 className="text-xl font-bold text-slate-900">Patient Census Forecasting</h2>
            <p className="text-sm text-slate-500">AI-powered 7-day admission trajectory</p>
        </div>
        
        {/* LEGEND BADGES */}
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-teal-700 bg-teal-50 rounded-lg border border-teal-100">
            <div className="w-3 h-3 rounded-full bg-teal-600"></div> Actual
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-orange-700 bg-orange-50 rounded-lg border border-orange-100">
             <div className="w-3 h-1.5 rounded-full bg-orange-500" style={{borderStyle: 'dashed', borderWidth: '2px', borderColor: '#F97316', background: 'none'}}></div> AI Predicted
          </div>
        </div>
      </div>

      {/* CHART WRAPPER */}
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            
            {/* Native SVG tags work automatically in React */}
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.05}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              dy={10}
              tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
              minTickGap={30}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              domain={['auto', 'auto']}
              dx={-10}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F97316', strokeWidth: 2, strokeDasharray: '4 4' }} />

            {/* ACTUAL LINE (Teal, Solid) */}
            <Area
              type="monotone"
              dataKey="actual"
              name="Actual Census"
              stroke="#0D9488"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActual)"
              dot={false}
              activeDot={{ r: 6, strokeWidth: 3, stroke: 'white', fill: '#0D9488' }}
              connectNulls={true}
            />

            {/* PREDICTED LINE (Orange, Dotted) */}
            <Line
              type="monotone"
              dataKey="predicted"
              name="AI Forecast"
              stroke="#F97316"       
              strokeWidth={3}
              strokeDasharray="6 6"  
              dot={false}
              activeDot={{ r: 6, strokeWidth: 3, stroke: 'white', fill: '#F97316' }}
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastingChart;