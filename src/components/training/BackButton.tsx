import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function BackButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/dashboard")}
      variant="ghost"
      className="mb-6 text-gray-300 hover:text-white hover:bg-gray-800"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Retour au dashboard
    </Button>
  );
}