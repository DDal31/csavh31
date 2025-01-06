import { useNavigate } from "react-router-dom";
import { useTransition } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DashboardTiles } from "@/components/dashboard/DashboardTiles";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  const handleTileClick = (path: string) => {
    startTransition(() => {
      navigate(path);
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            Tableau de bord administrateur
          </h1>

          {isPending ? (
            <div className="text-white">Chargement...</div>
          ) : (
            <DashboardTiles onTileClick={handleTileClick} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;