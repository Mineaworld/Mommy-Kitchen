-- Create the recipe-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT DO NOTHING;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public read access for recipe-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated write access for recipe-images" ON storage.objects;

-- Allow public read (SELECT) access to recipe-images bucket
CREATE POLICY "Public read access for recipe-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'recipe-images');

-- Allow authenticated users to write (INSERT, UPDATE, DELETE) to recipe-images bucket
CREATE POLICY "Authenticated write access for recipe-images"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'recipe-images')
WITH CHECK (bucket_id = 'recipe-images');
