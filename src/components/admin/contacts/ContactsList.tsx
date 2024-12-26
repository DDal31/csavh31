import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import ContactForm from "./ContactForm";

interface Contact {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  photo_url?: string;
  display_order: number;
}

const ContactsList = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le contact a été supprimé",
      });

      setContacts(contacts.filter(contact => contact.id !== id));
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le contact",
        variant: "destructive"
      });
    }
  };

  const handleMoveContact = async (contact: Contact, direction: 'up' | 'down') => {
    const currentIndex = contacts.findIndex(c => c.id === contact.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === contacts.length - 1)
    ) {
      return;
    }

    const newContacts = [...contacts];
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap display_order values
    const tempOrder = newContacts[currentIndex].display_order;
    newContacts[currentIndex].display_order = newContacts[swapIndex].display_order;
    newContacts[swapIndex].display_order = tempOrder;

    // Update the database
    try {
      const { error } = await supabase
        .from('contacts')
        .upsert([
          {
            id: newContacts[currentIndex].id,
            display_order: newContacts[currentIndex].display_order
          },
          {
            id: newContacts[swapIndex].id,
            display_order: newContacts[swapIndex].display_order
          }
        ]);

      if (error) throw error;

      // Swap positions in the local state
      [newContacts[currentIndex], newContacts[swapIndex]] = 
      [newContacts[swapIndex], newContacts[currentIndex]];
      
      setContacts(newContacts);

      toast({
        title: "Succès",
        description: "L'ordre a été mis à jour",
      });
    } catch (error) {
      console.error('Error updating contact order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'ordre",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (editingContact) {
    return (
      <ContactForm
        contact={editingContact}
        onClose={() => setEditingContact(null)}
        onSuccess={() => {
          setEditingContact(null);
          fetchContacts();
          toast({
            title: "Succès",
            description: "Le contact a été mis à jour",
          });
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contacts.map((contact, index) => (
        <Card key={contact.id} className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {contact.photo_url && (
                <img
                  src={contact.photo_url}
                  alt={`Photo de ${contact.first_name} ${contact.last_name}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  {contact.first_name} {contact.last_name}
                </h3>
                <p className="text-gray-400">{contact.role}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {contact.phone && (
                <p className="text-gray-300">
                  <span className="font-semibold">Tél:</span> {contact.phone}
                </p>
              )}
              {contact.email && (
                <p className="text-gray-300">
                  <span className="font-semibold">Email:</span> {contact.email}
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMoveContact(contact, 'up')}
                disabled={index === 0}
                className="bg-gray-600 hover:bg-gray-700 text-white border-none"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMoveContact(contact, 'down')}
                disabled={index === contacts.length - 1}
                className="bg-gray-600 hover:bg-gray-700 text-white border-none"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingContact(contact)}
                className="bg-blue-600 hover:bg-blue-700 text-white border-none"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(contact.id)}
                className="bg-red-600 hover:bg-red-700 text-white border-none"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContactsList;