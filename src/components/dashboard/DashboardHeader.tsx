import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onSignOut: () => void;
}

export function DashboardHeader({ onSignOut }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-white">
        Bienvenue !
      </h1>
      <button
        onClick={onSignOut}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none"
        aria-label="Se déconnecter de votre compte"
      >
        Déconnexion
      </button>
    </div>
  );
}