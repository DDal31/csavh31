import { supabase } from "@/integrations/supabase/client";

export const downloadAndSaveIcon = async (iconName: string, publicUrl: string) => {
  try {
    console.log(`Downloading icon ${iconName} from ${publicUrl}`);
    
    const response = await fetch(publicUrl);
    if (!response.ok) {
      throw new Error(`Failed to download icon ${iconName}`);
    }

    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, iconName);
    formData.append('fileName', iconName);

    console.log(`Saving icon ${iconName} to storage...`);
    const { data, error } = await supabase.functions.invoke('save-public-icon', {
      body: formData,
    });

    if (error) {
      console.error(`Error saving icon ${iconName}:`, error);
      throw error;
    }

    console.log(`Successfully saved icon ${iconName}`);
    return true;
  } catch (error) {
    console.error(`Error processing icon ${iconName}:`, error);
    return false;
  }
};