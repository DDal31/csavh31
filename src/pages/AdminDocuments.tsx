import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import type { UserWithDocuments } from "@/types/documents";

const AdminDocuments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithDocuments[]>([]);
  const { documentTypes, uploadDocument, deleteDocument } = useDocuments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.site_role !== "admin") {
          navigate("/dashboard");
          return;
        }

        fetchUsers();
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("*");

      if (usersError) throw usersError;

      const { data: documents, error: documentsError } = await supabase
        .from("user_documents")
        .select("*, document_types(name)")
        .eq("status", "active");

      if (documentsError) throw documentsError;

      const usersWithDocuments = users.map(user => ({
        ...user,
        documents: documents.filter(doc => doc.user_id === user.id)
      }));

      setUsers(usersWithDocuments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users and documents:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les utilisateurs et leurs documents",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentTypeId: string, userId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadDocument(file, documentTypeId, userId);
    fetchUsers();
  };

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    await deleteDocument(documentId, filePath);
    fetchUsers();
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              className="text-white hover:text-gray-300"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
            <h1 className="text-2xl font-bold text-white">Gestion des Documents</h1>
          </div>

          <div className="space-y-8">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-gray-800 rounded-lg p-6"
                role="region"
                aria-label={`Documents de ${user.first_name} ${user.last_name}`}
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  {user.first_name} {user.last_name}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documentTypes?.map((type) => {
                    const userDoc = user.documents?.find(
                      (doc) => doc.document_type_id === type.id
                    );

                    return (
                      <div
                        key={type.id}
                        className="bg-gray-700 rounded-lg p-4 flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2">
                            {type.name}
                          </h3>
                          {userDoc && (
                            <p className="text-sm text-gray-300 mb-4">
                              Fichier actuel : {userDoc.file_name}
                            </p>
                          )}
                        </div>

                        {!userDoc ? (
                          <div className="relative">
                            <input
                              type="file"
                              id={`file-${type.id}-${user.id}`}
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, type.id, user.id)}
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <label
                              htmlFor={`file-${type.id}-${user.id}`}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer w-full justify-center"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Importer
                            </label>
                          </div>
                        ) : (
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleDeleteDocument(userDoc.id, userDoc.file_path)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDocuments;