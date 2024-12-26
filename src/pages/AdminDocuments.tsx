import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Upload, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserDocument, DocumentType, UserWithDocuments } from "@/types/documents";
import { DOCUMENT_LABELS } from "@/types/documents";

const AdminDocuments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithDocuments[]>([]);
  const [uploading, setUploading] = useState<{ userId: string; type: DocumentType } | null>(null);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
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

      fetchUsersAndDocuments();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/dashboard");
    }
  };

  const fetchUsersAndDocuments = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;

      const { data: documentsData, error: documentsError } = await supabase
        .from('user_documents')
        .select('*');

      if (documentsError) throw documentsError;

      const usersWithDocs: UserWithDocuments[] = usersData.map(user => ({
        id: user.id,
        email: user.email,
        profile: user,
        documents: documentsData.filter(doc => doc.user_id === user.id) || []
      }));

      setUsers(usersWithDocs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (userId: string, type: DocumentType, file: File) => {
    try {
      setUploading({ userId, type });

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${type}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const { error: dbError } = await supabase
        .from('user_documents')
        .upsert({
          user_id: userId,
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

      fetchUsersAndDocuments();
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
      a.click();
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

  const getUserDocumentByType = (user: UserWithDocuments, type: DocumentType) => {
    return user.documents.find(doc => doc.document_type === type);
  };

  const needsOnlyLicense = (user: UserWithDocuments) => {
    const role = user.profile.club_role;
    return ['arbitre', 'entraineur', 'joueur-arbitre', 'entraineur-arbitre'].includes(role);
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
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            className="text-white w-fit flex items-center gap-2 hover:text-gray-300 mb-8"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord admin
          </Button>

          <h1 className="text-4xl font-bold text-white mb-8">
            Gestion des Documents
          </h1>

          <div className="space-y-8">
            {users.map(user => (
              <div 
                key={user.id}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {user.profile.first_name} {user.profile.last_name}
                  </h2>
                  <p className="text-gray-400">
                    {user.profile.club_role} - {user.profile.sport}
                  </p>
                </div>

                <div className="grid gap-4">
                  {Object.entries(DOCUMENT_LABELS).map(([type, label]) => {
                    if (needsOnlyLicense(user) && type !== 'ffh_license') return null;
                    
                    const document = user.documents.find(doc => doc.document_type === type);
                    return (
                      <div 
                        key={type}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-700 rounded-lg"
                      >
                        <div>
                          <h3 className="text-lg font-medium text-white">{label}</h3>
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
                                    if (file) handleFileUpload(user.id, type as DocumentType, file);
                                  }}
                                  disabled={!!uploading}
                                />
                                <Button
                                  variant="outline"
                                  className="bg-green-600 hover:bg-green-700 text-white border-none"
                                  disabled={!!uploading}
                                >
                                  {uploading?.userId === user.id && uploading?.type === type ? (
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
                                  if (file) handleFileUpload(user.id, type as DocumentType, file);
                                }}
                                disabled={!!uploading}
                              />
                              <Button
                                variant="outline"
                                className="bg-green-600 hover:bg-green-700 text-white border-none"
                                disabled={!!uploading}
                              >
                                {uploading?.userId === user.id && uploading?.type === type ? (
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
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDocuments;
