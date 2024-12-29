import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UserDocument } from "@/types/documents";
import { useQuery } from "@tanstack/react-query";

export const useUserDocuments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [userProfile, setUserProfile] = useState<{ 
    first_name: string; 
    last_name: string; 
    id: string; 
    club_role: string; 
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Query active document types
  const { data: activeDocumentTypes } = useQuery({
    queryKey: ['activeDocumentTypes'],
    queryFn: async () => {
      console.log("Documents: Fetching active document types");
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .eq('status', 'active');
      
      if (error) {
        console.error("Documents: Error fetching active document types:", error);
        throw error;
      }
      console.log("Documents: Active document types fetched:", data);
      return data;
    }
  });

  const fetchDocuments = async () => {
    try {
      console.log("Documents: Fetching user documents");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("Documents: No session found, redirecting to login");
        navigate("/login");
        return;
      }

      // Fetch user profile first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, id, club_role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error("Documents: Error fetching profile:", profileError);
        throw profileError;
      }
      setUserProfile(profileData);

      // Fetch documents with their types
      const { data: documentsData, error: documentsError } = await supabase
        .from('user_documents')
        .select(`
          *,
          document_types (
            *
          )
        `)
        .eq('user_id', session.user.id);

      if (documentsError) {
        console.error("Documents: Error fetching documents:", documentsError);
        throw documentsError;
      }

      // Filter out documents with inactive types
      const activeDocuments = documentsData?.filter(doc => 
        doc.document_types?.status === 'active' && 
        activeDocumentTypes?.some(type => type.id === doc.document_type_id)
      ) || [];
      
      console.log("Documents: Documents fetched successfully:", activeDocuments.length, "documents found");
      setDocuments(activeDocuments);
      setLoading(false);
    } catch (error) {
      console.error("Documents: Error in fetchDocuments:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos documents",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Documents: Component mounted");
    fetchDocuments();
  }, [activeDocumentTypes]);

  return {
    documents,
    userProfile,
    loading,
    activeDocumentTypes,
    fetchDocuments
  };
};