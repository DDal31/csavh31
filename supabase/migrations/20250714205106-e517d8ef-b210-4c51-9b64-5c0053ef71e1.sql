-- Enable RLS on sports and teams tables
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policies for sports table
CREATE POLICY "Everyone can view sports" 
ON public.sports 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage sports" 
ON public.sports 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND site_role = 'admin'
));

-- Create policies for teams table  
CREATE POLICY "Everyone can view teams" 
ON public.teams 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage teams" 
ON public.teams 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE id = auth.uid() 
  AND site_role = 'admin'
));