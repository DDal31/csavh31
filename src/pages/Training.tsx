import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrainingList } from "@/components/training/TrainingList";
import { TrainingHeader } from "@/components/training/TrainingHeader";
import { useTrainings } from "@/components/training/useTrainings";
import { useTrainingRegistration } from "@/components/training/useTrainingRegistration";
import PageTransition from "@/components/animations/PageTransition";

const TrainingRegistration = () => {
  const { 
    trainings, 
    selectedTrainings, 
    setSelectedTrainings, 
    loading 
  } = useTrainings();
  
  const { handleSaveRegistrations } = useTrainingRegistration();

  const toggleTrainingSelection = (trainingId: string) => {
    setSelectedTrainings(prev => 
      prev.includes(trainingId) 
        ? prev.filter(id => id !== trainingId)
        : [...prev, trainingId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <PageTransition>
          <div className="max-w-2xl mx-auto">
            <TrainingHeader />
            
            <TrainingList 
              trainings={trainings}
              selectedTrainings={selectedTrainings}
              onTrainingToggle={toggleTrainingSelection}
            />
            
            <Button 
              onClick={() => handleSaveRegistrations(selectedTrainings)} 
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
            >
              Valider mes inscriptions
            </Button>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default TrainingRegistration;