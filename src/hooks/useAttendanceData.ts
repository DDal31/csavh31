import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MonthlyTraining {
  month: string;
  count: number;
}

export const useAttendanceData = () => {
  const [months, setMonths] = useState<MonthlyTraining[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 10;

  const fetchTrainingMonths = async () => {
    try {
      const { data, error } = await supabase
        .from('trainings')
        .select('date')
        .order('date', { ascending: false });

      if (error) throw error;

      const monthsMap = new Map<string, number>();
      
      data.forEach(training => {
        const monthKey = format(parseISO(training.date), 'yyyy-MM');
        monthsMap.set(monthKey, (monthsMap.get(monthKey) || 0) + 1);
      });

      const monthsList = Array.from(monthsMap.entries()).map(([month, count]) => ({
        month,
        count
      }));

      setMonths(monthsList);
    } catch (error) {
      console.error('Error fetching training months:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les mois d'entraînement",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTrainingMonths();
  }, []);

  return {
    months,
    currentPage,
    setCurrentPage,
    loading,
    setLoading,
    itemsPerPage,
    fetchTrainingMonths
  };
};