import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrainingManagement } from "@/components/admin/TrainingManagement";

const AdminTrainings = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <TrainingManagement />
      </main>
      <Footer />
    </div>
  );
};

export default AdminTrainings;