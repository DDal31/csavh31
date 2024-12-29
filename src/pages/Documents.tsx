import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import { useUserDocuments } from "@/hooks/useUserDocuments";
import { DocumentsHeader } from "@/components/documents/DocumentsHeader";
import { DocumentsList } from "@/components/documents/DocumentsList";
import type { RequiredDocumentType } from "@/types/documents";

const Documents = () => {
  const { handleFileUpload, handleDownload, handleDelete } = useDocumentManagement();
  const { documents, userProfile, loading, activeDocumentTypes, fetchDocuments } = useUserDocuments();

  const handleUpload = async (type: RequiredDocumentType, file: File) => {
    if (!userProfile?.id) {
      return;
    }

    try {
      await handleFileUpload(userProfile.id, type, file);
      await fetchDocuments();
    } catch (error) {
      console.error("Documents: Error in handleUpload:", error);
      throw error;
    }
  };

  const handleDocumentDelete = async (document: any) => {
    try {
      await handleDelete(document);
      await fetchDocuments();
    } catch (error) {
      console.error("Documents: Error in handleDocumentDelete:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <DocumentsHeader />
          <DocumentsList
            documents={documents}
            userProfile={userProfile}
            activeDocumentTypes={activeDocumentTypes}
            onUpload={handleUpload}
            onDownload={handleDownload}
            onDelete={handleDocumentDelete}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Documents;