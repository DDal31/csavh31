import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface DocumentType {
  id: string;
  name: string;
  status: 'active' | 'archived';
}

const AdminDocumentTypes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchDocumentTypes();
  }, []);

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
        console.log("Accès non autorisé : l'utilisateur n'est pas admin");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des droits admin:", error);
      navigate("/dashboard");
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("document_types")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setDocumentTypes(data || []);
    } catch (error) {
      console.error("Error fetching document types:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les types de documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    if (documentTypes.length >= 10) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez pas ajouter plus de 10 types de documents",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from("document_types")
        .insert([{ name: newTypeName.trim() }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Type de document ajouté avec succès"
      });

      setNewTypeName("");
      fetchDocumentTypes();
    } catch (error) {
      console.error("Error adding document type:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le type de document",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from("document_types")
        .update({ status: 'archived' })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Type de document supprimé avec succès"
      });

      fetchDocumentTypes();
    } catch (error) {
      console.error("Error deleting document type:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le type de document",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
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
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <Button
              variant="ghost"
              className="text-white hover:text-gray-300"
              onClick={() => navigate("/admin/settings")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux paramètres
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Gestion des Types de Documents
            </h1>
          </div>

          <form onSubmit={handleAddType} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Nom du type de document"
                className="flex-grow bg-gray-800 text-white border-gray-700"
                aria-label="Nom du nouveau type de document"
              />
              <Button
                type="submit"
                disabled={isAdding || !newTypeName.trim() || documentTypes.length >= 10}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Ajouter
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            {documentTypes.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
              >
                <span className="text-white">{type.name}</span>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteType(type.id)}
                  disabled={isDeleting === type.id}
                  aria-label={`Supprimer le type de document ${type.name}`}
                >
                  {isDeleting === type.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDocumentTypes;