import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { PublicRoutes } from "@/routes/publicRoutes";
import { MemberRoutes } from "@/routes/memberRoutes";
import { AdminRoutes } from "@/routes/adminRoutes";
import { AdminSettingsRoutes } from "@/routes/adminSettingsRoutes";
import { ErrorBoundary } from "react-error-boundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ErrorFallback({ error }: { error: Error }) {
  console.error("Application error:", error);
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <h2 className="text-xl font-bold">Une erreur est survenue</h2>
        <p>Nous nous excusons pour ce désagrément. Veuillez rafraîchir la page.</p>
      </div>
    </div>
  );
}

function App() {
  console.log("Rendering App component");
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route>
              <Route>{PublicRoutes()}</Route>
              <Route>{MemberRoutes()}</Route>
              <Route>{AdminRoutes()}</Route>
              <Route>{AdminSettingsRoutes()}</Route>
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;