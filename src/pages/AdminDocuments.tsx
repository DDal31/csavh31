import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Upload, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import type { UserWithDocuments } from "@/types/documents";

const AdminDocuments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithDocuments[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
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
        fetchTeams();
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('name')
        .order('name');

      if (error) throw error;

      setTeams(data.map(team => team.name));
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des équipes",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("Fetching users data...");
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*");

      if (usersError) throw usersError;

      const { data: documents, error: documentsError } = await supabase
        .from("user_documents")
        .select("*, document_types(id, name, status, created_at, updated_at)")
        .eq("status", "active");

      if (documentsError) throw documentsError;

      console.log("Fetched documents:", documents);

      const usersWithDocuments: UserWithDocuments[] = usersData.map(user => ({
        ...user,
        documents: documents.filter(doc => doc.user_id === user.id),
        profile: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          club_role: user.club_role,
          sport: user.sport,
          team: user.team,
          site_role: user.site_role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
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

  const handleDownloadTeamDocuments = async (teamName: string) => {
    try {
      setDownloading(teamName);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-team-documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors du téléchargement');
      }

      const contentType = response.headers.get('content-type');
      if (contentType === 'application/json') {
        const error = await response.json();
        throw new Error(error.error || 'Aucun document disponible');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${teamName}_documents.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Succès",
        description: "Les documents ont été téléchargés avec succès",
      });
    } catch (error) {
      console.error('Error downloading documents:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de télécharger les documents",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, typeId: string, userId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadDocument(file, typeId, userId);
      fetchUsers(); // Refresh the users list to show the new document
    }
  };

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    await deleteDocument(documentId, filePath);
    fetchUsers(); // Refresh the users list to remove the deleted document
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

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Télécharger les documents par équipe
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {teams.map((team) => (
                <Button
                  key={team}
                  onClick={() => handleDownloadTeamDocuments(team)}
                  disabled={downloading === team}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
                  aria-label={`Télécharger les documents de l'équipe ${team}`}
                >
                  {downloading === team ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {team}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-gray-800 rounded-lg p-6"
                role="region"
                aria-label={`Documents de ${user.profile.first_name} ${user.profile.last_name}`}
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  {user.profile.first_name} {user.profile.last_name}
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
