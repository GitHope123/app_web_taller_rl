-- ============================================
-- SOLUCIÓN DEFINITIVA PARA INSERCIÓN DE USUARIOS
-- ============================================
-- Este script corrige el problema donde los usuarios se crean en Auth
-- pero NO se guardan en la tabla 'usuario'

-- PASO 1: Eliminar todas las políticas existentes que puedan estar bloqueando
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON public.usuario;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil y Admins todo" ON public.usuario;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.usuario;
DROP POLICY IF EXISTS "lectura_usuario" ON public.usuario;
DROP POLICY IF EXISTS "insercion_usuario" ON public.usuario;
DROP POLICY IF EXISTS "actualizacion_usuario" ON public.usuario;
DROP POLICY IF EXISTS "eliminacion_usuario" ON public.usuario;
DROP POLICY IF EXISTS "Politica de Lectura Segura" ON public.usuario;
DROP POLICY IF EXISTS "Politica de Insercion Segura" ON public.usuario;
DROP POLICY IF EXISTS "Politica de Actualizacion Segura" ON public.usuario;
DROP POLICY IF EXISTS "Politica de Eliminacion Admin" ON public.usuario;

-- PASO 2: Asegurar que la función is_admin existe
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si el usuario actual tiene rol admin
  RETURN EXISTS (
    SELECT 1 FROM public.usuario 
    WHERE id_usuario = auth.uid() 
    AND rol = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 3: Crear políticas PERMISIVAS que permitan a los admins crear usuarios

-- LECTURA: Admins pueden ver todo, usuarios solo su perfil
CREATE POLICY "allow_read_usuario" ON public.usuario
FOR SELECT
TO authenticated
USING (
  auth.uid() = id_usuario 
  OR 
  is_admin() = true
);

-- INSERCIÓN: CLAVE - Permitir a admins insertar CUALQUIER usuario
-- También permitir auto-registro (cuando auth.uid() = id_usuario)
CREATE POLICY "allow_insert_usuario" ON public.usuario
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() = true
  OR
  auth.uid() = id_usuario
);

-- ACTUALIZACIÓN: Admins pueden editar cualquiera, usuarios solo el suyo
CREATE POLICY "allow_update_usuario" ON public.usuario
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id_usuario 
  OR 
  is_admin() = true
)
WITH CHECK (
  auth.uid() = id_usuario 
  OR 
  is_admin() = true
);

-- ELIMINACIÓN: Solo admins
CREATE POLICY "allow_delete_usuario" ON public.usuario
FOR DELETE
TO authenticated
USING (is_admin() = true);

-- PASO 4: Verificar que RLS está habilitado
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;

-- PASO 5: Verificar las políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'usuario'
ORDER BY policyname;

-- PASO 6: Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS actualizadas correctamente';
    RAISE NOTICE '✅ Los admins ahora pueden crear usuarios en la tabla usuario';
    RAISE NOTICE '✅ Intenta crear un usuario nuevamente desde la aplicación';
END $$;
