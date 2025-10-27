-- Update 김디자이너 with work fields and tools data
UPDATE designers 
SET 
  work_fields = ARRAY['웹', 'UI/UX', '퍼블리싱'],
  tools = ARRAY['피그마', '포토샵', 'DW']
WHERE name = '김디자이너';