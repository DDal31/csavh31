import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface YearlyTrendChartProps {
  yearlyStats: Array<{
    month: string;
    attendance: number;
    total: number;
    percentage: number;
  }>;
}

export function YearlyTrendChart({ yearlyStats }: YearlyTrendChartProps) {
  const chartTheme = {
    stroke: "#4169E1",
    fill: "#4169E1"
  };

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={yearlyStats}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="month"
            tick={{ fill: '#fff' }}
          />
          <YAxis 
            tick={{ fill: '#fff' }}
            unit="%"
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taux de présence']}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.375rem',
              color: '#fff'
            }}
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke={chartTheme.stroke}
            strokeWidth={2}
            name="Taux de présence"
            role="graphics-symbol"
            aria-label="Pourcentage de présence mensuel"
            dot={{ fill: chartTheme.fill }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}