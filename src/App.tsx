import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import BlogPost from "./pages/BlogPost";
import Presentation from "./pages/Presentation";
import Actualites from "./pages/Actualites";
import NewsArticle from "./pages/NewsArticle";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminUserEdit from "./pages/AdminUserEdit";
import AdminTrainings from "./pages/AdminTrainings";
import AdminDocuments from "./pages/AdminDocuments";
import AdminSettings from "./pages/AdminSettings";
import AdminPresentation from "./pages/AdminPresentation";
import AdminContacts from "./pages/AdminContacts";
import AdminNews from "./pages/AdminNews";
import AdminNewsCreate from "./pages/AdminNewsCreate";
import AdminNewsEdit from "./pages/AdminNewsEdit";
import ProfilePage from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import TrainingRegistration from "./pages/Training";
import Attendance from "./pages/Attendance";
import Documents from "./pages/Documents";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/actualites" element={<Actualites />} />
          <Route path="/actualites/:id" element={<NewsArticle />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/training" element={<TrainingRegistration />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:userId/edit" element={<AdminUserEdit />} />
          <Route path="/admin/trainings" element={<AdminTrainings />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/settings/presentation" element={<AdminPresentation />} />
          <Route path="/admin/settings/contacts" element={<AdminContacts />} />
          <Route path="/admin/settings/news" element={<AdminNews />} />
          <Route path="/admin/settings/news/create" element={<AdminNewsCreate />} />
          <Route path="/admin/settings/news/:id/edit" element={<AdminNewsEdit />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
