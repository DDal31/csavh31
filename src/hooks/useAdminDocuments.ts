import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UserWithDocuments } from "@/types/documents";

export const useAdminDocuments = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithDocuments[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

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
        .select(`
          *,
          document_types!user_documents_document_type_id_fkey (
            id,
            name,
            status,
            created_at,
            updated_at
          )
        `)
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

  return {
    users,
    teams,
    loading,
    downloading,
    fetchUsers,
    fetchTeams,
    handleDownloadTeamDocuments
  };
};