import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { DocumentType } from "@/types/documents";

export const DocumentTypesManager = () => {
  const { data: documentTypes, isLoading } = useQuery({
    queryKey: ['documentTypes'],
    queryFn: async () => {
      console.log('Fetching document types...');
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching document types:', error);
        throw error;
      }

      console.log('Document types fetched:', data);
      return data as DocumentType[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Types de Documents
      </h1>
      
      <div className="space-y-4">
        {documentTypes?.map((type) => (
          <div 
            key={type.id} 
            className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-medium text-white">
                {type.name}
              </h3>
              <p className="text-sm text-gray-400">
                Status: {type.status}
              </p>
            </div>
          </div>
        ))}

        {documentTypes?.length === 0 && (
          <p className="text-gray-400 text-center">
            Aucun type de document trouvé
          </p>
        )}
      </div>
    </div>
  );
};