import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useFinances } from '@/hooks/useFinances';
import { FinancialTransaction, MonthlyData } from '@/types/finances';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = {
  income: '#10b981',  // green-500
  expense: '#ef4444', // red-500
  balance: '#3b82f6'  // blue-500
};

export const FinancialCharts = () => {
  const { transactions, summary } = useFinances();

  // Prepare data for pie chart
  const pieData = useMemo(() => [
    { name: 'Recettes', value: summary.totalIncome, color: COLORS.income },
    { name: 'Dépenses', value: summary.totalExpenses, color: COLORS.expense }
  ], [summary]);

  // Prepare monthly data for line and bar charts
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, MonthlyData>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.created_at);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy', { locale: fr });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthLabel,
          income: 0,
          expenses: 0,
          balance: 0
        });
      }

      const monthData = monthlyMap.get(monthKey)!;
      if (transaction.type === 'income') {
        monthData.income += transaction.amount;
      } else {
        monthData.expenses += transaction.amount;
      }
      monthData.balance = monthData.income - monthData.expenses;
    });

    return Array.from(monthlyMap.values()).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  }, [transactions]);

  // Prepare transaction type distribution by month
  const transactionCounts = useMemo(() => {
    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;
    
    return [
      { name: 'Recettes', count: incomeCount, color: COLORS.income },
      { name: 'Dépenses', count: expenseCount, color: COLORS.expense }
    ];
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)} €
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Aucune donnée pour générer les graphiques
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart - Income vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition Recettes/Dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} €`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Transaction Count */}
      <Card>
        <CardHeader>
          <CardTitle>Nombre de Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactionCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Transactions']} />
                <Bar dataKey="count" fill={COLORS.income}>
                  {transactionCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {monthlyData.length > 1 && (
        <>
          {/* Line Chart - Monthly Balance Evolution */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution de la Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke={COLORS.balance}
                      strokeWidth={2}
                      name="Balance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart - Monthly Income vs Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Recettes vs Dépenses Mensuelles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="income" fill={COLORS.income} name="Recettes" />
                    <Bar dataKey="expenses" fill={COLORS.expense} name="Dépenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};