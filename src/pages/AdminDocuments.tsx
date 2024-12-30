import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import { useAdminDocuments } from "@/hooks/useAdminDocuments";
import { TeamDownloads } from "@/components/admin/documents/TeamDownloads";
import { UserDocumentsList } from "@/components/admin/documents/UserDocumentsList";

const AdminDocuments = () => {
  const navigate = useNavigate();
  const { documentTypes, uploadDocument, deleteDocument } = useDocuments();
  const { 
    users, 
    teams, 
    loading, 
    downloading,
    fetchUsers,
    fetchTeams,
    handleDownloadTeamDocuments 
  } = useAdminDocuments();
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, typeId: string, userId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        await uploadDocument(file, typeId, userId);
        fetchUsers(); // Refresh the users list to show the new document
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    setUploading(true);
    try {
      await deleteDocument(documentId, filePath);
      fetchUsers(); // Refresh the users list to remove the deleted document
    } finally {
      setUploading(false);
    }
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

          <TeamDownloads
            teams={teams}
            downloading={downloading}
            onDownload={handleDownloadTeamDocuments}
          />

          <UserDocumentsList
            users={users}
            documentTypes={documentTypes}
            onUpload={handleFileUpload}
            onDelete={handleDeleteDocument}
            uploading={uploading}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDocuments;