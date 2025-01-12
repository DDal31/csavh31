import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/animations/PageTransition";
import { BallAnimation } from "@/components/animations/BallAnimation";
import { motion } from "framer-motion";

const Documents = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const {
    documentTypes,
    userDocuments,
    uploading,
    loadingTypes,
    loadingDocuments,
    uploadDocument,
    deleteDocument,
  } = useDocuments(userId);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }
        setUserId(session.user.id);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentTypeId: string) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    await uploadDocument(file, documentTypeId, userId);
  };

  if (loadingTypes || loadingDocuments) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <PageTransition>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au tableau de bord
              </Button>
              <h1 className="text-2xl font-bold text-white">Mes Documents</h1>
            </div>

            <div className="space-y-6">
              {documentTypes?.map((type) => {
                const userDoc = userDocuments?.find(
                  (doc) => doc.document_type_id === type.id
                );

                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        {type.name}
                      </h3>
                      {userDoc && (
                        <p className="text-sm text-gray-400">
                          Fichier actuel : {userDoc.file_name}
                        </p>
                      )}
                    </div>

                    {!userDoc ? (
                      <div className="relative">
                        <input
                          type="file"
                          id={`file-${type.id}`}
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, type.id)}
                          disabled={uploading}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor={`file-${type.id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Importer
                        </label>
                        {uploading && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                            <BallAnimation type="goalball" animation="bounce" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => deleteDocument(userDoc.id, userDoc.file_path)}
                        disabled={uploading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default Documents;