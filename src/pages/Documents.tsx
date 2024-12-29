import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserDocument, RequiredDocumentType } from "@/types/documents";
import { REQUIRED_DOCUMENT_LABELS } from "@/types/documents";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import { DocumentDownloader } from "@/components/documents/DocumentDownloader";
import { useQuery } from "@tanstack/react-query";

const Documents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [userProfile, setUserProfile] = useState<{ first_name: string; last_name: string; id: string; club_role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleFileUpload, handleDownload, handleDelete } = useDocumentManagement();

  // Query active document types
  const { data: activeDocumentTypes } = useQuery({
    queryKey: ['activeDocumentTypes'],
    queryFn: async () => {
      console.log("Documents: Fetching active document types");
      const { data, error } = await supabase
        .from('document_types')
        .select('name')
        .eq('status', 'active');
      
      if (error) {
        console.error("Documents: Error fetching active document types:", error);
        throw error;
      }
      console.log("Documents: Active document types fetched:", data);
      return data.map(dt => dt.name);
    }
  });

  useEffect(() => {
    console.log("Documents: Component mounted");
    fetchDocuments();
  }, []);

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

      const { data: documentsData, error: documentsError } = await supabase
        .from('user_documents')
        .select(`
          *,
          document_types (
            name,
            status
          )
        `)
        .eq('user_id', session.user.id);

      if (documentsError) {
        console.error("Documents: Error fetching documents:", documentsError);
        throw documentsError;
      }
      
      // Filter out documents with inactive types
      const activeDocuments = documentsData?.filter(doc => doc.document_types?.status === 'active') || [];
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

  const handleUpload = async (type: RequiredDocumentType, file: File) => {
    if (!userProfile?.id) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer votre profil",
        variant: "destructive"
      });
      return;
    }

    try {
      await handleFileUpload(userProfile.id, type, file);
      await fetchDocuments(); // Refresh documents after upload
    } catch (error) {
      console.error("Documents: Error in handleUpload:", error);
      throw error;
    }
  };

  const handleDocumentDelete = async (document: UserDocument) => {
    try {
      await handleDelete(document);
      await fetchDocuments(); // Refresh documents after deletion
    } catch (error) {
      console.error("Documents: Error in handleDocumentDelete:", error);
    }
  };

  const getRequiredDocuments = (): RequiredDocumentType[] => {
    if (!userProfile) return [];
    if (userProfile.club_role === 'joueur' || userProfile.club_role === 'joueur-entraineur') {
      return ['ophthalmological_certificate', 'medical_certificate', 'ffh_license', 'id_card'];
    }
    return ['ffh_license', 'id_card'];
  };

  // Filter required documents based on active types
  const filteredDocumentTypes = getRequiredDocuments().filter(type => {
    const label = REQUIRED_DOCUMENT_LABELS[type];
    return activeDocumentTypes?.includes(label);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
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

          <div className="grid gap-6">
            {filteredDocumentTypes.map((type) => {
              const document = documents.find(doc => doc.document_type === type);
              const documentLabel = REQUIRED_DOCUMENT_LABELS[type];
              const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : '';
              
              return (
                <div 
                  key={type}
                  className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">{documentLabel}</h2>
                    {document && (
                      <p className="text-gray-400 text-sm">
                        Importé le {new Date(document.uploaded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {document && (
                      <DocumentDownloader
                        document={document}
                        onDownload={handleDownload}
                        onDelete={handleDocumentDelete}
                        userName={userName}
                        documentType={documentLabel}
                      />
                    )}
                    <DocumentUploader
                      type={type}
                      existingDocument={!!document}
                      onUploadSuccess={(file) => handleUpload(type, file)}
                      userName={userName}
                      documentType={documentLabel}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Documents;