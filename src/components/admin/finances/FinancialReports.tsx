import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, TrendingUp, Euro, Calendar } from 'lucide-react';
import { FinancialCharts } from './FinancialCharts';
import { useFinances } from '@/hooks/useFinances';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const FinancialReports = () => {
  const { summary, transactions, loading } = useFinances();
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    setExporting(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Add title page
      pdf.setFontSize(20);
      pdf.text('Rapport Financier', 20, 30);
      pdf.setFontSize(12);
      pdf.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 20, 40);
      pdf.text(`Période: Toutes les transactions`, 20, 50);
      
      // Add summary
      pdf.setFontSize(16);
      pdf.text('Résumé Financier', 20, 70);
      pdf.setFontSize(12);
      pdf.text(`Recettes totales: ${summary.totalIncome.toFixed(2)} €`, 20, 85);
      pdf.text(`Dépenses totales: ${summary.totalExpenses.toFixed(2)} €`, 20, 95);
      pdf.text(`Balance: ${summary.balance.toFixed(2)} €`, 20, 105);
      pdf.text(`Nombre de transactions: ${summary.transactionCount}`, 20, 115);
      
      // Add charts on new page
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`rapport-financier-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Génération du rapport...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Rapport Financier</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Analyse complète des finances du club
              </p>
            </div>
            <Button onClick={exportToPDF} disabled={exporting} className="gap-2">
              <FileDown className="h-4 w-4" />
              {exporting ? 'Génération...' : 'Exporter en PDF'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      <div ref={reportRef} className="space-y-6">
        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Résumé Financier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-card/50 rounded-lg border border-border backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {summary.totalIncome.toFixed(2)} €
                </div>
                <div className="text-sm text-muted-foreground">Recettes Totales</div>
              </div>
              
              <div className="text-center p-4 bg-card/50 rounded-lg border border-border backdrop-blur-sm">
                <div className="text-2xl font-bold text-red-500 mb-1">
                  {summary.totalExpenses.toFixed(2)} €
                </div>
                <div className="text-sm text-muted-foreground">Dépenses Totales</div>
              </div>
              
              <div className="text-center p-4 bg-card/50 rounded-lg border border-border backdrop-blur-sm">
                <div className={`text-2xl font-bold mb-1 ${
                  summary.balance >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {summary.balance.toFixed(2)} €
                </div>
                <div className="text-sm text-muted-foreground">Balance</div>
              </div>
              
              <div className="text-center p-4 bg-card/50 rounded-lg border border-border backdrop-blur-sm">
                <div className="text-2xl font-bold text-primary mb-1">
                  {summary.transactionCount}
                </div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <FinancialCharts />

        {/* Recent Transactions Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Transactions Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune transaction enregistrée
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={transaction.type === 'income' ? 'default' : 'destructive'}
                        className="gap-1"
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingUp className="h-3 w-3 rotate-180" />
                        )}
                        {transaction.type === 'income' ? 'Recette' : 'Dépense'}
                      </Badge>
                      <div>
                        <div className="font-medium">{transaction.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'dd/MM/yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} €
                    </div>
                  </div>
                ))}
                {transactions.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground">
                    Et {transactions.length - 5} autres transactions...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};