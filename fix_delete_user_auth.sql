-- ============================================
-- SCRIPT: ELIMINACIÓN SEGURA DE USUARIOS (AUTH + PUBLIC)
-- ============================================

-- 1. Asegurar que la función is_admin existe (dependencia)
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


-- 2. Función principal para eliminar usuario completamente
-- Esta función permite a un administrador eliminar un usuario de auth.users y public.usuario

CREATE OR REPLACE FUNCTION public.eliminar_usuario_completo(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Verificar permisos de administrador
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: Solo los administradores pueden eliminar usuarios.';
  END IF;

  -- Eliminar de auth.users
  -- Esto disparará la eliminación en cascada para public.usuario si la FK está configurada correctamente.
  DELETE FROM auth.users WHERE id = target_user_id;

  -- Intentar limpiar explícitamente de public.usuario si aún existe
  -- Esto atrapa casos donde no hubo cascada inmediata
  DELETE FROM public.usuario WHERE id_usuario = target_user_id;

  result := jsonb_build_object(
    'success', true,
    'message', 'Usuario eliminado correctamente de Auth y Public'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Devolver error estructurado
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Permisos
GRANT EXECUTE ON FUNCTION public.eliminar_usuario_completo(UUID) TO authenticated;

-- Mensaje de éxito en logs de Postgres
DO $$
BEGIN
    RAISE NOTICE '✅ Función eliminar_usuario_completo creada correctamente.';
END $$;
