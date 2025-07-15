-- Ajouter les colonnes sport_id et team_id à la table championships
ALTER TABLE public.championships 
ADD COLUMN sport_id uuid REFERENCES public.sports(id),
ADD COLUMN team_id uuid REFERENCES public.teams(id);

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN public.championships.sport_id IS 'ID du sport associé au championnat';
COMMENT ON COLUMN public.championships.team_id IS 'ID de l''équipe associée au championnat';