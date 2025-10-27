-- Add columns for non-member matching requests
ALTER TABLE matching_requests
ADD COLUMN brand_name TEXT,
ADD COLUMN contact_name TEXT,
ADD COLUMN contact_email TEXT,
ADD COLUMN contact_phone TEXT,
ALTER COLUMN user_id DROP NOT NULL;