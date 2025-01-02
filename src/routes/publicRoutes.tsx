import { Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import UpdatePassword from "@/pages/UpdatePassword";
import Actualites from "@/pages/Actualites";
import NewsArticle from "@/pages/NewsArticle";
import Presentation from "@/pages/Presentation";
import Contact from "@/pages/Contact";

export const PublicRoutes = () => {
  return (
    <>
      <Route index element={<Index />} />
      <Route path="login" element={<Login />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="update-password" element={<UpdatePassword />} />
      <Route path="actualites" element={<Actualites />} />
      <Route path="actualites/:id" element={<NewsArticle />} />
      <Route path="presentation" element={<Presentation />} />
      <Route path="contact" element={<Contact />} />
    </>
  );
};