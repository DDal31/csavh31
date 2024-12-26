import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProfileHeader() {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-4 mb-8">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/profile")}
        className="text-white hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <h1 className="text-3xl font-bold text-white">Modifier mon profil</h1>
    </div>
  );
}