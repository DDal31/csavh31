import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
    fill: "#4169E1",
    background: "#1f2937",
    hover: "#5A7BE1"
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {yearlyStats.map((stat) => (
        <div 
          key={stat.month} 
          className="relative h-32 bg-gray-800 rounded-lg p-4 transition-transform hover:scale-105"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "present", value: stat.percentage },
                  { name: "remaining", value: 100 - stat.percentage }
                ]}
                cx="50%"
                cy="50%"
                startAngle={0}
                endAngle={360}
                innerRadius="65%"
                outerRadius="85%"
                dataKey="value"
                role="graphics-symbol"
                aria-label={`Taux de présence pour ${stat.month}: ${stat.percentage.toFixed(1)}%`}
              >
                <Cell key="present" fill={chartTheme.fill} />
                <Cell key="remaining" fill={chartTheme.background} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {stat.percentage.toFixed(0)}%
            </span>
            <span className="text-sm font-medium text-primary mt-1">
              {stat.month}
            </span>
            <div className="text-xs mt-1 text-gray-400 font-medium">
              {stat.attendance} / {stat.total}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}