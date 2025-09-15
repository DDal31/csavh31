import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FinancialTransaction, TransactionFormData, FinancialSummary } from '@/types/finances';
import { useToast } from '@/hooks/use-toast';

export const useFinances = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  });
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTransactions(data || []);
      calculateSummary(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: FinancialTransaction[]) => {
    const totalIncome = data
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = data
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setSummary({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: data.length
    });
  };

  const addTransaction = async (formData: TransactionFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let documentPath = null;
      let documentName = null;

      // Upload document if provided
      if (formData.document) {
        const fileExt = formData.document.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('financial-documents')
          .upload(fileName, formData.document);

        if (uploadError) throw uploadError;
        
        documentPath = fileName;
        documentName = formData.document.name;
      }

      const insertData: any = {
        title: formData.title,
        amount: formData.amount,
        type: formData.type,
        description: formData.description,
        document_path: documentPath,
        document_name: documentName,
        created_by: user.id
      };

      // Add category based on transaction type
      if (formData.type === 'expense' && formData.expense_category) {
        insertData.expense_category = formData.expense_category;
      }
      if (formData.type === 'income' && formData.income_category) {
        insertData.income_category = formData.income_category;
      }

      const { error } = await supabase
        .from('financial_transactions')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Transaction ajoutée avec succès"
      });

      fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la transaction",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteTransaction = async (id: string, documentPath?: string) => {
    try {
      // Delete document if exists
      if (documentPath) {
        await supabase.storage
          .from('financial-documents')
          .remove([documentPath]);
      }

      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Transaction supprimée avec succès"
      });

      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la transaction",
        variant: "destructive"
      });
    }
  };

  const downloadDocument = async (documentPath: string, documentName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('financial-documents')
        .download(documentPath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    summary,
    addTransaction,
    deleteTransaction,
    downloadDocument,
    refetch: fetchTransactions
  };
};