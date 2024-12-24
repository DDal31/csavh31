import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProfileEditForm } from "@/components/ProfileEditForm";

const ProfileEdit = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              className="text-white hover:bg-gray-800"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-6">
              Modifier mon profil
            </h1>
            <ProfileEditForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileEdit;