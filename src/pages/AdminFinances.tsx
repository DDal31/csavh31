import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Euro, TrendingUp, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { TransactionForm } from '@/components/admin/finances/TransactionForm';
import { TransactionsList } from '@/components/admin/finances/TransactionsList';
import { FinancialReports } from '@/components/admin/finances/FinancialReports';
import { useFinances } from '@/hooks/useFinances';

const AdminFinances = () => {
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(true);
  const { summary, loading } = useFinances();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (error || !profile || profile.site_role !== "admin") {
          console.log("Accès non autorisé : l'utilisateur n'est pas admin");
          navigate("/dashboard");
          return;
        }

        setAuthLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Vérification des permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-6 text-muted-foreground hover:text-foreground flex items-center gap-2"
            onClick={() => navigate('/dashboard')}
            aria-label="Retour au tableau de bord administrateur"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestion Financière</h1>
          <p className="text-muted-foreground">Gérez les recettes et dépenses du club</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recettes Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : `${summary.totalIncome.toFixed(2)} €`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépenses Totales</CardTitle>
              <Euro className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loading ? '...' : `${summary.totalExpenses.toFixed(2)} €`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? '...' : `${summary.balance.toFixed(2)} €`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="form">Nouvelle Transaction</TabsTrigger>
            <TabsTrigger value="list">Liste des Transactions</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une Transaction</CardTitle>
                <CardDescription>
                  Enregistrez une nouvelle recette ou dépense avec un document justificatif
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <TransactionsList />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <FinancialReports />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminFinances;