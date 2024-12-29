import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DocumentsHeader = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button 
        variant="ghost" 
        className="text-white w-fit flex items-center gap-2 hover:text-gray-300 mb-8"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Button>

      <h1 className="text-4xl font-bold text-white mb-8">
        Mes Documents
      </h1>
    </>
  );
};