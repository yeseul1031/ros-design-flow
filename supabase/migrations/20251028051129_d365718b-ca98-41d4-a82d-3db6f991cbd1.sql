-- Update RLS policy to allow non-members to create matching requests
DROP POLICY IF EXISTS "Users can create own matching requests" ON matching_requests;

CREATE POLICY "Anyone can create matching requests"
ON matching_requests
FOR INSERT
WITH CHECK (
  user_id IS NULL OR auth.uid() = user_id
);