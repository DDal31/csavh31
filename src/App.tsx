import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { PublicRoutes } from "@/routes/publicRoutes";
import { MemberRoutes } from "@/routes/memberRoutes";
import { AdminRoutes } from "@/routes/adminRoutes";
import { AdminSettingsRoutes } from "@/routes/adminSettingsRoutes";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/animations/PageTransition";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition>
        <Routes location={location} key={location.pathname}>
          {PublicRoutes()}
          {MemberRoutes()}
          {AdminRoutes()}
          {AdminSettingsRoutes}
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AnimatedRoutes />
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;