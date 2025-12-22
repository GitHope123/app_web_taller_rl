-- COPIA Y PEGA ESTO EN EL EDITOR SQL DE SUPABASE --

-- Habilitar RLS en la tabla usuario
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;

-- Política 1: Permitir a los usuarios INSERTAR su propio perfil
-- Esto soluciona el error "violates row-level security policy" al crear usuarios
CREATE POLICY "Usuarios pueden crear su propio perfil"
ON public.usuario
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id_usuario);

-- Política 2: Permitir a los usuarios y admins VER perfiles
-- (Reemplaza o complementa tus políticas de select actuales)
CREATE POLICY "Usuarios pueden ver su propio perfil y Admins todo"
ON public.usuario
FOR SELECT
TO authenticated
USING (
  auth.uid() = id_usuario 
  OR 
  (SELECT rol FROM public.usuario WHERE id_usuario = auth.uid()) = 'admin'
);

-- Política 3: Permitir a los usuarios ACTUALIZAR su propio perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.usuario
FOR UPDATE
TO authenticated
USING (auth.uid() = id_usuario)
WITH CHECK (auth.uid() = id_usuario);
