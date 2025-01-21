import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const updatePasswordSchema = z.object({
  password: z.string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(72, "Le mot de passe ne peut pas dépasser 72 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Session check:", session ? "Session exists" : "No session", error || "No error");
      
      if (!session) {
        toast({
          title: "Session expirée",
          description: "Veuillez recommencer le processus de réinitialisation",
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate, toast]);

  const form = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: UpdatePasswordForm) => {
    setIsLoading(true);
    try {
      console.log("Attempting password update...");
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        console.error("Password update error:", error);
        throw error;
      }

      console.log("Password updated successfully");
      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.",
      });
      
      // Se déconnecter après la mise à jour du mot de passe
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error during password update:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le mot de passe. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm">
            <h1 className="text-2xl font-bold text-white mb-6">Nouveau mot de passe</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          aria-label="Saisissez votre nouveau mot de passe"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          {...field} 
                          aria-label="Confirmez votre nouveau mot de passe"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                  aria-label={isLoading ? "Mise à jour du mot de passe en cours..." : "Mettre à jour le mot de passe"}
                >
                  {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpdatePassword;