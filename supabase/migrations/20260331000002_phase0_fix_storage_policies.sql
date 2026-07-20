-- Fase 0 / Tarea 0.5
-- Reemplaza las políticas de Storage que usaban la columna `owner`
-- (no populada automáticamente en Supabase Storage moderno) por
-- políticas basadas en la ruta del archivo: los archivos se almacenan
-- como  <user_id>/<timestamp>.jpg, así que el primer segmento de la
-- ruta identifica al propietario.

-- Eliminar políticas antiguas basadas en `owner`
DROP POLICY IF EXISTS "Users can upload their own pictograms."  ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own pictograms."  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own pictograms."  ON storage.objects;

-- INSERT: el usuario solo puede subir a su propia carpeta (<uid>/...)
DROP POLICY IF EXISTS "Users can upload to their own folder." ON storage.objects;
CREATE POLICY "Users can upload to their own folder."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pictograms'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: el usuario solo puede actualizar archivos en su propia carpeta
DROP POLICY IF EXISTS "Users can update their own folder." ON storage.objects;
CREATE POLICY "Users can update their own folder."
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pictograms'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: el usuario solo puede borrar archivos en su propia carpeta
DROP POLICY IF EXISTS "Users can delete from their own folder." ON storage.objects;
CREATE POLICY "Users can delete from their own folder."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pictograms'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
