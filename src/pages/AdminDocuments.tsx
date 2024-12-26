import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserWithDocuments } from "@/types/documents";
import { UserDocumentCard } from "@/components/admin/documents/UserDocumentCard";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";

const AdminDocuments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithDocuments[]>([]);
  const { uploading, handleFileUpload, handleDownload } = useDocumentManagement();

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    try {
      console.log("Checking admin status and fetching data");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found, redirecting to login");
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("site_role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.site_role !== "admin") {
        console.log("User is not admin, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }

      await fetchUsersAndDocuments();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/dashboard");
    }
  };

  const fetchUsersAndDocuments = async () => {
    try {
      console.log("Fetching users and documents data");
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
      console.log("Data fetched successfully");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données",
        variant: "destructive"
      });
    }
  };

  const handleUploadSuccess = async (userId: string, type: string, file: File) => {
    const success = await handleFileUpload(userId, type, file);
    if (success) {
      await fetchUsersAndDocuments();
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
              <UserDocumentCard
                key={user.id}
                user={user}
                uploading={uploading}
                onDownload={handleDownload}
                onUpload={handleUploadSuccess}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDocuments;