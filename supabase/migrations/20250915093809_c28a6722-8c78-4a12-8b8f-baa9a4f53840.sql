-- Create transaction_type enum
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Create financial_transactions table
CREATE TABLE public.financial_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    type transaction_type NOT NULL,
    document_path TEXT,
    document_name TEXT,
    description TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admin peut voir toutes les transactions financières" 
ON public.financial_transactions 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.site_role = 'admin'
));

CREATE POLICY "Admin peut créer des transactions financières" 
ON public.financial_transactions 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.site_role = 'admin'
) AND created_by = auth.uid());

CREATE POLICY "Admin peut modifier des transactions financières" 
ON public.financial_transactions 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.site_role = 'admin'
));

CREATE POLICY "Admin peut supprimer des transactions financières" 
ON public.financial_transactions 
FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.site_role = 'admin'
));

-- Create storage bucket for financial documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('financial-documents', 'financial-documents', false);

-- Create storage policies for admin access
CREATE POLICY "Admin peut voir les documents financiers" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'financial-documents' AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.site_role = 'admin'
));

CREATE POLICY "Admin peut uploader des documents financiers" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'financial-documents' AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.site_role = 'admin'
));

CREATE POLICY "Admin peut modifier les documents financiers" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'financial-documents' AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.site_role = 'admin'
));

CREATE POLICY "Admin peut supprimer les documents financiers" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'financial-documents' AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.site_role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_financial_transactions_updated_at
BEFORE UPDATE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();