import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface MonthlyTrainingChartProps {
  currentMonthStats: {
    present: number;
    total: number;
  };
  sport: string;
  subtitle?: string;
}

export function MonthlyTrainingChart({ currentMonthStats, sport, subtitle }: MonthlyTrainingChartProps) {
  const percentage = currentMonthStats.total > 0 
    ? (currentMonthStats.present / currentMonthStats.total) * 100 
    : 0;

  // Create data for the gauge chart
  const data = [
    { name: "present", value: percentage },
    { name: "remaining", value: 100 - percentage }
  ];

  const chartTheme = {
    fill: "#4169E1",
    background: "#1f2937"
  };

  return (
    <div className="h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="80%"
            dataKey="value"
            role="graphics-symbol"
            aria-label={`Taux de présence aux entraînements de ${sport} pour le mois en cours: ${percentage.toFixed(1)}%`}
          >
            <Cell key="present" fill={chartTheme.fill} />
            <Cell key="remaining" fill={chartTheme.background} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-3xl font-bold">{percentage.toFixed(1)}%</span>
        <span className="text-sm mt-2">de présence</span>
        {subtitle && (
          <span className="text-sm mt-1 text-gray-400">{subtitle}</span>
        )}
      </div>
    </div>
  );
}