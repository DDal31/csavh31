import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface MonthlyTrainingChartProps {
  currentMonthStats: {
    present: number;
    total: number;
  };
  sport: string;
}

export function MonthlyTrainingChart({ currentMonthStats, sport }: MonthlyTrainingChartProps) {
  const chartTheme = {
    fill: "#4169E1",
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[{ 
            name: 'Entraînements', 
            present: currentMonthStats.present,
            total: currentMonthStats.total 
          }]}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar 
            dataKey="total" 
            fill={chartTheme.fill} 
            name="Total programmé"
            role="graphics-symbol"
            aria-label="Nombre total d'entraînements programmés"
          />
          <Bar 
            dataKey="present" 
            fill="#82ca9d" 
            name="Présences"
            role="graphics-symbol"
            aria-label="Nombre d'entraînements avec présences"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}