import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserDocument, DocumentType } from "@/types/documents";
import { DOCUMENT_LABELS } from "@/types/documents";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";

const Documents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [userProfile, setUserProfile] = useState<{ first_name: string; last_name: string; id: string } | null>(null);
  const { handleFileUpload, handleDownload } = useDocumentManagement();

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
        .select('first_name, last_name, id')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error("Documents: Error fetching profile:", profileError);
        throw profileError;
      }
      setUserProfile(profileData);

      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        console.error("Documents: Error fetching documents:", error);
        throw error;
      }
      
      console.log("Documents: Documents fetched successfully:", data?.length || 0, "documents found");
      setDocuments(data || []);
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

  const handleUpload = async (type: DocumentType, file: File) => {
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

  const getDocumentByType = (type: DocumentType) => {
    return documents.find(doc => doc.document_type === type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
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
            {Object.entries(DOCUMENT_LABELS).map(([type, label]) => {
              const document = getDocumentByType(type as DocumentType);
              const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : '';
              
              return (
                <div 
                  key={type}
                  className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">{label}</h2>
                    {document && (
                      <p className="text-gray-400 text-sm">
                        Importé le {new Date(document.uploaded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {document && (
                      <Button
                        variant="outline"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    )}
                    <DocumentUploader
                      type={type as DocumentType}
                      existingDocument={!!document}
                      onUploadSuccess={(file) => handleUpload(type as DocumentType, file)}
                      userName={userName}
                      documentType={label}
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