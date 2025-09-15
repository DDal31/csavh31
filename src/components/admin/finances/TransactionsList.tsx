import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Download, Trash2, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { useFinances } from '@/hooks/useFinances';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES, ExpenseCategory, IncomeCategory } from '@/types/finances';

export const TransactionsList = () => {
  const { transactions, loading, deleteTransaction, downloadDocument } = useFinances();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || 
      (transaction.type === 'expense' && transaction.expense_category === categoryFilter) ||
      (transaction.type === 'income' && transaction.income_category === categoryFilter);
    return matchesSearch && matchesType && matchesCategory;
  });

  const getCategoryDisplay = (transaction: any) => {
    if (transaction.type === 'expense' && transaction.expense_category) {
      const category = EXPENSE_CATEGORIES[transaction.expense_category as ExpenseCategory];
      return (
        <Badge className={`${category.color} text-white text-xs`}>
          {category.label}
        </Badge>
      );
    }
    if (transaction.type === 'income' && transaction.income_category) {
      const category = INCOME_CATEGORIES[transaction.income_category as IncomeCategory];
      return (
        <Badge className={`${category.color} text-white text-xs`}>
          {category.label}
        </Badge>
      );
    }
    return <span className="text-muted-foreground text-xs">Aucune</span>;
  };

  const handleDelete = (id: string, documentPath?: string) => {
    deleteTransaction(id, documentPath);
  };

  const handleDownload = (documentPath: string, documentName: string) => {
    downloadDocument(documentPath, documentName);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Chargement des transactions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Liste des Transactions
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Rechercher des transactions"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="income">Recettes</SelectItem>
                <SelectItem value="expense">Dépenses</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg max-h-60">
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="income-header" disabled>--- Recettes ---</SelectItem>
                {Object.entries(INCOME_CATEGORIES).map(([key, { label }]) => (
                  <SelectItem key={`income-${key}`} value={key}>
                    {label}
                  </SelectItem>
                ))}
                <SelectItem value="expense-header" disabled>--- Dépenses ---</SelectItem>
                {Object.entries(EXPENSE_CATEGORIES).map(([key, { label }]) => (
                  <SelectItem key={`expense-${key}`} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {transactions.length === 0 
                ? "Aucune transaction enregistrée"
                : "Aucune transaction ne correspond aux filtres sélectionnés"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead className="w-[140px]">Catégorie</TableHead>
                  <TableHead className="text-right w-[120px]">Montant</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[100px]">Document</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Badge 
                        variant={transaction.type === 'income' ? 'default' : 'destructive'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {transaction.type === 'income' ? 'Recette' : 'Dépense'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.title}</p>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getCategoryDisplay(transaction)}
                    </TableCell>
                    
                    <TableCell className="text-right font-medium">
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} €
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(transaction.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      {transaction.document_path && transaction.document_name ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadDocument(transaction.document_path!, transaction.document_name!)}
                          className="hover-scale"
                          aria-label={`Télécharger le document ${transaction.document_name}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label={`Supprimer la transaction ${transaction.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer la transaction "{transaction.title}" ? 
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTransaction(transaction.id, transaction.document_path)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};