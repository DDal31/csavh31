import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useFinances } from '@/hooks/useFinances';
import { format, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, ExpenseCategory, IncomeCategory } from '@/types/finances';

const COLORS = {
  income: 'hsl(var(--primary))',
  expense: 'hsl(var(--destructive))',
  balance: 'hsl(var(--accent))'
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
    const monthlyMap = new Map();
    
    transactions.forEach(transaction => {
      const monthKey = format(startOfMonth(new Date(transaction.created_at)), 'yyyy-MM');
      const monthLabel = format(startOfMonth(new Date(transaction.created_at)), 'MMM yyyy', { locale: fr });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthLabel,
          income: 0,
          expenses: 0,
          balance: 0
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
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

  // Expense categories data
  const expenseCategoriesData = useMemo(() => {
    const categoryMap = new Map();
    const expenseColors = [
      'hsl(var(--destructive))', // rouge pour compétition
      'hsl(var(--warning))', // jaune pour minibus
      'hsl(var(--secondary))', // gris pour matériel
      'hsl(var(--accent))', // bleu pour organisation
      'hsl(var(--muted))', // violet pour licence
    ];
    
    transactions
      .filter(t => t.type === 'expense' && t.expense_category)
      .forEach(transaction => {
        const category = transaction.expense_category as ExpenseCategory;
        const categoryInfo = EXPENSE_CATEGORIES[category];
        
        if (!categoryMap.has(category)) {
          const colorIndex = Array.from(categoryMap.keys()).length % expenseColors.length;
          categoryMap.set(category, {
            name: categoryInfo.label,
            value: 0,
            color: expenseColors[colorIndex],
            count: 0
          });
        }
        
        const data = categoryMap.get(category);
        data.value += transaction.amount;
        data.count += 1;
      });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Income categories data
  const incomeCategoriesData = useMemo(() => {
    const categoryMap = new Map();
    const incomeColors = [
      'hsl(var(--primary))', // bleu pour dons
      'hsl(var(--secondary))', // vert pour location minibus
      'hsl(var(--accent))', // cyan pour remboursement
      'hsl(var(--warning))', // orange pour buvette
      'hsl(var(--destructive))', // violet pour UNADEV
      'hsl(var(--muted))', // indigo pour inscription
      'hsl(var(--success))', // vert foncé pour subvention
    ];
    
    transactions
      .filter(t => t.type === 'income' && t.income_category)
      .forEach(transaction => {
        const category = transaction.income_category as IncomeCategory;
        const categoryInfo = INCOME_CATEGORIES[category];
        
        if (!categoryMap.has(category)) {
          const colorIndex = Array.from(categoryMap.keys()).length % incomeColors.length;
          categoryMap.set(category, {
            name: categoryInfo.label,
            value: 0,
            color: incomeColors[colorIndex],
            count: 0
          });
        }
        
        const data = categoryMap.get(category);
        data.value += transaction.amount;
        data.count += 1;
      });
    
    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
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
              {entry.name}: {typeof entry.value === 'number' ? `${entry.value.toFixed(2)} €` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            Montant: {data.value.toFixed(2)} €
          </p>
          <p className="text-sm">
            Transactions: {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Aucune donnée disponible pour les graphiques</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income vs Expenses Pie Chart */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Répartition Recettes/Dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(2)}€`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transaction Count Bar Chart */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Nombre de Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionCounts}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Categories Pie Chart */}
      {expenseCategoriesData.length > 0 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Dépenses par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseCategoriesData.map((entry, index) => (
                    <Cell key={`expense-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Income Categories Pie Chart */}
      {incomeCategoriesData.length > 0 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Recettes par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeCategoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeCategoriesData.map((entry, index) => (
                    <Cell key={`income-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Monthly Balance Evolution */}
      {monthlyData.length > 1 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Évolution de la Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke={COLORS.balance} 
                  strokeWidth={2}
                  dot={{ fill: COLORS.balance, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Monthly Income vs Expenses */}
      {monthlyData.length > 1 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Recettes vs Dépenses Mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill={COLORS.income} name="Recettes" />
                <Bar dataKey="expenses" fill={COLORS.expense} name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};