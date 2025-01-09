import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface YearlyAttendanceChartProps {
  yearlyStats: Array<{
    month: string;
    attendance: number;
    total: number;
    percentage: number;
  }>;
}

export function YearlyAttendanceChart({ yearlyStats }: YearlyAttendanceChartProps) {
  const chartTheme = {
    stroke: "#4169E1",
    fill: "#4169E1"
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={yearlyStats}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
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
          />
          <Line
            type="stepAfter"
            dataKey="percentage"
            stroke={chartTheme.stroke}
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