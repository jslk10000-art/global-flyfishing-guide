CREATE POLICY "Users can update their own catch photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'catch-photos' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'catch-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);