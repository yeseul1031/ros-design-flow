-- Update project_status enum to include new statuses
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'on_hold';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'expiring_soon';

-- Note: 'active' and 'completed' already exist
-- We'll map: active -> active, paused -> on_hold, add expiring_soon for projects within 7 days of end_date