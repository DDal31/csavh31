import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { NotificationFormFields } from "./NotificationFormFields";
import { NotificationPreview } from "./NotificationPreview";
import { useNotificationSubmission } from "./useNotificationSubmission";

interface InstantNotificationFormProps {
  onSuccess?: () => void;
}

export function InstantNotificationForm({ onSuccess }: InstantNotificationFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetGroup, setTargetGroup] = useState<string>("all");
  const [selectedSport, setSelectedSport] = useState<string>("");
  
  const { submitNotification, isSubmitting } = useNotificationSubmission();

  const { data: sports } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitNotification({
      title,
      content,
      targetGroup,
      selectedSport,
    });

    if (result.success) {
      setTitle("");
      setContent("");
      setTargetGroup("all");
      setSelectedSport("");
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <NotificationFormFields
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        targetGroup={targetGroup}
        setTargetGroup={setTargetGroup}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        sports={sports}
      />

      <NotificationPreview title={title} content={content} />

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Envoyer la notification"
        )}
      </Button>
    </form>
  );
}