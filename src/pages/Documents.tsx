import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Upload, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserDocument, DocumentType } from "@/types/documents";
import { DOCUMENT_LABELS } from "@/types/documents";

const Documents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [uploading, setUploading] = useState<DocumentType | null>(null);

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

  const handleFileUpload = async (type: DocumentType, file: File) => {
    try {
      setUploading(type);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${type}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('user_documents')
        .upsert({
          user_id: session.user.id,
          document_type: type,
          file_path: filePath,
          file_name: file.name,
          uploaded_by: session.user.id
        }, {
          onConflict: 'user_id,document_type'
        });

      if (dbError) throw dbError;

      toast({
        title: "Succès",
        description: "Document importé avec succès"
      });

      fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer le document",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const handleDownload = async (document: UserDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
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
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(type as DocumentType, file);
                            }}
                            disabled={!!uploading}
                          />
                          <Button
                            variant="outline"
                            className="bg-green-600 hover:bg-green-700 text-white border-none"
                            disabled={!!uploading}
                          >
                            {uploading === type ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Changer
                          </Button>
                        </label>
                      </>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(type as DocumentType, file);
                          }}
                          disabled={!!uploading}
                        />
                        <Button
                          variant="outline"
                          className="bg-green-600 hover:bg-green-700 text-white border-none"
                          disabled={!!uploading}
                        >
                          {uploading === type ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Importer
                        </Button>
                      </label>
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