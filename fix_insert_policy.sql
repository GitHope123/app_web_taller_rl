-- COPIA Y PEGA ESTO EN EL EDITOR SQL DE SUPABASE --

-- Habilitar RLS
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;

-- 1. Eliminar políticas conflictivas anteriores
DROP POLICY IF EXISTS "Politica de Lectura Segura" ON public.usuario;
DROP POLICY IF EXISTS "Politica de Insercion Segura" ON public.usuario;
DROP POLICY IF EXISTS "Politica de Actualizacion Segura" ON public.usuario;
DROP POLICY IF EXISTS "Politica de Eliminacion Admin" ON public.usuario;

-- 2. Asegurar que la función is_admin existe y es segura
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar si el usuario actual tiene rol admin en la tabla usuario
  RETURN EXISTS (
    SELECT 1 FROM public.usuario 
    WHERE id_usuario = auth.uid() 
    AND rol = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Nuevas Políticas Permisivas para Admins

-- LECTURA: Todos pueden leer sus propios datos, Admin puede leer todo
CREATE POLICY "lectura_usuario" ON public.usuario
FOR SELECT TO authenticated
USING (
  (auth.uid() = id_usuario) OR (is_admin() = true)
);

-- INSERCIÓN: Aquí está el truco. 
-- Cuando un Admin crea un usuario, el auth.uid() es el del Admin, pero el id_usuario de la fila nueva es el del empleado nuevo.
-- Por tanto, la política debe permitir que un Admin inserte filas para CUALQUIER id_usuario.
CREATE POLICY "insercion_usuario" ON public.usuario
FOR INSERT TO authenticated
WITH CHECK (
  is_admin() = true
  OR
  auth.uid() = id_usuario -- Caso auto-registro (si aplicase)
);

-- ACTUALIZACIÓN: Admin puede editar cualquiera, Usuario solo el suyo
CREATE POLICY "actualizacion_usuario" ON public.usuario
FOR UPDATE TO authenticated
USING (
  (auth.uid() = id_usuario) OR (is_admin() = true)
);

-- ELIMINACIÓN: Solo Admin
CREATE POLICY "eliminacion_usuario" ON public.usuario
FOR DELETE TO authenticated
USING (
  is_admin() = true
);
