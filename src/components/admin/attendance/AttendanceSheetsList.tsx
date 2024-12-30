import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { generateWorksheet, createExcelFile } from "@/utils/excel";

export function AttendanceSheetsList() {
  const {
    months,
    currentPage,
    setCurrentPage,
    loading,
    setLoading,
    itemsPerPage,
  } = useAttendanceData();
  const { toast } = useToast();

  const generateAttendanceSheet = async (monthStr: string) => {
    try {
      setLoading(true);
      const startDate = startOfMonth(parseISO(monthStr));
      const endDate = endOfMonth(parseISO(monthStr));
      const monthDisplay = format(parseISO(monthStr), 'MMMM yyyy', { locale: fr });

      // Récupérer les sports
      const { data: sports, error: sportsError } = await supabase
        .from('sports')
        .select('*');

      if (sportsError) throw sportsError;

      // Créer un nouveau workbook
      const wb = XLSX.utils.book_new();

      for (const sport of sports) {
        // Récupérer les entraînements pour ce sport et ce mois
        const { data: trainings, error: trainingsError } = await supabase
          .from('trainings')
          .select(`
            id,
            date,
            registrations (
              user_id,
              profiles (
                first_name,
                last_name
              )
            )
          `)
          .eq('type', sport.name.toLowerCase())
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString())
          .order('date');

        if (trainingsError) throw trainingsError;

        if (trainings.length > 0) {
          // Créer la carte de présence
          const attendanceMap = new Map();
          const dates = trainings.map(t => t.date);

          trainings.forEach(training => {
            training.registrations.forEach(reg => {
              const userId = reg.user_id;
              const userName = `${reg.profiles.last_name} ${reg.profiles.first_name}`;
              
              if (!attendanceMap.has(userId)) {
                attendanceMap.set(userId, {
                  name: userName,
                  attendance: new Array(dates.length).fill(0),
                  total: 0
                });
              }

              const userIndex = Array.from(attendanceMap.keys()).indexOf(userId);
              const dateIndex = trainings.findIndex(t => t.id === training.id);
              
              attendanceMap.get(userId).attendance[dateIndex] = 1;
              attendanceMap.get(userId).total += 1;
            });
          });

          // Générer le worksheet pour ce sport
          const ws = generateWorksheet(sport.name, dates, attendanceMap, monthDisplay);
          XLSX.utils.book_append_sheet(wb, ws, sport.name);
        }
      }

      // Générer et télécharger le fichier
      createExcelFile(wb, monthDisplay);

      toast({
        title: "Succès",
        description: "La feuille de présence a été générée",
      });
    } catch (error) {
      console.error('Error generating attendance sheet:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la feuille de présence",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(months.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMonths = months.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {currentMonths.map((item) => (
        <Card key={item.month} className="p-4 bg-gray-800 border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h3 className="text-lg font-semibold">
                Présence du mois de {format(parseISO(item.month), 'MMMM yyyy', { locale: fr })}
              </h3>
              <p className="text-gray-400">
                {item.count} entraînement{item.count > 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={() => generateAttendanceSheet(item.month)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
              aria-label={`Télécharger la feuille de présence de ${format(parseISO(item.month), 'MMMM yyyy', { locale: fr })}`}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="outline"
            className="bg-gray-700 text-white hover:bg-gray-600"
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="flex items-center px-4 text-white">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            className="bg-gray-700 text-white hover:bg-gray-600"
            aria-label="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}