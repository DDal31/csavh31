import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status...");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("User already authenticated, redirecting to dashboard");
        navigate("/dashboard");
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_IN" && session) {
        console.log("User signed in successfully");
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign in for email:", email);
      if (!email) {
        console.error("Email is required");
        toast({
          title: "Erreur de connexion",
          description: "L'email est requis",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        let errorMessage = "Une erreur est survenue lors de la connexion.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou mot de passe incorrect";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Veuillez confirmer votre email avant de vous connecter";
        }

        toast({
          title: "Erreur de connexion",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data.session) {
        console.log("Sign in successful");
        if (rememberMe) {
          await supabase.auth.refreshSession();
        }
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur inattendue est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto bg-white/10 rounded-lg shadow-xl backdrop-blur-sm p-8">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Espace Membre CSAVH
          </h2>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4169E1',
                    brandAccent: '#364fd1',
                    brandButtonText: 'white',
                    defaultButtonBackground: 'transparent',
                    defaultButtonBackgroundHover: '#ffffff20',
                    inputBackground: 'transparent',
                    inputBorder: '#ffffff40',
                    inputBorderHover: '#ffffff60',
                    inputBorderFocus: '#ffffff80',
                  },
                },
              },
              className: {
                container: 'text-white',
                label: 'text-white',
                button: 'bg-primary hover:bg-primary/90 text-white',
                input: 'bg-white/10 border border-white/20 text-white placeholder:text-white/60',
              },
            }}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Adresse email',
                  password_label: 'Mot de passe',
                  button_label: 'Se connecter',
                  loading_button_label: 'Connexion en cours...',
                  email_input_placeholder: 'Votre adresse email',
                  password_input_placeholder: 'Votre mot de passe',
                },
              },
            }}
            view="sign_in"
            showLinks={false}
          />

          <div className="mt-4 flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              aria-label="Case à cocher pour rester connecté"
              className="data-[state=checked]:bg-primary"
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm text-gray-300 cursor-pointer select-none"
            >
              Se souvenir de moi
            </Label>
          </div>

          <div className="mt-4 text-center">
            <Link 
              to="/reset-password"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              aria-label="Mot de passe oublié ? Cliquez ici pour le réinitialiser"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;