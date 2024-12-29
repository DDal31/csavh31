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
import AdminSportsTeams from "./pages/AdminSportsTeams";
import AdminSportCreate from "./pages/AdminSportCreate";
import AdminTeamCreate from "./pages/AdminTeamCreate";
import AdminDocumentTypes from "./pages/AdminDocumentTypes";
import ProfilePage from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import TrainingRegistration from "./pages/Training";
import Attendance from "./pages/Attendance";
import Documents from "./pages/Documents";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";

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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/change-password" element={<ChangePassword />} />
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
          <Route path="/admin/settings/sports-teams" element={<AdminSportsTeams />} />
          <Route path="/admin/settings/sports-teams/add-sport" element={<AdminSportCreate />} />
          <Route path="/admin/settings/sports-teams/add-team" element={<AdminTeamCreate />} />
          <Route path="/admin/settings/document-types" element={<AdminDocumentTypes />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;