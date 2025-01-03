import { Card } from "@/components/ui/card";

interface NotificationPreviewProps {
  title: string;
  content: string;
}

export function NotificationPreview({ title, content }: NotificationPreviewProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-200 mb-2">Aperçu</h3>
      <Card className="p-4 bg-gray-800 border-gray-700">
        <h4 className="font-medium text-gray-200">{title || "Titre de la notification"}</h4>
        <p className="text-gray-400 mt-1">{content || "Contenu de la notification"}</p>
      </Card>
    </div>
  );
}