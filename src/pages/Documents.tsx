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
import { DocumentDownloader } from "@/components/documents/DocumentDownloader";

const Documents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<UserDocument[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;
      setDocuments(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos documents",
        variant: "destructive"
      });
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
                    {document ? (
                      <>
                        <Button
                          variant="outline"
                          className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                          onClick={() => {
                            const downloader = DocumentDownloader({ document });
                            downloader.handleDownload();
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                        <DocumentUploader
                          type={type as DocumentType}
                          existingDocument={true}
                          onUploadSuccess={fetchDocuments}
                        />
                      </>
                    ) : (
                      <DocumentUploader
                        type={type as DocumentType}
                        existingDocument={false}
                        onUploadSuccess={fetchDocuments}
                      />
                    )}
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
