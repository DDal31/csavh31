import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BiometricButton } from "@/components/auth/BiometricButton";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
    });

    // Vérification du support de WebAuthn
    const checkWebAuthnSupport = async () => {
      try {
        if (window.PublicKeyCredential) {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          console.log("WebAuthn supported:", available);
          setBiometricSupported(available);
        }
      } catch (error) {
        console.error("Error checking WebAuthn support:", error);
        setBiometricSupported(false);
      }
    };

    checkWebAuthnSupport();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleBiometricSuccess = async (email: string, password: string) => {
    try {
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      if (session) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur est survenue lors de la connexion. Veuillez réessayer.",
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

          {biometricSupported && (
            <div className="mb-6">
              <BiometricButton onSuccess={handleBiometricSuccess} />
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">Ou</span>
                </div>
              </div>
            </div>
          )}

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