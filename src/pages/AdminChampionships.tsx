import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Upload, Trophy, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import * as XLSX from 'xlsx';

export const AdminChampionships = () => {
  const [importing, setImporting] = useState(false);
  const [championshipName, setChampionshipName] = useState('');
  const [seasonYear, setSeasonYear] = useState('2024-2025');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier Excel",
        variant: "destructive"
      });
      return;
    }

    if (!championshipName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir le nom du championnat",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);

    try {
      console.log('📁 Lecture du fichier Excel:', selectedFile.name);
      
      // Lire le fichier Excel
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Extraire toutes les feuilles
      const excelData: Record<string, any[]> = {};
      
      workbook.SheetNames.forEach(sheetName => {
        console.log(`📋 Traitement de la feuille: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: null 
        });
        excelData[sheetName] = jsonData;
      });

      console.log('📊 Données extraites:', Object.keys(excelData));

      // Envoyer à l'edge function
      const { data: result, error } = await supabase.functions.invoke('import-championship-excel', {
        body: {
          excelData,
          championshipName: championshipName.trim(),
          seasonYear: seasonYear.trim()
        }
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw error;
      }

      if (!result?.success) {
        throw new Error(result?.error || 'Erreur lors de l\'import');
      }

      toast({
        title: "Import réussi",
        description: `Le championnat "${championshipName}" a été importé avec succès`,
      });

      // Reset form
      setChampionshipName('');
      setSeasonYear('2024-2025');
      setSelectedFile(null);
      const fileInput = document.getElementById('excelFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error);
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'import",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Gestion des Championnats
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Importez les fichiers Excel des championnats de goalball pour afficher 
              les résultats, classements et statistiques.
            </p>
          </div>

          {/* Import Section */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import de Championnat
              </CardTitle>
              <CardDescription>
                Sélectionnez un fichier Excel contenant les différentes feuilles 
                (plannings, points, buteuses) du championnat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="championshipName">Nom du Championnat</Label>
                  <Input
                    id="championshipName"
                    placeholder="ex: Championnat de France Féminin de Goalball"
                    value={championshipName}
                    onChange={(e) => setChampionshipName(e.target.value)}
                    disabled={importing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seasonYear">Saison</Label>
                  <Input
                    id="seasonYear"
                    placeholder="ex: 2024-2025"
                    value={seasonYear}
                    onChange={(e) => setSeasonYear(e.target.value)}
                    disabled={importing}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="excelFile">Fichier Excel</Label>
                  <Input
                    id="excelFile"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    disabled={importing}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <p className="text-sm text-muted-foreground">
                    Le fichier doit contenir les feuilles : Planning J1, Planning J2, Planning J3, Points, Buteuses
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-primary">
                      Fichier sélectionné : {selectedFile.name}
                    </p>
                  )}
                </div>

                {/* Import Button */}
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleImport}
                    disabled={importing || !selectedFile || !championshipName.trim()}
                    className="min-w-[150px]"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Import en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Importer le championnat
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Instructions d'import
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Le fichier Excel doit contenir plusieurs feuilles avec les données du championnat</li>
                  <li>Les feuilles "Planning" contiendront les matchs et résultats</li>
                  <li>La feuille "Points" contiendra le classement des équipes</li>
                  <li>La feuille "Buteuses" contiendra les statistiques individuelles</li>
                  <li>Les données seront automatiquement organisées et affichées dans le tableau de bord</li>
                </ul>
              </div>

            </CardContent>
          </Card>
          
        </div>
      </main>

      <Footer />
    </div>
  );
};