import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminNews from "@/pages/AdminNews";
import AdminNewsCreate from "@/pages/AdminNewsCreate";
import AdminNewsEdit from "@/pages/AdminNewsEdit";
import NewsArticle from "@/pages/NewsArticle";
import BlogPost from "@/pages/BlogPost";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/news" element={<AdminNews />} />
        <Route path="/admin/news/create" element={<AdminNewsCreate />} />
        <Route path="/admin/news/edit/:id" element={<AdminNewsEdit />} />
        <Route path="/news/:id" element={<NewsArticle />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;