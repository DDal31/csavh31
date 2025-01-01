import { BrowserRouter as Router, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { PublicRoutes } from "@/routes/publicRoutes";
import { MemberRoutes } from "@/routes/memberRoutes";
import { AdminRoutes } from "@/routes/adminRoutes";
import { AdminSettingsRoutes } from "@/routes/adminSettingsRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <PublicRoutes />
          <MemberRoutes />
          <AdminRoutes />
          <AdminSettingsRoutes />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;