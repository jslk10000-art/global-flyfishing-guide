-- Drop the restrictive policies
DROP POLICY IF EXISTS "Users can view their own saved locations" ON public.user_saved_locations;
DROP POLICY IF EXISTS "Users can create their own saved locations" ON public.user_saved_locations;
DROP POLICY IF EXISTS "Users can delete their own saved locations" ON public.user_saved_locations;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Users can view their own saved locations" 
ON public.user_saved_locations 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved locations" 
ON public.user_saved_locations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved locations" 
ON public.user_saved_locations 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);