-- COPIA Y PEGA ESTO EN EL EDITOR SQL DE SUPABASE --

-- 1. Limpieza de conflicto: Eliminar políticas anteriores problemáticas
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil y Admins todo" ON public.usuario;
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON public.usuario;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.usuario;
DROP POLICY IF EXISTS "usuario_select" ON public.usuario;
DROP POLICY IF EXISTS "usuario_update" ON public.usuario;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.usuario;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.usuario;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.usuario;

-- 2. Función de seguridad para evitar "Infinite Recursion"
-- Esta función verifica si eres admin sin activar las reglas RLS nuevamente (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.usuario
    WHERE id_usuario = auth.uid()
    AND rol = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Nuevas Políticas Seguras

-- SELECT: Ver propio perfil O ver todos si soy admin
CREATE POLICY "Politica de Lectura Segura" ON public.usuario
FOR SELECT TO authenticated
USING (
  auth.uid() = id_usuario 
  OR 
  is_admin()
);

-- INSERT: Insertar propio perfil (Necesario para el script de admin)
CREATE POLICY "Politica de Insercion Segura" ON public.usuario
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id_usuario);

-- UPDATE: Editar propio perfil O editar todos si soy admin
CREATE POLICY "Politica de Actualizacion Segura" ON public.usuario
FOR UPDATE TO authenticated
USING (auth.uid() = id_usuario OR is_admin());

-- DELETE: Solo admin puede borrar
CREATE POLICY "Politica de Eliminacion Admin" ON public.usuario
FOR DELETE TO authenticated
USING (is_admin());
