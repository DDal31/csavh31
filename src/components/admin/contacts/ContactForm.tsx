import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const contactSchema = z.object({
  role: z.string().min(1, "Le rôle est requis"),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onClose: () => void;
  onSuccess: () => void;
  contact?: {
    id: string;
    role: string;
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
    photo_url?: string;
  };
}

const ContactForm = ({ onClose, onSuccess, contact }: ContactFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact ? {
      role: contact.role,
      first_name: contact.first_name,
      last_name: contact.last_name,
      phone: contact.phone || "",
      email: contact.email || "",
    } : {
      role: "",
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    }
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsLoading(true);
      let photoUrl = contact?.photo_url;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('club-assets')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('club-assets')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const contactData = {
        ...data,
        photo_url: photoUrl,
      };

      if (contact?.id) {
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', contact.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert([contactData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-gray-800 p-6 rounded-lg">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Rôle</FormLabel>
              <FormControl>
                <Input placeholder="Rôle dans le bureau" className="bg-gray-700 border-gray-600 text-white" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Prénom" className="bg-gray-700 border-gray-600 text-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom" className="bg-gray-700 border-gray-600 text-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Téléphone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Téléphone" className="bg-gray-700 border-gray-600 text-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" className="bg-gray-700 border-gray-600 text-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel className="text-white block mb-2">Photo</FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="bg-gray-700 border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-gray-700 text-white hover:bg-gray-600"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;