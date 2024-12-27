import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <p className="text-xl text-gray-400 mb-8">Page non trouvée</p>
      <Button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        Retour à l'accueil
      </Button>
    </div>
  );
}