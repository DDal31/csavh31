import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileFormProps {
  profile: Profile;
}

const ProfileForm = ({ profile }: ProfileFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    club_role: profile.club_role || "",
    sport: profile.sport || "",
    team: profile.team || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started with data:", formData);
    
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      // Update auth user email if changed
      if (formData.email !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });

        if (emailError) {
          console.error("Error updating email:", emailError);
          throw emailError;
        }
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          club_role: formData.club_role as Database["public"]["Enums"]["club_role"],
          sport: formData.sport as Database["public"]["Enums"]["sport_type"],
          team: formData.team as Database["public"]["Enums"]["team_type"],
        })
        .eq("id", profile.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      console.log("Profile updated successfully");
      
      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour",
      });
      
      navigate("/profile");
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-white" htmlFor="first_name">Prénom</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            className="bg-white/5 border-white/10 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white" htmlFor="last_name">Nom</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            className="bg-white/5 border-white/10 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white" htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="bg-white/5 border-white/10 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white" htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white" htmlFor="club_role">Rôle dans le club</Label>
          <Select
            value={formData.club_role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, club_role: value }))}
            required
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Sélectionnez un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="joueur">Joueur</SelectItem>
              <SelectItem value="entraineur">Entraîneur</SelectItem>
              <SelectItem value="arbitre">Arbitre</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-white" htmlFor="sport">Sport</Label>
          <Select
            value={formData.sport}
            onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
            required
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Sélectionnez un sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goalball">Goalball</SelectItem>
              <SelectItem value="torball">Torball</SelectItem>
              <SelectItem value="both">Les deux</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-white" htmlFor="team">Équipe</Label>
          <Select
            value={formData.team}
            onValueChange={(value) => setFormData(prev => ({ ...prev, team: value }))}
            required
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Sélectionnez une équipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loisir">Loisir</SelectItem>
              <SelectItem value="d1_masculine">D1 Masculine</SelectItem>
              <SelectItem value="d1_feminine">D1 Féminine</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90"
          disabled={saving}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;