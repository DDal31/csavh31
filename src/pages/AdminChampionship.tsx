
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminChampionship = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imports, setImports] = useState<any[]>([]);

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

        await loadImports();
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification des droits:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const loadImports = async () => {
    try {
      const { data, error } = await supabase
        .from("excel_imports")
        .select("*")
        .order("import_date", { ascending: false });

      if (error) throw error;
      setImports(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des importations:", error);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier Excel",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non connecté");

      // Upload du fichier vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `championship/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('club-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Enregistrer l'importation dans la base
      const { error: insertError } = await supabase
        .from("excel_imports")
        .insert({
          file_name: file.name,
          file_path: filePath,
          imported_by: session.user.id,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Fichier uploadé avec succès. Le traitement va commencer.",
      });

      setFile(null);
      await loadImports();
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'upload du fichier",
        variant: "destructive"
      });
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
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Gestion Championnat
            </h1>
            <Button
              onClick={() => navigate("/admin")}
              variant="outline"
            >
              Retour
            </Button>
          </div>

          {/* Section d'upload */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Importer fichier Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="excel-file">Fichier Excel (.xlsx, .xls)</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleFileUpload}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Importer le fichier
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Historique des importations */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des importations</CardTitle>
            </CardHeader>
            <CardContent>
              {imports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucune importation effectuée
                </p>
              ) : (
                <div className="space-y-4">
                  {imports.map((importItem) => (
                    <div key={importItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{importItem.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(importItem.import_date).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {importItem.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-green-600">
                              {importItem.records_imported} enregistrements
                            </span>
                          </>
                        ) : importItem.status === 'error' ? (
                          <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm text-red-600">Erreur</span>
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            <span className="text-sm text-blue-600">En cours...</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminChampionship;
