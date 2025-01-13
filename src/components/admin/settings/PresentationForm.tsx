import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const PresentationForm = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto">
      <Button
        onClick={() => navigate("/admin/settings")}
        variant="ghost"
        className="mb-6 text-white hover:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux paramètres
      </Button>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          Modifier la présentation
        </h1>
        {/* Form content will be implemented later */}
        <p className="text-gray-400">Contenu à venir...</p>
      </div>
    </div>
  );
};