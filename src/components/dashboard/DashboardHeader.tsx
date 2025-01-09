interface DashboardHeaderProps {
  onSignOut: () => void;
}

export function DashboardHeader({ onSignOut }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">
        Bienvenue !
      </h1>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={onSignOut}
          className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none"
          aria-label="Se déconnecter de votre compte"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}