import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Download, Trash2, TrendingUp, TrendingDown, Calendar, User } from 'lucide-react';
import { useFinances } from '@/hooks/useFinances';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const TransactionsList = () => {
  const { transactions, loading, deleteTransaction, downloadDocument } = useFinances();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

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
          <span>Liste des Transactions</span>
          <Badge variant="secondary">{filteredTransactions.length} transaction(s)</Badge>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              Tous
            </Button>
            <Button
              variant={typeFilter === 'income' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('income')}
              className="text-green-600"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Recettes
            </Button>
            <Button
              variant={typeFilter === 'expense' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('expense')}
              className="text-red-600"
            >
              <TrendingDown className="h-4 w-4 mr-1" />
              Dépenses
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || typeFilter !== 'all' 
              ? 'Aucune transaction ne correspond aux filtres' 
              : 'Aucune transaction enregistrée'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Badge 
                        variant={transaction.type === 'income' ? 'default' : 'destructive'}
                        className="gap-1"
                      >
                        {transaction.type === 'income' ? (
                          <>
                            <TrendingUp className="h-3 w-3" />
                            Recette
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3" />
                            Dépense
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.title}</div>
                        {transaction.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} €
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(transaction.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {transaction.document_path && transaction.document_name ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(transaction.document_path!, transaction.document_name!)}
                          className="gap-1"
                        >
                          <Download className="h-4 w-4" />
                          {transaction.document_name.length > 20 
                            ? `${transaction.document_name.substring(0, 17)}...`
                            : transaction.document_name
                          }
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">Aucun</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la transaction</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer la transaction "{transaction.title}" ?
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(transaction.id, transaction.document_path || undefined)}
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