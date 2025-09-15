-- Create enums for expense and income categories
CREATE TYPE expense_category AS ENUM (
  'competition',
  'minibus', 
  'materiel',
  'organisation_championnat',
  'licence_affiliation'
);

CREATE TYPE income_category AS ENUM (
  'dons',
  'location_minibus',
  'remboursement_joueur',
  'buvette',
  'unadev',
  'inscription_championnat',
  'subvention'
);

-- Add category columns to financial_transactions table
ALTER TABLE financial_transactions 
ADD COLUMN expense_category expense_category,
ADD COLUMN income_category income_category;