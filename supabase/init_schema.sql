-- Inicialización de Esquema para ComuniTEA en Supabase

-- Habilitar la extensión UUID temporalmente si es necesario
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------
-- 1. TABLA profiles
-------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configura el Row Level Security (RLS) para Perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil."
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Los usuarios pueden actualizar su propio perfil."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Trigger para crear un perfil automáticamente cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-------------------------------------------------------
-- 2. TABLA categories
-------------------------------------------------------
-- En esta tabla irán las categorías personalizadas creadas por cada usuario. 
-- El vocabulario por default de momento reside offline en el código.
CREATE TABLE public.categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon_name text DEFAULT 'folder',
  color text DEFAULT '#1A237E',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus categorías."
  ON public.categories FOR ALL
  USING ( auth.uid() = user_id );


-------------------------------------------------------
-- 3. TABLA custom_pictograms ("Mi mundo en fotos")
-------------------------------------------------------
CREATE TABLE public.custom_pictograms (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  label text NOT NULL,
  image_url text NOT NULL,
  audio_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.custom_pictograms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus propios pictogramas."
  ON public.custom_pictograms FOR ALL
  USING ( auth.uid() = user_id );


-------------------------------------------------------
-- 4. BUCKETS DE ALMACENAMIENTO (Storage)
-------------------------------------------------------
-- Inserta un bucket público para los pictogramas (imágenes y audios)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pictograms', 'pictograms', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para que solo los dueños puedan subir a su carpeta pero cualquiera pueda leer las urls públicas.
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'pictograms' );

CREATE POLICY "Users can upload their own pictograms."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'pictograms' AND auth.uid() = owner );

CREATE POLICY "Users can update their own pictograms."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'pictograms' AND auth.uid() = owner );

CREATE POLICY "Users can delete their own pictograms."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'pictograms' AND auth.uid() = owner );
